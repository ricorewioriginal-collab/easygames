import type { CharacterId } from '@shared/characters';
import { cleanName } from '@shared/net/protocol';
import type { App, RouteParams, ScreenView } from '../app/app';
import { Link, answerInvite, createInvite, p2pSupported, type Invite, type Reply } from '../net/p2pLink';
import { P2PGuestRoom, P2PHostRoom } from '../net/p2pRoom';
import { t } from '../i18n';
import { btn, clear, h, toast, toggle } from './dom';
import { LobbyPanel, copyText } from './lobbyPanel';
import { characterPicker } from './pickers';
import { cameraSupported, qrCanvas, startScanner } from './qr';

/**
 * Online ohne Server: Mitspieler verbinden sich direkt (WebRTC). Der Gastgeber zeigt pro Mitspieler einen Einladungs-Code (QR oder Text),
 * der Mitspieler antwortet mit einem Antwort-Code. Das funktioniert auch von GitHub Pages aus – es wird nur eine statische Webseite gebraucht.
 */
export function create(app: App, _params?: RouteParams): ScreenView {
  const root = h('div', { class: 'screen' });
  const cleanups: Array<() => void> = [];
  let started = false;
  const prof = app.store.data.profile;
  let name = prof.name;
  let character: CharacterId = prof.character;
  const stun = (): boolean => app.store.data.settings.useStun;

  const saveProfile = (): void =>
    app.store.update((d) => {
      d.profile.name = cleanName(name) || d.profile.name;
      d.profile.character = character;
    });
  const back = (): void => void app.go('menu');

  // ------------------------------------------------------------------ Start
  const home = (): void => {
    clear(root);
    const nameIn = h('input', {
      class: 'field',
      value: name,
      maxlength: 14,
      'aria-label': t('setup.name'),
      oninput: () => (name = nameIn.value),
    });
    const unsupported = !p2pSupported();
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
        toggle(
          t('p2p.stun'),
          stun(),
          (v) =>
            app.store.update((d) => {
              d.settings.useStun = v;
            }),
          t('p2p.stunHint'),
        ),
        h(
          'div',
          { class: 'chips', style: 'margin-top:12px' },
          btn(
            t('p2p.host'),
            () => {
              saveProfile();
              hostFlow();
            },
            'hot big',
            { disabled: unsupported },
          ),
          btn(
            t('p2p.join'),
            () => {
              saveProfile();
              guestFlow();
            },
            'good big',
            { disabled: unsupported },
          ),
        ),
        h('p', null, t('p2p.note')),
      ),
    );
  };

  // ------------------------------------------------------------------ Gastgeber
  const hostFlow = (): void => {
    const room = new P2PHostRoom(
      { name: cleanName(name) || 'Gastgeber', character },
      app.store.data.lastSetup.layoutId,
      app.store.data.lastSetup.rounds,
    );
    cleanups.push(() => room.close());
    const invitesBox = h('div', { class: 'invites' });
    let active = 0;
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
            void app.startGame(s);
          } catch (e) {
            toast((e as Error).message, 'error');
          }
        },
        leave: () => {
          room.close();
          back();
        },
      },
      () => [
        h('p', null, t('p2p.hostHelp')),
        invitesBox,
        btn(t('p2p.invite'), () => void addInvite(), 'good', { disabled: room.freeSeats - active <= 0 }),
      ],
      () => room.freeSeats - active > 0,
    );
    const render = (): void => panel.update(room.view());
    room.onLobby(() => render());
    room.onMessage((k, text) => toast(text, k === 'error' ? 'error' : 'info'));
    clear(root);
    root.appendChild(panel.el);
    render();
    // Laufende Einladungen werden außerhalb des Panels gehalten, damit sie ein Neuzeichnen der Lobby überstehen
    const addInvite = async (): Promise<void> => {
      if (room.freeSeats - active <= 0) return;
      active++;
      const card = h('div', { class: 'card invite' }, h('p', null, t('p2p.preparing')));
      invitesBox.appendChild(card);
      let invite: Invite;
      try {
        invite = await createInvite(stun());
      } catch (e) {
        active--;
        card.remove();
        toast((e as Error).message || t('p2p.failed'), 'error');
        render();
        return;
      }
      cleanups.push(() => invite.cancel());
      const err = h('div', { class: 'err', 'aria-live': 'polite' });
      const answer = h('textarea', {
        class: 'field code',
        placeholder: t('p2p.answerPlaceholder'),
        'aria-label': t('p2p.answerPlaceholder'),
      });
      const scanHost = h('div');
      const finish = (): void => {
        active--;
        card.remove();
        render();
      };
      const connect = async (text: string): Promise<void> => {
        err.textContent = '';
        try {
          err.textContent = t('p2p.connecting');
          const link: Link = await invite.accept(text);
          room.adopt(link);
          finish();
        } catch (e) {
          err.textContent = (e as Error).message;
        }
      };
      clear(card);
      card.append(
        h('h3', null, t('p2p.step1')),
        h(
          'div',
          { class: 'qrrow' },
          qrCanvas(invite.code, 320),
          h(
            'div',
            null,
            h(
              'textarea',
              { class: 'field code', readonly: true, 'aria-label': t('p2p.inviteCode') },
              invite.code,
            ),
            btn(t('lobby.copy'), () => copyText(invite.code), 'ghost'),
          ),
        ),
        h('h3', null, t('p2p.step2')),
        answer,
        h(
          'div',
          { class: 'chips' },
          btn(t('p2p.connect'), () => void connect((answer as HTMLTextAreaElement).value), 'good'),
          cameraSupported()
            ? btn(
                t('p2p.scanAnswer'),
                () =>
                  startScanner(
                    scanHost,
                    (txt) => {
                      (answer as HTMLTextAreaElement).value = txt;
                      void connect(txt);
                    },
                    (m) => (err.textContent = m),
                  ),
                'ghost',
              )
            : null,
          btn(
            t('p2p.cancel'),
            () => {
              invite.cancel();
              finish();
            },
            'ghost',
          ),
        ),
        scanHost,
        err,
      );
      (card.querySelector('textarea[readonly]') as HTMLTextAreaElement | null)?.addEventListener(
        'focus',
        (e) => (e.target as HTMLTextAreaElement).select(),
      );
    };
  };

  // ------------------------------------------------------------------ Gast
  const guestFlow = (): void => {
    clear(root);
    const err = h('div', { class: 'err', 'aria-live': 'polite' });
    const codeIn = h('textarea', {
      class: 'field code',
      placeholder: t('p2p.invitePlaceholder'),
      'aria-label': t('p2p.invitePlaceholder'),
    });
    const scanHost = h('div');
    let reply: Reply | null = null;
    cleanups.push(() => reply?.cancel());
    const step2 = (r: Reply): void => {
      clear(root);
      root.appendChild(
        h(
          'div',
          { class: 'panel' },
          h(
            'div',
            { class: 'head' },
            h('h2', null, t('p2p.join')),
            btn(
              '← ' + t('back'),
              () => {
                r.cancel();
                back();
              },
              'ghost back',
            ),
          ),
          h('h3', null, t('p2p.step3')),
          h('p', null, t('p2p.showHost')),
          h(
            'div',
            { class: 'qrrow' },
            qrCanvas(r.code, 320),
            h(
              'div',
              null,
              h(
                'textarea',
                { class: 'field code', readonly: true, 'aria-label': t('p2p.answerCode') },
                r.code,
              ),
              btn(t('lobby.copy'), () => copyText(r.code), 'ghost'),
            ),
          ),
          h('p', null, t('p2p.waitHost')),
        ),
      );
      r.opened
        .then((link) => {
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
          gr.onLobby((v) => panel.update(v));
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
          toast(e.message, 'error', 6000);
          guestFlow();
        });
    };
    const submit = async (text: string): Promise<void> => {
      err.textContent = t('p2p.preparing');
      try {
        reply = await answerInvite(text, stun());
        step2(reply);
      } catch (e) {
        err.textContent = (e as Error).message;
      }
    };
    root.appendChild(
      h(
        'div',
        { class: 'panel' },
        h('div', { class: 'head' }, h('h2', null, t('p2p.join')), btn('← ' + t('back'), home, 'ghost back')),
        h('h3', null, t('p2p.step0')),
        h('p', null, t('p2p.pasteHelp')),
        codeIn,
        h(
          'div',
          { class: 'chips' },
          btn(t('p2p.next'), () => void submit((codeIn as HTMLTextAreaElement).value), 'good'),
          cameraSupported()
            ? btn(
                t('p2p.scanInvite'),
                () =>
                  startScanner(
                    scanHost,
                    (txt) => {
                      (codeIn as HTMLTextAreaElement).value = txt;
                      void submit(txt);
                    },
                    (m) => (err.textContent = m),
                  ),
                'ghost',
              )
            : null,
        ),
        scanHost,
        err,
      ),
    );
  };

  home();
  return {
    el: root,
    dispose() {
      if (!started) cleanups.forEach((c) => c());
    },
  };
}
