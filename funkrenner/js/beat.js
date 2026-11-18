/* Funkrenner – Beat-Modus: erzeugte Musik (kein Audio-Download), 13 Sender-Songs, Lieder aus Klavierlicht, Treffer-Wertung.
   Der Musik- und Notenerzeuger stammt aus dem früheren Beat Surfer und wurde hier zusammengeführt. */
(function (root) {
'use strict';
const seeded = s => () => (s = s * 16807 % 2147483647) / 2147483647;
let song = null, paused = false, LV = 0.8;
/* ================= Songs: ein Genre pro Sender ================= */
// Namen/Genres der Sender (Song n = Logo n). Beim Austauschen der Logos hier die Namen anpassen.
const MAJ = [0, 2, 4, 7, 9], MIN = [0, 3, 5, 7, 10];
const P_MAJ = [0, 5, 7, 5], P_MIN = [0, 8, 3, 10], P_CHILL = [0, 5, 9, 7];
const STATIONS = [
  { n: 'RicoReWi Music & Media', g: 'Synthwave', bpm: 118, root: 45, prog: P_MIN, scale: MIN, kick: 'punch', snare: 'gate', hat: 'closed', bass: 'pump', lead: 'supersaw',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 2, 4, 6, 8, 10, 12, 14], lp: [0, 6, 10] },
  { n: 'YourTime-FM', g: 'Chill & Tropical', bpm: 104, root: 48, prog: P_CHILL, scale: MAJ, kick: 'soft', snare: 'clap', hat: 'shaker', bass: 'sub', lead: 'pluck',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 3, 6, 10], lp: [0, 3, 6, 10, 12] },
  { n: 'RapRadio 24', g: 'Rap', bpm: 92, root: 43, prog: P_MIN, scale: MIN, kick: '808', snare: 'crack', hat: 'closed', bass: 'sub', lead: 'piano', roll: true,
    kp: [0, 7, 10], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 7, 10], lp: [2, 6, 9, 13] },
  { n: 'SchlagerPop 24', g: 'Schlager', bpm: 124, root: 48, prog: P_MAJ, scale: MAJ, kick: 'punch', snare: 'clap', hat: 'closed', bass: 'oct', lead: 'accordion',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 4, 8, 12], lp: [0, 4, 6, 8, 12, 14] },
  { n: 'ChartRadio 24', g: 'Pop & Charts', bpm: 120, root: 45, prog: P_MIN, scale: MIN, kick: 'punch', snare: 'clap', hat: 'closed', bass: 'saw', lead: 'pluck',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [2, 6, 10, 14], bp: [2, 6, 10, 14], lp: [0, 3, 6, 8, 11, 14] },
  { n: 'ClubRadio 24', g: 'Club / EDM', bpm: 148, root: 46, prog: P_MIN, scale: MIN, kick: 'punch', snare: 'clap', hat: 'closed', bass: 'pump', lead: 'supersaw',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], lp: [0, 2, 3, 5, 7, 8, 10, 11, 13, 15] },
  { n: 'AnMaCha 24', g: 'Pop-Rock Mix', bpm: 126, root: 45, prog: P_MAJ, scale: MAJ, kick: 'punch', snare: 'crack', hat: 'closed', bass: 'saw', lead: 'stab',
    kp: [0, 6, 8, 10], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 6, 8, 10], lp: [0, 3, 6, 8, 11, 14] },
  { n: 'RadioFloh!', g: 'Kindermusik', bpm: 100, root: 48, prog: P_MAJ, scale: MAJ, kick: 'soft', snare: 'clap', hat: 'shaker', bass: 'tri', lead: 'xylo', oomph: true,
    kp: [0, 8], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 4, 8, 12], lp: [0, 4, 6, 8, 12, 14] },
  { n: 'RockRadio 24', g: 'Rock', bpm: 132, root: 40, prog: P_MIN, scale: MIN, kick: 'punch', snare: 'crack', hat: 'closed', bass: 'saw', lead: 'stab',
    kp: [0, 8, 10], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 2, 4, 8, 10, 12], lp: [0, 6, 8, 14] },
  { n: 'ChristmasRadio 24', g: 'Weihnachten', bpm: 112, root: 48, prog: P_MAJ, scale: MAJ, kick: 'soft', snare: 'brush', hat: 'bell', bass: 'tri', lead: 'bell',
    kp: [0, 8], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 8], lp: [0, 3, 6, 8, 11, 14] },
  { n: 'KultRadio 24', g: 'Disco & Kult-Hits', bpm: 116, root: 45, prog: P_MIN, scale: MIN, kick: 'punch', snare: 'clap', hat: 'closed', bass: 'oct', lead: 'stab',
    kp: [0, 4, 8, 12], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 2, 4, 6, 8, 10, 12, 14], lp: [1, 3, 6, 9, 11, 14] },
  { n: 'Zocker-FM', g: 'Gaming / Chiptune', bpm: 140, root: 45, prog: P_MIN, scale: MIN, kick: 'chip', snare: 'chip', hat: 'chip', bass: 'tri', lead: 'pulse',
    kp: [0, 6, 8, 10], sp: [4, 12], hp: [0, 2, 4, 6, 8, 10, 12, 14], bp: [0, 2, 4, 6, 8, 10, 12, 14], lp: [0, 2, 3, 5, 7, 8, 10, 11, 13, 15] },
  { n: 'Special-Radio', g: 'Entspannung', bpm: 74, root: 47, prog: P_CHILL, scale: MAJ, kick: 'soft', snare: 'brush', hat: 'shaker', bass: 'sub', lead: 'pad',
    kp: [0, 10], sp: [4, 12], hp: [2, 6, 10, 14], bp: [0, 8], lp: [0, 6, 10] }
];
// Reihenfolge in der Kampagne (leicht -> schwer), unabhängig von der Logo-Nummer: Entspannung, Kinder, Chill, Schlager, Weihnachten, Kult, Charts, AnMaCha 24, RicoReWi, Zocker, Rock, Rap, Club
const ORDER = [12, 7, 1, 3, 9, 10, 4, 6, 0, 11, 8, 2, 5];
const rankOf = i => ORDER.indexOf(i);
const trackInfo = i => {
  const st = STATIONS[i], r = rankOf(i);
  return { idx: i, st, rank: r, bpm: st.bpm, ntb: 0.9 + 0.1 * r, approach: 1.7 - 0.04 * r, loss: 7 + 0.6 * r, stars: 1 + Math.round(r / 3), root: st.root };
};

