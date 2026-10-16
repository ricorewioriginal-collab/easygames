import type { CharacterId } from '@shared/characters';
import { cleanName } from '@shared/net/protocol';
import type { App, RouteParams, ScreenView } from '../app/app';
import { inviteLink, isCode, joinRoom, normCode, openRoom, p2pSupported, type HostNet } from '../net/p2pLink';
import { P2PGuestRoom, P2PHostRoom } from '../net/p2pRoom';
import { t } from '../i18n';
import { btn, clear, h, toast } from './dom';
import { LobbyPanel, copyText } from './lobbyPanel';
import { characterPicker } from './pickers';
import { qrCanvas } from './qr';

/**
 * Online mit Freunden über Firebase (wie alle easygames-Spiele): Der Gastgeber eröffnet einen Raum mit 5-stelligem Code,
 * Mitspieler geben den Code ein oder öffnen den Einladungslink / QR-Code. Gespielt wird direkt Gerät zu Gerät.
 */
export function create(app: App, params?: RouteParams): ScreenView {
  const root = h('div', { class: 'screen' });
  const cleanups: Array<() => void> = [];
  let started = false;
  const prof = app.store.data.profile;
  let name = prof.name;
  let character: CharacterId = prof.character;

  const saveProfile = (): void =>
    app.store.update((d) => {
      d.profile.name = cleanName(name) || d.profile.name;
      d.profile.character = character;
    });
  const back = (): void => void app.go('menu');
  const unsupported = !p2pSupported();

  // ------------------------------------------------------------------ Start
  const home = (prefill = ''): void => {
    clear(root);
    const nameIn = h('input', {
      class: 'field',
      value: name,
      maxlength: 14,
      'aria-label': t('setup.name'),
      oninput: () => (name = nameIn.value),
    });
    const codeIn = h('input', {
      class: 'field code',
      value: prefill,
      maxlength: 6,
      placeholder: t('p2p.codePlaceholder'),
      'aria-label': t('p2p.codePlaceholder'),
      oninput: () => ((codeIn as HTMLInputElement).value = normCode((codeIn as HTMLInputElement).value)),
    }) as HTMLInputElement;
    codeIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') join();
    });
    codeIn.setAttribute('autocomplete', 'off');
    codeIn.setAttribute('autocapitalize', 'characters');
    const err = h('div', { class: 'err', 'aria-live': 'polite' });
    const join = (): void => {
      const code = normCode(codeIn.value);
      if (!isCode(code)) {
        err.textContent = t('p2p.badCode');
        return;
      }
      saveProfile();
      guestFlow(code);
    };
    root.appendChild(
      h(
        'div',
        { class: 'panel' },
        h('div', { class: 'head' }, h('h2', null, t('p2p.title')), btn('← ' + t('back'), back, 'ghost back')),
        h('p', null, t('p2p.intro')),
        unsupported ? h('p', { class: 'err' }, t('p2p.unsupported')) : null,
        h('h3', null, t('online.you')),
        nameIn,
        characterPicker(
          character,
          () => [],
          (c) => (character = c),
        ),
        h('h3', null, t('p2p.host')),
        btn(
          t('p2p.hostBtn'),
          () => {
            saveProfile();
            void hostFlow();
          },
          'hot big',
          { disabled: unsupported },
        ),
        h('h3', null, t('p2p.join')),
        h('div', { class: 'inline' }, codeIn, btn(t('p2p.joinBtn'), join, 'good', { disabled: unsupported })),
        err,
        h('p', { class: 'hint' }, t('p2p.note')),
      ),
    );
  };

  // ------------------------------------------------------------------ Gastgeber
  const hostFlow = async (): Promise<void> => {
    clear(root);
    root.appendChild(h('div', { class: 'panel' }, h('p', null, t('p2p.preparing'))));
    let net: HostNet;
    try {
      net = await openRoom();
    } catch (e) {
      toast((e as Error).message, 'error', 6000);
      home();
      return;
    }
    const room = new P2PHostRoom(
      { name: cleanName(name) || 'Gastgeber', character },
      app.store.data.lastSetup.layoutId,
      app.store.data.lastSetup.rounds,
    );
    // Netz erst beim Verlassen schließen; nach dem Spielstart hält die Sitzung die Verbindungen
    cleanups.push(() => {
      room.close();
      net.close();
    });
    net.onLink((link) => (room.session ? link.close() : room.adopt(link)));
    const url = inviteLink(net.code);
    const share = (): void => {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share)
        nav
          .share({ title: 'PARTYVERSE', text: t('p2p.shareText').replace('{code}', net.code), url })
          .catch(() => undefined);
      else copyText(url);
    };
    const invite = h(
      'div',
      { class: 'card invite' },
      h('h3', null, t('p2p.roomCode')),
      h('div', { class: 'roomcode', 'aria-label': t('p2p.roomCode') }, net.code),
      h('div', { class: 'qrrow' }, qrCanvas(url, 220), h('p', null, t('p2p.hostHelp'))),
      h(
        'div',
        { class: 'chips' },
        btn(t('p2p.share'), share, 'good'),
        btn(t('p2p.copyLink'), () => copyText(url), 'ghost'),
      ),
    );
    const panel = new LobbyPanel(
      {
        setCharacter: (c) => room.setProfile({ character: c }),
        ready: () => undefined,
        config: (c) => room.setConfig(c),
        addBot: (d) => room.addBot(d),
        remove: (id) => room.remove(id),
        start: () => {
          try {
            const s = room.start();
            started = true;
            net.stopListening();
            void app.startGame(s);
          } catch (e) {
            toast((e as Error).message, 'error');
          }
        },
        leave: () => {
          room.close();
          net.close();
          back();
        },
      },
      () => (room.freeSeats > 0 ? [invite] : []),
    );
    const render = (): void => panel.update({ ...room.view(), code: net.code });
    room.onLobby(() => render());
    room.onMessage((k, text) => toast(text, k === 'error' ? 'error' : 'info'));
    clear(root);
    root.appendChild(panel.el);
    render();
  };

  // ------------------------------------------------------------------ Gast
  const guestFlow = (code: string): void => {
    clear(root);
    root.appendChild(
      h(
        'div',
        { class: 'panel' },
        h(
          'div',
          { class: 'head' },
          h('h2', null, t('p2p.join')),
          btn('← ' + t('back'), () => home(code), 'ghost back'),
        ),
        h('p', null, t('p2p.connecting').replace('{code}', code)),
      ),
    );
    let cancelled = false;
    cleanups.push(() => (cancelled = true));
    joinRoom(code)
      .then((link) => {
        if (cancelled) return link.close();
        const gr = new P2PGuestRoom(link, { name: cleanName(name) || 'Gast', character });
        cleanups.push(() => (started ? undefined : gr.leave()));
        const panel = new LobbyPanel(
          {
            setCharacter: (c) => gr.setProfile({ character: c }),
            ready: (rd) => gr.setReady(rd),
            config: () => undefined,
            addBot: () => undefined,
            remove: () => undefined,
            start: () => undefined,
            leave: () => {
              gr.leave();
              back();
            },
          },
          () => [h('p', null, t('p2p.guestWait'))],
        );
        clear(root);
        root.appendChild(panel.el);
        gr.onLobby((v) => panel.update({ ...v, code }));
        gr.onMessage((k, text) => toast(text, k === 'error' ? 'error' : 'info'));
        gr.onClosed(() => {
          toast(t('p2p.hostGone'), 'error', 5000);
          back();
        });
        const go = (s: NonNullable<typeof gr.session>): void => {
          started = true;
          void app.startGame(s);
        };
        gr.onStart(go);
        if (gr.session) go(gr.session);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        toast(e.message, 'error', 6000);
        home(code);
      });
  };

  const fromLink = params?.room ? normCode(params.room) : '';
  if (fromLink && isCode(fromLink) && !unsupported) guestFlow(fromLink);
  else home(fromLink);
  return {
    el: root,
    dispose() {
      if (!started) cleanups.forEach((c) => c());
    },
  };
}
