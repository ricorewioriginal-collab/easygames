// Branding: Logo (Emblem + Schriftzug), Titel-Hintergrund und Stadt-Motive für die
// Ladebildschirme. Alles als kleines Inline-SVG/CSS – keine Bilddateien, läuft offline
// und am Handy flüssig (nur transform/opacity-Animationen).
import { h } from './ui.js';
import { REGIONS } from '../data/regions.js';
import { TYPES } from '../data/types.js';

const hex = (c) => '#' + (c >>> 0).toString(16).padStart(6, '0');
const mix = (a, b, t) => { const r = (x, s) => (x >> s) & 255; const m = (s) => Math.round(r(a, s) + (r(b, s) - r(a, s)) * t); return (m(16) << 16) | (m(8) << 8) | m(0); };
const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

// Emblem: ein Lichtstern im Ring aus 16 Lichtern (eines je Region).
export function emblemSVG(size = 120) {
  const dots = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(60 + Math.cos(a) * 50).toFixed(1)}" cy="${(60 + Math.sin(a) * 50).toFixed(1)}" r="${i % 4 ? 3.1 : 4.6}" fill="${i % 4 ? '#ffe7a3' : '#fff8dc'}"/>`; }).join('');
  return `<svg class="emblem" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><defs>
<radialGradient id="emG" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fffbe8"/><stop offset=".45" stop-color="#ffd76b"/><stop offset="1" stop-color="#f08a3c"/></radialGradient>
<radialGradient id="emH" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffb24a" stop-opacity="0"/></radialGradient>
<linearGradient id="emR" x2="0" y2="1"><stop offset="0" stop-color="#5b7bd8"/><stop offset="1" stop-color="#2a2f7a"/></linearGradient></defs>
<circle cx="60" cy="60" r="58" fill="url(#emH)"/><circle cx="60" cy="60" r="50" fill="none" stroke="url(#emR)" stroke-width="9"/><circle cx="60" cy="60" r="50" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="1.5"/>${dots}
<path d="M60 18 68 50 98 60 68 70 60 102 52 70 22 60 52 50Z" fill="url(#emG)" stroke="#7a3a2a" stroke-opacity=".55" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M60 34 64 56 82 60 64 64 60 86 56 64 38 60 56 56Z" fill="#fffdf2" opacity=".9"/><circle cx="60" cy="60" r="5" fill="#fff"/></svg>`;
}

// Logo als DOM: Emblem, Schriftzug, Band „DIE 16 LICHTER“. size: 'xl' | 'md' | 'sm'
export function logo(size = 'xl') {
  const el = h('div.brand.' + size, { role: 'img', 'aria-label': 'TASCHI – Die 16 Lichter' },
    h('div.brand-em', { html: emblemSVG(120) }),
    h('div.brand-word', {}, [...'TASCHI'].map((c, i) => h('span', { style: `--i:${i};--y:${Math.abs(i - 2.5) * 3}` }, c))),
    h('div.brand-band', {}, h('span', {}, 'DIE 16 LICHTER')));
  return el;
}

// Hintergrund-Funken (wenige, nur CSS-Animation)
export function sparks(n = 14, seed = 7) {
  const r = rnd(seed);
  return h('div.sparks', { 'aria-hidden': 'true' }, Array.from({ length: n }, () => h('i', { style: `left:${(r() * 100).toFixed(1)}%;animation-delay:${(-r() * 9).toFixed(2)}s;animation-duration:${(7 + r() * 6).toFixed(1)}s;--s:${(0.5 + r() * 0.9).toFixed(2)}` })));
}

// ------------------------------------------------------------------ Stadt-Motive
const NIGHT = new Set(['meadow-night', 'bay-night']);
const ridge = (r, y, amp, n, w = 1600) => { let d = `M0 900L0 ${y}`; for (let i = 0; i <= n; i++) { const x = i / n * w; d += `L${x.toFixed(0)} ${(y - r() * amp).toFixed(0)}`; } return d + `L${w} 900Z`; };
const hill = (y, a) => `M0 900L0 ${y}Q400 ${y - a} 800 ${y - a * 0.4}T1600 ${y - a * 0.2}L1600 900Z`;