function buildSong(i) {
  const tr = trackInfo(i), st = tr.st, rnd = seeded(1000 + i * 77);
  const beat = 60 / tr.bpm, step = beat / 4, countIn = beat * 4, bars = Math.round(64 * tr.bpm / 240);
  const events = [], notes = [], lastTime = [-9, -9, -9, -9];
  for (let b = 0; b < bars; b++) {
    const off = st.prog[b % 4], cand = [];
    for (let s = 0; s < 16; s++) {
      const e = { t: countIn + (b * 16 + s) * step, kick: st.kp.includes(s), snare: st.sp.includes(s), hat: st.hp.includes(s) || (st.roll && b % 4 === 3 && s >= 12), open: false, bass: null, lead: null };
      if (st.bp.includes(s)) { e.bass = tr.root - 12 + off + (st.oomph && s % 8 === 4 ? 7 : 0); if (st.bass === 'oct' && s % 8 === 4) e.bass += 7; }
      if (st.lp.includes(s) && rnd() < 0.88) { const k = rnd() * st.scale.length | 0; e.lead = tr.root + 24 + off + st.scale[k] + (rnd() < 0.2 ? 12 : 0); e.leadIdx = k; }
      events.push(e);
      if (e.kick) cand.push({ s, lane: 0, pri: (s % 8 === 0 ? 9 : 6) + rnd() });
      if (e.snare) cand.push({ s, lane: 1, pri: 8 + rnd() });
      if (e.lead != null) cand.push({ s, lane: e.leadIdx < 3 ? 2 : 3, pri: 4 + rnd() * 2 });
      else if (e.hat && s % 4 !== 0) cand.push({ s, lane: rnd() < 0.5 ? 2 : 3, pri: 1.5 + rnd() });
    }
    const K = Math.max(3, Math.round(tr.ntb * 4 + (rnd() - 0.5) * 1.6));
    // Mindestens ein paar Melodie-Noten pro Takt, damit alle 4 Spuren vorkommen
    const leads = cand.filter(c => c.lane >= 2).sort((a, c) => c.pri - a.pri), rest = cand.filter(c => c.lane < 2).sort((a, c) => c.pri - a.pri);
    const nl = Math.min(leads.length, Math.max(1, Math.round(K * (0.3 + 0.015 * tr.rank))));
    const picked = leads.slice(0, nl).concat(rest.slice(0, K - nl)).sort((a, c) => a.s - c.s || a.lane - c.lane);
    const perStep = {};
    for (const c of picked) {
      const t = countIn + (b * 16 + c.s) * step;
      if ((perStep[c.s] || 0) >= 2 || t - lastTime[c.lane] < 0.17) continue;     // höchstens 2 gleichzeitig, pro Spur nicht zu schnell
      perStep[c.s] = (perStep[c.s] || 0) + 1; lastTime[c.lane] = t;
      notes.push({ t, lane: c.lane, judged: false, hit: false, mesh: null });
    }
  }
  const duration = countIn + bars * 16 * step;
  return { tr, beat, step, countIn, bars, events, notes, duration, end: (notes.length ? notes[notes.length - 1].t : duration) + 1.6 };
}

