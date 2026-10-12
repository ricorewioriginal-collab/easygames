/** Verbindet Tastatur, Maus und Touch mit den abstrakten Spielaktionen. */
import { mapKey, type GameAction, type TimedAction } from './actions';
import { SwipeTracker, laneFromX } from './gestures';

export class InputManager {
  enabled = false;
  private readonly listeners: ((a: TimedAction) => void)[] = [];
  private readonly swipes = new SwipeTracker();
  private readonly detach: (() => void)[] = [];

  constructor(private readonly surface: HTMLElement) {
    const onKey = (e: KeyboardEvent) => {
      const action = mapKey(e.code);
      if (!action) return;
      if (!this.enabled && action.type !== 'pause') return;
      if (e.repeat) {
        e.preventDefault();
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) return;
      e.preventDefault();
      this.emit(action, e.timeStamp, 'keyboard');
    };
    const onDown = (e: PointerEvent) => {
      if (!this.enabled) return;
      e.preventDefault();
      if (e.pointerType === 'mouse') {
        if (e.button !== 0) return;
        const rect = this.surface.getBoundingClientRect();
        this.emit(
          { type: 'lane', lane: laneFromX(e.clientX - rect.left, rect.width) },
          e.timeStamp,
          'mouse',
        );
        return;
      }
      this.swipes.down(e.pointerId, e.clientX, e.clientY, e.timeStamp);
      this.emit({ type: 'hit' }, e.timeStamp, 'touch');
    };
    const onMove = (e: PointerEvent) => {
      if (!this.enabled || e.pointerType === 'mouse') return;
      const g = this.swipes.move(e.pointerId, e.clientX, e.clientY, e.timeStamp);
      if (g === 'swipe-left') this.emit({ type: 'shift', dir: -1 }, e.timeStamp, 'touch');
      else if (g === 'swipe-right') this.emit({ type: 'shift', dir: 1 }, e.timeStamp, 'touch');
      else if (g === 'swipe-up') this.emit({ type: 'overdrive' }, e.timeStamp, 'touch');
    };
    const onUp = (e: PointerEvent) => this.swipes.up(e.pointerId);
    const noMenu = (e: Event) => e.preventDefault();

    window.addEventListener('keydown', onKey);
    surface.addEventListener('pointerdown', onDown);
    surface.addEventListener('pointermove', onMove);
    surface.addEventListener('pointerup', onUp);
    surface.addEventListener('pointercancel', onUp);
    surface.addEventListener('contextmenu', noMenu);
    this.detach.push(
      () => window.removeEventListener('keydown', onKey),
      () => surface.removeEventListener('pointerdown', onDown),
      () => surface.removeEventListener('pointermove', onMove),
      () => surface.removeEventListener('pointerup', onUp),
      () => surface.removeEventListener('pointercancel', onUp),
      () => surface.removeEventListener('contextmenu', noMenu),
    );
  }

  on(listener: (a: TimedAction) => void): void {
    this.listeners.push(listener);
  }

  emit(action: GameAction, at: number, source: TimedAction['source']): void {
    for (const l of this.listeners) l({ action, at, source });
  }

  dispose(): void {
    for (const d of this.detach) d();
  }
}
