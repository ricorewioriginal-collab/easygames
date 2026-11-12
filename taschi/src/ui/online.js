// 🌐 Online: Taschis tauschen und gegeneinander kämpfen – mit Freunden auf
// jedem Gerät (Browser, App, Handy, TV). Ein Gerät eröffnet einen Raum, das
// andere tritt per Code, Link oder QR-Code bei. Bedienung wie überall im Spiel
// (Touch, Tastatur/Maus, Controller) über das gemeinsame Fokus-Modell.
import { h, FocusNav, typeBadge } from './ui.js';
import { panel, monCard, portrait } from './menus.js';
import { SPECIES } from '../data/species.js';
import { PLAYER_PRESETS } from '../engine/characters.js';
import { Link } from '../core/net.js';
import * as L from '../logic/link.js';
import { openWonderTrade } from './wonder.js';
import { Coop } from '../game/coop.js';

const nameOf = L.nameOf;
let qrLib = null;
function loadQr() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  qrLib ||= new Promise((res, rej) => { const s = document.createElement('script'); s.src = new URL('../vendor/qrcode-generator-1.4.4.js', document.baseURI).href; s.onload = () => res(window.qrcode); s.onerror = () => { qrLib = null; rej(new Error('qr')); }; document.head.append(s); });
  return qrLib;
}
// Mehrspieler-Regel: Einladungslinks zeigen immer auf die easygames-Homepage
export function joinUrl(code) {
  const u = location.href.split('#')[0].split('?')[0] + '#join=' + code;
  return window.EasyGamesLink ? window.EasyGamesLink.share(u) : u;
}
export function joinCodeFromUrl() { const m = /[#&]join=([A-Za-z0-9]{5})/.exec(location.hash); return m ? L.normCode(m[1]) : null; }

// Bildschirm mit Neuaufbau (wie die anderen Zusatz-Bildschirme)
function live(game, build) {
  const screen = { el: null };
  const rerender = () => { if (!screen.el) return; const old = screen.el; screen.el = build(); screen.el.classList.add('noanim'); old.replaceWith(screen.el); screen.nav = new FocusNav(screen.el); screen.nav.ensure(); };
  screen.el = build();
  game.ui.push(screen);
  const close = () => { if (game.ui.stack.includes(screen)) game.ui.pop(screen); };
  return { screen, rerender, close };
}

// ------------------------------------------------------------------ Einstieg
export async function openOnline(game, { join = null } = {}) {
  let link = null, kept = false;
  try {
    link = join ? await joinRoom(game, join) : await startScreen(game);
    if (!link) return;
    const peer = await greet(game, link);
    if (!peer) { game.ui.toast('Keine Antwort vom Mitspieler.', '🌐'); return; }
    game.audio.sfx('item');
    game.ui.toast('Verbunden mit ' + peer.name + '!', '🌐');
    kept = await lobby(game, link, peer);
  } finally {
    if (link && !link.closed && !kept) link.close();
    try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { }
  }
}

function startScreen(game) {
  return new Promise(resolve => {
    let busy = false;
    const v = live(game, () => panel(game, '🌐 Online: Tauschen & Kämpfen', h('div', {},
      h('p', {}, 'Tausche Taschis mit Freunden oder tritt im Online-Kampf gegen sie an. Mitspieler treten per Link, QR-Code oder Code von überall bei – im Browser, in der App, am Handy oder am Fernseher.'),
      h('div.list', {},
        h('button.row.focusable', { 'data-autofocus': '', onclick: async () => { if (busy) return; busy = true; const l = await hostRoom(game); busy = false; if (l) { v.close(); resolve(l); } } },
          h('div.grow', {}, h('b', {}, '📡 Raum eröffnen'), h('div.muted', {}, 'Du bekommst einen Code und einen Link zum Teilen.'))),
        h('button.row.focusable', { onclick: async () => {
          if (busy) return;
          const code = L.normCode(await game.ui.textEntry({ title: 'Raumcode (5 Zeichen)', max: 5, placeholder: 'ABCDE' }) || '');
          if (!code) return;
          if (!L.isCode(code)) { game.ui.toast('Der Code hat 5 Zeichen (Buchstaben und Ziffern).', '🌐'); return; }
          busy = true; const l = await joinRoom(game, code); busy = false;
          if (l) { v.close(); resolve(l); }
        } }, h('div.grow', {}, h('b', {}, '🔑 Mit Code beitreten'), h('div.muted', {}, 'Den Code zeigt das Gerät, das den Raum eröffnet hat.'))),
        h('button.row.focusable', { onclick: () => { if (busy) return; v.close(); resolve(null); openWonderTrade(game); } },
          h('div.grow', {}, h('b', {}, '🎲 Zufallstausch'), h('div.muted', {}, 'Ein Taschi mit einem zufälligen Spieler irgendwo auf der Welt tauschen.')))),
      h('p.muted', {}, 'Getauscht und gekämpft wird direkt von Gerät zu Gerät. Im Online-Kampf kämpfen je drei Taschis auf Level ' + 50 + ', ohne Gegenstände aus der Tasche.')), { small: true }));
    v.screen.onBack = () => { v.close(); resolve(null); };
  });
}

async function hostRoom(game) {
  const link = new Link();
  let code;
  game.ui.toast('Raum wird eröffnet …', '📡');
  try { code = await link.host(() => link.onGuest?.()); }
  catch (e) { game.ui.toast('Online gerade nicht erreichbar. Prüfe die Internetverbindung.', '⚠'); return null; }
  const url = joinUrl(code);
  return new Promise(resolve => {
    const qr = h('div.qrbox', {});
    loadQr().then(q => { const g = q(0, 'M'); g.addData(url); g.make(); qr.innerHTML = g.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }).catch(() => qr.remove());
    const v = live(game, () => panel(game, '📡 Raum ' + code, h('div', {},
      h('p', {}, 'Mitspieler können von überall beitreten: Link öffnen, QR-Code scannen oder im Online-Menü den Code eingeben.'),
      h('div.joincode', {}, code),
      qr,
      h('p.muted.linktext', {}, url),
      h('div.optrow', {},
        h('button.chip.focusable', { 'data-autofocus': '', onclick: async () => {
          try { if (navigator.share && /Android|iPhone|iPad/.test(navigator.userAgent)) await navigator.share({ title: 'TASCHI', text: 'Tausch und kämpf mit mir in TASCHI! Code ' + code, url }); else { await navigator.clipboard.writeText(url); game.ui.toast('Link kopiert!', '📋'); } }
          catch (e) { game.ui.toast('Link: ' + url, '📋'); }
        } }, '📋 Link teilen'),
        h('button.chip.focusable', { onclick: () => { v.close(); link.close(); resolve(null); } }, 'Raum schließen')),
      h('p.muted', {}, '⏳ Warte auf Mitspieler …')), { small: true, hints: [['back', 'Raum schließen']] }));
    v.screen.onBack = () => { v.close(); link.close(); resolve(null); };
    link.onGuest = () => { v.close(); resolve(link); };
  });
}

async function joinRoom(game, code) {
  const link = new Link();
  game.ui.toast('Verbinde mit Raum ' + code + ' …', '🔑');
  try { await link.join(code); return link; }
  catch (e) {
    game.ui.toast(e.message === 'nocode' ? 'Raum ' + code + ' gibt es nicht (mehr).' : 'Verbindung fehlgeschlagen. Prüfe Code und Internet.', '⚠');
    return null;
  }
}

async function greet(game, link) {
  link.send(L.hello(game.save));
  const d = await Promise.race([link.recv('hello'), new Promise(r => setTimeout(() => r(null), 15000))]);
  return L.cleanHello(d);
}

// ------------------------------------------------------------------ Lobby
// Koop läuft schon: dieselbe Lobby mit dem verbundenen Freund (ohne Trennen)
export async function coopLobby(game, coop) { await lobby(game, coop.link, coop.peer); }
async function lobby(game, link, peer) {
  while (!link.closed) {
    const what = await lobbyScreen(game, link, peer);
    if (what === 'trade') await tradeFlow(game, link, peer);
    else if (what === 'battle') await battleFlow(game, link, peer);
    else if (what === 'coop') { if (!game.coop) new Coop(game, link, peer); return true; }
    else break;
  }
  if (link.closed && link.reason !== 'bye-self') game.ui.toast(peer.name + ' hat die Verbindung beendet.', '🌐');
}

const WHAT = { trade: '🔁 Taschi tauschen', battle: '⚔ Online-Kampf', coop: '🤝 Zusammen erkunden' };
function lobbyScreen(game, link, peer) {
  return new Promise(resolve => {
    let waiting = null, asking = false;
    const finish = (v) => { off(); vw.close(); resolve(v); };
    const off = link.on((d) => {
      if (d.t === 'closed') { finish('closed'); return true; }
      if (d.t === 'ask' && WHAT[d.what]) {
        if (waiting === d.what) { link.send({ t: 'answer', what: d.what, ok: true }); finish(d.what); return true; }
        if (waiting || asking) { link.send({ t: 'answer', what: d.what, ok: false }); return true; }
        asking = true;
        game.audio.sfx('confirm');
        game.ui.ask([{ who: peer.name, text: d.what === 'trade' ? 'Lust auf einen Tausch?' : d.what === 'coop' ? 'Wollen wir zusammen die Welt erkunden? Wir sehen uns dann in derselben Region und können gemeinsam Raids bestreiten.' : 'Ich fordere dich zum Online-Kampf heraus! (3 gegen 3, Level 50)' }], ['Annehmen', 'Ablehnen'], { cancelIndex: 1 }).then(c => {
          asking = false;
          if (link.closed) return;
          link.send({ t: 'answer', what: d.what, ok: c === 0 });
          if (c === 0) finish(d.what);
        });
        return true;
      }
      if (d.t === 'answer' && d.what === waiting) {
        waiting = null;
        if (d.ok) finish(d.what); else { game.ui.toast(peer.name + ' möchte gerade nicht.', '🌐'); vw.rerender(); }
        return true;
      }
      return false;
    });
    const propose = (what) => { if (waiting) return; waiting = what; link.send({ t: 'ask', what }); vw.rerender(); };
    const vw = live(game, () => panel(game, '🌐 Verbunden mit ' + peer.name, h('div', {},
      h('p', {}, h('span.pill', {}, '🏅 ' + peer.badges + '/16 Siegel'), ' ', h('span.pill', {}, '◉ ' + peer.caught + ' Taschis gefangen'), ' ', h('span.pill', {}, 'Raum ' + link.code)),
      waiting ? h('p', {}, '⏳ Warte auf Antwort von ' + peer.name + ' …') : h('p.muted', {}, 'Was wollt ihr machen? Die andere Seite muss zustimmen.'),
      h('div.list', {},
        h('button.row.focusable', { 'data-autofocus': '', onclick: () => propose('trade') }, h('div.grow', {}, h('b', {}, WHAT.trade), h('div.muted', {}, 'Jeder bietet ein Taschi aus Team oder Lager an. Getauscht wird, wenn beide bestätigen.'))),
        h('button.row.focusable', { onclick: () => propose('battle') }, h('div.grow', {}, h('b', {}, WHAT.battle), h('div.muted', {}, 'Je drei Taschis, alle auf Level 50, ohne Items aus der Tasche. Keine EP, kein Risiko.'))),
        game.coop?.link === link ? null : h('button.row.focusable', { onclick: () => propose('coop') }, h('div.grow', {}, h('b', {}, WHAT.coop), h('div.muted', {}, 'Ihr bleibt verbunden, seht euch in derselben Region und kämpft gemeinsam gegen Sternennest-Riesen.'))),
        game.coop?.link === link ? h('button.row.focusable', { onclick: () => finish('leave') }, h('div.grow', {}, h('b', {}, '↩ Zurück zum Erkunden')))
          : h('button.row.focusable', { onclick: () => { link.close(); finish('leave'); } }, h('div.grow', {}, h('b', {}, '✕ Verbindung trennen'))))), { small: true, hints: [['confirm', 'Wählen'], ['back', game.coop?.link === link ? 'Zurück' : 'Trennen']] }));
    vw.screen.onBack = () => { if (game.coop?.link !== link) link.close(); finish('leave'); };
  });
}

// ------------------------------------------------------------------ Tausch
const sigOf = (d) => d ? [d.id, d.lv, d.iv?.hp, d.iv?.atk, d.iv?.def, d.iv?.speed, d.nature, (d.moves || []).map(x => x.id).join('+')].join(':') : '-';
function tradeFlow(game, link, peer) {
  const s = game.save, host = link.role === 'host';
  let mine = null, minePack = null, theirs = null, theirPack = null, okMine = false, okTheirs = null, done = false;
  const sig = () => host ? sigOf(minePack) + '|' + sigOf(theirPack) : sigOf(theirPack) + '|' + sigOf(minePack);
  return new Promise(resolve => {
    const finish = async (msg) => { if (done) return; done = true; off(); vw.close(); if (msg) game.ui.toast(msg, '🔁'); resolve(); };
    const tryComplete = async () => {
      if (!okMine || okTheirs !== sig() || !mine || !theirs) return;
      const r = L.applyTrade(s, mine, theirs);
      if (!r.ok) { game.ui.toast(r.text, '⚠'); return; }
      done = true; off(); vw.close();
      game.audio.sfx('evolve');
      game.world.refreshFollower?.();
      game.dexRewards?.();
      game.saveNow(true);
      await tradeScene(game, mine, theirs, peer);
      await game.ui.say([{ text: 'Tausch geglückt! ' + r.text }]);
      resolve();
    };
    const off = link.on((d) => {
      if (d.t === 'closed') { finish('Verbindung getrennt – nichts wurde getauscht.'); return true; }
      if (d.t === 'offer') { theirPack = d.mon || null; theirs = theirPack ? L.unpackMon(theirPack, { ot: peer.name }) : null; okTheirs = null; okMine = false; game.audio.sfx('confirm'); vw.rerender(); return true; }
      if (d.t === 'tradeOk') { okTheirs = d.sig; vw.rerender(); tryComplete(); return true; }
      if (d.t === 'tradeEnd') { finish(peer.name + ' hat den Tausch beendet.'); return true; }
      return false;
    });
    const pick = (m) => {
      const c = L.canOffer(s, m); if (!c.ok) { game.audio.sfx('error'); game.ui.toast(c.text, '🔁'); return; }
      mine = m; minePack = L.packMon(m); minePack.ot = m.ot || s.player.name; okMine = false;
      link.send({ t: 'offer', mon: minePack }); game.audio.sfx('confirm'); vw.rerender();
    };
    const offerCard = (m, who) => m ? h('div.card.offer', {}, portrait(game, m.id), h('div.meta', {}, h('div.name', {}, nameOf(m) + (m.shiny ? ' ✨' : '') + '  ', h('span.muted', {}, 'Lv ' + m.lv)),
      h('div', {}, typeBadge(SPECIES[m.id].type), SPECIES[m.id].type2 ? typeBadge(SPECIES[m.id].type2) : null), h('div.sub', {}, who + (m.held ? ' · trägt ein Item' : ''))))
      : h('div.card.offer.empty', {}, h('div.meta', {}, h('div.sub', {}, who + ': noch nichts gewählt')));
    const vw = live(game, () => panel(game, '🔁 Tauschen mit ' + peer.name, h('div', {},
      h('div.tradebox', {}, offerCard(mine, 'Dein Angebot'), h('div.tradearrow', {}, '⇄'), offerCard(theirs, 'Angebot von ' + peer.name)),
      h('div.optrow', {},
        h('button.bigbtn.primary.focusable' + (mine && theirs && !okMine ? '' : '.disabled'), { onclick: () => {
          if (!mine || !theirs) { game.ui.toast('Beide müssen ein Taschi anbieten.', '🔁'); return; }
          okMine = true; link.send({ t: 'tradeOk', sig: sig() }); game.audio.sfx('confirm'); vw.rerender(); tryComplete();
        } }, okMine ? '✔ Bestätigt' : '✔ Tausch bestätigen'),
        h('button.chip.focusable', { onclick: () => { link.send({ t: 'tradeEnd' }); finish(null); } }, 'Abbrechen')),
      h('p.muted', {}, okMine && okTheirs !== sig() ? '⏳ Warte, bis ' + peer.name + ' bestätigt …' : okTheirs === sig() && okTheirs ? '✔ ' + peer.name + ' hat bestätigt.' : 'Wähle unten dein Angebot. Ändert jemand sein Angebot, muss neu bestätigt werden.'),
      h('h3', {}, 'Team'), h('div.grid', {}, s.team.map((m, i) => monCard(game, m, i, () => pick(m), m === mine ? { 'data-learn': 'Angebot', 'data-autofocus': '' } : {}))),
      s.box.length ? [h('h3', {}, 'Lager'), h('div.grid', {}, s.box.slice(0, 60).map(m => monCard(game, m, 1, () => pick(m), m === mine ? { 'data-learn': 'Angebot' } : {})))] : null),
      { hints: [['confirm', 'Wählen'], ['back', 'Abbrechen']] }));
    vw.screen.onBack = () => { link.send({ t: 'tradeEnd' }); finish(null); };
  });
}

// Kurze Tausch-Szene in der 3D-Vorschau
export async function tradeScene(game, gave, got, peer) {
  const el = h('div.viewport3d.camp', { id: 'tradeview' });
  const scr = { el: panel(game, '🔁 Tausch', h('div', {}, el, h('p', { style: { textAlign: 'center' } }, nameOf(gave) + ' reist zu ' + peer.name + ' …')), { small: true, hints: [] }), onBack: () => {} };
  game.ui.push(scr);
  await new Promise(r => requestAnimationFrame(r));
  game.preview.attach(el); game.preview.showCreature(gave.id, { shiny: !!gave.shiny });
  await new Promise(r => setTimeout(r, 1300));
  scr.el.querySelector('p').textContent = '… und ' + nameOf(got) + ' kommt zu dir!';
  game.preview.showCreature(got.id, { shiny: !!got.shiny }); game.preview.model?.play?.('happy', 1.2); game.audio.sfx('item');
  await new Promise(r => setTimeout(r, 1500));
  game.preview.detach();
  game.ui.pop(scr);
}

// ------------------------------------------------------------------ Kampf
function pickTeam(game, link, peer) {
  const s = game.save, picked = [];
  const all = [...s.team, ...s.box.slice(0, 30)];
  return new Promise(resolve => {
    const finish = (v) => { off(); vw.close(); resolve(v); };
    const off = link.on((d) => {
      if (d.t === 'closed') { finish(null); return true; }
      if (d.t === 'battleEnd') { game.ui.toast(peer.name + ' hat den Kampf abgesagt.', '⚔'); finish(null); return true; }
      return false;
    });
    const vw = live(game, () => panel(game, '⚔ Team für den Online-Kampf', h('div', {},
      h('p.muted', {}, 'Wähle drei Taschis gegen ' + peer.name + '. Alle kämpfen auf Level 50, geheilt, ohne Items aus der Tasche (getragene Items wirken). Es gibt keine EP und keine Niederlagen-Strafe.'),
      h('h3', {}, 'Team wählen (' + picked.length + '/' + L.LINK_TEAM + ')'),
      h('div.grid', {}, all.map((m, i) => monCard(game, m, i === 0 ? 0 : 1, () => { const k = picked.indexOf(m); if (k >= 0) picked.splice(k, 1); else if (picked.length < L.LINK_TEAM) picked.push(m); vw.rerender(); }, picked.includes(m) ? { 'data-learn': 'Gewählt ' + (picked.indexOf(m) + 1) } : {}))),
      h('div.optrow', {},
        h('button.bigbtn.primary.focusable' + (picked.length === Math.min(L.LINK_TEAM, all.length) ? '' : '.disabled'), { onclick: () => { if (picked.length !== Math.min(L.LINK_TEAM, all.length)) { game.ui.toast('Wähle drei Taschis.'); return; } finish(picked.slice()); } }, '▶ Bereit'),
        h('button.chip.focusable', { onclick: () => { link.send({ t: 'battleEnd' }); finish(null); } }, 'Abbrechen'))), { hints: [['confirm', 'Wählen'], ['back', 'Abbrechen']] }));
    vw.screen.onBack = () => { link.send({ t: 'battleEnd' }); finish(null); };
  });
}

async function battleFlow(game, link, peer) {
  const host = link.role === 'host';
  link.drop('team', 'choices', 'turn', 'rep', 'forfeit');
  const picked = await pickTeam(game, link, peer);
  if (!picked) return;
  const list = picked.map(L.packMon);
  link.send({ t: 'team', list });
  const wait = { el: panel(game, '⚔ Online-Kampf', h('p', {}, '⏳ Warte, bis ' + peer.name + ' bereit ist …'), { small: true, hints: [['back', 'Abbrechen']] }) };
  let cancelled = false;
  wait.onBack = () => { cancelled = true; link.send({ t: 'battleEnd' }); game.ui.pop(wait); link.deliver({ t: 'battleEnd', local: true }); };
  game.ui.push(wait);
  const d = await link.recv('team', 'battleEnd');
  if (game.ui.stack.includes(wait)) game.ui.pop(wait);
  if (cancelled || !d || d.t !== 'team') { if (d?.t === 'battleEnd' && !d.local) game.ui.toast(peer.name + ' hat den Kampf abgesagt.', '⚔'); link.drop('team'); return; }
  const mine = L.unpackTeam(list, host ? 'h' : 'g'), foe = L.unpackTeam(d.list, host ? 'g' : 'h');
  if (!mine || !foe) { game.ui.toast('Das Team der Gegenseite ist ungültig.', '⚠'); return; }
  const look = L.cleanLook(peer.look, PLAYER_PRESETS.d);
  const res = await game.battle({ kind: 'trainer', foeTeam: foe, playerTeam: mine, playerBag: {}, ai: 0, trainerName: peer.name, trainerTitle: '🌐', trainerLook: look,
    exhibition: true, canRun: false, canCatch: false, indoor: true, music: 'champion', online: { link, host, name: peer.name } });
  const s = game.save;
  s.stats = s.stats || {};
  if (res.outcome === 'win') s.stats.onlineWins = (s.stats.onlineWins || 0) + 1;
  if (res.outcome === 'win' || res.outcome === 'lose') s.stats.onlineBattles = (s.stats.onlineBattles || 0) + 1;
  game.saveNow();
}
