#!/usr/bin/env node
// Erzeugt einheitliche Spielkarten (512×512 JPEG, <spiel>/card.jpg) und Logos (<spiel>/logo.svg, Emblem auf Farbverlauf) für Spiele ohne eigenes Titelbild bzw. mit veraltetem.
// Die Embleme sind gezeichnet (tools/card-art.cjs), keine Screenshots und keine Emoji.
// Farben kommen aus dem Eintrag in games.js (bg), Motiv/Titel aus CARDS unten. Aufruf: node tools/make-cards.cjs [spiel-id …]   (ohne Argument: alle)
// Danach: node tools/build-sync.js (img in games.js zeigt auf <spiel>/card.jpg).
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const ART = require('./card-art.cjs');
const root = path.resolve(__dirname, '..');
// id: [Kopfzeile, [Titelzeilen], Heldmotiv, [Begleiter links, rechts]]
const CARDS = {
  'anmacha-radio-surfer': ['ANMACHA', ['RADIO', 'SURFER'], '📻', ['🏄', '🌐']],
  'anmacha-radio-match': ['ROYAL · 3D', ['RADIO', 'MATCH'], '👑', ['📻', '🎧']],
  'anmacha-flipper': ['ANMACHA · 3D', ['PINBALL'], '🎱', ['🚀', '⭐']],
  'anmacha-beat-surfer': ['ANMACHA · 3D', ['BEAT', 'SURFER'], '🎧', ['🎵', '🎶']],
  'anmacha-memory': ['ANMACHA', ['MEMORY'], '🧠', ['📻', '🃏']],
  'anmacha-quest-rpg': ['ANMACHA', ['QUEST', 'RPG'], '⚔️', ['🐉', '🏰']],
  'anmacha-snake': ['ANMACHA · 3D', ['SNAKE', '3D'], '🐍', ['🍎', '💎']],
  'anmacha-tower-defense': ['ANMACHA · 3D', ['TOWER', 'DEFENSE'], '🗼', ['🛡️', '👾']],
  'anmacha-markthalle': ['ANMACHA · 3D', ['MARKTHALLE', '24'], '🛒', ['🥫', '🍎']],
  'anmacha-urwaldlager': ['DIE WILDNIS-SHOW', ['URWALD-', 'LAGER'], '🌴', ['🔥', '🦜']],
  'anmacha-spielesammlung': ['ANMACHA · 3D', ['SPIELE-', 'SAMMLUNG'], '🎲', ['♟️', '🎯']],
  'anmacha-kartenrausch': ['ANMACHA · 3D', ['KARTEN-', 'RAUSCH'], '🃏', ['🌈', '🎯']],
  'gay-life': ['LEBENSSIMULATION', ['GAY', 'LIFE!'], '🏳️‍🌈', ['🏠', '🍸']],
  'anmacha-klotzfunk': ['VOXEL-SANDBOX · 3D', ['KLOTZ-', 'FUNK'], '🧱', ['⛏️', '💎']],
  'partyverse': ['3D-PARTYSPIEL', ['PARTY-', 'VERSE'], '🎲', ['🎉', '🎈']]
};
function colors(id) {
  const src = fs.readFileSync(path.join(root, 'games.js'), 'utf8'), i = src.indexOf("id: '" + id + "'");
  const m = i >= 0 && /bg:\s*'([^']+)'/.exec(src.slice(i, i + 900));
  const hex = m ? m[1].match(/#[0-9a-fA-F]{6}/g) : null;
  return hex && hex.length >= 2 ? hex : ['#8B5CF6', '#2a6cff', '#FF2D95'];
}
function gradient(id) { return 'linear-gradient(145deg,' + colors(id).join(',') + ')'; }
function html(id) {
  const [tag, lines] = CARDS[id], long = Math.max(...lines.map(l => l.length)), fs1 = long > 9 ? 56 : long > 7 ? 70 : 86;
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:512px;height:512px;overflow:hidden;font-family:'Inter','DejaVu Sans',sans-serif;background:${gradient(id)};position:relative;color:#fff}
.v{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 38%,#0000 40%,#0000007a 100%)}
.s{position:absolute;inset:0;background:repeating-linear-gradient(135deg,#ffffff0d 0 2px,#0000 2px 26px)}
.g{position:absolute;left:50%;top:34%;width:340px;height:340px;margin:-170px 0 0 -170px;border-radius:50%;background:radial-gradient(circle,#ffffff59,#ffffff17 55%,#0000 72%)}
svg{position:absolute;left:116px;top:36px;width:280px;height:280px;filter:drop-shadow(0 12px 14px #00000073);overflow:visible}
.t{position:absolute;left:0;right:0;top:30px;text-align:center;font-size:20px;font-weight:800;letter-spacing:.32em;text-indent:.32em;color:#ffffffd9;text-shadow:0 2px 6px #0006}
.n{position:absolute;left:0;right:0;bottom:0;padding:70px 20px 40px;background:linear-gradient(180deg,#0000,#000000a6 55%);text-align:center;font-weight:900;font-size:${fs1}px;line-height:.95;letter-spacing:-.01em;text-shadow:0 5px 0 #00000059,0 0 22px #00000080}
</style><div class="s"></div><div class="g"></div><svg viewBox="0 0 200 200">${ART[id]()}</svg><div class="v"></div><div class="t">${tag}</div><div class="n">${lines.join('<br>')}</div>`;
}
// Eigenständiges Logo: Emblem auf abgerundetem Farbverlauf (ohne Text), für Symbole und eigene Seiten
function logoSvg(id) {
  const c = colors(id), stops = c.map((x, i) => `<stop offset="${Math.round(100 * i / (c.length - 1))}%" stop-color="${x}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${CARDS[id][1].join(' ').replace(/-/g, '')}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient><radialGradient id="gl"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" rx="112" fill="url(#bg)"/><circle cx="256" cy="256" r="200" fill="url(#gl)"/><g transform="translate(76 76) scale(1.8)">${ART[id]()}</g></svg>\n`;
}
(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CARDS);
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  for (const id of ids) {
    if (!CARDS[id]) { console.error('unbekannt: ' + id); process.exitCode = 1; continue; }
    await page.setContent(html(id)); await page.waitForTimeout(150);
    const out = path.join(root, id, 'card.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: 512, height: 512 } });
    fs.writeFileSync(path.join(root, id, 'logo.svg'), logoSvg(id));
    console.log('OK ' + id + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
  }
  await browser.close();
})();
