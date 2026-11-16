// Test der Brücke (tools/tiktok-bridge.mjs) im echten Live-Modus mit einem nachgebauten tiktok-live-connector –
// einmal mit den Ereignissen von Version 2.x (Protokoll v3, das installiert `npm i tiktok-live-connector` heute) und einmal mit 1.x.
// Prüft, dass Chat-Befehle, Likes, Geschenke (auch Serien-Geschenke), Follows, Teilen, Abos und Beitritte richtig ankommen.
//   node tools/test-tiktok-connector.cjs
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
let fails = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FEHL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Nachbau: sendet nach connect() eine feste Folge von Ereignissen in der Form der jeweiligen Version
const FAKE = v => `import { EventEmitter } from 'events';
const V = ${v};
const u = n => V === 2 ? { user: { nickname: n, displayId: n.toLowerCase() } } : { uniqueId: n.toLowerCase(), nickname: n };
export class ${v === 2 ? 'TikTokLiveConnection' : 'WebcastPushConnection'} extends EventEmitter {
  constructor(name, options) { super(); if (V === 2 && !options) throw new TypeError("Cannot read properties of undefined (reading 'processInitialData')"); this.name = name; }
  async fetchAvailableGifts() { return [{ name: 'Rose', diamond_count: 1, image: { url_list: ['r.png'] } }, { name: 'Galaxy', diamond_count: 1000 }]; }
  async connect() {
    await new Promise(r => setTimeout(r, 500));   // wie im echten Leben: erst nach kurzer Zeit verbunden
    setTimeout(() => {
      const chat = (n, t) => this.emit('chat', V === 2 ? { ...u(n), content: t } : { ...u(n), comment: t });
      chat('Mia', 'links'); chat('Ben', 'Rechts');
      this.emit('like', V === 2 ? { ...u('Emma'), count: 15, total: '15' } : { ...u('Emma'), likeCount: 15, totalLikeCount: 15 });
      // Serien-Geschenk Rose ×3: drei Zwischenmeldungen, nur das Ende zählt
      for (let i = 1; i <= 3; i++) this.emit('gift', V === 2 ? { ...u('Noah'), giftId: '5655', repeatCount: i, repeatEnd: i === 3 ? 1 : 0, gift: { id: '5655', name: 'Rose', type: 1, diamondCount: 1, image: { urlList: ['https://p16-webcast.tiktokcdn.com/rose.webp'] } } }
        : { ...u('Noah'), giftId: 5655, repeatCount: i, repeatEnd: i === 3, giftName: 'Rose', giftType: 1, diamondCount: 1 });
      // Einzel-Geschenk Galaxy
      this.emit('gift', V === 2 ? { ...u('Lina'), giftId: '11046', repeatCount: 1, repeatEnd: 0, gift: { id: '11046', name: 'Galaxy', type: 2, diamondCount: 1000 } }
        : { ...u('Lina'), giftId: 11046, repeatCount: 1, repeatEnd: false, giftName: 'Galaxy', giftType: 2, diamondCount: 1000 });
      this.emit('follow', u('Leon')); this.emit('share', u('Mia')); this.emit('member', u('Ben'));
      this.emit(V === 2 ? 'subNotify' : 'subscribe', u('Emma'));
      this.emit('chat', V === 2 ? { ...u('Leer'), content: '   ' } : { ...u('Leer'), comment: '' });
    }, 300);
    return { roomId: '1' };
  }
}`;

