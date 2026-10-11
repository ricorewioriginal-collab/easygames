import { MAX_BOOST } from '@shared/sim/types';
import { TEAM_NAMES, TEAM_SYMBOL, teamColor } from '../app/theme';
import { t } from '../i18n';
import { clear, h } from '../ui/dom';
import { fmtTime } from '../ui/common';

const SVGNS = 'http://www.w3.org/2000/svg';

/** Nitro-Anzeige: Ring um eine Zahl */
export class BoostGauge {
  readonly el = h('div', { class: 'boost' });
  private arc: SVGCircleElement;
  private num = h('div', { class: 'num' });
  private speed = h('div', { class: 'speed' });
  private lastB = -1;
  private lastS = -1;
  constructor() {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    const bg = document.createElementNS(SVGNS, 'circle');
    for (const [k, v] of Object.entries({ cx: '50', cy: '50', r: '42', fill: 'rgba(5,6,20,0.7)', stroke: 'rgba(255,255,255,0.15)', 'stroke-width': '9' })) bg.setAttribute(k, v);
    this.arc = document.createElementNS(SVGNS, 'circle');
    for (const [k, v] of Object.entries({ cx: '50', cy: '50', r: '42', fill: 'none', stroke: '#b6ff3b', 'stroke-width': '9', 'stroke-linecap': 'butt', transform: 'rotate(-90 50 50)', 'stroke-dasharray': '264', 'stroke-dashoffset': '264' })) this.arc.setAttribute(k, v);
    svg.append(bg, this.arc);
    this.el.append(svg, this.num);
    this.speed.append(h('b'), 'km/h');
  }
  get speedEl(): HTMLElement {
    return this.speed;
  }
  set(boost: number, kmh: number, boosting: boolean): void {
    const b = Math.round(Math.max(0, Math.min(MAX_BOOST, boost)));
    if (b !== this.lastB) {
      this.lastB = b;
      this.num.textContent = String(b);
      this.arc.setAttribute('stroke-dashoffset', String(264 * (1 - b / MAX_BOOST)));
      this.arc.setAttribute('stroke', b < 20 ? '#ff4d5e' : '#b6ff3b');
    }
    this.arc.style.filter = boosting ? 'drop-shadow(0 0 6px #b6ff3b)' : '';
    const k = Math.round(kmh);
    if (k !== this.lastS) {
      this.lastS = k;
      (this.speed.firstChild as HTMLElement).textContent = String(k);
    }
  }
}

/** Anzeige über dem Spielfeld: Spielstand, Uhr, Ansagen, Countdown, Ereignisliste */
export class Hud {
  readonly el = h('div', { class: 'hud' });
  private s0 = h('div', { class: 'team t0' }, '0');
  private s1 = h('div', { class: 'team t1' }, '0');
  private clock = h('div', { class: 'clock' }, '5:00');
  private banner = h('div', { class: 'banner' });
  private count = h('div', { class: 'count', 'aria-live': 'assertive' });
  private feed = h('div', { class: 'feed', 'aria-live': 'polite' });
  readonly gauges: BoostGauge[] = [];
  readonly menuBtn: HTMLButtonElement;
  private bannerTimer: ReturnType<typeof setTimeout> | null = null;
  private lastClock = '';

  constructor(localCount: number, onMenu: () => void) {
    this.menuBtn = h('button', { type: 'button', class: 'btn ghost menubtn', 'aria-label': t('pause.title'), onclick: () => onMenu() }, '☰');
    this.el.append(h('div', { class: 'scorebar' }, this.s0, this.clock, this.s1), this.feed, this.banner, this.count, this.menuBtn);
    for (let i = 0; i < localCount; i++) {
      const g = new BoostGauge();
      this.gauges.push(g);
      this.el.append(g.el, g.speedEl);
    }
  }

  /** Positioniert die Anzeigen der lokalen Spieler in ihrem Teilbild (Splitscreen) */
  layout(split: boolean): void {
    this.gauges.forEach((g, i) => {
      const bottom = split ? (i === 0 ? 'calc(50% + 14px)' : '14px') : '';
      g.el.style.bottom = split ? bottom : '';
      g.speedEl.style.bottom = split ? bottom : '';
    });
  }

  setScore(a: number, b: number): void {
    this.s0.textContent = String(a);
    this.s1.textContent = String(b);
  }
  setClock(sec: number, overtime: boolean, training: boolean): void {
    const txt = training ? '∞' : overtime ? t('hud.overtime') : fmtTime(sec);
    if (txt === this.lastClock) return;
    this.lastClock = txt;
    this.clock.textContent = txt;
    this.clock.classList.toggle('ot', overtime);
    this.clock.classList.toggle('low', !overtime && !training && sec <= 10);
  }
  setCountdown(n: number | null): void {
    if (n === null) {
      this.count.textContent = '';
      return;
    }
    if (this.count.textContent === String(n)) return;
    this.count.textContent = String(n);
    this.count.classList.remove('pop');
    void this.count.offsetWidth;
    this.count.classList.add('pop');
  }
  show(text: string, sub: string, team: 0 | 1 | null, sticky = false): void {
    clear(this.banner);
    this.banner.append(text);
    if (sub) this.banner.append(h('small', null, sub));
    this.banner.className = 'banner' + (team === null ? '' : ' t' + team) + (sticky ? ' sticky' : '');
    void this.banner.offsetWidth;
    this.banner.classList.add('on');
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    if (!sticky) this.bannerTimer = setTimeout(() => this.banner.classList.remove('on'), 2700);
  }
  hideBanner(): void {
    this.banner.classList.remove('on');
  }
  note(text: string, team: 0 | 1 | null): void {
    const d = h('div', { class: team === null ? '' : 't' + team }, text);
    this.feed.appendChild(d);
    while (this.feed.children.length > 4) this.feed.firstChild?.remove();
    setTimeout(() => d.remove(), 4500);
  }
  dispose(): void {
    if (this.bannerTimer) clearTimeout(this.bannerTimer);
  }
}

export { TEAM_NAMES, TEAM_SYMBOL, teamColor };
