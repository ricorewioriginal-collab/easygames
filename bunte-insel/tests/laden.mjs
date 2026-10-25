/* Test ohne Browser: Jede Skript-Datei in index.html zählt für den Ladebalken (onload="__ld()"); der Zähler all=N muss stimmen,
   und jede js/*.js-Datei muss eingebunden sein (sonst fehlt Spielinhalt). Aufruf: node bunte-insel/tests/laden.mjs */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), '..'), html = readFileSync(join(dir, 'index.html'), 'utf8');
let fails = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
/* Spieldateien stehen in window.BI_FILES (einzeln geladen lokal/?dev=1, sonst als Bündel js/bunte-insel.min.js); dazu three.min.js mit onload="__ld()" */
const tags = [...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*onload="__ld\(\)"/g)].map(m => m[1].split('?')[0]).filter(s => !s.includes("'")), all = +(/all=(\d+)/.exec(html) || [])[1];
const biM = /window\.BI_FILES=\[([^\]]*)\]/.exec(html), bi = biM ? [...biM[1].matchAll(/'([^']+)'/g)].map(m => m[1].split('?')[0]) : [], withLd = tags.concat(bi);
ok(bi.length > 50, 'Spieldateien-Liste BI_FILES gefunden (' + bi.length + ')');
ok(withLd.length === all, 'Ladebalken: ' + withLd.length + ' Skripte (three + BI_FILES), Zähler all=' + all);
const files = readdirSync(join(dir, 'js')).filter(f => f.endsWith('.js') && f !== 'dbg.js' && f !== 'bunte-insel.min.js').map(f => 'js/' + f), loaded = new Set(withLd), missing = files.filter(f => !loaded.has(f));
ok(!missing.length, 'Alle js-Dateien sind eingebunden' + (missing.length ? ' – fehlt: ' + missing.join(', ') : ''));
ok(new Set(withLd).size === withLd.length, 'Keine Skript-Datei doppelt eingebunden');
ok(/bunte-insel\.min\.js\?v='\+V\+'" onload="__ldAll\(\)" onerror="__biFallback\(\)"/.test(html) && html.includes('window.__ldAll='), 'Bündel zählt den Ladebalken voll, bei Fehler kommen die einzelnen Dateien');
ok(html.includes("querySelector('.ldBox')||screen") && html.includes('target.appendChild(btn)'), 'Startfehler-Button wird auch nach ausgetauschtem Ladebildschirm sicher eingefügt');
ok(html.includes('data-mount="#cloudLoginMount"') && html.includes('id="cloudLoginMount"'), 'Google-Login sitzt im Hauptmenü statt als schwebender Knopf');
console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
