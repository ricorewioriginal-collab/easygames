/* Die Pixelpforte – eigenständiges Mini-Rollenspiel im Stil klassischer 16-Bit-Konsolen-RPGs (Draufsicht, Kacheln,
   Schiebeblock-Rätsel, Rundenkämpfe). Alles eigen: Pixelgrafik aus Text-Rastern, Karten, Geschichte, Musik (WebAudio).
   Zustand liegt in S.px, damit er mit dem normalen Spielstand gespeichert wird. */
const W = 256, H = 224, TS = 16;

/* ---------- Musik und Klänge (eigene Melodien) ---------- */
const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const fq = s => { const m = /^([a-g])(#|b)?(\d)$/.exec(s); if (!m) return 0; const n = NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (+m[3] + 1) * 12; return 440 * Math.pow(2, (n - 69) / 12); };
const SONGS = {
  dorf: { bpm: 112, l: 'a4 . c5 . f5 . e5 c5 d5 . bb4 . c5 . . . a4 . c5 . f5 . g5 a5 g5 . e5 . f5 . . . d5 . f5 . bb5 . a5 f5 g5 . e5 . c5 . . . bb4 . a4 . g4 . a4 bb4 c5 . e4 . f4 . . .',
    b: 'f2 . c3 . f2 . c3 . bb2 . f3 . c3 . g2 . f2 . c3 . f2 . c3 . c3 . e3 . f2 . c3 . bb2 . f3 . bb2 . f3 . f2 . c3 . f2 . c3 . c3 . g2 . c3 . g2 . f2 . c3 .' },
  hell: { bpm: 128, l: 'c5 . e5 g5 a5 . g5 e5 f5 . a5 . g5 . . . e5 . g5 c6 b5 . a5 g5 a5 . f5 . g5 . . . a5 . f5 a5 g5 . e5 c5 d5 . f5 e5 d5 . g4 . c5 . e5 . d5 . b4 . c5 . . . . . . .',
    b: 'c3 g3 c3 g3 f2 c3 f2 c3 c3 g3 c3 g3 g2 d3 g2 d3 a2 e3 a2 e3 f2 c3 f2 c3 c3 g3 c3 g3 g2 d3 g2 d3 f2 c3 f2 c3 c3 g3 c3 g3 d3 a3 d3 a3 g2 d3 g2 d3 c3 g3 c3 g3 g2 d3 g2 d3 c3 g3 c3 g3 c3 . . .' },
  turm: { bpm: 92, l: 'd4 . f4 . a4 . . g4 f4 . e4 . d4 . . . c4 . e4 . g4 . . f4 e4 . c#4 . d4 . . . a4 . bb4 . a4 . f4 . g4 . e4 . f4 . . . d4 . e4 . f4 . a4 . g4 . f4 . e4 . . .',
    b: 'd2 . . . d2 . . . bb1 . . . bb1 . . . c2 . . . c2 . . . a1 . . . a1 . . . d2 . . . d2 . . . bb1 . . . c2 . . . g1 . . . a1 . . . d2 . . . d2 . . .' },
  kampf: { bpm: 152, l: 'a4 c5 e5 a5 g5 e5 c5 e5 f4 a4 c5 f5 e5 c5 a4 c5 d4 f4 a4 d5 c5 a4 f4 a4 e4 g#4 b4 e5 d5 b4 g#4 b4',
    b: 'a2 . a2 a3 a2 . a2 a3 f2 . f2 f3 f2 . f2 f3 d2 . d2 d3 d2 . d2 d3 e2 . e2 e3 e2 . e2 e3' },
  boss: { bpm: 164, l: 'e4 f4 e4 . b4 . a4 g4 f4 . e4 . d4 e4 f4 . e4 f4 e4 . c5 . b4 a4 g4 . f4 . e4 . . . g4 a4 bb4 . a4 g4 f4 . e4 f4 g4 . f4 e4 d4 . e4 . . . b4 . c5 . b4 . a4 . g#4 . . .',
    b: 'e2 e2 e3 e2 e2 e2 e3 e2 f2 f2 f3 f2 f2 f2 f3 f2 e2 e2 e3 e2 e2 e2 e3 e2 d2 d2 d3 d2 f2 f2 f3 f2 c2 c2 c3 c2 c2 c2 c3 c2 d2 d2 d3 d2 d2 d2 d3 d2 e2 e2 e3 e2 e2 e2 e3 e2 e2 e2 e3 e2 b1 b1 b2 b1' },
  sieg: { bpm: 150, once: 1, l: 'g4 c5 e5 g5 . e5 g5 . . . a4 c5 f5 a5 . f5 a5 . . . b4 d5 g5 b5 . . c6 . . . . .', b: 'c3 . . . . . c3 . . . f2 . . . . . f2 . . . g2 . . . . . c3 . . . . .' }
};

/* ---------- Sprites (eigene Pixelfiguren, Text-Raster) ---------- */
const PAL = { k: '#1c1420', o: '#e8782a', O: '#a8501c', w: '#fbf2e2', e: '#1a1a2a', n: '#2a1a10', b: '#3a6ad8', B: '#24408a', y: '#ffd04a', s: '#5a3a20',
  h: '#ff9ad0', H: '#c0609a', f: '#ffd8b8', c: '#e6dfe8', C: '#b0a8c0', p: '#6a2aa8', g: '#5ad86a', G: '#2a9a4a', P: '#5a2a8a', S: '#6a6678', r: '#ff4a3a' };
const mir = rows => rows.map(r => r + [...r].reverse().join(''));
const pad = rows => rows.map(r => (r + '................').slice(0, 16));
const FOXF = mir(['..k.....', '..kok...', '..koOk..', '.koooooo', 'kooooooo', 'koooeooo', 'kooowwww', '.koowwwn', '..kkwwww', '..kbbbyy', '.kobbbbb', '.kobbbBb', '..kbbbbb', '..kBBBBB', '...ksk..', '...kkk..']);
const FOXB = FOXF.map((r, y) => { let a = [...r]; if (y >= 5 && y <= 8) a = a.map(c => 'ewn'.includes(c) ? 'o' : c); if (y >= 11 && y <= 14) for (let x = 6; x <= 9; x++) a[x] = y === 14 ? 'w' : (x === 6 || x === 9) ? 'O' : 'o'; return a.join(''); });
const FOXS = pad(['.....k', '....kok', '....koOk', '...koooook', '..koooooooOk', '.kwoeoooooOk', 'nwwwwooooook', '.kwwwoooooOk', '..kkkwwwkkk', '....kbyybk', '...kbbbbbk', '...kobbbbk.ooo', '....kbbbbkoooOk', '....kBBBBkkwwk', '....ks.sk', '....kk.kk']);
const HUMF = mir(['....kkkk', '...khhhh', '..khhhhh', '..khhhhH', '.khhffff', '.khfefff', '.khfffff', '.khhffff', '.khhcccy', '.khpcccc', 'khpfcccc', 'kppcccCc', 'kppccccc', '.kpCCCCC', '...ksk..', '...kkk..']);
const HUMB = HUMF.map((r, y) => { let a = [...r]; if (y >= 4 && y <= 8) for (let x = 2; x <= 13; x++) if (a[x] !== 'k') a[x] = 'h'; if (y >= 9 && y <= 13) for (let x = 3; x <= 12; x++) if (a[x] !== 'k') a[x] = 'p'; return a.join(''); });
const HUMS = pad(['.....kkkk', '....khhhhk', '...khhhhhhk', '...khhhhHhhk', '...kffhhhhhk', '..kfeffhhhhhk', '...kfffhhhhhk', '....kffhhhhhk', '....kcyhhhhk', '...kfccpppk', '...kcccpppk', '...kcccCppk', '...kccccpk', '....kCCCk', '....ks.sk', '....kk.kk']);
const GLIB = pad(['', '', '', '.......kk', '.....kkggkk', '....kgwwgggk', '...kgwwgggggk', '..kggggggggggk', '..kgggggggggGk', '.kggekggggekgGk', '.kggkkggggkkgGk', '.kgggggkkgggGGk', '.kggggggggggGGk', '..kGGGGGGGGGGk', '...kkkkkkkkkk', '']);
const FLAT = pad(['', '', '', '.k............k', '.kpk...kk...kpk', '.kppk.kppk.kppk', 'kpppPkppppkPpppk', 'kppPPppppppPPppk', 'kpP.kpyppykp.Ppk', 'kP..kppppppk..Pk', 'k....kpwwpk....k', '.....kppppk', '......kkkk', '', '', '']);
const STEIN = pad(['', '.....kkkkkk', '....kssssssk', '...kssSssSssk', '...ksrrssrrsk', '...kssssssssk', '..kkskkkkkkskk', '.kssksssssskssk', '.kSSksssssskSSk', '.kSkssSsssSskSk', '..kksssssssskk', '....ksSssSsk', '....kssk.ssk', '...kSSk..kSSk', '...kkkk..kkkk', '']);
function spr(rows, pal, flip) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16; const x = c.getContext('2d'), P = Object.assign({}, PAL, pal || {});
  rows.forEach((r, y) => { for (let i = 0; i < 16; i++) { const ch = r[i]; if (!ch || ch === '.') continue; x.fillStyle = PAL[ch] && P[ch] || '#f0f'; x.fillRect(flip ? 15 - i : i, y, 1, 1); } }); return c;
}
const SET = (F, B, S, pal) => [spr(F, pal), spr(B, pal), spr(S, pal), spr(S, pal, 1)];   // unten, oben, links, rechts
function bossSpr() {   /* Grauwächter: Kapuzengestalt, aus Formeln gezeichnet */
  const N = 64, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), m = [];
  for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) { const dx = i - 32, hood = Math.hypot(dx, (y - 17) * 1.1) < 12, cloak = y > 18 && y < 61 && Math.abs(dx) < 9 + (y - 18) * .5 - (y > 54 ? (y - 54) * 1.5 : 0), arm = y > 26 && y < 40 && Math.abs(Math.abs(dx) - 19 - (y - 26) * .25) < 4; m[y * N + i] = hood || cloak || arm ? 1 : 0; }
  for (let y = 0; y < N; y++) for (let i = 0; i < N; i++) { if (!m[y * N + i]) { const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => m[(y + b) * N + i + a]); if (nb) { x.fillStyle = '#0e0c14'; x.fillRect(i, y, 1, 1); } continue; }
    const sh = (i - 32) / 30 + (y % 6 === 0 ? .08 : 0), v = Math.round(118 - sh * 60 - y * .5); x.fillStyle = `rgb(${v},${v},${v + 12})`; x.fillRect(i, y, 1, 1); }
  x.fillStyle = '#1a1622'; x.beginPath(); x.ellipse(32, 19, 7, 6, 0, 0, 6.283); x.fill();
  x.fillStyle = '#c8f4ff'; x.fillRect(28, 18, 3, 2); x.fillRect(34, 18, 3, 2); x.fillStyle = '#fff'; x.fillRect(29, 18, 1, 1); x.fillRect(35, 18, 1, 1);
  for (const s of [-1, 1]) { x.fillStyle = '#8a8a9a'; x.beginPath(); x.arc(32 + s * 22, 41, 4, 0, 6.283); x.fill(); x.fillStyle = '#d0d0e0'; x.fillRect(32 + s * 22 - 1, 39, 2, 2); }
  return c;
}

