/* Runen-Duell: eigenes Sammelkartenspiel der Runen-Arena.
   Drei Bahnen (Mond, Wald, Sonne). Jede Runde legen beide eine Karte auf eine Bahn. Nach 6 Karten gewinnt,
   wer mehr Bahnen mit höherer Gesamtstärke hält. Elemente: Feuer › Pflanze › Wasser › Feuer, Licht ⇄ Schatten (+2 Vorteil gegen die
   gegnerische Karte direkt gegenüber). Karteneffekte machen es taktisch. Holografische Kreaturen erscheinen auf den Karten. */
import { Minigame, type MgInput } from './base.ts';
import { btn, h } from '../ui/dom.ts';

export type Elem = 'feuer' | 'wasser' | 'pflanze' | 'licht' | 'schatten';
export interface CardDef { id: string; name: string; e: Elem; p: number; icon: string; fx?: 'wachstum' | 'spiegel' | 'schild' | 'sturm' | 'funke'; text?: string; rare?: number }
export const CARDS: Record<string, CardDef> = Object.fromEntries(([
  { id: 'c_funke', name: 'Funkenfuchs', e: 'feuer', p: 3, icon: '🦊' },
  { id: 'c_welle', name: 'Wellenkrabbe', e: 'wasser', p: 3, icon: '🦀' },
  { id: 'c_blatt', name: 'Blattling', e: 'pflanze', p: 3, icon: '🌱' },
  { id: 'c_stein', name: 'Steinwächter', e: 'licht', p: 4, icon: '🗿', fx: 'schild', text: 'Schild: Gegnerische Effekte wirken nicht auf diese Bahn.' },
  { id: 'c_wind', name: 'Windgeist', e: 'schatten', p: 2, icon: '🌪️', fx: 'sturm', text: 'Sturm: Die stärkste gegnerische Karte auf dieser Bahn verliert 2.' },
  { id: 'c_glut', name: 'Glutdrache', e: 'feuer', p: 5, icon: '🐉', rare: 2 },
  { id: 'c_perle', name: 'Perlenqualle', e: 'wasser', p: 4, icon: '🪼', fx: 'spiegel', text: 'Spiegel: Wird so stark wie die stärkste Gegnerkarte hier.' , rare: 2 },
  { id: 'c_eiche', name: 'Alte Eiche', e: 'pflanze', p: 2, icon: '🌳', fx: 'wachstum', text: 'Wachstum: Alle deine Karten auf dieser Bahn +1.', rare: 2 },
  { id: 'c_stern', name: 'Sternenhirsch', e: 'licht', p: 5, icon: '🦌', rare: 2 },
  { id: 'c_mond', name: 'Mondeule', e: 'schatten', p: 4, icon: '🦉', rare: 2 },
  { id: 'c_phoenix', name: 'Prisma-Phönix', e: 'licht', p: 6, icon: '🐦‍🔥', fx: 'funke', text: 'Funke: Deine nächste Karte bekommt +2.', rare: 3 },
  { id: 'c_kraken', name: 'Tiefenkrake', e: 'wasser', p: 6, icon: '🐙', rare: 3 },
  { id: 'c_golem', name: 'Moosgolem', e: 'pflanze', p: 6, icon: '🪨', rare: 3 },
  { id: 'c_schatten', name: 'Schattenkatze', e: 'schatten', p: 5, icon: '🐈‍⬛', fx: 'sturm', text: 'Sturm: Die stärkste gegnerische Karte auf dieser Bahn verliert 2.', rare: 3 }
] as CardDef[]).map(c => [c.id, c]));
const BEATS: Record<Elem, Elem[]> = { feuer: ['pflanze'], pflanze: ['wasser'], wasser: ['feuer'], licht: ['schatten'], schatten: ['licht'] };
const LANES = ['🌙 Mond', '🌲 Wald', '☀️ Sonne'];
const EL_ICON: Record<Elem, string> = { feuer: '🔥', wasser: '💧', pflanze: '🍃', licht: '✨', schatten: '🌑' };

interface Played { c: CardDef; bonus: number; side: 0 | 1 }
export interface Rival { name: string; icon: string; deck: string[]; level: number }

