#!/usr/bin/env python3
# Brücke TikTok LIVE → easygames-Stream-Overlay (stream.html?game=<id>&tiktok=1) – zweite Möglichkeit neben tools/tiktok-bridge.mjs,
# mit der Python-Bibliothek TikTokLive (https://github.com/isaackogan/TikTokLive). Gleiches Protokoll, gleicher Port, gleiche
# Belegungsdatei – Overlay, Einstellungen und Windows-App merken keinen Unterschied.
#
#   pip install TikTokLive                     einmalig (Python 3.10+)
#   python tools/tiktok-bridge.py DEIN_NAME    verbindet sich mit deinem LIVE, sobald du live bist (versucht es alle 30 s)
#   python tools/tiktok-bridge.py --demo       Test ohne TikTok: zufällige Kommentare, Geschenke und Likes
#   Optionen: --port 21213  --config <datei> (Standard: tiktok-config.json neben diesem Skript)
#
# ws://127.0.0.1:<port> (nur dieser Rechner). An das Overlay: {type:'event', ev}, {type:'config', config}, {type:'status', msg},
# {type:'gifts', list}. Vom Overlay: {type:'getConfig'}, {type:'setConfig', config}, {type:'inject', ev} (Test).
# Ereignis: {type:'chat'|'gift'|'like'|'follow'|'share'|'sub'|'join', user, pic, handle, text, gift, giftId, count, diamonds, img}
import asyncio, json, os, random, sys, time

try:
    import websockets
except ImportError:
    print('Bitte zuerst ausführen:  pip install TikTokLive', file=sys.stderr); sys.exit(2)

argv = sys.argv[1:]
def opt(k, d):
    return argv[argv.index(k) + 1] if k in argv and argv.index(k) + 1 < len(argv) else d
