/** Spielzustände der Anwendung mit expliziten, geprüften Übergängen. */
export type AppState = 'menu' | 'countdown' | 'playing' | 'paused' | 'results';

const TRANSITIONS: Record<AppState, readonly AppState[]> = {
  menu: ['countdown'],
  countdown: ['playing', 'paused', 'menu'],
  playing: ['paused', 'results', 'menu', 'countdown'],
  paused: ['playing', 'countdown', 'menu'],
  results: ['menu', 'countdown'],
};

export class StateMachine {
  private current: AppState = 'menu';
  private listeners: ((to: AppState, from: AppState) => void)[] = [];

  get state(): AppState {
    return this.current;
  }

  can(to: AppState): boolean {
    return TRANSITIONS[this.current].includes(to);
  }

  go(to: AppState): boolean {
    if (!this.can(to)) return false;
    const from = this.current;
    this.current = to;
    for (const l of this.listeners) l(to, from);
    return true;
  }

  onChange(listener: (to: AppState, from: AppState) => void): void {
    this.listeners.push(listener);
  }
}