/* ---------- Kacheln ---------- */
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };
function tileCanvas(fn) { const c = document.createElement('canvas'); c.width = c.height = TS; const x = c.getContext('2d'); fn(x, (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); }); return c; }
const grass = (x, R, v) => { R('#5cbc4a', 0, 0, 16, 16); for (let y = 0; y < 16; y++) for (let i = (y + v) % 2; i < 16; i += 2) if (((i >> 2) + (y >> 2) + v) % 3 === 0) R('#52ae42', i, y, 1, 1);
  for (let k = 0; k < 5; k++) { const h = hash(v + 3, k), a = h % 14, b = 2 + (h >>> 6) % 12; R('#3e9638', a, b + 1, 1, 2); R('#3e9638', a + 2, b + 1, 1, 2); R('#86dc62', a + 1, b, 1, 2); }
  for (let k = 0; k < 3; k++) { const h = hash(v + 11, k); R('#9ae874', h % 15, (h >>> 5) % 15, 1, 1); } };
const stone = (R, a, b, c, d) => { R(a, 0, 0, 16, 16); for (let r = 0; r < 4; r++) { const y = r * 4, o = (r % 2) * 4; for (let q = -1; q < 3; q++) { const X = o + q * 8; R(b, X + 1, y + 1, 7, 2); R(c, X + 1, y, 7, 1); R(d, X, y, 1, 4); R(d, X, y + 3, 8, 1); } } };
const floor = (x, R, v) => { R('#3c3a5e', 0, 0, 16, 16); R('#4c4a74', 1, 1, 6, 6); R('#4c4a74', 9, 9, 6, 6); R('#46446a', 9, 1, 6, 6); R('#46446a', 1, 9, 6, 6); R('#5e5c8a', 1, 1, 6, 1); R('#5e5c8a', 9, 9, 6, 1); R('#2a283e', 0, 7, 16, 2); R('#2a283e', 7, 0, 2, 16); if (v % 4 === 0) { R('#34324e', 3, 4, 3, 1); R('#34324e', 5, 5, 1, 2); } };
const TILES = {
  '.': v => tileCanvas((x, R) => grass(x, R, v % 4)),
  ',': v => tileCanvas((x, R) => { grass(x, R, v % 4); const C = [['#ff6a9a', '#ffd0e0'], ['#ffd84a', '#fff6b0'], ['#ffffff', '#ffe0f0'], ['#7ab4ff', '#d0e8ff']];
    for (let k = 0; k < 4; k++) { const h = hash(v, k + 9), a = 2 + h % 11, b = 2 + (h >>> 4) % 11, [c1, c2] = C[(h >>> 9) % 4]; R('#3e9638', a, b + 2, 1, 2); R(c1, a - 1, b, 3, 1); R(c1, a, b - 1, 1, 3); R(c2, a, b, 1, 1); } }),
  '=': v => tileCanvas((x, R) => { R('#e6c88e', 0, 0, 16, 16); for (let y = 0; y < 16; y++) for (let i = y % 2; i < 16; i += 2) if (hash(i + v * 17, y) % 5 === 0) R('#d6b47a', i, y, 1, 1);
    for (let k = 0; k < 4; k++) { const h = hash(v, k), a = 1 + h % 13, b = 1 + (h >>> 5) % 13; R('#b48c58', a, b + 1, 2, 1); R('#f6e2b4', a, b, 2, 1); } }),
  '#': v => tileCanvas((x, R) => { grass(x, R, v % 4); R('rgba(10,40,20,.45)', 2, 12, 13, 3); R('#5a3a1e', 6, 10, 4, 6); R('#7a5030', 7, 10, 2, 6);
    const rows = [[5, 6], [3, 10], [2, 12], [1, 14], [1, 14], [1, 14], [1, 14], [2, 12], [2, 12], [4, 8]]; rows.forEach(([a, w], y) => R('#1e6a34', a, y + 1, w, 1));
    const in2 = [[6, 4], [4, 8], [3, 10], [3, 10], [3, 9], [3, 9], [4, 7]]; in2.forEach(([a, w], y) => R('#2e8a40', a, y + 2, w, 1));
    [[5, 3], [4, 6], [4, 6], [5, 4]].forEach(([a, w], y) => R('#4caa4c', a, y + 2, w, 1)); R('#82d25e', 5, 3, 2, 1); R('#82d25e', 4, 4, 1, 1); R('#9ae874', 6, 3, 1, 1);
    for (let k = 0; k < 6; k++) { const h = hash(v, k + 30); R('#1a5a2c', 3 + h % 10, 6 + (h >>> 4) % 4, 1, 1); } }),
  '~': v => [0, 1, 2].map(f => tileCanvas((x, R) => { R('#3a8ae8', 0, 0, 16, 16); for (let y = 0; y < 16; y++) for (let i = (y + f) % 2; i < 16; i += 2) if (((i + f * 2) >> 2 ^ y >> 2) % 3 === 0) R('#2e74d0', i, y, 1, 1);
    for (let r = 0; r < 4; r++) { const o = (r * 5 + f * 3 + v) % 16; R('#7ac0ff', o, r * 4 + 1, 4, 1); R('#bfe4ff', o + 1, r * 4 + 1, 2, 1); R('#2a62b8', (o + 8) % 16, r * 4 + 3, 3, 1); } if ((v + f) % 3 === 0) R('#ffffff', (v * 5 + f * 3) % 14 + 1, (v * 3) % 12 + 2, 1, 1); })),
  'R': v => tileCanvas((x, R) => { R('#c84a32', 0, 0, 16, 16); for (let r = 0; r < 4; r++) { const y = r * 4, o = (r % 2) * 2; for (let q = -1; q < 5; q++) { const X = o + q * 4; R('#e0603e', X, y, 3, 2); R('#f4885a', X, y, 2, 1); R('#9a3020', X + 3, y, 1, 3); } R('#8a2a1c', 0, y + 3, 16, 1); } }),
  'H': v => tileCanvas((x, R) => { R('#f6e6c2', 0, 0, 16, 16); R('#e2ceA2', 0, 12, 16, 2); R('#7a4a28', 0, 0, 2, 16); R('#7a4a28', 14, 0, 2, 16); R('#9a6a3c', 0, 0, 16, 2); R('#5a3418', 0, 2, 16, 1);
    if (v % 2) { R('#5a3418', 4, 4, 8, 7); R('#4a8ae0', 5, 5, 6, 5); R('#bfe4ff', 5, 5, 2, 2); R('#8ac0ff', 7, 7, 1, 1); R('#5a3418', 7, 5, 1, 5); R('#8a5a30', 3, 11, 10, 2); R('#ff6a9a', 4, 10, 1, 1); R('#ffd84a', 7, 10, 1, 1); R('#ff6a9a', 10, 10, 1, 1); R('#3e9638', 5, 10, 1, 1); R('#3e9638', 9, 10, 1, 1); }
    R('#b4a078', 0, 14, 16, 2); R('#8a7a58', 0, 15, 16, 1); }),
  'D': v => tileCanvas((x, R) => { R('#f6e6c2', 0, 0, 16, 16); R('#9a6a3c', 0, 0, 16, 2); R('#5a3418', 0, 2, 16, 1); R('#4a2a12', 3, 4, 10, 12); R('#4a2a12', 4, 3, 8, 1); R('#8a5428', 4, 5, 8, 11); R('#a86a34', 5, 5, 2, 11); R('#5a3418', 7, 4, 2, 12); R('#ffd84a', 10, 10, 2, 2); R('#fff6b0', 10, 10, 1, 1); R('#b4a078', 0, 14, 3, 2); R('#b4a078', 13, 14, 3, 2); }),
  'F': v => tileCanvas((x, R) => { grass(x, R, v % 4); R('rgba(10,40,20,.35)', 0, 13, 16, 2); for (const a of [1, 6, 11]) { R('#f0e0c8', a, 4, 3, 10); R('#fff8ec', a, 4, 1, 10); R('#b8a080', a + 2, 4, 1, 10); R('#f0e0c8', a + 1, 3, 1, 1); } R('#d8c4a4', 0, 7, 16, 2); R('#d8c4a4', 0, 11, 16, 1); }),
  's': v => tileCanvas((x, R) => { if (v < 0) floor(x, R, 1); else grass(x, R, 1); R('rgba(0,0,0,.3)', 4, 13, 9, 2); R('#6a4424', 7, 9, 2, 6); R('#4a2c14', 2, 2, 12, 8); R('#e0b870', 3, 3, 10, 6); R('#f6d898', 3, 3, 10, 1); R('#8a5a30', 5, 5, 6, 1); R('#8a5a30', 5, 7, 4, 1); }),
  'w': v => tileCanvas((x, R) => { grass(x, R, v % 4); R('rgba(0,0,0,.3)', 2, 14, 13, 2); R('#8a8aa4', 2, 5, 12, 10); R('#b0b0c8', 2, 5, 12, 2); R('#6a6a84', 2, 12, 12, 3); R('#3a8ae8', 4, 7, 8, 4); R('#9ad4ff', 5, 7, 3, 1); R('#8a5a30', 1, 0, 2, 7); R('#8a5a30', 13, 0, 2, 7); R('#c8583a', 0, 0, 16, 2); R('#e0784a', 0, 0, 16, 1); }),
  'P': v => tileCanvas((x, R) => stone(R, '#9aa0c8', '#aab0d8', '#c8ccf0', '#646a94')),
  'E': v => tileCanvas((x, R) => { stone(R, '#9aa0c8', '#aab0d8', '#c8ccf0', '#646a94'); R('#2a1a40', 3, 4, 10, 12); R('#2a1a40', 4, 3, 8, 1); R('#5a3a8a', 4, 5, 8, 11); R('#160c24', 5, 6, 6, 10); R('#ffd84a', 7, 1, 2, 2); }),
  'W': v => tileCanvas((x, R) => stone(R, '#5a5888', '#6a68a0', '#8a88c0', '#34325a')),
  '_': v => tileCanvas((x, R) => floor(x, R, v)),
  'S': v => tileCanvas((x, R) => { R('#3c3a5e', 0, 0, 16, 16); for (let i = 0; i < 4; i++) { R(['#c8c4ec', '#a8a4d0', '#8884b4', '#686498'][i], 1, i * 4, 14, 3); R('#e8e4ff', 1, i * 4, 14, 1); R('#2a283e', 1, i * 4 + 3, 14, 1); } }),
  'U': v => tileCanvas((x, R) => { R('#3c3a5e', 0, 0, 16, 16); for (let i = 0; i < 4; i++) { R(['#585480', '#46426a', '#322e52', '#1e1a36'][i], 1, i * 4, 14, 3); R('#6a6694', 1, i * 4, 14, 1); } R('#ffd84a', 7, 1, 2, 2); }),
  'x': v => tileCanvas((x, R) => { floor(x, R, v); R('rgba(0,0,0,.35)', 3, 13, 11, 3); R('#8a88c0', 4, 1, 8, 13); R('#b0aee0', 5, 1, 2, 13); R('#5a5888', 10, 1, 2, 13); R('#c8c6f0', 3, 0, 10, 2); R('#c8c6f0', 3, 13, 10, 2); R('#ffd84a', 7, 6, 2, 2); }),
  'W2': null
};
const ANIM = { '~': 1 };

