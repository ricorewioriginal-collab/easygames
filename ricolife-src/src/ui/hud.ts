// HUD im Lebensmodus: Uhr, Tempo, Wetter, Geld, Familienporträts, Figurenkarte mit Bedürfnissen, Stimmung und Warteschlange.
import { NEED_IDS, type NeedId } from '../data/types';
import { idef } from '../sim/interact';
import { labelOf, ctxOf } from '../sim/actions';
import { moodDef } from '../sim/game';
import { fmtMoney } from '../core/util';
import { WEATHER_ICONS, WEATHER_NAMES } from '../sim/world-sys';
import { careerDef, levelOf, shiftWindow, worksOn } from '../sim/career';
import { questOf, goalProgress, storyById } from '../sim/stories';
import type { Sim } from '../sim/types';
import { dismissWish, wishAction, wishIcon, wishLabel } from '../sim/wishes';
import type { AppApi } from './api';
import { h, clear, bar, btn } from './dom';

export const NEED_NAMES: Record<NeedId, string> = { hunger: 'Hunger', energy: 'Energie', hygiene: 'Hygiene', bladder: 'Blase', social: 'Soziales', fun: 'Spaß', comfort: 'Komfort' };
export const NEED_ICONS: Record<NeedId, string> = { hunger: '🍽️', energy: '⚡', hygiene: '🫧', bladder: '🚻', social: '💬', fun: '🎈', comfort: '🛋️' };
export const EMO_ICONS: Record<string, string> = { fine: '🙂', happy: '😊', sad: '😢', love: '🥰', tense: '😣', focused: '🧐', inspired: '💡', angry: '😠', embarrassed: '😳', tired: '🥱', playful: '😜', confident: '😎' };
export const EMO_NAMES: Record<string, string> = { fine: 'Ausgeglichen', happy: 'Glücklich', sad: 'Traurig', love: 'Verliebt', tense: 'Angespannt', focused: 'Konzentriert', inspired: 'Inspiriert', angry: 'Wütend', embarrassed: 'Verlegen', tired: 'Müde', playful: 'Verspielt', confident: 'Selbstbewusst' };
const NEG = new Set(['sad', 'tense', 'angry', 'embarrassed', 'tired']);

export function initials(s: Sim): string {
  return (s.first[0] ?? '?') + (s.last[0] ?? '');
}

export class Hud {
  readonly el: HTMLElement;
  private top = h('div', { class: 'hud-top' });
  private right = h('div', { class: 'hud-right' });
  private bottom = h('div', { class: 'hud-bottom' });
  private clockEl = h('div', { class: 'clock' });
  private moneyEl = h('div', { class: 'money' });
  private weatherEl = h('div', { class: 'weather', title: '' });
  private spdBtns: HTMLButtonElement[] = [];
  private portraits = h('div', { class: 'portraits' });
  private card = h('div', { class: 'simcard' });
  private questEl = h('div', { class: 'pill quest hidden', style: 'max-width:260px;font-size:.8em;padding:6px 10px;cursor:pointer' });
  private sig = '';
  private cardSig = '';
  private min = false;

