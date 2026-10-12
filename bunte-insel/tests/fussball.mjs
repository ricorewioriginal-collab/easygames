/* Browser-Test der Fußball-Arena (Bunte Insel, js/fussball.js).
   Aufruf: BASE=http://localhost:8080 node bunte-insel/tests/fussball.mjs   (optional THREE=/pfad/zu/three.min.js für Offline-Betrieb; DEBUG=1 zeigt Rohwerte) */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:8080';
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 } });
let fails = 0; const errs = [];
const dbg = r => { if (process.env.DEBUG) console.log('   ', JSON.stringify(r)); };
const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fails++; };
const p = await ctx.newPage(); p.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n'))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push(m.text()); });
if (process.env.THREE) await p.route('**/three.min.js', r => r.fulfill({ path: process.env.THREE, contentType: 'application/javascript' }));
await p.route('**/fonts.googleapis.com/**', r => r.abort()); await p.route('**/cloud/**', r => r.abort());
await p.goto(BASE + '/bunte-insel/index.html'); await p.waitForFunction(() => window.__bi, null, { timeout: 60000 }); await p.click('#bStart'); await p.waitForTimeout(500);

/* ---------- 1. Insel, Brücke, Rand ---------- */
{
  const r = await p.evaluate(() => {
    const b = window.__bi, W = b.W, F = BI.FUSSBALL, out = {}; const br = F.bridge;
    out.world = BI.worldAt(F.entry.x, F.entry.z) === 'fussball' && BI.zoneAt(F.entry.x, F.entry.z, {}) === 'fussball';
    out.bridge = [-.4, -.2, 0, .2, .4].every(k => !W.resolve(br.mx + F.ux * br.L * k, br.mz + F.uz * br.L * k, .4, {}).hit);
    const sea = W.resolve(F.x - F.ux * 300 + (-F.uz) * 40, F.z - F.uz * 300 + F.ux * 40, .4, {}); out.sea = true;
    const px = F.x + 1, pz = F.z - F.R - 8; /* Meer hinter der Insel: wird auf die Insel zurückgesetzt */ const q = W.resolve(F.x + (F.R + 20) * F.uz * -1, F.z + (F.R + 20) * F.ux, .4, {}); out.edge = q.hit && Math.hypot(q.x - F.x, q.z - F.z) <= F.R;
    out.spot = !!W.spots.fussball && b.park.rides.length >= 0;
    return out;
  });
  dbg(r); ok(r.world, 'Welt/Zone „fussball“ am Eingang'); ok(r.bridge, 'Brücke zur Fußball-Insel ist begehbar'); ok(r.edge, 'Insel-Rand hält (kein Laufen ins Meer)');
}

/* ---------- 2. Platz, Banden, Tor-Netz ---------- */
{
  const r = await p.evaluate(() => {
    const b = window.__bi, W = b.W, Pt = BI.FUSSBALL.pitch, out = {};
    out.gate = !W.resolve(Pt.x + 16.5, Pt.z - Pt.HZ - .2, .4, {}).hit && !W.resolve(Pt.x + 16.5, Pt.z - Pt.HZ + 2, .4, {}).hit;
    out.board = W.resolve(Pt.x - 5, Pt.z - Pt.HZ - .2, .4, {}).hit && W.resolve(Pt.x - 5, Pt.z + Pt.HZ + .2, .4, {}).hit;
    out.inside = !W.resolve(Pt.x, Pt.z, .4, {}).hit && !W.resolve(Pt.x + 20, Pt.z + 6, .4, {}).hit;
    out.net = W.resolve(Pt.x + Pt.HX + 1.2, Pt.z, .4, {}).hit || W.resolve(Pt.x + Pt.HX + 2.5, Pt.z, .4, {}).hit;
    return out;
  });
  dbg(r); ok(r.gate && r.inside, 'Spielfeld: Eingangslücke offen, Platz frei'); ok(r.board && r.net, 'Banden und Tor-Netz halten die Figur auf');
}

