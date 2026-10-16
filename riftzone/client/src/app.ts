// Ablaufsteuerung und alle Menübildschirme: Start, Lobby, Modi, Spind, Herausforderungen, Statistik,
// Einstellungen, Gruppe/Freunde, Matchmaking, Ladebildschirm, Match, Ergebnis.
import { BACKS, EMOTES, GLIDERS, HATS, OUTFITS, PICKAXES, RARITY_LABEL, SKINS, VICTORY_POSES } from '../../shared/src/cosmetics';
import { POIS } from '../../shared/src/mapdef';
import { MAX_LEVEL, levelFromXp } from '../../shared/src/progression';
import { defaultConfig, type Cosmetics, type MatchConfig, type PlacementResult, type TeamSize } from '../../shared/src/types';
import { audio } from './audio/audio';
import { clear, fmtTime, h, hex, isTouchDevice } from './core/dom';
import { profile, type MatchSummary } from './core/profile';
import { DEFAULT_SETTINGS, KEY_ACTIONS, keyLabel, settings, type KeyAction, type Settings } from './core/settings';
import { load, save } from './core/storage';
import { Game } from './game/game';
import type { Session } from './game/session';
import { LocalTransport } from './net/local';
import { P2PHost, guestSocket, isCode, normCode } from './net/p2p';
import { OnlineClient, serverHttpUrl, type LeaderEntry, type LobbyMsg, type PartyMember, type PrivateLobby } from './net/online';
import { LobbyStage } from './render/preview';
import type { Renderer3D } from './render/renderer';
import type { ColorMap } from './render/terrain';
import { confirmDialog, toast } from './ui/overlays';

type Kind = 'offline' | 'public' | 'private';

interface ModeChoice {
  kind: Kind;
  teamSize: TeamSize;
  build: boolean;
  players: number;
  botSkill: number;
  zone: 'normal' | 'fast';
  time: 'random' | 'day' | 'evening' | 'night';
  weather: 'random' | 'clear' | 'rain' | 'fog';
}

const DEFAULT_MODE: ModeChoice = { kind: 'offline', teamSize: 1, build: true, players: 60, botSkill: 1, zone: 'normal', time: 'random', weather: 'random' };
const TEAM_LABEL: Record<number, string> = { 1: 'Solo', 2: 'Duo', 4: 'Squad' };
const KIND_LABEL: Record<Kind, string> = { offline: 'Offline mit Bots', public: 'Online · öffentlich', private: 'Online · privat' };

interface Friend {
  id: string;
  name: string;
}

/** Adresse für Einladungen: In der Android-App (appassets…), lokal oder im Heimnetz kann ein Freund die eigene Adresse
 *  nicht öffnen, dann die öffentliche GitHub-Seite (wie device.js der Spielesammlung). */
const PUBLIC_GAME = 'https://ricorewioriginal-collab.github.io/easygames/riftzone/app/';
function inviteBase(): string {
  const here = location.origin + location.pathname;
  const cfg = (window as unknown as { EASYGAMES_PUBLIC_BASE?: string }).EASYGAMES_PUBLIC_BASE;
  if (cfg) return new URL('riftzone/app/', cfg.endsWith('/') ? cfg : cfg + '/').href;
  const host = location.hostname;
  const local =
    !/^https?:$/.test(location.protocol) ||
    host === 'localhost' ||
    host === 'appassets.androidplatform.net' ||
    host.endsWith('.local') ||
    !host.includes('.') ||
    host.includes(':') ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  return local ? PUBLIC_GAME : here;
}

export class App {
  private readonly ui: HTMLElement;
  private readonly stage: LobbyStage;
  private screen: HTMLElement | null = null;
  private game: Game | null = null;
  mode: ModeChoice;
  private readonly online = new OnlineClient();
  private onlineState: 'off' | 'connecting' | 'open' | 'closed' = 'off';
  private onlineCount = 0;
  private party: { code: string; members: PartyMember[] } | null = null;
  private priv: PrivateLobby | null = null;
  private queue: { count: number; needed: number; wait: number } | null = null;
  private presence = new Map<string, { online: boolean; inMatch: boolean; name: string }>();
  private friends: Friend[];
  private current: () => void = () => undefined;
  /** Online ohne eigenen Server: Raum auf einem Gerät (Gastgeber) oder beigetreten (Gast) */
  private p2p: { role: 'host' | 'guest'; code: string; host: P2PHost | null } | null = null;
  private p2pAsk = 0;

  constructor(
    private readonly R: Renderer3D,
    private readonly colors: ColorMap,
    private readonly heights: Uint16Array | null,
  ) {
    this.ui = document.getElementById('ui')!;
    this.stage = new LobbyStage(R);
    this.mode = { ...DEFAULT_MODE, ...load<Partial<ModeChoice>>('mode', {}) };
    this.friends = load<Friend[]>('friends', []);
    this.online.onStatus = (s, reason) => {
      this.onlineState = s;
      if (s === 'closed' && reason && this.mode.kind !== 'offline') toast(`Server: ${reason}`);
      if (s === 'closed') {
        this.party = null;
        this.priv = null;
        this.queue = null;
      }
      this.refresh();
    };
    this.online.onLobby = (m) => this.onLobbyMsg(m);
    this.online.socketFactory = (url) => {
      const [, role, code] = url.split(':');
      return role === 'host' && this.p2p?.host ? this.p2p.host.local() : guestSocket(code ?? '');
    };
    const qs = new URLSearchParams(location.search);
    const room = normCode(qs.get('room') ?? '');
    if (isCode(room)) setTimeout(() => this.joinRoom(room), 0);
    setInterval(() => this.ensureRoomLobby(), 5000);   // nach einem Match die Raum-Lobby wieder anlegen bzw. beitreten
    const srv = qs.get('server');
    if (srv) settings.set('serverUrl', srv);
    const join = qs.get('party');
    if (join && settings.data.serverUrl) {
      this.connectOnline();
      setTimeout(() => this.online.send({ t: 'party.join', code: join.toUpperCase() }), 1200);
    }
    this.applyAccess();
    settings.onChange(() => this.applyAccess());
  }

  private applyAccess(): void {
    document.body.classList.toggle('reduced', settings.data.reducedMotion);
    document.documentElement.style.setProperty('--ts', String(settings.data.textScale));
  }

  private set(el: HTMLElement): void {
    this.screen?.remove();
    this.screen = el;
    this.ui.appendChild(el);
    el.querySelectorAll('button').forEach((b) => {
      b.addEventListener('click', () => audio.play('click'));
      b.addEventListener('pointerenter', () => audio.play('hover'));
    });
  }

  private refresh(): void {
    if (!this.game) this.current();
  }

  // ---------------- Start ----------------

  showTitle(): void {
    this.stage.setCosmetics(profile.data.cos);
    this.stage.offsetX = 0;
    this.stage.start();
    const go = (): void => {
      audio.unlock();
      audio.setMusic('menu');
      this.showLobby();
    };
    const el = h(
      'div',
      { class: 'screen dim loading', onclick: go, onkeydown: go, tabindex: '0' },
      h('div', { class: 'logo' }, 'RIFT', h('span', null, 'ZONE')),
      h('p', { class: 'muted' }, 'Spring ab. Plündere. Baue. Überlebe den Riftsturm.'),
      h('button', { class: 'btn primary' }, isTouchDevice() ? 'Tippen zum Starten' : 'Klicken zum Starten'),
      h('p', { class: 'muted', style: 'font-size:.75rem' }, 'Ein eigenständiges Battle-Royale-Spiel von easygames · alle Grafiken und Klänge werden im Browser erzeugt'),
    );
    this.set(el);
    if (settings.data.serverUrl) this.connectOnline();
  }