  constructor(private app: AppApi) {
    this.el = h('div', { id: 'hud' });
    const spd = h('div', { class: 'pill spd' });
    const labels = ['⏸', '▶', '▶▶', '▶▶▶'];
    labels.forEach((l, i) => {
      const b = btn(l, () => app.setSpeed(i), 'small', { 'aria-label': ['Pause', 'Normal', 'Schnell', 'Sehr schnell'][i] });
      this.spdBtns.push(b);
      spd.appendChild(b);
    });
    this.top.append(this.portraits, h('div', { class: 'grow' }), h('div', { class: 'pill' }, this.clockEl, this.weatherEl), spd, h('div', { class: 'pill' }, this.moneyEl));
    const rb = (icon: string, label: string, fn: () => void, id?: string): HTMLButtonElement => btn(icon, fn, '', { 'aria-label': label, title: label, id });
    this.right.append(
      rb('☰', 'Menü', () => app.openPauseMenu(), 'btnMenu'),
      rb('🛋️', 'Kaufmodus', () => app.setMode(app.mode === 'buy' ? 'live' : 'buy'), 'btnBuy'),
      rb('🧱', 'Baumodus', () => app.setMode(app.mode === 'build' ? 'live' : 'build'), 'btnBuild'),
      rb('📱', 'Handy', () => app.openPhone(), 'btnPhone'),
      rb('🗺️', 'Stadtkarte', () => app.openMap(), 'btnMap'),
      rb('🏠', 'Stockwerk wechseln', () => app.setLevel(app.level ? 0 : 1), 'btnLevel'),
      rb('🧱', 'Wände: hoch / Schnitt / unten', () => app.setWallMode(app.wallMode === 'up' ? 'cut' : app.wallMode === 'cut' ? 'down' : 'up'), 'btnWalls'),
    );
    this.questEl.addEventListener('click', () => app.openSimInfo(app.g.activeSim ?? '', 'story'));
    this.bottom.append(this.card);
    this.el.append(this.top, this.right, this.bottom, this.questEl);
    this.questEl.style.position = 'absolute';
    this.questEl.style.top = 'calc(62px + var(--safe-t))';
    this.questEl.style.left = 'calc(6px + var(--safe-l))';
  }

  setVisible(v: boolean): void {
    this.el.classList.toggle('hidden', !v);
  }
  /** Im Bau-/Kaufmodus nur Kopfzeile zeigen */
  setCompact(c: boolean): void {
    this.bottom.classList.toggle('hidden', c);
    this.questEl.classList.toggle('hidden', c || !this.app.g.story);
  }

  update(): void {
    const g = this.app.g;
    const hh = g.hh;
    this.clockEl.innerHTML = `${g.clock.timeStr()}<small>${g.clock.dateStr()}</small>`;
    this.weatherEl.textContent = `${WEATHER_ICONS[g.weather.now]} ${g.weather.temp}°`;
    this.weatherEl.title = WEATHER_NAMES[g.weather.now];
    this.moneyEl.textContent = hh ? fmtMoney(hh.funds) : '';
    this.moneyEl.classList.toggle('hidden', !hh);
    this.spdBtns.forEach((b, i) => {
      b.classList.toggle('on', g.clock.speed === i);
      b.disabled = this.app.isGuest;
    });
    (this.right.querySelector('#btnBuy') as HTMLElement).classList.toggle('on', this.app.mode === 'buy');
    (this.right.querySelector('#btnBuild') as HTMLElement).classList.toggle('on', this.app.mode === 'build');
    (this.right.querySelector('#btnBuy') as HTMLButtonElement).disabled = this.app.isGuest;
    (this.right.querySelector('#btnBuild') as HTMLButtonElement).disabled = this.app.isGuest;
    (this.right.querySelector('#btnLevel') as HTMLElement).textContent = this.app.level ? '⬆️' : '⬇️';
    (this.right.querySelector('#btnLevel') as HTMLElement).title = this.app.level ? 'Obergeschoss (zum Erdgeschoss wechseln)' : 'Erdgeschoss (zum Obergeschoss wechseln)';
    (this.right.querySelector('#btnWalls') as HTMLElement).textContent = this.app.wallMode === 'up' ? '🧱' : this.app.wallMode === 'cut' ? '✂️' : '⬜';
    this.updatePortraits();
    this.updateCard();
    this.updateQuest();
  }

  private updatePortraits(): void {
    const g = this.app.g;
    const mem = this.app.isGuest ? [g.active].filter((x): x is Sim => !!x) : g.members();
    const sig = mem.map((m) => `${m.id}${m.emo}${m.away ? 1 : 0}${g.activeSim === m.id ? 1 : 0}`).join('|');
    if (sig === this.sig) return;
    this.sig = sig;
    clear(this.portraits);
    for (const m of mem) {
      const p = h('button', { class: `portrait ${g.activeSim === m.id ? 'on' : ''} ${m.away ? 'away' : ''}`, title: `${m.first} ${m.last}${m.away ? ' (unterwegs)' : ''}`, 'aria-label': `${m.first} auswählen`, style: `background:${m.look.outfits.everyday.topColor}` }, initials(m), h('span', { class: 'emo' }, EMO_ICONS[m.emo] ?? '🙂'));
      p.addEventListener('click', () => this.app.select(m.id));
      p.addEventListener('dblclick', () => this.app.openSimInfo(m.id));
      this.portraits.appendChild(p);
    }
  }