/* ---------- Karten (eigene) ---------- */
const MAPS = {
  dorf: { name: 'Kieselbach', base: '.', bg: 'feld', rows: [
    '########################',
    '#######PPPPPP######~~###',
    '######PPPPPPPP####~~~~##',
    '######PPPPPEPP##..~~~..#',
    '##.....,...=....,..~~..#',
    '#..,.......=.......~~..#',
    '#...#......=...,..~~~..#',
    '#..##..,...=........~..#',
    '#..........=.....#.....#',
    '#.,....#...=......,....#',
    '#..........=...........#',
    '#...,......=.....##...C#',
    '##.........=.......,..##',
    '##FFFFFFFFF=FFFFFFFFFF##',
    '#..........=...........#',
    '#.RRRR.....=.....RRRR..#',
    '#.RRRR.....=.....RRRR..#',
    '#.HDHH.....=.....HHDH..#',
    '#..=.......=.......=...#',
    '#..=================...#',
    '#..........=.......,...#',
    '#...,......=...........#',
    '#.....w....=....,......#',
    '#..........=...........#',
    '#.......RRRRRRR........#',
    '#.......RRRRRRR........#',
    '#.......HHHDHHH........#',
    '#..,..........Q....,...#',
    '#......................#',
    '########################'],
    links: [{ x: 11, y: 3, to: 'turm1', tx: 7, ty: 11, d: 1 }],
    foes: [[5, 8, 'glibber'], [16, 6, 'glibber'], [14, 10, 'glibber'], [8, 5, 'flatter'], [20, 9, 'glibber']] },
  turm1: { name: 'Turm der Farben · 1. Stock', base: '_', bg: 'turm', rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWSWWWWWWWW',
    'W______G_______W',
    'W______________W',
    'W__o________o__W',
    'W______________W',
    'W___B______B___W',
    'W______________W',
    'W_WWWW____WWWW_W',
    'W_W__C____W__C_W',
    'W_W_______W____W',
    'W________s_____W',
    'W______U_______W',
    'WWWWWWWWWWWWWWWW'],
    links: [{ x: 7, y: 12, to: 'dorf', tx: 11, ty: 4, d: 0 }, { x: 7, y: 1, to: 'turm2', tx: 7, ty: 10, d: 1 }],
    foes: [[12, 10, 'flatter'], [2, 5, 'glibber']] },
  turm2: { name: 'Turm der Farben · 2. Stock', base: '_', bg: 'turm', rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWSWWWWWWWW',
    'WWWWWWWKWWWWWWWW',
    'W______________W',
    'W_C__________x_W',
    'W____x_________W',
    'WWWWWWWGWWWWWWWW',
    'W______________W',
    'W_T__________T_W',
    'W______________W',
    'W____s_________W',
    'W_T____U_____T_W',
    'WWWWWWWWWWWWWWWW'],
    links: [{ x: 7, y: 11, to: 'turm1', tx: 7, ty: 3, d: 0 }, { x: 7, y: 1, to: 'turm3', tx: 7, ty: 9, d: 1 }],
    foes: [[10, 4, 'stein'], [4, 9, 'flatter']] },
  turm3: { name: 'Turm der Farben · Spitze', base: '_', bg: 'boss', rows: [
    'WWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWW',
    'WWx__________xWW',
    'W______________W',
    'W__x________x__W',
    'W______X_______W',
    'W______________W',
    'W__x________x__W',
    'W______________W',
    'W______________W',
    'W______U_______W',
    'WWWWWWWWWWWWWWWW'],
    links: [{ x: 7, y: 10, to: 'turm2', tx: 7, ty: 3, d: 0 }], foes: [] }
};
const CHEST = { dorf_22_11: ['kraut', 2], turm1_5_9: ['stab'], turm1_13_9: ['aether', 2], turm2_2_4: ['key'] };
const ITEM = { kraut: ['Heilkraut', 'Heilt 40 LP'], aether: ['Äther', 'Füllt 15 MP'], stab: ['Funkenstab', 'Entzündet Feuerschalen'], key: ['Turmschlüssel', 'Öffnet die Tür im 2. Stock'] };
const TORCH = [[13, 8], [13, 11], [2, 11], [2, 8]];
const SIGN = {
  dorf_14_27: null,
  turm1_9_11: 'Zwei Steine, zwei Platten. Was du verschiebst, bleibt liegen – bis du den Raum verlässt.',
  turm2_5_10: 'Die Flammen erwachen nur im Lauf der Sonne: erst der Morgen im Nordosten, dann weiter rechts herum.'
};

/* ---------- Gegner ---------- */
const FOE = {
  glibber: { n: 'Glibber', hp: 16, at: 6, df: 1, sp: 4, xp: 5, g: 3 },
  flatter: { n: 'Flatterling', hp: 14, at: 8, df: 1, sp: 9, xp: 6, g: 4 },
  stein: { n: 'Steinwicht', hp: 40, at: 10, df: 5, sp: 3, xp: 16, g: 10 },
  boss: { n: 'Grauwächter', hp: 230, at: 13, df: 5, sp: 6, xp: 90, g: 60 }
};
const SPELL = {
  z: [{ n: 'Funke', mp: 4, tg: 'foe', lv: 1 }, { n: 'Feuerwirbel', mp: 8, tg: 'all', lv: 4 }],
  l: [{ n: 'Heilung', mp: 3, tg: 'ally', lv: 1 }, { n: 'Sternregen', mp: 7, tg: 'all', lv: 3 }]
};
const stat = (id, lv) => id === 'z' ? { n: 'Zotik', mhp: 34 + lv * 8, mmp: 8 + lv * 2, at: 7 + lv * 2, df: 2 + lv, sp: 7 + lv } : { n: 'Lyra', mhp: 26 + lv * 6, mmp: 14 + lv * 3, at: 5 + lv, df: 1 + lv, sp: 6 + lv };
const need = lv => lv * lv * 8;

