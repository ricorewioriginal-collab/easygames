#!/usr/bin/env node
// Erzeugt einheitliche Spielkarten (512×512 JPEG, <spiel>/card.jpg) für Spiele ohne eigenes Titelbild bzw. mit veraltetem.
// Farben kommen aus dem Eintrag in games.js (bg), Motiv/Titel aus CARDS unten. Aufruf: node tools/make-cards.cjs [spiel-id …]   (ohne Argument: alle)
// Danach: node tools/build-sync.js (img in games.js zeigt auf <spiel>/card.jpg).
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
// id: [Kopfzeile, [Titelzeilen], Heldmotiv, [Begleiter links, rechts]]
const CARDS = {
  'anmacha-radio-surfer': ['ANMACHA', ['RADIO', 'SURFER'], '📻', ['🏄', '🌐']],
  'anmacha-radio-match': ['ANMACHA · 3D', ['RADIO-', 'MATCH'], '📡', ['🔋', '🎛️']],
  'anmacha-flipper': ['ANMACHA · 3D', ['PINBALL'], '🎱', ['🚀', '⭐']],
  'anmacha-beat-surfer': ['ANMACHA · 3D', ['BEAT', 'SURFER'], '🎧', ['🎵', '🎶']],
  'anmacha-memory': ['ANMACHA', ['MEMORY'], '🧠', ['📻', '🃏']],
  'anmacha-quest-rpg': ['ANMACHA', ['QUEST', 'RPG'], '⚔️', ['🐉', '🏰']],
  'anmacha-snake': ['ANMACHA · 3D', ['SNAKE', '3D'], '🐍', ['🍎', '💎']],
  'anmacha-tower-defense': ['ANMACHA · 3D', ['TOWER', 'DEFENSE'], '🗼', ['🛡️', '👾']],
  'anmacha-markthalle': ['ANMACHA · 3D', ['MARKTHALLE', '24'], '🛒', ['🥫', '🍎']],
  'anmacha-urwaldlager': ['DIE WILDNIS-SHOW', ['URWALD-', 'LAGER'], '🌴', ['🔥', '🦜']],
  'anmacha-spielesammlung': ['ANMACHA · 3D', ['SPIELE-', 'SAMMLUNG'], '🎲', ['♟️', '🎯']],
  'anmacha-stapelrausch': ['ANMACHA · 3D', ['STAPEL-', 'RAUSCH'], '🃏', ['🔢', '🏆']],
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
function html(id) {
  const [tag, lines, hero, sat] = CARDS[id], c = colors(id), grad = 'linear-gradient(145deg,' + c.join(',') + ')';
  const long = Math.max(...lines.map(l => l.length)), fs1 = long > 9 ? 56 : long > 7 ? 70 : 86;
  return `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}body{width:512px;height:512px;overflow:hidden;font-family:'Inter','DejaVu Sans',sans-serif;background:${grad};position:relative;color:#fff}
.v{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 38%,#0000 40%,#0000007a 100%)}
.s{position:absolute;inset:0;background:repeating-linear-gradient(135deg,#ffffff0d 0 2px,#0000 2px 26px)}
.g{position:absolute;left:50%;top:40%;width:330px;height:330px;margin:-165px 0 0 -165px;border-radius:50%;background:radial-gradient(circle,#ffffff66,#ffffff1a 55%,#0000 72%)}
.h{position:absolute;left:0;right:0;top:92px;text-align:center;font-size:206px;line-height:1;font-family:'Noto Color Emoji',sans-serif;filter:drop-shadow(0 14px 16px #0000007a)}
.a,.b{position:absolute;font-size:78px;line-height:1;font-family:'Noto Color Emoji',sans-serif;filter:drop-shadow(0 8px 10px #00000080)}.a{left:46px;top:150px;transform:rotate(-14deg)}.b{right:46px;top:128px;transform:rotate(12deg)}
.t{position:absolute;left:0;right:0;top:30px;text-align:center;font-size:20px;font-weight:800;letter-spacing:.32em;text-indent:.32em;color:#ffffffd9;text-shadow:0 2px 6px #0006}
.n{position:absolute;left:0;right:0;bottom:0;padding:70px 20px 40px;background:linear-gradient(180deg,#0000,#000000a6 55%);text-align:center;font-weight:900;font-size:${fs1}px;line-height:.95;letter-spacing:-.01em;text-shadow:0 5px 0 #00000059,0 0 22px #00000080}
</style><div class="s"></div><div class="g"></div><div class="a">${sat[0]}</div><div class="b">${sat[1]}</div><div class="h">${hero}</div><div class="v"></div><div class="t">${tag}</div><div class="n">${lines.join('<br>')}</div>`;
}
(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CARDS);
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  for (const id of ids) {
    if (!CARDS[id]) { console.error('unbekannt: ' + id); process.exitCode = 1; continue; }
    await page.setContent(html(id)); await page.waitForTimeout(150);
    const out = path.join(root, id, 'card.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 512, height: 512 } });
    console.log('OK ' + id + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
  }
  await browser.close();
})();
