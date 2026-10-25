// Oberfläche im DOM: Dialoge, Menüs, Kreuzmenü, Heldenkarten, Lebensbalken, Schadenszahlen, Banner, Steuerkreuz.
import { HEROES, IPSKILLS } from './data.js';
import * as L from './logic.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const ICONS = {
  sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',
  staff: '<path d="M12 22V9"/><circle cx="12" cy="6" r="3"/><path d="M12 1v2M7 3l1.5 1.5M17 3l-1.5 1.5"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-2-1-4-3-6 0 4-4 6-4 12 0 4.3 3 7 7 7z"/>',
  bag: '<path d="M6 8h12l1 13H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  run: '<path d="M6 21h7l2-5-4-3 2-5h4M9 8 6 11M15 16l3 5"/><circle cx="15" cy="4" r="2"/>'
};
const svg = (k) => `<svg viewBox="0 0 24 24" class="i">${ICONS[k]}</svg>`;
const CROSS = [['sword', 'Angriff'], ['staff', 'Fertigkeit'], ['flame', 'Spezial'], ['bag', 'Item'], ['shield', 'Wache'], ['run', 'Flucht']];
// Nachbarn im Kreuzmenü (wie die Fokus-Nachbarn der Godot-Fassung): [oben, unten, links, rechts]
const NEIGH = { 0: [1, 2, 3, 4], 1: [-1, 0, -1, -1], 2: [0, -1, -1, 5], 3: [-1, -1, -1, 0], 4: [-1, 5, 0, -1], 5: [4, -1, 2, -1] };

