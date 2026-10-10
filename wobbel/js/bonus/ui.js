/* Wobbel – Bonus-&-Laden-Bildschirm und Bonusspiel-Ablauf. ctx: {toast, sfx, back(), onLook(look), onShow(bool)} */
import { Save } from '../storage.js';
import { GAMES, W, H } from './games.js';
import { Shop, CATALOG, SKIP_PRICE, TIP_PRICE, bonusReward, BONUS_CAP } from './shop.js';
import { ACHIEVEMENTS } from './achievements.js';
import { drawWobbel } from './draw.js';
const $ = id => document.getElementById(id);

export function initBonus(ctx) {
  let tab = 'games', cur = null, games = {}, gameOn = false;
  const coins = () => `🐚 ${Save.coins}`;
  const look = () => Save.look;
  const refreshCoins = () => { $('bnCoins').textContent = coins(); $('mgCoins').textContent = coins(); };
  function render() {
    refreshCoins(); $('bnTabs').querySelectorAll('[data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
    const box = $('bnBody');
    if (tab === 'games') {
      box.innerHTML = `<p class="info">Spiele Bonusspiele und sammle Muscheln – bis zu ${BONUS_CAP} pro Runde. Im Laden löst du sie ein.</p>` + GAMES.map(g => { const b = Save.bonus(g.id); return `<div class="my-row"><div class="bn-ic">${g.emoji}</div><div class="my-info"><b>${g.name}</b><small>${g.desc}<br>Rekord: ${b.best} ${g.unit} · ${b.plays}× gespielt</small></div><div class="my-btns"><button class="bn-play" data-g="${g.id}" aria-label="${g.name} spielen">▶</button></div></div>`; }).join('');
      box.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { ctx.sfx('click'); openGame(b.dataset.g); });
    } else if (tab === 'ach') {
      const got = ACHIEVEMENTS.filter(a => Save.achieved(a.id)).length;
      box.innerHTML = `<p class="info"><b>${got} / ${ACHIEVEMENTS.length}</b> Erfolge freigeschaltet – jeder gibt Muscheln.</p>` + ACHIEVEMENTS.map(a => { const y = Save.achieved(a.id); return `<div class="my-row ${y ? '' : 'ach-off'}"><div class="bn-ic">${y ? a.emoji : '🔒'}</div><div class="my-info"><b>${a.name}</b><small>${a.desc}</small></div><span class="chip">${y ? '✔' : '+' + a.reward + ' 🐚'}</span></div>`; }).join('');
    } else {
      const ICON = { hat: { '': '🚫', party: '🎉', bow: '🎀', top: '🎩', prop: '🚁', crown: '👑', flower: '🌸', shades: '🕶️', cat: '🐱', pirate: '🏴‍☠️' }, trail: { '': '🚫', bubbles: '🫧', stars: '✨', hearts: '💗' }, crate: { '': '📦', ice: '🧊', berry: '🍓', dark: '🪨', gold: '🥇' } };
      const icon = (kind, it) => kind === 'color' ? `<i class="sw-c ${it.value === 'rainbow' ? 'rb' : ''}" style="background:${it.value === 'rainbow' ? '' : it.value}"></i>` : `<span class="hat-ic">${ICON[kind][it.id]}</span>`;
      const TITLES = { color: 'Farbe', hat: 'Kopfschmuck', trail: 'Spur', crate: 'Kisten-Look' };
      box.innerHTML = `<canvas id="shPrev" width="200" height="170" aria-label="Vorschau"></canvas>` + Object.keys(CATALOG).map(k => `<h3>${TITLES[k]}</h3><div class="shop-grid">${CATALOG[k].list.map(it => item(k, it.id, it.name, it.price, icon(k, it))).join('')}</div>`).join('') + `<p class="info">⏭ Level überspringen kostet ${SKIP_PRICE} 🐚, 💡 ein Tipp ${TIP_PRICE} 🐚 (Knöpfe im Spiel).</p>`;
      box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => shopClick(b.dataset.k, b.dataset.i));
      preview();
    }
  }
  function item(kind, id, name, price, icon) { const own = Shop.owned(kind, id), on = Shop.equipped(kind, id); return `<button class="shop-it ${on ? 'on' : ''} ${own ? '' : 'locked'}" data-k="${kind}" data-i="${id}">${icon}<b>${name}</b><small>${on ? '✔ an' : own ? 'anlegen' : '🐚 ' + price}</small></button>`; }
  function preview() { const c = $('shPrev'); if (!c) return; const g = c.getContext('2d'); g.clearRect(0, 0, 200, 170); drawWobbel(g, 100, 100, 54, look(), false); }
  function shopClick(kind, id) {
    if (!Shop.owned(kind, id)) { const r = Shop.buy(kind, id); if (!r.ok) { ctx.sfx('bad'); ctx.toast(r.reason === 'zu wenig Muscheln' ? 'Zu wenig Muscheln – spiel ein Bonusspiel!' : r.reason, 2200); return; } ctx.sfx('place'); ctx.toast('Gekauft!', 1500); }
    Shop.equip(kind, id); ctx.sfx('click'); ctx.onLook(look()); ctx.checkAch(); render();
  }
  // ---------------------------------------------------------------- Bonusspiel
  function openGame(id) {
    cur = GAMES.find(g => g.id === id); $('bonus').hidden = true; $('mg').hidden = false; $('mgRes').hidden = true; $('mgIntro').hidden = false; $('mgTitle').textContent = `${cur.emoji} ${cur.name}`; $('mgDesc').textContent = cur.desc; $('mgHud').textContent = ''; refreshCoins();
    if (!games[id]) { const c = $('mgCv').cloneNode(false); c.id = 'mgCv'; $('mgCv').replaceWith(c); c.width = W * 2; c.height = H * 2; c.getContext('2d').scale(2, 2); games[id] = cur.create(c, { get look() { return look(); }, sfx: (n, ...a) => ctx.sfx(n, ...a), hud: t => { $('mgHud').textContent = t; }, end: score => finish(score) }); games[id].cv = c; }
    else { $('mgCv').replaceWith(games[id].cv); }
    const g = games[id].cv.getContext('2d'); g.fillStyle = '#7fd2ff'; g.fillRect(0, 0, W, H);
  }
  function startGame() { $('mgIntro').hidden = true; $('mgRes').hidden = true; gameOn = true; ctx.sfx('click'); games[cur.id].start(); }
  function finish(score) {
    gameOn = false; const rec = Save.bonus(cur.id), reward = bonusReward(score, cur.per); Save.bonusPlayed(cur.id, score); Save.addStat('bonusPlays', 1); if (reward) Save.addCoins(reward); refreshCoins(); if (reward) ctx.sfx('place');
    $('mgScore').innerHTML = `${cur.emoji} <b>${score}</b> ${cur.unit}${score > rec.best ? ' <span class="rec">🏆 Neuer Rekord!</span>' : ''}`; $('mgReward').textContent = reward ? `+${reward} 🐚` : 'Keine Muscheln diesmal – nochmal versuchen!'; $('mgRes').hidden = false; ctx.checkAch();
  }
  function closeGame(toBonus) { if (cur && games[cur.id]) games[cur.id].stop(); gameOn = false; $('mg').hidden = true; if (toBonus) open(); else ctx.back(); }
  $('mgGo').onclick = startGame; $('mgAgain').onclick = () => { $('mgRes').hidden = true; startGame(); }; $('mgBack').onclick = () => { ctx.sfx('click'); closeGame(true); }; $('mgBack2').onclick = () => { ctx.sfx('click'); closeGame(true); };
  $('bnTabs').querySelectorAll('[data-t]').forEach(b => b.onclick = () => { ctx.sfx('click'); tab = b.dataset.t; render(); });
  $('bnBack').onclick = () => { ctx.sfx('click'); close(); ctx.back(); };
  function open(t) { if (t) tab = t; $('bonus').hidden = false; ctx.onShow(true); render(); }
  function close() { $('bonus').hidden = true; ctx.onShow(false); }
  return { open, close, isOpen: () => !$('bonus').hidden || !$('mg').hidden, refresh: refreshCoins };
}
