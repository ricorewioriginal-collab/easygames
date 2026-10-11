import type { MiniGameViewFactory } from '../viewTypes';

/** PLATZHALTER-Ansicht – wird durch die echte Implementierung ersetzt. */
export const createView: MiniGameViewFactory = () => ({ update() {}, dispose() {} });
