'use strict';
/* Gesichter-Radar: 20 selbst gezeichnete Gesichter mit Merkmalen (alles per Canvas, keine Bilddateien). */
const FACES = (() => {
  const NAMES = ['Anna', 'Ben', 'Clara', 'David', 'Emma', 'Finn', 'Greta', 'Hugo', 'Ida', 'Jonas', 'Karla', 'Leon', 'Mara', 'Nico', 'Olga', 'Paul', 'Rita', 'Sven', 'Tina', 'Uwe'];
  const HC = { blond: '#e8c35a', braun: '#6a3e1e', schwarz: '#1a1512', rot: '#c4521e', grau: '#b7b7bf' };
  const SKIN = ['#f2c9a0', '#e0a878', '#c68a5c', '#8d5a3b', '#f6d8bd'];
  const SHIRT = ['#3a7bff', '#ff2d95', '#8b5cf6', '#00b894', '#ff9a1f', '#e84118'];
  const Q = [
    { k: 'brille', t: 'Trägt die Person eine Brille?', f: f => f.brille },
    { k: 'bart', t: 'Hat die Person einen Bart?', f: f => f.bart },
    { k: 'muetze', t: 'Trägt die Person eine Mütze?', f: f => f.muetze },
    { k: 'lacht', t: 'Lächelt die Person?', f: f => f.lacht },
    { k: 'lang', t: 'Hat die Person lange Haare?', f: f => f.stil === 'lang' },
    { k: 'glatze', t: 'Hat die Person eine Glatze?', f: f => f.stil === 'glatze' },
    { k: 'blond', t: 'Sind die Haare blond?', f: f => f.stil !== 'glatze' && f.haar === 'blond' },
    { k: 'braun', t: 'Sind die Haare braun?', f: f => f.stil !== 'glatze' && f.haar === 'braun' },
    { k: 'schwarz', t: 'Sind die Haare schwarz?', f: f => f.stil !== 'glatze' && f.haar === 'schwarz' },
    { k: 'rot', t: 'Sind die Haare rot?', f: f => f.stil !== 'glatze' && f.haar === 'rot' },
    { k: 'grau', t: 'Sind die Haare grau?', f: f => f.stil !== 'glatze' && f.haar === 'grau' },
    { k: 'ohr', t: 'Trägt die Person Ohrringe?', f: f => f.ohr },
    { k: 'sommer', t: 'Hat die Person Sommersprossen?', f: f => f.sommer },
    { k: 'fliege', t: 'Trägt die Person eine Fliege?', f: f => f.fliege }
  ];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sig = f => Q.map(q => q.f(f) ? 1 : 0).join('');
  function gen() {                       // 20 Gesichter mit paarweise verschiedenen Merkmalen
    const names = NAMES.slice().sort(() => Math.random() - 0.5), used = new Set(), out = [];
    while (out.length < 20) {
      const f = { name: names[out.length], skin: pick(SKIN), shirt: pick(SHIRT), haar: pick(Object.keys(HC)), stil: pick(['kurz', 'kurz', 'lang', 'lang', 'glatze']), brille: Math.random() < 0.3, bart: Math.random() < 0.25, muetze: Math.random() < 0.15, lacht: Math.random() < 0.5, ohr: Math.random() < 0.2, sommer: Math.random() < 0.2, fliege: Math.random() < 0.15 };
      if (f.stil === 'glatze') f.haar = 'braun';
      const s = sig(f); if (used.has(s)) continue; used.add(s); f.img = draw(f); out.push(f);
    }
    return out;
  }
  function draw(f, S) {
    S = S || 96; const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), k = S / 96, hair = HC[f.haar];
    g.scale(k, k); const bg = g.createLinearGradient(0, 0, 0, 96); bg.addColorStop(0, '#2a3a7a'); bg.addColorStop(1, '#101840'); g.fillStyle = bg; g.fillRect(0, 0, 96, 96);
    if (f.stil === 'lang') { g.fillStyle = hair; g.beginPath(); g.ellipse(48, 46, 29, 36, 0, 0, 7); g.fill(); g.fillRect(19, 46, 58, 40); }
    g.fillStyle = f.shirt; g.beginPath(); g.ellipse(48, 100, 36, 26, 0, 0, 7); g.fill();
    if (f.fliege) { g.fillStyle = '#e0197d'; g.beginPath(); g.moveTo(48, 79); g.lineTo(38, 73); g.lineTo(38, 85); g.fill(); g.beginPath(); g.moveTo(48, 79); g.lineTo(58, 73); g.lineTo(58, 85); g.fill(); }
    g.fillStyle = f.skin; g.fillRect(41, 66, 14, 14);
    if (f.ohr) { g.fillStyle = '#ffd24a'; [[21, 52], [75, 52]].forEach(p => { g.beginPath(); g.arc(p[0], p[1] + 3, 3.2, 0, 7); g.fill(); }); }
    g.fillStyle = f.skin; g.beginPath(); g.ellipse(48, 46, 25, 29, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(23, 48, 4, 7, 0, 0, 7); g.ellipse(73, 48, 4, 7, 0, 0, 7); g.fill();
    if (f.stil !== 'glatze') { g.fillStyle = hair; g.beginPath(); g.ellipse(48, 28, 27, f.stil === 'lang' ? 17 : 14, 0, Math.PI, 0); g.fill(); g.fillRect(22, 24, 6, f.stil === 'lang' ? 26 : 10); g.fillRect(68, 24, 6, f.stil === 'lang' ? 26 : 10); }
    if (f.bart) { g.fillStyle = hair; g.beginPath(); g.moveTo(25, 56); g.quadraticCurveTo(48, 92, 71, 56); g.quadraticCurveTo(48, 64, 25, 56); g.fill(); }
    if (f.muetze) { g.fillStyle = '#e8412a'; g.beginPath(); g.ellipse(48, 24, 27, 15, 0, Math.PI, 0); g.fill(); g.fillRect(19, 22, 58, 6); g.fillStyle = '#fff'; g.fillRect(19, 22, 58, 2); }
    g.fillStyle = '#fff'; [38, 58].forEach(x => { g.beginPath(); g.ellipse(x, 44, 5, 4, 0, 0, 7); g.fill(); }); g.fillStyle = '#1a1a2a'; [38, 58].forEach(x => { g.beginPath(); g.arc(x, 44.5, 2.2, 0, 7); g.fill(); });
    g.strokeStyle = hair === HC.grau ? '#888' : hair; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 37); g.lineTo(44, 36); g.moveTo(52, 36); g.lineTo(64, 37); g.stroke();
    if (f.brille) { g.strokeStyle = '#222'; g.lineWidth = 1.8; [38, 58].forEach(x => { g.strokeRect(x - 7, 38, 14, 11); }); g.beginPath(); g.moveTo(45, 43); g.lineTo(51, 43); g.stroke(); }
    if (f.sommer) { g.fillStyle = 'rgba(160,80,40,.75)'; [[32, 54], [37, 57], [30, 58], [64, 54], [59, 57], [66, 58]].forEach(p => { g.beginPath(); g.arc(p[0], p[1], 1.2, 0, 7); g.fill(); }); }
    g.strokeStyle = 'rgba(120,60,40,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(48, 46); g.lineTo(45, 55); g.lineTo(50, 55); g.stroke();
    g.strokeStyle = '#8a2a2a'; g.lineWidth = 2.2; g.beginPath(); if (f.lacht) { g.arc(48, 59, 8, 0.15 * Math.PI, 0.85 * Math.PI); } else { g.moveTo(41, 66); g.lineTo(55, 66); } g.stroke();
    return c.toDataURL('image/png');
  }
  const answer = (q, f) => !!q.f(f);
  // Bot-Frage: beste Halbierung der Kandidaten (Anfänger: zufälliger informativer Zug)
  function botQuestion(cand, asked, skill) {
    const opts = Q.filter(q => !asked.has(q.k)).map(q => ({ q, n: cand.filter(f => q.f(f)).length })).filter(o => o.n > 0 && o.n < cand.length);
    if (!opts.length) return null;
    if (skill === 0 || (skill === 1 && Math.random() < 0.3)) return pick(opts).q;
    opts.sort((a, b) => Math.abs(a.n - cand.length / 2) - Math.abs(b.n - cand.length / 2)); return opts[0].q;
  }
  return { gen, draw, Q, answer, botQuestion };
})();