/* ================= Audio (erzeugte Musik, keine Dateien) ================= */
let ac = null, master = null, fx = null, muted = false, userOff = 0, noiseBuf = null;
try { muted = localStorage.getItem('funkrenner-beat-muted') === '1'; userOff = +localStorage.getItem('funkrenner-beat-offset') || 0; } catch (e) {}
function audioInit() {
  if (!ac) {
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      const comp = ac.createDynamicsCompressor(); master = ac.createGain(); master.gain.value = muted ? 0 : LV;
      master.connect(comp); comp.connect(ac.destination);
      // einfacher Hall/Echo für ruhige Klänge
      fx = ac.createGain(); const dl = ac.createDelay(1), fb = ac.createGain(), lp = ac.createBiquadFilter(); dl.delayTime.value = 0.32; fb.gain.value = 0.38; lp.type = 'lowpass'; lp.frequency.value = 2600;
      fx.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(master); fx.connect(master);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ac = null; }
  }
  if (ac && ac.state === 'suspended' && !paused) ac.resume();
}
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
function osc(type, f, t, dur, peak, dest, f2) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.5);
  env(g, t, 0.005, peak, dur); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + dur + 0.05);
}
function noise(t, dur, peak, ftype, freq) {
  const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(), g = ac.createGain(); f.type = ftype; f.frequency.value = freq;
  env(g, t, 0.002, peak, dur); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
function voice(type, f, at, dur, peak, dest, f2) { osc(type, f, at, dur, peak, dest, f2); }
function playEvent(e, at) {
  if (!ac) return;
  const st = song.tr.st, sd = song.step;
  if (e.kick) {
    if (st.kick === '808') voice('sine', 95, at, 0.6, 0.95, null, 40);
    else if (st.kick === 'soft') voice('sine', 115, at, 0.24, 0.6, null, 48);
    else if (st.kick === 'chip') voice('square', 190, at, 0.1, 0.28, null, 55);
    else voice('sine', 160, at, 0.3, 0.95, null, 42);
  }
  if (e.snare) {
    if (st.snare === 'clap') { for (let k = 0; k < 3; k++) noise(at + k * 0.012, 0.07, 0.22, 'bandpass', 1300); noise(at + 0.036, 0.15, 0.2, 'bandpass', 1300); }
    else if (st.snare === 'brush') noise(at, 0.22, 0.12, 'bandpass', 3200);
    else if (st.snare === 'gate') { noise(at, 0.34, 0.3, 'highpass', 900); voice('triangle', 200, at, 0.1, 0.22); }
    else if (st.snare === 'chip') { noise(at, 0.08, 0.16, 'highpass', 2200); voice('square', 230, at, 0.07, 0.1); }
    else { noise(at, 0.18, 0.35, 'bandpass', 1900); voice('triangle', 190, at, 0.1, 0.25); }
  }
  if (e.hat) {
    if (st.hat === 'shaker') noise(at, 0.06, 0.07, 'bandpass', 6000);
    else if (st.hat === 'bell') { noise(at, 0.1, 0.08, 'highpass', 5600); voice('sine', 2637, at, 0.18, 0.025, fx); voice('sine', 3322, at, 0.14, 0.02, fx); }
    else if (st.hat === 'chip') noise(at, 0.035, 0.08, 'highpass', 9000);
    else noise(at, 0.04, 0.07, 'highpass', 7500);
  }
  if (e.bass != null) {
    const f0 = mtof(e.bass);
    if (st.bass === 'sub') { voice('sine', f0, at, sd * 3, 0.38); voice('triangle', f0 * 2, at, sd * 1.5, 0.06); }
    else if (st.bass === 'tri') voice('triangle', f0 * 2, at, sd * 1.7, 0.3);
    else {
      const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f0; f.type = 'lowpass'; f.frequency.value = st.bass === 'pump' ? 700 : 420;
      env(g, at, 0.01, st.bass === 'pump' ? 0.26 : 0.3, sd * (st.bass === 'pump' ? 1.2 : 1.8)); o.connect(f); f.connect(g); g.connect(master); o.start(at); o.stop(at + sd * 2 + 0.05);
    }
  }
  if (e.lead != null) {
    const f0 = mtof(e.lead);
    switch (st.lead) {
      case 'xylo': voice('triangle', f0 * 2, at, 0.28, 0.1); voice('sine', f0 * 4, at, 0.12, 0.04); break;
      case 'pluck': voice('triangle', f0, at, 0.45, 0.09, fx); voice('sine', f0 * 2, at, 0.2, 0.03, fx); break;
      case 'accordion': voice('sawtooth', f0 * 1.003, at, sd * 2.4, 0.04); voice('sawtooth', f0 * 0.997, at, sd * 2.4, 0.04); voice('square', f0 * 2, at, sd * 2.4, 0.02); break;
      case 'bell': { const o = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain(); o.frequency.value = f0 * 2; m.frequency.value = f0 * 7; mg.gain.setValueAtTime(f0 * 3, at); mg.gain.exponentialRampToValueAtTime(1, at + 0.6);
        m.connect(mg); mg.connect(o.frequency); env(g, at, 0.003, 0.09, 0.9); o.connect(g); g.connect(fx); o.start(at); m.start(at); o.stop(at + 1); m.stop(at + 1); break; }
      case 'stab': voice('sawtooth', f0, at, sd * 1.4, 0.06); voice('sawtooth', f0 * 1.498, at, sd * 1.4, 0.04); break;
      case 'supersaw': [-12, 0, 12].forEach(c => voice('sawtooth', f0 * Math.pow(2, c / 1200), at, sd * 2.6, 0.04)); break;
      case 'pulse': voice('square', f0, at, sd * 1.15, 0.07); break;
      case 'piano': voice('triangle', f0, at, 0.4, 0.12); voice('sine', f0 * 2, at, 0.2, 0.05); break;
      case 'pad': voice('sine', f0, at, sd * 8, 0.06, fx); voice('sine', f0 * 1.004, at, sd * 8, 0.05, fx); break;
      default: voice('square', f0, at, sd * 2.2, 0.07);
    }
  }
  if (e.piano) for (const [p, d, v] of e.piano) { const f = mtof(p); voice('triangle', f, at, Math.min(1.6, d + 0.25), 0.11 * v); voice('sine', f * 2, at, Math.min(0.7, d + 0.1), 0.03 * v); }   // Klavierlicht-Lied
}
const SFX = {
  tick: () => { if (ac && !muted) osc('sine', 1320, ac.currentTime, 0.05, 0.08); },
  miss: () => { if (ac && !muted) noise(ac.currentTime, 0.12, 0.12, 'lowpass', 400); },
  count: hi => { if (ac) osc('square', hi ? 1320 : 880, ac.currentTime, 0.1, 0.12); },
  win: () => { if (ac) [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, ac.currentTime + i * 0.1, 0.35, 0.18)); },
  fail: () => { if (ac) [392, 330, 262, 196].forEach((f, i) => osc('sawtooth', f, ac.currentTime + i * 0.16, 0.3, 0.12)); }
};
function setMuted(m) {
  muted = m; if (master) master.gain.value = m ? 0 : LV;
  try { localStorage.setItem('funkrenner-beat-muted', m ? '1' : '0'); } catch (e) {}
}