  // ---------------- Lobby ----------------

  private chip(): HTMLElement {
    const L = profile.levelInfo;
    const where = this.p2p ? `Raum ${this.p2p.code}` : 'Online';
    const statusTxt = !this.hasOnline() ? 'Offline' : this.onlineState === 'open' ? `${where} · ${this.onlineCount} Spieler` : this.onlineState === 'connecting' ? 'Verbinde …' : this.p2p ? 'Raum getrennt' : 'Server getrennt';
    return h(
      'div',
      { class: 'row' },
      h(
        'div',
        { class: 'panel player-chip' },
        h('div', { class: 'lvl' }, String(L.level)),
        h('div', { class: 'col', style: 'gap:4px' }, h('b', null, profile.data.name), h('div', { class: 'xpbar' }, h('i', { style: `width:${L.level >= MAX_LEVEL ? 100 : (L.into / L.need) * 100}%` })), h('small', { class: 'muted' }, L.level >= MAX_LEVEL ? 'Höchststufe' : `${L.into} / ${L.need} EP`)),
      ),
      h('span', { class: 'tag', style: this.onlineState === 'open' ? '' : 'background:rgba(255,255,255,.08);color:var(--dim)' }, statusTxt),
    );
  }

  showLobby(): void {
    this.current = () => this.showLobby();
    this.ensureRoomLobby();
    this.stage.setCosmetics(profile.data.cos);
    this.stage.setMates(this.party ? this.party.members.filter((m) => m.id !== this.online.myId).map((m) => m.cos ?? { ...profile.data.cos, outfit: 1 }) : []);
    this.stage.offsetX = -0.2;
    this.stage.holding = -1;
    this.stage.start();
    const m = this.mode;
    const chals = profile.challenges();
    const el = h(
      'div',
      { class: 'screen' },
      h(
        'div',
        { class: 'topbar' },
        h('div', { class: 'logo' }, 'RIFT', h('span', null, 'ZONE')),
        h('div', { class: 'grow' }),
        this.chip(),
        h('button', { class: 'btn ghost', onclick: () => this.showLocker() }, 'Spind'),
        h('button', { class: 'btn ghost', onclick: () => this.showStats() }, 'Statistik'),
        h('button', { class: 'btn ghost', onclick: () => this.showSettings(() => this.showLobby()) }, 'Einstellungen'),
        h('button', { class: 'btn ghost', onclick: () => (location.href = '../../') }, 'Spiele'),
      ),
      h(
        'div',
        { class: 'lobby' },
        h(
          'div',
          { class: 'left' },
          h(
            'div',
            { class: 'panel mode-card col' },
            h('span', { class: 'tag' }, KIND_LABEL[m.kind]),
            h('div', { class: 'big' }, `${TEAM_LABEL[m.teamSize]} · ${m.build ? 'Bauen' : 'Ohne Bauen'}`),
            m.kind === 'offline' ? h('span', { class: 'muted' }, `${m.players} Teilnehmer · Bots ${['leicht', 'normal', 'schwer'][m.botSkill]} · Zone ${m.zone === 'fast' ? 'schnell' : 'normal'}`) : h('span', { class: 'muted' }, m.kind === 'public' ? 'Matchmaking mit Spielern, aufgefüllt mit Bots' : this.priv ? `Code ${this.priv.code}` : 'Eigenes Match per Code'),
            h('button', { class: 'btn', onclick: () => this.showModes() }, 'Modus ändern'),
          ),
          this.partyPanel(),
        ),
        h('div', { class: 'preview-spacer' }),
        h(
          'div',
          { class: 'right' },
          h(
            'div',
            { class: 'panel col', style: 'padding:14px;min-height:0' },
            h('h3', null, 'Herausforderungen'),
            h(
              'div',
              { class: 'col scroll', style: 'max-height:42vh' },
              chals.map((c) =>
                h(
                  'div',
                  { class: `chal ${c.done ? 'done' : ''}`, style: 'background:rgba(255,255,255,.04)' },
                  h('div', { class: 'row' }, h('span', { class: 'tag' }, c.weekly ? 'Woche' : 'Heute'), h('b', { class: 'grow', style: 'font-size:.85rem' }, c.text)),
                  h('div', { class: 'bar' }, h('i', { style: `width:${(c.progress / c.goal) * 100}%` })),
                  h('small', { class: 'muted' }, c.done ? `Erledigt · +${c.xp} EP` : `${Math.floor(c.progress)} / ${c.goal} · +${c.xp} EP`),
                ),
              ),
            ),
          ),
        ),
        h(
          'div',
          { class: 'bottom' },
          h('button', { class: 'btn ghost', onclick: () => this.stage.playEmote(profile.data.emotes[1] ?? 1) }, 'Emote'),
          h('button', { class: 'btn primary', onclick: () => this.play() }, this.playLabel()),
        ),
      ),
    );
    this.set(el);
  }

  private playLabel(): string {
    if (this.mode.kind === 'public' && this.party && !this.isLeader()) return this.myReady() ? 'Bereit ✓' : 'Bereit';
    if (this.mode.kind === 'private') return this.priv ? (this.priv.host === this.online.myId ? 'Match starten' : 'Warte auf Host') : 'Lobby erstellen';
    return 'Spielen';
  }

  private isLeader(): boolean {
    return !!this.party?.members.find((m) => m.id === this.online.myId && m.leader);
  }

  private myReady(): boolean {
    return !!this.party?.members.find((m) => m.id === this.online.myId)?.ready;
  }