function landmarkSVG(kind, P, x, base) {
  const dark = hex(mix(P.trim, 0x101828, 0.35)), wall = hex(P.wall), roof = hex(P.roof), acc = hex(P.accent);
  const g = (s) => `<g transform="translate(${x} ${base})">${s}</g>`;
  switch (kind) {
    case 'lighthouse': case 'windtower': case 'observatory':
      return g(`<path d="M-34 0-22-250h44L34 0Z" fill="${wall}"/><path d="M-30-60h60v-34h-60zM-26-160h52v-30h-52z" fill="${roof}"/><rect x="-28" y="-292" width="56" height="44" rx="6" fill="${dark}"/><circle cy="-270" r="15" fill="#fff4b8"/><path d="M-38-292h76l-38-46z" fill="${roof}"/>` + (kind === 'lighthouse' ? `<path d="M0-270 420-330V-210Z" fill="#fff4b8" opacity=".25"/>` : kind === 'observatory' ? `<circle cy="-300" r="40" fill="${dark}"/>` : ''));
    case 'mill': case 'windmills':
      return g(`<path d="M-50 0-36-170h72L50 0Z" fill="${wall}"/><path d="M-46-170h92l-46-60z" fill="${roof}"/><g transform="translate(0 -200)" class="spin"><path d="M-6-150h12V150h-12zM-150-6h300v12h-300z" fill="${dark}"/><path d="M6-150h40v120h-40zM-46 30h40v120h-40zM30 6h120v40h-120zM-150-46h120v40h-120z" fill="${wall}" opacity=".9"/></g><rect x="-14" y="-50" width="28" height="50" rx="12" fill="${dark}"/>`);
    case 'volcano':
      return g(`<path d="M-420 0-90-330h180L420 0Z" fill="${hex(mix(P.rock, 0x2a1a1a, 0.4))}"/><path d="M-90-330 0-300 90-330 60-250 0-280-50-230Z" fill="#ff7a2a"/><circle cy="-360" r="80" fill="#ff8a3a" opacity=".35"/>`);
    case 'bigtree':
      return g(`<path d="M-30 0Q-20-140-40-220h80Q20-140 30 0Z" fill="${dark}"/><circle cy="-300" r="150" fill="${hex(mix(P.grass, 0x1a3020, 0.35))}"/><circle cx="-110" cy="-230" r="90" fill="${hex(mix(P.grass, 0x1a3020, 0.25))}"/><circle cx="110" cy="-240" r="100" fill="${hex(mix(P.grass2, 0x1a3020, 0.3))}"/>`);
    case 'mushrooms':
      return g([[-80, 180, 90], [40, 260, 120], [150, 140, 70]].map(([dx, hh, rr]) => `<rect x="${dx - 12}" y="${-hh}" width="24" height="${hh}" rx="10" fill="${wall}"/><path d="M${dx - rr} ${-hh}Q${dx} ${-hh - rr * 1.3} ${dx + rr} ${-hh}Z" fill="${acc}"/><circle cx="${dx - rr * .3}" cy="${-hh - rr * .35}" r="${rr * .12}" fill="#fff" opacity=".8"/>`).join(''));
    case 'crystalspires':
      return g([[-110, 220, 40], [-30, 360, 60], [70, 280, 50], [150, 180, 34]].map(([dx, hh, w]) => `<path d="M${dx - w} 0 ${dx - w * .6} ${-hh * .8} ${dx} ${-hh} ${dx + w * .6} ${-hh * .8} ${dx + w} 0Z" fill="${acc}" opacity=".9"/><path d="M${dx} ${-hh} ${dx + w * .6} ${-hh * .8} ${dx + w} 0H${dx}Z" fill="#fff" opacity=".25"/>`).join(''));
    case 'moonarch': case 'skybridge':
      return g(`<path d="M-260 0V-200Q0-420 260-200V0H200V-190Q0-340-200-190V0Z" fill="${kind === 'moonarch' ? '#c9d4ff' : wall}" opacity=".92"/>`);
    case 'suntemple': case 'shrine':
      return g(`<path d="M-200 0V-40h400V0ZM-170-40V-80h340v40ZM-140-80v-130h280v130Z" fill="${wall}"/><path d="M-170-210h340L0-300Z" fill="${roof}"/><rect x="-30" y="-170" width="60" height="90" fill="${dark}"/><circle cy="-340" r="34" fill="${kind === 'suntemple' ? '#ffd76b' : '#e8d4ff'}" opacity=".85"/>`);
    case 'stormtowers':
      return g([-120, 0, 120].map((dx, i) => `<path d="M${dx - 24} 0 ${dx - 12} ${-200 - i % 2 * 80}h24L${dx + 24} 0Z" fill="${dark}"/><circle cx="${dx}" cy="${-212 - i % 2 * 80}" r="12" fill="#ffe56a"/>`).join('') + `<path d="M-60-330-90-240h30l-40 90 90-120h-34l30-60Z" fill="#ffe56a"/>`);
    case 'frozenlake':
      return g(`<ellipse cy="-10" rx="380" ry="40" fill="#dff6ff" opacity=".85"/><path d="M-300-10h600" stroke="#fff" stroke-width="4" opacity=".7"/>`);
    case 'boardwalk':
      return g(`<rect x="-360" y="-46" width="720" height="16" fill="${dark}"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${-340 + i * 85}" y="-46" width="10" height="46" fill="${dark}"/>`).join(''));
    default: return '';
  }
}

