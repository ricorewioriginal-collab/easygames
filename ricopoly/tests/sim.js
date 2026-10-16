// Hilfsfunktion: spielt eine Partie nur mit Bots bis zum Ende (für Tests)
'use strict';
const R = require('../js/rules.js'), AI = require('../js/ai.js');
function runGame(opt, check) {
  let s = R.newGame(opt), steps = 0, actions = 0;
  const limit = opt.limit || 60000;
  while (s.phase !== 'over' && steps++ < limit) {
    let act = null;
    for (const p of R.active(s)) { act = AI.next(s, p); if (act) break; }
    if (!act) throw new Error('Kein Bot kann handeln in Phase ' + s.phase + ' (actor ' + R.actor(s) + ')');
    act.aid = 'a' + (++actions);
    const r = R.apply(s, act);
    if (!r.ok) {
      if (act.type === 'accept' && r.state !== s) { s = r.state; continue; }
      throw new Error('Bot-Aktion abgelehnt: ' + JSON.stringify(act) + ' → ' + r.err + ' Phase ' + s.phase);
    }
    s = r.state;
    if (check) check(s, act, r);
  }
  return { s, steps };
}
module.exports = { runGame };
