/* Prüft alle Produkte: Format, Preise, Duplikate, Kategorien, Mindestzahl günstiger Artikel für den Einkaufswagen (node tests/check-products.js) */
import P from '../products.js';
const errs = [], seen = new Set(), cats = {};
P.forEach((p, i) => { const id = `#${i + 1} „${p.n}"`; cats[p.c] = (cats[p.c] || 0) + 1; if (!(p.p >= 0.3 && p.p <= 60000)) errs.push(`${id}: Preis ${p.p}`); if (Math.abs(Math.round(p.p * 100) / 100 - p.p) > 1e-9) errs.push(`${id}: mehr als 2 Nachkommastellen`); if (!p.e || !p.n || !p.c) errs.push(`${id}: Feld fehlt`); const k = p.n.toLowerCase(); if (seen.has(k)) errs.push(`${id}: doppelt`); seen.add(k); });
const cheap = P.filter(p => p.p <= 16).length; if (cheap < 40) errs.push(`Nur ${cheap} Artikel ≤ 16 € für den Einkaufswagen`);
console.log(`${P.length} Produkte in ${Object.keys(cats).length} Kategorien, ${cheap} davon ≤ 16 € (Einkaufswagen)`); console.log(errs.length ? errs.slice(0, 30).join('\n') + `\n${errs.length} Probleme` : 'Alle Produkte sind in Ordnung'); process.exit(errs.length ? 1 : 0);
