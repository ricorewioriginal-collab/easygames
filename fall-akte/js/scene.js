/* FALL·AKTE – Zeichnungen im Noir-Comic-Stil (SVG): Schauplätze aus Bausteinen (Wände, Boden, ~55 Gegenstände) mit Rasterpunkten
 * und Tusche-Konturen, Porträts der Verdächtigen (Haarfarbe und Brille sichtbar – das sind Hinweise!), Spuren-Bilder für die Labor-Rätsel.
 * Schwarz-Weiß mit einer Akzentfarbe je Welt. Alles als SVG-Text, kein WebGL nötig. */
(function () {
  'use strict';
  const INK = '#101014', PAPER = '#ece6d8', G1 = '#c9c3b5', G2 = '#8e897e', G3 = '#4d4a44', G4 = '#2a2826';
  const sw = 'stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
  const R = (x, y, w, h, f, ex) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${sw} ${ex || ''}/>`;
  const C = (x, y, r, f, ex) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${sw} ${ex || ''}/>`;
  const E = (x, y, rx, ry, f, ex) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${sw} ${ex || ''}/>`;
  const P = (d, f, ex) => `<path d="${d}" fill="${f || 'none'}" ${sw} ${ex || ''}/>`;
  const L = (x1, y1, x2, y2, w) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="${w || 3}" stroke-linecap="round"/>`;
  const HT = 'url(#ht)', HT2 = 'url(#ht2)', HATCH = 'url(#hatch)';

  function defs(acc) {
    return `<defs>
<pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${G1}"/><circle cx="5" cy="5" r="2.2" fill="${G2}"/></pattern>
<pattern id="ht2" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${G3}"/><circle cx="4" cy="4" r="2.4" fill="${G4}"/></pattern>
<pattern id="hta" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${acc}"/><circle cx="4.5" cy="4.5" r="2" fill="${INK}" opacity=".35"/></pattern>
<pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="${G2}"/><line x1="0" y1="0" x2="0" y2="12" stroke="${G3}" stroke-width="4"/></pattern>
<radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>`;
  }
  /* ---------- Wände ---------- */
  function wall(t, acc) {
    let s = R(-10, -10, 1020, 540, PAPER, 'stroke-width="0"');
    if (t === 'wallpaper') { for (let x = 0; x < 1000; x += 50) s += `<rect x="${x}" y="0" width="22" height="520" fill="${G1}"/>`; s += R(-10, 380, 1020, 140, HT, ''); }
    else if (t === 'panel') { s += R(-10, -10, 1020, 540, HT2, 'stroke-width="0"'); for (let x = 20; x < 1000; x += 160) s += R(x, 40, 130, 300, G3, 'stroke-width="3"') + R(x, 370, 130, 130, G3, 'stroke-width="3"'); }
    else if (t === 'glass') { s += R(-10, -10, 1020, 540, '#dcd6c6', 'stroke-width="0"'); for (let x = 0; x <= 1000; x += 125) s += L(x, 0, x, 520, 5); for (let y = 0; y <= 520; y += 130) s += L(0, y, 1000, y, 5); s += P('M0 300 Q120 200 240 300 T480 300 T720 290 T1000 300 V520 H0Z', HT); }
    else if (t === 'fog') { s += `<rect x="-10" y="-10" width="1020" height="300" fill="${G1}"/>` + P('M0 330 L1000 330 L1000 520 L0 520Z', HT2) + E(780, 120, 60, 60, PAPER, 'stroke-width="3"') + P('M80 330 L120 200 L180 200 L200 330', G3) + L(150, 200, 150, 90, 4) + L(150, 110, 230, 150, 3); for (let y = 345; y < 520; y += 28) s += L(0, y, 1000, y, 2).replace(INK, G2); s = s; }
    else if (t === 'brick') { s += R(-10, -10, 1020, 540, G2, 'stroke-width="0"'); for (let y = 0, r = 0; y < 520; y += 34, r++) for (let x = (r % 2) * -50; x < 1000; x += 100) s += `<rect x="${x + 3}" y="${y + 3}" width="94" height="28" fill="${r % 3 ? G3 : G2}" stroke="${INK}" stroke-width="2"/>`; }
    else if (t === 'foam') { s += R(-10, -10, 1020, 540, G3, 'stroke-width="0"'); for (let y = 0; y < 520; y += 60) for (let x = 0; x < 1000; x += 60) s += P(`M${x} ${y + 60} L${x + 30} ${y} L${x + 60} ${y + 60}Z`, (x + y) % 120 ? G4 : G3, 'stroke-width="2"'); }
    else if (t === 'tiles') { s += R(-10, -10, 1020, 540, '#e3ddcf', 'stroke-width="0"'); for (let x = 0; x <= 1000; x += 50) s += `<line x1="${x}" y1="0" x2="${x}" y2="520" stroke="${G2}" stroke-width="2"/>`; for (let y = 0; y <= 520; y += 50) s += `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="${G2}" stroke-width="2"/>`; s += R(-10, 330, 1020, 14, acc, 'stroke-width="3"'); }
    else if (t === 'tent') { s += R(-10, -10, 1020, 540, G1, 'stroke-width="0"'); for (let k = -6; k <= 6; k += 2) s += P(`M500 -40 L${500 + k * 110} 520 L${500 + (k + 1) * 110} 520Z`, 'url(#hta)', 'stroke-width="3"'); s += `<rect x="0" y="0" width="1000" height="520" fill="url(#beam)"/>`; }
    else if (t === 'wood') { s += R(-10, -10, 1020, 540, G2, 'stroke-width="0"'); for (let x = 0; x < 1000; x += 70) s += `<rect x="${x}" y="0" width="70" height="520" fill="${(x / 70) % 2 ? G2 : '#9c968a'}" stroke="${INK}" stroke-width="2"/>` + C(x + 35, 40, 3, INK) + C(x + 35, 470, 3, INK); }
    else if (t === 'gallery') { s += R(-10, -10, 1020, 540, '#e8e2d2', 'stroke-width="0"') + R(-10, 400, 1020, 120, HT, '') + L(0, 60, 1000, 60, 5) + L(0, 400, 1000, 400, 5); }
    return s;
  }
  function floor(acc) {
    let s = R(-10, 520, 1020, 100, HT2, '');
    for (let k = -8; k <= 8; k++) s += `<line x1="${500 + k * 60}" y1="520" x2="${500 + k * 180}" y2="610" stroke="${INK}" stroke-width="2" opacity=".5"/>`;
    return s + L(-10, 520, 1010, 520, 5);
  }
  /* ---------- Gegenstände: Zeichnung (Ursprung = Mitte unten) und Klickfläche [Breite, Höhe, Anker] ---------- */
  const OB = {
    vitrine: [140, 230, () => R(-60, -60, 120, 60, G3) + R(-50, -220, 100, 160, '#d7e3e6', 'opacity=".9"') + L(-50, -170, 50, -170) + P('M-20 -100 L0 -120 L20 -100 L0 -80Z', 'none', 'stroke-dasharray="6 6"')],
    sofa: [260, 130, () => R(-120, -90, 240, 60, 'url(#hta)') + R(-130, -50, 260, 40, G3) + R(-140, -80, 30, 70, G4) + R(110, -80, 30, 70, G4) + L(-110, -10, -110, 0) + L(110, -10, 110, 0)],
    fireplace: [220, 240, () => R(-110, -230, 220, 30, G3) + R(-90, -200, 180, 200, HT) + R(-60, -140, 120, 140, INK) + P('M-30 0 Q-20 -60 0 -80 Q15 -50 30 0Z', 'url(#hta)')],
    painting: [180, 150, x => R(-80, -60, 160, 120, G3, 'stroke-width="8"') + [P('M-70 50 L-20 -10 L10 20 L40 -20 L70 50Z', HT2) + C(40, -30, 12, PAPER), E(0, 10, 30, 40, G1) + C(0, -25, 18, G1) + P('M-25 -35 Q0 -60 25 -35', HT2), R(-40, 0, 30, 45, G1) + C(20, 20, 22, 'url(#hta)') + E(-5, -20, 22, 14, PAPER)][Math.round(x / 300) % 3], 'c'],
    wallclock: [90, 90, () => C(0, 0, 38, PAPER, 'stroke-width="6"') + L(0, 0, 0, -26) + L(0, 0, 18, 6) + C(0, 0, 4, INK), 'c'],
    clock: [80, 260, () => R(-35, -250, 70, 250, G3) + C(0, -200, 26, PAPER) + L(0, -200, 0, -218) + L(0, -200, 12, -196) + R(-12, -150, 24, 110, HT2) + C(0, -70, 10, 'url(#hta)')],
    rug: [300, 50, () => E(0, -14, 150, 22, 'url(#hta)') + E(0, -14, 110, 14, 'none', 'stroke-dasharray="10 8"')],
    plant: [110, 200, () => R(-30, -50, 60, 50, G3) + P('M0 -50 Q-60 -110 -70 -180 M0 -50 Q-10 -150 0 -200 M0 -50 Q40 -120 70 -170 M0 -50 Q-40 -90 -80 -100 M0 -50 Q50 -80 80 -90', 'none', 'stroke-width="10" stroke="' + G4 + '"')],
    table: [180, 110, () => R(-90, -100, 180, 20, G3) + L(-75, -80, -75, 0, 6) + L(75, -80, 75, 0, 6) + P('M-40 -100 L-30 -130 L-10 -130 L-5 -100', PAPER) + C(40, -110, 10, PAPER)],
    shelf: [190, 320, () => { let s = R(-90, -310, 180, 310, G3); for (let y = -300; y < -10; y += 60) { s += L(-90, y + 55, 90, y + 55); for (let x = -82; x < 80; x += 14) s += `<rect x="${x}" y="${y + 10 + (x * 7) % 9}" width="11" height="${45 - (x * 7) % 9}" fill="${(x / 14 | 0) % 3 ? G1 : G2}" stroke="${INK}" stroke-width="2"/>`; } return s; }],
    desk: [220, 130, () => R(-110, -110, 220, 22, G3) + R(-100, -88, 70, 88, HT2) + R(40, -88, 60, 88, HT2) + R(-50, -140, 60, 30, PAPER) + L(-40, -130, 0, -130, 2) + L(-40, -120, -5, -120, 2)],
    lamp: [80, 210, () => L(0, 0, 0, -160, 6) + E(0, -4, 30, 8, G3) + P('M-35 -150 L-20 -200 L20 -200 L35 -150Z', 'url(#hta)') + `<path d="M-35 -150 L-90 0 L90 0 L35 -150Z" fill="url(#beam)" opacity=".6"/>`],
    globe: [90, 150, () => L(0, 0, 0, -40, 6) + E(0, -2, 30, 8, G3) + C(0, -90, 45, HT) + P('M-45 -90 Q0 -70 45 -90 M0 -135 Q-25 -90 0 -45', 'none', 'stroke-width="2"')],
    bin: [70, 80, () => P('M-30 -70 L30 -70 L22 0 L-22 0Z', G3) + L(-14, -60, -10, -8, 2) + L(0, -60, 0, -8, 2) + L(14, -60, 10, -8, 2) + P('M-18 -70 Q-10 -90 5 -72', PAPER)],
    window: [200, 200, () => R(-90, -90, 180, 180, '#cfd6d6') + L(0, -90, 0, 90, 6) + L(-90, 0, 90, 0, 6) + P('M-90 -90 L90 90', 'none', 'stroke="#fff" stroke-width="2" opacity=".6"') + C(50, -50, 16, PAPER, 'stroke-width="2"'), 'c'],
    chair: [110, 160, () => R(-40, -150, 80, 80, 'url(#hta)') + R(-45, -75, 90, 25, G3) + L(-35, -50, -35, 0, 6) + L(35, -50, 35, 0, 6)],
    bench: [220, 90, () => R(-100, -60, 200, 18, G3) + R(-100, -90, 200, 14, G2) + L(-85, -42, -85, 0, 6) + L(85, -42, 85, 0, 6)],
    fountain: [180, 170, () => E(0, -30, 85, 28, HT) + R(-12, -120, 24, 80, G3) + E(0, -125, 45, 14, G2) + P('M0 -135 Q-30 -170 -40 -120 M0 -135 Q30 -170 40 -120', 'none', 'stroke="#9fc4cc" stroke-width="4"')],
    pot: [90, 90, () => P('M-40 -80 L40 -80 L30 0 L-30 0Z', 'url(#hta)') + L(-44, -80, 44, -80, 6) + P('M-30 -80 Q-20 -110 0 -100 Q20 -110 30 -80', HT2)],
    crate: [150, 130, () => R(-70, -120, 140, 120, '#a1977f') + L(-70, -60, 70, -60) + L(-70, -120, 70, 0, 4) + R(-55, -230, 110, 110, '#b8ae95') + L(-55, -230, 55, -120, 4)],
    door: [140, 260, () => R(-65, -130, 130, 260, G3, 'stroke-width="6"') + R(-48, -110, 96, 90, G2) + R(-48, 0, 96, 110, G2) + C(42, 10, 7, 'url(#hta)'), 'c'],
    bollard: [80, 110, () => R(-28, -60, 56, 60, G3) + E(0, -62, 34, 14, G4) + E(0, -95, 22, 30, G3)],
    barrel: [110, 140, () => R(-48, -130, 96, 130, '#8a7d65', 'rx="18"') + L(-48, -100, 48, -100, 5) + L(-48, -30, 48, -30, 5) + E(0, -130, 48, 10, G2)],
    lifebuoy: [130, 130, () => C(0, 0, 55, 'url(#hta)', 'stroke-width="5"') + C(0, 0, 28, PAPER) + P('M-55 0 L-28 0 M55 0 L28 0 M0 -55 L0 -28 M0 55 L0 28', 'none', 'stroke="' + PAPER + '" stroke-width="12"') + C(0, 0, 55, 'none') + C(0, 0, 28, 'none'), 'c'],
    lamp_post: [80, 330, () => L(0, 0, 0, -280, 10) + R(-30, -330, 60, 50, 'url(#hta)') + `<path d="M-30 -280 L-120 0 L120 0 L30 -280Z" fill="url(#beam)"/>`],
    rope: [160, 60, () => E(0, -20, 70, 20, '#b39b6b') + E(0, -22, 45, 12, 'none') + E(0, -24, 20, 6, 'none')],
    wheel: [220, 220, () => C(0, 0, 90, 'none', 'stroke-width="12" stroke="#7a5a35"') + C(0, 0, 18, G3) + [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4; return L(Math.cos(a) * 18, Math.sin(a) * 18, Math.cos(a) * 112, Math.sin(a) * 112, 8); }).join(''), 'c'],
    porthole: [150, 150, () => C(0, 0, 66, G3, 'stroke-width="6"') + C(0, 0, 48, '#cfd6d6') + P('M-30 10 Q0 -10 30 10', 'none', 'stroke="' + G2 + '"') + [0, 1, 2, 3, 4, 5].map(k => C(Math.cos(k) * 57, Math.sin(k) * 57, 4, INK)).join(''), 'c'],
    chest: [170, 110, () => R(-75, -90, 150, 90, '#8a6e48') + P('M-75 -90 Q0 -130 75 -90', '#a0845a') + R(-12, -80, 24, 28, 'url(#hta)')],
    bed: [240, 120, () => R(-115, -70, 230, 40, PAPER) + R(-120, -30, 240, 30, G3) + R(-115, -110, 20, 110, G3) + R(-90, -90, 60, 25, G1)],
    coat: [100, 230, () => L(0, 0, 0, -220, 6) + L(-30, 0, 30, 0, 6) + P('M0 -200 L-40 -170 L-46 -60 L-10 -50 L0 -190 L10 -50 L46 -60 L40 -170Z', HT2) + E(0, -215, 28, 8, G4)],
    console: [300, 130, () => P('M-140 -40 L-120 -110 L120 -110 L140 -40Z', G3) + R(-140, -40, 280, 40, G4) + [...Array(9)].map((_, k) => R(-110 + k * 26, -100, 8, 45, G1, 'stroke-width="2"') + R(-112 + k * 26, -90 + (k * 13) % 30, 12, 8, k === 4 ? 'url(#hta)' : PAPER, 'stroke-width="2"')).join('')],
    mic: [80, 230, () => L(0, 0, 0, -160, 5) + E(0, -2, 34, 8, G3) + L(0, -160, 30, -190, 4) + R(18, -240, 28, 55, G4, 'rx="12"') + P('M22 -230 L42 -230 M22 -215 L42 -215 M22 -200 L42 -200', 'none', 'stroke="' + G2 + '" stroke-width="2"')],
    onair: [200, 70, () => R(-95, -32, 190, 64, 'url(#hta)', 'rx="10"') + `<text x="0" y="12" font-size="34" font-weight="900" text-anchor="middle" fill="${INK}" font-family="Arial Black,Arial">ON AIR</text>`, 'c'],
    speaker: [110, 200, () => R(-50, -190, 100, 190, G4) + C(0, -135, 28, G3) + C(0, -135, 10, INK) + C(0, -55, 38, G3) + C(0, -55, 14, INK)],
    cable: [220, 40, () => P('M-100 -10 Q-60 -40 -20 -10 T60 -10 T110 -20', 'none', 'stroke-width="6"') + P('M-90 -20 Q-40 0 0 -25 T100 -5', 'none', 'stroke-width="5" stroke="' + G3 + '"')],
    turntable: [180, 140, () => R(-80, -130, 160, 60, G3) + R(-70, -70, 140, 70, HT2) + E(-15, -132, 50, 12, INK) + E(-15, -132, 12, 3, 'url(#hta)', 'stroke-width="1"') + L(50, -140, 20, -132, 4)],
    poster: [140, 190, () => R(-60, -85, 120, 170, PAPER) + R(-45, -70, 90, 70, 'url(#hta)') + L(-40, 20, 40, 20, 4) + L(-40, 40, 25, 40, 4) + L(-40, 60, 35, 60, 4), 'c'],
    coffee: [90, 130, () => R(-40, -120, 80, 120, G3) + R(-25, -100, 50, 30, INK) + R(-15, -45, 30, 40, PAPER) + P('M15 -35 Q28 -30 15 -15', 'none') + `<path d="M-5 -55 Q0 -70 -5 -85 M5 -55 Q10 -70 5 -85" stroke="${G2}" stroke-width="3" fill="none"/>`],
    fridge: [130, 250, () => R(-60, -240, 120, 240, '#ddd7c8', 'rx="10"') + L(-60, -150, 60, -150) + L(40, -220, 40, -170, 6) + L(40, -130, 40, -60, 6)],
    podium: [220, 110, () => E(0, -90, 100, 22, 'url(#hta)') + R(-100, -90, 200, 90, G3) + E(0, 0, 100, 22, 'none') + L(-60, -80, -60, 10, 3) + L(60, -80, 60, 10, 3)],
    hoop: [150, 230, () => L(0, 0, 0, -90, 6) + E(0, -2, 40, 8, G3) + C(0, -150, 60, 'none', 'stroke-width="10" stroke="' + INK + '"') + P('M-50 -190 Q-60 -220 -40 -230 M0 -215 Q-10 -250 10 -260 M45 -195 Q55 -225 40 -240', 'none', 'stroke="#e0383e" stroke-width="5"')],
    drum: [150, 140, () => R(-65, -120, 130, 120, 'url(#hta)') + E(0, -120, 65, 18, PAPER) + P('M-65 -110 L-30 -10 L0 -110 L30 -10 L65 -110', 'none', 'stroke-width="3"') + L(40, -150, 90, -190, 5)],
    ladder: [80, 360, () => L(-25, 0, -25, -350, 4) + L(25, 0, 25, -350, 4) + [...Array(9)].map((_, k) => L(-25, -20 - k * 38, 25, -20 - k * 38, 4)).join('')],
    ball: [110, 110, () => C(0, -50, 50, PAPER) + P('M-50 -50 Q0 -20 50 -50 M-35 -85 Q0 -60 35 -85', 'none', 'stroke="' + INK + '"') + P('M-48 -40 Q0 -10 48 -40 L44 -25 Q0 5 -44 -25Z', 'url(#hta)', 'stroke-width="2"')],
    curtain: [200, 330, () => P('M-100 -330 L100 -330 L100 0 Q60 -20 40 0 Q0 -20 -20 0 Q-60 -20 -100 0Z', 'url(#hta)') + P('M-60 -320 Q-50 -150 -60 -10 M0 -320 Q10 -150 0 -10 M60 -320 Q50 -150 60 -10', 'none', 'stroke-width="2"')],
    mirror: [180, 220, () => R(-80, -100, 160, 200, G3, 'rx="20"') + R(-65, -85, 130, 170, '#d5dcdc', 'rx="12"') + [...Array(6)].map((_, k) => C(-80 + (k % 2) * 160, -70 + (k >> 1) * 70, 8, PAPER, 'stroke-width="2"')).join(''), 'c'],
    hay: [190, 120, () => R(-90, -110, 180, 110, '#c7ae6e', 'rx="14"') + L(-90, -40, 90, -40, 4) + [...Array(12)].map((_, k) => L(-80 + k * 15, -100, -84 + k * 15, -50, 2)).join('')],
    cage: [240, 250, () => R(-115, -240, 230, 240, 'none', 'stroke-width="6"') + [...Array(10)].map((_, k) => L(-92 + k * 21, -240, -92 + k * 21, 0, 4)).join('') + R(-115, -250, 230, 16, G3) + P('M110 -120 L150 -100', 'none', 'stroke-width="6"')],
    statue: [120, 230, () => R(-45, -100, 90, 100, HT) + P('M-35 -100 Q-40 -150 0 -150 Q40 -150 35 -100Z', G1) + C(0, -180, 30, G1) + L(-8, -185, -8, -180, 3) + L(8, -185, 8, -180, 3)],
    camera: [90, 80, () => R(-40, -20, 70, 36, G3) + R(30, -12, 14, 20, INK) + C(42, -2, 5, '#e0383e', 'stroke-width="1"') + L(-20, -20, -50, -50, 6), 'c'],
    easel: [170, 290, () => L(-60, 0, 0, -280, 6) + L(60, 0, 0, -280, 6) + L(0, -280, 0, 0, 5) + R(-70, -230, 140, 110, PAPER) + P('M-60 -130 Q-20 -200 20 -160 T60 -200', 'none', 'stroke="#8fd14f" stroke-width="6"') + L(-70, -118, 70, -118, 6)],
    monitors: [320, 230, () => [...Array(6)].map((_, k) => R(-150 + (k % 3) * 102, -220 + (k >> 1 & 1) * 0 + Math.floor(k / 3) * 80, 96, 72, k === 4 ? 'url(#hta)' : '#3b4a4a') + L(-140 + (k % 3) * 102, -200 + Math.floor(k / 3) * 80, -70 + (k % 3) * 102, -200 + Math.floor(k / 3) * 80, 2)).join('')],
    locker: [130, 260, () => R(-60, -250, 120, 250, G2) + L(0, -250, 0, 0, 3) + [-35, 25].map(x => [-230, -220, -210].map(y => L(x, y, x + 20, y, 2)).join('') + C(x + 25, -130, 5, INK)).join('')],
    keyboard: [160, 140, () => R(-75, -65, 150, 130, '#8a6e48') + [...Array(8)].map((_, k) => C(-50 + (k % 4) * 33, -35 + (k >> 2) * 55, 6, G3) + L(-50 + (k % 4) * 33, -29 + (k >> 2) * 55, -50 + (k % 4) * 33, -5 + (k >> 2) * 55, 4)).join(''), 'c'],
    stove: [200, 140, () => R(-95, -120, 190, 120, G3) + R(-80, -95, 160, 70, INK) + R(-95, -130, 190, 12, G4) + C(-50, -140, 18, G2) + R(10, -190, 70, 55, '#9aa', 'rx="6"') + `<path d="M30 -200 Q35 -230 25 -250 M55 -200 Q60 -230 50 -250" stroke="${G2}" stroke-width="4" fill="none"/>`],
    skis: [190, 260, () => R(-80, -20, 160, 20, G3) + [...Array(5)].map((_, k) => P(`M${-60 + k * 30} 0 L${-60 + k * 30} -240 Q${-50 + k * 30} -265 ${-45 + k * 30} -240 L${-45 + k * 30} 0Z`, k % 2 ? 'url(#hta)' : G1, 'stroke-width="3"')).join('')],
    boots: [160, 90, () => P('M-70 0 L-70 -80 L-30 -80 L-30 -25 L-5 -20 L-5 0Z', 'url(#hta)') + P('M10 0 L10 -80 L50 -80 L50 -25 L75 -20 L75 0Z', G3) + L(-70, -55, -30, -55, 3) + L(10, -55, 50, -55, 3)]
  };
  // Szene: SVG-Text und Klickflächen (in Prozent des Bildes)
  function scene(W, li, opt) {
    const Lc = W.locs[li], acc = W.acc; opt = opt || {};
    let s = `<svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs(acc)}${wall(Lc.wall, acc)}${floor(acc)}`;
    const spots = [];
    const order = Lc.objs.map((o, i) => [o, i]).sort((a, b) => (OB[a[0][0]][3] === 'c' ? 0 : a[0][2]) - (OB[b[0][0]][3] === 'c' ? 0 : b[0][2]));
    for (const [[t, x, y, sc, name], i] of order) {
      const def = OB[t]; if (!def) continue; const [w, h, , anc] = def;
      s += `<g transform="translate(${x} ${y}) scale(${sc})" class="ob${opt.found && opt.found.has(i) ? ' seen' : ''}">${def[2](x)}</g>`;
      const bw = w * sc, bh = h * sc, top = anc === 'c' ? y - bh / 2 : y - bh;
      spots.push({ i, name, l: (x - bw / 2) / 10, t: top / 6, w: bw / 10, h: bh / 6 });
    }
    s += `<rect x="0" y="0" width="1000" height="600" fill="url(#vig)" pointer-events="none"/></svg>`;
    return { svg: s, spots };
  }

  /* ---------- Porträt ---------- */
  const HAIR = { schwarz: '#1d1b1a', blond: '#e1c66e', rot: '#c4482a', grau: '#aaa7a0', braun: '#6e4a2c' };
  function portrait(S, acc, big) {
    const h = HAIR[S.hair] || G3, k = S.look, f = S.sex === 'f', st = k % 4, hat = !f && k % 5 === 0, skin = ['#e9d3bd', '#d8b393', '#c08e66', '#8a5f42'][Math.floor(k / 7) % 4];
    let s = `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">${defs(acc)}<rect width="200" height="220" fill="url(#hta)"/>`;
    s += `<rect width="200" height="220" fill="url(#vig)"/>`;
    // Mantel und Kragen
    s += P('M20 220 Q30 160 100 150 Q170 160 180 220Z', k % 3 ? G3 : G4) + P('M70 160 L100 200 L130 160', PAPER, 'stroke-width="3"') + P('M100 200 L92 220 L108 220Z', k % 2 ? acc : INK, 'stroke-width="2"');
    // Haare hinten (lang)
    if (f && st !== 1) s += P(st === 3 ? 'M48 90 Q40 170 70 180 L130 180 Q160 170 152 90Z' : 'M50 90 Q45 150 60 160 L140 160 Q155 150 150 90Z', h);
    s += E(100, 100, 46, 56, skin);
    s += `<path d="M100 150 Q130 140 140 110" fill="none" stroke="${INK}" stroke-width="2" opacity=".35"/>`;
    // Augen, Nase, Mund
    s += E(82, 100, 6, 4, INK, 'stroke-width="1"') + E(118, 100, 6, 4, INK, 'stroke-width="1"') + L(76, 88, 90, 86, 3) + L(110, 86, 124, 88, 3) + P('M100 104 L95 122 L104 122', 'none', 'stroke-width="2"') + P(f ? 'M88 134 Q100 141 112 134' : 'M88 134 L112 134', f ? '#a33' : 'none', 'stroke-width="3"');
    if (!f && k % 4 === 2) s += P('M84 128 Q100 120 116 128 Q100 134 84 128Z', h, 'stroke-width="2"');   // Schnurrbart
    // Haare vorn
    if (st === 0) s += P('M54 92 Q56 40 100 42 Q144 40 146 92 Q120 70 100 74 Q80 66 54 92Z', h);
    else if (st === 1) s += P('M56 86 Q60 46 100 46 Q140 46 144 86 Q100 60 56 86Z', h) + (f ? C(100, 40, 18, h) : '');
    else if (st === 2) s += P('M52 100 Q48 38 100 40 Q152 38 148 100 L140 80 L128 92 L116 72 L100 88 L84 72 L72 92 L60 80Z', h);
    else s += P('M54 96 Q50 44 100 44 Q150 44 146 96 Q140 66 100 62 Q60 66 54 96Z', h);
    if (S.glasses === 'ja') s += C(82, 100, 13, 'none', 'stroke-width="4"') + C(118, 100, 13, 'none', 'stroke-width="4"') + L(95, 100, 105, 100, 4);
    if (hat) s += P('M38 64 L162 64 L150 56 Q148 20 100 20 Q52 20 50 56Z', G4) + R(52, 48, 96, 10, acc, 'stroke-width="2"');
    return s + '</svg>';
  }

  /* ---------- Spuren-Bilder (Labor) ---------- */
  function sole(size, fill, dash) {   // Schuhsohle, Länge nach Größe
    const l = 150 + (size - 36) * 11, w = l * .38;
    return `<path d="M0 ${-l / 2} C${w * .6} ${-l / 2} ${w * .62} ${-l * .1} ${w * .5} ${l * .05} C${w * .4} ${l * .2} ${w * .42} ${l * .45} 0 ${l / 2} C${-w * .42} ${l * .45} ${-w * .4} ${l * .2} ${-w * .5} ${l * .05} C${-w * .62} ${-l * .1} ${-w * .6} ${-l / 2} 0 ${-l / 2}Z" fill="${fill}" stroke="${INK}" stroke-width="4" ${dash ? 'stroke-dasharray="10 8"' : ''}/>`;
  }
  function footprint(size, test) {
    let s = `<svg viewBox="-170 -170 340 340" xmlns="http://www.w3.org/2000/svg">${defs('#888')}<rect x="-170" y="-170" width="340" height="340" fill="#d8cdb4"/>`;
    s += `<g opacity=".85">${sole(size, G3)}${[...Array(8)].map((_, k) => `<line x1="-40" y1="${-70 + k * 22}" x2="40" y2="${-70 + k * 22}" stroke="${G4}" stroke-width="6"/>`).join('')}</g>`;
    if (test) s += `<g>${sole(test, 'rgba(255,255,255,.25)', true)}</g>`;
    for (let k = -160; k <= 160; k += 20) s += `<line x1="150" y1="${k}" x2="${k % 100 === 0 ? 135 : 142}" y2="${k}" stroke="${INK}" stroke-width="2"/>`;
    return s + '</svg>';
  }
  function fingerprint(type, seed, smudge) {
    let s = `<svg viewBox="-100 -120 200 240" xmlns="http://www.w3.org/2000/svg"><rect x="-100" y="-120" width="200" height="240" fill="${PAPER}"/><g fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round">`;
    const j = k => ((seed * 9301 + k * 49297) % 233280) / 233280 * 6 - 3;
    if (type === 'Bogen') for (let k = 0; k < 13; k++) { const y = 90 - k * 14; s += `<path d="M-80 ${y} Q0 ${y - 40 - k * 3 + j(k)} 80 ${y}"/>`; }
    else if (type === 'Schlaufe') { for (let k = 0; k < 9; k++) { const r = 12 + k * 9; s += `<path d="M${-r} 80 L${-r} ${-10 + j(k)} Q${-r} ${-r - 30} 0 ${-r - 30} Q${r} ${-r - 30} ${r} -10 L${r} 20"/>`; } for (let k = 0; k < 4; k++) s += `<path d="M-90 ${95 + k * 6} Q0 ${70 + k * 6} 90 ${95 + k * 6}"/>`; }
    else for (let k = 0; k < 10; k++) { const r = 8 + k * 9; s += `<ellipse cx="${j(k) * .6}" cy="0" rx="${r}" ry="${r * 1.25}"/>`; }
    s += '</g>';
    if (smudge) s += `<ellipse cx="${40 - seed % 80}" cy="${30 - seed % 60}" rx="55" ry="35" fill="${PAPER}" opacity=".85"/><rect x="-100" y="-120" width="200" height="240" fill="url(#none)"/>`;
    return s + '</svg>';
  }
  // Brief in 4 Teilen: Teil k (0–3) als eigenes SVG (Ausschnitt eines Gesamtbriefs)
  function letterPiece(text, k) {
    const lines = text, x = (k % 2) * 150, y = Math.floor(k / 2) * 150;
    let s = `<svg viewBox="${x} ${y} 150 150" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="300" height="300" fill="${PAPER}"/>`;
    s += `<path d="M0 0 H300 V300 H0Z" fill="none" stroke="${G2}" stroke-width="6"/>`;
    lines.forEach((t, i) => { s += `<text x="20" y="${48 + i * 42}" font-size="21" font-family="Courier New,monospace" font-weight="700" fill="${INK}">${t}</text>`; });
    s += `<line x1="${x}" y1="${y}" x2="${x + 150}" y2="${y + 150}" stroke="${G1}" stroke-width="1" opacity=".3"/>`;
    return s + '</svg>';
  }
  window.FAScene = { scene, portrait, footprint, fingerprint, letterPiece, OB, HAIR };
})();
