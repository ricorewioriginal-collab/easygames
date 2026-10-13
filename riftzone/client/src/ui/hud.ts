// Spiel-HUD: Leben/Schild, Schnellzugriff, Munition, Material, Minikarte, Zone, Kompass, Abschussliste,
// Trefferanzeige, Schadenszahlen, Richtungsanzeige, Interaktion, Fortschrittsring, Team, Zuschauen.
import { BUILD_NAMES } from '../../../shared/src/building';
import { MAP_SIZE } from '../../../shared/src/constants';
import { AMMO_NAMES, CONSUMABLES, GRENADE_ID, WEAPONS, consumable, weapon } from '../../../shared/src/items';
import { MAT_NAMES } from '../../../shared/src/pieces';
import type { NetZone, SelfState } from '../../../shared/src/protocol';
import { Mode, Phase } from '../../../shared/src/types';
import { fmtTime, h, hex } from '../core/dom';
import { keyLabel, rarityColor, settings } from '../core/settings';

export interface MateInfo {
  id: number;
  name: string;
  hp: number;
  shield: number;
  downed: boolean;
  dead: boolean;
}

export interface HudData {
  self: SelfState | null;
  x: number;
  z: number;
  yaw: number;
  zone: NetZone | null;
  alive: number;
  phase: Phase;
  busCanJump: boolean;
  interact: string | null;
  spectating: string | null;
  mates: MateInfo[];
  fps: number;
  ping: number;
  online: boolean;
  matchTime: number;
  touch: boolean;
  bleed: boolean;
  spread: number;
  showCross: boolean;
  bus: { x0: number; z0: number; x1: number; z1: number } | null;
  marker: { x: number; z: number } | null;
  matesPos: { x: number; z: number; id: number }[];
}

const ICONS: Record<string, string> = { pistol: '⌐', smg: '≡', rifle: '═', burst: '≣', shotgun: '▬', sniper: '⊸', launcher: '◉', grenade: '●' };

export class Hud {
  readonly root: HTMLElement;
  private readonly el: Record<string, HTMLElement> = {};
  private readonly slots: HTMLElement[] = [];
  private readonly mini: HTMLCanvasElement;
  private readonly miniG: CanvasRenderingContext2D;
  private readonly mapImg: HTMLCanvasElement;
  private lastKey = '';
  private bigTimer = 0;
  private feedItems: { el: HTMLElement; t: number }[] = [];
  onSlotTap: ((n: number) => void) | null = null;
  onSpectate: ((d: number) => void) | null = null;
  private miniFrame = 0;

