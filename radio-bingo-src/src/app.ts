/**
 * RADIO-BINGO – Show-Steuerung und Oberfläche: Laden, Titel, Konsolen-Menü, Spielmodi, Einstellungen (Stimme, Tempo, Hilfe),
 * die moderierte Show (Runden, Ziehung, Bingo-Rufe, Studio-Publikum, Studio-Spiel „Höher oder Tiefer“, Jackpot-Finale),
 * Blitz-Bingo, Online & Handys (Gastgeber/TV + Mitspieler) und Ergebnis. Speichern: radio-bingo-save (Cloud über anmacha-cloud).
 */
import { Drum, dayNumber, makeCard, marksFrom, missing, pattern, PATTERNS, rng, validClaim, type Card, type Kind, type Pattern } from './core/bingo';
import { botsNear, callText, line, makeBots, MODES, modeDef, prize, rounds, SCHNELL_PATTERNS, type Bot, type ModeId, type RoundDef } from './core/modes';
import { Studio } from './render/studio';
import { Voice } from './audio/voice';
import { Sfx } from './audio/sfx';
import { Net, loadQR, netError, normCode } from './net/online';
import { escHtml as esc, patternMini, renderCards, type CardState } from './ui/cards';

const $ = (id: string) => document.getElementById(id)!;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const KEY = 'radio-bingo-save';
interface Save {
  total: number;
  best: number;
  shows: number;
  wins: number;
  jackpots: number;
  dailyBoard: number;
  dailyBest: number;
  dailyDay: number;
  name: string;
  set: { voiceOn: boolean; voice: string; rate: number; music: boolean; sfx: number; tempo: number; auto: boolean; hint: boolean; cards: number; quality: number; guestVoice: boolean };
}
const DEF: Save = { total: 0, best: 0, shows: 0, wins: 0, jackpots: 0, dailyBoard: 0, dailyBest: 0, dailyDay: 0, name: '', set: { voiceOn: true, voice: '', rate: 1.05, music: true, sfx: 0.8, tempo: 1, auto: false, hint: true, cards: 2, quality: -1, guestVoice: true } };
function loadSave(): Save {
  try {
    const j = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEF, ...j, set: { ...DEF.set, ...(j.set || {}) } };
  } catch {
    return JSON.parse(JSON.stringify(DEF));
  }
}
const SV = loadSave();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(SV));
  } catch {
    /* voll */
  }
};
const TEMPO = [
  { n: 'Gemütlich', ms: 4200 },
  { n: 'Normal', ms: 2600 },
  { n: 'Schnell', ms: 1300 },
];
const params = new URLSearchParams(location.search);
const IS_TV = params.has('tv'),
  JOIN = normCode(params.get('join') || '');
const coarse = () => matchMedia('(pointer: coarse)').matches;

interface Player {
  id: string;
  name: string;
  points: number;
  wins: number;
  cards: CardState[];
  hl: number;
}

export class App {
  studio: Studio;
  voice = new Voice();
  sfx = new Sfx();
  net = new Net();
  scr = 'sLoad';
  mode: ModeId = 'show';
  kind: Kind = 75;
  rds: RoundDef[] = [];
  ri = 0;
  drum: Drum | null = null;
  drawn: number[] = [];
  drawnSet = new Set<number>();
  pat: Pattern = PATTERNS.linie;
  bots: Bot[] = [];
  me: Player = { id: 'me', name: 'Du', points: 0, wins: 0, cards: [], hl: 0 };
  guests = new Map<string, Player>();
  playing = false;
  paused = false;
  abort = false;
  claims: { pid: string; ci: number; t: number }[] = [];
  wake: (() => void) | null = null;
  cur: [number, number] | null = null;
  jokerArm = false;
  joker = 0; // Glückskugeln für die nächste Runde
  lockUntil = 0;
  saidNear = false;
  saidMe = false;
  seed = 1;
  schnellPat = 'linie';
  online = false; // diese Show läuft online (als Gastgeber)
  hostPlays = !IS_TV;
  guestMode = false; // dieses Gerät ist Mitspieler
  aiOn = true;
  blitzScore = 0;
  blitzGot = new Set<string>();
  drawAt = 0;

  constructor() {
    const q = SV.set.quality >= 0 ? SV.set.quality : coarse() || (navigator.hardwareConcurrency || 4) <= 4 ? 0 : 1;
    this.studio = new Studio($('scene') as HTMLCanvasElement, q);
    this.voice.on = SV.set.voiceOn;
    this.voice.rate = SV.set.rate;
    this.voice.pick = SV.set.voice;
    this.voice.onSub = (t) => this.subtitle(t);
    this.voice.onTalk = (on) => this.studio.host.setTalking(on);
    this.sfx.setVol(SV.set.sfx);
    this.bindKeys();
    addEventListener('resize', () => this.layout());
    this.boot();
  }

  /* ---------- Bildschirme ---------- */
  show(id: string) {
    document.querySelectorAll('.scr').forEach((s) => s.classList.toggle('on', s.id === id));
    this.scr = id;
    document.body.dataset.scr = id;
    setTimeout(() => this.focusFirst(), 30);
    requestAnimationFrame(() => this.layout());
  }
  /** Die Karten verdecken einen Teil des Bildes – das Studio rückt in den freien Bereich */
  layout() {
    const d = document.querySelector<HTMLElement>('.dock');
    if (this.scr !== 'sGame' || !d || d.offsetParent === null) return this.studio.setInset(0, 0);
    const land = innerWidth / innerHeight >= 1.1;
    this.studio.setInset(land ? d.offsetWidth : 0, land ? 0 : Math.round(d.offsetHeight * 0.9));
  }
  focusFirst() {
    if (coarse()) return;
    const root = !$('ov').hidden ? $('ovBox') : $(this.scr);
    const el = root?.querySelector<HTMLElement>('[data-focus]') || root?.querySelector<HTMLElement>('.mi, .nav:not([disabled])');
    el?.focus({ preventScroll: true });
  }
  toast(t: string, ms = 2400) {
    const el = $('toast');
    el.textContent = t;
    el.hidden = false;
    clearTimeout((el as unknown as { _t: number })._t);
    (el as unknown as { _t: number })._t = window.setTimeout(() => (el.hidden = true), ms);
  }
  subtitle(t: string) {
    const el = $('sub');
    el.innerHTML = `<b>🎙️ Rico</b> ${esc(t)}`;
    el.classList.add('on');
    clearTimeout((el as unknown as { _t: number })._t);
    (el as unknown as { _t: number })._t = window.setTimeout(() => el.classList.remove('on'), Math.max(3500, t.length * 75));
    if (this.online && this.net.role === 'host') this.net.send({ t: 'say', text: t });
  }
  ov(html: string, binds: Record<string, (b: HTMLElement) => void>, esc0?: () => void) {
    $('ovBox').innerHTML = html;
    $('ov').hidden = false;
    $('ovBox')
      .querySelectorAll<HTMLElement>('[data-act]')
      .forEach((b) => (b.onclick = () => binds[b.dataset.act!]?.(b)));
    this.ovEsc = esc0 || (() => this.closeOv());
    setTimeout(() => this.focusFirst(), 30);
  }
  ovEsc: (() => void) | null = null;
  closeOv() {
    $('ov').hidden = true;
    $('ovBox').innerHTML = '';
    this.ovEsc = null;
    setTimeout(() => this.focusFirst(), 30);
  }

