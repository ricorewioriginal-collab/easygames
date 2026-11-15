import { GLYPH_COLORS, currentPadKind, padGlyph } from '../input/gamepad';
import { h } from './dom';

/** Konsolen-Hinweisleiste unten: zeigt Controller-Symbole (Xbox/PS/Switch) oder Tasten, je nach letztem Gerät */
export function hintBar(items: Array<[number, string, string]>): { el: HTMLElement; dispose(): void } {
  const el = h('div', { class: 'hintbar', 'aria-hidden': 'true' });
  const hasPad = (): boolean => {
    try {
      return [...(navigator.getGamepads?.() ?? [])].some((p) => !!p);
    } catch {
      return false;
    }
  };
  const render = (): void => {
    el.textContent = '';
    const pad = hasPad();
    const kind = currentPadKind();
    for (const [idx, key, label] of items) {
      const g = pad ? padGlyph(idx, kind) : key;
      const col = pad && idx < 4 ? (GLYPH_COLORS[kind][idx] ?? '') : '';
      el.append(
        h(
          'span',
          { class: 'hint' },
          h('b', { class: pad ? 'pad' : 'key', style: col ? `--g:${col}` : '' }, g),
          label,
        ),
      );
    }
  };
  render();
  const on = (): void => render();
  window.addEventListener('gamepadconnected', on);
  window.addEventListener('gamepaddisconnected', on);
  return {
    el,
    dispose: () => {
      window.removeEventListener('gamepadconnected', on);
      window.removeEventListener('gamepaddisconnected', on);
    },
  };
}
