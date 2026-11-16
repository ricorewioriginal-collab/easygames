// TikTok-Geschenke mit echten Bildern für die TikTok-LIVE-Einstellungen (stream-tiktok.js, Windows-App):
// liest die täglich aktualisierte Geschenkeliste von streamtoearn.io (englische Namen wie in den LIVE-Ereignissen) und schreibt
// tiktok-gifts.json: [{ name, coins, img }] – die Bilder liegen auf TikToks eigenem Server (p16-webcast.tiktokcdn.com).
// Läuft täglich im Workflow .github/workflows/tiktok-gifts.yml.
//   node tools/tiktok-gifts.mjs [--file seite.html] [--out tiktok-gifts.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SRC = 'https://streamtoearn.io/gifts';
const OUT = path.resolve(arg('--out', path.join(ROOT, 'tiktok-gifts.json')));

const html = arg('--file') ? fs.readFileSync(arg('--file'), 'utf8')
  : await (await fetch(SRC, { headers: { 'User-Agent': 'Mozilla/5.0 (easygames TikTok-Geschenkeliste)' } })).text();
const unesc = s => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
const rx = /<div class="gift"[^>]*>\s*<img\s+src="(https:\/\/[^"]+\.tiktokcdn\.com\/[^"]+)"[\s\S]*?<p class="gift-name">([\s\S]*?)<\/p>\s*<p class="gift-price">\s*([\d.,]+)/g;
const seen = new Map();
for (const m of html.matchAll(rx)) {
  const name = unesc(m[2]), coins = parseInt(m[3].replace(/[.,]/g, ''), 10) || 0;
  if (!name || seen.has(name.toLowerCase())) continue;   // regionale Doppelungen: erster Eintrag gilt
  seen.set(name.toLowerCase(), { name, coins, img: m[1] });
}
const gifts = [...seen.values()].sort((a, b) => a.coins - b.coins || a.name.localeCompare(b.name));
// Schutz gegen eine geänderte Seite: lieber die alte Liste behalten als eine leere oder halbe schreiben
const old = (() => { try { return JSON.parse(fs.readFileSync(OUT, 'utf8')).gifts || []; } catch (e) { return []; } })();
if (gifts.length < 100 || !gifts.some(g => g.name === 'Rose') || gifts.length < old.length * 0.6) {
  console.error('Geschenkeliste unvollständig (' + gifts.length + ' Einträge) – tiktok-gifts.json bleibt unverändert.');
  process.exit(1);
}
const same = old.length === gifts.length && old.every((g, i) => g.name === gifts[i].name && g.coins === gifts[i].coins && g.img === gifts[i].img);
if (same) { console.log('Unverändert (' + gifts.length + ' Geschenke).'); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify({ source: SRC, updated: new Date().toISOString().slice(0, 10), gifts }) + '\n');
console.log(gifts.length + ' Geschenke geschrieben: ' + path.relative(ROOT, OUT));