export class RunenDuell extends Minigame {
  title = 'Runen-Duell'; icon = '🃏';
  howto = ['Wähle eine Karte aus deiner Hand und tippe dann auf eine Bahn.', 'Element-Vorteil (+2) gegen die Gegnerkarte auf derselben Bahn: 🔥 › 🍃 › 💧 › 🔥 und ✨ ⇄ 🌑.', 'Nach 6 Karten gewinnt, wer mehr Bahnen hält.'];
  controls = 'Antippen / Anklicken';
  private root = h('div', { class: 'cardgame' });
  private lanes: Played[][] = [[], [], []];
  private hand: CardDef[] = [];
  private deck: CardDef[] = [];
  private aiDeck: CardDef[] = [];
  private sel = -1;
  private turn = 0;
  private funke = [0, 0];
  private log = '';
  private rival: Rival = { name: 'Runen-Rita', icon: '🧙‍♀️', deck: [], level: 1 };
  dom(): HTMLElement { return this.root; }
  init(): void {
    this.rival = (this.o.rival as Rival) ?? this.rival;
    const own = (this.o.deck as string[])?.length ? (this.o.deck as string[]) : ['c_funke', 'c_funke', 'c_welle', 'c_welle', 'c_blatt', 'c_blatt', 'c_stein', 'c_wind'];
    this.deck = shuffle(own.map(id => CARDS[id]).filter(Boolean));
    this.aiDeck = shuffle((this.rival.deck.length ? this.rival.deck : ['c_funke', 'c_welle', 'c_blatt', 'c_stein', 'c_wind', 'c_glut', 'c_perle', 'c_mond']).map(id => CARDS[id]));
    this.hand = this.deck.splice(0, 4);
    this.lanes = [[], [], []]; this.sel = -1; this.turn = 0; this.funke = [0, 0]; this.score = 0; this.log = this.rival.icon + ' ' + this.rival.name + ' fordert dich heraus!';
    this.render();
  }
  step(_dt: number, _i: MgInput): void { }
  draw(): void { }
  private power(lane: number, side: 0 | 1): number {
    const mine = this.lanes[lane].filter(p => p.side === side), theirs = this.lanes[lane].filter(p => p.side !== side);
    let sum = 0;
    for (const p of mine) {
      let v = p.c.p + p.bonus;
      if (p.c.fx === 'spiegel') v = Math.max(v, ...theirs.map(t => t.c.p + t.bonus), 0);
      if (theirs.some(t => BEATS[p.c.e].includes(t.c.e))) v += 2;
      sum += v;
    }
    return Math.max(0, sum);
  }
  private applyFx(lane: number, played: Played): void {
    const side = played.side, other = side ? 0 : 1;
    const shielded = this.lanes[lane].some(p => p.side === other && p.c.fx === 'schild');
    if (this.funke[side] > 0) { played.bonus += this.funke[side]; this.funke[side] = 0; }
    switch (played.c.fx) {
      case 'wachstum': for (const p of this.lanes[lane]) if (p.side === side) p.bonus += 1; break;
      case 'sturm': if (!shielded) { const t = this.lanes[lane].filter(p => p.side === other).sort((a, b) => (b.c.p + b.bonus) - (a.c.p + a.bonus))[0]; if (t) t.bonus -= 2; } break;
      case 'funke': this.funke[side] = 2; break;
    }
  }
  private play(handIdx: number, lane: number): void {
    const c = this.hand[handIdx];
    if (!c || this.lanes[lane].filter(p => p.side === 0).length >= 3) return;
    const p: Played = { c, bonus: 0, side: 0 };
    this.lanes[lane].push(p); this.applyFx(lane, p);
    this.hand.splice(handIdx, 1);
    if (this.deck.length) this.hand.push(this.deck.shift()!);
    this.sfx('magic', 0.6);
    // Gegner antwortet
    const ai = this.aiChoose();
    if (ai) { const q: Played = { c: ai.c, bonus: 0, side: 1 }; this.lanes[ai.lane].push(q); this.applyFx(ai.lane, q); this.log = this.rival.icon + ' spielt ' + ai.c.icon + ' ' + ai.c.name + ' auf ' + LANES[ai.lane] + '.'; }
    this.turn++; this.sel = -1;
    if (this.turn >= 6) this.end(); else this.render();
  }
  private aiChoose(): { c: CardDef; lane: number } | null {
    if (!this.aiDeck.length) return null;
    const hand = this.aiDeck.slice(0, Math.min(3, this.aiDeck.length));
    let best = { score: -99, i: 0, lane: 0 };
    hand.forEach((c, i) => {
      for (let l = 0; l < 3; l++) {
        if (this.lanes[l].filter(p => p.side === 1).length >= 3) continue;
        const diff = this.power(l, 1) - this.power(l, 0);
        const adv = this.lanes[l].some(p => p.side === 0 && BEATS[c.e].includes(p.c.e)) ? 2 : 0;
        // Bahnen gewinnen, die knapp sind; schon klar gewonnene nicht überfüllen
        const s = c.p + adv - Math.abs(diff + c.p + adv) * 0.25 + (diff < 0 && diff + c.p + adv > 0 ? 4 : 0) + Math.random() * (3 - this.rival.level);
        if (s > best.score) best = { score: s, i, lane: l };
      }
    });
    const c = this.aiDeck.splice(best.i, 1)[0];
    return { c, lane: best.lane };
  }
  private end(): void {
    let won = 0, lost = 0;
    for (let l = 0; l < 3; l++) { const a = this.power(l, 0), b = this.power(l, 1); if (a > b) won++; else if (b > a) lost++; }
    this.score = won * 10 + [0, 1, 2].reduce((s, l) => s + this.power(l, 0), 0);
    this.render();
    setTimeout(() => this.finish(won > lost, won + ' : ' + lost + ' Bahnen gegen ' + this.rival.name), 600);
  }
  private render(): void {
    const r = this.root;
    r.replaceChildren();
    r.append(h('div', { class: 'row' }, h('b', null, this.rival.icon + ' ' + this.rival.name), h('span', { class: 'spacer' }), h('span', { class: 'chip' }, 'Zug ' + Math.min(6, this.turn + 1) + ' / 6')));
    const lanes = h('div', { class: 'lanes' });
    for (let l = 0; l < 3; l++) {
      const a = this.power(l, 0), b = this.power(l, 1);
      const ln = h('div', { class: 'lane' + (this.sel >= 0 ? ' pick' : ''), role: 'button', 'aria-label': LANES[l], onclick: () => { if (this.sel >= 0) this.play(this.sel, l); } },
        h('div', { class: 'score' }, b + (b > a ? ' 👑' : '')),
        h('div', { class: 'row', style: 'justify-content:center;gap:4px;flex-wrap:wrap' }, this.lanes[l].filter(p => p.side === 1).map(p => mini(p))),
        h('div', null, LANES[l]),
        h('div', { class: 'row', style: 'justify-content:center;gap:4px;flex-wrap:wrap' }, this.lanes[l].filter(p => p.side === 0).map(p => mini(p))),
        h('div', { class: 'score' }, a + (a > b ? ' 👑' : '')));
      lanes.append(ln);
    }
    r.append(lanes, h('div', { class: 'muted', style: 'text-align:center;min-height:1.4em' }, this.log));
    const hand = h('div', { class: 'hand' }, this.hand.map((c, i) => card(c, this.sel === i, () => { this.sel = this.sel === i ? -1 : i; this.sfx('click'); this.render(); })));
    r.append(hand);
    const sc = this.hand[this.sel];
    r.append(h('div', { class: 'muted', style: 'text-align:center;min-height:1.4em' }, sc ? (sc.text ?? sc.icon + ' ' + sc.name + ': ' + EL_ICON[sc.e] + ' Stärke ' + sc.p) + ' → Tippe auf eine Bahn.' : 'Wähle eine Karte.'));
  }
}
function shuffle<T>(a: T[]): T[] { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }
function card(c: CardDef, sel: boolean, on: () => void): HTMLElement {
  return h('button', { type: 'button', class: 'rcard el-' + c.e + (sel ? ' sel' : ''), onclick: on, title: c.text ?? '' }, h('span', { class: 'p' }, String(c.p)), h('span', { class: 'e' }, c.icon), h('span', { class: 'nm' }, c.name), h('span', null, EL_ICON[c.e] + (c.fx ? ' ★' : '')));
}
function mini(p: Played): HTMLElement { return h('span', { class: 'chip', style: 'font-size:.8rem;color:#2a1f4a' }, p.c.icon + (p.c.p + p.bonus)); }