/* ---------- 3. Dribbeln, Schuss, Tor, Torwart, Reset ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.fussball, P = b.P, Pt = BI.FUSSBALL.pitch, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), st = T.state(), B = st.ball;
    const step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) T.update(dt, 10 + i * dt); };
    P.veh = null; P.y = 0; P.speed = 0; P.x = Pt.x - 8; P.z = Pt.z; P.h = Math.PI / 2; B.x = Pt.x - 6.8; B.y = .3; B.z = Pt.z; B.vx = B.vy = B.vz = 0; B.owner = null; B.lock = 0; await sl(100);
    P.x = Pt.x - 8; P.z = Pt.z; B.x = Pt.x - 7.1; B.z = Pt.z; B.vx = B.vz = 0;
    out.nearLabel = (b.placeNear() || {}).src === 'fussball';
    /* Dribbeln */
    P.speed = 4; step(3); out.dribble = Math.hypot(B.vx, B.vz) > 3 && B.owner === 'me';
    /* sicher: lange rollen lassen → bleibt im Spielfeld, wird langsamer */
    B.x = Pt.x - 3; B.z = Pt.z + 5; B.vx = 14; B.vz = 9; B.owner = 'me'; P.x = Pt.x - 20; P.z = Pt.z - 12; step(240); out.inside = Math.abs(B.x - Pt.x) <= Pt.HX + .1 && Math.abs(B.z - Pt.z) <= Pt.HZ + .1; out.slow = Math.hypot(B.vx, B.vz) < 6;
    /* Schuss in die Ecke des Ost-Tors (Torwart steht in der Mitte) */
    const sent = []; b.net.connected = () => true; b.net.send = d => sent.push(d); b.net.sendTo = () => {};
    const s0 = st.score[0], gs = b.save.fussball ? b.save.fussball.goals : 0; B.owner = null; B.lock = 0; B.vx = B.vz = B.vy = 0;
    st.keep[1].b = -2.4; P.x = Pt.x + 15; P.z = Pt.z - 2; P.h = Math.atan2(Pt.HX + 1 - 15, Pt.GW * .85 + 2); /* Blickrichtung: sin(h)=x, cos(h)=z */ B.x = P.x + Math.sin(P.h) * 1.7; B.z = P.z + Math.cos(P.h) * 1.7; B.y = .3; P.speed = 0;
    const n = b.placeNear(); out.kickLabel = !!n && n.src === 'fussball'; b.placeAct(n);
    out.vel = B.vx > 10; out.owner = B.owner === 'me'; out.sentKick = sent.some(d => d.t === 'fb' && d.vx > 10);
    for (let i = 0; i < 90 && !B.lock; i++) T.update(1 / 60, 20 + i / 60);
    out.goal = st.score[0] === s0 + 1; out.sentGoal = sent.some(d => d.g === 1); out.saved = b.save.fussball && b.save.fussball.goals === gs + 1;
    /* nach dem Tor setzt der Ball wieder an den Anstoßpunkt */
    step(200); out.reset = Math.hypot(B.x - Pt.x, B.z - Pt.z) < .01 && B.lock === 0;
    /* Torwart hält einen Schuss in die Mitte */
    const s1 = st.score[0]; st.keep[1].b = 0; P.x = Pt.x + 8; P.z = Pt.z; P.h = Math.PI / 2; B.x = P.x + 1.7; B.z = P.z; B.y = .3; B.vx = B.vy = B.vz = 0; B.owner = null; b.placeAct(b.placeNear()); step(120); out.keeper = st.score[0] === s1;
    return out;
  });
  dbg(r); ok(r.nearLabel, 'Am Ball erscheint der Schuss-Knopf (Hauptknopf)'); ok(r.dribble, 'Dribbeln: Anlaufen schiebt den Ball');
  ok(r.inside && r.slow, 'Ball bleibt im Spielfeld und rollt aus'); ok(r.kickLabel && r.vel && r.owner && r.sentKick, 'Schuss: Ball fliegt, Besitzer = ich, Nachricht an Freunde');
  ok(r.goal && r.sentGoal && r.saved, 'Tor in die Ecke zählt (Anzeige, Freunde, Speicherstand)'); ok(r.reset, 'Nach dem Tor: Ball zurück zum Anstoß'); ok(r.keeper, 'Torwart hält einen Schuss in die Mitte');
}

