// Node-Test: komplette Shows nur mit Computern bis zum Sieger
const C = require('../js/core.js'); let ok = 0, fail = 0;
for (const diff of ['leicht', 'normal', 'schwer']) for (const n of [6, 12, 24]) for (let seed = 1; seed <= 8; seed++) {
  const S = C.newShow([], { n, diff, seed }); let guard = 0, log = [];
  while (!S.done && guard < 20) { const r = C.nextRound(S); if (!r) break; const before = C.alive(S).length; let t = 0; while (!C.step(S, 1 / 30, {}) && t < 400) t += 1 / 30; log.push(r + ':' + before + '→' + C.alive(S).length + '(' + t.toFixed(0) + 's)'); if (t >= 400) { log.push('HÄNGT'); break; } guard++; }
  const good = S.done && S.winner && !log.includes('HÄNGT');
  good ? ok++ : fail++; if (!good || seed === 1 && n === 24) console.log(diff, n, seed, good ? 'Sieger ' + S.winner.name : 'FEHLER', log.join(' '));
}
console.log('ok', ok, 'fehler', fail); process.exit(fail ? 1 : 0);