  boot() {
    let p = 0;
    const tips = ['Die Kugeln werden poliert …', 'Das Publikum nimmt Platz …', 'Rico richtet die Frisur …', 'Die Trommel dreht sich warm …'];
    const t = setInterval(() => {
      p += 20;
      $('loadBar').style.width = Math.min(100, p) + '%';
      $('loadTip').textContent = tips[Math.min(3, Math.floor(p / 30))];
      if (p >= 100) {
        clearInterval(t);
        if (JOIN) this.joinScreen(JOIN);
        else if (IS_TV) {
          this.mode = 'online';
          this.title();
        } else this.title();
      }
    }, 140);
  }
  title() {
    this.show('sTitle');
    this.studio.shot('wide');
    this.studio.setScreen('RADIO-BINGO', 'Die große Kugelshow');
    $('bPress').onclick = () => {
      this.sfx.unlock();
      this.sfx.jingle();
      IS_TV ? this.lobby() : this.menu();
    };
  }
  menu() {
    this.stopShow();
    this.net.close();
    this.online = false;
    this.guestMode = false;
    this.show('sMenu');
    this.studio.shot('wide');
    this.studio.host.act('wave', 2);
    const today = dayNumber(),
      items = MODES.map((m) => [m.id, m.icon, m.name, m.desc + (m.id === 'tag' && SV.dailyDay === today ? ` Heute schon gespielt: ${SV.dailyBest} Punkte.` : '')] as const);
    const extra = [
      ['opts', '⚙️', 'Einstellungen', 'Moderator-Stimme (alle Stimmen deines Geräts), Sprechtempo, Ziehungstempo, Anzahl Karten, Auto-Markieren, Hilfe, Musik und Grafik.'],
      ['help', '❓', 'So geht’s', 'Bingo-Regeln, Muster, Joker und Steuerung mit Touch, Tastatur und Gamecontroller.'],
    ] as const;
    $('mList').innerHTML = [...items, ...extra]
      .map(([id, ic, n, d], i) => `<button class="mi${i === 0 ? ' hero' : ''}${id === 'online' ? ' online' : ''}" data-go="${id}" data-i="${esc(d)}" data-ic="${ic}"><i>${ic}</i><b>${n}</b><small>${esc(d.split(' – ')[0].split('. ')[0])}</small></button>`)
      .join('');
    const info = (b: HTMLElement) => {
      $('mInfo').innerHTML = `<i>${b.dataset.ic}</i><b>${b.querySelector('b')!.textContent}</b><p>${b.dataset.i}</p><p class="best">🏆 Bestwert: <b>${SV.best}</b> · Gesamt: <b>${SV.total}</b> Punkte · 💰 Jackpots: <b>${SV.jackpots}</b></p>`;
    };
    $('mList')
      .querySelectorAll<HTMLElement>('.mi')
      .forEach((b) => {
        b.onfocus = b.onmouseenter = () => info(b);
        b.onclick = () => this.menuGo(b.dataset.go!);
      });
    info($('mList').firstElementChild as HTMLElement);
    setTimeout(() => this.focusFirst(), 80);
  }
  menuGo(g: string) {
    this.sfx.unlock();
    if (g === 'opts') return this.settings();
    if (g === 'help') return this.help();
    this.mode = g as ModeId;
    if (g === 'online') return this.lobby();
    this.setup();
  }