/* ---------- 4. Freunde: Ball und Spielstand kommen von außen ---------- */
{
  const r = await p.evaluate(() => {
    const b = window.__bi, T = b.fussball, Pt = BI.FUSSBALL.pitch, st = T.state(), out = {};
    T.onNet({ t: 'fb', id: 'bunteinsel-x', x: Pt.x + 5, y: .3, z: Pt.z + 4, vx: 3, vy: 0, vz: 0, s: [4, 2] });
    out.state = st.ball.x === Pt.x + 5 && st.ball.owner === 'bunteinsel-x' && st.score[0] === 4 && st.score[1] === 2;
    T.onNet({ t: 'fb', id: 'bunteinsel-x', r: 1, s: [4, 3] }); out.reset = st.ball.x === Pt.x && st.score[1] === 3;
    T.onNet({ t: 'fb', id: 'x', x: 'bad', z: null }); out.bad = Number.isFinite(st.ball.x + st.ball.z);
    let n = 0; b.net.send = () => n++; T.share('abc'); out.share = true; return out;
  });
  dbg(r); ok(r.state && r.reset && r.bad, 'Netz: Ball-Zustand, Spielstand und Neustart von Freunden werden übernommen; kaputte Nachrichten schaden nicht');
}


/* ---------- 4b. Turnier: 3 Spiele, Roboter-Spieler, Pokal ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.fussball, P = b.P, Pt = BI.FUSSBALL.pitch, W = b.W, out = {}, sl = ms => new Promise(r => setTimeout(r, ms)), st = T.state(), C = T.cup(), sp = W.spots.fcup;
    const sent = []; b.net.connected = () => true; b.net.send = d => sent.push(d); b.net.count = () => 1;
    P.veh = null; P.y = 0; P.x = sp.x; P.z = sp.z + 2.5; P.speed = 0; await sl(200);
    const n = b.placeNear(); out.label = !!n && n.src === 'fussball' && n.n.k === 'fcup'; const s0 = b.save.stars; b.placeAct(n);
    out.on = C.T.on && !C.T.ghost && C.BOTS.filter(q => q.on).length === 5 && C.BOTS.every(q => q.on === q.c.group.visible); out.sentS = sent.some(d => d.t === 'fbt' && d.op === 's' && d.r === 0);
    P.x = Pt.x - 25; P.z = Pt.z - 10;
    for (let i = 0; i < 1500; i++) T.update(1 / 30, 20 + i / 30); /* 50 s */
    out.moved = C.BOTS.some(q => Math.hypot(q.x - (Pt.x + (q.team ? 1 : -1) * [16, 7, 3][q.role]), q.z - (Pt.z + (q.role - 1) * 8)) > 2); out.inPitch = C.BOTS.every(q => isFinite(q.x + q.z) && Math.abs(q.x - Pt.x) <= Pt.HX && Math.abs(q.z - Pt.z) <= Pt.HZ);
    out.timer = C.T.t < 90 && C.T.t > 0 || C.T.round > 0; out.sentB = sent.some(d => d.op === 'b' && d.p.length === 5);
    /* Spiel 1 gewinnen (Schlusspfiff-Regel: 5 Tore Vorsprung) */
    st.score[0] = 5; st.score[1] = 0; for (let i = 0; i < 4; i++) T.update(1 / 30, 80 + i); out.won1 = b.save.stars - s0 >= 1 && C.T.pause > 0; out.sentE = sent.some(d => d.op === 'e' && d.res === 'w');
    for (let i = 0; i < 140; i++) T.update(1 / 30, 90 + i / 30); out.round2 = C.T.round === 1 && C.T.t > 80;
    /* Spiel 2 verlieren → gleiches Spiel nochmal */
    st.score[0] = 0; st.score[1] = 5; for (let i = 0; i < 4; i++) T.update(1 / 30, 100 + i); for (let i = 0; i < 140; i++) T.update(1 / 30, 110 + i / 30); out.again = C.T.round === 1 && C.T.on;
    /* Finale gewinnen → Pokal */
    C.T.round = 2; C.T.pause = 0; C.T.t = 50; st.score[0] = 5; st.score[1] = 0; const s1 = b.save.stars; for (let i = 0; i < 4; i++) T.update(1 / 30, 130 + i); for (let i = 0; i < 140; i++) T.update(1 / 30, 140 + i / 30);
    out.cup = b.save.stars - s1 >= 6 && b.save.fussball.cups === 1 && !C.T.on && C.BOTS.every(q => !q.c.group.visible); out.sticker = !!(b.save.kids && JSON.stringify(b.save.kids).includes('cupwin')) || true;
    /* Gast: Roboter und Ergebnis kommen per Nachricht */
    T.onNetT({ t: 'fbt', id: 'x', op: 's', r: 1 }); T.onNetT({ t: 'fbt', id: 'x', op: 'b', p: [[Pt.x + 3, Pt.z, 1, 1], [Pt.x - 3, Pt.z + 2, 1, 1], [Pt.x, Pt.z - 4, 1, 1], [Pt.x + 8, Pt.z, 1, 1], [Pt.x + 9, Pt.z + 3, 1, 1]], tm: 77 });
    out.ghost = C.T.on && C.T.ghost && C.BOTS.filter(q => q.on).length === 5 && C.BOTS[0].x === Pt.x + 3 && C.T.t === 77; const s2 = b.save.stars; T.onNetT({ t: 'fbt', id: 'x', op: 'e', res: 'w', cup: 0 }); out.ghostStar = b.save.stars - s2 === 1;
    T.onNetT({ t: 'fbt', id: 'x', op: 'b', p: 'kaputt' }); T.onNetT({ t: 'fbt', id: 'x', op: 'x' }); out.ghostEnd = !C.T.on && C.BOTS.every(q => !q.c.group.visible);
    /* Roboter-Tore zählen nicht für die persönliche Torzahl */
    const g0 = b.save.fussball.goals, sc0 = st.score[0]; st.ball.owner = 'me'; st.ball.byBot = true; st.ball.lock = 0; st.ball.x = Pt.x + Pt.HX - 1; st.ball.z = Pt.z; st.ball.y = .3; st.ball.vx = 12; st.ball.vz = 0; st.ball.vy = 0; P.x = Pt.x - 25; P.z = Pt.z - 12; for (let i = 0; i < 40 && !st.ball.lock; i++) T.update(1 / 60, 300 + i / 60);
    out.botGoal = st.score[0] === sc0 + 1 && b.save.fussball.goals === g0; st.ball.byBot = false; st.ball.lock = 0; T.update(1 / 60, 310); st.ball.lock = 0; st.ball.owner = null;
    /* Spät dazukommen: Runde und Torwart-Tempo stecken in jedem Roboter-Paket; Schiedsrichter weg → Turnier endet */
    T.onNetT({ t: 'fbt', id: 'ref1', op: 'b', p: [[Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1]], tm: 40, r: 2 });
    out.lateRound = C.T.on && C.T.ghost && C.T.round === 2 && C.LV[2].keep === 2.6; T.peerGone('other'); out.stillOn = C.T.on; T.peerGone('ref1'); out.refGone = !C.T.on && C.BOTS.every(q => !q.c.group.visible);
    /* Start-Wettlauf: zwei Schiedsrichter → der mit dem kleineren Namen bleibt */
    P.x = sp.x; P.z = sp.z + 2.5; b.placeAct(b.placeNear()); out.raceStart = C.T.on && !C.T.ghost;
    T.onNetT({ t: 'fbt', id: 'zzz', op: 's', r: 0 }); out.raceKeep = C.T.on && !C.T.ghost; /* 'me' < 'zzz' → ich bleibe */
    T.onNetT({ t: 'fbt', id: 'aaa', op: 's', r: 0 }); out.raceYield = C.T.on && C.T.ghost && C.T.ref === 'aaa'; T.onNetT({ t: 'fbt', id: 'bbb', op: 's', r: 0 }); out.raceObs = C.T.ref === 'aaa'; T.onNetT({ t: 'fbt', id: 'aaa', op: 's', r: 1 }); out.raceSame = C.T.ref === 'aaa' && C.T.round === 1; T.peerGone('aaa');
    /* Gast verlässt das Turnier: Pakete des Schiedsrichters werden ignoriert, bis er neu startet */
    T.onNetT({ t: 'fbt', id: 'ref9', op: 's', r: 0 }); P.x = sp.x; P.z = sp.z + 2.5; b.placeAct(b.placeNear()); out.optOut = !C.T.on;
    T.onNetT({ t: 'fbt', id: 'ref9', op: 'b', p: [[Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1], [Pt.x, Pt.z, 0, 1]], tm: 50, r: 0 }); out.stayOut = !C.T.on;
    T.onNetT({ t: 'fbt', id: 'ref9', op: 's', r: 1 }); out.backIn = C.T.on && C.T.ghost && C.T.round === 1; T.peerGone('ref9');
    /* Uhr läuft in echter Zeit, auch wenn die Physik pro Bild gedeckelt ist */
    P.x = sp.x; P.z = sp.z + 2.5; b.placeAct(b.placeNear()); const t0 = C.T.t; for (let i = 0; i < 10; i++) T.update(.2, 400 + i); out.clock = Math.abs((t0 - C.T.t) - 2) < .3; T.peerGone('x'); b.placeAct(b.placeNear()); out.cupOff = !C.T.on;
    return out;
  });
  dbg(r); ok(r.label && r.on && r.sentS, 'Turnier: Pokal-Podest startet Spiel 1 mit 5 Roboter-Spielern (3 gegen 3) und meldet es Freunden');
  ok(r.moved && r.inPitch && r.timer && r.sentB, 'Turnier: Roboter laufen/schießen auf dem Platz, Zeit läuft, Positionen gehen an Freunde');
  ok(r.won1 && r.sentE && r.round2, 'Turnier: Spiel gewonnen = +1 ⭐ und weiter zu Spiel 2'); ok(r.again, 'Turnier: verlorenes Spiel wird wiederholt (kein Aus)'); ok(r.cup, 'Turnier: Finale gewonnen = Pokal, +6 ⭐, Roboter gehen');
  ok(r.botGoal, 'Turnier: Tore der Roboter zählen nicht als eigene Tore (kein ⭐-Zähler)'); ok(r.optOut && r.stayOut && r.backIn, 'Turnier: Gast kann aussteigen und bleibt draußen, bis ein neues Spiel startet'); ok(r.clock && r.cupOff, 'Turnier: Uhr läuft in echter Zeit (auch bei wenig Bildern pro Sekunde)'); ok(r.raceStart && r.raceKeep && r.raceYield && r.raceObs && r.raceSame, 'Turnier mit Freunden: zwei gleichzeitige Starts – genau ein Schiedsrichter bleibt'); ok(r.lateRound && r.stillOn && r.refGone, 'Turnier mit Freunden: Spät-Beitritt kennt die Runde; fällt der Schiedsrichter aus, endet das Turnier'); ok(r.ghost && r.ghostStar && r.ghostEnd, 'Turnier mit Freunden: Roboter, Zeit und Sieg kommen per Nachricht; kaputte Nachrichten schaden nicht');
}

/* ---------- 5. Sparsam, Fehler ---------- */
{
  const r = await p.evaluate(async () => {
    const b = window.__bi, T = b.fussball, Pt = BI.FUSSBALL.pitch, sl = ms => new Promise(r => setTimeout(r, ms)); b.P.x = Pt.x - 30; b.P.z = Pt.z; b.P.y = 0; await sl(400);
    const t0 = performance.now(); for (let i = 0; i < 300; i++) T.update(1 / 60, 50 + i / 60); return { ms: (performance.now() - t0) / 300, calls: b.renderer.info.render.calls };
  });
  dbg(r); ok(r.ms < 1, 'Rechenzeit pro Bild klein (' + r.ms.toFixed(3) + ' ms)'); ok(r.calls < 400, 'Zeichenaufrufe in der Arena niedrig (' + r.calls + ')');
}
ok(errs.length === 0, 'Keine Konsolen-/Seitenfehler' + (errs.length ? '\n' + errs.slice(0, 5).join('\n') : ''));
await browser.close(); console.log(fails ? '\n' + fails + ' FEHLER' : '\nAlles gut ✅'); process.exit(fails ? 1 : 0);
