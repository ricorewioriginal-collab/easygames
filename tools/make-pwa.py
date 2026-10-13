#!/usr/bin/env python3
"""Macht jedes Spiel aus games.js als PWA installierbar (mobil, mit automatischem Update).

    python3 tools/make-pwa.py            # alle Spiele
    python3 tools/make-pwa.py --check    # nur prüfen (Exit-Code 1, wenn etwas fehlt oder veraltet ist)
    python3 tools/make-pwa.py wobbel …   # nur diese Ordner

Pro Spiel (Ordner = path aus games.js):
  - manifest.webmanifest   Name, Farben, Symbole, Vollbild
  - sw.js                  Service Worker: Netz zuerst (Updates kommen sofort an), bei Ausfall/Langsamkeit aus dem Cache
  - index.html             Block <!--pwa-->…<!--/pwa--> direkt nach <head>: Manifest-Link, Meta-Tags und ein kleiner Registrierungs-/
                           Installationshinweis (wird bei jedem Lauf ersetzt, ist also idempotent; nach einem Vite-Build erneut ausführen)
  - ../pwa-icons/<id>-*.png  Symbole (aus card.png, sonst Farbverlauf mit Kürzel) – benötigt Pillow (pip install pillow)
Spiele mit eigener PWA (eigenes manifest.webmanifest vor dem ersten Lauf, z. B. prismrush, wobbel) bleiben unverändert (Liste EIGENE).
Der Installationshinweis erscheint nicht in iframes (Einbindung), nicht in den RicoReWi-Apps/Windows-App und nicht im installierten Fenster.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EIGENE = {'prismrush', 'wobbel'}          # haben ein eigenes Manifest + eigenen Service Worker
CACHE_VERSION = {'bunte-insel': 8} # andere Spiele erhalten beim nächsten make-pwa-Lauf v2          # Versionssprung löscht veraltete Offline-Dateien dieses Spiels
MARK = re.compile(r'\n?<!--pwa-->.*?<!--/pwa-->', re.S)


def games():
    src = open(os.path.join(ROOT, 'games.js'), encoding='utf-8').read()
    out = []
    for m in re.finditer(r"\{\s*id:\s*'([^']+)',\s*title:\s*'((?:[^'\\]|\\.)*)'(.*?)\bpath:\s*'([^']*)'", src, re.S):
        gid, title, mid, path = m.group(1), m.group(2).replace("\\'", "'"), m.group(3), m.group(4)
        if re.match(r'^[a-z]+://', path):
            continue
        bg = re.search(r"\bbg:\s*'([^']*)'", mid)
        cols = re.findall(r'#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}\b', bg.group(1)) if bg else []
        out.append({'id': gid, 'title': title, 'dir': path.strip('/'), 'colors': [hexrgb(c) for c in cols] or [(122, 60, 255), (25, 240, 255)]})
    return out


def hexrgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def tohex(c):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(v))) for v in c)


def dark(c, f):
    return tuple(v * f for v in c)


def short(title):
    t = re.sub(r'^AnMaCha\s+', '', title.split(' – ')[0].strip(), flags=re.I)
    return t if len(t) <= 14 else t[:13].rstrip() + '…'


def manifest(g):
    c = g['colors'][0]
    return {
        'id': './', 'name': g['title'], 'short_name': short(g['title']), 'lang': 'de',
        'start_url': './', 'scope': './',
        'display': 'fullscreen', 'display_override': ['fullscreen', 'standalone'],
        'background_color': tohex(dark(c, .22)), 'theme_color': tohex(dark(c, .32)),
        'categories': ['games'],
        'icons': [
            {'src': '../pwa-icons/%s-192.png' % g['id'], 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': '../pwa-icons/%s-512.png' % g['id'], 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': '../pwa-icons/%s-maskable-512.png' % g['id'], 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        ],
    }


SW = r"""/* %(title)s – Service Worker (erzeugt von tools/make-pwa.py, nicht von Hand ändern).
   Netz zuerst: jeder Start holt den aktuellen Stand (der Browser prüft per ETag, große Dateien kommen bei „unverändert“ nicht neu).
   Fällt das Netz aus oder antwortet es länger als 4 s, kommt die zuletzt geladene Fassung aus dem Cache – so läuft das Spiel auch offline,
   sobald es einmal gespielt wurde (auch Bibliotheken von CDNs). Ein neues Spiel wird erst nach Klick aktiviert; alte Zwischenspeicher werden dann gelöscht. */
