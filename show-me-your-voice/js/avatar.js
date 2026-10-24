/* SHOW ME YOUR VOICE – Figuren als SVG (Spieler, KI-Kandidaten, Showmaster Rico). Keine Bilddateien nötig. */
(function (root) {
  'use strict';
  const OPT = {
    skin: ['#f6d7c3', '#efc3a4', '#d9a07a', '#b97a52', '#8d5a3b', '#5e3b26'],
    hair: ['kurz', 'undercut', 'stachelig', 'lang', 'locken', 'dutt', 'buzz'],
    hairColor: ['#2b1d16', '#6e4c2e', '#b07a3c', '#e3c16f', '#c43d2f', '#8a5cf6', '#3a86ff', '#ff5fa2', '#d9d9e3'],
    outfit: ['hoodie', 'lederjacke', 'tshirt', 'glitzer', 'sakko'],
    outfitColor: ['#1d1f3a', '#5b2a86', '#e0245e', '#0aa4c9', '#f4b400', '#2e2e2e', '#f2f2f7'],
    acc: ['keine', 'brille', 'sonnenbrille', 'ohrring', 'kopfhoerer', 'cap', 'hut'],
    beard: ['keiner', 'stoppeln', 'vollbart'],
    piercing: ['keins', 'nase', 'ohr', 'beide']
  };
  const LABEL = {
    hair: { kurz: 'Kurz', undercut: 'Undercut', stachelig: 'Stachelig', lang: 'Lang', locken: 'Locken', dutt: 'Dutt', buzz: 'Raspel' },
    outfit: { hoodie: 'Hoodie', lederjacke: 'Lederjacke', tshirt: 'T-Shirt', glitzer: 'Glitzer-Top', sakko: 'Sakko' },
    acc: { keine: 'Keins', brille: 'Brille', sonnenbrille: 'Sonnenbrille', ohrring: 'Ohrringe', kopfhoerer: 'Kopfhörer', cap: 'Cap', hut: 'Hut' },
    beard: { keiner: 'Kein Bart', stoppeln: 'Stoppeln', vollbart: 'Vollbart' },
    piercing: { keins: 'Keins', nase: 'Nasenring', ohr: 'Ohr-Tunnel', beide: 'Nase + Ohr' }
  };
  const DEF = { skin: 1, hair: 'undercut', hairColor: 6, outfit: 'hoodie', outfitColor: 0, acc: 'keine', beard: 'keiner', piercing: 'keins' };

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v * f))));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  const pickC = (list, v, d) => Number.isFinite(v) ? list[((Math.floor(v) % list.length) + list.length) % list.length] : (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : list[d]);   // nur echte Farben (auch fremde Avatare online)
  const one = (list, v) => list.includes(v) ? v : list[0];

  // expr: neutral | happy | shock | sad
  function svg(look, expr, extraClass) {
    const L = Object.assign({}, DEF, look || {});
    const skin = pickC(OPT.skin, L.skin, 1), sk2 = shade(skin, 0.86);
    const hc = pickC(OPT.hairColor, L.hairColor, 0), hc2 = shade(hc, 0.75);
    const oc = pickC(OPT.outfitColor, L.outfitColor, 0), oc2 = shade(oc, 0.72);
    const hair = one(OPT.hair, L.hair), outfit = one(OPT.outfit, L.outfit), acc = one(OPT.acc, L.acc);
    const beard = one(OPT.beard, L.beard), pierc = one(OPT.piercing, L.piercing);
    const p = [];
    // Haare hinten
    if (hair === 'lang') p.push(`<path d="M52 100 Q50 40 100 38 Q150 40 148 100 L156 196 Q100 214 44 196Z" fill="${hc2}"/>`);
    if (hair === 'locken') p.push(`<g fill="${hc2}">${[56, 70, 130, 144].map((x, i) => `<circle cx="${x}" cy="${140 + (i % 2) * 14}" r="17"/>`).join('')}</g>`);
    // Körper / Outfit
    p.push(`<path d="M24 240 Q28 180 100 168 Q172 180 176 240Z" fill="${oc}"/>`);
    if (outfit === 'hoodie') p.push(`<path d="M64 176 Q100 206 136 176 Q124 168 100 166 Q76 168 64 176Z" fill="${oc2}"/><path d="M88 190 L86 222 M112 190 L114 222" stroke="#eee" stroke-width="3" stroke-linecap="round"/>`);
    if (outfit === 'lederjacke') p.push(`<path d="M100 172 L76 240 L58 240 L66 182Z M100 172 L124 240 L142 240 L134 182Z" fill="${oc2}"/><path d="M100 174 L100 240" stroke="#111" stroke-width="2"/>`);
    if (outfit === 'tshirt') p.push(`<path d="M80 172 Q100 190 120 172" fill="none" stroke="${oc2}" stroke-width="5"/>`);
    if (outfit === 'glitzer') p.push(`<g fill="#fff" opacity=".85">${[[60, 204], [84, 222], [118, 214], [140, 200], [100, 232], [72, 188], [130, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>`);
    if (outfit === 'sakko') p.push(`<path d="M100 176 L86 240 L114 240Z" fill="#f4f4f8"/><path d="M100 172 L78 240 L62 240 L70 184Z M100 172 L122 240 L138 240 L130 184Z" fill="${oc2}"/>`);
    // Hals, Ohren, Kopf
    p.push(`<rect x="86" y="138" width="28" height="38" rx="10" fill="${sk2}"/>`);
    p.push(`<ellipse cx="56" cy="112" rx="9" ry="13" fill="${sk2}"/><ellipse cx="144" cy="112" rx="9" ry="13" fill="${sk2}"/>`);
    p.push(`<ellipse cx="100" cy="104" rx="44" ry="52" fill="${skin}"/>`);
    // Bart
    if (beard === 'stoppeln') p.push(`<path d="M60 112 Q62 156 100 160 Q138 156 140 112 Q132 140 100 142 Q68 140 60 112Z" fill="${hc}" opacity=".35"/>`);
    if (beard === 'vollbart') p.push(`<path d="M58 104 Q58 162 100 166 Q142 162 142 104 Q138 134 120 136 Q100 128 80 136 Q62 134 58 104Z" fill="${hc}"/><path d="M84 132 Q100 124 116 132 Q100 128 84 132Z" fill="${hc2}"/>`);
    // Haare vorne
    const H = {
      kurz: `<path d="M56 98 Q54 48 100 46 Q146 48 144 98 Q132 70 100 68 Q68 70 56 98Z" fill="${hc}"/>`,
      undercut: `<path d="M58 96 Q58 76 64 70 L66 96Z M142 96 L134 96 L136 70 Q142 76 142 96Z" fill="${hc2}" opacity=".7"/><path d="M62 74 Q64 34 112 36 Q156 42 146 78 Q120 56 92 66 Q72 72 62 74Z" fill="${hc}"/>`,
      stachelig: `<path d="M56 96 Q52 66 62 56 L66 40 L78 52 L86 32 L96 50 L108 30 L114 50 L128 36 L130 56 L144 50 Q148 70 144 96 Q130 68 100 66 Q70 68 56 96Z" fill="${hc}"/>`,
      lang: `<path d="M54 110 Q50 46 100 44 Q150 46 146 110 Q140 70 100 64 Q60 70 54 110Z" fill="${hc}"/>`,
      locken: `<g fill="${hc}">${[[62, 80], [74, 58], [94, 48], [116, 50], [134, 62], [142, 84], [84, 62], [108, 60], [56, 100], [144, 102]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`).join('')}</g>`,
      dutt: `<circle cx="100" cy="34" r="20" fill="${hc}"/><path d="M56 98 Q54 50 100 48 Q146 50 144 98 Q130 66 100 64 Q70 66 56 98Z" fill="${hc}"/>`,
      buzz: `<path d="M58 92 Q58 52 100 52 Q142 52 142 92 Q128 66 100 64 Q72 66 58 92Z" fill="${hc}" opacity=".55"/>`
    };
    p.push(H[hair]);
    // Gesicht
    const e = expr || 'neutral';
    const brow = e === 'sad' ? 'M72 92 L90 96 M110 96 L128 92' : e === 'shock' ? 'M72 86 Q81 80 90 86 M110 86 Q119 80 128 86' : 'M72 92 Q81 88 90 92 M110 92 Q119 88 128 92';
    p.push(`<path d="${brow}" stroke="${shade(hc, 0.8)}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    if (e === 'happy') p.push(`<path d="M74 108 Q81 101 88 108 M112 108 Q119 101 126 108" stroke="#2a1a14" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
    else {
      const r = e === 'shock' ? 7 : 6;
      p.push(`<ellipse cx="81" cy="108" rx="${r + 1}" ry="${r}" fill="#fff"/><ellipse cx="119" cy="108" rx="${r + 1}" ry="${r}" fill="#fff"/><circle cx="82" cy="109" r="3.6" fill="#3b2a20"/><circle cx="120" cy="109" r="3.6" fill="#3b2a20"/>`);
    }
    p.push(`<path d="M100 112 Q96 126 100 128 Q104 128 106 126" stroke="${sk2}" stroke-width="3" fill="none" stroke-linecap="round"/>`);
    const M = { neutral: 'M88 140 Q100 146 112 140', happy: 'M84 136 Q100 156 116 136Z', shock: '', sad: 'M88 146 Q100 136 112 146' };
    if (e === 'shock') p.push(`<ellipse cx="100" cy="143" rx="7" ry="9" fill="#5a1f1f"/>`);
    else p.push(`<path d="${M[e] || M.neutral}" ${e === 'happy' ? 'fill="#fff" stroke="#7a2a2a" stroke-width="3"' : 'fill="none" stroke="#7a2a2a" stroke-width="3.5" stroke-linecap="round"'}/>`);
    // Piercings
    if (pierc === 'nase' || pierc === 'beide') p.push(`<path d="M96 129 Q100 135 104 129" stroke="#c9ccd6" stroke-width="2.4" fill="none"/>`);
    if (pierc === 'ohr' || pierc === 'beide') p.push(`<circle cx="55" cy="122" r="4" fill="#111" stroke="#555" stroke-width="1.5"/><circle cx="145" cy="122" r="4" fill="#111" stroke="#555" stroke-width="1.5"/>`);
    // Accessoires
    const A = {
      keine: '',
      brille: `<g fill="none" stroke="#111" stroke-width="3.5"><rect x="68" y="98" width="26" height="20" rx="6"/><rect x="106" y="98" width="26" height="20" rx="6"/><path d="M94 106 L106 106"/></g>`,
      sonnenbrille: `<g fill="#0d0d14" stroke="#111" stroke-width="3"><path d="M66 98 L96 98 L94 114 Q80 122 68 112Z"/><path d="M104 98 L134 98 L132 112 Q120 122 106 114Z"/><path d="M96 101 L104 101"/></g>`,
      ohrring: `<circle cx="56" cy="128" r="4.5" fill="none" stroke="#f4c430" stroke-width="2.5"/><circle cx="144" cy="128" r="4.5" fill="none" stroke="#f4c430" stroke-width="2.5"/>`,
      kopfhoerer: `<path d="M50 112 Q50 40 100 40 Q150 40 150 112" fill="none" stroke="#222" stroke-width="7"/><rect x="42" y="100" width="16" height="28" rx="7" fill="#e0245e"/><rect x="142" y="100" width="16" height="28" rx="7" fill="#e0245e"/>`,
      cap: `<path d="M56 84 Q58 44 100 42 Q142 44 144 84Z" fill="${oc}"/><path d="M100 80 Q150 78 168 90 Q140 92 100 88Z" fill="${oc2}"/>`,
      hut: `<path d="M44 74 Q100 60 156 74 Q148 82 100 80 Q52 82 44 74Z" fill="#141418"/><path d="M64 74 Q66 34 100 34 Q134 34 136 74Z" fill="#1d1d24"/><rect x="65" y="62" width="70" height="7" fill="#3a3a48"/>`
    };
    p.push(A[acc]);
    if (L.mic) p.push(`<g transform="rotate(-18 150 196)"><rect x="144" y="176" width="12" height="58" rx="5" fill="#1b1b22"/><circle cx="150" cy="172" r="12" fill="#3a3a48" stroke="#8a5cf6" stroke-width="2"/></g><ellipse cx="150" cy="214" rx="14" ry="11" fill="${skin}"/>`);
    return `<svg class="ava ${extraClass || ''}" viewBox="0 0 200 240" role="img" aria-hidden="true">${p.join('')}</svg>`;
  }

  root.SMYVAvatar = { OPT, LABEL, DEF, svg };
})(window);