const TRACKS = STATIONS.length;
const WIN_PERFECT = 0.055, WIN_GOOD = 0.115, WIN_MISS = 0.13;

/* ---------- Lieder aus Klavierlicht ---------- */
const LIED_STATION = { kinder: 7, weihnacht: 9, volk: 3, klassik: 12, choral: 12 };
function liedSong(c, s, lvl) {
  const P = KLSongLib.parts(c, lvl, 4), bpm = P.bpm, beat = 60 / bpm, countIn = beat * 4, si = LIED_STATION[s.cat] != null ? LIED_STATION[s.cat] : 1, rank = { leicht: 2, normal: 6, profi: 10 }[lvl] || 6;
  const st = Object.assign({}, STATIONS[si], { kick: 'soft', snare: 'brush', hat: 'shaker' });
  const tr = { idx: si, st, rank, bpm, ntb: 1, approach: 1.7 - 0.04 * rank, loss: 7 + 0.6 * rank, stars: 1 + Math.round(rank / 3), root: 48 }, ev = [];
  for (const [t, p, d] of P.mel) ev.push({ t: countIn + t, piano: [[p, d, 0.85]] });
  for (const [t, p, d, v] of P.acc) ev.push({ t: countIn + t, piano: [[p, d, v * 0.9]] });
  for (let i = 0, n = Math.ceil(P.dur / beat * 2); i < n; i++) ev.push({ t: countIn + i * beat / 2, kick: i % 4 === 0, snare: i % 4 === 2, hat: i % 2 === 1 });
  ev.sort((a, b) => a.t - b.t);
  const notes = P.notes.map(n => ({ t: countIn + n.t, lane: n.lane, judged: false, hit: false })), duration = countIn + P.dur;
  return { tr, beat, step: beat / 4, countIn, bars: 0, events: ev, notes, duration, end: (notes.length ? notes[notes.length - 1].t : duration) + 1.6, lied: s };
}

