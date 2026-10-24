/* Werwolf-Nacht – Scherenschnitt-Theater (SVG): Dorf mit Hügeln, Fachwerkhäusern, Kirchturm, Bäumen und Lagerfeuer vor einem
 * Himmel, der zwischen Nacht (tiefblau, Vollmond, Sterne), Morgen (rosa), Tag (warm) und Abstimmung (glutrot) wechselt.
 * Figuren als schwarze Silhouetten mit Hut, Frisur und Werkzeug – aus einer Zahl erzeugt. */
(function () {
  'use strict';
  const SKY = {
    night: ['#0b1636', '#1d3270', '#3c4f8f'], dawn: ['#2b2350', '#b0577a', '#f3a77a'], day: ['#f6c46a', '#f7dd9a', '#fff1cf'], vote: ['#3a0b12', '#8f2a1c', '#e0632d'], over: ['#120d1f', '#3b2a55', '#7a5a8a']
  };
  const INK = '#0d0a10';
  function village(ph, opt) {
    const s = SKY[ph] || SKY.night, night = ph === 'night' || ph === 'over', o = opt || {};
    let v = `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s[0]}"/><stop offset=".6" stop-color="${s[1]}"/><stop offset="1" stop-color="${s[2]}"/></linearGradient>
<radialGradient id="moon" cx="50%" cy="50%" r="50%"><stop offset=".6" stop-color="#fff7d6"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient><radialGradient id="fire" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a2a" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#sky)"/>`;
    if (night) { for (let i = 0; i < 70; i++) { const x = (i * 337) % 1600, y = (i * 191) % 420, r = (i % 3) * .7 + .8; v += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${.4 + (i % 5) * .12}"/>`; } v += `<circle cx="1230" cy="190" r="150" fill="url(#moon)" opacity=".5"/><circle cx="1230" cy="190" r="88" fill="#fff4cf"/><circle cx="1262" cy="170" r="14" fill="#e9dcae"/><circle cx="1205" cy="222" r="9" fill="#e9dcae"/>`; }
    else if (ph === 'vote') v += `<circle cx="300" cy="560" r="120" fill="#ffb15a" opacity=".85"/>`;
    else v += `<circle cx="${ph === 'dawn' ? 320 : 1250}" cy="${ph === 'dawn' ? 600 : 170}" r="${ph === 'dawn' ? 110 : 80}" fill="#fff3c4" opacity=".95"/>`;
    // ferne Hügel und Wald
    v += `<path d="M0 640 Q200 540 420 600 T840 580 T1250 600 T1600 560 V900 H0Z" fill="${INK}" opacity=".45"/>`;
    for (let i = 0; i < 22; i++) { const x = i * 78 - 20, h = 60 + (i * 37) % 50; v += `<path d="M${x} 640 L${x + 26} ${640 - h} L${x + 52} 640Z" fill="${INK}" opacity=".6"/>`; }
    // Dorf
    v += `<path d="M0 700 Q400 640 800 690 T1600 670 V900 H0Z" fill="${INK}"/>`;
    const houses = [[120, 680, 1], [300, 670, .8], [520, 690, 1.1], [1020, 680, .9], [1220, 670, 1.15], [1430, 685, .85]];
    houses.forEach(([x, y, k], i) => {
      v += `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-70 0 V-90 L0 -150 L70 -90 V0Z" fill="${INK}"/><rect x="30" y="-150" width="16" height="40" fill="${INK}"/>`;
      const lit = night ? (o.lit || '#ffcf6a') : ph === 'vote' ? '#ff9a4a' : '#3a2c1a';
      v += `<rect x="-42" y="-75" width="24" height="26" fill="${lit}" opacity="${night && (i % 3 === 1) ? .25 : .95}"/><rect x="18" y="-75" width="24" height="26" fill="${lit}" opacity="${night && (i % 2) ? .3 : .9}"/><path d="M-30 -75 V-49 M-42 -62 H-18 M30 -75 V-49 M18 -62 H42" stroke="${INK}" stroke-width="3"/></g>`;
    });
    // Kirchturm
    v += `<g transform="translate(790 670)"><rect x="-38" y="-230" width="76" height="230" fill="${INK}"/><path d="M-48 -230 L0 -340 L48 -230Z" fill="${INK}"/><rect x="-3" y="-380" width="6" height="45" fill="${INK}"/><rect x="-16" y="-368" width="32" height="6" fill="${INK}"/><circle cx="0" cy="-180" r="20" fill="${night ? '#ffe9a8' : '#f4e0b0'}" opacity=".9"/><path d="M0 -180 V-194 M0 -180 L10 -175" stroke="${INK}" stroke-width="3"/></g>`;
    // Bäume
    for (const [x, k] of [[40, 1.2], [680, .9], [930, 1], [1560, 1.3]]) v += `<g transform="translate(${x} 720) scale(${k})"><rect x="-6" y="-60" width="12" height="60" fill="${INK}"/><path d="M0 -190 L-50 -60 H50Z M0 -230 L-38 -120 H38Z" fill="${INK}"/></g>`;
    // Lagerfeuer
    if (!o.noFire) v += `<g transform="translate(800 845)"><ellipse cx="0" cy="-10" rx="${night ? 260 : 120}" ry="${night ? 90 : 40}" fill="url(#fire)" opacity="${night ? .55 : .35}"/><path d="M-40 0 L40 -16 M-40 -16 L40 0" stroke="${INK}" stroke-width="12"/><path class="flame" d="M-22 -10 Q-26 -50 0 -80 Q8 -50 22 -10Z" fill="#ff8a2a"/><path class="flame f2" d="M-10 -12 Q-10 -40 4 -58 Q12 -36 10 -12Z" fill="#ffd36a"/></g>`;
    if (night && o.wolfEyes) for (let i = 0; i < o.wolfEyes; i++) { const x = 160 + i * 430, y = 610 + (i % 2) * 20; v += `<g class="eyes"><ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#ffe066"/><ellipse cx="${x + 22}" cy="${y}" rx="7" ry="4" fill="#ffe066"/></g>`; }
    return v + '</svg>';
  }
  // Silhouette einer Figur (viewBox 100×170), dead = liegt nicht, sondern wird blass mit Kreuz-Schild
  function figure(look, opt) {
    const k = Math.abs(look | 0), o = opt || {}, c = o.color || INK, hat = k % 7, hair = Math.floor(k / 7) % 4, tool = Math.floor(k / 28) % 6, wide = 1 + (k % 5 - 2) * .06, tall = 1 + (Math.floor(k / 5) % 3 - 1) * .05;
    let s = `<svg viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg"><g fill="${c}" transform="translate(50 170) scale(${wide} ${tall}) translate(-50 -170)">`;
    // Körper (Mantel/Kleid) und Beine
    s += hair === 3 ? `<path d="M30 168 L36 92 Q50 84 64 92 L74 168Z"/>` : `<path d="M34 120 Q50 108 66 120 L68 168 H56 L54 138 H46 L44 168 H32Z"/><path d="M33 124 Q50 88 67 124Z"/>`;
    s += `<path d="M36 92 Q50 80 64 92 L70 132 Q50 138 30 132Z"/>`;
    // Arme
    s += `<path d="M36 94 Q24 110 26 132 L31 132 Q31 114 40 102Z"/><path d="M64 94 Q76 110 74 132 L69 132 Q69 114 60 102Z"/>`;
    // Kopf + Hals
    s += `<rect x="46" y="70" width="8" height="14"/><ellipse cx="50" cy="60" rx="13" ry="15"/>`;
    // Nase/Profil
    s += k % 2 ? `<path d="M62 58 L68 63 L62 65Z"/>` : `<path d="M38 58 L32 63 L38 65Z"/>`;
    // Frisur
    if (hair === 1) s += `<path d="M37 56 Q36 40 50 42 Q64 40 63 56 L66 84 Q60 78 58 66 L42 66 Q40 78 34 84Z"/>`;
    else if (hair === 2) s += `<circle cx="50" cy="40" r="8"/>`;
    else if (hair === 3) s += `<path d="M36 58 Q36 40 50 42 Q64 40 64 58 L70 96 Q50 86 30 96Z"/>`;
    // Hüte
    if (hat === 0) s += `<path d="M30 49 H70 V45 H62 V26 H38 V45 H30Z"/>`;
    else if (hat === 1) s += `<path d="M28 50 Q50 40 72 50 L50 8Z"/>`;
    else if (hat === 2) s += `<path d="M34 52 Q34 36 50 36 Q66 36 66 52 H76 V55 H34Z"/>`;
    else if (hat === 3) s += `<path d="M34 64 Q30 30 50 30 Q70 30 66 64 L70 92 Q50 80 30 92Z"/>`;
    else if (hat === 4) s += `<path d="M36 47 H64 L60 38 Q50 32 40 38Z"/><circle cx="64" cy="34" r="5"/>`;
    // Werkzeuge
    if (tool === 0) s += `<rect x="78" y="40" width="4" height="128"/><path d="M72 40 V24 M80 40 V20 M88 40 V24 M72 40 H88" stroke="${c}" stroke-width="4" fill="none"/>`;
    else if (tool === 1) s += `<rect x="20" y="118" width="4" height="22"/><path d="M14 140 H30 L28 158 H16Z"/><rect x="18" y="146" width="8" height="8" fill="${o.light || '#ffcf6a'}"/>`;
    else if (tool === 2) s += `<rect x="78" y="28" width="5" height="140"/><circle cx="80" cy="26" r="7"/>`;
    else if (tool === 3) s += `<path d="M18 128 H36 L34 146 H20Z"/><path d="M19 128 Q27 112 35 128" fill="none" stroke="${c}" stroke-width="3"/>`;
    else if (tool === 4) s += `<rect x="64" y="62" width="14" height="3"/><rect x="76" y="56" width="6" height="8"/>`;
    s += '</g>';
    if (o.mark) s += `<text x="50" y="30" font-size="26" text-anchor="middle">${o.mark}</text>`;
    return s + '</svg>';
  }
  window.WWScene = { village, figure, SKY };
})();