  private partyPanel(): HTMLElement {
    const box = h('div', { class: 'panel col', style: 'padding:14px' }, h('h3', null, 'Gruppe & Freunde'));
    if (this.p2p) return this.roomPanel(box);
    if (!settings.data.serverUrl) {
      const inp = h('input', { type: 'text', placeholder: 'Raumcode', maxlength: '5', style: 'width:110px;text-transform:uppercase' }) as HTMLInputElement;
      box.append(
        h('p', { class: 'muted', style: 'margin:0' }, 'Online ohne Server: Ein Gerät eröffnet einen Raum und rechnet das Match, Freunde treten mit dem Code bei.'),
        h('div', { class: 'row' }, h('button', { class: 'btn small rift', onclick: () => void this.openRoom() }, 'Raum eröffnen')),
        h('div', { class: 'row' }, inp, h('button', { class: 'btn small', onclick: () => this.joinRoom(normCode(inp.value)) }, 'Beitreten')),
        h('button', { class: 'btn small ghost', onclick: () => this.showSettings(() => this.showLobby(), 'online') }, 'Eigenen Server einrichten'),
      );
      return box;
    }
    if (this.onlineState !== 'open') {
      box.append(h('p', { class: 'muted', style: 'margin:0' }, this.onlineState === 'connecting' ? 'Verbinde mit dem Server …' : 'Nicht verbunden.'), h('button', { class: 'btn small', onclick: () => this.connectOnline() }, 'Verbinden'));
      return box;
    }
    if (this.party) {
      box.append(
        h('div', { class: 'row' }, h('span', null, 'Gruppencode '), h('b', { style: 'font-size:1.3rem;letter-spacing:.15em' }, this.party.code)),
        ...this.party.members.map((m) => h('div', { class: 'row' }, h('b', { class: 'grow' }, m.name, m.leader ? ' ★' : ''), h('small', { class: 'muted' }, `Stufe ${m.level}`), h('span', { class: 'tag' }, m.ready || m.leader ? 'bereit' : 'wartet'))),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => this.copyInvite() }, 'Einladung kopieren'), h('button', { class: 'btn small danger', onclick: () => this.online.send({ t: 'party.leave' }) }, 'Verlassen')),
      );
    } else {
      const inp = h('input', { type: 'text', placeholder: 'Code', maxlength: '6', style: 'width:110px;text-transform:uppercase' }) as HTMLInputElement;
      box.append(
        h('div', { class: 'row' }, h('button', { class: 'btn small rift', onclick: () => this.online.send({ t: 'party.create' }) }, 'Gruppe erstellen')),
        h('div', { class: 'row' }, inp, h('button', { class: 'btn small', onclick: () => inp.value.trim() && this.online.send({ t: 'party.join', code: inp.value.trim().toUpperCase() }) }, 'Beitreten')),
      );
    }
    // Freunde
    const fl = h('div', { class: 'col', style: 'gap:6px;margin-top:8px' });
    fl.append(h('small', { class: 'muted' }, `Deine Spieler-ID: ${profile.data.id.slice(0, 8)}`));
    for (const f of this.friends) {
      const p = this.presence.get(f.id);
      fl.append(
        h(
          'div',
          { class: 'row' },
          h('span', { style: `width:8px;height:8px;border-radius:50%;background:${p?.online ? (p.inMatch ? 'var(--amber)' : 'var(--hp)') : '#555'}` }),
          h('span', { class: 'grow' }, p?.name || f.name),
          p?.online && !p.inMatch && this.party ? h('button', { class: 'btn small ghost', onclick: () => this.online.send({ t: 'invite', to: f.id }) }, 'Einladen') : h('small', { class: 'muted' }, p?.online ? (p.inMatch ? 'im Match' : 'online') : 'offline'),
          h('button', { class: 'btn small ghost', title: 'Entfernen', onclick: () => this.removeFriend(f.id) }, '✕'),
        ),
      );
    }
    const fin = h('input', { type: 'text', placeholder: 'Spieler-ID (8 Zeichen)', style: 'width:160px' }) as HTMLInputElement;
    fl.append(h('div', { class: 'row' }, fin, h('button', { class: 'btn small', onclick: () => this.addFriend(fin.value) }, 'Freund hinzufügen')));
    box.append(fl);
    return box;
  }

  // ---------------- Raum ohne Server ----------------

  private hasOnline(): boolean {
    return !!this.p2p || !!settings.data.serverUrl;
  }

  private roomPanel(box: HTMLElement): HTMLElement {
    const r = this.p2p!;
    box.append(
      h('div', { class: 'row' }, h('span', null, 'Raumcode '), h('b', { style: 'font-size:1.3rem;letter-spacing:.15em' }, r.code)),
      h('small', { class: 'muted' }, r.role === 'host' ? 'Dein Gerät ist der Server. Lass das Spiel geöffnet, solange gespielt wird.' : 'Der Gastgeber startet das Match.'),
    );
    if (this.onlineState !== 'open') box.append(h('p', { class: 'muted', style: 'margin:0' }, this.onlineState === 'connecting' ? 'Verbinde …' : 'Nicht verbunden.'));
    if (this.priv) box.append(...this.priv.members.map((m) => h('div', { class: 'row' }, h('b', { class: 'grow' }, m.name, m.leader ? ' ★' : ''), h('small', { class: 'muted' }, `Stufe ${m.level}`))));
    box.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => this.copyRoomInvite() }, 'Einladung kopieren'), h('button', { class: 'btn small danger', onclick: () => this.leaveRoom() }, 'Raum verlassen')));
    return box;
  }

  private async openRoom(): Promise<void> {
    if (this.p2p) return;
    this.online.disconnect();
    const host = new P2PHost(this.heights);
    host.onError = (msg) => {
      toast(msg, 4000);
      this.leaveRoom();
    };
    this.p2p = { role: 'host', code: '…', host };
    this.onlineState = 'connecting';
    this.refresh();
    try {
      this.p2p.code = await host.listen();
    } catch (e) {
      host.stop();
      if (this.p2p?.host === host) this.p2p = null;
      this.onlineState = 'off';
      toast(`Raum konnte nicht eröffnet werden: ${(e as Error).message}`, 4000);
      this.refresh();
      return;
    }
    if (this.p2p?.host !== host) return;
    this.setMode('private');
    this.connectOnline();
  }

  private joinRoom(code: string): void {
    if (!isCode(code)) {
      toast('Bitte den 5-stelligen Raumcode eingeben');
      return;
    }
    this.leaveRoom(false);
    this.online.disconnect();
    this.p2p = { role: 'guest', code, host: null };
    this.setMode('private');
    this.connectOnline();
  }

  private leaveRoom(reconnect = true): void {
    if (!this.p2p) return;
    const r = this.p2p;
    this.p2p = null;
    if (this.mode.kind !== 'offline') this.setMode('offline');
    this.online.disconnect();
    r.host?.stop();
    this.onlineState = 'off';
    this.party = null;
    this.priv = null;
    this.queue = null;
    if (reconnect && settings.data.serverUrl) this.connectOnline();
    this.refresh();
  }

  private setMode(kind: Kind): void {
    this.mode = { ...this.mode, kind };
    save('mode', this.mode);
  }

  /** Im Raum gibt es genau eine private Lobby mit dem Raumcode: der Gastgeber legt sie (nach jedem Match neu) an, Gäste treten bei. */
  private ensureRoomLobby(): void {
    const r = this.p2p;
    if (!r || this.onlineState !== 'open' || this.priv || this.game || Date.now() - this.p2pAsk < 4000) return;
    this.p2pAsk = Date.now();
    if (r.role === 'host') {
      const c = this.matchConfig();
      this.online.send({ t: 'private.create', code: r.code, cfg: { teamSize: c.teamSize, build: c.build, maxPlayers: c.maxPlayers, fillBots: true, botSkill: c.botSkill, zoneScale: c.zoneScale } });
    } else this.online.send({ t: 'private.join', code: r.code });
  }

  private copyRoomInvite(): void {
    if (!this.p2p) return;
    const code = this.p2p.code;
    const url = `${inviteBase()}?room=${code}`;
    navigator.clipboard?.writeText(url).then(
      () => toast('Einladungslink kopiert'),
      () => toast(`Raumcode: ${code}`),
    );
  }

  private addFriend(id: string): void {
    const v = id.trim().toLowerCase();
    if (!/^[0-9a-f]{8,24}$/.test(v)) {
      toast('Bitte eine gültige Spieler-ID eingeben');
      return;
    }
    if (this.friends.some((f) => f.id.startsWith(v))) return;
    this.friends.push({ id: v, name: `Spieler ${v.slice(0, 4)}` });
    save('friends', this.friends);
    this.online.send({ t: 'friends', ids: this.friends.map((f) => f.id) });
    this.refresh();
  }

  private removeFriend(id: string): void {
    this.friends = this.friends.filter((f) => f.id !== id);
    save('friends', this.friends);
    this.refresh();
  }

  private copyInvite(): void {
    if (!this.party) return;
    const url = `${location.origin}${location.pathname}?server=${encodeURIComponent(settings.data.serverUrl)}&party=${this.party.code}`;
    navigator.clipboard?.writeText(url).then(
      () => toast('Einladungslink kopiert'),
      () => toast(`Code: ${this.party!.code}`),
    );
  }

  // ---------------- Modi ----------------

  showModes(): void {
    this.current = () => this.showModes();
    this.stage.offsetX = 1.2;
    const m = this.mode;
    const choose = <K extends keyof ModeChoice>(k: K, v: ModeChoice[K]): void => {
      this.mode = { ...this.mode, [k]: v };
      save('mode', this.mode);
      if (k === 'kind' && v !== 'offline') this.connectOnline();
      this.showModes();
    };
    const opt = <K extends keyof ModeChoice>(k: K, v: ModeChoice[K], label: string, disabled = false): HTMLElement =>
      h('button', { class: `btn small ${m[k] === v ? 'sel' : ''}`, disabled, onclick: () => choose(k, v) }, label);
    const onlineOk = this.hasOnline();
    const codeIn = h('input', { type: 'text', placeholder: 'Lobby-Code', maxlength: '6', style: 'width:130px;text-transform:uppercase' }) as HTMLInputElement;
    const el = h(
      'div',
      { class: 'screen dim' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn ghost', onclick: () => this.showLobby() }, '← Zurück'), h('h2', { style: 'margin:0' }, 'Spielmodus')),
      h(
        'div',
        { class: 'content' },
        h(
          'div',
          { class: 'panel col scroll', style: 'max-width:640px;flex:1' },
          h('h3', null, 'Spielweise'),
          h('div', { class: 'row' }, opt('kind', 'offline', 'Offline mit Bots'), opt('kind', 'public', 'Online öffentlich', !onlineOk || !!this.p2p), opt('kind', 'private', 'Online privat', !onlineOk)),
          !onlineOk ? h('small', { class: 'muted' }, 'Für Online: in der Lobby einen Raum eröffnen oder mit Code beitreten (ohne Server), oder einen eigenen Server eintragen (Einstellungen → Online).') : this.p2p ? h('small', { class: 'muted' }, `Raum ${this.p2p.code}: ${this.p2p.role === 'host' ? 'deine Einstellungen gelten für das nächste Match' : 'der Gastgeber legt Modus und Teilnehmer fest'}.`) : '',
          h('h3', null, 'Teamgröße'),
          h('div', { class: 'row' }, opt('teamSize', 1, 'Solo'), opt('teamSize', 2, 'Duo'), opt('teamSize', 4, 'Squad')),
          h('h3', null, 'Bauen'),
          h('div', { class: 'row' }, opt('build', true, 'Mit Bausystem'), opt('build', false, 'Ohne Bauen')),
          m.kind !== 'public'
            ? h(
                'div',
                { class: 'col' },
                h('h3', null, `Teilnehmer: ${m.players}`),
                (() => {
                  const r = h('input', { type: 'range', min: '10', max: '100', step: '5', value: String(m.players) }) as HTMLInputElement;
                  r.oninput = () => {
                    this.mode.players = Number(r.value);
                    (r.previousElementSibling as HTMLElement).textContent = `Teilnehmer: ${r.value}`;
                  };
                  r.onchange = () => save('mode', this.mode);
                  return r;
                })(),
                h('small', { class: 'muted' }, 'Mehr Teilnehmer brauchen mehr Rechenleistung. Auf älteren Handys sind 30–50 empfehlenswert.'),
                h('h3', null, 'Bot-Stärke'),
                h('div', { class: 'row' }, opt('botSkill', 0, 'Leicht'), opt('botSkill', 1, 'Normal'), opt('botSkill', 2, 'Schwer')),
                h('h3', null, 'Zonen-Tempo'),
                h('div', { class: 'row' }, opt('zone', 'normal', 'Normal (≈ 9 min)'), opt('zone', 'fast', 'Schnell (≈ 5 min)')),
                h('h3', null, 'Tageszeit & Wetter'),
                h('div', { class: 'row' }, opt('time', 'random', 'Zufall'), opt('time', 'day', 'Tag'), opt('time', 'evening', 'Abend'), opt('time', 'night', 'Nacht')),
                h('div', { class: 'row' }, opt('weather', 'random', 'Zufall'), opt('weather', 'clear', 'Klar'), opt('weather', 'rain', 'Regen'), opt('weather', 'fog', 'Nebel')),
              )
            : '',
          m.kind === 'private' && onlineOk && !this.p2p
            ? h(
                'div',
                { class: 'col' },
                h('h3', null, 'Private Lobby'),
                this.priv
                  ? h('div', { class: 'col' }, h('div', null, 'Code: ', h('b', { style: 'font-size:1.4rem;letter-spacing:.15em' }, this.priv.code)), h('div', { class: 'muted' }, `${this.priv.members.length} Spieler: ${this.priv.members.map((x) => x.name).join(', ')}`), h('button', { class: 'btn small danger', onclick: () => this.online.send({ t: 'private.leave' }) }, 'Lobby verlassen'))
                  : h('div', { class: 'row' }, h('button', { class: 'btn small rift', onclick: () => this.createPrivate() }, 'Lobby erstellen'), codeIn, h('button', { class: 'btn small', onclick: () => codeIn.value && this.online.send({ t: 'private.join', code: codeIn.value.trim().toUpperCase() }) }, 'Beitreten')),
              )
            : '',
          h('div', { class: 'row', style: 'margin-top:12px' }, h('button', { class: 'btn primary', onclick: () => this.showLobby() }, 'Übernehmen')),
        ),
      ),
    );
    this.set(el);
  }

  private matchConfig(): MatchConfig {
    const m = this.mode;
    const rnd = Math.random;
    const time = m.time === 'random' ? [9, 13, 16, 18.5, 21][Math.floor(rnd() * 5)]! : m.time === 'day' ? 12 : m.time === 'evening' ? 18.5 : 22;
    const weather = m.weather === 'random' ? (rnd() < 0.65 ? 0 : rnd() < 0.5 ? 1 : 2) : m.weather === 'clear' ? 0 : m.weather === 'rain' ? 1 : 2;
    return defaultConfig({
      teamSize: m.teamSize,
      build: m.build,
      maxPlayers: m.players,
      botSkill: m.botSkill,
      zoneScale: m.zone === 'fast' ? 0.55 : 1,
      timeOfDay: time,
      weather,
      label: `${TEAM_LABEL[m.teamSize]} ${m.build ? '' : 'ohne Bauen'}`.trim(),
    });
  }

  private createPrivate(): void {
    const c = this.matchConfig();
    this.online.send({ t: 'private.create', cfg: { teamSize: c.teamSize, build: c.build, maxPlayers: c.maxPlayers, fillBots: true, botSkill: c.botSkill, zoneScale: c.zoneScale } });
  }

  // ---------------- Spielen ----------------

  private play(): void {
    const m = this.mode;
    if (m.kind === 'offline') {
      this.startOffline();
      return;
    }
    if (this.onlineState !== 'open') {
      this.connectOnline();
      toast('Verbinde mit dem Server …');
      return;
    }
    if (m.kind === 'public') {
      if (this.party && !this.isLeader()) {
        this.online.send({ t: 'party.ready', ready: !this.myReady() });
        return;
      }
      this.online.send({ t: 'queue', teamSize: m.teamSize, build: m.build });
      this.queue = { count: 1, needed: 2, wait: 0 };
      this.showQueue();
    } else {
      if (!this.priv) this.createPrivate();
      else if (this.priv.host === this.online.myId) this.online.send({ t: 'private.start' });
    }
  }

  private connectOnline(): void {
    const url = this.p2p ? (this.p2p.code === '…' ? '' : `p2p:${this.p2p.role}:${this.p2p.code}`) : settings.data.serverUrl;
    if (!url) return;
    if (this.online.connected || (this.onlineState === 'connecting' && this.online.ws)) return;
    this.online.connect(url, { name: profile.data.name, cos: profile.data.cos, profileId: profile.data.id, level: profile.level });
  }

  private onLobbyMsg(m: LobbyMsg): void {
    switch (m.t) {
      case 'welcome':
        this.onlineCount = m.online;
        this.p2pAsk = 0;
        this.ensureRoomLobby();
        if (this.friends.length) this.online.send({ t: 'friends', ids: this.friends.map((f) => f.id) });
        if (m.reconnect) toast('Verbinde dich wieder mit deinem Match …');
        break;
      case 'stats':
        this.onlineCount = m.online;
        break;
      case 'queue':
        this.queue = { count: m.count, needed: m.needed, wait: m.wait };
        if (!this.game) this.showQueue();
        return;
      case 'queueLeft':
        this.queue = null;
        break;
      case 'party':
        this.party = { code: m.code, members: m.members };
        break;
      case 'partyLeft':
        this.party = null;
        break;
      case 'private':
        this.priv = m.lobby;
        break;
      case 'privateLeft':
        this.priv = null;
        break;
      case 'matchFound':
        this.queue = null;
        this.startOnline(m.matchId);
        return;
      case 'error':
        if (this.p2p && m.msg.includes(this.p2p.code)) break; // Raum-Lobby gerade nicht da (Gastgeber noch im Match): leise später erneut
        toast(m.msg, 3500);
        break;
      case 'presence':
        for (const p of m.list) this.presence.set(p.id, { online: p.online, inMatch: p.inMatch, name: p.name });
        for (const f of this.friends) {
          const p = this.presence.get(f.id);
          if (p?.name) f.name = p.name;
        }
        save('friends', this.friends);
        break;
      case 'invited': {
        const d = confirmDialog(`${m.name} lädt dich in eine Gruppe ein.`, 'Beitreten', () => this.online.send({ t: 'party.join', code: m.code }), () => undefined);
        this.ui.appendChild(d);
        break;
      }
      case 'lb':
        this.onlineLb = m.entries;
        break;
    }
    this.refresh();
  }

  private onlineLb: LeaderEntry[] | null = null;

  private showQueue(): void {
    this.current = () => this.showQueue();
    const q = this.queue;
    const el = h(
      'div',
      { class: 'screen dim loading' },
      h('div', { class: 'spinner' }),
      h('h2', null, 'Suche Match'),
      h('p', { class: 'muted' }, `${TEAM_LABEL[this.mode.teamSize]} · ${this.mode.build ? 'Bauen' : 'Ohne Bauen'}`),
      q ? h('p', null, `${q.count} Spieler in der Warteschlange · Start spätestens in ${fmtTime(q.wait)} (Bots füllen auf)`) : '',
      h(
        'button',
        {
          class: 'btn danger',
          onclick: () => {
            this.online.send({ t: 'cancel' });
            this.queue = null;
            this.showLobby();
          },
        },
        'Abbrechen',
      ),
    );
    this.set(el);
  }

  private loadingScreen(text: string): void {
    const tips = [
      'Riftkisten leuchten golden – sie enthalten immer eine Waffe.',
      'Halte die Feuertaste auf dem Handy gedrückt und wische, um gleichzeitig zu zielen.',
      'Der Gleiter öffnet sich automatisch – mit Springen klappst du ihn früher auf.',
      'Wände aus Metall halten am meisten aus, brauchen aber Zeit, bis sie fest sind.',
      'Niedergeschlagene Teamkameraden belebst du mit gehaltenem Interagieren wieder.',
      `Bekannte Orte: ${POIS.slice(0, 6).map((p) => p.name).join(', ')} …`,
      'Sprungpads im Riftkrater schleudern dich hoch – danach kannst du gleiten.',
      'Im Modus „Ohne Bauen“ zählen Deckung und Bewegung umso mehr.',
    ];
    this.set(h('div', { class: 'screen solid loading' }, h('div', { class: 'spinner' }), h('h2', null, text), h('p', { class: 'muted', style: 'max-width:480px' }, tips[Math.floor(Math.random() * tips.length)]!)));
  }

  private startOffline(): void {
    const cfg = this.matchConfig();
    const transport = new LocalTransport(cfg, profile.data.name, profile.data.cos, this.heights);
    this.launch(transport, false, `${TEAM_LABEL[cfg.teamSize]}${cfg.build ? '' : ' · Ohne Bauen'} · Offline`);
  }

  private startOnline(_matchId: string): void {
    const t = this.online.startMatch();
    this.launch(t, true, `${TEAM_LABEL[this.mode.teamSize]}${this.mode.build ? '' : ' · Ohne Bauen'} · Online`);
  }

  private launch(transport: LocalTransport | ReturnType<OnlineClient['startMatch']>, online: boolean, label: string): void {
    this.loadingScreen('Insel wird geladen …');
    this.stage.stop();
    audio.setMusic('off');
    // dem Ladebildschirm einen Frame Zeit geben
    setTimeout(() => {
      let game: Game;
      try {
        game = new Game({
          renderer: this.R,
          transport,
          online,
          modeLabel: label,
          ui: this.ui,
          colors: this.colors,
          onEnd: (r, selfId, winner, session) => this.onMatchEnd(r, selfId, winner, session, online, label),
          onExit: (reason) => this.exitGame(reason),
          openSettings: (onClose) => this.showSettings(() => {
            this.screen?.remove();
            this.screen = null;
            onClose();
          }),
        });
      } catch (e) {
        console.error(e);
        toast('Match konnte nicht gestartet werden: ' + (e as Error).message, 5000);
        this.exitGame();
        return;
      }
      this.game = game;
      const wait = setInterval(() => {
        if (!this.game) return clearInterval(wait);
        if (this.game.session.latest) {
          clearInterval(wait);
          this.screen?.remove();
          this.screen = null;
        }
      }, 100);
      setTimeout(() => {
        if (this.game === game && !game.session.latest) {
          clearInterval(wait);
          toast('Keine Antwort vom Match – zurück zur Lobby', 4000);
          this.exitGame();
        }
      }, 25000);
    }, 50);
  }

  private recorded = new Set<Session>();

  private onMatchEnd(results: PlacementResult[], selfId: number, winnerTeam: number, session: Session, online: boolean, label: string): void {
    const me = results.find((r) => r.id === selfId) ?? results[0]!;
    let summary: MatchSummary | null = null;
    if (!this.recorded.has(session)) {
      this.recorded.add(session);
      summary = profile.recordMatch(me, session.config?.maxPlayers ?? 100, session.config?.teamSize ?? 1, label, online);
      if (summary.levelAfter > summary.levelBefore) audio.play('levelUp');
    }
    this.showResults(results, me, winnerTeam, summary, session);
  }

  private showResults(results: PlacementResult[], me: PlacementResult, winnerTeam: number, summary: MatchSummary | null, session: Session): void {
    const won = me.place === 1;
    const teams = Math.ceil((session.config?.maxPlayers ?? 100) / (session.config?.teamSize ?? 1));
    const top = [...results].sort((a, b) => a.place - b.place || b.kills - a.kills).slice(0, 8);
    const L = levelFromXp(profile.data.xp);
    const el = h(
      'div',
      { class: 'screen dim scroll', style: 'background:rgba(8,10,28,.9)' },
      h(
        'div',
        { class: 'content', style: 'flex-wrap:wrap;align-items:flex-start' },
        h(
          'div',
          { class: 'panel col', style: 'flex:1;min-width:280px' },
          h('div', { class: `result-place ${won ? 'win' : ''}` }, won ? 'SIEG!' : `#${me.place}`),
          h('div', { class: 'muted' }, won ? 'Letztes Team in der Riftzone' : `von ${teams} ${session.config?.teamSize === 1 ? 'Spielern' : 'Teams'}`),
          h(
            'div',
            { class: 'statgrid', style: 'margin-top:12px' },
            [
              ['Ausschaltungen', me.kills],
              ['Schaden', me.damage],
              ['Überlebt', fmtTime(me.survived)],
              ['Kopftreffer', me.headshots],
              ['Gebaut', me.built],
              ['Gesammelt', me.harvested],
              ['Riftkisten', me.chests],
              ['Wiederbelebt', me.revives],
            ].map(([k, v]) => h('div', { class: 'stat' }, h('b', null, String(v)), h('span', null, String(k)))),
          ),
        ),
        h(
          'div',
          { class: 'panel col', style: 'flex:1;min-width:280px' },
          h('h3', null, 'Erfahrung'),
          summary ? summary.lines.map((l, i) => h('div', { class: 'xpline', style: `animation-delay:${i * 0.12}s` }, h('span', null, l.label), h('b', null, `+${l.xp}`))) : h('p', { class: 'muted' }, 'Bereits gewertet.'),
          summary ? h('div', { class: 'xpline' }, h('b', null, 'Gesamt'), h('b', { style: 'color:var(--amber)' }, `+${summary.total} EP`)) : '',
          summary && summary.levelAfter > summary.levelBefore ? h('div', { class: 'tag', style: 'font-size:1rem;padding:8px 12px' }, `Stufe ${summary.levelAfter} erreicht! Neue Kosmetik im Spind.`) : '',
          h('div', { class: 'row', style: 'margin-top:6px' }, h('div', { class: 'lvl' }, String(L.level)), h('div', { class: 'xpbar grow' }, h('i', { style: `width:${(L.into / L.need) * 100}%` }))),
          h('h3', { style: 'margin-top:10px' }, 'Bestenliste des Matches'),
          h(
            'table',
            { class: 'stats' },
            h('tr', null, h('th', null, '#'), h('th', null, 'Name'), h('th', null, 'Ausgeschaltet'), h('th', null, 'Schaden')),
            top.map((r) => h('tr', { style: r.team === me.team ? 'color:var(--teal)' : '' }, h('td', null, String(r.place)), h('td', null, r.name + (r.bot ? ' (Bot)' : '')), h('td', null, String(r.kills)), h('td', null, String(r.damage)))),
          ),
          winnerTeam >= 0 && !won ? h('p', { class: 'muted' }, 'Das Match läuft eventuell noch – du kannst weiter zuschauen.') : '',
        ),
      ),
      h(
        'div',
        { class: 'row', style: 'justify-content:flex-end;margin-top:12px' },
        !session.results ? h('button', { class: 'btn ghost', onclick: () => (this.screen?.remove(), (this.screen = null)) }, 'Weiter zuschauen') : '',
        h('button', { class: 'btn', onclick: () => this.exitGame() }, 'Zur Lobby'),
        h(
          'button',
          {
            class: 'btn primary',
            onclick: () => {
              this.exitGame();
              this.play();
            },
          },
          'Nochmal',
        ),
      ),
    );
    this.set(el);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  private exitGame(_reason?: string): void {
    const g = this.game;
    this.game = null;
    if (g) {
      g.dispose();
      this.online.endMatch();
    }
    audio.setMusic('menu');
    this.stage.start();
    this.showLobby();
  }

  // ---------------- Spind ----------------

  showLocker(tab: 'outfit' | 'hat' | 'back' | 'glider' | 'pickaxe' | 'skin' | 'emote' | 'victory' = 'outfit'): void {
    this.current = () => this.showLocker(tab);
    this.stage.offsetX = -1.3;
    this.stage.setCosmetics(profile.data.cos);
    const tabs: [typeof tab, string][] = [
      ['outfit', 'Outfit'],
      ['hat', 'Kopf'],
      ['back', 'Rücken'],
      ['glider', 'Gleiter'],
      ['pickaxe', 'Spitzhacke'],
      ['skin', 'Hautton'],
      ['emote', 'Emotes'],
      ['victory', 'Siegerpose'],
    ];
    const grid = h('div', { class: 'grid-items' });
    const cos = profile.data.cos;
    const item = (name: string, color: number, sub: string, equipped: boolean, locked: boolean, onClick: () => void): HTMLElement =>
      h('div', { class: `cos-item ${equipped ? 'equipped' : ''} ${locked ? 'locked' : ''}`, onclick: locked ? undefined : onClick }, h('div', { class: 'sw', style: `background:${color ? hex(color) : 'repeating-linear-gradient(45deg,#333 0 6px,#222 6px 12px)'}` }), h('div', { class: 'nm' }, name), h('small', { class: 'muted' }, sub));
    const equip = (k: keyof Cosmetics, id: number): void => {
      profile.equip(k, id);
      this.stage.setCosmetics(profile.data.cos);
      if (k === 'pickaxe') this.stage.holding = 100;
      this.showLocker(tab);
    };
    const lockTxt = (lvl: number): string => (lvl <= profile.level ? '' : `ab Stufe ${lvl}`);
    if (tab === 'outfit') OUTFITS.forEach((o) => grid.append(item(o.name, o.colors[0], lockTxt(o.level) || RARITY_LABEL[o.rarity]!, cos.outfit === o.id, !profile.unlocked('outfit', o.id), () => equip('outfit', o.id))));
    if (tab === 'hat') HATS.forEach((o) => grid.append(item(o.name, o.color, lockTxt(o.level), cos.hat === o.id, !profile.unlocked('hat', o.id), () => equip('hat', o.id))));
    if (tab === 'back') BACKS.forEach((o) => grid.append(item(o.name, o.color, lockTxt(o.level), cos.back === o.id, !profile.unlocked('back', o.id), () => equip('back', o.id))));
    if (tab === 'glider') GLIDERS.forEach((o) => grid.append(item(o.name, o.color, lockTxt(o.level), cos.glider === o.id, !profile.unlocked('glider', o.id), () => equip('glider', o.id))));
    if (tab === 'pickaxe') PICKAXES.forEach((o) => grid.append(item(o.name, o.color, lockTxt(o.level), cos.pickaxe === o.id, !profile.unlocked('pickaxe', o.id), () => equip('pickaxe', o.id))));
    if (tab === 'skin') SKINS.forEach((c, i) => grid.append(item(`Ton ${i + 1}`, c, '', cos.skin === i, false, () => equip('skin', i))));
    if (tab === 'victory') VICTORY_POSES.forEach((o) => grid.append(item(o.name, 0xffb02e, lockTxt(o.level), cos.victory === o.id, !profile.unlocked('victory', o.id), () => equip('victory', o.id))));
    if (tab === 'emote') {
      EMOTES.forEach((e) => {
        const inWheel = profile.data.emotes.includes(e.id);
        grid.append(
          item(e.name, inWheel ? 0x3ff2ff : 0x2a2f45, lockTxt(e.level) || (inWheel ? 'im Emote-Rad' : 'antippen: Rad'), inWheel, !profile.unlocked('emote', e.id), () => {
            const list = profile.data.emotes;
            if (inWheel) profile.data.emotes = list.filter((x) => x !== e.id);
            else profile.data.emotes = [...list, e.id].slice(-6);
            profile.save();
            this.stage.playEmote(e.id);
            this.showLocker(tab);
          }),
        );
      });
    }
    const nameIn = h('input', { type: 'text', value: profile.data.name, maxlength: '16', style: 'width:180px' }) as HTMLInputElement;
    const el = h(
      'div',
      { class: 'screen dim' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn ghost', onclick: () => this.showLobby() }, '← Zurück'), h('h2', { style: 'margin:0' }, 'Spind'), h('div', { class: 'grow' }), this.chip()),
      h(
        'div',
        { class: 'content', style: 'justify-content:flex-end' },
        h(
          'div',
          { class: 'panel col scroll', style: 'width:min(560px,100%);' },
          h('div', { class: 'row' }, h('span', { class: 'muted' }, 'Name'), nameIn, h('button', { class: 'btn small', onclick: () => (profile.setName(nameIn.value), toast('Name gespeichert'), this.showLocker(tab)) }, 'Speichern')),
          h('div', { class: 'tabs' }, tabs.map(([k, l]) => h('button', { class: `btn small ${k === tab ? 'sel' : ''}`, onclick: () => this.showLocker(k) }, l))),
          grid,
          h('p', { class: 'muted', style: 'font-size:.8rem' }, 'Neue Gegenstände schaltest du mit steigender Stufe frei. Erfahrung gibt es für Platzierung, Ausschaltungen und Herausforderungen.'),
        ),
      ),
    );
    this.set(el);
  }

  // ---------------- Statistik ----------------

  showStats(tab: 'overview' | 'history' | 'board' = 'overview'): void {
    this.current = () => this.showStats(tab);
    this.stage.offsetX = 1.4;
    const t = profile.data.totals;
    const body = h('div', { class: 'col' });
    if (tab === 'overview') {
      const kd = t.deaths ? (t.kills / t.deaths).toFixed(2) : String(t.kills);
      body.append(
        h(
          'div',
          { class: 'statgrid' },
          [
            ['Matches', t.matches],
            ['Siege', t.wins],
            ['Top 10', t.top10],
            ['Ausschaltungen', t.kills],
            ['K/D', kd],
            ['Schaden', t.damage],
            ['Spielzeit', fmtTime(t.survived)],
            ['Beste Platzierung', t.bestPlace || '–'],
            ['Meiste Ausschaltungen', t.bestKills],
            ['Kopftreffer', t.headshots],
            ['Gebaut', t.built],
            ['Gesammelt', t.harvested],
            ['Riftkisten', t.chests],
            ['Wiederbelebt', t.revives],
            ['Gelaufen', `${(t.distance / 1000).toFixed(1)} km`],
            ['Stufe', profile.level],
          ].map(([k, v]) => h('div', { class: 'stat' }, h('b', null, String(v)), h('span', null, String(k)))),
        ),
      );
    } else if (tab === 'history') {
      const hist = profile.data.history;
      body.append(
        hist.length
          ? h(
              'table',
              { class: 'stats' },
              h('tr', null, h('th', null, 'Datum'), h('th', null, 'Modus'), h('th', null, 'Platz'), h('th', null, 'Ausg.'), h('th', null, 'Schaden'), h('th', null, 'Zeit'), h('th', null, 'EP')),
              hist.map((e) => h('tr', null, h('td', null, new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })), h('td', null, e.mode), h('td', { style: e.won ? 'color:var(--amber);font-weight:900' : '' }, `${e.place}/${e.of}`), h('td', null, String(e.kills)), h('td', null, String(e.damage)), h('td', null, fmtTime(e.survived)), h('td', null, `+${e.xp}`))),
            )
          : h('p', { class: 'muted' }, 'Noch keine Matches gespielt.'),
      );
    } else {
      const local = [...profile.data.history].sort((a, b) => a.place - b.place || b.kills - a.kills).slice(0, 10);
      body.append(
        h('h3', null, 'Deine besten Matches'),
        local.length ? h('table', { class: 'stats' }, h('tr', null, h('th', null, '#'), h('th', null, 'Platz'), h('th', null, 'Ausgeschaltet'), h('th', null, 'Modus')), local.map((e, i) => h('tr', null, h('td', null, String(i + 1)), h('td', null, `${e.place}/${e.of}`), h('td', null, String(e.kills)), h('td', null, e.mode)))) : h('p', { class: 'muted' }, 'Noch keine Matches.'),
        h('h3', { style: 'margin-top:12px' }, 'Server-Rangliste'),
      );
      if (!settings.data.serverUrl) body.append(h('p', { class: 'muted' }, 'Kein Server eingerichtet.'));
      else if (this.onlineLb) {
        body.append(
          h('table', { class: 'stats' }, h('tr', null, h('th', null, '#'), h('th', null, 'Name'), h('th', null, 'Siege'), h('th', null, 'Ausgeschaltet'), h('th', null, 'Matches')), this.onlineLb.map((e, i) => h('tr', null, h('td', null, String(i + 1)), h('td', null, e.name), h('td', null, String(e.wins)), h('td', null, String(e.kills)), h('td', null, String(e.matches))))),
        );
      } else {
        body.append(h('p', { class: 'muted' }, 'Lade …'));
        this.loadLeaderboard();
      }
    }
    const el = h(
      'div',
      { class: 'screen dim' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn ghost', onclick: () => this.showLobby() }, '← Zurück'), h('h2', { style: 'margin:0' }, 'Statistik')),
      h(
        'div',
        { class: 'content' },
        h(
          'div',
          { class: 'panel col scroll', style: 'width:min(820px,100%)' },
          h('div', { class: 'tabs' }, h('button', { class: `btn small ${tab === 'overview' ? 'sel' : ''}`, onclick: () => this.showStats('overview') }, 'Übersicht'), h('button', { class: `btn small ${tab === 'history' ? 'sel' : ''}`, onclick: () => this.showStats('history') }, 'Matchhistorie'), h('button', { class: `btn small ${tab === 'board' ? 'sel' : ''}`, onclick: () => this.showStats('board') }, 'Ranglisten')),
          body,
        ),
      ),
    );
    this.set(el);
  }

  private loadLeaderboard(): void {
    const url = serverHttpUrl(settings.data.serverUrl) + '/api/leaderboard';
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: { entries: LeaderEntry[] }) => {
        this.onlineLb = j.entries;
        this.refresh();
      })
      .catch(() => {
        this.onlineLb = [];
        this.refresh();
      });
  }

  // ---------------- Einstellungen ----------------

  showSettings(onClose: () => void, tab: 'gfx' | 'audio' | 'controls' | 'access' | 'online' = 'gfx'): void {
    if (!this.game) this.current = () => this.showSettings(onClose, tab);
    const S = settings.data;
    const row = (label: string, ctrl: HTMLElement, hint = ''): HTMLElement => h('div', { class: 'settings-row' }, h('div', null, label, hint ? h('div', { class: 'muted', style: 'font-size:.75rem' }, hint) : ''), h('div', { class: 'val' }, ctrl));
    const range = <K extends keyof Settings>(k: K, min: number, max: number, step: number, fmt: (v: number) => string = (v) => String(v)): HTMLElement => {
      const lab = h('span', { style: 'min-width:48px;text-align:right' }, fmt(S[k] as number));
      const r = h('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(S[k]) }) as HTMLInputElement;
      r.oninput = () => {
        lab.textContent = fmt(Number(r.value));
        settings.set(k, Number(r.value) as Settings[K]);
      };
      return h('div', { class: 'row grow', style: 'flex-wrap:nowrap' }, r, lab);
    };
    const toggle = <K extends keyof Settings>(k: K): HTMLElement => {
      const b = h('button', { class: `btn small ${S[k] ? 'sel' : ''}` }, S[k] ? 'An' : 'Aus');
      b.onclick = () => {
        settings.set(k, !S[k] as Settings[K]);
        b.className = `btn small ${S[k] ? 'sel' : ''}`;
        b.textContent = S[k] ? 'An' : 'Aus';
      };
      return b;
    };
    const choice = <K extends keyof Settings>(k: K, opts: [Settings[K], string][]): HTMLElement => {
      const wrap = h('div', { class: 'row' });
      const draw = (): void => {
        wrap.replaceChildren(...opts.map(([v, l]) => h('button', { class: `btn small ${S[k] === v ? 'sel' : ''}`, onclick: () => (settings.set(k, v), draw()) }, l)));
      };
      draw();
      return wrap;
    };
    const body = h('div', { class: 'col' });
    if (tab === 'gfx') {
      body.append(
        row('Grafikqualität', choice('quality', [['auto', 'Automatisch'], ['low', 'Niedrig'], ['medium', 'Mittel'], ['high', 'Hoch'], ['ultra', 'Ultra']]), `Aktuell: ${({ low: 'Niedrig', medium: 'Mittel', high: 'Hoch', ultra: 'Ultra' } as Record<string, string>)[this.R.profile.name]}`),
        row('Auflösung', range('renderScale', 0.5, 1.25, 0.05, (v) => `${Math.round(v * 100)} %`), 'Weniger spart Akku und Wärme'),
        row('Sichtweite', range('viewDistance', 250, 900, 25, (v) => `${v} m`)),
        row('Schatten', toggle('shadows')),
        row('Gras', toggle('grass')),
        row('Bildrate begrenzen', choice('fpsCap', [[0, 'Aus'], [30, '30'], [45, '45'], [60, '60']]), 'Schont Akku und verhindert Überhitzen'),
        row('Sichtfeld (FOV)', range('fov', 60, 95, 1, (v) => `${v}°`)),
        row('FPS anzeigen', toggle('showFps')),
      );
    } else if (tab === 'audio') {
      body.append(row('Gesamt', range('master', 0, 1, 0.05, (v) => `${Math.round(v * 100)}`)), row('Effekte', range('sfx', 0, 1, 0.05, (v) => `${Math.round(v * 100)}`)), row('Musik', range('music', 0, 1, 0.05, (v) => `${Math.round(v * 100)}`)), row('Oberfläche', range('ui', 0, 1, 0.05, (v) => `${Math.round(v * 100)}`)));
    } else if (tab === 'controls') {
      body.append(
        row('Maus-Empfindlichkeit', range('sensitivity', 0.2, 3, 0.05, (v) => v.toFixed(2))),
        row('Beim Zielen', range('aimSensitivity', 0.2, 1.5, 0.05, (v) => v.toFixed(2))),
        row('Y-Achse umkehren', toggle('invertY')),
        row('Touch-Empfindlichkeit', range('touchSensitivity', 0.3, 3, 0.05, (v) => v.toFixed(2))),
        row('Touch-Tastengröße', range('touchScale', 0.7, 1.5, 0.05, (v) => `${Math.round(v * 100)} %`)),
        row('Touch-Deckkraft', range('touchOpacity', 0.3, 1, 0.05, (v) => `${Math.round(v * 100)} %`)),
        row('Touch: automatisch feuern', toggle('touchAutoFire'), 'Feuert, wenn das Fadenkreuz auf einem Gegner liegt'),
        row('Touch: Sprint am Stick-Rand', toggle('touchSprintAuto')),
        row('Gamepad-Empfindlichkeit', range('gamepadSensitivity', 0.3, 3, 0.05, (v) => v.toFixed(2))),
        row('Vibration', toggle('vibration')),
        h('h3', { style: 'margin-top:12px' }, 'Tastenbelegung'),
      );
      for (const [a, label] of KEY_ACTIONS) {
        const b = h('button', { class: 'btn small key-btn' }, keyLabel(S.keys[a as KeyAction]));
        b.onclick = () => {
          b.classList.add('listening');
          b.textContent = 'Taste drücken …';
          const onKey = (e: KeyboardEvent): void => {
            e.preventDefault();
            window.removeEventListener('keydown', onKey, true);
            if (e.code !== 'Escape') settings.setKey(a as KeyAction, e.code);
            this.showSettings(onClose, tab);
          };
          window.addEventListener('keydown', onKey, true);
        };
        body.append(row(label, b));
      }
      body.append(h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn small', onclick: () => (settings.resetKeys(), this.showSettings(onClose, tab)) }, 'Standardbelegung')));
      body.append(
        h('h3', { style: 'margin-top:12px' }, 'Gamepad'),
        h('p', { class: 'muted', style: 'font-size:.85rem' }, 'Linker Stick bewegen · rechter Stick zielen · RT feuern · LT zielen · A springen · B ducken · X interagieren · Y nachladen · LB/RB Waffe wechseln (im Baumodus: Wand/Rampe) · Steuerkreuz hoch: Boden/Emote · rechter Stick drücken: Baumodus · Start: Pause · Select: Karte'),
      );
    } else if (tab === 'access') {
      body.append(
        row('Farbsehschwäche', choice('colorblind', [['none', 'Aus'], ['protan', 'Protan'], ['deutan', 'Deutan'], ['tritan', 'Tritan']]), 'Ersatzfarben für Seltenheiten'),
        row('Geräusche anzeigen', toggle('soundViz'), 'Zeigt Schüsse, Schritte und Kisten als Richtungsmarken'),
        row('Textgröße', range('textScale', 0.85, 1.4, 0.05, (v) => `${Math.round(v * 100)} %`)),
        row('Reduzierte Bewegung', toggle('reducedMotion'), 'Kein Kamerawackeln, weniger Animationen'),
        row('Kontrastreiches HUD', toggle('highContrast')),
      );
    } else {
      const inp = h('input', { type: 'text', value: S.serverUrl, placeholder: 'z. B. wss://riftzone.example.de', style: 'width:100%' }) as HTMLInputElement;
      body.append(
        row('Server-Adresse', inp, 'Dein eigener RIFTZONE-Server (siehe Anleitung). Leer = nur Offline.'),
        h(
          'div',
          { class: 'row' },
          h(
            'button',
            {
              class: 'btn small rift',
              onclick: () => {
                settings.set('serverUrl', inp.value.trim());
                this.online.disconnect();
                this.onlineState = 'off';
                if (inp.value.trim()) this.connectOnline();
                toast(inp.value.trim() ? 'Server gespeichert – verbinde …' : 'Online deaktiviert');
              },
            },
            'Speichern & verbinden',
          ),
          h('span', { class: 'muted' }, this.onlineState === 'open' ? 'Verbunden' : this.onlineState === 'connecting' ? 'Verbinde …' : 'Nicht verbunden'),
        ),
      );
    }
    const tabs: [typeof tab, string][] = [
      ['gfx', 'Grafik'],
      ['audio', 'Audio'],
      ['controls', 'Steuerung'],
      ['access', 'Barrierefreiheit'],
      ['online', 'Online'],
    ];
    const el = h(
      'div',
      { class: 'screen dim', style: this.game ? 'background:rgba(8,10,28,.92);z-index:50' : '' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn ghost', onclick: onClose }, '← Zurück'), h('h2', { style: 'margin:0' }, 'Einstellungen'), h('div', { class: 'grow' }), h('button', { class: 'btn small ghost', onclick: () => confirmReset() }, 'Alles zurücksetzen')),
      h('div', { class: 'content' }, h('div', { class: 'panel col scroll', style: 'width:min(760px,100%)' }, h('div', { class: 'tabs' }, tabs.map(([k, l]) => h('button', { class: `btn small ${k === tab ? 'sel' : ''}`, onclick: () => this.showSettings(onClose, k) }, l))), body)),
    );
    const confirmReset = (): void => {
      const d = confirmDialog('Alle Einstellungen auf Standard zurücksetzen?', 'Zurücksetzen', () => {
        for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) if (k !== 'serverUrl' && k !== 'playerName') settings.set(k, (DEFAULT_SETTINGS as unknown as Record<string, never>)[k]);
        settings.resetKeys();
        this.showSettings(onClose, tab);
      }, () => undefined);
      this.ui.appendChild(d);
    };
    this.set(el);
  }
}

export const _clear = clear;
