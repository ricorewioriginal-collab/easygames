/* Urwaldlager – gezeichnete Kandidaten-Porträts (SVG, ohne Bilddateien) */
(function (root) {
  'use strict';
  function shade(hex, a) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a)));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  // mood: n (neutral) | happy | scared | gag | sad | cool
  function svg(c, mood, cls) {
    mood = mood || 'n'; const sk = c.skin, hr = c.hair, hs = c.hs || 'short', top = c.top, acc = c.acc || [], dk = shade(hr, -.25);
    let s = `<svg viewBox="0 0 100 110" class="av ${cls || ''}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">`;
    s += `<path d="M6 112C6 88 24 78 50 78s44 10 44 34z" fill="${top}"/>`;
    s += `<path d="M36 79 50 96 64 79z" fill="${shade(sk, -.18)}"/><path d="M37 79 50 92 63 79" fill="none" stroke="${shade(top, -.3)}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<rect x="41" y="60" width="18" height="24" rx="7" fill="${shade(sk, -.14)}"/>`;
    // Haare hinten
    if (hs === 'long') s += `<path d="M25 40C17 70 19 94 30 99L70 99C81 94 83 70 75 40Z" fill="${hr}"/>`;
    if (hs === 'curly') s += `<g fill="${hr}"><circle cx="27" cy="52" r="9"/><circle cx="73" cy="52" r="9"/><circle cx="24" cy="38" r="10"/><circle cx="76" cy="38" r="10"/></g>`;
    if (hs === 'pony') s += `<path d="M70 26C90 26 92 62 82 76C80 62 76 50 68 42Z" fill="${hr}"/>`;
    if (hs === 'bun') s += `<circle cx="50" cy="9" r="10" fill="${hr}"/>`;
    // Ohren + Kopf
    s += `<ellipse cx="27" cy="48" rx="4.5" ry="6.5" fill="${shade(sk, -.08)}"/><ellipse cx="73" cy="48" rx="4.5" ry="6.5" fill="${shade(sk, -.08)}"/>`;
    s += `<ellipse cx="50" cy="44" rx="23" ry="26" fill="${sk}"/>`;
    if (mood === 'gag') s += `<ellipse cx="50" cy="44" rx="23" ry="26" fill="#8fd14f" opacity=".42"/>`;
    if (acc.includes('ring')) s += `<circle cx="26.5" cy="56" r="2.6" fill="none" stroke="#ffd24a" stroke-width="1.6"/><circle cx="73.5" cy="56" r="2.6" fill="none" stroke="#ffd24a" stroke-width="1.6"/>`;
    // Haare vorn
    const fringe = `<path d="M26 43C22 18 40 11 51 11C64 11 79 19 74 43C71 33 64 27 52 27C40 27 31 32 26 43Z" fill="${hr}"/>`;
    if (hs === 'short' || hs === 'long' || hs === 'bun' || hs === 'pony') s += fringe;
    if (hs === 'curly') s += `<g fill="${hr}"><circle cx="33" cy="26" r="11"/><circle cx="45" cy="19" r="12"/><circle cx="58" cy="19" r="12"/><circle cx="69" cy="27" r="11"/><circle cx="50" cy="26" r="11"/></g>`;
    if (hs === 'cap') s += `<path d="M26 40C24 12 76 12 74 40Z" fill="#1f2937"/><path d="M24 38L84 38 84 43 24 43Z" fill="#111827"/><circle cx="50" cy="16" r="2.4" fill="#ffd24a"/>`;
    if (hs === 'bald') s += `<ellipse cx="42" cy="26" rx="8" ry="3.4" fill="#fff" opacity=".18" transform="rotate(-25 42 26)"/>`;
    // Bart
    if (acc.includes('beard')) s += `<path d="M27 50C27 76 73 76 73 50C69 62 61 68 50 68C39 68 31 62 27 50Z" fill="${dk}"/>`;
    // Augen
    const ex = [40.5, 59.5]; let eyes = '', brows = '', mouth = '';
    if (mood === 'gag') {
      eyes = ex.map(x => `<path d="M${x - 5} 47Q${x} 42 ${x + 5} 47" fill="none" stroke="#222" stroke-width="2.4" stroke-linecap="round"/>`).join('');
      brows = `<path d="M34 39L46 42M66 39L54 42" stroke="${dk}" stroke-width="2.6" stroke-linecap="round"/>`;
      mouth = `<path d="M40 61Q43 56 46 61T52 61T60 61Q56 68 50 68Q44 68 40 61Z" fill="#6a1e1e" stroke="#2a0b0b" stroke-width="1"/><path d="M47 66Q50 74 53 66Z" fill="#86d63a"/>`;
    } else if (mood === 'scared') {
      eyes = ex.map(x => `<circle cx="${x}" cy="46" r="6" fill="#fff" stroke="#222" stroke-width="1"/><circle cx="${x}" cy="46.5" r="2.4" fill="#222"/>`).join('');
      brows = `<path d="M33 36L46 39M67 36L54 39" stroke="${dk}" stroke-width="2.6" stroke-linecap="round" transform="translate(0,-1)"/>`;
      mouth = `<ellipse cx="50" cy="62" rx="5.5" ry="7" fill="#5a1a1a" stroke="#2a0b0b" stroke-width="1"/>`;
    } else if (mood === 'happy') {
      eyes = ex.map(x => `<path d="M${x - 4.6} 47Q${x} 40.5 ${x + 4.6} 47" fill="none" stroke="#222" stroke-width="2.6" stroke-linecap="round"/>`).join('');
      brows = `<path d="M35 37Q40 34 46 37M54 37Q60 34 65 37" fill="none" stroke="${dk}" stroke-width="2.4" stroke-linecap="round"/>`;
      mouth = `<path d="M38 57Q50 72 62 57Z" fill="#fff" stroke="#6a1e1e" stroke-width="1.6" stroke-linejoin="round"/><path d="M42 62Q50 69 58 62" fill="#e05a5a" opacity=".6"/>`;
    } else if (mood === 'sad') {
      eyes = ex.map(x => `<circle cx="${x}" cy="47" r="3.6" fill="#fff" stroke="#222" stroke-width=".8"/><circle cx="${x}" cy="48" r="2" fill="#222"/>`).join('') + `<path d="M36 52q-1 5 1 8" stroke="#7ec8ff" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      brows = `<path d="M35 40L46 36M65 40L54 36" stroke="${dk}" stroke-width="2.4" stroke-linecap="round"/>`;
      mouth = `<path d="M42 64Q50 57 58 64" fill="none" stroke="#6a1e1e" stroke-width="2.4" stroke-linecap="round"/>`;
    } else if (mood === 'cool') {
      eyes = ex.map(x => `<circle cx="${x}" cy="46" r="3.6" fill="#fff" stroke="#222" stroke-width=".8"/><circle cx="${x + 1}" cy="46.5" r="2" fill="#222"/>`).join('');
      brows = `<path d="M35 38L46 37M54 36L65 38" stroke="${dk}" stroke-width="2.6" stroke-linecap="round"/>`;
      mouth = `<path d="M41 60Q50 66 60 57" fill="none" stroke="#6a1e1e" stroke-width="2.4" stroke-linecap="round"/>`;
    } else {
      eyes = ex.map(x => `<circle cx="${x}" cy="46" r="3.9" fill="#fff" stroke="#222" stroke-width=".8"/><circle cx="${x}" cy="46.5" r="2.1" fill="#222"/>`).join('');
      brows = `<path d="M35 38Q40 35 46 38M54 38Q60 35 65 38" fill="none" stroke="${dk}" stroke-width="2.4" stroke-linecap="round"/>`;
      mouth = `<path d="M43 61Q50 66 57 61" fill="none" stroke="#6a1e1e" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    s += `<circle cx="35" cy="56" r="4.6" fill="#ff7a8a" opacity=".22"/><circle cx="65" cy="56" r="4.6" fill="#ff7a8a" opacity=".22"/>`;
    s += `<path d="M50 48Q47 54 50 56" fill="none" stroke="${shade(sk, -.25)}" stroke-width="1.6" stroke-linecap="round"/>`;
    s += eyes + brows + mouth;
    if (acc.includes('glasses')) s += `<g fill="rgba(255,255,255,.12)" stroke="#222" stroke-width="2"><circle cx="40.5" cy="46" r="8"/><circle cx="59.5" cy="46" r="8"/><path d="M48.5 46H51.5" fill="none"/></g>`;
    return s + '</svg>';
  }
  root.Avatar = { svg, shade };
  if (typeof module !== 'undefined') module.exports = root.Avatar;
})(typeof window !== 'undefined' ? window : globalThis);
