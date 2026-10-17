// Rückgängig/Wiederholen für den Bau-/Kaufmodus (reine Logik).

export interface Command {
  readonly label: string;
  /** true = erledigt, Text = Grund, warum es nicht ging (Stapel bleibt unverändert) */
  undo(): true | string;
  redo(): true | string;
}

export class History<C extends Command = Command> {
  private done: C[] = [];
  private undone: C[] = [];
  constructor(readonly cap = 100) {}

  push(c: C): void {
    this.done.push(c);
    this.undone.length = 0;
    if (this.done.length > this.cap) this.done.splice(0, this.done.length - this.cap);
  }
  get canUndo(): boolean {
    return this.done.length > 0;
  }
  get canRedo(): boolean {
    return this.undone.length > 0;
  }
  get size(): number {
    return this.done.length;
  }
  /** null = nichts zu tun, sonst Ergebnis des Befehls */
  undo(): { cmd: C; res: true | string } | null {
    const c = this.done[this.done.length - 1];
    if (!c) return null;
    const res = c.undo();
    if (res === true) {
      this.done.pop();
      this.undone.push(c);
    }
    return { cmd: c, res };
  }
  redo(): { cmd: C; res: true | string } | null {
    const c = this.undone[this.undone.length - 1];
    if (!c) return null;
    const res = c.redo();
    if (res === true) {
      this.undone.pop();
      this.done.push(c);
    }
    return { cmd: c, res };
  }
  clear(): void {
    this.done.length = 0;
    this.undone.length = 0;
  }
}
