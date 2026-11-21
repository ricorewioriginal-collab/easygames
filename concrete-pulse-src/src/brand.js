// Name und Marke des Spiels – nur hier ändern. Ordner, Spiel-ID und Spielstand bleiben „concrete-pulse“.
export const BRAND = {
  name: 'Skate Legends',
  words: ['Skate', 'Legends'],
  tagline: 'Arcade-Skateboarding · fünf Parks · Combos ohne Ende',
  version: '2.0'
};
// Wortmarke als HTML (eigene Gestaltung: Unbounded-Schrift, Schräglage, Verlauf, Brett-Emblem)
export function logoHTML(big = true) {
  return `<span class="lg-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><defs><linearGradient id="lgG${big ? 1 : 0}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd43a"/><stop offset=".55" stop-color="#ff5a3c"/><stop offset="1" stop-color="#b44dff"/></linearGradient></defs>`
    + `<g transform="rotate(-28 32 32)"><rect x="9" y="24" width="46" height="16" rx="8" fill="url(#lgG${big ? 1 : 0})"/><rect x="13" y="28" width="38" height="8" rx="4" fill="#0b0d14" opacity=".28"/>`
    + `<circle cx="18" cy="44" r="4" fill="#fff"/><circle cx="46" cy="44" r="4" fill="#fff"/></g><path d="M32 6l3.2 6.6 7.2 1-5.2 5 1.3 7.2L32 22.4l-6.5 3.4 1.3-7.2-5.2-5 7.2-1z" fill="#fff"/></svg></span>`
    + `<span class="lg-w"><span class="lg-1">${BRAND.words[0]}</span><span class="lg-2">${BRAND.words[1]}</span></span>`;
}
export function applyBrand() {
  document.title = BRAND.name + ' – Arcade-Skateboarding';
  document.querySelectorAll('[data-logo]').forEach(el => { el.innerHTML = logoHTML(el.dataset.logo !== 'small'); el.setAttribute('aria-label', BRAND.name); });
  document.querySelectorAll('[data-brand]').forEach(el => { el.textContent = el.dataset.brand === 'tag' ? BRAND.tagline : el.dataset.brand === 'ver' ? 'v' + BRAND.version : BRAND.name; });
}
