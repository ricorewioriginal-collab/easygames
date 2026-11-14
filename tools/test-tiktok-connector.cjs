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
      for (let i = 1; i <= 3; i++) this.emit('gift', V === 2 ? { ...u('Noah'), giftId: '5655', repeatCount: i, repeatEnd: i === 3 ? 1 : 0, gift: { id: '5655', name: 'Rose', type: 1, diamondCount: 1 } }
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
  ok(gifts[1] && gifts[1].gift === 'Galaxy' && gifts[1].diamonds === 1000 && gifts[1].user === 'Lina', T + 'Einzel-Geschenk mit Diamanten');
  ok(['follow', 'share', 'join', 'sub'].every(t => evs.some(e => e.type === t)), T + 'Follow, Teilen, Beitritt und Abo');
  ok(msgs.some(m => m.type === 'status' && /Verbunden mit dem LIVE von @testkanal/.test(m.msg)) || /Verbunden mit dem LIVE/.test(out), T + 'Status „Verbunden“');
  ok(msgs.some(m => m.type === 'gifts' && m.list.length === 2), T + 'Geschenkeliste von TikTok geladen');
}
(async () => { await run(2); await run(1); console.log(fails ? fails + ' Fehler' : 'alles ok'); process.exit(fails ? 1 : 0); })();