export class UI {
  constructor(game) {
    this.g = game;
    this.view = null;
    this.talking = false;
    this.choosingList = null;
    this.choosingCross = null;
    this.statusOpen = null;
    this.touchOn = false;
    this.touchDevice = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    this.cards = [];
    this.bars = [];
    this.labels = [];
    this.targets = null;
    this.build();
  }
  build() {
    // Kreuzmenü
    const cross = $('cross');
    this.crossBtns = CROSS.map(([ic, name], i) => {
      const b = el('button', 'cb c' + i);
      b.innerHTML = svg(ic);
      b.setAttribute('aria-label', name);
      b.addEventListener('pointerenter', () => { if (!b.disabled) this.crossFocus(i); });
      b.addEventListener('click', () => { if (this.choosingCross && !b.disabled) this.pickCross(i); });
      cross.appendChild(b);
      return b;
    });
    $('dlg').addEventListener('pointerdown', (e) => { if (this.talking) { e.preventDefault(); this.advance(); } });
    $('status').addEventListener('pointerdown', () => this.closeStatus());
    $('menuBtn').addEventListener('click', () => this.g.openMenu());
    // Steuerkreuz: Finger aufsetzen und schieben, Loslassen stoppt
    const joy = $('joy'), knob = $('knob');
    let pid = null, cx = 0, cy = 0;
    const upd = (e) => {
      const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), m = Math.min(d, 42);
      knob.style.transform = `translate(${d ? dx / d * m : 0}px, ${d ? dy / d * m : 0}px)`;
      let dir = null;
      if (d >= 12) dir = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
      this.g.dpad = dir;
    };
    joy.addEventListener('pointerdown', (e) => {
      if (pid !== null) return;
      pid = e.pointerId;
      joy.setPointerCapture(pid);
      const r = joy.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      upd(e);
      e.preventDefault();
    });
    joy.addEventListener('pointermove', (e) => { if (e.pointerId === pid) upd(e); });
    const rel = (e) => { if (e.pointerId !== pid) return; pid = null; this.g.dpad = null; knob.style.transform = ''; };
    joy.addEventListener('pointerup', rel);
    joy.addEventListener('pointercancel', rel);
    this.joyRelease = () => { pid = null; this.g.dpad = null; knob.style.transform = ''; };
  }

  // ---------------------------------------------------------------- Zustand
  isChoosing() { return !!(this.choosingList || this.choosingCross); }
  isTalking() { return this.talking || !!this.statusOpen; }
  touchVisible() { return this.touchOn; }
  setTouch(v) {
    this.touchOn = v;
    $('menuBtn').hidden = !v;
    $('joy').hidden = !(v && this.touchDevice);
    if (!v) this.joyRelease();
  }

  // ---------------------------------------------------------------- Dialog mit Schreibmaschinen-Effekt
  say(lines) {
    return new Promise((done) => {
      const box = $('dlg'), txt = $('dlgText');
      this.talking = true;
      box.hidden = false;
      let li = 0, full = '', shown = 0, timer = 0;
      const show = () => {
        full = String(lines[li]);
        shown = 0;
        box.classList.remove('more');
        clearInterval(timer);
        timer = setInterval(() => {
          shown = Math.min(full.length, shown + 2);
          txt.textContent = full.slice(0, shown);
          if (shown >= full.length) { clearInterval(timer); box.classList.add('more'); }
        }, 16);
      };
      this.advance = () => {
        if (shown < full.length) { shown = full.length; txt.textContent = full; clearInterval(timer); box.classList.add('more'); return; }
        li++;
        if (li < lines.length) show();
        else {
          clearInterval(timer);
          this.talking = false;
          this.advance = () => {};
          box.hidden = true;
          txt.textContent = '';
          done();
        }
      };
      show();
    });
  }
  advance() {}

  // ---------------------------------------------------------------- Listenmenü
  choose(opts, canCancel, disabled, mode) {
    return new Promise((done) => {
      const panel = $('menu');
      panel.className = 'glass menu ' + (mode === 2 ? 'mb' : (mode === 0 ? 'mt' : 'mw'));
      panel.innerHTML = '';
      const btns = opts.map((o, i) => {
        const b = el('button', 'mi', String(o));
        b.disabled = !!disabled[i];
        b.addEventListener('pointerenter', () => { if (!b.disabled) this.listFocus(i); });
        b.addEventListener('click', () => { if (!b.disabled) finish(i); });
        panel.appendChild(b);
        return b;
      });
      panel.hidden = false;
      const finish = (r) => {
        this.choosingList = null;
        panel.hidden = true;
        panel.innerHTML = '';
        this.targetFocus(-1);
        done(r);
      };
      this.choosingList = { btns, canCancel, finish, focus: -1 };
      const first = btns.findIndex(b => !b.disabled);
      this.listFocus(first >= 0 ? first : 0);
    });
  }
  listFocus(i) {
    const c = this.choosingList;
    if (!c) return;
    c.focus = i;
    c.btns.forEach((b, k) => b.classList.toggle('on', k === i));
    c.btns[i]?.scrollIntoView?.({ block: 'nearest' });
    this.targetFocus(this.targets && i < this.targets.length ? this.targets[i] : -1);
  }
  listMove(d) {
    const c = this.choosingList;
    if (!c) return;
    const n = c.btns.length;
    let i = c.focus;
    for (let k = 0; k < n; k++) { i = (i + d + n) % n; if (!c.btns[i].disabled) break; }
    this.listFocus(i);
  }
  targetHint(idx) { this.targets = idx; }
  targetFocus(ei) {
    this.bars.forEach((b, i) => b && b.classList.toggle('tgt', i === ei));
  }

  // ---------------------------------------------------------------- Kreuzmenü
  chooseCross(disabled) {
    return new Promise((done) => {
      this.crossBtns.forEach((b, i) => { b.disabled = !!disabled[i]; });
      $('cross').hidden = false;
      this.choosingCross = { done, focus: 0 };
      this.crossFocus(0);
    });
  }
  crossFocus(i) {
    if (!this.choosingCross) return;
    this.choosingCross.focus = i;
    this.crossBtns.forEach((b, k) => b.classList.toggle('on', k === i));
    $('crossLbl').textContent = CROSS[i][1];
  }
  crossMove(dir) {
    const c = this.choosingCross;
    if (!c) return;
    let n = NEIGH[c.focus][dir];
    // gesperrtes Feld (Spezial ohne IP) überspringen
    if (n >= 0 && this.crossBtns[n].disabled) { const nn = NEIGH[n][dir]; n = nn >= 0 ? nn : -1; }
    if (n >= 0) this.crossFocus(n);
  }
  pickCross(i) {
    const c = this.choosingCross;
    if (!c || this.crossBtns[i].disabled) return;
    this.choosingCross = null;
    $('cross').hidden = true;
    c.done(i);
  }

  // ---------------------------------------------------------------- Status
  status(d) {
    return new Promise((done) => {
      const box = $('status');
      const min = Math.floor(d.time / 60);
      box.innerHTML = `<div class="glass sbox"><h3>Status</h3><div class="sgrid">${d.heroes.map(h => `
        <div class="sh" style="--hc:${h.col}"><b>${h.name}</b><i>${h.role} · Stufe ${h.lv}</i>
        <div class="sb"><span>LP</span><u><s style="width:${h.hp / h.mhp * 100}%"></s></u><em>${h.hp}/${h.mhp}</em></div>
        <div class="sb sp"><span>SP</span><u><s style="width:${h.sp / Math.max(1, h.msp) * 100}%"></s></u><em>${h.sp}/${h.msp}</em></div>
        <div class="sb xp"><span>EXP</span><u><s style="width:${Math.min(100, h.exp / h.need * 100)}%"></s></u><em>${h.exp}/${h.need}</em></div>
        <div class="st"><span>ANG <b>${h.atk}</b></span><span>ABW <b>${h.def}</b></span><span>MAG <b>${h.mag}</b></span><span>TEM <b>${h.spd}</b></span></div></div>`).join('')}</div>
        <p class="sf">Münzen <b>${d.gold}</b> · Ausrüstung <b>Stufe ${d.gear}</b> · Kristalle <b>${d.crystals}/4</b> · Spielzeit <b>${min} Min.</b></p>
        <p class="sk">Weiter mit Bestätigen oder Antippen</p></div>`;
      box.hidden = false;
      this.statusOpen = () => { box.hidden = true; box.innerHTML = ''; this.statusOpen = null; done(); };
    });
  }
  closeStatus() { if (this.statusOpen) this.statusOpen(); }

  // ---------------------------------------------------------------- Meldungen
  msg(t) {
    const m = $('msg');
    m.textContent = t;
    m.hidden = !t;
  }
  banner(t, hold) {
    return new Promise((done) => {
      const b = $('banner');
      b.textContent = t;
      b.hidden = false;
      b.classList.remove('show');
      void b.offsetWidth;
      b.classList.add('show');
      setTimeout(() => { b.hidden = true; b.classList.remove('show'); done(); }, hold * 1000);
    });
  }
  fade(to, t) {
    const f = $('fade');
    f.style.transition = `opacity ${t}s ease`;
    f.style.opacity = to;
    return new Promise(r => setTimeout(r, t * 1000 + 20));
  }
  fadeNow(to) { const f = $('fade'); f.style.transition = 'none'; f.style.opacity = to; }

  // ---------------------------------------------------------------- Schadenszahlen
  float(x, y, text, color, big) {
    const f = el('div', 'fl' + (big ? ' big' : ''), text);
    f.style.left = x + 'px';
    f.style.top = y + 'px';
    f.style.color = color;
    $('floats').appendChild(f);
    setTimeout(() => f.remove(), 950);
  }
  floatEnemy(i, text, color) {
    if (!this.view) return;
    const a = this.view.battle.enemies[i];
    const p = this.view.screenPos('enemy', i, a ? a.h * 0.85 : 1.5);
    if (p) this.float(p.x + (Math.random() - 0.5) * 30, p.y, text, color, true);
  }
  floatHero(i, text, color) {
    const c = this.cards[i];
    if (!c) return;
    const r = c.el.getBoundingClientRect();
    this.float(r.left + r.width * 0.5, r.top - 4, text, color, false);
  }

  // ---------------------------------------------------------------- pro Bild
  frame() {
    const g = this.g, S = g.S;
    const inWorld = g.mode === 1, inBattle = g.mode === 2;
    $('hud').hidden = !inWorld;
    $('title').hidden = g.mode !== 0;
    if (inWorld) {
      const t = `${S.map.name}`;
      if (this._hudT !== t) { this._hudT = t; $('hudName').textContent = t; }
      if (this._hudG !== S.gold) { this._hudG = S.gold; $('hudGold').textContent = S.gold; }
    }
    this.frameLabels(inWorld && S.map.world);
    this.frameBattle(inBattle);
  }
  frameLabels(on) {
    const box = $('labels');
    const v = this.view;
    if (!on || !v || !v.labels.length) { if (this.labels.length) { box.innerHTML = ''; this.labels = []; } return; }
    if (this.labels.length !== v.labels.length || this._labMap !== v.labels) {
      box.innerHTML = '';
      this._labMap = v.labels;
      this.labels = v.labels.map(l => { const e = el('div', 'lab', l.p.label); box.appendChild(e); return e; });
    }
    v.labels.forEach((l, i) => {
      const e = this.labels[i];
      const p = v.project(l.node.position.clone().setY(l.node.position.y + l.h));
      e.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
      const open = L.portalOpen(this.g.S, l.p);
      e.classList.toggle('closed', !open);
      e.hidden = !p.vis;
    });
  }
  frameBattle(on) {
    const g = this.g, S = g.S, v = this.view;
    const party = $('party'), bars = $('bars');
    party.hidden = !on;
    if (!on) {
      if (this.cards.length) { party.innerHTML = ''; this.cards = []; }
      if (this.bars.length) { bars.innerHTML = ''; this.bars = []; }
      return;
    }
    if (this.cards.length !== S.party.length) {
      party.innerHTML = '';
      this.cards = S.party.map(h => {
        const d = HEROES[h.id];
        const c = el('div', 'card glass');
        c.style.setProperty('--hc', d.col);
        c.innerHTML = `<div class="ch"><i class="av">${d.name[0]}</i><b>${d.name}</b><em>Lv <span class="lv"></span></em></div>
          <div class="br hp"><span>LP</span><u><s></s></u><em class="v"></em></div>
          <div class="br sp"><span>SP</span><u><s></s></u><em class="v"></em></div>
          <div class="br ip"><span>IP</span><u><s></s><i class="mk"></i></u></div>`;
        party.appendChild(c);
        const q = (s) => c.querySelector(s);
        return { el: c, lv: q('.lv'), hp: q('.hp s'), hpv: q('.hp .v'), sp: q('.sp s'), spv: q('.sp .v'), ip: q('.ip s'), mk: q('.mk'), last: '' };
      });
    }
    S.party.forEach((h, i) => {
      const c = this.cards[i];
      const m = L.mhp(S, h), ms = L.msp(h), need = IPSKILLS[HEROES[h.id].ip].ip;
      const key = [h.hp, m, h.sp, ms, h.ip, h.lv, g.curHero === i].join();
      if (c.last === key) return;
      c.last = key;
      c.lv.textContent = h.lv;
      c.hp.style.width = (h.hp / m * 100) + '%';
      c.hp.classList.toggle('low', h.hp / m <= 0.3);
      c.hpv.textContent = h.hp;
      c.sp.style.width = (h.sp / Math.max(1, ms) * 100) + '%';
      c.spv.textContent = h.sp;
      c.ip.style.width = h.ip + '%';
      c.mk.style.left = need + '%';
      c.el.classList.toggle('ready', h.ip >= need);
      c.el.classList.toggle('hot', g.curHero === i);
      c.el.classList.toggle('down', h.hp <= 0);
    });
    // Gegner: Name und Lebensbalken über dem Modell
    if (!v) return;
    if (this.bars.length !== S.enemies.length) {
      bars.innerHTML = '';
      this.bars = S.enemies.map(e => {
        const b = el('div', 'eb' + (e.boss ? ' boss' : ''));
        b.innerHTML = `<b>${e.name}</b><u><s></s></u>`;
        bars.appendChild(b);
        return b;
      });
    }
    S.enemies.forEach((e, i) => {
      const b = this.bars[i];
      const a = v.battle.enemies[i];
      if (!b) return;
      if (e.hp <= 0 || !a) { b.hidden = true; return; }
      const p = v.screenPos('enemy', i, a.h + 0.35);
      if (!p) { b.hidden = true; return; }
      b.hidden = false;
      b.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -100%)`;
      b.querySelector('s').style.width = (e.hp / e.mhp * 100) + '%';
    });
  }

  // ---------------------------------------------------------------- Eingabe
  // a: up|down|left|right|ok|cancel|menu (Taste gedrückt)
  action(a) {
    if (this.statusOpen) { if (a === 'ok' || a === 'cancel' || a === 'menu') this.closeStatus(); return true; }
    if (this.talking) { if (a === 'ok' || a === 'cancel') { this.advance(); return true; } return false; }
    if (this.choosingList) {
      const c = this.choosingList;
      if (a === 'up' || a === 'left') this.listMove(-1);
      else if (a === 'down' || a === 'right') this.listMove(1);
      else if (a === 'ok') { if (c.btns[c.focus] && !c.btns[c.focus].disabled) c.finish(c.focus); }
      else if (a === 'cancel' && c.canCancel) c.finish(-1);
      return true;
    }
    if (this.choosingCross) {
      const d = { up: 0, down: 1, left: 2, right: 3 }[a];
      if (d !== undefined) this.crossMove(d);
      else if (a === 'ok') this.pickCross(this.choosingCross.focus);
      return true;
    }
    return false;
  }
}