PORT = int(opt('--port', 21213))
CONFIG = os.path.abspath(opt('--config', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tiktok-config.json')))
USER = next((a for i, a in enumerate(argv) if not a.startswith('--') and (i == 0 or argv[i - 1] not in ('--port', '--config'))), None)
DEMO, TEST = '--demo' in argv, '--test' in argv

clients = set()
gifts = []
status = 'Demo-Modus' if DEMO else 'Testmodus' if TEST else 'Warte auf LIVE von @' + str(USER)

def log(s):
    print(time.strftime('%H:%M:%S') + '  ' + s, flush=True)

def read_config():
    try:
        with open(CONFIG, encoding='utf-8') as f: return json.load(f)
    except Exception: return None

async def send(ws, obj):
    try: await ws.send(json.dumps(obj, ensure_ascii=False))
    except Exception: pass

def broadcast(obj):
    for c in list(clients): asyncio.ensure_future(send(c, obj))

def emit(ev):
    broadcast({'type': 'event', 'ev': ev})
    log(ev.get('type', '') + '  ' + str(ev.get('user') or '') + '  ' + str(ev.get('text') or ev.get('gift') or ev.get('count') or ''))

def set_status(s):
    global status
    status = s; log(s); broadcast({'type': 'status', 'msg': s})

# Sound-Bibliothek von myinstants.com für die TikTok-Einstellungen (🔊 Sounds) – wie sounds() in tiktok-bridge.mjs und
# github.com/abdipr/myinstants-api (MIT): search, trending, best, recent, detail, uploaded, favorites; Antworten 1 Stunde zwischengespeichert.
import re, html as _html, urllib.request, urllib.parse, urllib.error
MI = 'https://www.myinstants.com'
_mi_cache = {}

def _mi_text(s):
    return re.sub(r'\s+', ' ', _html.unescape(re.sub(r'<[^>]*>', '', str(s or '')))).strip()

def _mi_get(url):
    hit = _mi_cache.get(url)
    if hit and time.time() - hit[0] < 3600: return hit[1]
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'en'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r: h = r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        if e.code == 404: return ''
        if e.code == 403: raise Exception('myinstants lässt diese Seite gerade nicht zu (403) – Profile gehen teils nur im Browser')
        raise Exception('myinstants: HTTP ' + str(e.code))
    if len(_mi_cache) > 200: _mi_cache.clear()
    _mi_cache[url] = (time.time(), h)
    return h

def _mi_list(h):
    out, seen = [], set()
    for b in h.split('<div class="instant"')[1:]:
        a = re.search(r'<a[^>]*href="(/[a-z-]+/instant/[^"]+)"[^>]*class="instant-link[^"]*"[^>]*>([\s\S]*?)</a>|<a[^>]*class="instant-link[^"]*"[^>]*href="(/[a-z-]+/instant/[^"]+)"[^>]*>([\s\S]*?)</a>', b)
        p = re.search(r"play\('([^']+)'", b)
        if not a or not p: continue
        href = a.group(1) or a.group(3)
        sid = re.sub(r'/$', '', re.sub(r'^/[a-z-]+/instant/', '', href))
        if sid in seen: continue
        seen.add(sid)
        out.append({'id': sid, 'title': _mi_text(a.group(2) or a.group(4)), 'url': MI + href, 'mp3': MI + p.group(1)})
    t = re.search(r'Page\s+\d+\s+of\s+(\d+)', h, re.I)
    return out, (int(t.group(1)) if t else None)

def sounds(m):
    try: page = max(1, min(500, int(m.get('page') or 1)))
    except Exception: page = 1
    q = str(m.get('q') or '').strip()[:80]
    reg = q.lower() if re.fullmatch(r'[a-zA-Z]{2}', q) else ''
    enc = lambda x: urllib.parse.quote(x, safe='')
    req = m.get('req')
    if req == 'detail':
        sid = re.sub(r'[^\w-]', '', str(m.get('id') or ''))
        if not sid: raise Exception('id fehlt')
        h = _mi_get(MI + '/en/instant/' + sid + '/')
        g = lambda rx: (re.search(rx, h) or [None, ''])[1] or ''
        mp3 = g(r'id="instant-page-button-element"[^>]*data-url="([^"]+)"') or g(r"play\('([^']+)'")
        likes = h[h.find('instant-page-likes'):] if 'instant-page-likes' in h else ''
        up = re.search(r'<a[^>]*href="(/[a-z-]+/profile/[^"]+)"[^>]*>([\s\S]*?)</a>', likes)
        tags = g(r'<div[^>]*id="instant-page-tags"[^>]*>([\s\S]*?)</div>')
        num = lambda x: int(re.sub(r'\D', '', x) or 0)
        return {'data': {'id': sid, 'title': _mi_text(g(r'<h1[^>]*id="instant-page-title"[^>]*>([\s\S]*?)</h1>')), 'url': MI + '/en/instant/' + sid + '/',
                         'mp3': (mp3 if mp3.startswith('http') else MI + mp3) if mp3 else '',
                         'description': _mi_text(g(r'<div[^>]*id="instant-page-description"[^>]*>\s*<p[^>]*>([\s\S]*?)</p>')),
                         'tags': [t for t in (_mi_text(x) for x in re.findall(r'<a[^>]*>([\s\S]*?)</a>', tags)) if t],
                         'favorites': num(_mi_text(g(r'<div[^>]*id="instant-page-likes"[^>]*>[\s\S]*?<b>([\s\S]*?)</b>'))),
                         'views': num(g(r'([\d.,]+)\s*views')),
                         'uploader': {'text': _mi_text(up.group(2)), 'url': MI + up.group(1), 'username': re.sub(r'/.*$', '', re.sub(r'^/[a-z-]+/profile/', '', up.group(1)))} if up else None}}
    urls = {'search': MI + '/en/search/?name=' + enc(q) if q else None, 'trending': MI + '/en/index/' + (reg + '/' if reg else ''),
            'best': MI + '/en/best_of_all_time/' + (reg + '/' if reg else ''), 'recent': MI + '/en/recent/',
            'uploaded': MI + '/en/profile/' + enc(q) + '/uploaded/' if q else None, 'favorites': MI + '/en/profile/' + enc(q) + '/' if q else None}
    if req not in urls: raise Exception('unbekannte Abfrage')
    url = urls[req]
    if not url: raise Exception('Suchwort bzw. Nutzername fehlt')
    if page > 1: url += ('&' if '?' in url else '?') + 'page=' + str(page)
    data, total = _mi_list(_mi_get(url))
    return {'req': req, 'q': q, 'page': page, 'count': len(data), 'total_pages': total, 'has_next': page < total if total else len(data) >= 30, 'data': data}

async def answer_sounds(ws, m):
    try: r = await asyncio.get_running_loop().run_in_executor(None, sounds, m)
    except Exception as e: r = {'error': str(e)}
    await send(ws, {'type': 'sounds', 'rid': m.get('rid'), **r})

async def handler(ws, *_):   # websockets < 13 übergibt zusätzlich den Pfad
    clients.add(ws)
    try:
        async for text in ws:
            try: m = json.loads(text)
            except Exception: continue
            t = m.get('type')
            if t == 'getConfig':
                c = read_config()
                if c: await send(ws, {'type': 'config', 'config': c})
                await send(ws, {'type': 'status', 'msg': status})
                if gifts: await send(ws, {'type': 'gifts', 'list': gifts})
            elif t == 'setConfig' and isinstance(m.get('config'), dict) and len(json.dumps(m['config'])) < 200000:
                with open(CONFIG, 'w', encoding='utf-8') as f: json.dump(m['config'], f, ensure_ascii=False, indent=1)
                broadcast({'type': 'config', 'config': m['config']}); log('Belegung gespeichert: ' + CONFIG)
            elif t == 'inject' and isinstance(m.get('ev'), dict):
                emit(m['ev'])
            elif t == 'sounds':
                asyncio.ensure_future(answer_sounds(ws, m))
    except Exception: pass
    finally: clients.discard(ws)

def who(e):
    u = getattr(e, 'user', None)
    return (u and (getattr(u, 'nickname', '') or getattr(u, 'unique_id', '') or getattr(u, 'display_id', ''))) or 'Jemand'

def pu(e):
    # Name, Profilbild und @Name des Zuschauers (wie pu() in tiktok-bridge.mjs) – für Einblendungen und Spiel-Aktionen
    u = getattr(e, 'user', None)
    pic = ''
    for k in ('avatar_thumb', 'avatar_medium'):
        pic = img_of_model(getattr(u, k, None)) if u else ''
        if pic: break
    return {'user': who(e), 'pic': pic, 'handle': str((u and (getattr(u, 'display_id', '') or getattr(u, 'unique_id', ''))) or '')}

def img_of_model(i):
    return (list(getattr(i, 'url_list', None) or []) or [''])[0] if i else ''

def img_of(g):
    i = getattr(g, 'image', None)
    return (list(getattr(i, 'url_list', None) or []) or [''])[0] if i else ''

async def live(name):
    try:
        from TikTokLive import TikTokLiveClient
        from TikTokLive.events import CommentEvent, GiftEvent, LikeEvent, FollowEvent, ShareEvent, JoinEvent, ConnectEvent, DisconnectEvent, LiveEndEvent
    except ImportError:
        print('Bitte zuerst ausführen:  pip install TikTokLive', file=sys.stderr); sys.exit(2)
    try: from TikTokLive.events import SubscribeEvent as SubEvent
    except ImportError:
        try: from TikTokLive.events import SubNotifyEvent as SubEvent
        except ImportError: SubEvent = None
    name = name.lstrip('@')
    c = TikTokLiveClient(unique_id='@' + name)

    async def on_comment(e):
        t = str(getattr(e, 'comment', '') or getattr(e, 'content', '') or '').strip()
        if t: emit({'type': 'chat', **pu(e), 'text': t})
    async def on_gift(e):
        g = getattr(e, 'gift', None)
        if g is None: return
        if getattr(g, 'type', 0) == 1 and not getattr(e, 'repeat_end', 0): return   # Serien-Geschenk: erst am Ende einmal mit der Anzahl
        emit({'type': 'gift', **pu(e), 'gift': getattr(g, 'name', ''), 'giftId': getattr(g, 'id', None),
              'count': max(1, int(getattr(e, 'repeat_count', 1) or 1)), 'diamonds': int(getattr(g, 'diamond_count', 0) or 0), 'img': img_of(g)})
    async def on_like(e): emit({'type': 'like', **pu(e), 'count': max(1, int(getattr(e, 'count', 1) or 1))})
    async def on_follow(e): emit({'type': 'follow', **pu(e)})
    async def on_share(e): emit({'type': 'share', **pu(e)})
    async def on_join(e): emit({'type': 'join', 'user': who(e)})
    async def on_sub(e): emit({'type': 'sub', **pu(e)})
    async def on_connect(e):
        global gifts
        set_status('Verbunden mit dem LIVE von @' + name)
        try:
            info = await c.web.fetch_gift_list()   # braucht bei TikTok teils eine Signatur – ohne bleibt die Liste aus tiktok-gifts.json
            lst = info.get('gifts', []) if isinstance(info, dict) else []
            gifts = sorted(({'name': g.get('name'), 'diamonds': g.get('diamond_count', 0), 'img': ((g.get('image') or {}).get('url_list') or [''])[0]}
                            for g in lst if g.get('name')), key=lambda g: g['diamonds'])
            if gifts: broadcast({'type': 'gifts', 'list': gifts}); log(str(len(gifts)) + ' Geschenke von TikTok geladen')
        except Exception: pass
    for ev, f in ((CommentEvent, on_comment), (GiftEvent, on_gift), (LikeEvent, on_like), (FollowEvent, on_follow), (ShareEvent, on_share),
                  (JoinEvent, on_join), (ConnectEvent, on_connect)) + (((SubEvent, on_sub),) if SubEvent else ()):
        c.add_listener(ev, f)
    async def on_end(e): set_status('LIVE beendet')
    c.add_listener(LiveEndEvent, on_end)
    while True:
        try:
            await c.connect(process_connect_events=False)   # alte Nachrichten beim Verbinden nicht als neue zählen
            set_status('LIVE getrennt – neuer Versuch in 30 s')
        except Exception as ex:
            set_status('Noch nicht live oder nicht erreichbar (' + (str(ex) or type(ex).__name__)[:160] + ') – neuer Versuch in 30 s')
        await asyncio.sleep(30)

async def demo():
    names, words = ['Mia', 'Leon', 'Ben', 'Emma', 'Noah', 'Lina'], ['links', 'rechts', 'hoch', 'runter', 'a', 'spring', 'hallo']
    gs = [('Rose', 1), ('Rose', 5), ('Finger Heart', 1), ('Galaxy', 1)]
    while True:
        await asyncio.sleep(1.5)
        r, u = random.random(), random.choice(names)
        if r < 0.6: emit({'type': 'chat', 'user': u, 'text': random.choice(words)})
        elif r < 0.75: emit({'type': 'like', 'user': u, 'count': 15})
        elif r < 0.8: emit({'type': random.choice(['follow', 'share', 'join']), 'user': u})
        else:
            g = random.choice(gs)
            if g[0] != 'Galaxy' or random.random() < 0.2: emit({'type': 'gift', 'user': u, 'gift': g[0], 'count': g[1]})

async def main():
    if not DEMO and not TEST and not USER:
        print('Aufruf: python tools/tiktok-bridge.py DEIN_TIKTOK_NAME   oder   --demo', file=sys.stderr); sys.exit(2)
    async with websockets.serve(handler, '127.0.0.1', PORT):
        log('Brücke bereit (Python/TikTokLive): ws://127.0.0.1:' + str(PORT) + '  ·  Belegung: ' + CONFIG)
        log('Overlay: stream.html?game=<spiel>&tiktok=1   ·   Einstellungen: …&tiktok=1&setup=1')
        if DEMO: await demo()
        elif not TEST: await live(USER)
        else: await asyncio.Future()

if __name__ == '__main__':
    try: asyncio.run(main())
    except KeyboardInterrupt: pass