/* ---------- Laufender Song ---------- */
const R = { state: 'idle', score: 0, combo: 0, maxCombo: 0, health: 70, perfect: 0, good: 0, miss: 0, ended: false, nextEv: 0, countShown: -1, A0: 0, perf0: 0, pausedAt: 0, testClock: null, cb: {} };
const audioLat = () => (ac ? (ac.outputLatency || ac.baseLatency || 0) : 0) + userOff / 1000;
function songTime() {
  if (R.testClock !== null) return R.testClock;
  if (!ac) return (performance.now() - R.perf0) / 1000 - userOff / 1000;
  return ac.currentTime - R.A0 - audioLat();
}
const mult = () => Math.min(4, 1 + Math.floor(R.combo / 10));
const accuracy = () => { const n = R.perfect + R.good + R.miss; return n ? (R.perfect + 0.6 * R.good) / n : 1; };

function begin(sg, cb) {
  BG.on = false; song = sg; R.cb = cb || {}; R.ended = false; R.score = 0; R.combo = 0; R.maxCombo = 0; R.health = 70; R.perfect = R.good = R.miss = 0; R.nextEv = 0; R.countShown = -1; paused = false;
  if (ac && R.testClock === null) { R.A0 = ac.currentTime + 0.25; master.gain.cancelScheduledValues(ac.currentTime); LV = 0.8; master.gain.value = muted ? 0 : LV; if (ac.state === 'suspended') ac.resume(); }
  else R.perf0 = performance.now() + 250;
  R.state = 'play';
}
function judge(n, q, lane) {                                  // q: 2 perfekt, 1 gut, 0 verpasst
  n.judged = true; n.hit = q > 0;
  const tr = song.tr;
  if (q === 0) { R.miss++; R.combo = 0; R.health -= tr.loss; SFX.miss(); }
  else {
    R.score += (q === 2 ? 300 : 100) * mult(); R.combo++; R.maxCombo = Math.max(R.maxCombo, R.combo);
    R.health = Math.min(100, R.health + (q === 2 ? 1.6 : 0.6));
    if (q === 2) R.perfect++; else R.good++;
    SFX.tick();
  }
  if (R.cb.judge) R.cb.judge(q, n.lane, n);
  if (R.health <= 0 && !R.ended) { R.health = 0; finish(false); }
}
function press(lane) {
  if (R.state !== 'play' || R.ended) return;
  const t = songTime(); let best = null, bd = 1e9;
  for (const n of song.notes) {
    if (n.t > t + WIN_GOOD + 0.02) break;
    if (n.lane !== lane || n.judged) continue;
    const d = Math.abs(n.t - t); if (d < bd) { bd = d; best = n; }
  }
  if (R.cb.press) R.cb.press(lane, !!best && bd <= WIN_GOOD);
  if (!best || bd > WIN_GOOD) return;                          // Ghost-Tap: kein Abzug
  judge(best, bd <= WIN_PERFECT ? 2 : 1, lane);
}
function finish(cleared) {
  if (R.state === 'result') return;
  R.state = 'result'; R.ended = true;
  if (ac) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.12); }
  const acc = accuracy(), stars = cleared ? (acc >= 0.9 ? 3 : acc >= 0.75 ? 2 : 1) : 0, bonus = cleared ? stars * 1000 : 0;
  R.score += bonus;
  if (cleared) SFX.win(); else SFX.fail();
  if (R.cb.end) R.cb.end({ cleared, stars, bonus, acc, score: Math.floor(R.score), maxCombo: R.maxCombo, perfect: R.perfect, good: R.good, miss: R.miss, song });
}
/* wird jeden Bild aufgerufen: plant Audio vor, wertet verpasste Noten */
function tick() {
  if (R.state !== 'play' || !song) return songTime();
  const t = songTime(), beat = song.beat;
  if (ac && R.testClock === null) {
    const now = ac.currentTime;
    while (R.nextEv < song.events.length && R.A0 + song.events[R.nextEv].t < now + 0.3) { playEvent(song.events[R.nextEv], R.A0 + song.events[R.nextEv].t); R.nextEv++; }
    for (let i = 0; i < 4; i++) { if (R.countShown < i && now >= R.A0 + i * beat - 0.3) { const at = R.A0 + i * beat; if (at >= now - 0.05) osc('square', i === 3 ? 1320 : 880, Math.max(at, now), 0.08, 0.12); R.countShown = i; } }
  }
  for (const n of song.notes) { if (R.state !== 'play') break; if (n.judged) continue; if (n.t + WIN_MISS < t) judge(n, 0); else if (n.t > t) break; }
  if (R.state === 'play' && t > song.end) finish(R.health > 0);
  return t;
}
function pause() { if (R.state !== 'play') return; R.state = 'paused'; paused = true; R.pausedAt = performance.now(); if (ac && R.testClock === null) ac.suspend(); }
function resume() { if (R.state !== 'paused') return; if (R.testClock === null && !ac) R.perf0 += performance.now() - R.pausedAt; paused = false; R.state = 'play'; if (ac && R.testClock === null) ac.resume(); }
function stop() { if (ac && master) master.gain.setTargetAtTime(0, ac.currentTime, 0.05); R.state = 'idle'; paused = false; song = null; }
function setOffset(v) { userOff = Math.max(-300, Math.min(300, v)); try { localStorage.setItem('funkrenner-beat-offset', userOff); } catch (e) {} return userOff; }

