/* Test ohne Browser: Jede Skript-Datei in index.html zählt für den Ladebalken (onload="__ld()"); der Zähler all=N muss stimmen,
   und jede js/*.js-Datei muss eingebunden sein (sonst fehlt Spielinhalt). Aufruf: node bunte-insel/tests/laden.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..'), html = readFileSync(join(dir, 'index.html'), 'utf8');
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const withLd = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*onload="__ld\(\)"/g)].map(m => m[1].split('?')[0]), all = +(/all=(\d+)/.exec(html) || [])[1];
ok(withLd.length === all, 'Ladebalken: ' + withLd.length + ' Skripte mit __ld(), Zähler all=' + all);
const files = readdirSync(join(dir, 'js')).filter(f => f.endsWith('.js') && f !== 'dbg.js').map(f => 'js/' + f), loaded = new Set(withLd), missing = files.filter(f => !loaded.has(f));
ok(!missing.length, 'Alle js-Dateien sind eingebunden' + (missing.length ? ' – fehlt: ' + missing.join(', ') : ''));
ok(new Set(withLd).size === withLd.length, 'Keine Skript-Datei doppelt eingebunden');
ok(html.includes('if(box)box.appendChild(b)'), 'Startfehler-Button wird auch nach ausgetauschtem Ladebildschirm sicher eingefügt');
ok(html.includes('data-mount="#cloudLoginMount"') && html.includes('id="cloudLoginMount"'), 'Google-Login sitzt im Hauptmenü statt als schwebender Knopf');
console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