  /* ---------- Vorbereitung je Modus ---------- */
  setup() {
    const m = modeDef(this.mode);
    this.show('sSetup');
    this.studio.shot('host');
    const cardsOpt = this.mode === 'blitz' ? [2, 3, 4] : [1, 2, 3, 4];
    if (!cardsOpt.includes(SV.set.cards)) SV.set.cards = cardsOpt[0];
    $('setupBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>${m.icon} ${m.name}</h2><span></span></header><p class="lead">${esc(m.desc)}</p>
      ${this.mode === 'schnell' ? `<h3>Muster</h3><div class="chips pats">${SCHNELL_PATTERNS.map((k) => `<button class="chip nav pchip${k === this.schnellPat ? ' on' : ''}" data-p="${k}">${patternMini(PATTERNS[k])}<span>${PATTERNS[k].short}</span></button>`).join('')}</div>` : ''}
      <h3>Karten</h3><div class="chips">${cardsOpt.map((n) => `<button class="chip nav${n === SV.set.cards ? ' on' : ''}" data-cards="${n}">${n} ${n === 1 ? 'Karte' : 'Karten'}</button>`).join('')}</div>
      ${this.mode !== 'blitz' ? `<h3>Ziehungstempo</h3><div class="chips">${TEMPO.map((t, i) => `<button class="chip nav${i === SV.set.tempo ? ' on' : ''}" data-tempo="${i}">${t.n}</button>`).join('')}</div>` : ''}
      <h3>Hilfen</h3><div class="chips"><button class="chip nav${SV.set.auto && this.mode !== 'blitz' ? ' on' : ''}" data-tog="auto"${this.mode === 'blitz' ? ' disabled' : ''}>🤖 Auto-Markieren</button><button class="chip nav${SV.set.hint ? ' on' : ''}" data-tog="hint">💡 Gezogene Zahlen leuchten</button></div>
      <div class="row end"><button class="btn gold xl nav" id="go" data-focus>🎬 Show starten</button></div>`;
    const box = $('setupBox');
    (box.querySelector('[data-back]') as HTMLElement).onclick = () => this.menu();
    box.querySelectorAll<HTMLElement>('[data-p]').forEach((b) => (b.onclick = () => { this.schnellPat = b.dataset.p!; box.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('on', x === b)); }));
    box.querySelectorAll<HTMLElement>('[data-cards]').forEach((b) => (b.onclick = () => { SV.set.cards = +b.dataset.cards!; save(); box.querySelectorAll('[data-cards]').forEach((x) => x.classList.toggle('on', x === b)); }));
    box.querySelectorAll<HTMLElement>('[data-tempo]').forEach((b) => (b.onclick = () => { SV.set.tempo = +b.dataset.tempo!; save(); box.querySelectorAll('[data-tempo]').forEach((x) => x.classList.toggle('on', x === b)); }));
    box.querySelectorAll<HTMLElement>('[data-tog]').forEach((b) => (b.onclick = () => { const k = b.dataset.tog as 'auto' | 'hint'; SV.set[k] = !SV.set[k]; save(); b.classList.toggle('on', SV.set[k]); }));
    $('go').onclick = () => this.startShow();
  }

  /* ---------- Die Show ---------- */
  stopShow() {
    this.abort = true;
    this.playing = false;
    this.voice.stop();
    this.sfx.setMusic(false);
    this.wake?.();
    $('bingo').classList.remove('ready');
  }
  async startShow() {
    this.stopShow();
    await sleep(60);
    this.abort = false;
    this.playing = true;
    this.paused = false;
    const m = modeDef(this.mode === 'online' ? 'show' : this.mode);
    this.kind = this.onlineKind || m.kind;
    this.seed = this.mode === 'tag' ? dayNumber() * 7919 : (Date.now() ^ (Math.random() * 1e9)) >>> 0;
    const r = rng(this.seed);
    const sub = this.mode === 'online' ? this.onlineShow : this.mode;
    this.rds = rounds(sub === 'tag' ? 'show' : sub, r, this.mode === 'online' ? this.onlinePat : this.schnellPat);
    this.me.points = 0;
    this.me.wins = 0;
    this.guests.forEach((g) => { g.points = 0; g.wins = 0; });
    this.joker = 0;
    this.aiOn = this.mode === 'online' ? this.onlineAi : m.ai;
    this.studio.setKind(this.kind);
    this.studio.setTableau([], this.kind);
    $('banner').classList.remove('on');
    this.show('sGame');
    document.body.classList.toggle('tvhost', this.online && !this.hostPlays);
    this.layout();
    this.sfx.setMusic(SV.set.music);
    try {
      if (this.mode === 'blitz') await this.blitz();
      else await this.runShow();
    } catch (e) {
      if ((e as Error).message !== 'abort') console.error(e);
      return;
    }
  }
  check() {
    if (this.abort) throw new Error('abort');
  }
  async say(t: string, cut = false) {
    this.check();
    await this.voice.say(t, { cut });
    this.check();
  }
  private ncards() {
    return this.mode === 'online' ? this.onlineCards : SV.set.cards;
  }
  dealCards(p: Player, r: () => number) {
    p.cards = Array.from({ length: this.ncards() }, () => {
      const card = makeCard(this.kind, r);
      return { card, marks: card.cells.map((_, i) => this.kind === 75 && i === 12), joker: -1 };
    });
  }
  async runShow() {
    const r = rng(this.seed ^ 0x9e37);
    this.studio.shot('host');
    this.studio.host.act('wave', 2.5);
    this.sfx.jingle();
    await sleep(600);
    const hello = this.mode === 'tag' ? 'helloTag' : this.kind === 90 ? 'hello90' : this.mode === 'online' ? 'helloOnline' : 'hello';
    await this.say(line(hello));
    for (this.ri = 0; this.ri < this.rds.length; this.ri++) {
      const rd = this.rds[this.ri];
      this.pat = pattern(rd.pattern);
      if (!rd.continueDraw) {
        this.drum = new Drum(this.kind, rng(this.seed + this.ri * 101));
        this.drawn = [];
        this.drawnSet = new Set();
        this.studio.refill();
        this.studio.setTableau([], this.kind);
        if (this.hostPlays) this.dealCards(this.me, r);
        this.guests.forEach((g) => this.dealCards(g, r));
      }
      this.bots = this.aiOn ? makeBots(this.mode === 'online' ? 6 : 10, this.kind, this.drum!.order, this.pat, this.seed + this.ri) : [];
      this.claims = [];
      this.saidNear = this.saidMe = false;
      this.cur = this.hostPlays ? [0, this.kind === 75 ? 6 : this.me.cards[0]?.card.cells.findIndex((n) => n > 0) ?? 0] : null;
      if (this.joker > 0 && this.hostPlays) this.toast('🍀 Du hast eine Glückskugel: Tippe auf 🍀 und dann auf ein Feld deiner Wahl.', 4500);
      this.renderGame();
      this.sendRound();
      this.studio.setScreen(rd.name, this.pat.name);
      this.studio.shot('host');
      this.studio.host.act('present', 3);
      if (!rd.continueDraw || this.ri === 0) await this.say(line('round', { round: rd.name, pattern: this.pat.name, rule: this.pat.rule }));
      else await this.say(line('stage90'));
      if (rd.jackpot && this.kind === 75) await this.say(line('finale', { j: rd.jackpot }));
      this.studio.shot('drum');
      if (this.drawn.length === 0) await this.say(line('first'));
      const win = await this.drawLoop(rd);
      await this.resolveRound(rd, win);
      if (this.mode !== 'schnell' && this.sub() === 'show' && this.ri < 2) await this.studioGame();
    }
    await this.finishShow();
  }
  sub() {
    return this.mode === 'online' ? this.onlineShow : this.mode === 'tag' ? 'show' : this.mode;
  }
  /** Zieht Kugeln, bis jemand ein gültiges Bingo hat (Mensch) oder ein Bot ruft; liefert die Gewinner */
  async drawLoop(rd: RoundDef): Promise<{ humans: string[]; bot: Bot | null; missed: boolean }> {
    let botAt = 0,
      botWin: Bot | null = null;
    const tempo = TEMPO[SV.set.tempo]?.ms ?? 2600;
    for (;;) {
      this.check();
      while (this.paused) {
        await sleep(200);
        this.check();
      }
      const n = this.drum!.next();
      if (!n) {
        await this.say(line('empty'));
        return { humans: [], bot: null, missed: false };
      }
      this.drawn.push(n);
      this.drawnSet.add(n);
      this.studio.shot('drum');
      this.sfx.whoosh(1.2);
      if (this.online) this.net.send({ t: 'pre', n });
      const anim = this.studio.drawBall(n, 1.7);
      setTimeout(() => !this.abort && this.studio.shot('ball'), 650);
      await anim;
      this.check();
      this.sfx.pop();
      this.drawAt = performance.now();
      this.studio.setTableau(this.drawn, this.kind, n);
      this.studio.setScreen('', `${rd.name} · ${this.pat.name} · Kugel ${this.drawn.length}`, n);
      if (SV.set.auto) this.me.cards.forEach((cs) => cs.card.cells.forEach((x, i) => { if (x === n) cs.marks[i] = true; }));
      this.renderGame();
      if (this.online) this.net.send({ t: 'ball', n, k: this.drawn.length });
      // Bots: wer jetzt fertig ist, ruft nach seiner Reaktionszeit
      if (!botWin) {
        const done = this.bots.filter((b) => b.done === this.drawn.length - 1).sort((a, b) => a.react - b.react)[0];
        if (done) {
          botWin = done;
          botAt = performance.now() + done.react * 1000;
        }
      }
      const speech = this.say(callText(n, this.kind));
      // Spannung
      const near = this.aiOn ? botsNear(this.bots, this.drawn, this.pat) : 0,
        myNear = this.me.cards.some((cs) => missing(cs.card, marksFrom(cs.card, this.drawnSet), this.pat) === 1);
      const tension = !this.saidMe && myNear && this.hostPlays ? line('meNear') : !this.saidNear && near > 0 && !botWin ? (near > 2 ? line('nearN', { n: near }) : line('near1')) : '';
      if (this.drawn.length === Math.floor(this.kind / 2)) this.toast('⏳ ' + line('half'));
      const deadline = performance.now() + tempo;
      await this.waitUntil(() => this.claims.length > 0 || (botWin != null && performance.now() >= botAt), Math.max(0, deadline - performance.now()), speech);
      if (tension && !this.claims.length) {
        if (myNear) this.saidMe = true;
        else this.saidNear = true;
        this.sfx.near();
        this.studio.shot('host');
        await this.say(tension);
      }
      if (rd.jackpot && this.drawn.length === rd.jackpot + 1 && !this.claims.length) await this.say(line('jackpotGone'));
      // Rufe auswerten (kurzes Zeitfenster für Mitgewinner)
      if (this.claims.length) {
        await sleep(900);
        const humans = [...new Set(this.claims.map((c) => c.pid))];
        this.claims = [];
        const botAlso = botWin && botWin.done <= this.drawn.length - 1 ? botWin : null;
        return { humans, bot: botAlso, missed: false };
      }
      if (botWin && performance.now() >= botAt) {
        const missed = this.me.cards.some((cs) => missing(cs.card, marksFrom(cs.card, this.drawnSet), this.pat) === 0) && this.hostPlays;
        return { humans: [], bot: botWin, missed };
      }
    }
  }
  /** Wartet höchstens ms (und mindestens bis die Ansage fertig ist), bricht bei einem Bingo-Ruf sofort ab */
  async waitUntil(cond: () => boolean, ms: number, also?: Promise<void>) {
    const end = performance.now() + ms;
    let spoke = !also;
    also?.then(() => (spoke = true));
    while (!cond() && (performance.now() < end || !spoke)) {
      await new Promise<void>((r) => {
        this.wake = r;
        setTimeout(r, 120);
      });
      this.check();
    }
  }
  /** Bingo-Ruf eines Spielers prüfen (pid 'me' oder Gast-ID) */
  claim(pid: string, ci: number, marks?: boolean[], jokerCell?: number) {
    if (!this.playing || this.mode === 'blitz') return;
    const p = pid === 'me' ? this.me : this.guests.get(pid);
    if (!p) return;
    if (pid === 'me' && performance.now() < this.lockUntil) return;
    const cs = p.cards[ci];
    if (!cs) return;
    const mk = marks || cs.marks,
      drawn = new Set(this.drawn);
    const jc = jokerCell ?? cs.joker;
    if (jc >= 0) drawn.add(cs.card.cells[jc]);
    const ok = validClaim(cs.card, mk, drawn, this.pat);
    if (ok) {
      if (!this.claims.some((c) => c.pid === pid)) this.claims.push({ pid, ci, t: performance.now() });
      this.wake?.();
    } else {
      if (pid === 'me') {
        this.lockUntil = performance.now() + 2500;
        this.me.points = Math.max(0, this.me.points - 50);
        this.sfx.wrong();
        this.toast('❌ Noch kein Bingo – 50 Punkte Abzug. Schau genau hin!', 3000);
        this.voice.say(line('falseBingo'), { cut: true });
        this.renderHud();
      } else this.net.send({ t: 'false' }, pid);
    }
  }
  async resolveRound(rd: RoundDef, win: { humans: string[]; bot: Bot | null; missed: boolean }) {
    const balls = this.drawn.length;
    this.studio.shot('host');
    $('bingo').classList.remove('ready');
    if (win.humans.length) {
      const pr = prize(rd, balls, this.kind),
        names: string[] = [];
      for (const pid of win.humans) {
        const p = pid === 'me' ? this.me : this.guests.get(pid);
        if (!p) continue;
        p.points += pr.points;
        p.wins++;
        names.push(p.name);
        if (pid !== 'me') this.net.send({ t: 'won', points: pr.points, jackpot: pr.jackpot }, pid);
      }
      this.studio.celebrate(pr.jackpot);
      this.sfx.bingo(pr.jackpot);
      this.bigBanner(pr.jackpot ? '💰 JACKPOT!' : 'BINGO!', `${names.join(' & ')} · +${pr.points} Punkte · ${balls} Kugeln`);
      if (this.online) this.net.send({ t: 'win', names, points: pr.points, jackpot: pr.jackpot });
      const meWon = win.humans.includes('me');
      if (pr.jackpot && meWon) SV.jackpots++;
      if (meWon) SV.wins++;
      save();
      if (meWon && win.humans.length === 1) await this.say(line('youWin'));
      else if (win.humans.length > 1) await this.say(line('shared'));
      else await this.say(line('guestWin', { name: names[0] }));
      if (pr.jackpot) await this.say(line('jackpot'));
    } else if (win.bot) {
      this.studio.celebrate(false);
      this.sfx.applause(2.4);
      this.bigBanner('BINGO im Studio', `${win.bot.name} aus ${win.bot.town} · ${balls} Kugeln`);
      if (this.online) this.net.send({ t: 'win', names: [win.bot.name + ' (Studio)'], points: 0, jackpot: false });
      await this.say(line('botWin', { name: win.bot.name, town: win.bot.town }));
      if (win.missed) await this.say(line('tooSlow', { name: win.bot.name }));
    }
    this.renderHud();
    await sleep(1200);
    this.check();
  }
  bigBanner(t: string, s: string) {
    const b = $('banner');
    b.innerHTML = `<b>${esc(t)}</b><small>${esc(s)}</small>`;
    b.classList.remove('on');
    void b.offsetWidth;
    b.classList.add('on');
    b.onanimationend = () => b.classList.remove('on');
  }
  /** Studio-Spiel „Höher oder Tiefer“: dreimal tippen, ob die nächste Kugel höher oder tiefer ist – dreimal richtig = Glückskugel */
  async studioGame() {
    this.check();
    const r = rng(this.seed ^ (this.ri * 7777 + 31));
    let n = this.drawn[this.drawn.length - 1] || 38;
    this.studio.shot('host');
    this.me.hl = 0;
    this.guests.forEach((g) => (g.hl = 0));
    await this.say(line('studioIntro', { n }));
    for (let k = 0; k < 3; k++) {
      this.check();
      let next = n;
      while (next === n) next = 1 + Math.floor(r() * 75);
      const picks = new Map<string, 'h' | 't'>();
      this.hlPick = (pid, v) => picks.set(pid, v);
      if (this.online) this.net.send({ t: 'hl', n, k });
      const showPick = this.hostPlays;
      if (showPick)
        this.ov(
          `<h3>🎲 Höher oder Tiefer? <small>(${k + 1}/3)</small></h3><div class="hlBall">${n}</div><p class="hint">Kommt die nächste Kugel höher oder tiefer als die ${n}?</p><div class="row hlRow"><button class="btn xl nav" data-act="h" data-focus>▲ Höher</button><button class="btn xl nav" data-act="t">▼ Tiefer</button></div><p class="hint" id="hlTime"></p>`,
          { h: () => { picks.set('me', 'h'); this.closeOv(); }, t: () => { picks.set('me', 't'); this.closeOv(); } },
          () => this.pause(),
        );
      const end = performance.now() + 9000;
      while (performance.now() < end) {
        await sleep(150);
        this.check();
        const need = (showPick ? 1 : 0) + this.guests.size;
        if (picks.size >= need) break;
        const el = document.getElementById('hlTime');
        if (el) el.textContent = '⏱️ ' + Math.ceil((end - performance.now()) / 1000);
      }
      if (!$('ov').hidden) this.closeOv();
      const truth: 'h' | 't' = next > n ? 'h' : 't';
      this.studio.setScreen('', `Höher oder Tiefer · ${k + 1}/3`, next);
      this.sfx.pop();
      const res: Record<string, boolean> = {};
      picks.forEach((v, pid) => {
        res[pid] = v === truth;
        const p = pid === 'me' ? this.me : this.guests.get(pid);
        if (p && v === truth) {
          p.hl++;
          p.points += 100;
        }
      });
      if (this.online) this.net.send({ t: 'hlr', next, res });
      const mine = picks.get('me');
      await this.say(`${next}! ` + (showPick ? (mine === truth ? line('hlRight') + ' Plus hundert Punkte.' : line('hlWrong')) : next > n ? 'Höher!' : 'Tiefer!'));
      this.renderHud();
      n = next;
    }
    this.hlPick = null;
    if (this.me.hl === 3 && this.hostPlays) {
      this.joker++;
      this.sfx.bingo(false);
      await this.say(line('hlGold'));
    }
    this.guests.forEach((g, id) => { if (g.hl === 3) this.net.send({ t: 'joker' }, id); });
  }
  hlPick: ((pid: string, v: 'h' | 't') => void) | null = null;

  /* ---------- Blitz-Bingo ---------- */
  async blitz() {
    const r = rng(this.seed);
    this.pat = PATTERNS.voll;
    this.rds = [{ pattern: 'voll', name: 'Blitz-Bingo', prize: 0 }];
    this.ri = 0;
    this.drum = new Drum(75, r);
    this.drawn = [];
    this.drawnSet = new Set();
    this.dealCards(this.me, r);
    this.blitzScore = 0;
    this.blitzGot = new Set();
    this.cur = [0, 6];
    this.renderGame();
    this.studio.shot('host');
    this.sfx.jingle();
    await this.say(line('helloBlitz'));
    for (const c of ['3', '2', '1']) {
      this.bigBanner(c, 'Gleich gehts los');
      this.sfx.tick();
      await sleep(700);
      this.check();
    }
    this.studio.shot('drum');
    const end = performance.now() + 60000;
    while (performance.now() < end && this.drum.left > 0) {
      this.check();
      while (this.paused) {
        await sleep(200);
        this.check();
      }
      const n = this.drum.next();
      this.drawn.push(n);
      this.drawnSet.add(n);
      this.studio.drawBall(n, 0.75);
      this.sfx.pop();
      this.drawAt = performance.now();
      this.studio.setTableau(this.drawn, 75, n);
      this.studio.setScreen('', `Blitz-Bingo · noch ${Math.ceil((end - performance.now()) / 1000)} s`, n);
      this.renderGame();
      await sleep(1000);
    }
    this.blitzCheck();
    this.sfx.bingo(false);
    await this.say(line('blitzEnd'));
    this.me.points = this.blitzScore;
    await this.finishShow();
  }
  /** Blitz: neue Muster auf den Karten zählen sofort (Linie 100, Ecken 150, X 300, volle Karte 1000) */
  blitzCheck() {
    const PR: [string, number][] = [['linie', 100], ['ecken', 150], ['kreuz', 300], ['voll', 1000]];
    this.me.cards.forEach((cs, ci) => {
      const real = marksFrom(cs.card, this.drawnSet).map((v, i) => v && cs.marks[i]);
      for (const [pid, pts] of PR) {
        const k = ci + ':' + pid;
        if (!this.blitzGot.has(k) && missing(cs.card, real, pattern(pid)) === 0) {
          this.blitzGot.add(k);
          this.blitzScore += pts;
          this.sfx.bingo(false);
          this.bigBanner(`+${pts}`, `${pattern(pid).name} auf Karte ${ci + 1}`);
        }
      }
    });
    this.renderHud();
  }

  async finishShow() {
    this.playing = false;
    this.sfx.setMusic(false);
    $('bingo').classList.remove('ready');
    const pts = this.me.points;
    if (this.hostPlays && this.mode !== 'online') {
      SV.total += pts;
      SV.best = Math.max(SV.best, pts);
      SV.shows++;
      if (this.mode === 'tag') {
        const d = dayNumber();
        if (SV.dailyDay !== d) { SV.dailyDay = d; SV.dailyBest = 0; }
        SV.dailyBest = Math.max(SV.dailyBest, pts);
        SV.dailyBoard = d * 100000 + Math.min(99999, SV.dailyBest);
      }
      save();
    }
    const ranking = [...(this.hostPlays ? [this.me] : []), ...this.guests.values()].sort((a, b) => b.points - a.points);
    if (this.online) this.net.send({ t: 'end', rank: ranking.map((p) => ({ name: p.name, points: p.points, id: p.id })) });
    this.studio.shot('wide');
    this.studio.celebrate(false);
    this.show('sResult');
    $('resBox').innerHTML = `<header class="hd"><span></span><h2>🏆 Showende</h2><span></span></header>
      <div class="resTop"><div class="score">${pts}</div><p>${this.mode === 'blitz' ? 'Punkte im Blitz-Bingo' : 'Punkte in dieser Show'}${pts > 0 && pts >= SV.best && this.mode !== 'online' ? ' · 🆕 Bestwert!' : ''}</p></div>
      ${ranking.length > 1 ? `<ol class="rank">${ranking.map((p) => `<li><b>${esc(p.name)}</b><span>${p.points} Punkte · ${p.wins}× Bingo</span></li>`).join('')}</ol>` : ''}
      <p class="hint">Gesamt: ${SV.total} Punkte · ${SV.wins}× Bingo · 💰 ${SV.jackpots} Jackpots${this.mode === 'tag' ? ' · Tages-Show heute: ' + SV.dailyBest : ''}</p>
      <div class="row end"><button class="btn nav" id="rMenu">☰ Menü</button><button class="btn gold nav" id="rAgain" data-focus>🔁 Nochmal</button></div>`;
    $('rMenu').onclick = () => this.menu();
    $('rAgain').onclick = () => (this.mode === 'online' ? this.lobby(true) : this.startShow());
    await this.voice.say(line('bye'));
  }

  /* ---------- Spielansicht ---------- */
  missingOf(cs: CardState): number {
    const real = marksFrom(cs.card, this.drawnSet).map((v, i) => (v && cs.marks[i]) || i === cs.joker);
    if (cs.card.kind === 75) real[12] = true;
    return missing(cs.card, real, this.pat);
  }
  renderGame() {
    const cards = this.me.cards,
      el = $('cards');
    if (!this.hostPlays && !this.guestMode) {
      el.innerHTML = '';
    } else renderCards(el, cards, this.drawnSet, this.pat, { hint: SV.set.hint, cur: coarse() ? null : this.cur, missing: cards.map((cs) => this.missingOf(cs)) });
    el.querySelectorAll<HTMLElement>('.cell[data-i]').forEach((b) => (b.onclick = () => this.tapCell(+b.dataset.c!, +b.dataset.i!)));
    this.renderHud();
  }
  renderHud() {
    const rd = this.rds[this.ri],
      last = this.drawn.slice(-5).reverse();
    $('hudRound').textContent = rd ? rd.name : '';
    $('hudPat').innerHTML = this.pat ? `${patternMini(this.pat)}<span>${this.pat.name}</span>` : '';
    $('hudBalls').textContent = `${this.drawn.length} Kugeln`;
    $('hudJack').textContent = rd?.jackpot && this.mode !== 'blitz' ? (this.drawn.length <= rd.jackpot ? `💰 Jackpot bis Kugel ${rd.jackpot}` : '💰 Jackpot vorbei') : '';
    $('hudPts').textContent = `${this.mode === 'blitz' ? this.blitzScore : this.me.points} Punkte`;
    $('last').innerHTML = last.map((n, i) => `<span class="lb${i === 0 ? ' new' : ''}" style="--c:${ballColorCss(n, this.kind)}">${n}</span>`).join('');
    const ready = this.me.cards.some((cs) => this.missingOf(cs) === 0) && this.mode !== 'blitz';
    $('bingo').classList.toggle('ready', ready && SV.set.hint);
    $('bingo').hidden = this.mode === 'blitz' || (!this.hostPlays && !this.guestMode);
    $('joker').hidden = !(this.joker > 0 && (this.hostPlays || this.guestMode) && this.mode !== 'blitz');
    $('joker').classList.toggle('on', this.jokerArm);
  }
  tapCell(ci: number, i: number) {
    const cs = this.me.cards[ci];
    if (!cs || (this.kind === 75 && i === 12)) return;
    this.cur = [ci, i];
    const n = cs.card.cells[i];
    if (this.jokerArm && this.joker > 0) {
      cs.joker = i;
      cs.marks[i] = true;
      this.joker--;
      this.jokerArm = false;
      this.sfx.bingo(false);
      this.toast('🍀 Glückskugel gesetzt!');
      this.renderGame();
      return;
    }
    if (!this.drawnSet.has(n) && !cs.marks[i]) {
      this.sfx.wrong();
      this.toast(`Die ${n} wurde noch nicht gezogen.`, 1400);
      return;
    }
    cs.marks[i] = !cs.marks[i] || cs.joker === i;
    if (cs.marks[i]) {
      this.sfx.dab();
      if (this.mode === 'blitz' && performance.now() - this.drawAt < 1500 && this.drawn[this.drawn.length - 1] === n) this.blitzScore += 10;
    }
    if (this.mode === 'blitz') this.blitzCheck();
    this.renderGame();
    if (this.guestMode) this.renderHud();
  }
  bingo() {
    if (this.guestMode) return this.guestBingo();
    if (!this.playing) return;
    const ci = this.me.cards.findIndex((cs) => this.missingOf(cs) === 0);
    this.claim('me', ci < 0 ? (this.cur?.[0] ?? 0) : ci);
  }

  /* ---------- Steuerung: Tastatur und Gamecontroller (über ../gamepad.js) ---------- */
  bindKeys() {
    $('bingo').onclick = () => this.bingo();
    $('joker').onclick = () => { this.jokerArm = !this.jokerArm; this.renderHud(); if (this.jokerArm) this.toast('🍀 Tippe jetzt auf ein Feld deiner Karte.'); };
    $('hudMenu').onclick = () => this.pause();
    $('ov').addEventListener('click', (e) => { if ((e.target as HTMLElement).id === 'ov') this.ovEsc?.(); });
    $('sTitle').addEventListener('click', (e) => { if (!(e.target as HTMLElement).closest('a,button')) $('bPress').click(); });
    addEventListener('keydown', (e) => {
      const t = e.target as HTMLElement,
        typing = t && (t.tagName === 'INPUT' && (t as HTMLInputElement).type !== 'range' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
      if (e.code === 'Escape') {
        e.preventDefault();
        if (!$('ov').hidden) return this.ovEsc?.();
        if (typing) return t.blur();
        if (this.scr === 'sGame') return this.pause();
        if (['sSetup', 'sResult', 'sOnline'].includes(this.scr)) return this.menu();
        if (this.scr === 'sMenu') return this.title();
        return;
      }
      if (typing) return;
      if (this.scr === 'sTitle' && (e.code === 'Enter' || e.code === 'Space')) { e.preventDefault(); $('bPress').click(); return; }
      if (this.scr === 'sGame' && $('ov').hidden) {
        if (e.code === 'KeyB' || e.code === 'Space') { e.preventDefault(); this.bingo(); return; }
        if (e.code === 'KeyJ' && !$('joker').hidden) { $('joker').click(); return; }
        const cs = this.me.cards;
        if (!cs.length) return;
        if (!this.cur) this.cur = [0, this.kind === 75 ? 6 : 0];
        const W = this.kind === 75 ? 5 : 9,
          H = this.kind === 75 ? 5 : 3;
        let [ci, i] = this.cur;
        const mv: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (mv[e.code]) {
          e.preventDefault();
          let x = (i % W) + mv[e.code][0],
            y = Math.floor(i / W) + mv[e.code][1];
          if (x < 0) { if (ci > 0) { ci--; x = W - 1; } else x = 0; }
          if (x >= W) { if (ci < cs.length - 1) { ci++; x = 0; } else x = W - 1; }
          y = Math.max(0, Math.min(H - 1, y));
          this.cur = [ci, y * W + x];
          this.renderGame();
          document.querySelector(`.card[data-card="${ci}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
          return;
        }
        if (e.code === 'KeyQ' || e.code === 'KeyE') { ci = Math.max(0, Math.min(cs.length - 1, ci + (e.code === 'KeyE' ? 1 : -1))); this.cur = [ci, i]; this.renderGame(); return; }
        if (e.code === 'Enter') { e.preventDefault(); this.tapCell(ci, i); return; }
        return;
      }
      const d = ({ ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] } as Record<string, number[]>)[e.code];
      if (d) { e.preventDefault(); this.navMove(d[0], d[1]); }
    });
  }
  navMove(dx: number, dy: number) {
    const root = !$('ov').hidden ? $('ovBox') : $(this.scr),
      els = Array.from(root.querySelectorAll<HTMLElement>('.nav, .mi')).filter((x) => !(x as HTMLButtonElement).disabled && x.offsetParent !== null);
    if (!els.length) return;
    const a = document.activeElement as HTMLElement;
    if (!els.includes(a)) return els[0].focus();
    const r = a.getBoundingClientRect(),
      ax = r.left + r.width / 2,
      ay = r.top + r.height / 2;
    let best: HTMLElement | null = null,
      bd = 1e9;
    for (const e of els) {
      if (e === a) continue;
      const q = e.getBoundingClientRect(),
        x = q.left + q.width / 2 - ax,
        y = q.top + q.height / 2 - ay,
        along = x * dx + y * dy;
      if (along <= 2) continue;
      const dd = along + Math.abs(x * dy + y * dx) * 2.2;
      if (dd < bd) { bd = dd; best = e; }
    }
    if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
  }
  pause() {
    if (this.scr !== 'sGame') return;
    this.paused = true;
    this.voice.stop();
    this.ov(
      `<h3>⏸️ Pause</h3><p class="hint">${this.guestMode ? 'Die Show läuft beim Gastgeber weiter.' : 'Die Trommel wartet auf dich.'}</p><div class="exp"><button class="btn gold nav" data-act="go" data-focus>▶ Weiter</button><button class="btn nav" data-act="opts">⚙️ Einstellungen</button><button class="btn nav" data-act="help">❓ So geht’s</button><button class="btn red nav" data-act="quit">⏹ Show beenden</button></div>`,
      { go: () => { this.paused = false; this.closeOv(); }, opts: () => this.settings(true), help: () => this.help(true), quit: () => { this.paused = false; this.closeOv(); this.menu(); } },
      () => { this.paused = false; this.closeOv(); },
    );
  }

  /* ---------- Einstellungen & Anleitung ---------- */
  settings(inGame = false) {
    const vs = this.voice.list();
    this.ov(
      `<h3>⚙️ Einstellungen</h3>
      <p class="lbl">🎙️ Moderator-Stimme</p><div class="chips"><button class="chip nav${SV.set.voiceOn ? ' on' : ''}" data-act="voiceOn">Moderation ${SV.set.voiceOn ? 'an' : 'aus'}</button><button class="chip nav" data-act="test">▶ Probe hören</button></div>
      <select class="nav" id="oVoice" aria-label="Stimme"><option value="">Automatisch (beste Stimme)</option>${vs.map((v) => `<option value="${esc(v.id)}"${v.id === SV.set.voice ? ' selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
      ${vs.length ? '' : `<p class="hint">${this.voice.available ? 'Dein Gerät meldet noch keine Stimmen – kurz warten oder in den Systemeinstellungen eine deutsche Sprachausgabe installieren.' : 'Dieser Browser kann nicht sprechen – die Ansagen erscheinen als Untertitel.'}</p>`}
      <p class="lbl">Sprechtempo: <b id="oRateV">${SV.set.rate.toFixed(2)}×</b></p><input type="range" class="nav" id="oRate" min="0.75" max="1.4" step="0.05" value="${SV.set.rate}">
      <p class="lbl">🔊 Effekte: <b id="oSfxV">${Math.round(SV.set.sfx * 100)} %</b></p><input type="range" class="nav" id="oSfx" min="0" max="1" step="0.05" value="${SV.set.sfx}">
      <div class="chips"><button class="chip nav${SV.set.music ? ' on' : ''}" data-act="music">🎵 Studiomusik</button><button class="chip nav${SV.set.auto ? ' on' : ''}" data-act="auto">🤖 Auto-Markieren</button><button class="chip nav${SV.set.hint ? ' on' : ''}" data-act="hint">💡 Hilfe</button><button class="chip nav${SV.set.guestVoice ? ' on' : ''}" data-act="guestVoice">📱 Moderation als Mitspieler</button></div>
      <p class="lbl">Grafik</p><div class="chips">${[['-1', 'Automatisch'], ['1', 'Hoch'], ['0', 'Sparsam']].map(([v, n]) => `<button class="chip nav${String(SV.set.quality) === v ? ' on' : ''}" data-act="q${v}">${n}</button>`).join('')}</div>
      <p class="hint">Grafik wird beim nächsten Start übernommen. In der App spricht Rico mit der Android-Sprachausgabe, im Browser mit den Stimmen deines Systems.</p>
      <button class="btn gold nav" data-act="x" data-focus>Fertig</button>`,
      {
        x: () => (inGame ? this.pause() : this.closeOv()),
        voiceOn: (b) => { SV.set.voiceOn = !SV.set.voiceOn; this.voice.on = SV.set.voiceOn; save(); b.classList.toggle('on', SV.set.voiceOn); b.textContent = 'Moderation ' + (SV.set.voiceOn ? 'an' : 'aus'); if (!SV.set.voiceOn) this.voice.stop(); },
        test: () => { const on = this.voice.on; this.voice.on = true; this.voice.test().then(() => (this.voice.on = on)); },
        music: (b) => { SV.set.music = !SV.set.music; save(); b.classList.toggle('on', SV.set.music); if (this.playing) this.sfx.setMusic(SV.set.music); },
        auto: (b) => { SV.set.auto = !SV.set.auto; save(); b.classList.toggle('on', SV.set.auto); },
        hint: (b) => { SV.set.hint = !SV.set.hint; save(); b.classList.toggle('on', SV.set.hint); },
        guestVoice: (b) => { SV.set.guestVoice = !SV.set.guestVoice; save(); b.classList.toggle('on', SV.set.guestVoice); },
        'q-1': () => this.setQ(-1),
        q1: () => this.setQ(1),
        q0: () => this.setQ(0),
      },
      inGame ? () => this.pause() : undefined,
    );
    const v = $('oVoice') as HTMLSelectElement;
    v.onchange = () => { SV.set.voice = v.value; this.voice.pick = v.value; save(); this.voice.test(); };
    const rr = $('oRate') as HTMLInputElement;
    rr.oninput = () => { SV.set.rate = +rr.value; this.voice.rate = SV.set.rate; $('oRateV').textContent = SV.set.rate.toFixed(2) + '×'; save(); };
    const sf = $('oSfx') as HTMLInputElement;
    sf.oninput = () => { SV.set.sfx = +sf.value; this.sfx.setVol(SV.set.sfx); $('oSfxV').textContent = Math.round(SV.set.sfx * 100) + ' %'; save(); };
  }
  setQ(v: number) {
    SV.set.quality = v;
    save();
    $('ovBox').querySelectorAll('[data-act^="q"]').forEach((b) => b.classList.toggle('on', (b as HTMLElement).dataset.act === 'q' + v));
  }
  help(inGame = false) {
    this.ov(
      `<h3>❓ So geht’s</h3><div class="help">
      <p><b>Bingo!</b> Rico zieht Kugeln aus der Trommel und sagt sie an. Hast du die Zahl auf deiner Karte, tippe sie an. Ist das gesuchte <b>Muster</b> (oben angezeigt) komplett, drück schnell <b>BINGO!</b> – aber nur dann: ein falscher Ruf kostet 50 Punkte.</p>
      <p><b>Karten:</b> 75 Kugeln mit den Spalten B (1–15), I (16–30), N (31–45), G (46–60), O (61–75) und freier Mitte. Bei Klassik 90 hat jede Karte drei Reihen mit je fünf Zahlen.</p>
      <p><b>Muster:</b> Linie (waagerecht, senkrecht, diagonal), zwei Linien, vier Ecken, großes X, Plus, Bilderrahmen, Funkmast, Herz, kleines Quadrat und die volle Karte.</p>
      <p><b>Das Studio spielt mit:</b> Zehn Kandidaten im Studio hoffen auch auf ihr Bingo – wer zuerst richtig ruft, gewinnt. Je früher dein Bingo, desto mehr Punkte. Im Finale gibt es den <b>Jackpot</b>, wenn die volle Karte innerhalb der Jackpot-Grenze kommt.</p>
      <p><b>Höher oder Tiefer:</b> Zwischen den Runden der großen Show tippst du dreimal, ob die nächste Kugel höher oder tiefer ist. Dreimal richtig = 🍀 Glückskugel: ein Feld deiner Wahl in der nächsten Runde.</p>
      <p><b>Steuerung:</b> Touch/Maus: Zahl antippen, BINGO-Knopf. Tastatur: Pfeile wählen ein Feld, Enter markiert, B oder Leertaste = Bingo, Q/E = Karte wechseln, J = Glückskugel, Esc = Pause. Gamecontroller: Steuerkreuz, Ⓐ markieren, Ⓧ Bingo, LB/RB Karte, Ⓨ Glückskugel, Ⓑ Pause.</p>
      <p><b>🌐 Online & Handys:</b> Im Menü „Online & Handys“ eröffnest du einen Bingo-Abend. Mitspieler treten per Link, Code oder QR-Code von überall bei. Der Fernseher kann die Show zeigen (Link „📺 Fernseher“), die Karten liegen auf den Handys.</p></div>
      <button class="btn gold nav" data-act="x" data-focus>Verstanden</button>`,
      { x: () => (inGame ? this.pause() : this.closeOv()) },
      inGame ? () => this.pause() : undefined,
    );
  }

  /* ---------- Online & Handys: Gastgeber ---------- */
  onlineShow: ModeId = 'show';
  onlinePat = 'linie';
  onlineCards = 2;
  onlineAi = true;
  onlineKind: Kind | 0 = 0;
  async lobby(keep = false) {
    this.stopShow();
    this.mode = 'online';
    this.online = true;
    this.hostPlays = !IS_TV;
    this.show('sOnline');
    this.studio.shot('wide');
    const render = () => {
      const ps = [...this.guests.values()];
      $('onlineBox').innerHTML = `<header class="hd"><button class="btn sm nav" data-back>←</button><h2>🌐 Online & Handys</h2><span></span></header>
        <p class="lead">Mitspieler können per Link, Code oder QR-Code <b>von überall</b> beitreten – mit Handy, Tablet oder Computer. ${IS_TV ? 'Dieser Fernseher zeigt die Show, die Karten liegen auf den Handys.' : 'Du spielst hier mit, oder öffne die Show auf dem Fernseher.'}</p>
        <div class="lobby"><div class="qrBox"><div id="qr" class="qr">⏳</div><div class="code" id="code">${this.net.code || '····'}</div><a id="url" class="url" target="_blank" rel="noopener">${this.net.code ? esc(this.net.link()) : 'Verbinde …'}</a><p class="hint" id="lobbyMsg"></p></div>
        <div class="lobOpts"><h3>Mitspieler (${ps.length})</h3><ul class="plist">${!IS_TV ? `<li>🎙️ Du (Gastgeber)</li>` : ''}${ps.map((p) => `<li>📱 ${esc(p.name)}</li>`).join('') || '<li class="hint">Noch niemand da – QR-Code scannen lassen!</li>'}</ul>
        <h3>Show</h3><div class="chips">${[['show', '🎬 Große Show'], ['schnell', '🎯 Schnell'], ['neunzig', '🎡 Klassik 90']].map(([k, n]) => `<button class="chip nav${this.onlineShow === k ? ' on' : ''}" data-os="${k}">${n}</button>`).join('')}</div>
        ${this.onlineShow === 'schnell' ? `<div class="chips pats">${SCHNELL_PATTERNS.map((k) => `<button class="chip nav pchip${k === this.onlinePat ? ' on' : ''}" data-op="${k}">${patternMini(PATTERNS[k])}<span>${PATTERNS[k].short}</span></button>`).join('')}</div>` : ''}
        <div class="chips">${[1, 2, 3, 4].map((n) => `<button class="chip nav${this.onlineCards === n ? ' on' : ''}" data-oc="${n}">${n} ${n === 1 ? 'Karte' : 'Karten'}</button>`).join('')}<button class="chip nav${this.onlineAi ? ' on' : ''}" data-oai="1">👥 Studio-Publikum</button></div>
        <div class="row end">${!IS_TV ? '<button class="btn nav" id="tvBtn">📺 Fernseher-Link</button>' : ''}<button class="btn gold xl nav" id="oStart" data-focus>🎬 Show starten</button></div></div></div>`;
      const box = $('onlineBox');
      (box.querySelector('[data-back]') as HTMLElement).onclick = () => this.menu();
      box.querySelectorAll<HTMLElement>('[data-os]').forEach((b) => (b.onclick = () => { this.onlineShow = b.dataset.os as ModeId; render(); }));
      box.querySelectorAll<HTMLElement>('[data-op]').forEach((b) => (b.onclick = () => { this.onlinePat = b.dataset.op!; render(); }));
      box.querySelectorAll<HTMLElement>('[data-oc]').forEach((b) => (b.onclick = () => { this.onlineCards = +b.dataset.oc!; render(); }));
      box.querySelectorAll<HTMLElement>('[data-oai]').forEach((b) => (b.onclick = () => { this.onlineAi = !this.onlineAi; render(); }));
      const tv = document.getElementById('tvBtn');
      if (tv) tv.onclick = () => this.ov(`<h3>📺 Show auf dem Fernseher</h3><p>Öffne diesen Link im Browser des Fernsehers (oder am PC am Beamer). Dort erscheint der QR-Code für alle Handys:</p><p class="url">${esc(this.net.tvLink())}</p><button class="btn gold nav" data-act="x" data-focus>OK</button>`, { x: () => this.closeOv() });
      $('oStart').onclick = () => this.hostStart();
      if (this.net.code) this.drawQR();
    };
    this.lobbyRender = render;
    if (!keep || this.net.role !== 'host') {
      this.guests.clear();
      render();
      this.net.onMsg = (m, from) => this.hostMsg(m, from);
      this.net.onJoin = () => {};
      this.net.onLeave = (id) => { const g = this.guests.get(id); this.guests.delete(id); if (g) this.toast('👋 ' + g.name + ' hat die Show verlassen'); if (this.scr === 'sOnline') render(); };
      try {
        await this.net.host();
        render();
        $('lobbyMsg').textContent = 'Freunde & Handys: QR-Code scannen oder Code eingeben – von überall!';
      } catch (e) {
        $('lobbyMsg').textContent = netError(e);
      }
    } else render();
  }
  lobbyRender: (() => void) | null = null;
  async drawQR() {
    try {
      await loadQR();
      const q = (window as unknown as { qrcode: (t: number, l: string) => { addData(s: string): void; make(): void; createSvgTag(o: object): string } }).qrcode(0, 'M');
      q.addData(this.net.link());
      q.make();
      const el = document.getElementById('qr');
      if (el) el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      const u = document.getElementById('url') as HTMLAnchorElement | null;
      if (u) { u.textContent = this.net.link(); u.href = this.net.link(); }
    } catch {
      /* ohne QR */
    }
  }
  hostStart() {
    if (!this.net.code) return this.toast('Noch keine Verbindung – einen Moment …');
    if (!this.hostPlays && !this.guests.size) return this.toast('Warte, bis mindestens ein Handy beigetreten ist.');
    this.onlineKind = this.onlineShow === 'neunzig' ? 90 : 75;
    this.net.send({ t: 'start', kind: this.onlineKind, show: this.onlineShow, tv: IS_TV });
    this.startShow();
  }
  sendRound() {
    if (!this.online) return;
    const rd = this.rds[this.ri];
    this.guests.forEach((g, id) => this.net.send({ t: 'round', ri: this.ri, name: rd.name, pattern: rd.pattern, jackpot: rd.jackpot || 0, kind: this.kind, cards: rd.continueDraw ? null : g.cards.map((c) => c.card), drawn: this.drawn }, id));
  }
  hostMsg(m: { t: string; name?: string; ci?: number; marks?: boolean[]; joker?: number; v?: 'h' | 't' }, from: string) {
    if (m.t === 'join') {
      const name = String(m.name || 'Gast').slice(0, 16) || 'Gast';
      const p: Player = { id: from, name, points: 0, wins: 0, cards: [], hl: 0 };
      this.guests.set(from, p);
      this.toast('📱 ' + name + ' ist dabei!');
      this.net.send({ t: 'hi', code: this.net.code, playing: this.playing, tv: IS_TV }, from);
      if (this.playing && this.rds[this.ri]) {
        // Später dazugekommen: eigene Karten für die laufende Runde
        this.dealCards(p, rng(Date.now() & 0xffff));
        this.net.send({ t: 'start', kind: this.kind, show: this.onlineShow, tv: IS_TV }, from);
        const rd = this.rds[this.ri];
        this.net.send({ t: 'round', ri: this.ri, name: rd.name, pattern: rd.pattern, jackpot: rd.jackpot || 0, kind: this.kind, cards: p.cards.map((c) => c.card), drawn: this.drawn }, from);
      }
      if (this.scr === 'sOnline') this.lobbyRender?.();
    } else if (m.t === 'bingo') this.claim(from, m.ci ?? 0, m.marks, m.joker);
    else if (m.t === 'hl' && m.v) this.hlPick?.(from, m.v);
  }

  /* ---------- Online & Handys: Mitspieler ---------- */
  joinScreen(code: string) {
    this.guestMode = true;
    this.show('sOnline');
    this.studio.shot('wide');
    $('onlineBox').innerHTML = `<header class="hd"><span></span><h2>🌐 Radio-Bingo beitreten</h2><span></span></header>
      <p class="lead">Du spielst mit deinen Karten auf diesem Gerät mit – egal wo du bist.</p>
      <div class="row"><input class="field nav" id="jName" maxlength="16" placeholder="Dein Name" value="${esc(SV.name)}"><input class="field nav" id="jCode" maxlength="4" placeholder="Code" value="${esc(code)}"></div>
      <div class="row end"><button class="btn gold xl nav" id="jGo" data-focus>🎟️ Mitspielen</button></div><p class="hint" id="jMsg"></p>`;
    $('jGo').onclick = async () => {
      const name = ($('jName') as HTMLInputElement).value.trim() || 'Gast',
        c = ($('jCode') as HTMLInputElement).value;
      SV.name = name;
      save();
      this.sfx.unlock();
      $('jMsg').textContent = '⏳ Verbinde …';
      this.net.onMsg = (m) => this.guestMsg(m);
      this.net.onLeave = () => { this.toast('Die Verbindung zur Show ist weg.', 4000); };
      try {
        await this.net.join(c);
        this.me.name = name;
        this.net.send({ t: 'join', name });
        $('jMsg').textContent = '✅ Verbunden! Warte, bis der Gastgeber die Show startet …';
      } catch (e) {
        $('jMsg').textContent = netError(e);
      }
    };
  }
  guestTv = false;
  guestMsg(m: { t: string; [k: string]: unknown }) {
    if (m.t === 'hi') this.guestTv = !!m.tv;
    else if (m.t === 'start') {
      this.kind = m.kind as Kind;
      this.guestTv = !!m.tv;
      this.voice.on = SV.set.voiceOn && SV.set.guestVoice && !this.guestTv;
      this.studio.setKind(this.kind);
      this.drawn = [];
      this.drawnSet = new Set();
      this.me.points = 0;
      this.joker = 0;
      this.playing = true;
      this.hostPlays = false;
      this.show('sGame');
      document.body.classList.remove('tvhost');
    } else if (m.t === 'round') {
      this.ri = m.ri as number;
      this.rds[this.ri] = { name: m.name as string, pattern: m.pattern as string, prize: 0, jackpot: (m.jackpot as number) || undefined };
      this.pat = pattern(m.pattern as string);
      if (m.cards) {
        this.me.cards = (m.cards as Card[]).map((card) => ({ card, marks: card.cells.map((_, i) => card.kind === 75 && i === 12), joker: -1 }));
        this.drawn = (m.drawn as number[]) || [];
        this.drawnSet = new Set(this.drawn);
        this.studio.refill();
        this.studio.setTableau(this.drawn, this.kind);
      }
      this.cur = [0, this.kind === 75 ? 6 : 0];
      this.studio.setScreen(m.name as string, this.pat.name);
      this.renderGame();
    } else if (m.t === 'pre') {
      this.studio.shot('drum');
      this.sfx.whoosh(1.2);
      this.studio.drawBall(m.n as number, 1.7).then(() => this.studio.shot('ball'));
    } else if (m.t === 'ball') {
      const n = m.n as number;
      this.drawn.push(n);
      this.drawnSet.add(n);
      this.sfx.pop();
      this.studio.setTableau(this.drawn, this.kind, n);
      this.studio.setScreen('', `${this.rds[this.ri]?.name || ''} · ${this.pat.name} · Kugel ${this.drawn.length}`, n);
      if (SV.set.auto) this.me.cards.forEach((cs) => cs.card.cells.forEach((x, i) => { if (x === n) cs.marks[i] = true; }));
      this.renderGame();
    } else if (m.t === 'say') this.voice.say(m.text as string);
    else if (m.t === 'won') {
      this.me.points += m.points as number;
      this.me.wins++;
      this.sfx.bingo(!!m.jackpot);
      this.studio.celebrate(!!m.jackpot);
      this.renderHud();
    } else if (m.t === 'win') {
      this.bigBanner(m.jackpot ? '💰 JACKPOT!' : 'BINGO!', (m.names as string[]).join(' & '));
      this.studio.shot('host');
      if (!(m.points as number)) this.sfx.applause(2);
    } else if (m.t === 'false') {
      this.sfx.wrong();
      this.toast('❌ Noch kein Bingo – schau genau hin!', 3000);
    } else if (m.t === 'joker') {
      this.joker++;
      this.toast('🍀 Dreimal richtig – du hast eine Glückskugel für die nächste Runde!', 4000);
      this.renderHud();
    } else if (m.t === 'hl') {
      this.ov(`<h3>🎲 Höher oder Tiefer?</h3><div class="hlBall">${m.n}</div><div class="row hlRow"><button class="btn xl nav" data-act="h" data-focus>▲ Höher</button><button class="btn xl nav" data-act="t">▼ Tiefer</button></div>`, {
        h: () => { this.net.send({ t: 'hl', v: 'h' }); this.closeOv(); },
        t: () => { this.net.send({ t: 'hl', v: 't' }); this.closeOv(); },
      }, () => {});
    } else if (m.t === 'hlr') {
      if (!$('ov').hidden) this.closeOv();
      this.studio.setScreen('', 'Höher oder Tiefer', m.next as number);
      const mine = (m.res as Record<string, boolean>)[this.net.peer?.id];
      if (mine != null) { if (mine) { this.me.points += 100; this.toast('✅ Richtig! +100'); } else this.toast('❌ Leider daneben'); }
      this.renderHud();
    } else if (m.t === 'end') {
      this.playing = false;
      const rank = m.rank as { name: string; points: number; id: string }[];
      this.show('sResult');
      this.studio.shot('wide');
      $('resBox').innerHTML = `<header class="hd"><span></span><h2>🏆 Showende</h2><span></span></header><ol class="rank">${rank.map((p) => `<li${p.id === this.net.peer?.id ? ' class="me"' : ''}><b>${esc(p.name)}</b><span>${p.points} Punkte</span></li>`).join('')}</ol><p class="hint">Bleib verbunden – der Gastgeber kann gleich die nächste Show starten.</p><div class="row end"><button class="btn nav" id="rMenu">☰ Menü</button></div>`;
      $('rMenu').onclick = () => { this.net.close(); location.href = location.pathname; };
    }
  }
  guestBingo() {
    if (!this.playing) return;
    const ci = Math.max(0, this.me.cards.findIndex((cs) => this.missingOf(cs) === 0)),
      cs = this.me.cards[ci];
    if (!cs) return;
    this.net.send({ t: 'bingo', ci, marks: cs.marks, joker: cs.joker });
    this.toast('📣 Bingo gerufen – Rico prüft …');
  }
}
function ballColorCss(n: number, kind: Kind) {
  return kind === 90 ? ['#2f7bff', '#ff3b5c', '#22c55e', '#ffc61a', '#a855f7', '#ff8a1f', '#14d4d4', '#ff4fd8', '#e8ecf5'][Math.min(8, Math.floor(n / 10))] : ['#2f7bff', '#ff3b5c', '#e8ecf5', '#22c55e', '#ffc61a'][Math.min(4, Math.floor((n - 1) / 15))];
}
