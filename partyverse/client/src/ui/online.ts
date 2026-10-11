import type { CharacterId } from '@shared/characters';
import { cleanName } from '@shared/net/protocol';
import type { App, RouteParams, ScreenView } from '../app/app';
import { OnlineClient, OnlineError, type PublicRoom } from '../net/online';
import { t } from '../i18n';
import { btn, clear, h, toast } from './dom';
import { characterPicker } from './pickers';
import { LobbyPanel, copyText } from './lobbyPanel';

/** Online-Mehrspieler: Raum erstellen/beitreten, Lobby mit Figurenwahl, Bereit-Status und Hostsicht */
export function create(app: App, _params?: RouteParams): ScreenView {
  const root = h('div', { class: 'screen' });
  const url = app.store.data.settings.serverUrl;
  const offs: Array<() => void> = [];
  let refreshTimer: ReturnType<typeof setInterval> | null = null;

  const panel = (...c: Array<Node | null>): HTMLElement => h('div', { class: 'panel' }, ...c);
  const head = (title: string, back: () => void): HTMLElement =>
    h('div', { class: 'head' }, h('h2', null, title), btn('← ' + t('back'), back, 'ghost back'));

  const showOffline = (): void => {
    clear(root);
    root.appendChild(
      panel(
        head(t('online.title'), () => void app.go('menu')),
        h('p', null, t('online.noServer')),
        h('p', null, t('online.pagesNote')),
        btn(t('online.openOptions'), () => void app.go('options', { back: 'online' }), 'hot'),
      ),
    );
  };

  const showHome = async (): Promise<void> => {
    if (!url) return showOffline();
    const client = app.online && app.online.url === url ? app.online : new OnlineClient(url);
    app.online = client;
    const prof = app.store.data.profile;
    let name = prof.name;
    let character: CharacterId = prof.character;
    const err = h('div', { class: 'err', 'aria-live': 'polite' });
    const code = h('input', {
      class: 'field',
      placeholder: t('online.code'),
      maxlength: 4,
      'aria-label': t('online.code'),
      style: 'text-transform:uppercase;letter-spacing:.3em;text-align:center;font-size:1.3em',
    });
    const rooms = h('div', { class: 'rooms' }, h('p', null, t('online.loading')));
    const saveProfile = (): void =>
      app.store.update((d) => {
        d.profile.name = cleanName(name) || d.profile.name;
        d.profile.character = character;
      });
    const run = async (fn: () => Promise<void>): Promise<void> => {
      err.textContent = '';
      saveProfile();
      try {
        await fn();
        showLobby(client);
      } catch (e) {
        err.textContent = e instanceof OnlineError ? e.message : t('online.failed');
      }
    };
    const nameIn = h('input', {
      class: 'field',
      value: name,
      maxlength: 14,
      'aria-label': t('setup.name'),
      oninput: () => (name = nameIn.value),
    });
    const refresh = async (): Promise<void> => {
      try {
        const list = await client.listPublic();
        clear(rooms);
        if (!list.length) rooms.appendChild(h('p', null, t('online.noRooms')));
        for (const r of list as PublicRoom[])
          rooms.appendChild(
            h(
              'div',
              { class: 'card row' },
              h(
                'span',
                { class: 'lbl' },
                `${r.name}`,
                h('small', null, `${r.players}/${r.max} · ${r.layoutId} · ${r.rounds} ${t('rounds')}`),
              ),
              btn(
                t('online.join'),
                () => void run(() => client.join(r.code, { name: cleanName(name) || 'Gast', character })),
                r.players >= r.max ? 'ghost' : 'good',
                { disabled: r.players >= r.max },
              ),
            ),
          );
      } catch (e) {
        clear(rooms);
        rooms.appendChild(
          h('p', { class: 'err' }, e instanceof OnlineError ? e.message : t('online.failed')),
        );
      }
    };
    clear(root);
    root.appendChild(
      h(
        'div',
        { class: 'panel wide' },
        head(t('online.title'), () => void app.go('menu')),
        h(
          'div',
          { class: 'two' },
          h(
            'div',
            null,
            h('h3', null, t('online.you')),
            nameIn,
            characterPicker(
              character,
              () => [],
              (c) => (character = c),
            ),
            h('h3', null, t('online.create')),
            h(
              'div',
              { class: 'chips' },
              btn(
                t('online.createPrivate'),
                () =>
                  void run(() =>
                    client.create({ name: cleanName(name) || 'Gast', character, public: false }),
                  ),
                'hot',
              ),
              btn(
                t('online.createPublic'),
                () =>
                  void run(() => client.create({ name: cleanName(name) || 'Gast', character, public: true })),
              ),
            ),
            h('h3', null, t('online.joinCode')),
            code,
            btn(
              t('online.join'),
              () => void run(() => client.join(code.value, { name: cleanName(name) || 'Gast', character })),
              'good',
              { style: 'margin-top:8px' },
            ),
          ),
          h(
            'div',
            null,
            h('h3', null, t('online.public')),
            rooms,
            btn(t('online.refresh'), () => void refresh(), 'ghost'),
          ),
        ),
        err,
      ),
    );
    void refresh();
    refreshTimer = setInterval(() => void refresh(), 8000);
  };

  const showLobby = (client: OnlineClient): void => {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = null;
    const panel = new LobbyPanel(
      {
        setCharacter: (c) => client.send({ type: 'lobby:profile', character: c }),
        ready: (r) => client.send({ type: 'lobby:ready', ready: r }),
        config: (c) => client.send({ type: 'lobby:config', ...c }),
        addBot: (d) => client.send({ type: 'lobby:addBot', difficulty: d }),
        remove: (id) => client.send({ type: 'lobby:removeBot', playerId: id }),
        start: () => client.send({ type: 'lobby:start' }),
        leave: () => {
          client.leave();
          app.online = null;
          void showHome();
        },
      },
      () => [
        h(
          'div',
          { class: 'codebox' },
          h('small', null, t('lobby.code')),
          h('b', { class: 'code' }, client.lobby()?.code ?? ''),
          btn(t('lobby.copy'), () => copyText(client.lobby()?.code ?? ''), 'ghost'),
        ),
      ],
    );
    clear(root);
    root.appendChild(panel.el);
    offs.push(
      client.onLobby((v) => {
        if (v.phase === 'lobby') panel.update(v);
      }),
    );
    offs.push(client.onMessage((k, text) => toast(text, k === 'error' ? 'error' : 'info')));
    offs.push(
      client.onConnection((s) => {
        if (s !== 'ok') {
          toast(t('online.lost'), 'error');
          void showHome();
        }
      }),
    );
    offs.push(
      client.onStart((session) => {
        void app.startGame(session);
      }),
    );
    const v = client.lobby();
    if (v) panel.update(v);
  };

  void (async () => {
    if (!url) return showOffline();
    const client = app.online && app.online.url === url ? app.online : new OnlineClient(url);
    app.online = client;
    clear(root);
    root.appendChild(panel(h('p', null, t('online.connecting'))));
    if (!client.room && (await client.tryReconnect())) {
      toast(t('online.reconnected'), 'good');
      if (client.session) void app.startGame(client.session);
      else showLobby(client);
    } else if (client.room) showLobby(client);
    else void showHome();
  })();

  return {
    el: root,
    dispose() {
      offs.forEach((o) => o());
      if (refreshTimer) clearInterval(refreshTimer);
    },
  };
}
