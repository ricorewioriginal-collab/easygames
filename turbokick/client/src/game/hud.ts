import { MAX_BOOST } from '@shared/sim/types';
import { TEAM_NAMES, TEAM_SYMBOL, teamColor } from '../app/theme';
import { t } from '../i18n';
import { clear, h } from '../ui/dom';
import { fmtTime } from '../ui/common';

const SVGNS = 'http://www.w3.org/2000/svg';

/** Energie-Anzeige: Sechseck aus sechs Ladesegmenten um die Zahl, dazu Tempo-Zeile */
export class BoostGauge {
  readonly el = h('div', { class: 'boost' });
  private segs: SVGPolygonElement[] = [];
  private num = h('div', { class: 'num' });
  private speed = h('div', { class: 'speed' });
  private lastB = -1;
  private lastS = -1;
  private lastBoosting = false;
  constructor() {
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    const pt = (r: number, deg: number): string => {
      const a = (deg * Math.PI) / 180;
      return `${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`;
    };
    const bg = document.createElementNS(SVGNS, 'polygon');
    bg.setAttribute('points', [0, 1, 2, 3, 4, 5].map((i) => pt(49, -90 + i * 60)).join(' '));
    bg.setAttribute('fill', 'rgba(6,5,18,0.78)');
    bg.setAttribute('stroke', 'rgba(255,255,255,0.14)');
    bg.setAttribute('stroke-width', '1.5');
    svg.append(bg);
    for (let i = 0; i < 6; i++) {
      const a0 = -90 + i * 60 + 3;
      const a1 = -90 + (i + 1) * 60 - 3;
      const seg = document.createElementNS(SVGNS, 'polygon');
      seg.setAttribute('points', [pt(45, a0), pt(45, a1), pt(35, a1), pt(35, a0)].join(' '));
      seg.setAttribute('fill', '#ffc23d');
      seg.setAttribute('fill-opacity', '0.12');
      svg.append(seg);
      this.segs.push(seg);
    }
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
      const f = (b / MAX_BOOST) * 6;
      const col = b < 20 ? '#ff4d6d' : b >= MAX_BOOST ? '#fff1b8' : '#ffc23d';
      this.segs.forEach((s, i) => {
        const k = Math.max(0, Math.min(1, f - i));
        s.setAttribute('fill', col);
        s.setAttribute('fill-opacity', String(0.12 + 0.88 * k));
      });
      this.el.classList.toggle('low', b < 20);
      this.el.classList.toggle('full', b >= MAX_BOOST);
    }
    if (boosting !== this.lastBoosting) {
      this.lastBoosting = boosting;
      this.el.classList.toggle('on', boosting);
    }
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
  private s0 = h('div', { class: 'score' }, '0');
  private s1 = h('div', { class: 'score' }, '0');
  private clock = h('div', { class: 'clock' }, '5:00');
  private banner = h('div', { class: 'banner' });
  private count = h('div', { class: 'count', 'aria-live': 'assertive' });
  private feed = h('div', { class: 'feed', 'aria-live': 'polite' });
  readonly gauges: BoostGauge[] = [];
  readonly menuBtn: HTMLButtonElement;
  private bannerTimer: ReturnType<typeof setTimeout> | null = null;
  private lastClock = '';

  constructor(localCount: number, onMenu: () => void) {
    this.menuBtn = h(
      'button',
      { type: 'button', class: 'btn ghost menubtn', 'aria-label': t('pause.title'), onclick: () => onMenu() },
      '☰',
    );
    this.el.append(
      h(
        'div',
        { class: 'scorebar' },
        h('div', { class: 'team t0' }, h('span', { class: 'tag' }, TEAM_SYMBOL[0] + ' ' + TEAM_NAMES[0]), this.s0),
        this.clock,
        h('div', { class: 'team t1' }, this.s1, h('span', { class: 'tag' }, TEAM_NAMES[1] + ' ' + TEAM_SYMBOL[1])),
      ),
      this.feed,
      this.banner,
      this.count,
      this.menuBtn,
    );
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
    for (const [el, v] of [
      [this.s0, a],
      [this.s1, b],
    ] as const) {
      if (el.textContent === String(v)) continue;
      el.textContent = String(v);
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
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
