/* Fehlerprotokoll: letzte Fehler für Diagnose/Fehlerbericht; Spiel läuft weiter. */
const recent: string[] = [];
export const logError = (where: string, err: unknown): void => {
  const msg = where + ': ' + (err instanceof Error ? err.message : String(err));
  recent.push(new Date().toISOString().slice(11, 19) + ' ' + msg);
  if (recent.length > 20) recent.shift();
  console.error('[BI2] ' + where, err);
};
export const recentErrors = (): readonly string[] => recent;
