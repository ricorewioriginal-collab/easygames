/* Kleiner typisierter Ereignisbus: Systeme kennen sich nicht direkt, sondern hören auf Ereignisse. */
export type Handler<T> = (payload: T) => void;

export class Emitter<M extends Record<string, unknown>> {
  private map = new Map<keyof M, Set<Handler<never>>>();
  on<K extends keyof M>(k: K, fn: Handler<M[K]>): () => void {
    let s = this.map.get(k);
    if (!s) this.map.set(k, (s = new Set()));
    s.add(fn as Handler<never>);
    return () => s!.delete(fn as Handler<never>);
  }
  emit<K extends keyof M>(k: K, payload: M[K]): void {
    this.map.get(k)?.forEach((fn) => (fn as Handler<M[K]>)(payload));
  }
}