/** Deck-Verwaltung: aus den eigenen Karten genau 8 wählen. */
export function deckEditor(owned: Record<string, number>, deck: string[], onSave: (d: string[]) => void): HTMLElement {
  let cur = deck.length ? [...deck] : [];
  const root = h('div');
  const draw = () => {
    root.replaceChildren(h('p', null, 'Dein Deck: ' + cur.length + ' / 8 Karten. Tippe Karten an, um sie hinzuzufügen oder zu entfernen.'));
    root.append(h('div', { class: 'hand', style: 'min-height:auto' }, cur.map((id, i) => card(CARDS[id], false, () => { cur.splice(i, 1); draw(); }))));
    root.append(h('h3', null, 'Deine Sammlung'));
    root.append(h('div', { class: 'hand', style: 'min-height:auto' }, Object.entries(owned).filter(([id]) => CARDS[id]).map(([id, n]) => {
      const used = cur.filter(x => x === id).length;
      const el = card(CARDS[id], false, () => { if (used < n && cur.length < 8) { cur.push(id); draw(); } });
      el.append(h('span', { class: 'chip', style: 'position:absolute;bottom:-8px;font-size:.7rem;color:#2a1f4a' }, (n - used) + '×'));
      if (used >= n) el.style.opacity = '.4';
      return el;
    })));
    root.append(h('div', { class: 'row', style: 'margin-top:12px' }, btn('Speichern', () => { if (cur.length === 8) onSave(cur); }, cur.length === 8 ? 'green' : 'ghost'), h('span', { class: 'muted' }, cur.length === 8 ? '' : 'Genau 8 Karten nötig.')));
  };
  draw();
  return root;
}
