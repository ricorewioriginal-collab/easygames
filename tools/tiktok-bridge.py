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
# Ereignis: {type:'chat'|'gift'|'like'|'follow'|'share'|'sub'|'join', user, text, gift, giftId, count, diamonds, img}
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
    except Exception: pass
    finally: clients.discard(ws)

def who(e):
    u = getattr(e, 'user', None)
    return (u and (getattr(u, 'nickname', '') or getattr(u, 'unique_id', '') or getattr(u, 'display_id', ''))) or 'Jemand'

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
        if t: emit({'type': 'chat', 'user': who(e), 'text': t})
    async def on_gift(e):
        g = getattr(e, 'gift', None)
        if g is None: return
        if getattr(g, 'type', 0) == 1 and not getattr(e, 'repeat_end', 0): return   # Serien-Geschenk: erst am Ende einmal mit der Anzahl
        emit({'type': 'gift', 'user': who(e), 'gift': getattr(g, 'name', ''), 'giftId': getattr(g, 'id', None),
              'count': max(1, int(getattr(e, 'repeat_count', 1) or 1)), 'diamonds': int(getattr(g, 'diamond_count', 0) or 0), 'img': img_of(g)})
    async def on_like(e): emit({'type': 'like', 'user': who(e), 'count': max(1, int(getattr(e, 'count', 1) or 1))})
    async def on_follow(e): emit({'type': 'follow', 'user': who(e)})
    async def on_share(e): emit({'type': 'share', 'user': who(e)})
    async def on_join(e): emit({'type': 'join', 'user': who(e)})
    async def on_sub(e): emit({'type': 'sub', 'user': who(e)})
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