async function run(v) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eg-ttc-')), mod = path.join(dir, 'node_modules', 'tiktok-live-connector');
  fs.mkdirSync(mod, { recursive: true });
  fs.writeFileSync(path.join(mod, 'package.json'), JSON.stringify({ name: 'tiktok-live-connector', type: 'module', main: 'index.js' }));
  fs.writeFileSync(path.join(mod, 'index.js'), FAKE(v));
  fs.copyFileSync(path.join(__dirname, 'tiktok-bridge.mjs'), path.join(dir, 'tiktok-bridge.mjs'));
  const port = 21800 + Math.floor(Math.random() * 400);
  const br = spawn(process.execPath, ['tiktok-bridge.mjs', 'testkanal', '--port', String(port), '--config', path.join(dir, 'cfg.json')], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = ''; br.stdout.on('data', d => out += d); br.stderr.on('data', d => out += d);
  await sleep(250);
  const evs = [], msgs = [];
  await new Promise((res, rej) => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onmessage = m => { const d = JSON.parse(m.data); msgs.push(d); if (d.type === 'event') evs.push(d.ev); }; w.onopen = () => setTimeout(() => { w.close(); res(); }, 1500); w.onerror = rej; });
  br.kill(); fs.rmSync(dir, { recursive: true, force: true });
  const T = 'Version ' + v + '.x: ', chats = evs.filter(e => e.type === 'chat'), gifts = evs.filter(e => e.type === 'gift');
  ok(chats.length === 2 && chats[0].text === 'links' && chats[1].text === 'Rechts' && chats[0].user === 'Mia', T + 'Chat-Befehle mit Text und Namen (' + chats.map(e => e.user + ':' + e.text).join(', ') + ')');
  ok(evs.some(e => e.type === 'like' && e.count === 15), T + 'Likes mit Anzahl (15)');
  ok(gifts.length === 2 && gifts[0].gift === 'Rose' && gifts[0].count === 3, T + 'Serien-Geschenk zählt einmal mit Anzahl (Rose ×' + (gifts[0] && gifts[0].count) + ', ' + gifts.length + ' Meldungen)');
  if (v === 2) ok(gifts[0] && gifts[0].img === 'https://p16-webcast.tiktokcdn.com/rose.webp', T + 'Geschenkbild aus dem LIVE-Ereignis');
  ok(gifts[1] && gifts[1].gift === 'Galaxy' && gifts[1].diamonds === 1000 && gifts[1].user === 'Lina', T + 'Einzel-Geschenk mit Diamanten');
  ok(['follow', 'share', 'join', 'sub'].every(t => evs.some(e => e.type === t)), T + 'Follow, Teilen, Beitritt und Abo');
  ok(msgs.some(m => m.type === 'status' && /Verbunden mit dem LIVE von @testkanal/.test(m.msg)) || /Verbunden mit dem LIVE/.test(out), T + 'Status „Verbunden“');
  ok(msgs.some(m => m.type === 'gifts' && m.list.length === 2), T + 'Geschenkeliste von TikTok geladen');
}
// Zweite Möglichkeit: tools/tiktok-bridge.py mit nachgebautem TikTokLive (Python); übersprungen ohne Python + websockets
const PY_FAKE = `
import asyncio
class _U:
    def __init__(s, n): s.nickname = n; s.unique_id = n.lower(); s.display_id = n.lower()
class _I:
    def __init__(s, u): s.url_list = [u] if u else []
class _G:
    def __init__(s, i, n, t, d, img=''): s.id = i; s.name = n; s.type = t; s.diamond_count = d; s.image = _I(img)
class _E:
    def __init__(s, **k): s.__dict__.update(k)
class _Web:
    async def fetch_gift_list(s): return {'gifts': [{'name': 'Rose', 'diamond_count': 1, 'image': {'url_list': ['r.png']}}, {'name': 'Galaxy', 'diamond_count': 1000}]}
class TikTokLiveClient:
    def __init__(s, unique_id): s.l = {}; s.web = _Web()
    def add_listener(s, ev, f): s.l.setdefault(ev, []).append(f)
    async def _fire(s, ev, **k):
        for f in s.l.get(ev, []): await f(_E(**k))
    async def connect(s, **k):
        from TikTokLive import events as E
        await asyncio.sleep(1.2); await s._fire(E.ConnectEvent)
        await s._fire(E.CommentEvent, user=_U('Mia'), comment='links'); await s._fire(E.CommentEvent, user=_U('Ben'), comment='Rechts')
        await s._fire(E.LikeEvent, user=_U('Emma'), count=15)
        for i in (1, 2, 3): await s._fire(E.GiftEvent, user=_U('Noah'), repeat_count=i, repeat_end=1 if i == 3 else 0, gift=_G(5655, 'Rose', 1, 1, 'https://p16-webcast.tiktokcdn.com/rose.webp'))
        await s._fire(E.GiftEvent, user=_U('Lina'), repeat_count=1, repeat_end=0, gift=_G(11046, 'Galaxy', 2, 1000))
        await s._fire(E.FollowEvent, user=_U('Leon')); await s._fire(E.ShareEvent, user=_U('Mia')); await s._fire(E.JoinEvent, user=_U('Ben'))
        await s._fire(E.SubNotifyEvent, user=_U('Emma')); await s._fire(E.CommentEvent, user=_U('Leer'), comment='   ')
        await asyncio.sleep(3600)
`;
async function runPy() {
  const py = ['python3', 'python'].find(p => { try { return require('child_process').spawnSync(p, ['-c', 'import websockets'], { stdio: 'ignore' }).status === 0; } catch (e) { return false; } });
  if (!py) { console.log('--   Python-Brücke übersprungen (Python mit websockets fehlt: pip install TikTokLive)'); return; }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eg-ttp-')), pkg = path.join(dir, 'TikTokLive');
  fs.mkdirSync(pkg); fs.writeFileSync(path.join(pkg, '__init__.py'), PY_FAKE);
  fs.writeFileSync(path.join(pkg, 'events.py'), ['Comment', 'Gift', 'Like', 'Follow', 'Share', 'Join', 'Connect', 'Disconnect', 'LiveEnd', 'SubNotify'].map(n => 'class ' + n + 'Event: pass').join('\n') + '\n');
  fs.copyFileSync(path.join(__dirname, 'tiktok-bridge.py'), path.join(dir, 'tiktok-bridge.py'));
  const port = 22300 + Math.floor(Math.random() * 400);
  const br = spawn(py, ['tiktok-bridge.py', 'testkanal', '--port', String(port), '--config', path.join(dir, 'cfg.json')], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONPATH: dir } });
  let out = ''; br.stdout.on('data', d => out += d); br.stderr.on('data', d => out += d);
  await sleep(900);
  const evs = [], msgs = [];
  await new Promise((res, rej) => { const w = new WebSocket('ws://127.0.0.1:' + port); w.onmessage = m => { const d = JSON.parse(m.data); msgs.push(d); if (d.type === 'event') evs.push(d.ev); };
    w.onopen = () => { w.send(JSON.stringify({ type: 'setConfig', config: { a: 1 } })); setTimeout(() => { w.close(); res(); }, 1500); }; w.onerror = rej; });
  const saved = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'cfg.json'), 'utf8')).a === 1; } catch (e) { return false; } })();
  br.kill(); fs.rmSync(dir, { recursive: true, force: true });
  const T = 'Python/TikTokLive: ', chats = evs.filter(e => e.type === 'chat'), gifts = evs.filter(e => e.type === 'gift');
  if (!evs.length) console.log(out.slice(-600));
  ok(chats.length === 2 && chats[0].text === 'links' && chats[0].user === 'Mia', T + 'Chat-Befehle (' + chats.map(e => e.user + ':' + e.text).join(', ') + ')');
  ok(evs.some(e => e.type === 'like' && e.count === 15), T + 'Likes mit Anzahl');
  ok(gifts.length === 2 && gifts[0].gift === 'Rose' && gifts[0].count === 3 && gifts[0].img === 'https://p16-webcast.tiktokcdn.com/rose.webp', T + 'Serien-Geschenk einmal mit Anzahl und Bild');
  ok(gifts[1] && gifts[1].gift === 'Galaxy' && gifts[1].diamonds === 1000, T + 'Einzel-Geschenk mit Diamanten');
  ok(['follow', 'share', 'join', 'sub'].every(t => evs.some(e => e.type === t)), T + 'Follow, Teilen, Beitritt und Abo');
  ok(msgs.some(m => m.type === 'status' && /Verbunden mit dem LIVE von @testkanal/.test(m.msg)), T + 'Status „Verbunden“');
  ok(msgs.some(m => m.type === 'gifts' && m.list.length === 2), T + 'Geschenkeliste geladen');
  ok(saved && msgs.some(m => m.type === 'config' && m.config.a === 1), T + 'Belegung speichern (gleiche Datei wie Node)');
}
(async () => { await run(2); await run(1); await runPy(); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0); })();
