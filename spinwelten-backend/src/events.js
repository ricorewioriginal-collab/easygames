/* Events rotieren alle 3 Tage ab 2026-01-01 00:00 UTC in fester Reihenfolge (nur Server-Uhr). */
'use strict';

const IDS = ['bau_festival', 'sternenregen', 'kristalljagd', 'kompass_woche', 'portalmarathon', 'kartenfest', 'freundeshilfe',
  'begleiter_rallye', 'sturmmeisterschaft', 'insel_rennen', 'reliktfest', 'team_expedition'];
const START = Date.UTC(2026, 0, 1), LEN = 3 * 864e5;

function eventAt(now) {
  const n = Math.floor((now - START) / LEN);
  const idx = ((n % IDS.length) + IDS.length) % IDS.length;
  const start = START + n * LEN;
  return { id: IDS[idx], index: idx, start: new Date(start).toISOString(), end: new Date(start + LEN).toISOString(), next: IDS[(idx + 1) % IDS.length] };
}

module.exports = function events(ctx) {
  return { events: ({ now }) => ({ ok: true, result: { current: eventAt(now), serverTime: new Date(now).toISOString(), ids: IDS.slice() } }) };
};
module.exports.eventAt = eventAt;
module.exports.IDS = IDS;
