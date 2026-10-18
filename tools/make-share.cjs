#!/usr/bin/env node
// Erzeugt die Teilen-Vorschau (Open Graph / Twitter-Karte) für jedes Spiel: share/<id>.jpg (1200×630) und share/<id>.html
// (Seite mit Titel, Beschreibung, Bild und sofortiger Weiterleitung zum Spiel). Die Teilen-Dialoge der Seite verweisen auf diese Adressen.
//   node tools/make-share.cjs                 alle Spiele       node tools/make-share.cjs <spiel-id> …   nur diese
//   node tools/make-share.cjs --portal <marke> <datei.jpg>      Sammelbild der Spieleseite (marke: easygames | ricorewi | radio)
// Neue Spiele: nach dem Eintrag in games.js einmal ausführen und share/ mit einchecken. Der Ordner share/ gehört nicht ins Offline-Paket (build-sync).
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..'), BASE = 'https://ricorewioriginal-collab.github.io/easygames/';
const load = f => { const ctx = { window: {}, console }; ctx.self = ctx.window; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx); return ctx.window; };
const W = load('games.js'), C = load('categories.js').EASYGAMES_CATS, M = (load('modes.js').EASYGAMES_MODES || {});
const GAMES = W.EASYGAMES_GAMES || [];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATCOL = { abenteuer: '#ff9f43', action: '#ff4d6d', denken: '#9b7bff', quiz: '#2cc7ff', sim: '#3ddc84', tisch: '#ffc53d', musik: '#ff5cb0' };
const short = (d, n) => { d = String(d || '').replace(/\s+/g, ' ').trim(); const i = d.search(/[.!?](\s|$)/); if (i > 25 && i < n) d = d.slice(0, i + 1); return d.length > n ? d.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : d; };
const b64 = f => { const p = path.join(root, f); const ext = f.split('.').pop().toLowerCase(), mime = { png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext] || 'image/jpeg'; return fs.existsSync(p) ? 'data:' + mime + ';base64,' + fs.readFileSync(p).toString('base64') : ''; };
const FONT = "'Inter','Segoe UI',system-ui,-apple-system,Roboto,Arial,sans-serif";
const logo = b64('branding/easygames-logo.png');

