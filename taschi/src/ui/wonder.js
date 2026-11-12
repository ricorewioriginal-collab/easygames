// 🎲 Zufallstausch: Ein Taschi auf gut Glück mit einem anderen Spieler irgendwo
// auf der Welt tauschen. Vermittelt wird wie bei allen easygames-Spielen über
// ../cloud/fire-peer.js: Wer sucht, versucht zuerst einen wartenden Spieler auf
// einem der festen Tauschplätze zu erreichen, sonst wartet er selbst kurz auf
// einem freien Platz. Getauscht wird direkt von Gerät zu Gerät.
import { h } from './ui.js';
import { panel, monCard } from './menus.js';
import { Link } from '../core/net.js';
import * as L from '../logic/link.js';
import { tradeScene } from './online.js';

export const WONDER_SLOTS = 6, WONDER_TIME = 120;
const slotId = (i) => L.LINK_PREFIX + 'wonder-v' + L.LINK_VERSION + '-' + i;
const shuffled = (n) => { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function pickOffer(game) {
  const s = game.save;
  return new Promise(resolve => {
    const scr = { el: null };
    const choose = (m) => { const c = L.canOffer(s, m); if (!c.ok) { game.audio.sfx('error'); game.ui.toast(c.text, '🎲'); return; } game.ui.pop(scr); resolve(m); };
    scr.el = panel(game, '🎲 Zufallstausch', h('div', {},
      h('p', {}, 'Wähle ein Taschi. Es reist zu einem zufälligen Spieler, irgendwo auf der Welt – und du bekommst dessen Taschi. Was kommt, ist eine Überraschung!'),
      h('h3', {}, 'Team'), h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => choose(m)))),
      s.box.length ? [h('h3', {}, 'Lager'), h('div.grid', {}, s.box.slice(0, 60).map(m => monCard(game, m, 1, () => choose(m))))] : null),
      { hints: [['confirm', 'Anbieten'], ['back', 'Abbrechen']] });
    scr.onBack = () => { game.ui.pop(scr); resolve(null); };
    game.ui.push(scr);
  });
}

// Partner suchen: zuerst wartende Spieler, sonst selbst kurz warten. Liefert eine offene Verbindung oder null.
async function match(game, isCancelled, onStatus) {
  const end = performance.now() + WONDER_TIME * 1000;
  while (performance.now() < end && !isCancelled()) {
    for (const i of shuffled(WONDER_SLOTS)) {
      if (isCancelled()) return null;
      const link = new Link();
      onStatus('Suche Tauschpartner …');
      if (await link.joinAt(slotId(i), 6000).catch(() => false)) {
        const msg = await Promise.race([link.recv('hello'), sleep(6000).then(() => null)]);
        if (msg && link.open) { link.peerHello = msg; return link; }
      }
      link.reset(); link.end('retry');
    }
    // selbst warten (zufällige Dauer, damit sich zwei Wartende nicht verpassen)
    for (const i of shuffled(WONDER_SLOTS)) {
      if (isCancelled()) return null;
      const link = new Link();
      let guest = false;
      const r = await link.hostAt(slotId(i), () => { guest = true; }).catch(() => 'err');
      if (r === 'taken') { link.reset(); continue; }
      if (r !== 'ok') { onStatus('Online gerade nicht erreichbar …'); await sleep(2000); break; }
      onStatus('Warte auf einen Tauschpartner …');
      const until = performance.now() + 7000 + Math.random() * 7000;
      while (!guest && performance.now() < until && !isCancelled()) await sleep(200);
      if (guest && link.open) { link.send(L.hello(game.save)); return link; }
      link.reset(); link.end('retry');
      break;
    }
  }
  return null;
}

export async function openWonderTrade(game) {
  const s = game.save;
  const mine = await pickOffer(game);
  if (!mine) return;
  let cancelled = false, link = null;
  const status = h('p', {}, 'Suche Tauschpartner …');
  const wait = { el: panel(game, '🎲 Zufallstausch', h('div', {}, h('div.wonder-spin', {}, '🎲'), status, h('p.muted', {}, 'Dein Angebot: ' + L.nameOf(mine) + ' (Lv ' + mine.lv + '). Abbrechen ist jederzeit möglich.')), { small: true, hints: [['back', 'Abbrechen']] }) };
  wait.onBack = () => { cancelled = true; game.ui.pop(wait); };
  game.ui.push(wait);
  try {
    link = await match(game, () => cancelled, (t) => { status.textContent = t; });
    if (cancelled) return;
    if (!link) { game.ui.pop(wait); game.ui.toast('Gerade sucht niemand. Versuch es gleich noch einmal!', '🎲'); return; }
    if (link.role === 'guest') link.send(L.hello(s));
    status.textContent = 'Partner gefunden! Tausch läuft …';
    const helloMsg = link.role === 'host' ? await Promise.race([link.recv('hello'), sleep(8000).then(() => null)]) : link.peerHello;
    const pack = L.packMon(mine); pack.ot = mine.ot || s.player.name;
    link.send({ t: 'wonder', mon: pack });
    const d = await Promise.race([link.recv('wonder'), sleep(15000).then(() => null)]);
    const peerName = L.cleanHello(helloMsg)?.name || 'Trainer';
    const theirs = d?.mon ? L.unpackMon(d.mon, { ot: peerName }) : null;
    if (!theirs || cancelled) { if (!cancelled) { game.ui.pop(wait); game.ui.toast('Der Tausch ist abgebrochen – dein Taschi bleibt bei dir.', '🎲'); } return; }
    link.send({ t: 'wonderOk' });
    const r = L.applyTrade(s, mine, theirs);
    game.ui.pop(wait);
    if (!r.ok) { game.ui.toast(r.text, '⚠'); return; }
    s.stats.wonder = (s.stats.wonder || 0) + 1;
    game.audio.sfx('evolve'); game.world.refreshFollower?.(); game.dexRewards?.(); game.saveNow(true);
    await tradeScene(game, mine, theirs, { name: peerName });
    await game.ui.say([{ text: 'Zufallstausch mit ' + peerName + '! ' + r.text }]);
  } finally {
    if (link && !link.closed) { await sleep(400); link.close(); }
  }
}