/* ---------- Hintergrundmusik fürs Laufen (erzeugt, Endlosschleife) + Geräusche ---------- */
const BG = { on: false, song: null, i: 0, A0: 0, loop: 0 };
function bgStart(idx, vol) {
  audioInit(); if (!ac || R.state === 'play') return;
  const sg = buildSong(idx); song = sg; BG.song = sg; BG.on = true; BG.i = 0; BG.loop = sg.bars * 16 * sg.step; BG.A0 = ac.currentTime + 0.15 - sg.countIn;
  LV = vol == null ? 0.5 : vol; master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(muted ? 0 : LV, ac.currentTime, 0.2);
}
function bgStop() { BG.on = false; if (ac && master) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0, ac.currentTime, 0.15); } }
function bgTick() {
  if (!BG.on || !ac || !BG.song || R.state === 'play') return;
  const now = ac.currentTime; song = BG.song;
  for (let guard = 0; guard < 200; guard++) {
    const e = BG.song.events[BG.i];
    if (!e) { BG.i = 0; BG.A0 += BG.loop; continue; }
    const at = BG.A0 + e.t; if (at > now + 0.3) break;
    if (at >= now - 0.05) playEvent(e, Math.max(at, now)); BG.i++;
  }
}
const sfx = n => {
  if (!ac || muted) return; const t = ac.currentTime;
  if (n === 'coin') { osc('sine', 1320, t, 0.09, 0.2); osc('sine', 1760, t + 0.06, 0.12, 0.18); }
  else if (n === 'jump') osc('triangle', 300, t, 0.22, 0.22, null, 760);
  else if (n === 'land') noise(t, 0.08, 0.14, 'lowpass', 500);
  else if (n === 'slide') noise(t, 0.3, 0.2, 'bandpass', 900);
  else if (n === 'lane') noise(t, 0.07, 0.1, 'highpass', 3200);
  else if (n === 'hit') { osc('sawtooth', 170, t, 0.3, 0.3, null, 50); noise(t, 0.2, 0.28, 'lowpass', 800); }
  else if (n === 'shield') { osc('square', 880, t, 0.1, 0.12, null, 220); noise(t, 0.2, 0.2, 'highpass', 2000); }
  else if (n === 'power') [523, 659, 784, 1047].forEach((f, i) => osc('triangle', f, t + i * 0.06, 0.2, 0.2));
  else if (n === 'heart') [659, 880, 1319].forEach((f, i) => osc('sine', f, t + i * 0.08, 0.25, 0.22));
  else if (n === 'turbo') osc('sawtooth', 120, t, 0.6, 0.18, null, 900);
  else if (n === 'ui') osc('sine', 700, t, 0.06, 0.14);
  else if (n === 'back') osc('sine', 440, t, 0.07, 0.14);
  else if (n === 'go') osc('square', 1320, t, 0.18, 0.16);
  else if (n === 'count') osc('square', 880, t, 0.1, 0.14);
  else if (n === 'win') SFX.win();
  else if (n === 'lose') SFX.fail();
};

root.FRBeat = { bgStart, bgStop, bgTick, sfx, STATIONS, ORDER, TRACKS, rankOf, trackInfo, buildSong, liedSong, LIED_STATION, audioInit, setMuted, isMuted: () => muted, SFX, R, begin, press, tick, pause, resume, stop, finish, songTime, mult, accuracy, setOffset, getOffset: () => userOff, WIN_PERFECT, WIN_GOOD, WIN_MISS,
  get song() { return song; }, osc: (...a) => { if (ac) osc(...a); }, ctx: () => ac };
})(window);
