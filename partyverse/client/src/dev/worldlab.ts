/** Welten-Labor (?worldlab=<layout-id>) – wird vom Welten-Auftrag implementiert. */
export function startWorldLab(_params: URLSearchParams): void {
  const el = document.getElementById('app');
  if (el) el.textContent = 'Welten-Labor: noch nicht implementiert';
}
