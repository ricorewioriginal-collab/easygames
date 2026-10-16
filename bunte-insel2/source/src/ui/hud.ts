/* Spielanzeige: Sterne, Stufe, Ort, Ziel-Anzeige, Aktions-Hinweis, Meldungen, Touch-Steuerung, Minikarte. */
import type { Game } from '../game.ts';
import { levelFromXp, xpForLevel } from '../persistence/save.ts';
import { h, uiRoot, anyModal } from './dom.ts';
import { TouchControls } from './touch.ts';
import { Minimap } from './minimap.ts';

export interface TrackerInfo { icon: string; title: string; text: string; target: { x: number; z: number } | null }

export class Hud {
  readonly el: HTMLElement;
  private stars = h('span', { class: 'chip', title: 'Sterne' });
  private lvl = h('div', { class: 'chip lvl' });
  private where = h('div', { class: 'where' });
  private tracker = h('div', { class: 'tracker hidden', role: 'button', tabindex: 0 });
  private prompt = h('div', { class: 'prompt hidden', role: 'button' });
  private toasts = h('div', { class: 'toasts', 'aria-live': 'polite' });
  private barkEl = h('div', { class: 'bark hidden' });
  private hearts = h('div', { class: 'chip hearts hidden' });
  private extra = h('div', { class: 'statline' });
  readonly touch: TouchControls;
  readonly minimap: Minimap;
  private barkT = 0;
  private bannerEl: HTMLElement | null = null;
  tracking: (() => TrackerInfo | null) = () => null;
  onTrackerClick: () => void = () => {};
  heartsFn: (() => { hp: number; max: number; energy: number } | null) = () => null;
  private menuBtns: HTMLElement;
  private journalDot = h('i', { class: 'dot hidden' });
  private fpsEl = h('div', { class: 'fps hidden' });

