/* Hörerwahl – Antwort-Erkennung: tolerant gegenüber Schreibweise, Artikeln, Plural und kleinen Tippfehlern. Rein, ohne DOM. */
export const norm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/ae\b/g, 'a').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const FILL = new Set(['der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'mein', 'meine', 'meinen', 'dein', 'deine', 'den', 'dem', 'des', 'ne', 'nen', 'so', 'sowas', 'etwas', 'was', 'zu', 'zum', 'zur', 'im', 'in', 'am', 'an', 'auf', 'mit', 'und', 'oder', 'ganz', 'sehr', 'mal', 'halt', 'eben', 'wohl', 'ich', 'man', 'wir', 'viel', 'viele', 'bisschen']);
const strip = s => norm(s).split(' ').filter(w => w && !FILL.has(w)).join(' ');
// einfache Wortstamm-Kürzung (Plural/Endungen): "autos"→"auto", "katzen"→"katz", "hunde"→"hund"
export const stem = w => { if (w.length <= 3) return w; let r = w; for (const suf of ['ern', 'en', 'er', 'es', 'e', 'n', 's']) if (r.length - suf.length >= 3 && r.endsWith(suf)) { r = r.slice(0, -suf.length); break; } return r; };
const stemAll = s => s.split(' ').map(stem).join(' ');
export function lev(a, b, max) {
  if (a === b) return 0; if (Math.abs(a.length - b.length) > max) return max + 1; let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; let rowMin = i; for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < rowMin) rowMin = v; } if (rowMin > max) return max + 1; prev = cur; }
  return prev[b.length];
}
// Toleranz je nach Länge: kurz = exakt, mittel = 1 Fehler, lang = 2 Fehler
const tol = n => (n <= 4 ? 0 : n <= 8 ? 1 : 2);
/** Baut einen Prüfer für eine Frage. answers: [{t, p, alt?:[]}]. match(text) → {idx, score} | null (nichts/uneindeutig) */
export function makeMatcher(answers) {
  const forms = []; answers.forEach((a, idx) => [a.t, ...(a.alt || [])].forEach(s => { const n = strip(s) || norm(s); if (n) forms.push({ idx, n, st: stemAll(n), words: n.split(' ') }); }));
  return function match(text) {
    const raw = norm(text); if (!raw) return null; const q = strip(text) || raw, qs = stemAll(q), qw = q.split(' '), best = new Map();   // idx → bester Score
    const put = (idx, sc) => { if (!best.has(idx) || best.get(idx) < sc) best.set(idx, sc); };
    for (const f of forms) {
      if (q === f.n || raw === f.n) put(f.idx, 100);
      else if (qs === f.st) put(f.idx, 92);
      else {
        // Eingabe enthält die Antwort als ganzes Wort/Phrase ("ein schöner garten" → "garten") oder umgekehrt bei mehrteiligen Antworten
        const sq = ' ' + qs + ' ', sf = ' ' + f.st + ' '; if (f.st.length >= 3 && sq.includes(sf)) put(f.idx, 84);
        else if (qw.length === 1 && q.length >= 4 && f.words.length > 1 && f.words.some(w => stem(w) === stem(q) && w.length >= 4)) put(f.idx, 70);
        else { const m = tol(Math.min(qs.length, f.st.length)); if (m > 0) { const d = lev(qs, f.st, m); if (d <= m) put(f.idx, 78 - d * 6); } }
      }
    }
    if (!best.size) return null; const arr = [...best.entries()].sort((a, b) => b[1] - a[1]); if (arr.length > 1 && arr[0][1] - arr[1][1] < 6 && arr[0][1] < 100) return null;
    return { idx: arr[0][0], score: arr[0][1] };
  };
}