function gameHtml(g) {
  const cat = C.list.find(c => c.id === C.of[g.id]), col = CATCOL[cat && cat.id] || '#00E5FF', m = Object.assign({}, M[g.id], g.modes);
  const name = String(g.title).split(' – ')[0], fs0 = name.length > 26 ? 50 : name.length > 16 ? 62 : 74, lines = name.length > 16 ? 2 : 3;
  const badges = [m.online ? '🌐 Online' : '', m.multi ? '👥 Mehrspieler' : '', m.pad ? '📱 Controller' : ''].filter(Boolean);
  const card = b64(g.img);
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:${FONT};color:#fff;background:#0b1020;position:relative}
.glow{position:absolute;inset:-120px;background:${g.bg || 'linear-gradient(145deg,#7a3cff,#19f0ff)'};filter:blur(120px) saturate(1.4);opacity:.55}
.vig{position:absolute;inset:0;background:radial-gradient(900px 520px at 78% 55%,rgba(11,16,32,.55),rgba(11,16,32,.94) 70%),linear-gradient(0deg,#0b1020 0%,transparent 40%)}
.card{position:absolute;left:84px;top:96px;width:438px;height:438px;border-radius:64px;overflow:hidden;background:${g.bg || '#222'};box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 90px ${g.glow || 'rgba(0,229,255,.45)'},0 0 0 3px rgba(255,255,255,.18)}
.card img{width:100%;height:100%;object-fit:cover;display:block}.card span{display:grid;place-items:center;height:100%;font-size:190px}
.tx{position:absolute;left:590px;right:60px;top:70px}
.tag{display:inline-block;padding:9px 20px;border-radius:999px;border:3px solid ${col};background:rgba(11,16,32,.7);font-weight:800;font-size:25px;letter-spacing:.06em;text-transform:uppercase}
h1{margin:22px 0 14px;font-size:${fs0}px;line-height:1.04;font-weight:900;letter-spacing:-.03em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
p{margin:0;font-size:29px;line-height:1.38;color:#cfd8f4;display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;overflow:hidden}
.b{margin-top:22px;display:flex;gap:12px;flex-wrap:wrap}.b i{font-style:normal;font-weight:700;font-size:22px;padding:7px 16px;border-radius:999px;background:rgba(255,255,255,.12);color:#e6ecff}
.play{position:absolute;left:590px;bottom:92px;padding:16px 34px;border-radius:20px;font-weight:900;font-size:32px;color:#06101a;background:linear-gradient(90deg,#00E5FF,#8B5CF6 60%,#FF2D95)}
.ft{position:absolute;left:84px;right:70px;bottom:30px;display:flex;align-items:center;gap:14px;font-weight:800;font-size:25px;color:#9fb0d6}
.ft img{height:40px;width:40px;border-radius:10px}.ft b{color:#fff}.ft em{font-style:normal;color:#ff7ac0}</style>
<div class="glow"></div><div class="vig"></div>
<div class="card">${card ? `<img src="${card}">` : `<span>${esc(g.icon || '🎮')}</span>`}</div>
<div class="tx"><span class="tag">${esc(cat ? cat.icon + ' ' + cat.short : 'Minispiel')}</span><h1>${esc(name)}</h1><p>${esc(short(g.desc, lines === 2 ? 110 : 150))}</p>${badges.length ? '<div class="b">' + badges.map(x => '<i>' + esc(x) + '</i>').join('') + '</div>' : ''}</div>
<div class="play">▶ Jetzt spielen</div>
<div class="ft">${logo ? `<img src="${logo}">` : ''}<span><b>easygames</b> · by Rico<em>Re</em>Wi × AnMaCha</span></div>`;
}

function pageHtml(g, img) {
  const name = String(g.title).split(' – ')[0], desc = short(g.desc, 190) , target = g.path, url = BASE + 'share/' + g.id + '.html', game = BASE + target, image = BASE + 'share/' + g.id + '.jpg';
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} – easygames</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(game)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="easygames by RicoReWi × AnMaCha">
<meta property="og:title" content="${esc(name)} – jetzt kostenlos spielen"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(name)} – easygames"><meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(name)} – jetzt kostenlos spielen"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=../${esc(target)}">
<script>location.replace('../${esc(target)}'+location.search+location.hash)</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080B12;color:#fff;font:16px system-ui,sans-serif;text-align:center}a{color:#00E5FF}</style></head>
<body><p>Weiter zu <a href="../${esc(target)}">${esc(name)}</a> …</p></body></html>
`;
}

const PORTAL = {
  easygames: { eyebrow: 'by RicoReWi × AnMaCha', title: 'easygames', sub: 'Minispiele für Browser, Handy & TV', accent: '#00E5FF', accent2: '#FF2D95' },
  ricorewi: { eyebrow: '06 / RICOREWI ARCADE', title: "LET'S PLAY.", sub: 'Alle easygames direkt im Browser – kostenlos, ohne Download', accent: '#d4fd78', accent2: '#8B5CF6' },
  radio: { eyebrow: 'RICOREWI RADIO · SPIELEN & HÖREN', title: 'Games', sub: 'Radio hören und nebenbei zocken – direkt im Browser', accent: '#2bb8e8', accent2: '#8a4dff' }
};
function portalHtml(brand) {
  const P = PORTAL[brand] || PORTAL.easygames, picks = ['anmacha-quiz', 'anmacha-kart', 'anmacha-radio-surfer', 'anmacha-klotzfunk', 'riftzone', 'bunte-insel', 'ricoville', 'anmacha-showdown', 'kiko-sterneninseln', 'ricolife', 'ricopoly', 'zotik', 'wobbel', 'anmacha-snake']
    .map(id => GAMES.find(g => g.id === id)).filter(g => g && g.img && b64(g.img)).slice(0, 9);
  const tiles = picks.map((g, i) => `<div class="t" style="--i:${i};background:${g.bg || '#222'}"><img src="${b64(g.img)}"></div>`).join('');
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:${FONT};color:#fff;background:#0b1020;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(700px 420px at 12% 8%,${P.accent}33,transparent 70%),radial-gradient(700px 480px at 100% 100%,${P.accent2}44,transparent 70%)}
.grid{position:absolute;right:-40px;top:50%;width:560px;transform:translateY(-50%) rotate(-6deg);display:grid;grid-template-columns:repeat(3,170px);gap:18px}
.t{width:170px;height:170px;border-radius:38px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.5),0 0 0 2px rgba(255,255,255,.14)}.t img{width:100%;height:100%;object-fit:cover;display:block}
.fade{position:absolute;inset:0;background:linear-gradient(90deg,#0b1020 0%,#0b1020 46%,rgba(11,16,32,.35) 72%,transparent)}
.tx{position:absolute;left:84px;top:150px;width:620px}.ey{font-size:24px;font-weight:800;letter-spacing:.16em;color:${P.accent}}
h1{margin:14px 0 18px;font-size:${P.title.length > 8 ? 104 : 128}px;line-height:.95;font-weight:900;letter-spacing:-.05em}
p{margin:0;font-size:34px;line-height:1.3;color:#cfd8f4;max-width:560px}
.cta{position:absolute;left:84px;bottom:86px;padding:16px 34px;border-radius:20px;font-weight:900;font-size:32px;color:#06101a;background:linear-gradient(90deg,${P.accent},${P.accent2})}
.ft{position:absolute;left:84px;bottom:28px;display:flex;align-items:center;gap:14px;font-weight:800;font-size:24px;color:#9fb0d6}.ft img{height:38px;width:38px;border-radius:10px}.ft b{color:#fff}</style>
<div class="bg"></div><div class="grid">${tiles}</div><div class="fade"></div>
<div class="tx"><div class="ey">${esc(P.eyebrow)}</div><h1>${esc(P.title)}</h1><p>${esc(P.sub)}</p></div>
<div class="cta">▶ ${GAMES.length} Spiele – jetzt spielen</div>
<div class="ft">${logo ? `<img src="${logo}">` : ''}<span><b>easygames</b> · Spiele für Browser, Handy &amp; TV</span></div>`;
}

(async () => {
  const args = process.argv.slice(2), browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const shot = async (html, out) => { await page.setContent(html, { waitUntil: 'load' }); await page.waitForTimeout(120); fs.mkdirSync(path.dirname(out), { recursive: true }); await page.screenshot({ path: out, type: 'jpeg', quality: 84 }); };
  if (args[0] === '--portal') { await shot(portalHtml(args[1]), path.resolve(args[2])); console.log('OK', args[2]); await browser.close(); return; }
  const only = args.length ? new Set(args) : null, dir = path.join(root, 'share'); let n = 0;
  for (const g of GAMES) {
    if (g.external || (only && !only.has(g.id))) continue;
    await shot(gameHtml(g), path.join(dir, g.id + '.jpg'));
    fs.writeFileSync(path.join(dir, g.id + '.html'), pageHtml(g));
    n++;
  }
  console.log(n + ' Teilen-Vorschauen in share/ erzeugt'); await browser.close();
})();