function townRow(P, r, y, scale = 1) {
  let s = '', x = 520;
  while (x < 1180) {
    const w = (70 + r() * 70) * scale, hh = (60 + r() * 70) * scale, rh = (40 + r() * 30) * scale;
    const wall = hex(mix(P.wall, 0xffffff, r() * 0.2)), roof = hex(mix(P.roof, 0x000000, r() * 0.25));
    s += `<rect x="${x}" y="${y - hh}" width="${w}" height="${hh}" fill="${wall}"/><path d="M${x - 10} ${y - hh}L${x + w / 2} ${y - hh - rh}L${x + w + 10} ${y - hh}Z" fill="${roof}"/>`;
    for (let k = 0; k < 2; k++) s += `<rect class="win" x="${x + w * (0.2 + k * 0.42)}" y="${y - hh * 0.62}" width="${w * 0.2}" height="${hh * 0.24}" rx="3" fill="#ffe08a"/>`;
    x += w + (14 + r() * 26) * scale;
  }
  return s;
}

// Großes Szenenbild einer Region: Himmel, Berge, Biom, Wahrzeichen, Stadt, Wiese.
export function townArt(i) {
  const R = REGIONS[Math.min(15, i)], P = R.palette, r = rnd(31 + i * 97), night = NIGHT.has(R.biome) || i === 16;
  const sky0 = night ? 0x0d1638 : P.sky[0], sky1 = night ? 0x3a3f7a : P.sky[1];
  const far = hex(mix(P.rock, sky1, 0.55)), mid = hex(mix(P.rock, 0x1a2333, 0.15));
  const g1 = hex(P.grass), g2 = hex(P.grass2), fog = hex(night ? 0x5560a0 : P.fog);
  let biome = '';
  switch (R.biome) {
    case 'coast': case 'bay-night': biome = `<rect y="600" width="1600" height="300" fill="${hex(P.water)}"/><path d="M0 640H1600" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-dasharray="60 90"/>`; break;
    case 'snow': biome = `<path d="${ridge(r, 470, 200, 7)}" fill="#eef7ff"/>`; break;
    case 'volcanic': biome = `<rect y="560" width="1600" height="340" fill="#ff6a2a" opacity=".25"/>`; break;
    case 'forest': case 'canopy': case 'grove': biome = Array.from({ length: 22 }, (_, k) => { const x = k * 76 + r() * 30, hh = 140 + r() * 120; return `<path d="M${x} 640l50-${hh} 50 ${hh}Z" fill="${hex(mix(P.grass, 0x10301a, 0.45 + r() * 0.15))}"/>`; }).join(''); break;
    case 'crystal': biome = Array.from({ length: 10 }, (_, k) => { const x = 60 + k * 160, hh = 80 + r() * 160; return `<path d="M${x} 620l30-${hh} 30 ${hh}Z" fill="${hex(P.accent)}" opacity=".55"/>`; }).join(''); break;
    case 'sky': biome = Array.from({ length: 8 }, (_, k) => `<ellipse cx="${k * 220 + r() * 80}" cy="${640 + r() * 60}" rx="${160 + r() * 80}" ry="46" fill="#ffffff" opacity=".85"/>`).join(''); break;
    case 'swamp': biome = `<rect y="580" width="1600" height="320" fill="${hex(P.water)}" opacity=".6"/>`; break;
    case 'savanna': case 'plains': case 'mesa': biome = `<path d="M100 600V520h260v80ZM1150 600V480h320v120Z" fill="${hex(mix(P.rock, P.dirt, 0.5))}"/>`; break;
  }
  const stars = night ? Array.from({ length: 50 }, () => `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 420).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`).join('') : '';
  const sun = night ? `<circle cx="960" cy="190" r="64" fill="#f4f1ff"/><circle cx="984" cy="174" r="58" fill="${hex(sky0)}"/>` : `<circle cx="960" cy="200" r="150" fill="#fff6d0" opacity=".35"/><circle cx="960" cy="200" r="70" fill="#fff8e0"/>`;
  const clouds = night ? '' : Array.from({ length: 4 }, () => `<ellipse cx="${(r() * 1600).toFixed(0)}" cy="${(90 + r() * 200).toFixed(0)}" rx="${(90 + r() * 120).toFixed(0)}" ry="${(20 + r() * 16).toFixed(0)}" fill="#fff" opacity=".55"/>`).join('');
  return `<svg class="townart" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
<linearGradient id="tsky${i}" x2="0" y2="1"><stop offset="0" stop-color="${hex(sky0)}"/><stop offset="1" stop-color="${hex(sky1)}"/></linearGradient>
<linearGradient id="tfog${i}" x2="0" y2="1"><stop offset="0" stop-color="${fog}" stop-opacity="0"/><stop offset="1" stop-color="${fog}" stop-opacity=".7"/></linearGradient></defs>
<rect width="1600" height="900" fill="url(#tsky${i})"/>${stars}${sun}${clouds}
<path d="${ridge(r, 470, 150, 9)}" fill="${far}" opacity=".8"/><rect y="300" width="1600" height="300" fill="url(#tfog${i})"/>
<path d="${ridge(r, 560, 120, 12)}" fill="${mid}" opacity=".85"/>${biome}
${landmarkSVG(R.landmark.kind, P, 1320, 700)}
<path d="${hill(720, 60)}" fill="${g2}"/>${townRow(P, r, 735, 1)}
<path d="${hill(800, 40)}" fill="${g1}"/><path d="M0 900V830Q800 770 1600 840V900Z" fill="${hex(mix(P.grass, 0x0a1a10, 0.35))}"/></svg>`;
}