  constructor(mapImg: HTMLCanvasElement) {
    this.mapImg = mapImg;
    const E = this.el;
    this.mini = h('canvas', { width: 220, height: 220 });
    this.miniG = this.mini.getContext('2d')!;
    E.zone = h('div', { class: 'zoneinfo' }, h('div', { class: 'ico' }), h('span'));
    E.alive = h('div', { class: 'counter' }, h('i', null, 'Übrig'), h('b'));
    E.kills = h('div', { class: 'counter' }, h('i', null, 'Ausgeschaltet'), h('b'));
    E.compass = h('div', { class: 'compass' }, h('div', { class: 'strip' }));
    E.team = h('div', { class: 'team' });
    E.feed = h('div', { class: 'feed' });
    E.cross = h('div', { class: 'cross' }, h('i', { class: 't' }), h('i', { class: 'b' }), h('i', { class: 'l' }), h('i', { class: 'r' }), h('i', { class: 'dot' }));
    E.hit = h('div', { class: 'hitmark' });
    E.prompt = h('div', { class: 'prompt' });
    E.ring = h('div', { class: 'ring', html: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="4"/><circle class="fg" cx="20" cy="20" r="17" fill="none" stroke="#3ff2ff" stroke-width="4" stroke-dasharray="106.8" stroke-dashoffset="106.8"/></svg>' }, h('div', { class: 'lbl' }));
    E.hp = h('div', { class: 'vbar hp' }, h('i'), h('span'));
    E.sh = h('div', { class: 'vbar sh' }, h('i'), h('span'));
    E.vitals = h('div', { class: 'vitals' }, E.sh, E.hp);
    E.hotbar = h('div', { class: 'hotbar' });
    for (let i = 0; i < 6; i++) {
      const s = h('div', { class: 'slot tap', onclick: () => this.onSlotTap?.(i) });
      this.slots.push(s);
      E.hotbar.appendChild(s);
    }
    E.ammo = h('div', { class: 'ammo-big' });
    E.buildbar = h('div', { class: 'buildbar' });
    E.bottom = h('div', { class: 'bottom' }, E.ammo, E.buildbar, E.vitals, E.hotbar);
    E.mats = h('div', { class: 'mats' });
    E.big = h('div', { class: 'bigmsg' });
    E.hurt = h('div', { class: 'hurtdir' });
    E.vig = h('div', { class: 'vignette' });
    E.nums = h('div', { style: 'position:absolute;inset:0' });
    E.tags = h('div', { style: 'position:absolute;inset:0' });
    E.spect = h('div', { class: 'spect panel' });
    E.statsLine = h('div', { class: 'stats-line' });
    this.root = h(
      'div',
      { class: 'hud' },
      E.vig,
      E.tags,
      h('div', { class: 'mini' }, this.mini, E.zone),
      E.compass,
      h('div', { class: 'topright' }, E.alive, E.kills),
      E.team,
      E.feed,
      E.cross,
      E.hit,
      E.hurt,
      E.prompt,
      E.ring,
      E.nums,
      E.bottom,
      E.mats,
      E.big,
      E.spect,
      E.statsLine,
    );
    // Kompassband
    const strip = E.compass.firstElementChild as HTMLElement;
    const dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
    for (let r = -1; r <= 1; r++)
      for (let i = 0; i < 24; i++) {
        const deg = i * 15;
        const lab = deg % 45 === 0 ? dirs[deg / 45]! : String(deg);
        const s = h('span', { style: `left:${(r * 360 + deg) * 3}px;${deg % 45 === 0 ? 'font-weight:900;color:#fff' : 'color:#9aa3d6;font-size:.65rem'}` }, lab);
        strip.appendChild(s);
      }
    this.applySettings();
    settings.onChange(() => this.applySettings());
  }

  applySettings(): void {
    this.root.classList.toggle('hc', settings.data.highContrast);
    document.documentElement.style.setProperty('--ts', String(settings.data.textScale));
  }

  update(d: HudData, dt: number): void {
    const E = this.el;
    const s = d.self;
    // Zone
    const z = d.zone;
    const zs = E.zone.lastElementChild as HTMLElement;
    if (d.phase === Phase.Bus && (!s || s.body.mode === Mode.Bus)) {
      zs.textContent = d.busCanJump ? (d.touch ? 'Tippe „Abspringen“' : `${keyLabel(settings.data.keys.jump)}: Abspringen`) : 'Riftfähre startet …';
      E.zone.classList.remove('shrinking');
    } else if (d.phase === Phase.Bus) {
      zs.textContent = 'Sturm bildet sich nach dem Überflug';
    } else if (z) {
      const out = Math.hypot(d.x - z.cx, d.z - z.cz) > z.r;
      const dist = Math.max(0, Math.hypot(d.x - z.tx, d.z - z.tz) - z.tr);
      const txt = z.phase >= 7 ? 'Letzte Zone' : z.shrinking ? `Sturm zieht zu ${fmtTime(z.timer)}` : `Sturm in ${fmtTime(z.timer)}`;
      zs.textContent = txt + (dist > 5 ? ` · ${Math.round(dist)} m` : '');
      E.zone.classList.toggle('shrinking', z.shrinking);
      zs.classList.toggle('storm-warn', out);
      E.vig.style.opacity = out ? '1' : '0';
    }
    (E.alive.lastElementChild as HTMLElement).textContent = String(d.alive);
    (E.kills.lastElementChild as HTMLElement).textContent = String(s?.kills ?? 0);
    // Kompass
    const deg = ((((-d.yaw * 180) / Math.PI) % 360) + 360) % 360;
    (E.compass.firstElementChild as HTMLElement).style.left = `${(E.compass.clientWidth || 300) / 2 - deg * 3}px`;
    // Fadenkreuz
    const spread = Math.max(4, d.spread * 420);
    const cr = E.cross.children;
    (cr[0] as HTMLElement).style.top = `${-spread - 9}px`;
    (cr[1] as HTMLElement).style.top = `${spread}px`;
    (cr[2] as HTMLElement).style.left = `${-spread - 9}px`;
    (cr[3] as HTMLElement).style.left = `${spread}px`;
    E.cross.style.display = d.showCross ? '' : 'none';
    // Interaktion
    if (d.interact) {
      E.prompt.style.display = '';
      const key = d.touch ? '' : `<kbd>${keyLabel(settings.data.keys.interact)}</kbd>`;
      const html = key + d.interact;
      if (E.prompt.innerHTML !== html) E.prompt.innerHTML = html;
    } else E.prompt.style.display = 'none';
    if (d.touch) E.prompt.style.display = 'none';
    // Fortschrittsring
    let prog = -1,
      lbl = '';
    if (s) {
      if (s.reloadT > 0) {
        const w = weapon(s.slots[s.sel]?.id ?? -1);
        const tot = w ? w.reload : 2;
        prog = 1 - s.reloadT / tot;
        lbl = 'Nachladen';
      } else if (s.useT > 0) {
        prog = 1 - s.useT / Math.max(0.1, s.useTotal);
        lbl = consumable(s.slots[s.sel]?.id ?? -1)?.name ?? 'Benutzen';
      } else if (s.reviveT > 0) {
        prog = s.reviveT / 5;
        lbl = 'Wiederbeleben';
      }
    }
    E.ring.style.display = prog >= 0 ? '' : 'none';
    if (prog >= 0) {
      (E.ring.querySelector('.fg') as SVGCircleElement).setAttribute('stroke-dashoffset', String(106.8 * (1 - Math.max(0, Math.min(1, prog)))));
      (E.ring.querySelector('.lbl') as HTMLElement).textContent = lbl;
    }
    // Leben
    const alive = !!s && s.alive && s.body.mode !== Mode.Dead;
    E.bottom.style.display = alive ? '' : 'none';
    E.mats.style.display = alive ? '' : 'none';
    if (s && alive) {
      const downed = s.body.mode === Mode.Downed;
      E.hp.className = 'vbar ' + (downed ? 'bleed' : 'hp');
      const hpv = downed ? s.bleed : s.hp;
      (E.hp.firstElementChild as HTMLElement).style.width = `${Math.max(0, hpv)}%`;
      (E.hp.lastElementChild as HTMLElement).textContent = `${Math.ceil(Math.max(0, hpv))}`;
      (E.sh.firstElementChild as HTMLElement).style.width = `${s.shield}%`;
      (E.sh.lastElementChild as HTMLElement).textContent = `${Math.ceil(s.shield)}`;
      E.sh.style.display = downed ? 'none' : '';
      this.updateSlots(s, d);
    }
    // Team
    const tkey = d.mates.map((m) => `${m.id}:${Math.round(m.hp)}:${Math.round(m.shield)}:${m.downed}:${m.dead}`).join('|');
    if (tkey !== (E.team.dataset.k ?? '')) {
      E.team.dataset.k = tkey;
      E.team.replaceChildren(
        ...d.mates.map((m) =>
          h(
            'div',
            { class: `mate ${m.downed ? 'downed' : ''} ${m.dead ? 'dead' : ''}` },
            m.name,
            m.downed ? ' (unten)' : '',
            h('div', { class: 'bars' }, h('div', { class: 'b' }, h('i', { style: `width:${m.shield}%;background:var(--shield)` })), h('div', { class: 'b' }, h('i', { style: `width:${m.hp}%;background:${m.downed ? 'var(--danger)' : 'var(--hp)'}` }))),
          ),
        ),
      );
    }
    // Zuschauen
    if (d.spectating) {
      E.spect.style.display = '';
      const k = 'sp:' + d.spectating;
      if (E.spect.dataset.k !== k) {
        E.spect.dataset.k = k;
        E.spect.replaceChildren(
          h('button', { class: 'btn small ghost', onclick: () => this.onSpectate?.(-1) }, '◀'),
          h('span', null, 'Zuschauen: ', h('b', null, d.spectating)),
          h('button', { class: 'btn small ghost', onclick: () => this.onSpectate?.(1) }, '▶'),
        );
      }
    } else E.spect.style.display = 'none';
    // Statuszeile
    if (settings.data.showFps) E.statsLine.textContent = `${Math.round(d.fps)} FPS${d.online ? ` · ${Math.round(d.ping)} ms` : ''}`;
    else E.statsLine.textContent = d.online ? `${Math.round(d.ping)} ms` : '';
    // Minikarte (jedes zweite Bild)
    if (++this.miniFrame % 2 === 0) this.drawMini(d);
    // Abschussliste altern lassen
    for (const f of this.feedItems) f.t -= dt;
    while (this.feedItems.length && (this.feedItems[0]!.t <= 0 || this.feedItems.length > 6)) this.feedItems.shift()!.el.remove();
    if (this.bigTimer > 0) {
      this.bigTimer -= dt;
      if (this.bigTimer <= 0) E.big.innerHTML = '';
    }
  }

  private updateSlots(s: SelfState, d: HudData): void {
    const E = this.el;
    const key = JSON.stringify([s.slots, s.sel, s.ammo, s.mats, s.build, s.buildPiece, s.buildMat, settings.data.colorblind]);
    if (key === this.lastKey) return;
    this.lastKey = key;
    s.slots.forEach((sl, i) => {
      const el = this.slots[i]!;
      el.classList.toggle('sel', i === s.sel && !s.build);
      const children: (HTMLElement | string)[] = [h('span', { class: 'n' }, i === 0 ? (d.touch ? '' : keyLabel(settings.data.keys.pickaxe)) : String(i))];
      if (i === 0) children.push(h('span', { class: 'ic' }, '⛏'));
      else if (sl.id >= 0) {
        const w = WEAPONS[sl.id];
        const c = CONSUMABLES.find((x) => x.id === sl.id);
        children.push(h('span', null, w ? `${ICONS[w.model] ?? ''} ${w.short}` : c?.name ?? '?'));
        if (w && sl.id !== GRENADE_ID) children.push(h('span', { class: 'q' }, String(sl.qty)));
        else children.push(h('span', { class: 'q' }, '×' + sl.qty));
        children.push(h('span', { class: 'rar', style: `background:${hex(rarityColor(sl.rarity, settings.data.colorblind))}` }));
      }
      el.replaceChildren(...children);
    });
    // Munition der aktuellen Waffe
    const cur = s.slots[s.sel];
    const w = cur ? weapon(cur.id) : undefined;
    if (w && cur && cur.id !== GRENADE_ID && !s.build) {
      E.ammo.innerHTML = `${cur.qty} <small>/ ${s.ammo[w.ammo]} · ${AMMO_NAMES[w.ammo]}</small>`;
    } else E.ammo.innerHTML = '';
    // Bauleiste
    if (s.build) {
      E.buildbar.style.display = '';
      E.buildbar.replaceChildren(
        ...BUILD_NAMES.map((n, i) => h('div', { class: i === s.buildPiece ? 'sel' : '' }, d.touch ? n : `${keyLabel(settings.data.keys[(['wall', 'floor', 'ramp'] as const)[i]!])} ${n}`)),
      );
    } else E.buildbar.style.display = 'none';
    E.hotbar.style.display = s.build ? 'none' : '';
    const matColors = ['#d29a5c', '#a3a7b3', '#7a90a8'];
    E.mats.replaceChildren(...MAT_NAMES.map((n, i) => h('div', { class: `mat ${s.build && s.buildMat === i ? 'sel' : ''}` }, h('b', { style: `background:${matColors[i]}` }), n, h('span', null, String(s.mats[i])))));
  }

  private drawMini(d: HudData): void {
    const g = this.miniG,
      W = this.mini.width;
    const range = 260; // Meter Sichtfeld
    const k = W / range;
    g.save();
    g.fillStyle = '#14506a';
    g.fillRect(0, 0, W, W);
    g.beginPath();
    g.arc(W / 2, W / 2, W / 2, 0, Math.PI * 2);
    g.clip();
    const sc = this.mapImg.width / MAP_SIZE;
    const sx = (d.x - range / 2) * sc,
      sy = (d.z - range / 2) * sc;
    g.drawImage(this.mapImg, sx, sy, range * sc, range * sc, 0, 0, W, W);
    const tx = (wx: number): number => (wx - d.x) * k + W / 2;
    const ty = (wz: number): number => (wz - d.z) * k + W / 2;
    const z = d.zone;
    if (z && d.phase !== Phase.Bus) {
      // Sturmbereich einfärben
      g.fillStyle = 'rgba(182,75,255,0.32)';
      g.beginPath();
      g.rect(0, 0, W, W);
      g.arc(tx(z.cx), ty(z.cz), z.r * k, 0, Math.PI * 2, true);
      g.fill('evenodd');
      g.strokeStyle = '#d68bff';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(tx(z.cx), ty(z.cz), z.r * k, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = '#ffffff';
      g.setLineDash([5, 4]);
      g.beginPath();
      g.arc(tx(z.tx), ty(z.tz), z.tr * k, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
    }
    if (d.bus && d.phase === Phase.Bus) {
      g.strokeStyle = '#ffb02e';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(tx(d.bus.x0), ty(d.bus.z0));
      g.lineTo(tx(d.bus.x1), ty(d.bus.z1));
      g.stroke();
    }
    if (d.marker) {
      g.fillStyle = '#ffb02e';
      g.beginPath();
      g.arc(tx(d.marker.x), ty(d.marker.z), 4, 0, Math.PI * 2);
      g.fill();
    }
    for (const m of d.matesPos) {
      g.fillStyle = '#4fff8a';
      g.beginPath();
      g.arc(tx(m.x), ty(m.z), 4, 0, Math.PI * 2);
      g.fill();
    }
    // Spieler-Pfeil
    g.translate(W / 2, W / 2);
    g.rotate(-d.yaw);
    g.fillStyle = '#fff';
    g.strokeStyle = '#000';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(0, -9);
    g.lineTo(6, 7);
    g.lineTo(0, 3);
    g.lineTo(-6, 7);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }

  feed(text: string, me: boolean): void {
    const el = h('div', { class: me ? 'me' : '' }, text);
    this.el.feed.appendChild(el);
    this.feedItems.push({ el, t: 6 });
  }

  hitMarker(head: boolean): void {
    const e = this.el.hit;
    e.classList.remove('on', 'head');
    void e.offsetWidth;
    e.classList.add('on');
    if (head) e.classList.add('head');
  }

  damageNumber(sx: number, sy: number, amt: number, head: boolean, shield: boolean): void {
    if (sx < 0 || sy < 0 || sx > innerWidth || sy > innerHeight) return;
    const el = h('div', { class: `dmgnum ${head ? 'head' : ''} ${shield ? 'shield' : ''}`, style: `left:${sx}px;top:${sy}px` }, String(amt));
    this.el.nums.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  hurtFrom(angle: number, viz = false): void {
    const i = h('i', { class: viz ? 'viz' : '', style: `transform:rotate(${angle}rad)` });
    this.el.hurt.appendChild(i);
    setTimeout(() => i.remove(), 1000);
    if (!viz) {
      this.el.vig.classList.add('hurt');
      this.el.vig.style.opacity = '0.8';
      setTimeout(() => {
        this.el.vig.classList.remove('hurt');
      }, 250);
    }
  }

  big(text: string, sub = '', dur = 3): void {
    this.el.big.innerHTML = '';
    this.el.big.append(text, sub ? h('small', null, sub) : '');
    this.bigTimer = dur;
  }

  /** Namensschilder und Markierungen (Bildschirmkoordinaten) */
  tags(list: { x: number; y: number; text: string; cls: string }[]): void {
    const c = this.el.tags;
    while (c.children.length < list.length) c.appendChild(h('div'));
    for (let i = 0; i < c.children.length; i++) {
      const el = c.children[i] as HTMLElement;
      const t = list[i];
      if (!t) {
        el.style.display = 'none';
        continue;
      }
      el.style.display = '';
      el.className = t.cls;
      el.style.left = `${t.x}px`;
      el.style.top = `${t.y}px`;
      if (el.textContent !== t.text) el.textContent = t.text;
    }
  }

  show(v: boolean): void {
    this.root.style.display = v ? '' : 'none';
  }
}

export const BUILD_LABELS = BUILD_NAMES;