export function createPixel(o) {
  let root = null, cv = null, ctx = null, on = false, t = 0, AU = null, mus = null, sat = 1;
  const P = () => { const S = o.S(); if (!S.px) S.px = { map: 'dorf', x: 15, y: 28, d: 1, lv: 1, xp: 0, g: 20, hp: { z: 42, l: 32 }, mp: { z: 10, l: 17 }, it: { kraut: 2, aether: 1 }, fl: {} }; return S.px; };
  let G = null;   // Laufzeit: Karte, Figuren, Oberfläche

  /* ---- Klang ---- */
  function audio() { if (!AU) { const a = o.audio && o.audio(); if (!a || !a.AC) return null; const g = a.AC.createGain(); g.gain.value = .55; g.connect(a.master); AU = { AC: a.AC, out: g }; } return AU; }
  function voice(f, tt, d, type, v) { const A = AU; if (!A || !f) return; const os = A.AC.createOscillator(), g = A.AC.createGain(); os.type = type; os.frequency.value = f; g.gain.setValueAtTime(0, tt); g.gain.linearRampToValueAtTime(v, tt + .01); g.gain.setValueAtTime(v * .75, tt + d * .6); g.gain.linearRampToValueAtTime(0, tt + d); os.connect(g); g.connect(A.out); os.start(tt); os.stop(tt + d + .03); }
  function play(name) { if (mus && mus.name === name) return; const A = audio(); mus = A && SONGS[name] ? { name, s: SONGS[name], i: 0, next: A.AC.currentTime + .08 } : null; }
  function musTick() { const A = AU; if (!A || !mus) return; const s = mus.s, step = 60 / s.bpm / 2, L = s.L || (s.L = s.l.split(' ')), B = s.B || (s.B = s.b.split(' '));
    while (mus.next < A.AC.currentTime + .2) { const i = mus.i, tt = mus.next; if (s.once && i >= L.length) { const nx = mus.after; mus = null; if (nx) play(nx); return; }
      const li = L[i % L.length], bi = B[i % B.length]; if (li && li !== '.') { let d = 1; while (L[(i + d) % L.length] === '.' && d < 4) d++; voice(fq(li), tt, step * d * .9, 'square', .045); voice(fq(li) * 1.004, tt, step * d * .9, 'square', .02); }
      if (bi && bi !== '.') voice(fq(bi), tt, step * .85, 'triangle', .12); mus.i++; mus.next += step; } }
  function sx(n) { const A = audio(); if (!A) return; const tt = A.AC.currentTime, v = (f, d, dl, ty, g) => voice(f, tt + (dl || 0), d, ty || 'square', g || .06);
    switch (n) {
      case 'cur': v(1320, .03); break; case 'ok': v(880, .05); v(1320, .07, .05); break; case 'no': v(180, .15, 0, 'square', .07); break;
      case 'hit': v(160, .08, 0, 'sawtooth', .12); v(90, .12, .04, 'square', .1); break; case 'ouch': v(300, .1, 0, 'sawtooth', .1); v(150, .15, .06, 'sawtooth', .1); break;
      case 'mag': for (let k = 0; k < 6; k++) v(500 + k * 160, .08, k * .03, 'triangle', .08); break; case 'heal': for (let k = 0; k < 5; k++) v(660 * Math.pow(1.26, k), .12, k * .06, 'triangle', .08); break;
      case 'chest': ['c5', 'e5', 'g5', 'c6'].forEach((q, k) => v(fq(q), .12, k * .08)); break; case 'push': v(90, .2, 0, 'triangle', .18); break;
      case 'door': v(140, .25, 0, 'sawtooth', .06); v(110, .25, .1, 'sawtooth', .06); break; case 'lvl': ['c5', 'e5', 'g5', 'c6', 'e6'].forEach((q, k) => v(fq(q), .14, k * .07, 'square', .07)); break;
      case 'enc': for (let k = 0; k < 8; k++) v(200 + k * 90, .05, k * .035, 'square', .06); break; case 'fire': v(220, .3, 0, 'sawtooth', .07); v(330, .3, .05, 'sawtooth', .05); break;
    } }

  /* ---- Grafik vorbereiten ---- */
  let SP = null, TC = {};
  function initGfx() { if (SP) return;
    SP = { z: SET(FOXF, FOXB, FOXS), l: SET(HUMF, HUMB, HUMS),
      merle: SET(HUMF, HUMB, HUMS, { h: '#eeeeee', H: '#bbbbbb', c: '#4a9a5a', C: '#2a6a3a', p: '#2a6a3a' }), bruno: SET(HUMF, HUMB, HUMS, { h: '#9a9aaa', H: '#6a6a7a', c: '#3a5ab0', C: '#24408a', p: '#8a8a9a' }),
      hanno: SET(HUMF, HUMB, HUMS, { h: '#c0502a', H: '#8a3418', c: '#fafafa', C: '#c8c8c8', p: '#3a8a4a' }), pia: SET(HUMF, HUMB, HUMS, { h: '#7a4a24', H: '#4a2c14', c: '#ff9a3a', C: '#c06a1a', p: '#ffd04a' }),
      tomi: SET(HUMF, HUMB, HUMS, { h: '#ffd04a', H: '#c09a2a', c: '#3ab0c0', C: '#1a7a8a', p: '#3ab0c0' }), ilse: SET(HUMF, HUMB, HUMS, { h: '#3a2a1a', H: '#1a1008', c: '#6a8ac0', C: '#4a6aa0', p: '#c0a060' }),
      glibber: spr(GLIB), flatter: spr(FLAT), stein: spr(STEIN), boss: bossSpr() }; }
  function tileImg(ch, tx, ty) { const v = ch === 's' && G && G.M.base === '_' ? -1 : hash(tx, ty) % 8, k = ch + v; let c = TC[k]; if (c === undefined) { const f = TILES[ch]; c = TC[k] = f ? f(v) : null; } return Array.isArray(c) ? c[Math.floor(t * 3) % c.length] : c; }

  /* ---- Karte laden ---- */
  const flag = k => !!P().fl[k];
  function load(name, x, y, d) { const M = MAPS[name], p = P(); p.map = name; p.x = x; p.y = y; if (d !== undefined) p.d = d;
    const rows = M.rows.map(r => [...r]), blocks = [], foes = [];
    rows.forEach((r, j) => r.forEach((c, i) => { if (c === 'B') { blocks.push({ x: i, y: j, px: i * TS, py: j * TS }); r[i] = '_'; } }));
    if (name === 'turm1' && p.fl.t1) { blocks[0].x = 3; blocks[0].y = 4; blocks[1].x = 12; blocks[1].y = 4; blocks.forEach(b => { b.px = b.x * TS; b.py = b.y * TS; }); }
    for (const [fx, fy, k] of M.foes) foes.push({ x: fx, y: fy, px: fx * TS, py: fy * TS, k, d: 0 });
    G = Object.assign(G || {}, { M, name, rows, w: rows[0].length, h: rows.length, blocks, foes, mv: null, pl: { x, y, px: x * TS, py: y * TS }, ly: { x, y: y + (p.d === 1 ? 1 : 0), px: x * TS, py: (y + (p.d === 1 ? 1 : 0)) * TS, d: p.d } });
    if (!walk(G.ly.x, G.ly.y, 1)) { G.ly.x = x; G.ly.y = y; G.ly.px = x * TS; G.ly.py = y * TS; }
    play(name === 'dorf' ? (p.fl.stone ? 'hell' : 'dorf') : name === 'turm3' && !p.fl.boss ? 'turm' : name === 'dorf' ? 'dorf' : 'turm');
    G.title = { t: 2.2, s: M.name }; o.save && o.save(); }
  const NPC = () => { const p = P(), f = p.fl; return G.name !== 'dorf' ? (G.name === 'turm3' && !f.boss ? [{ x: 7, y: 3, s: 'boss', big: 1, talk: bossTalk }] : []) : [
    { x: 11, y: 22, s: 'merle', d: 1, talk: merle },
    f.quest ? { x: 12, y: 14, s: 'bruno', d: 2, talk: () => say([['Bruno', f.stone ? 'Die Wiese ist wieder grün! Ich hätte nie gedacht, dass ich mich über Gras so freuen kann.' : 'Merle sagt, du willst zum Turm. Pass auf die Glibber auf, die springen dir gern ins Gesicht.']]) }
      : { x: 11, y: 13, s: 'bruno', d: 0, talk: () => say([['Bruno', 'Halt! Hinter dem Zaun treiben sich graue Glibber herum. Ohne Erlaubnis von Merle lasse ich niemanden durch.'], ['Bruno', 'Merle wohnt im großen Haus im Süden. Frag sie.']]) },
    { x: 4, y: 18, s: 'hanno', d: 0, talk: inn },
    { x: 20, y: 18, s: 'pia', d: 0, talk: shop },
    { x: 6, y: 21, s: 'tomi', d: 0, talk: () => say([['Tomi', f.stone ? 'Der Brunnen ist wieder blau! Und meine Jacke auch!' : 'Früher war der Brunnen blau. Jetzt ist alles grau wie kalter Haferbrei.']]) },
    { x: 21, y: 5, s: 'ilse', d: 3, talk: () => say([['Ilse', f.stone ? 'Heute beißen sie wie verrückt! Die Fische mögen Farben, glaub mir.' : 'Seit das Wasser grau ist, beißt kein Fisch mehr. Sogar die Fische sind traurig.']]) }]; };

  /* ---- Gehen ---- */
  const tileAt = (x, y) => G.rows[y] && G.rows[y][x] || '#';
  function walk(x, y, ignoreEnt) { const c = tileAt(x, y), f = P().fl;
    let ok = '.,=_oSUE'.includes(c) || (c === 'G' && (G.name === 'turm1' ? f.t1 : f.t2)) || (c === 'K' && f.door);
    if (!ok) return false; if (ignoreEnt) return true;
    return !G.blocks.some(b => b.x === x && b.y === y) && !NPC().some(n => n.x === x && (n.y === y || (n.big && n.y === y - 1))); }
  const DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  function tryMove(d) { const p = P(), pl = G.pl, [dx, dy] = DIRS[d]; p.d = d; const nx = pl.x + dx, ny = pl.y + dy;
    const foe = G.foes.find(e => e.x === nx && e.y === ny); if (foe) { battle(foe.k, foe); return; }
    const bl = G.blocks.find(b => b.x === nx && b.y === ny);
    if (bl) { const bx = nx + dx, by = ny + dy; if (walk(bx, by) && !G.foes.some(e => e.x === bx && e.y === by) && !(G.name === 'turm1' && P().fl.t1)) { bl.x = bx; bl.y = by; sx('push'); beginStep(nx, ny, bl); } return; }
    if (!walk(nx, ny)) return; beginStep(nx, ny); }
  function beginStep(nx, ny, bl) { const pl = G.pl, ly = G.ly; G.mv = { k: 0, fx: pl.x, fy: pl.y, lx: ly.x, ly: ly.y, bl, bfx: bl ? bl.px : 0, bfy: bl ? bl.py : 0 };
    ly.d = ly.x < pl.x ? 3 : ly.x > pl.x ? 2 : ly.y > pl.y ? 1 : 0; ly.x = pl.x; ly.y = pl.y; pl.x = nx; pl.y = ny;
    for (const e of G.foes) foeStep(e); }
  function foeStep(e) { const pl = G.pl, dx = pl.x - e.x, dy = pl.y - e.y; e.fx = e.x; e.fy = e.y; let opts;
    if (Math.abs(dx) + Math.abs(dy) <= 6) opts = Math.abs(dx) >= Math.abs(dy) ? [[Math.sign(dx), 0], [0, Math.sign(dy) || 1]] : [[0, Math.sign(dy)], [Math.sign(dx) || 1, 0]];
    else opts = Math.random() < .5 ? [] : [DIRS[Math.random() * 4 | 0]];
    for (const [ax, ay] of opts) { const nx = e.x + ax, ny = e.y + ay; if (!ax && !ay) continue; if (nx === pl.x && ny === pl.y) { e.hit = 1; return; }
      if (walk(nx, ny) && !(nx === G.ly.x && ny === G.ly.y) && !G.foes.some(q => q !== e && q.x === nx && q.y === ny) && tileAt(nx, ny) !== 'E' && !G.M.links.some(l => l.x === nx && l.y === ny)) { e.x = nx; e.y = ny; return; } } }
  function stepDone() { const p = P(), pl = G.pl; p.x = pl.x; p.y = pl.y;
    const hit = G.foes.find(e => e.hit); if (hit) { G.foes.forEach(e => e.hit = 0); battle(hit.k, hit); return; }
    if (G.name === 'turm1' && !p.fl.t1) { const sw = [[3, 4], [12, 4]]; if (sw.every(([a, b]) => G.blocks.some(q => q.x === a && q.y === b))) { p.fl.t1 = 1; sx('door'); say([['', 'Klack! Beide Platten sind beschwert – das Gitter im Norden hebt sich.']]); } }
    const L = G.M.links.find(l => l.x === pl.x && l.y === pl.y); if (L) fade(() => load(L.to, L.tx, L.ty, L.d)); }

  /* ---- Ansprechen ---- */
  function act() { const p = P(), [dx, dy] = DIRS[p.d], x = G.pl.x + dx, y = G.pl.y + dy, c = tileAt(x, y), f = p.fl, id = G.name + '_' + x + '_' + y;
    const n = NPC().find(q => q.x === x && (q.y === y || (q.big && q.y === y - 1))); if (n) { n.d = [1, 0, 3, 2][p.d]; return n.talk(); }
    if (c === 'C') { if (f['c_' + id]) return say([['', 'Die Truhe ist leer.']]); const it = CHEST[id]; f['c_' + id] = 1; sx('chest'); p.it[it[0]] = (p.it[it[0]] || 0) + (it[1] || 1);
      return say([['', 'Du findest: ' + ITEM[it[0]][0] + (it[1] > 1 ? ' ×' + it[1] : '') + '!' + (it[0] === 'stab' ? ' Damit lassen sich Feuerschalen entzünden.' : it[0] === 'key' ? ' Er passt bestimmt zu einer Tür.' : '')]]); }
    if (c === 's') return say([['', SIGN[id] || '…']]);
    if (c === 'T') { const i = TORCH.findIndex(([a, b]) => a === x && b === y); if (f.t2 || i < (f.tq || 0)) return say([['', 'Die Flamme brennt hell.']]);
      if (!p.it.stab) return say([['', 'Eine kalte Feuerschale. Mit etwas Feuer könnte man sie entzünden.']]);
      if (i === (f.tq || 0)) { f.tq = (f.tq || 0) + 1; sx('fire'); if (f.tq === 4) { f.t2 = 1; sx('door'); say([['', 'Alle vier Flammen lodern. Das Gitter in der Mitte gleitet zur Seite!']]); } return; }
      f.tq = 0; sx('no'); return say([['', 'Fauch! Die Flammen verlöschen alle wieder … falsche Reihenfolge.']]); }
    if (c === 'K' && !f.door) { if (!p.it.key) return say([['', 'Eine schwere Tür mit Schlüsselloch.']]); f.door = 1; p.it.key = 0; sx('door'); return say([['', 'Der Turmschlüssel dreht sich knirschend. Die Tür ist offen!']]); }
    if (c === 'G' && !walk(x, y, 1)) return say([['', G.name === 'turm1' ? 'Ein Gitter. Irgendwo muss es einen Mechanismus geben.' : 'Ein Gitter. Die vier Feuerschalen ringsum sind kalt.']]);
    if (c === 'D') return say([['', 'Die Tür ist zu. Drinnen ist es still.']]);
    if (c === 'w') return say([['', f.stone ? 'Klares, blaues Wasser glitzert im Brunnen.' : 'Das Wasser im Brunnen ist grau und trüb.']]);
    if (c === 'Q') return say([['', f.done ? 'Die Pforte zurück in die Würfelwelt schimmert in allen Farben.' : 'Die Pforte zurück in die Würfelwelt. Dein Fortschritt hier bleibt erhalten.']], null, [{ t: 'Zurückkehren', fn: () => exit() }, { t: 'Hierbleiben', fn: () => {} }]);
    if (c === 'X') { if (!f.boss) return; if (f.stone) return say([['', 'Der Sockel ist leer.']]); f.stone = 1; sx('chest');
      return say([['Zotik', 'Der Farbstein! Er pulsiert in allen Farben gleichzeitig.'], ['Lyra', 'Schnell, zurück nach Kieselbach!']], () => fade(() => { load('dorf', 11, 21, 0); G.restore = 0; sx('lvl'); mus = null; play('sieg'); if (mus) mus.after = 'hell';
        setTimeout(() => say([['Merle', 'Sieh nur … das Dach, der Brunnen, die Blumen! Kieselbach leuchtet wieder!'], ['Merle', 'Danke, Zotik. Danke, Lyra. Ihr habt unserem Tal die Farben zurückgegeben.'], ['Zotik', 'Gern geschehen. Aber jetzt ruft unsere eigene Welt.'], ['Merle', 'Die Pforte im Süden bringt euch zurück. Kommt uns besuchen, wann immer ihr wollt!']], () => { f.done = 1; o.save && o.save(); }), 2600); })); }
  }
  function merle() { const p = P(), f = p.fl;
    if (!f.quest) return say([['Merle', 'Ein Fremder … und du hast Farbe! Wie lange habe ich kein Orange mehr gesehen.'], ['Merle', 'Seit der Grauwächter im Turm wohnt, verblasst Kieselbach. Erst die Blumen, dann die Dächer, jetzt sogar das Wasser.'], ['Zotik', 'Der Turm im Norden, hinter dem Zaun?'],
      ['Merle', 'Ganz oben ruht der Farbstein, das Herz unseres Tals. Der Grauwächter hat ihn ausgesaugt. Bring ihn zurück!'], ['Merle', 'Bruno lässt euch durch. Und nehmt das hier mit – drei Heilkräuter aus meinem Garten.']], () => { f.quest = 1; p.it.kraut = (p.it.kraut || 0) + 3; sx('chest'); o.save && o.save(); });
    if (!f.stone) return say([['Merle', 'Im Turm verschieben sich Steine und schlafen Flammen. Wenn ihr euch verrennt, verlasst den Raum – dann liegt alles wieder an seinem Platz.'], ['Merle', 'Und ruht euch bei Hanno im Gasthaus aus, bevor ihr ganz nach oben steigt.']]);
    say([['Merle', 'Kieselbach leuchtet wieder! Die Pforte im Süden bringt euch nach Hause.']]); }
  function inn() { const p = P(); say([['Hanno', 'Willkommen im Gasthaus Zum Kiesel! Eine Nacht kostet 6 Münzen. Ausruhen?']], null, [{ t: 'Ausruhen (6 💰)', fn: () => { if (p.g < 6) return say([['Hanno', 'Hm, das reicht nicht ganz. Na gut, für Weltenreisende heute umsonst.']], rest); p.g -= 6; rest(); } }, { t: 'Nein danke', fn: () => {} }]);
    function rest() { fade(() => { full(); sx('heal'); }, () => say([['Hanno', 'Gut geschlafen? Ihr seht frisch aus wie der Morgentau!']])); } }
  function full() { const p = P(); for (const id of ['z', 'l']) { const s = stat(id, p.lv); p.hp[id] = s.mhp; p.mp[id] = s.mmp; } }
  function shop() { const p = P(), W8 = [['kraut', 8], ['aether', 20]];
    const open = () => menu('Pias Laden · ' + p.g + ' 💰', W8.map(([k, pr]) => ({ t: ITEM[k][0] + '  ' + pr + ' 💰  (hast ' + (p.it[k] || 0) + ')', fn: () => { if (p.g < pr) { sx('no'); return open(); } p.g -= pr; p.it[k] = (p.it[k] || 0) + 1; sx('ok'); open(); } })), 120);
    say([['Pia', 'Heilkräuter und Äther! Graue Zeiten, aber meine Ware ist frisch.']], open); }
  function bossTalk() { say([['Grauwächter', 'Noch ein buntes Ding … Farben sind laut. Farben sind unordentlich. Ich mache alles still und grau.'], ['Zotik', 'Gib Kieselbach seinen Farbstein zurück!'], ['Lyra', 'Vorsicht, Zotik – er saugt die Farbe aus allem, was er berührt!']], () => battle('boss', null)); }

  /* ---- Oberfläche: Dialog, Menü, Überblendung ---- */
  function wrap(text, w) { ctx.font = FONT; const out = []; let line = ''; for (const wd of text.split(' ')) { const tst = line ? line + ' ' + wd : wd; if (ctx.measureText(tst).width > w && line) { out.push(line); line = wd; } else line = tst; } if (line) out.push(line); return out; }
  function say(lines, cb, choices) { const pages = []; for (const [n, tx] of lines) { const L = wrap(tx, 226); for (let i = 0; i < L.length; i += 3) pages.push({ n, L: L.slice(i, i + 3) }); }
    G.dlg = { pages, i: 0, c: 0, cb, ch: choices || null, sel: 0 }; }
  function menu(title, items, w) { G.menu = { title, items, sel: 0, w: w || 140 }; }
  function fade(mid, after) { G.fade = { t: 0, mid, after, did: 0 }; }
  const FONT = 'bold 8px "Courier New", ui-monospace, monospace';
  function win(x, y, w, h) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#3448c0'); g.addColorStop(1, '#141c66'); ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    ctx.fillStyle = '#e8ecff'; ctx.fillRect(x + 1, y, w - 2, 1); ctx.fillRect(x + 1, y + h - 1, w - 2, 1); ctx.fillRect(x, y + 1, 1, h - 2); ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
    ctx.fillStyle = '#8a9ae0'; ctx.fillRect(x + 2, y + 2, w - 4, 1); ctx.fillRect(x + 2, y + 2, 1, h - 4); }
  function txt(s, x, y, col) { ctx.font = FONT; ctx.fillStyle = '#0a0a20'; ctx.fillText(s, x + .5, y + .5); ctx.fillStyle = col || '#fff'; ctx.fillText(s, x, y); }
  function cursor(x, y) { ctx.fillStyle = '#fff'; const b = Math.floor(t * 4) % 2; ctx.beginPath(); ctx.moveTo(x + b, y - 6); ctx.lineTo(x + 5 + b, y - 3); ctx.lineTo(x + b, y); ctx.fill(); }
  function drawDlg() { const D = G.dlg, pg = D.pages[D.i]; if (!pg) return; win(4, 162, 248, 58); if (pg.n) { const w = ctx.measureText(pg.n).width + 12; win(8, 150, w, 14); txt(pg.n, 14, 160, '#ffe060'); }
    let left = Math.floor(D.c); pg.L.forEach((l, i) => { if (left <= 0) return; txt(l.slice(0, left), 12, 178 + i * 13); left -= l.length; });
    const full = D.c >= pg.L.join('').length; if (full && D.i === D.pages.length - 1 && D.ch) { const w = 120, h = D.ch.length * 13 + 8, y = 160 - h; win(130, y, w, h); D.ch.forEach((c, i) => { txt(c.t, 144, y + 13 + i * 13); if (i === D.sel) cursor(136, y + 13 + i * 13); }); }
    else if (full && Math.floor(t * 3) % 2) { ctx.fillStyle = '#fff'; ctx.fillRect(240, 212, 5, 3); ctx.fillRect(241, 215, 3, 1); } }
  function drawMenu() { const m = G.menu, h = m.items.length * 13 + 22; win(8, 8, m.w + 16, h); txt(m.title, 16, 20, '#ffe060'); m.items.forEach((it, i) => { txt(it.t, 24, 34 + i * 13, it.dis ? '#8890b0' : '#fff'); if (i === m.sel) cursor(15, 34 + i * 13); }); }

  /* ---- Eingabe ---- */
  const held = { u: 0, d: 0, l: 0, r: 0, a: 0, b: 0 }, prev = {}, rep = { k: '', t: 0 };
  const KEYS = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', Enter: 'a', KeyE: 'a', KeyJ: 'a', NumpadEnter: 'a', Escape: 'b', KeyK: 'b', KeyX: 'b', KeyQ: 'b' };
  function onKey(e) { if (!on) return; const k = KEYS[e.code] || (e.code === 'Space' ? 'a' : ''); if (!k) return; e.preventDefault(); e.stopImmediatePropagation(); held[k] = e.type === 'keydown' ? 1 : 0; }
  let pr = {};
  function readInput(dt) { pr = {}; for (const k in held) { pr[k] = held[k] && !prev[k]; prev[k] = held[k]; }
    const dk = ['u', 'd', 'l', 'r'].find(k => held[k]); if (dk && dk === rep.k) { rep.t -= dt; if (rep.t <= 0) { pr[dk] = 1; rep.t = .11; } } else { rep.k = dk || ''; rep.t = .32; } }

  /* ---- Kampf ---- */
  let B = null;
  function battle(kind, ref) { const p = P(); const grp = kind === 'boss' ? ['boss'] : kind === 'glibber' ? Array(1 + (Math.random() * 2.4 | 0)).fill('glibber') : kind === 'flatter' ? ['flatter', 'flatter'] : ['stein', 'glibber'];
    const xs = grp.length === 1 ? [128] : grp.length === 2 ? [92, 164] : [64, 128, 192], cnt = {};
    B = { kind, ref, foes: grp.map((k, i) => { cnt[k] = (cnt[k] || 0) + 1; return Object.assign({}, FOE[k], { k, mhp: FOE[k].hp, x: xs[i], fl: 0, a: 1, tag: grp.filter(q => q === k).length > 1 ? ' ' + 'ABC'[cnt[k] - 1] : '' }); }),
      ph: 'intro', t: 0, msg: grp.length > 1 ? FOE[grp[0]].n + ' und Gefolge tauchen auf!' : FOE[grp[0]].n + ' stellt sich euch in den Weg!', who: 0, acts: [], sel: 0, list: null, tgt: 0, pending: null, q: [], pops: [], shake: 0, turn: 0, wl: null };
    sx('enc'); play(kind === 'boss' ? 'boss' : 'kampf'); G.swirl = .6; }
  const party = () => ['z', 'l'].map(id => Object.assign(stat(id, P().lv), { id, hp: P().hp[id], mp: P().mp[id] }));
  const alive = id => P().hp[id] > 0;
  const firstAlive = from => ['z', 'l'].findIndex((id, i) => i >= from && alive(id));
  const liveFoes = () => B.foes.filter(f => f.hp > 0);
  function nextWho() { const n = firstAlive(B.who + 1); if (n < 0) return exec(); B.who = n; B.ph = 'cmd'; B.sel = 0; }
  function commit(a) { a.who = ['z', 'l'][B.who]; B.acts.push(a); nextWho(); }
  function exec() { const ps = party(), all = B.acts.map(a => Object.assign(a, { sp: ps.find(q => q.id === a.who).sp + Math.random() * 3 }));
    for (const f of liveFoes()) all.push({ foe: f, sp: f.sp + Math.random() * 3 }); all.sort((a, b) => b.sp - a.sp); B.q = all; B.ph = 'exec'; B.t = 0; B.acts = []; }
  const dmg = (at, df, k) => Math.max(1, Math.round((at * (k || 1) - df * .6) * (.88 + Math.random() * .24)));
  function pop(x, y, s, col) { B.pops.push({ x, y, s: String(s), col: col || '#fff', t: 0 }); }
  const PX_Y = { z: 186, l: 204 };
  function perform(a) { const p = P();
    if (a.foe) { const f = a.foe; if (f.hp <= 0) return null; const tg = ['z', 'l'].filter(alive); if (!tg.length) return null; const id = tg[Math.random() * tg.length | 0], st = stat(id, p.lv);
      let k = 1, nm = '', all = 0; if (f.k === 'boss') { B.turn++; if (B.turn % 3 === 0) { all = 1; k = .75; nm = 'Farbsog'; } else if (Math.random() < .35) { k = 1.6; nm = 'Grauschlag'; } if (f.hp < f.mhp / 2 && !B.half) { B.half = 1; nm = 'Grauschlag'; k = 1.7; } }
      else if (f.k === 'flatter' && Math.random() < .3) { k = 1.4; nm = 'Sturzflug'; }
      const hit = all ? tg : [id]; let out = []; for (const h of hit) { const d = dmg(f.at, stat(h, p.lv).df, k); p.hp[h] = Math.max(0, p.hp[h] - d); if (all) p.mp[h] = Math.max(0, p.mp[h] - 3); pop(h === 'z' ? 60 : 160, 176, d, '#ff8a8a'); out.push(stat(h, p.lv).n + (p.hp[h] ? '' : ' sinkt zu Boden')); }
      B.shake = .3; sx('ouch'); return f.n + f.tag + (nm ? ': ' + nm + '!' : ' greift an!') + (all ? ' Alle verlieren Farbe und MP.' : ' ' + out[0] + (p.hp[id] ? ' nimmt Schaden.' : '!')); }
    const st = stat(a.who, p.lv); if (!alive(a.who)) return null;
    const pick = () => { let f = B.foes[a.tgt]; if (!f || f.hp <= 0) f = liveFoes()[0]; return f; };
    const hurt = (f, d, col) => { f.hp = Math.max(0, f.hp - d); f.fl = .35; pop(f.x, f.k === 'boss' ? 70 : 84, d, col); if (f.hp <= 0) f.a = .99; };
    if (a.type === 'atk') { const f = pick(); if (!f) return null; const cr = Math.random() < .1, d = dmg(st.at, f.df, cr ? 1.6 : 1); hurt(f, d); sx('hit'); return st.n + (cr ? ' landet einen Volltreffer!' : ' greift ' + f.n + f.tag + ' an!') + (f.hp ? '' : ' ' + f.n + f.tag + ' löst sich auf.'); }
    if (a.type === 'item') { const it = a.item; if (!(p.it[it] > 0)) return st.n + ' sucht vergeblich in der Tasche.'; p.it[it]--; const id = a.ally || a.who; if (!alive(id)) return 'Das ' + ITEM[it][0] + ' hilft nicht mehr.';
      if (it === 'kraut') { const s2 = stat(id, p.lv), h = Math.min(40, s2.mhp - p.hp[id]); p.hp[id] += h; pop(id === 'z' ? 60 : 160, 176, '+' + h, '#7dffb2'); } else { const s2 = stat(id, p.lv), h = Math.min(15, s2.mmp - p.mp[id]); p.mp[id] += h; pop(id === 'z' ? 60 : 160, 176, '+' + h + ' MP', '#8ad0ff'); }
      sx('heal'); return st.n + ' benutzt ' + ITEM[it][0] + '.'; }
    if (a.type === 'spell') { const sp = a.sp2; if (p.mp[a.who] < sp.mp) return st.n + ' hat nicht genug MP!'; p.mp[a.who] -= sp.mp;
      if (sp.n === 'Heilung') { const id = alive(a.ally) ? a.ally : a.who, s2 = stat(id, p.lv), h = Math.min(24 + p.lv * 4, s2.mhp - p.hp[id]); p.hp[id] += h; pop(id === 'z' ? 60 : 160, 176, '+' + h, '#7dffb2'); sx('heal'); B.fx = { k: 'heal', t: 0 }; return 'Lyra wirkt Heilung auf ' + s2.n + '.'; }
      sx(sp.n === 'Sternregen' ? 'mag' : 'fire'); B.fx = { k: sp.n === 'Sternregen' ? 'star' : 'fire', t: 0 };
      if (sp.tg === 'all') { for (const f of liveFoes()) hurt(f, dmg(sp.n === 'Sternregen' ? 12 + p.lv * 2 : 14 + p.lv * 2, f.df * .3), sp.n === 'Sternregen' ? '#ffe060' : '#ffa060'); return st.n + ' ruft ' + sp.n + '!'; }
      const f = pick(); if (!f) return null; hurt(f, dmg(16 + p.lv * 3, f.df * .3), '#ffa060'); B.fx.x = f.x; return st.n + ' schleudert einen Funken!' + (f.hp ? '' : ' ' + f.n + f.tag + ' verglüht.'); }
    return null; }
  function battleEnd() { const p = P(); if (!liveFoes().length) { const xp = B.foes.reduce((s, f) => s + f.xp, 0), g = B.foes.reduce((s, f) => s + f.g, 0); p.xp += xp; p.g += g; const L = ['Sieg! ' + xp + ' Erfahrung und ' + g + ' Münzen.'];
      while (p.xp >= need(p.lv)) { p.lv++; L.push('Stufe ' + p.lv + '! Zotik und Lyra werden stärker.'); for (const id of ['z', 'l']) { const s = stat(id, p.lv); p.hp[id] = Math.min(s.mhp, p.hp[id] + 8); p.mp[id] = Math.min(s.mmp, p.mp[id] + 3); } for (const k of ['z', 'l']) for (const sp of SPELL[k]) if (sp.lv === p.lv) L.push(stat(k, 1).n + ' lernt ' + sp.n + '!'); sx('lvl'); }
      for (const id of ['z', 'l']) if (!p.hp[id]) p.hp[id] = 1;
      B.ph = 'win'; B.wl = L; B.msg = L.shift(); mus = null; play('sieg'); if (mus) mus.after = G.name === 'dorf' ? (p.fl.stone ? 'hell' : 'dorf') : 'turm'; return true; }
    if (!['z', 'l'].some(alive)) { B.ph = 'lose'; B.msg = 'Zotik und Lyra sind erschöpft …'; mus = null; return true; } return false; }
  function battleUpd(dt) { const p = P(); B.t += dt; for (const q of B.pops) q.t += dt; B.pops = B.pops.filter(q => q.t < 1); B.shake = Math.max(0, B.shake - dt); for (const f of B.foes) { f.fl = Math.max(0, f.fl - dt); if (f.hp <= 0 && f.a > 0) f.a = Math.max(0, f.a - dt * 1.8); } if (B.fx) { B.fx.t += dt; if (B.fx.t > .6) B.fx = null; }
    const ph = B.ph, opts = ['Angriff', 'Zauber', 'Item', 'Flucht'], me = ['z', 'l'][B.who];
    if (ph === 'intro') { if (B.t > 1.1 || pr.a) { B.msg = ''; B.who = firstAlive(0); B.ph = 'cmd'; B.sel = 0; } return; }
    if (ph === 'cmd') { if (pr.u) { B.sel = (B.sel + 3) % 4; sx('cur'); } if (pr.d) { B.sel = (B.sel + 1) % 4; sx('cur'); }
      if (pr.b && B.acts.length) { const a = B.acts.pop(); B.who = ['z', 'l'].indexOf(a.who); sx('cur'); return; }
      if (!pr.a) return; sx('ok'); const c = opts[B.sel];
      if (c === 'Angriff') { B.pending = { type: 'atk' }; B.ph = 'tgt'; B.tgt = B.foes.indexOf(liveFoes()[0]); }
      else if (c === 'Zauber') { B.list = SPELL[me].filter(s => s.lv <= p.lv).map(s => ({ t: s.n + ' ' + s.mp + ' MP', s, dis: p.mp[me] < s.mp })); B.lsel = 0; B.ph = 'spell'; }
      else if (c === 'Item') { B.list = ['kraut', 'aether'].map(k => ({ t: ITEM[k][0] + ' ×' + (p.it[k] || 0), k, dis: !(p.it[k] > 0) })); B.lsel = 0; B.ph = 'item'; }
      else { if (B.kind === 'boss') { B.msg = 'Vor dem Grauwächter gibt es kein Entkommen!'; sx('no'); return; } if (Math.random() < .75) { B.ph = 'fled'; B.t = 0; B.msg = 'Ihr nehmt die Beine in die Hand!'; } else { B.msg = 'Flucht misslungen!'; B.acts = []; B.q = liveFoes().map(f => ({ foe: f })); B.ph = 'exec'; B.t = 0; } }
      return; }
    if (ph === 'spell' || ph === 'item') { const L = B.list; if (pr.u) { B.lsel = (B.lsel + L.length - 1) % L.length; sx('cur'); } if (pr.d) { B.lsel = (B.lsel + 1) % L.length; sx('cur'); } if (pr.b) { B.ph = 'cmd'; sx('cur'); return; }
      if (!pr.a) return; const it = L[B.lsel]; if (it.dis) { sx('no'); return; } sx('ok');
      if (ph === 'item') { B.pending = { type: 'item', item: it.k }; B.ph = 'ally'; B.asel = B.who; return; }
      B.pending = { type: 'spell', sp2: it.s }; if (it.s.tg === 'foe') { B.ph = 'tgt'; B.tgt = B.foes.indexOf(liveFoes()[0]); } else if (it.s.tg === 'ally') { B.ph = 'ally'; B.asel = 0; } else commit(B.pending); return; }
    if (ph === 'tgt') { const lv = liveFoes(); let i = lv.indexOf(B.foes[B.tgt]); if (i < 0) i = 0; if (pr.l) { i = (i + lv.length - 1) % lv.length; sx('cur'); } if (pr.r) { i = (i + 1) % lv.length; sx('cur'); } B.tgt = B.foes.indexOf(lv[i]);
      if (pr.b) { B.ph = 'cmd'; return; } if (pr.a) { sx('ok'); commit(Object.assign({}, B.pending, { tgt: B.tgt })); } return; }
    if (ph === 'ally') { if (pr.u || pr.d || pr.l || pr.r) { B.asel = 1 - B.asel; sx('cur'); } if (pr.b) { B.ph = 'cmd'; return; } if (pr.a) { sx('ok'); commit(Object.assign({}, B.pending, { ally: ['z', 'l'][B.asel] })); } return; }
    if (ph === 'exec') { if (B.t < .2) return; if (B.t < .95 && B.msg && !pr.a) return; B.t = 0; if (battleEnd()) return;
      let m = null; while (B.q.length && !m) m = perform(B.q.shift()); if (m) { B.msg = m; return; }
      if (battleEnd()) return; B.msg = ''; B.who = firstAlive(0); B.ph = 'cmd'; B.sel = 0; return; }
    if (ph === 'win') { if (B.t > .6 && pr.a) { B.t = 0; if (B.wl.length) B.msg = B.wl.shift(); else { const k = B.kind, ref = B.ref; B = null; if (ref) G.foes = G.foes.filter(e => e !== ref); if (k === 'boss') { p.fl.boss = 1; play('turm'); say([['Grauwächter', 'Die Farben … sie sind … so warm …'], ['', 'Der Grauwächter zerfällt zu feinem Staub. Auf dem Sockel glimmt etwas.']]); } o.save && o.save(); } } return; }
    if (ph === 'fled') { if (B.t > .9) { const ref = B.ref; B = null; if (ref) { ref.x = ref.fx !== undefined ? ref.fx : ref.x; ref.px = ref.x * TS; ref.py = ref.y * TS; G.foes = G.foes.filter(e => Math.abs(e.x - G.pl.x) + Math.abs(e.y - G.pl.y) > 1); } play(G.name === 'dorf' ? (p.fl.stone ? 'hell' : 'dorf') : 'turm'); } return; }
    if (ph === 'lose') { if (B.t > 1 && pr.a) { B = null; p.g = Math.floor(p.g / 2); fade(() => { load('dorf', 4, 19, 1); full(); }, () => say([['Hanno', 'Da seid ihr ja wieder! Man hat euch vor dem Zaun gefunden. Ruht euch aus und versucht es noch einmal.']])); } } }
  function drawBattle() { const p = P(), sh = B.shake > 0 ? (Math.random() * 4 - 2) : 0; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const bg = B.kind === 'boss' ? ['#2a0a3a', '#6a1a5a', '#1a0a20'] : G.M.bg === 'feld' ? ['#6ab0ff', '#cfe8ff', '#4c9a3c'] : ['#141024', '#2e2a4a', '#2a2636'];
    let g = ctx.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, bg[0]); g.addColorStop(1, bg[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 120);
    if (G.M.bg === 'feld' && B.kind !== 'boss') { ctx.fillStyle = '#3a8a4a'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(i * 34 + 10, 112, 26 + (i % 3) * 6, Math.PI, 0); ctx.fill(); } }
    else { ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 8; i++) ctx.fillRect(i * 34 + ((t * 8) % 34), 0, 2, 120); }
    ctx.fillStyle = bg[2]; ctx.fillRect(0, 108, W, 54); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, 112 + i * 8, W, 1);
    for (const [i, f] of B.foes.entries()) { if (f.a <= 0) continue; if (f.fl > 0 && Math.floor(f.fl * 20) % 2) continue; ctx.globalAlpha = f.a;
      const s = f.k === 'boss' ? 96 : 40, y = f.k === 'boss' ? 16 : 70 + Math.sin(t * 3 + i) * 2; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(f.x, y + s - 2, s * .35, 4, 0, 0, 6.283); ctx.fill(); ctx.drawImage(SP[f.k], f.x - s / 2, y, s, s); ctx.globalAlpha = 1; }
    if (B.fx) { const k = B.fx.t / .6; if (B.fx.k === 'heal') { ctx.fillStyle = `rgba(125,255,178,${.5 - k * .5})`; ctx.fillRect(0, 160, W, 64); }
      else if (B.fx.k === 'star') { ctx.fillStyle = '#ffe060'; for (let i = 0; i < 14; i++) { const x = (i * 53) % 240 + 8, y = k * 140 - (i * 31) % 60; ctx.fillRect(x, y, 3, 3); ctx.fillRect(x - 2, y + 1, 7, 1); } }
      else { const x0 = B.fx.x || 128; ctx.fillStyle = `rgba(255,${120 + k * 100 | 0},40,${1 - k})`; ctx.beginPath(); ctx.arc(x0, 90, 8 + k * 30, 0, 6.283); ctx.fill(); } }
    if (B.ph === 'tgt') { const f = B.foes[B.tgt]; if (f) { const y = f.k === 'boss' ? 12 : 64; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(f.x - 5, y - 6 + Math.sin(t * 8) * 2); ctx.lineTo(f.x + 5, y - 6 + Math.sin(t * 8) * 2); ctx.lineTo(f.x, y + Math.sin(t * 8) * 2); ctx.fill(); txt(f.n + f.tag, Math.max(4, f.x - 30), y - 10); } }
    ctx.save(); ctx.translate(sh, 0); win(4, 164, 248, 56); const ps = party();
    ps.forEach((m, i) => { const y = 180 + i * 18, act = (B.ph === 'cmd' || B.ph === 'spell' || B.ph === 'item' || B.ph === 'tgt') && B.who === i, sel = B.ph === 'ally' && B.asel === i;
      if (act || sel) { ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(8, y - 10, 240, 15); } ctx.drawImage(SP[m.id][0], 12, y - 12, 14, 14);
      const col = m.hp <= 0 ? '#ff6a6a' : m.hp < m.mhp / 4 ? '#ffd04a' : '#fff'; txt(m.n, 30, y, col); txt('LP ' + String(m.hp).padStart(3) + '/' + m.mhp, 84, y, col); txt('MP ' + String(m.mp).padStart(2) + '/' + m.mmp, 172, y, '#bcd8ff');
      ctx.fillStyle = '#0a0a20'; ctx.fillRect(84, y + 2, 70, 2); ctx.fillStyle = m.hp < m.mhp / 4 ? '#ff6a4a' : '#7dffb2'; ctx.fillRect(84, y + 2, 70 * m.hp / m.mhp, 2); if (sel) cursor(4, y); });
    ctx.restore();
    if (B.ph === 'cmd') { win(4, 96, 70, 66); ['Angriff', 'Zauber', 'Item', 'Flucht'].forEach((c, i) => { txt(c, 18, 110 + i * 14); if (i === B.sel) cursor(9, 110 + i * 14); }); }
    if (B.ph === 'spell' || B.ph === 'item') { const L = B.list, h = L.length * 14 + 10; win(4, 162 - h, 130, h); L.forEach((c, i) => { txt(c.t, 18, 162 - h + 14 + i * 14, c.dis ? '#8890b0' : '#fff'); if (i === B.lsel) cursor(9, 162 - h + 14 + i * 14); }); }
    if (B.msg) { win(4, 4, 248, 22); txt(B.msg.length > 46 ? B.msg.slice(0, 46) : B.msg, 10, 18); if (B.msg.length > 46) { win(4, 24, 248, 16); txt(B.msg.slice(46, 92), 10, 35); } }
    for (const q of B.pops) { ctx.font = 'bold 10px monospace'; ctx.fillStyle = '#000'; ctx.fillText(q.s, q.x - 8 + 1, q.y - q.t * 18 + 1); ctx.fillStyle = q.col; ctx.fillText(q.s, q.x - 8, q.y - q.t * 18); }
    if (G.swirl > 0) { const k = G.swirl / .6; ctx.fillStyle = '#000'; for (let i = 0; i < 16; i++) ctx.fillRect(0, i * 14, W * k, 7), ctx.fillRect(W - W * k, i * 14 + 7, W * k, 7); } }

  /* ---- Karte zeichnen ---- */
  function drawMap() { const p = P(), mw = G.w * TS, mh = G.h * TS, pl = G.pl;
    const cx = mw <= W ? (mw - W) / 2 : Math.max(0, Math.min(mw - W, pl.px + 8 - W / 2)), cy = mh <= H ? (mh - H) / 2 : Math.max(0, Math.min(mh - H, pl.py + 8 - H / 2));
    ctx.fillStyle = G.M.base === '_' ? '#0a0810' : '#1a3a1e'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.translate(-Math.round(cx), -Math.round(cy));
    const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS)), f = p.fl;
    for (let y = y0; y <= Math.min(G.h - 1, y0 + 14); y++) for (let x = x0; x <= Math.min(G.w - 1, x0 + 16); x++) { const c = G.rows[y][x], X = x * TS, Y = y * TS;
      if ('oGCTKXQ'.includes(c)) { const b = tileImg(G.M.base, x, y); if (b) ctx.drawImage(b, X, Y); } else { const im = tileImg(c, x, y); if (im) ctx.drawImage(im, X, Y); }
      const R = (col, a, b, w, h) => { ctx.fillStyle = col; ctx.fillRect(X + a, Y + b, w, h); };
      /* Übergänge: Grasrand am Weg, Schaum am Ufer, Schatten unter Häusern und Mauern */
      const nb = (dx, dy) => (G.rows[y + dy] || [])[x + dx] || '#', GR = '.,#Fws';
      if (c === '=') { const sides = [[0, -1], [0, 1], [-1, 0], [1, 0]]; sides.forEach(([dx, dy], k) => { if (!GR.includes(nb(dx, dy))) return; for (let i = 0; i < 16; i++) { const h = hash(x * 31 + i, y * 17 + k) % 3; const a2 = k < 2 ? i : (k === 2 ? 0 : 16 - h - 1), b2 = k < 2 ? (k === 0 ? 0 : 16 - h - 1) : i; const w = k < 2 ? 1 : h + 1, hh = k < 2 ? h + 1 : 1; R('#5cbc4a', a2, b2, w, hh); } R('#c8a46a', k === 3 ? 13 : k === 2 ? 2 : 0, k === 1 ? 13 : k === 0 ? 2 : 0, k < 2 ? 16 : 1, k < 2 ? 1 : 16); }); }
      if (c === '~') { const fo = Math.floor(t * 3) % 2; if (nb(0, -1) !== '~') { R('#e8f6ff', 0, 0, 16, 2); R('#9ad4ff', 0, 2, 16, 1); for (let i = fo; i < 16; i += 3) R('#ffffff', i, 2, 1, 1); } if (nb(0, 1) !== '~') R('#2a62b8', 0, 14, 16, 2);
        if (nb(-1, 0) !== '~') { R('#e8f6ff', 0, 0, 2, 16); R('#9ad4ff', 2, 0, 1, 16); } if (nb(1, 0) !== '~') { R('#e8f6ff', 14, 0, 2, 16); R('#9ad4ff', 13, 0, 1, 16); } }
      if ('.,=_oCsQ'.includes(c) && 'HDPWE'.includes(nb(0, -1))) R('rgba(20,10,40,.22)', 0, 0, 16, 4);
      if (c === 'R' && 'HD'.includes(nb(0, 1))) { R('#6a2014', 0, 14, 16, 2); R('rgba(0,0,0,.25)', 0, 13, 16, 1); }
      if (c === 'o') { const dn = G.blocks.some(q => q.x === x && q.y === y); R('#5a566e', 2, 2, 12, 12); R(dn ? '#5ad08a' : '#8a8a9a', 3, 3, 10, 10); R(dn ? '#bfffd0' : '#a8a8b8', 3, 3, 10, 1); }
      if (c === 'G' && !walk(x, y, 1)) { R('#1a1622', 0, 14, 16, 2); for (let i = 0; i < 4; i++) { R('#9a9ab0', 1 + i * 4, 0, 2, 15); R('#d0d0e0', 1 + i * 4, 0, 1, 15); } R('#7a7a90', 0, 3, 16, 2); }
      if (c === 'C') { const op = f['c_' + G.name + '_' + x + '_' + y]; R('#1a1008', 2, 5, 12, 10); R('#8a5a24', 3, 6, 10, 8); R('#ffd04a', 3, 9, 10, 1); if (op) { R('#2a1a08', 3, 4, 10, 3); R('#a86a2a', 3, 2, 10, 2); } else { R('#a86a2a', 3, 5, 10, 3); R('#ffd04a', 7, 8, 2, 3); } }
      if (c === 'T') { const i = TORCH.findIndex(([a, b]) => a === x && b === y), lit = f.t2 || i < (f.tq || 0); R('#3a3648', 6, 9, 4, 6); R('#6a6a7a', 3, 6, 10, 4); R('#4a4a5a', 4, 9, 8, 1);
        if (lit) { const k = Math.floor(t * 8 + i) % 2; R('#ff6a1a', 4, 1 + k, 8, 5 - k); R('#ffd04a', 6, 2 + k, 4, 4 - k); R('#fff8c0', 7, 4, 2, 2); } }
      if (c === 'K' && !f.door) { R('#4a4660', 0, 0, 16, 16); R('#5a3418', 2, 1, 12, 15); R('#7a4a24', 3, 2, 10, 14); R('#ffd04a', 7, 8, 2, 3); R('#1a1008', 7.5, 9, 1, 3); }
      if (c === 'X') { R('#1a1622', 3, 13, 10, 3); R('#8a86a0', 4, 8, 8, 6); R('#aaa6c0', 3, 7, 10, 2); if (f.boss && !f.stone) { const h = (t * 120) % 360; ctx.fillStyle = `hsl(${h},90%,60%)`; ctx.fillRect(X + 5, Y + 1, 6, 6); ctx.fillStyle = '#fff'; ctx.fillRect(X + 6, Y + 2, 2, 2); } }
      if (c === 'Q') { for (let r = 0; r < 4; r++) { ctx.fillStyle = `hsl(${(t * 140 + r * 60) % 360},85%,${55 + r * 6}%)`; ctx.fillRect(X + r * 2, Y + r * 2, 16 - r * 4, 16 - r * 4); } ctx.fillStyle = '#fff'; ctx.fillRect(X + 7, Y + 7, 2, 2); } }
    const ents = []; for (const b of G.blocks) ents.push({ y: b.py, fn: () => { const X = b.px, Y = b.py; ctx.fillStyle = '#1a1622'; ctx.fillRect(X + 1, Y + 13, 14, 3); ctx.fillStyle = '#7a7690'; ctx.fillRect(X + 1, Y + 1, 14, 13); ctx.fillStyle = '#a8a4c0'; ctx.fillRect(X + 1, Y + 1, 14, 3); ctx.fillStyle = '#5a566e'; ctx.fillRect(X + 3, Y + 6, 10, 1); ctx.fillRect(X + 7, Y + 6, 1, 6); } });
    const shadow = (x, y) => { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 15, 6, 2, 0, 0, 6.283); ctx.fill(); };
    for (const e of G.foes) ents.push({ y: e.py, fn: () => { shadow(e.px, e.py); ctx.drawImage(SP[e.k], e.px, e.py - 2 + Math.round(Math.sin(t * 6 + e.x) * 1)); } });
    for (const n of NPC()) ents.push({ y: n.y * TS, fn: () => { if (n.big) { ctx.drawImage(SP.boss, n.x * TS - 8, n.y * TS - 16 + Math.sin(t * 2) * 2, 32, 32); return; } shadow(n.x * TS, n.y * TS); ctx.drawImage(SP[n.s][n.d || 0], n.x * TS, n.y * TS - 2); } });
    const bob = G.mv && G.mv.k > .25 && G.mv.k < .75 ? -1 : 0;
    ents.push({ y: G.ly.py - .1, fn: () => { shadow(G.ly.px, G.ly.py); ctx.drawImage(SP.l[G.ly.d], G.ly.px, G.ly.py - 2 + bob); } });
    ents.push({ y: pl.py, fn: () => { shadow(pl.px, pl.py); ctx.drawImage(SP.z[p.d], pl.px, pl.py - 2 + bob); } });
    ents.sort((a, b) => a.y - b.y).forEach(e => e.fn()); ctx.restore();
    if (G.title && G.title.t > 0) { const a = Math.min(1, G.title.t); ctx.globalAlpha = a; const w = ctx.measureText(G.title.s).width + 24; win(W / 2 - w / 2, 10, w, 20); txt(G.title.s, W / 2 - w / 2 + 12, 23, '#ffe060'); ctx.globalAlpha = 1; } }

  /* ---- Hauptschleife ---- */
  function update(dt) { if (G.fade) { const F = G.fade; F.t += dt; if (F.t >= .35 && !F.did) { F.did = 1; F.mid && F.mid(); } if (F.t >= .7) { G.fade = null; F.after && F.after(); } return; }
    if (G.swirl > 0) { G.swirl = Math.max(0, G.swirl - dt); if (B) return; }
    if (G.dlg) { const D = G.dlg, pg = D.pages[D.i], len = pg ? pg.L.join('').length : 0; D.c = Math.min(len, D.c + dt * 55);
      const choosing = D.ch && D.i === D.pages.length - 1 && D.c >= len; if (choosing) { if (pr.u || pr.d) { D.sel = (D.sel + 1) % D.ch.length; sx('cur'); } }
      if (pr.a || (pr.b && !choosing)) { if (D.c < len) { D.c = len; return; } if (D.i < D.pages.length - 1) { D.i++; D.c = 0; sx('cur'); return; } G.dlg = null; sx('cur'); if (choosing) D.ch[D.sel].fn(); else if (D.cb) D.cb(); } return; }
    if (G.menu) { const m = G.menu; if (pr.u) { m.sel = (m.sel + m.items.length - 1) % m.items.length; sx('cur'); } if (pr.d) { m.sel = (m.sel + 1) % m.items.length; sx('cur'); } if (pr.b) { G.menu = null; sx('cur'); return; } if (pr.a) { const it = m.items[m.sel]; G.menu = null; if (it.dis) { sx('no'); G.menu = m; return; } sx('ok'); it.fn(); } return; }
    if (B) return battleUpd(dt);
    if (G.title) G.title.t -= dt;
    if (G.mv) { const M = G.mv, sp = 5.2; M.k = Math.min(1, M.k + dt * sp); const e = M.k, pl = G.pl, ly = G.ly;
      pl.px = (M.fx + (pl.x - M.fx) * e) * TS; pl.py = (M.fy + (pl.y - M.fy) * e) * TS; ly.px = (M.lx + (ly.x - M.lx) * e) * TS; ly.py = (M.ly + (ly.y - M.ly) * e) * TS;
      if (M.bl) { M.bl.px = M.bfx + (M.bl.x * TS - M.bfx) * e; M.bl.py = M.bfy + (M.bl.y * TS - M.bfy) * e; }
      for (const f of G.foes) { const fx = f.fx !== undefined ? f.fx : f.x, fy = f.fy !== undefined ? f.fy : f.y; f.px = (fx + (f.x - fx) * e) * TS; f.py = (fy + (f.y - fy) * e) * TS; }
      if (M.k >= 1) { G.mv = null; for (const f of G.foes) { f.fx = f.x; f.fy = f.y; } stepDone(); } else return; }
    if (G.dlg || G.fade || B) return;
    if (pr.a) return act();
    if (pr.b) return mapMenu();
    const d = held.d ? 0 : held.u ? 1 : held.l ? 2 : held.r ? 3 : -1; if (d >= 0) tryMove(d); }
  function mapMenu() { const p = P(); menu('Zotik · Stufe ' + p.lv + ' · ' + p.g + ' 💰', [
    { t: 'Status', fn: () => { const ps = party(); say([['Status', ps.map(m => m.n + ': LP ' + m.hp + '/' + m.mhp + ', MP ' + m.mp + '/' + m.mmp).join(' · ') + ' · Erfahrung ' + p.xp + '/' + need(p.lv)]]); } },
    { t: 'Heilkraut (' + (p.it.kraut || 0) + ')', dis: !(p.it.kraut > 0), fn: () => { const id = ['z', 'l'].sort((a, b) => P().hp[a] / stat(a, p.lv).mhp - P().hp[b] / stat(b, p.lv).mhp)[0], s = stat(id, p.lv); p.it.kraut--; p.hp[id] = Math.min(s.mhp, Math.max(1, p.hp[id]) + 40); sx('heal'); say([['', s.n + ' fühlt sich besser.']]); } },
    { t: 'Äther (' + (p.it.aether || 0) + ')', dis: !(p.it.aether > 0), fn: () => { const id = ['z', 'l'].sort((a, b) => P().mp[a] / stat(a, p.lv).mmp - P().mp[b] / stat(b, p.lv).mmp)[0], s = stat(id, p.lv); p.it.aether--; p.mp[id] = Math.min(s.mmp, p.mp[id] + 15); sx('heal'); say([['', s.n + ' schöpft neue Kraft.']]); } },
    { t: 'Schätze', fn: () => { const k = ['stab', 'key'].filter(q => p.it[q]); say([['', k.length ? k.map(q => ITEM[q][0] + ': ' + ITEM[q][1]).join(' · ') : 'Noch keine besonderen Schätze.']]); } },
    { t: 'Pforte verlassen', fn: () => say([['', 'Zurück in die Würfelwelt? Dein Fortschritt hier bleibt erhalten.']], null, [{ t: 'Zurückkehren', fn: exit }, { t: 'Weiterspielen', fn: () => {} }]) }], 150); }
  function render() { ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.imageSmoothingEnabled = false; if (B) drawBattle(); else drawMap(); if (G.menu) drawMenu(); if (G.dlg) drawDlg();
    if (G.fade) { const F = G.fade, a = F.t < .35 ? F.t / .35 : 1 - (F.t - .35) / .35; ctx.fillStyle = `rgba(0,0,0,${Math.max(0, Math.min(1, a))})`; ctx.fillRect(0, 0, W, H); }
    const want = G.name === 'dorf' && !P().fl.stone && !B ? .42 : 1; if (G.name === 'dorf' && P().fl.stone && G.restore !== undefined && G.restore < 1) { G.restore = Math.min(1, G.restore + 1 / 150); sat = .42 + G.restore * .58; } else sat += (want - sat) * .2; cv.style.filter = sat > .985 ? '' : `saturate(${sat.toFixed(2)})`; }
  function frame(rdt) { if (!on) return; const dt = Math.min(.05, Math.max(0, rdt)); t += dt; readInput(dt); try { update(dt); } catch (e) { console.error('[Pixelpforte]', e); } musTick(); render(); }

  /* ---- Aufbau, Start, Ende ---- */
  function build() { if (root) return; root = document.createElement('div'); root.id = 'pix'; root.hidden = true;
    root.innerHTML = `<style>#pix{position:fixed;inset:0;z-index:40;background:#000;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none}#pix[hidden]{display:none}
      #pix canvas{width:min(100vw,calc(100vh*256/224));height:auto;aspect-ratio:256/224;image-rendering:pixelated;image-rendering:crisp-edges;box-shadow:0 0 60px rgba(120,80,255,.25)}
      #pix .pad{position:absolute;bottom:calc(env(safe-area-inset-bottom) + 18px);display:none;gap:6px}body.touch #pix .pad{display:grid}
      #pix .dp{left:16px;grid-template:repeat(3,52px)/repeat(3,52px)}#pix .ab{right:16px;grid-template:52px 52px/62px 62px}
      #pix .pad button{border:2px solid rgba(255,255,255,.55);background:rgba(30,30,60,.5);color:#fff;font:800 18px system-ui;border-radius:12px;padding:0;-webkit-tap-highlight-color:transparent}
      #pix .pad button.on{background:rgba(255,255,255,.35)}#pix .ab button{border-radius:50%}#pix .hint{position:absolute;bottom:6px;transition:opacity 1s;left:50%;transform:translateX(-50%);color:#9aa;font:12px system-ui;opacity:.75;pointer-events:none;text-align:center}
      body.touch #pix .hint{display:none}@media (orientation:portrait){#pix{align-items:flex-start;padding-top:calc(env(safe-area-inset-top) + 8px)}}</style>
      <canvas width="512" height="448"></canvas><div class="hint">Pfeile/WASD laufen · Enter/E bestätigen · Esc/X zurück & Menü</div>
      <div class="pad dp"><i></i><button data-k="u">▲</button><i></i><button data-k="l">◀</button><i></i><button data-k="r">▶</button><i></i><button data-k="d">▼</button><i></i></div>
      <div class="pad ab"><i></i><button data-k="a" style="grid-row:1;grid-column:2;background:rgba(200,60,80,.6)">A</button><button data-k="b" style="grid-row:2;grid-column:1;background:rgba(60,80,200,.6)">B</button></div>`;
    document.body.appendChild(root); cv = root.querySelector('canvas'); ctx = cv.getContext('2d');
    for (const b of root.querySelectorAll('.pad button')) { const k = b.dataset.k, dn = e => { e.preventDefault(); held[k] = 1; b.classList.add('on'); }, up = e => { e.preventDefault(); held[k] = 0; b.classList.remove('on'); };
      b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up); }
    addEventListener('keydown', onKey, true); addEventListener('keyup', onKey, true); }
  function start() { build(); initGfx(); const p = P(); on = true; root.hidden = false; const hn = root.querySelector('.hint'); hn.style.opacity = .75; setTimeout(() => { hn.style.opacity = 0; }, 9000); t = 0; B = null; G = null; for (const k in held) held[k] = 0;
    load(p.map, p.x, p.y, p.d); if (!p.fl.intro) { p.fl.intro = 1; G.fade = { t: .35, did: 1, after: null };
      setTimeout(() => say([['Zotik', 'Huch … Lyra, wir sind ganz flach! Und alles um uns ist grau.'], ['Lyra', 'Wie in einem alten Spiel. Sieh mal, da vorn ist ein Dorf.'], ['Zotik', 'Lass uns jemanden fragen, was hier passiert ist.']]), 400); } }
  function exit() { const done = !!P().fl.done; on = false; mus = null; if (root) root.hidden = true; for (const k in held) held[k] = 0; o.save && o.save(); o.onExit && o.onExit(done); }
  function preview() { initGfx(); const c = document.createElement('canvas'); c.width = 256; c.height = 224; const x = c.getContext('2d'), M = MAPS.dorf, keep = G; G = { M, rows: M.rows.map(r => [...r]) };
    for (let j = 0; j < 14; j++) for (let i = 0; i < 16; i++) { const ch = G.rows[j + 14][i + 4], im = tileImg('oGCTKXQ'.includes(ch) ? '.' : ch, i + 4, j + 14); if (im) x.drawImage(im, i * 16, j * 16); }
    x.drawImage(SP.z[0], 7 * 16, 9 * 16); x.drawImage(SP.l[0], 7 * 16, 8 * 16); x.drawImage(SP.merle[0], 7 * 16, 11 * 16); G = keep; return c; }
  return { tryMove: d => tryMove(d), walk: (x, y) => walk(x, y), start, frame, exit, preview, load: (...a) => load(...a), battle: (...a) => battle(...a), say: (...a) => say(...a), get on() { return on; }, get G() { return G; }, get B() { return B; }, input: held, MAPS, stat, P };
}