  private updateCard(): void {
    const g = this.app.g;
    const s = g.active;
    if (!s) {
      this.card.classList.add('hidden');
      return;
    }
    this.card.classList.remove('hidden');
    const q = s.queue;
    const sig = `${s.id}|${s.emo}|${s.moods.map((m) => m.id).join(',')}|${q.map((a) => a.uid + a.phase).join(',')}|${this.min}|${s.away?.kind ?? ''}|${s.career?.onSite ? s.career.tasks : ''}|${(s.wishes ?? []).map((w) => w.k + (w.t ?? '')).join(',')}|${s.wishPoints ?? 0}`;
    if (sig !== this.cardSig) {
      this.cardSig = sig;
      this.buildCard(s);
    }
    // Werte ohne Neuaufbau aktualisieren
    for (const n of NEED_IDS) {
      const el = this.card.querySelector<HTMLElement>(`[data-need="${n}"]`);
      if (!el) continue;
      const v = Math.round(s.needs[n]);
      const b = el.querySelector<HTMLElement>('.pbar')!;
      b.className = `pbar ${v < 20 ? 'crit' : v < 40 ? 'low' : ''}`;
      (b.firstElementChild as HTMLElement).style.width = `${v}%`;
    }
    const cur = q[0];
    const pi = this.card.querySelector<HTMLElement>('.qitem.cur .p i');
    if (pi && cur && cur.phase === 'perform' && cur.dur > 0) pi.style.width = `${Math.min(100, (cur.t / cur.dur) * 100)}%`;
  }

  private buildCard(s: Sim): void {
    const g = this.app.g;
    clear(this.card);
    this.card.classList.toggle('min', this.min);
    const status = s.away ? (s.away.kind === 'work' ? '💼 Bei der Arbeit' : s.away.kind === 'school' ? '🏫 In der Schule' : s.away.kind === 'travel' ? '🚗 Unterwegs' : '🚶 Unterwegs') : '';
    this.card.append(
      h('div', { class: 'name' }, h('span', null, EMO_ICONS[s.emo] ?? '🙂'), h('span', { class: 'grow' }, `${s.first} ${s.last}`), btn(this.min ? '▴' : '▾', () => { this.min = !this.min; this.cardSig = ''; }, 'small ghost', { 'aria-label': this.min ? 'Karte aufklappen' : 'Karte einklappen' })),
      h('div', { class: 'mood' }, `${EMO_NAMES[s.emo] ?? ''}${status ? ' · ' + status : ''}`),
    );
    const needs = h('div', { class: 'needs' });
    for (const n of NEED_IDS) needs.appendChild(h('div', { class: 'need', 'data-need': n, title: NEED_NAMES[n] }, h('span', null, h('span', null, `${NEED_ICONS[n]} ${NEED_NAMES[n]}`)), bar(s.needs[n])));
    this.card.appendChild(needs);
    const ml = h('div', { class: 'moodlets' });
    for (const m of s.moods.slice(0, 6)) {
      const d = moodDef(m.id);
      if (!d) continue;
      ml.appendChild(h('span', { class: `moodlet ${NEG.has(d.emo) ? 'neg' : ''}`, title: d.text }, d.text.split(/[.:–]/)[0]!.slice(0, 26)));
    }
    this.card.appendChild(ml);
    if (g.isControllable(s) && !this.app.isGuest && s.age !== 'baby' && s.age !== 'toddler') this.card.appendChild(this.wishRow(s));
    if (s.career?.onSite) {
      const lv = levelOf(s);
      const goal = Math.max(3, Math.round((lv?.hours ?? 6) * 0.8));
      this.card.appendChild(h('div', { class: 'worktip' }, `💼 Schicht läuft: ${s.career.tasks}/${goal} Aufgaben – klicke Arbeitsgeräte (Kasse, Kaffeemaschine, Liege, Mikrofon …)`));
    } else if (s.career && !s.away) {
      const d = g.clock.day;
      const win = shiftWindow(s, d);
      if (win && worksOn(s, d) && g.clock.min < win[0] && g.clock.min > win[0] - 180) this.card.appendChild(h('div', { class: 'worktip' }, `⏰ Arbeit (${careerDef(s.career.id)?.name}) um ${String(levelOf(s)!.start).padStart(2, '0')}:00`));
    }
    const qu = h('div', { class: 'queue', 'aria-label': 'Warteschlange' });
    s.queue.slice(0, 6).forEach((a, i) => {
      const d = idef(a.def);
      if (!d || d.id === 'socReact' || d.id === 'babyHeld') return;
      const lbl = labelOf(d, ctxOf(g, s, a));
      const it = h('button', { class: `qitem ${i === 0 ? 'cur' : ''}`, title: `${lbl} – antippen zum Abbrechen`, 'aria-label': `${lbl} abbrechen` }, d.icon, i === 0 ? h('span', { class: 'p' }, h('i', { style: 'width:0' })) : null);
      it.addEventListener('click', () => this.app.cancel(s.id, a.uid));
      qu.appendChild(it);
    });
    if (!qu.children.length) qu.appendChild(h('small', { class: 'muted', style: 'align-self:center' }, this.app.g.isControllable(s) || this.app.isGuest ? 'Tippe auf Gegenstände oder Personen' : ''));
    this.card.appendChild(qu);
    this.card.appendChild(
      h(
        'div',
        { class: 'cardbtns' },
        btn('👤 Info', () => this.app.openSimInfo(s.id)),
        btn('🧍 Ich', () => this.app.command(s.id, { kind: 'self' }, { def: '', label: '', icon: '', group: '', avail: true })),
        btn('🎯 Fokus', () => this.app.focusOn(s.x, s.z)),
        s.career?.onSite ? btn('🏁 Feierabend', () => this.app.command(s.id, { kind: 'self' }, { def: 'leaveWork', label: '', icon: '', group: '', avail: true })) : null,
      ),
    );
  }