// Ladebildschirm-Inhalt für eine Region (Stadt-Titelkarte).
export function townCard(i, bar, txt) {
  const sum = i === 16;
  const R = REGIONS[Math.min(15, i)];
  return h('div.townload', {},
    h('div.townart-wrap', { html: townArt(i) }),
    h('div.townshade'),
    sparks(10, 11 + i),
    h('div.townlogo', {}, logo('sm')),
    h('div.towncard', {},
      h('div.towneyebrow', {}, sum ? 'Finale · Sternenliga' : 'Region ' + (i + 1) + ' · ' + R.name),
      h('div.townname', {}, sum ? 'Sternengipfel' : R.town),
      sum ? h('div.townsub', {}, 'Halle der Sternenliga') : h('div.townsub', {}, '📍 ' + R.landmark.name),
      sum ? null : h('div.towntypes', {}, R.types.map(t => h('span.type', { style: { background: TYPES[t].color } }, TYPES[t].icon + ' ' + TYPES[t].name))),
      h('div.loadbar', {}, bar), txt));
}

export const LOAD_TIPS = ['Tipp: Typen zählen! Wasser löscht Feuer, Pflanze wurzelt im Wasser, Feuer verbrennt Pflanzen.', 'Tipp: Im hohen Gras raschelt es – dort warten wilde Taschis.', 'Tipp: Mit Google-Anmeldung im Titelmenü folgt dir dein Spielstand auf jedes Gerät.', 'Tipp: Scheue Taschis fliehen, angriffslustige stürmen auf dich zu.', 'Tipp: Rätselhinweise stehen immer in der Welt – schau dir Säulen und Wandbilder genau an.', 'Tipp: Im Heilzentrum werden deine Taschis kostenlos wieder fit.', 'Tipp: Mit 🌐 Online & Freunde tauschst und kämpfst du mit Freunden – per Link oder Code von überall.'];
