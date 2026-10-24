// Groove Arena – Kern-Test (Node): Skelett, Choreografie (ganzer Song, je Song anders, Refrain gleich), Bewertung, Takt-Erkennung
const C = require('../js/core.js'); let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHLER ') + m); if (!c) fail++; };
// Skelett: Füße auf dem Boden, keine NaN
const J = C.joints({}); ok(Math.abs(Math.min(J.anL[1], J.anR[1]) - .08) < 1e-6 && J.head[1] > 1.5, 'Neutral-Pose steht (Kopf ' + J.head[1].toFixed(2) + ' m)');
const up = C.joints({ aEL: 176, aER: 176 }); ok(up.haL[1] > up.head[1] && up.haL[0] > 0 && up.haR[0] < 0, 'Arme hoch: Hände über dem Kopf, linke Hand rechts im Bild (+x)');
const sq = C.joints({ lEL: 40, lER: 40, lZL: 50, lZR: 50, kL: 85, kR: 85 }); ok(sq.pelvis[1] < J.pelvis[1] - .1, 'Kniebeuge senkt die Hüfte');
ok(Object.keys(C.ARMS).length >= 30 && Object.keys(C.STEPS).length >= 18 && C.SIG.length >= 14, `Bibliothek: ${Object.keys(C.ARMS).length} Arm-Muster × ${Object.keys(C.STEPS).length} Schritte + ${C.SIG.length} Signatur-Moves`);
// Choreografie
const song = { id: 'dQw4w9WgXcQ', dur: 212, bpm: 113, beat0: 0.4, genre: 'Pop' };
const ch = C.choreograph(song), last = ch.list[ch.list.length - 1];
ok(last.b0 + last.mv.b >= ch.nBeats - 8 && ch.beat0 + (last.b0 + last.mv.b) * ch.spb >= song.dur - 6, `ganzer Song: ${ch.list.length} Moves bis ${(ch.beat0 + (last.b0 + last.mv.b) * ch.spb).toFixed(0)} s von ${song.dur} s`);
let nan = 0; for (let t = 0; t < song.dur; t += .37) { const P = C.joints(C.at(ch, t).pose); for (const k in P) if (P[k].some(v => !isFinite(v))) nan++; } ok(!nan, 'keine kaputten Posen über den ganzen Song');
const sig = c => c.list.map(x => x.mv.n + (x.mv.mirror ? '~' : '')).join(','), ch2 = C.choreograph(Object.assign({}, song, { id: 'kJQP7kiw5Fk' }));
ok(sig(ch) !== sig(ch2), 'jeder Song bekommt eine andere Choreografie'); ok(sig(ch) === sig(C.choreograph(song)), 'derselbe Song tanzt immer gleich');
const chor = []; let cur = null; ch.list.forEach(x => { if (x.sec === 'chorus') { if (!cur) { cur = []; chor.push(cur); } cur.push(x.mv.n + (x.mv.mirror ? '~' : '')); } else cur = null; });
ok(chor.length >= 2 && chor[0].slice(0, 6).join() === chor[1].slice(0, 6).join(), `Refrain wiederholt dieselben Moves (${chor.length} Refrains)`);
ok(ch.golds >= 3, 'Gold-Moves: ' + ch.golds); ok(new Set(ch.list.map(x => x.mv.n)).size >= 12, 'Abwechslung: ' + new Set(ch.list.map(x => x.mv.n)).size + ' verschiedene Moves');
const H = C.hits(ch); ok(H.length > 150 && H.every((h, i) => !i || h.t >= H[i - 1].t), 'Treffer-Zeitpunkte: ' + H.length);
const styles = Object.keys(C.STYLES).map(st => sig(C.choreograph(Object.assign({}, song, { style: st })))); ok(new Set(styles).size === styles.length, 'jeder Stil tanzt anders');
// Songaufbau aus Liedtext
const lrc = []; let t = 12; const verse = ['eins zwei drei', 'vier fünf sechs', 'sieben acht neun', 'zehn elf zwölf']; const chorusL = ['tanz mit mir heut nacht', 'die ganze nacht lang', 'tanz mit mir heut nacht', 'bis der morgen kommt'];
for (let r = 0; r < 3; r++) { for (const v of verse) { lrc.push({ t, text: v + ' ' + r }); t += 4; } for (const c of chorusL) { lrc.push({ t, text: c }); t += 4; } }
const secs = C.sectionsFromLyrics(lrc, 200); ok(secs && secs.filter(s => s.type === 'chorus').length === 3, 'Refrain aus Liedtext erkannt: ' + (secs || []).map(s => s.type[0] + Math.round(s.t0)).join(' '));
const chL = C.choreograph(Object.assign({}, song, { sections: secs })); ok(chL.lab.filter(x => x === 'chorus').length >= 9, 'Choreo folgt dem Liedtext-Aufbau');
ok(C.parseLRC('[00:12.50] Hallo\n[01:02.00] Welt').length === 2 && C.parseLRC('[01:02.00] Welt')[0].t === 62, 'LRC lesen');
// Kamera-Bewertung: Spieler macht die Pose spiegelbildlich nach → hohe Punkte, andere Pose → wenig
function lmFromPose(p) { // Person steht vor der Kamera und macht spiegelbildlich nach: ihr rechter Arm = linker Arm der Figur
  const Jp = C.joints(p), lm = []; for (let i = 0; i < 33; i++) lm.push({ x: .5, y: .5, visibility: 1 });
  const put = (i, P) => { lm[i] = { x: .5 + P[0] * .25, y: .9 - P[1] * .25, visibility: .95 }; }; // Kamera sieht die Person (ungespiegelt): Figur +x (ihr links) = rechts im Bild des Spielers … Spiegel ergibt sich in userVec
  // die Person macht den linken Arm der Figur mit ihrem rechten Arm: rechte Körperseite der Person ↔ Figur L; im ungespiegelten Kamerabild liegt die rechte Seite der Person links → x = .5 - X
  const M = { 12: 'shL', 14: 'elL', 16: 'wrL', 11: 'shR', 13: 'elR', 15: 'wrR', 24: 'hpL', 26: 'knL', 28: 'anL', 23: 'hpR', 25: 'knR', 27: 'anR' };
  for (const i in M) { const P = Jp[M[i]]; lm[i] = { x: .5 - P[0] * .25, y: .9 - P[1] * .25, visibility: .95 }; } return lm;
}
const pA = C.at(ch, 60).pose, pB = C.mirrorPose(C.joints && { aEL: 176, aER: 20, aZL: 0, eL: 0, aZR: 0 });
const same = C.compare(C.coachVec(pA), C.userVec(lmFromPose(pA))), diff = C.compare(C.coachVec({ aEL: 176, aER: 14, eL: 0 }), C.userVec(lmFromPose({ aEL: 14, aER: 176, eR: 0 })));
ok(same > .95, 'gleiche Pose (gespiegelt nachgemacht) = ' + same.toFixed(2)); ok(diff < .6, 'falscher Arm = ' + diff.toFixed(2)); void pB;
ok(C.rate(.9)[1] === 'perfekt' && C.rate(.1)[1] === 'daneben', 'Bewertungsstufen');
// Handy-Bewegung
const coach = C.handAccel(ch, 60, 62); const phoneGood = coach.map(v => v * .9 + Math.random() * .3), phoneStill = coach.map(() => .1), phoneRand = coach.map(() => Math.random() * 15);
const sG = C.motionScore(coach, phoneGood), sS = C.motionScore(coach, phoneStill), sR = C.motionScore(coach, phoneRand); ok(sG > .7 && sS < .2 && sR < sG, `Handy: mitgemacht ${sG.toFixed(2)}, stillgehalten ${sS.toFixed(2)}, wild ${sR.toFixed(2)}`);
// Takt-Erkennung aus Onsets (mit Schwankung und Störgeräuschen)
for (const bpm of [96, 123, 140]) { const P = 60 / bpm, b0 = .31, s = []; for (let t = 0; t < 14; t += 1 / 60) { const ph = ((t - b0) / P) % 1, near = Math.min(ph, 1 - ph) * P; s.push({ t, v: (near < .02 ? 1 : 0) * (Math.floor((t - b0) / P) % 2 ? .7 : 1) + Math.random() * .15 }); }
  const r = C.tempo(s); const pe = r ? Math.abs(((r.beat0 - b0) / P % 1 + 1.5) % 1 - .5) * P : 9; ok(r && Math.abs(r.bpm - bpm) < 1.6 && pe < .04, `Mikro-Takt ${bpm} BPM → ${r && r.bpm.toFixed(1)} BPM, Phase ±${(pe * 1000).toFixed(0)} ms`); }
const tp = C.tapTempo([1.02, 1.5, 1.99, 2.48, 2.97, 3.47, 3.95, 4.45]); ok(tp && Math.abs(tp.bpm - 122.4) < 2, 'Mitklopfen → ' + (tp && tp.bpm.toFixed(1)) + ' BPM');
// Rhythmus
const en = []; for (let t = 0; t < 2; t += 1 / 30) en.push({ t, e: Math.abs(((t % .5) - .0)) < .04 ? .4 : .05 }); ok(C.rhythmScore(en, 1.0) > .6 && C.rhythmScore(en.map(x => ({ t: x.t, e: .05 })), 1.0) < .4, 'Rhythmus-Bewertung');
console.log(fail ? fail + ' Fehler' : 'ALLES OK'); process.exit(fail ? 1 : 0);