  /** Zeile „Wünsche“: bis zu 3 Chips (Klick = passende Handlung, ✕ = verwerfen) und Wunschpunkte */
  private wishRow(s: Sim): HTMLElement {
    const g = this.app.g;
    const row = h('div', { class: 'wishes', 'aria-label': 'Wünsche' }, h('span', { class: 'wl' }, 'Wünsche'));
    (s.wishes ?? []).forEach((w, i) => {
      const label = wishLabel(g, w);
      const chip = h('button', { class: 'wish', title: `${label} – antippen zum Erledigen`, 'aria-label': label }, h('span', null, wishIcon(w)), h('span', { class: 'wt' }, label));
      chip.addEventListener('click', () => {
        const act = wishAction(g, s, w);
        if (act) this.app.command(s.id, act.tg, act.it);
        else g.notify(`${s.first} wünscht sich: ${label}`, wishIcon(w), s.id);
      });
      const x = h('button', { class: 'wishx', title: 'Wunsch verwerfen', 'aria-label': `${label} verwerfen` }, '✕');
      x.addEventListener('click', () => {
        dismissWish(s, i);
        this.cardSig = '';
      });
      row.appendChild(h('span', { class: 'wishchip' }, chip, x));
    });
    if (!s.wishes?.length) row.appendChild(h('small', { class: 'muted' }, 'gerade wunschlos'));
    row.appendChild(h('span', { class: 'wishpts', title: 'Wunschpunkte' }, `✨ ${s.wishPoints ?? 0}`));
    return row;
  }

  private updateQuest(): void {
    const g = this.app.g;
    const q = questOf(g);
    if (!g.story || !q || g.story.finished || this.app.mode !== 'live') {
      this.questEl.classList.add('hidden');
      return;
    }
    this.questEl.classList.remove('hidden');
    const st = storyById(g.story.id);
    const lines = q.goals.map((goal) => {
      const p = Math.min(goal.n, Math.floor(goalProgress(g, goal)));
      return `${p >= goal.n ? '✅' : '▫️'} ${goal.label} (${p}/${goal.n})`;
    });
    const html = `<b>${st?.icon ?? '📜'} ${q.title}</b><br>${lines.join('<br>')}`;
    if (this.questEl.innerHTML !== html) this.questEl.innerHTML = html;
  }
}