  constructor(private g: Game, actions: { map: () => void; journal: () => void; inventory: () => void; pause: () => void; emote: () => void }) {
    const L = h('div', { class: 'hud-tl' },
      h('div', { class: 'statline' }, this.stars, this.lvl, this.hearts), this.where, this.tracker, this.extra);
    this.menuBtns = h('div', { class: 'hud-tr' },
      h('button', { class: 'hud-btn', type: 'button', title: 'Gesten (G)', 'aria-label': 'Gesten', onclick: actions.emote }, '😄'),
      h('button', { class: 'hud-btn', type: 'button', title: 'Rucksack (I)', 'aria-label': 'Rucksack', onclick: actions.inventory }, '🎒'),
      h('button', { class: 'hud-btn', type: 'button', title: 'Tagebuch (Q)', 'aria-label': 'Tagebuch', onclick: actions.journal }, '📖', this.journalDot),
      h('button', { class: 'hud-btn', type: 'button', title: 'Karte (M)', 'aria-label': 'Karte', onclick: actions.map }, '🗺️'),
      h('button', { class: 'hud-btn', type: 'button', title: 'Pause (Esc)', 'aria-label': 'Pause', onclick: actions.pause }, '⏸️'));
    this.minimap = new Minimap(g);
    this.minimap.el.addEventListener('click', actions.map);
    this.touch = new TouchControls(g);
    this.el = h('div', { id: 'hud' }, this.touch.el, L, this.menuBtns, this.minimap.el, this.prompt, this.toasts, this.barkEl, this.fpsEl);
    this.tracker.addEventListener('click', () => this.onTrackerClick());
    this.prompt.addEventListener('pointerdown', e => { e.stopPropagation(); this.g.input.tap('action'); });
    uiRoot().append(this.el);
    g.onToast = (t, i, ms, big) => this.toast(t, i, ms, big);
    g.onBark = (n, t, i) => this.bark(n, t, i);
    g.onBanner = (t, s) => this.banner(t, s);
  }
  show(on: boolean): void { this.el.classList.toggle('hidden', !on); }
  setJournalDot(on: boolean): void { this.journalDot.classList.toggle('hidden', !on); }
  toast(text: string, icon?: string, ms = 2200, big = false): void {
    const t = h('div', { class: 'toast' + (big ? ' big' : '') }, (icon ? icon + ' ' : '') + text);
    this.toasts.append(t);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild!.remove();
    setTimeout(() => t.remove(), ms);
  }
  bark(name: string, text: string, icon?: string): void {
    this.barkEl.innerHTML = '';
    this.barkEl.append(h('b', null, (icon ? icon + ' ' : '') + name + ': '), text);
    this.barkEl.classList.remove('hidden');
    this.barkT = 3 + text.length * 0.04;
  }
  banner(title: string, sub: string): void {
    this.bannerEl?.remove();
    this.bannerEl = h('div', { class: 'banner' }, h('div', { class: 'n' }, title), sub ? h('div', { class: 's' }, sub) : null);
    this.el.append(this.bannerEl);
    const el = this.bannerEl;
    setTimeout(() => el.remove(), 3600);
  }
  setExtra(nodes: HTMLElement[]): void { this.extra.replaceChildren(...nodes); }
  update(dt: number): void {
    const g = this.g, s = g.save;
    if (!s) return;
    this.el.classList.toggle('touch-mode', g.mobile || g.input.lastDevice === 'touch');
    this.stars.textContent = '⭐ ' + s.stars;
    const lv = levelFromXp(s.xp), info = xpForLevel(lv), pct = Math.min(100, ((s.xp - info.start) / info.need) * 100);
    this.lvl.innerHTML = '';
    this.lvl.append('🌟 ' + lv, h('div', { class: 'progress' }, h('i', { style: 'width:' + pct.toFixed(0) + '%' })));
    const w = g.currentWorld, z = g.currentZone;
    const hour = Math.floor(g.env.hour), mins = Math.floor((g.env.hour % 1) * 60);
    this.where.textContent = (z ? (z.icon ?? '') + ' ' + z.name : w ? w.icon + ' ' + w.name : '🌊 Auf dem Meer') + '  ·  ' + (g.env.isNight ? '🌙 ' : '☀️ ') + String(hour).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
    // Ziel
    const tr = this.tracking();
    if (tr) {
      this.tracker.classList.remove('hidden');
      let dist = '';
      if (tr.target) { const d = Math.hypot(tr.target.x - g.player.pos.x, tr.target.z - g.player.pos.z); dist = d > 6 ? Math.round(d) + ' m' : 'hier!'; }
      this.tracker.replaceChildren(h('div', { class: 't' }, tr.icon + ' ' + tr.title, h('span', { class: 'spacer' }), h('span', { class: 'dist' }, dist)), h('div', { class: 'o' }, tr.text));
    } else this.tracker.classList.add('hidden');
    // Herzen (nur im Wald)
    const hp = this.heartsFn();
    if (hp) {
      this.hearts.classList.remove('hidden');
      let t = '';
      for (let i = 0; i < hp.max; i++) t += i < Math.floor(hp.hp) ? '❤️' : i < hp.hp ? '💗' : '🤍';
      this.hearts.textContent = t;
    } else this.hearts.classList.add('hidden');
    // Aktions-Hinweis
    const n = g.nearest;
    if (n && !anyModal() && g.busy === 0) {
      const key = g.input.lastDevice === 'gamepad' ? 'A' : (g.mobile || g.input.lastDevice === 'touch') ? '👆' : 'E';
      const label = g.interact.labelOf(n);
      const txt = n.icon + ' ' + label;
      if (this.prompt.dataset.t !== txt + key) {
        this.prompt.dataset.t = txt + key;
        this.prompt.replaceChildren(h('kbd', null, key), txt, ...(n.alt ? [h('span', { class: 'muted', style: 'color:#ddd' }, ' · ' + (key === 'E' ? 'F' : key === 'A' ? 'Y' : '') + ' ' + n.alt.icon)] : []));
      }
      this.prompt.classList.remove('hidden');
    } else this.prompt.classList.add('hidden');
    if (this.barkT > 0) { this.barkT -= dt; if (this.barkT <= 0) this.barkEl.classList.add('hidden'); }
    this.touch.update();
    this.minimap.update(dt);
    if (g.settings.showFps) { this.fpsEl.classList.remove('hidden'); this.fpsEl.textContent = Math.round(g.renderer.fps) + ' fps · ' + g.renderer.gl.info.render.calls + ' calls · ' + g.renderer.profile.name + ' · dpr ' + g.renderer.pixelRatio.toFixed(2); }
    else this.fpsEl.classList.add('hidden');
  }
}