const CACHE = 'eg-%(id)s-v%(cache_version)s';
self.addEventListener('install', () => {});\nself.addEventListener('message', e => { if (e.data && e.data.type === 'EG_SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('eg-%(id)s-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || req.headers.has('range')) return;
  if (url.origin !== location.origin) {   // Bibliotheken/Schriften von bekannten CDNs (versionierte Adressen): einmal laden, danach aus dem Cache
    if (!/(^|\.)(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.hostname)) return;
    e.respondWith(caches.open(CACHE).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(cache => cache.match(req, { ignoreSearch: req.mode === 'navigate' }).then(hit => {
    const net = fetch(req).then(res => { if (res.ok && res.status === 200) cache.put(req, res.clone()); return res; });
    if (!hit) return net;
    return Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]).catch(() => hit);
  })));
});
"""

REG = """<script>(function(){var ua=navigator.userAgent,fr=false;try{fr=top!==self}catch(e){fr=true}
if(fr||/RicoReWiApp/.test(ua)||location.hostname==='appassets.local'||(location.protocol!=='https:'&&location.hostname!=='localhost'))return;
var sa=matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches||navigator.standalone;
if('serviceWorker' in navigator)addEventListener('load',function(){var reloadAfterUpdate=false,offered=false;navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){function offer(w){if(offered||!w)return;offered=true;var d=document.createElement('div'),b=document.createElement('button'),t=document.createElement('span');d.id='egUpdate';d.setAttribute('role','status');d.style.cssText='position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);padding:10px 12px 10px 16px;background:#102747;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:18px;box-shadow:0 8px 28px rgba(0,0,0,.35);font:600 14px system-ui,sans-serif';t.textContent='✨ Ein Update ist bereit';b.type='button';b.textContent='Jetzt aktualisieren';b.style.cssText='border:0;border-radius:12px;padding:9px 12px;background:#ff9e28;color:#fff;font:700 14px system-ui,sans-serif;cursor:pointer';b.onclick=function(){reloadAfterUpdate=true;b.disabled=true;b.textContent='Lädt …';w.postMessage({type:'EG_SKIP_WAITING'})};d.append(t,b);document.body.appendChild(d)}function check(){if(r.waiting&&navigator.serviceWorker.controller)offer(r.waiting)}check();r.addEventListener('updatefound',function(){var w=r.installing;if(!w)return;w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller)offer(w)})});navigator.serviceWorker.addEventListener('controllerchange',function(){if(reloadAfterUpdate)location.reload()});document.addEventListener('visibilitychange',function(){if(!document.hidden)try{r.update()}catch(e){}})}).catch(function(){})});
var dp=null,K='egPwaHide';
function hid(){try{return Date.now()-(+localStorage.getItem(K)||0)<6048e5}catch(e){return false}}
addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;if(sa||hid())return;setTimeout(pill,4000)});
addEventListener('appinstalled',function(){var p=document.getElementById('egPwa');if(p)p.remove()});
function pill(){if(!dp||document.getElementById('egPwa'))return;var d=document.createElement('div');d.id='egPwa';
d.style.cssText='position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;display:flex;gap:2px;align-items:center;background:rgba(10,12,30,.92);color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:999px;font:600 13px system-ui,sans-serif;box-shadow:0 4px 18px rgba(0,0,0,.45)';
var b=document.createElement('button'),x=document.createElement('button');
b.textContent='\\ud83d\\udcf2 Als App installieren';x.textContent='\\u2715';x.setAttribute('aria-label','Hinweis schließen');
b.style.cssText='all:unset;cursor:pointer;padding:9px 6px 9px 14px';x.style.cssText='all:unset;cursor:pointer;padding:9px 13px 9px 8px;opacity:.7';
b.onclick=function(){d.remove();dp.prompt();dp=null};x.onclick=function(){d.remove();try{localStorage.setItem(K,Date.now())}catch(e){}};
d.append(b,x);document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove()},15000)}})();</script>"""


def block(g):
    c = g['colors'][0]
    return ('<!--pwa--><link rel="manifest" href="manifest.webmanifest">%s'
            '<link rel="apple-touch-icon" href="../pwa-icons/%s-180.png">'
            '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">'
            '<meta name="apple-mobile-web-app-title" content="%s">%s<!--/pwa-->') % (
        '<meta name="theme-color" content="%s">' % tohex(dark(c, .32)),
        g['id'], short(g['title']).replace('"', '&quot;'), REG)


def patch_html(g, html):
    html = MARK.sub('', html)
    m = re.search(r'<head(?=[\s>])[^>]*>', html, re.I)
    if not m:
        raise SystemExit('%s: kein <head> in index.html' % g['dir'])
    b = block(g)
    if re.search(r'<meta[^>]+name=["\']theme-color["\']', html, re.I):      # vorhandene Themenfarbe des Spiels behalten
        b = b.replace('<meta name="theme-color" content="%s">' % tohex(dark(g['colors'][0], .32)), '')
    return html[:m.end()] + '\n' + b + html[m.end():]


def icons(g):
    from PIL import Image, ImageDraw, ImageFont
    d = os.path.join(ROOT, g['dir'])
    c1, c2 = g['colors'][0], g['colors'][1] if len(g['colors']) > 1 else g['colors'][0]
    card = next((os.path.join(d, n) for n in ('card.png',) if os.path.isfile(os.path.join(d, n))), None)
    if card:
        art = Image.open(card).convert('RGBA')
        w = min(art.size)
        art = art.crop(((art.width - w) // 2, (art.height - w) // 2, (art.width - w) // 2 + w, (art.height - w) // 2 + w))
    else:   # Farbverlauf + Kürzel
        art = Image.new('RGBA', (512, 512))
        px = art.load()
        for y in range(512):
            for x in range(512):
                t = (x + y) / 1022.0
                px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)) + (255,)
        words = [w for w in re.sub(r'^AnMaCha\s+', '', g['title'].split(' – ')[0], flags=re.I).replace('!', '').split() if re.match(r'[A-Za-zÄÖÜäöü]', w)]
        txt = (words[0][0] + words[1][0] if len(words) > 1 else words[0][:2] if words else g['id'][:2]).upper()
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 230)
        dr = ImageDraw.Draw(art)
        bb = dr.textbbox((0, 0), txt, font=f)
        dr.text(((512 - (bb[2] - bb[0])) / 2 - bb[0], (512 - (bb[3] - bb[1])) / 2 - bb[1]), txt, font=f, fill=(255, 255, 255, 255),
                stroke_width=6, stroke_fill=tuple(int(v * .35) for v in c1) + (255,))
    out = os.path.join(ROOT, 'pwa-icons')
    os.makedirs(out, exist_ok=True)

    def flat(size, scale=1.0):   # deckender Hintergrund (Farbverlauf-Mittelwert), Motiv zentriert
        bgc = tuple(int((c1[i] + c2[i]) / 2 * .55) for i in range(3)) + (255,)
        im = Image.new('RGBA', (size, size), bgc)
        s = int(size * scale)
        a = art.resize((s, s), Image.LANCZOS)
        im.alpha_composite(a, ((size - s) // 2, (size - s) // 2))
        return im.convert('RGB').quantize(256, method=Image.MEDIANCUT, dither=Image.NONE).convert('P')
    flat(512).save(os.path.join(out, '%s-512.png' % g['id']), optimize=True)
    flat(192).save(os.path.join(out, '%s-192.png' % g['id']), optimize=True)
    flat(180, .92).save(os.path.join(out, '%s-180.png' % g['id']), optimize=True)
    flat(512, .72).save(os.path.join(out, '%s-maskable-512.png' % g['id']), optimize=True)   # Sicherheitszone für runde/eckige Masken


def write(path, text, check, problems):
    old = open(path, encoding='utf-8').read() if os.path.isfile(path) else None
    if old == text:
        return
    if check:
        problems.append(os.path.relpath(path, ROOT) + (' fehlt' if old is None else ' ist veraltet'))
    else:
        open(path, 'w', encoding='utf-8').write(text)


def main():
    args = sys.argv[1:]
    check = '--check' in args
    only = [a for a in args if not a.startswith('-')]
    problems, n = [], 0
    for g in games():
        if only and g['dir'] not in only and g['id'] not in only:
            continue
        d = os.path.join(ROOT, g['dir'])
        if g['id'] in EIGENE or g['dir'] in EIGENE:
            continue
        idx = os.path.join(d, 'index.html')
        if not os.path.isfile(idx):
            problems.append(g['dir'] + '/index.html fehlt')
            continue
        n += 1
        write(os.path.join(d, 'manifest.webmanifest'), json.dumps(manifest(g), ensure_ascii=False, indent=2) + '\n', check, problems)
        write(os.path.join(d, 'sw.js'), SW % {'id': g['id'], 'title': g['title'].replace('*/', ''), 'cache_version': CACHE_VERSION.get(g['id'], 2)}, check, problems)
        html = open(idx, encoding='utf-8').read()
        write(idx, patch_html(g, html), check, problems)
        need = [os.path.join(ROOT, 'pwa-icons', '%s-%s.png' % (g['id'], s)) for s in ('192', '512', '180', 'maskable-512')]
        if check:
            problems += [os.path.relpath(p, ROOT) + ' fehlt' for p in need if not os.path.isfile(p)]
        elif not all(os.path.isfile(p) for p in need) or '--icons' in args:
            icons(g)
    print('%d Spiele %s: %s' % (n, 'geprüft' if check else 'bearbeitet', 'alles in Ordnung' if not problems else '%d Probleme' % len(problems)))
    for p in problems:
        print('  - ' + p)
    sys.exit(1 if problems and check else 0)


if __name__ == '__main__':
    main()
