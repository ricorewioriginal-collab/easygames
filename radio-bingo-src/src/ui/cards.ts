/** Bingo-Karten als HTML (scharf und gut antippbar auf jedem Gerät) und die kleine Muster-Vorschau. */
import { LETTERS, type Card, type Pattern } from '../core/bingo';
import { ballColor } from '../render/studio';

export interface CardState {
  card: Card;
  marks: boolean[];
  joker: number;
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
export function patternMini(p: Pattern, big = false): string {
  if (p.kind === 90)
    return `<span class="pmini p90${big ? ' big' : ''}" aria-hidden="true">${Array.from({ length: 27 }, (_, i) => `<i class="${p.preview.includes(i) ? 'on' : ''}"></i>`).join('')}</span>`;
  return `<span class="pmini${big ? ' big' : ''}" aria-hidden="true">${Array.from({ length: 25 }, (_, i) => `<i class="${p.preview.includes(i) ? 'on' : ''}"></i>`).join('')}</span>`;
}
export function renderCards(el: HTMLElement, cards: CardState[], drawn: Set<number>, p: Pattern, opt: { hint: boolean; cur: [number, number] | null; missing: number[] }) {
  el.innerHTML = cards
    .map((cs, ci) => {
      const c = cs.card,
        is75 = c.kind === 75,
        m = opt.missing[ci];
      const head = is75 ? `<div class="chead">${LETTERS.map((l, i) => `<b style="--c:${ballColor(i * 15 + 1, 75)}">${l}</b>`).join('')}</div>` : '';
      const mask = new Set(p.kind === 75 && !['linie', 'zwei'].includes(p.id) ? p.preview : []);
      const cells = c.cells
        .map((n, i) => {
          if (is75 && i === 12) return `<button class="cell free on" data-c="${ci}" data-i="${i}" tabindex="-1" aria-label="Freifeld"><span>📻</span></button>`;
          if (!n) return `<span class="cell blank"></span>`;
          const on = cs.marks[i],
            can = !on && drawn.has(n) && opt.hint,
            cur = opt.cur && opt.cur[0] === ci && opt.cur[1] === i;
          return `<button class="cell${on ? ' on' : ''}${cs.joker === i ? ' gold' : ''}${can ? ' can' : ''}${mask.has(i) ? ' pat' : ''}${cur ? ' cur' : ''}" data-c="${ci}" data-i="${i}" tabindex="-1" aria-label="${n}${on ? ' markiert' : ''}">${n}</button>`;
        })
        .join('');
      return `<div class="card${is75 ? '' : ' c90'}${m === 0 ? ' won' : m === 1 ? ' near' : ''}" data-card="${ci}"><div class="ctop"><span>Karte ${ci + 1}</span><em>${m === 0 ? '🎉 Bingo!' : m === 1 ? '🔥 noch 1' : m + ' fehlen'}</em></div>${head}<div class="grid">${cells}</div></div>`;
    })
    .join('');
}
export const escHtml = esc;
