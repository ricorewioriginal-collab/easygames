/* AnMaCha – Der Podcast: Medienstadt wie ein „Medien-GTA“ – alles dreht sich um Podcast und Radio mit Andrew & Marco.
   - Medien-Aufträge mit Markern in der Stadt: Eilmeldung, Live-Schalte, Störsender-Jagd auf Ralf Rauschmann, Studiogast-Taxi, Hörerwunsch-Rallye.
     Jeder Auftrag gehört zu einem AnMaCha-Sender und bringt Themen-Funken für die Abendfolge, Sender-Ruf, Fan-Punkte und einen Post in der App.
   - Hype-Sterne: wilde Fahrten, Crashs und Hupkonzerte rufen Paparazzi auf den Plan; ab 5 Sternen kreist der Kanal-9-Hubschrauber mit Scheinwerfer.
   - Stunt-Rampen für Clips in der AnMaCha-App, Autoradio-Anzeige mit Senderlogo beim Fahren.
   Ein Bedienkonzept: Marker ansteuern und Ⓧ/E (zu Fuß) – im Auto genügt langsam hineinfahren. */
(function (root) {
  'use strict';
  const AMC = root.AMC = root.AMC || {};
  const U = AMC.U, D = AMC.Data, W = AMC.World, I = AMC.Input, Save = AMC.Save;
  const G = AMC.GTA = {};
  let T = null, C = null, V = null;

  const FUNK = { x: 22.5, z: -12 };
  const db = () => { const d = Save.data.gta = Save.data.gta || {}; d.done = d.done || {}; d.n = d.n || 0; d.stunts = d.stunts || 0; d.best = d.best || 0; d.flash = d.flash || 0; d.escapes = d.escapes || 0; return d; };
  const stations = () => D.STATIONS;
  const stationPos = slug => { const st = C.S.stations && C.S.stations.find(s => s.id === 'sender:' + slug); return st ? { x: st.x, z: st.z } : FUNK; };
  const say = (who, txt) => (who === 'm' ? 'Marco' : who === 'a' ? 'Andrew' : who) + ': „' + txt + '“';

  // ------------------------------------------------------------------ Auftragsarten
  const KINDS = {
    eil: { icon: '🗞️', name: 'Eilmeldung', rub: 'serious', col: 0xff4f6d, lines: [['m', 'Heiße Story! Die muss vor den Nachrichten auf Sendung.'], ['a', 'Ich halt die Kassette fest. Mit beiden Händen. Versprochen.']] },
    live: { icon: '📡', name: 'Live-Schalte', rub: 'tv', col: 0x3dd6ff, lines: [['a', 'Wir sind live vor Ort! … Marco, wo ist das Mikro?'], ['m', 'Ü-Wagen-Feeling! Drei Schalten, dann sind wir Legende.']] },
    jagd: { icon: '🏴‍☠️', name: 'Störsender-Jagd', rub: 'tech', col: 0xff8a1e, lines: [['m', 'Ralf Rauschmann funkt wieder dazwischen! Dranbleiben!'], ['a', 'Ich hör ihn schon rauschen. Hinterher!']] },
    gast: { icon: '🎙️', name: 'Studiogast-Taxi', rub: 'feel', col: 0xffd23f, lines: [['a', 'Unser Gast wartet! Bitte sanft fahren – kein Gast mag Kratzer.'], ['m', 'Wir bringen ihn direkt ans Mikro. Heute Abend wird’s groß.']] },
    wunsch: { icon: '🎵', name: 'Hörerwunsch-Rallye', rub: 'musik', col: 0xa46cff, lines: [['m', 'Fünf Hörerwünsche liegen in der Stadt verteilt. Einsammeln!'], ['a', 'Und keiner wünscht sich Schlager? … Doch? Okay.']] }
  };
  G.KINDS = KINDS;
  const SPOTS = [[-5, -53], [5, -53], [85, -53], [-40, -37], [5, 8], [-5, 53], [-50, 53], [5, 53], [50, 82], [-38, 30], [45, -30], [-62, -45], [62, 45], [-30, 0], [0, -62], [52, -22], [7, 62], [-52, -12], [30, -7], [-22, 7]];
  const roadSpot = rng => { const r = C.ROADS[Math.floor(rng() * 3)], s = -80 + rng() * 160, side = rng() < 0.5 ? 6.5 : -6.5; return rng() < 0.5 ? [s, r + side] : [r + side, s]; };

  // ------------------------------------------------------------------ Aufbau
  G.build = function (ctx) {
    G.stop(); T = root.THREE; C = ctx; const S = C.S;
    if (!S || S.mode !== 'free' || S.net) return;
    V = { S, offers: [], m: null, hype: 0, calmT: 0, paps: [], heli: null, ramps: [], t: 0, radioT: 0, flash: 0 };
    buildRamps();
    for (let i = 0; i < 3; i++) addOffer();
    buildHud();
    V.unsub = AMC.Media && AMC.Media.subscribe ? AMC.Media.subscribe(() => { if (V && V.S.drive && AMC.Media.active() && AMC.Media.kind !== 'podcast') radioCard(); }) : null;
  };
  G.stop = function () {
    if (!V) return;
    V.offers.forEach(o => o.g.parent && o.g.parent.remove(o.g));
    if (V.m) endMission(false, true);
    V.paps.forEach(p => { if (p.fig) { if (p.fig.root.parent) p.fig.root.parent.remove(p.fig.root); p.fig.dispose(); } });
    if (V.heli && V.heli.g.parent) V.heli.g.parent.remove(V.heli.g);
    if (V.hud) V.hud.remove(); if (V.stars) V.stars.remove(); if (V.radio) V.radio.remove();
    if (V.unsub) V.unsub();
    V = null;
  };
  G.state = () => V;

  function marker(color, icon, h) {
    const g = new T.Group(); g.userData.dyn = true;
    const ring = new T.Mesh(new T.TorusGeometry(2.4, 0.16, 8, 40), W.mat(color, { e: color, ei: 1.6 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.15; g.add(ring);
    const col = new T.Mesh(new T.CylinderGeometry(2.2, 2.2, h || 6, 24, 1, true), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, side: T.DoubleSide })); col.position.y = (h || 6) / 2; g.add(col);
    if (icon) { const sp = new T.Sprite(new T.SpriteMaterial({ map: W.textTex([icon], { w: 128, h: 128, size: 84, bg: '#14101e', accent: '#' + new T.Color(color).getHexString() }) })); sp.scale.set(1.4, 1.4, 1); sp.position.y = (h || 6) + 0.9; g.add(sp); g.userData.icon = sp; }
    g.userData.ring = ring; C.S.group.add(g); return g;
  }
  function addOffer() {
    const S = C.S, rng = Math.random, used = V.offers.map(o => o.kind);
    const kinds = Object.keys(KINDS).filter(k => !used.includes(k)), kind = U.pick(kinds), st = U.pick(stations());
    let x, z, n = 0;
    do { const s = U.pick(SPOTS); x = s[0] + U.rand(-3, 3); z = s[1] + U.rand(-3, 3); n++; } while (n < 20 && (C.solidAt(x, 0.6, z) || V.offers.some(o => Math.hypot(o.x - x, o.z - z) < 25) || Math.hypot(x - S.pl.x, z - S.pl.z) < 12));
    const K = KINDS[kind], g = marker(K.col, K.icon, 7); g.position.set(x, 0, z);
    V.offers.push({ kind, st, x, z, g, K });
  }

  // ------------------------------------------------------------------ Aufträge
  function startMission(o) {
    const S = C.S, K = o.K;
    V.offers.splice(V.offers.indexOf(o), 1); if (o.g.parent) o.g.parent.remove(o.g);
    const m = V.m = { kind: o.kind, K, st: o.st, t: 0, left: 0, step: 0, pts: [], meter: 0, comfort: 100, g: null };
    AMC.Audio.sfx('jingle');
    C.msg(K.icon + ' ' + K.name + ' für ' + o.st.name + ' · ' + say(K.lines[0][0], K.lines[0][1]), 4.2);
    setTimeout(() => V && V.m === m && C.msg(say(K.lines[1][0], K.lines[1][1]), 3.4), 4300);
    if (AMC.Media && AMC.Media.active() && AMC.Media.kind !== 'podcast' && AMC.Media.slug !== o.st.slug) AMC.Media.playStation(o.st.slug);   // Radio schaltet zum Sender des Auftrags
    if (o.kind === 'eil') { const a = U.pick(SPOTS.filter(s => Math.hypot(s[0] - S.pl.x, s[1] - S.pl.z) > 30)); m.pts = [{ x: a[0], z: a[1], what: 'Kassette abholen' }, Object.assign(stationPos(o.st.slug), { what: 'Zum Senderhaus ' + o.st.name })]; m.left = 75 + Math.hypot(a[0] - S.pl.x, a[1] - S.pl.z) / 5; }
    if (o.kind === 'live') { m.pts = U.shuffle(SPOTS.filter(s => Math.hypot(s[0] - S.pl.x, s[1] - S.pl.z) > 20)).slice(0, 3).map(s => ({ x: s[0], z: s[1], what: 'Live-Schalte', hold: 0 })); m.left = 170; }
    if (o.kind === 'gast') { const g = U.pick(AMC.Guests ? AMC.Guests.ROSTER.filter(r => r[0] !== 'gisela' && r[0] !== 'star') : [['jana', '📺', 'Jana Kanal']]); m.guest = { id: g[0], icon: g[1], name: g[2] }; const a = U.pick(SPOTS.filter(s => Math.hypot(s[0] - FUNK.x, s[1] - FUNK.z) > 50)); m.pts = [{ x: a[0], z: a[1], what: g[1] + ' ' + g[2] + ' abholen' }, { x: FUNK.x, z: FUNK.z + 3, what: 'Ins Funkhaus bringen' }]; m.left = 150; }
    if (o.kind === 'wunsch') { m.pts = U.shuffle(SPOTS.slice()).slice(0, 5).map(s => ({ x: s[0] + U.rand(-4, 4), z: s[1] + U.rand(-4, 4), what: 'Hörerwunsch' })); m.left = 140; m.any = true; }
    if (o.kind === 'jagd') { spawnVan(m); m.left = 110; }
    showStep();
  }
  function showStep() {
    const m = V.m; if (!m) return;
    (m.marks || []).forEach(g => g.parent && g.parent.remove(g)); m.marks = [];
    const list = m.any ? m.pts.filter(p => !p.got) : m.pts[m.step] ? [m.pts[m.step]] : [];
    list.forEach(p => { const g = marker(m.K.col, m.any ? '♪' : m.kind === 'live' ? '📡' : m.step === 0 && m.kind !== 'live' ? m.K.icon : '🏁', 9); g.position.set(p.x, 0, p.z); p.g = g; m.marks.push(g); });
  }
  function spawnVan(m) {
    const g = W.models && W.models.van ? W.prop('van', 4.6) : null, grp = g || new T.Group();
    if (!g) { W.box(1.9, 1.8, 4.4, W.mat(0x2a2a2e, { r: 0.4, m: 0.3 }), 0, 1.1, 0, grp); }
    grp.userData.dyn = true;
    const flag = new T.Sprite(new T.SpriteMaterial({ map: W.textTex(['🏴‍☠️', 'Radio Funkloch'], { w: 256, h: 160, size: 70, bg: '#1a0d10', accent: '#ff4040' }) })); flag.scale.set(2.4, 1.5, 1); flag.position.y = 3.6; grp.add(flag);
    grp.userData.glow = W.glow(0xff4040, 2.5, grp, 0, 2.6, 0);
    C.S.group.add(grp);
    const r = U.pick(C.ROADS);
    m.van = { g: grp, axis: Math.random() < 0.5 ? 'x' : 'z', road: r, s: -60, dir: 1, v: 0, turnT: 3 };
  }
  function updVan(m, dt) {
    const v = m.van, S = C.S, p = S.drive || S.pl;
    v.v = U.damp(v.v, 15.5, 1.2, dt);
    const lane = v.road + v.dir * 2.6, ax = v.axis === 'x';
    v.s += v.dir * v.v * dt;
    // An Kreuzungen abbiegen (Straßenraster), am Rand umdrehen
    v.turnT -= dt;
    const cross = C.ROADS.find(q => Math.abs(q - v.s) < 0.6);
    if (cross != null && v.turnT <= 0 && Math.random() < 0.6) { v.turnT = 2.5; const ns = lane; v.axis = ax ? 'z' : 'x'; v.road = cross; v.s = ns; v.dir = Math.random() < 0.5 ? 1 : -1; }
    if (Math.abs(v.s) > 86) { v.dir *= -1; v.s = U.clamp(v.s, -86, 86); }
    const nl = v.road + v.dir * 2.6, x = v.axis === 'x' ? v.s : nl, z = v.axis === 'x' ? nl : v.s;
    v.g.position.set(x, 0, z); v.g.rotation.y = v.axis === 'x' ? (v.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (v.dir > 0 ? 0 : Math.PI);
    const d = Math.hypot(p.x - x, p.z - z);
    m.meter = U.clamp(m.meter + (d < 16 ? dt * (d < 8 ? 9 : 5) : -dt * 3), 0, 100);
    m.dist = d;
    if (Math.random() < dt * 3) W.particles.burst(x, 2.4, z, 0xff4040, 3, { speed: 2, life: 0.5 });
    if (m.meter >= 100) {
      C.msg('🏴‍☠️ Ralf Rauschmann: „Okay, okay! Ich mach den Störsender aus … für heute.“ · ' + say('m', 'Gepeilt, gestellt, gesendet!'), 4);
      W.particles.burst(x, 2, z, 0xffd23f, 60, { speed: 8 });
      return true;
    }
    return false;
  }
  function updMission(dt) {
    const m = V.m; if (!m) return;
    const S = C.S, p = S.drive || S.pl, inCar = !!S.drive, sp = inCar ? Math.abs(S.drive.v) : Math.hypot(S.pl.vx, S.pl.vz);
    m.t += dt; m.left -= dt;
    (m.marks || []).forEach(g => { g.userData.ring.rotation.z += dt * 2; g.position.y = Math.sin(m.t * 3) * 0.08; });
    if (m.left <= 0) return endMission(false);
    if (m.kind === 'jagd') { if (updVan(m, dt)) return endMission(true); return; }
    if (m.any) {
      for (const q of m.pts) if (!q.got && Math.hypot(q.x - p.x, q.z - p.z) < 3.4) {
        q.got = true; if (q.g && q.g.parent) q.g.parent.remove(q.g); AMC.Audio.sfx('coin'); W.particles.burst(q.x, 1.6, q.z, 0xa46cff, 30, { speed: 5 });
        const n = m.pts.filter(x => x.got).length; C.msg('🎵 Hörerwunsch ' + n + '/5: „' + U.pick(['Bitte was zum Mitsingen!', 'Grüße an meine Oma!', 'Spielt was von früher!', 'Mehr Bass, Marco!', 'Andrew soll singen!']) + '“', 2.2);
        if (n >= 5) return endMission(true);
      }
      return;
    }
    const q = m.pts[m.step]; if (!q) return;
    const d = Math.hypot(q.x - p.x, q.z - p.z);
    if (m.kind === 'live') {
      if (d < 4.2 && sp < 4) { q.hold += dt; if (Math.random() < dt * 8) W.particles.burst(q.x, 2.2, q.z, 0x3dd6ff, 3, { speed: 3, life: 0.4 }); }
      else q.hold = Math.max(0, q.hold - dt * 0.5);
      m.meter = q.hold / 4 * 100;
      if (q.hold >= 4) {
        AMC.Audio.sfx('perfect'); C.msg('📡 Schalte ' + (m.step + 1) + '/3 im Kasten! ' + say(U.pick(['a', 'm']), U.pick(['Und zurück ins Studio!', 'Das war live – und keiner hat’s gemerkt!', 'Grüße an alle, die zuhören!'])), 2.6);
        m.step++; m.meter = 0; if (m.step >= 3) return endMission(true); showStep();
      }
      return;
    }
    if (d < 3.6 && sp < 6) {
      if (m.kind === 'gast' && m.step === 0) {
        if (!inCar) { if (!m.hintCar) { m.hintCar = true; C.msg('🚗 Holt ' + m.guest.name + ' mit dem Auto ab – zu Fuß ist’s zu weit bis ins Funkhaus.', 2.6); } return; }
        AMC.Audio.sfx('door'); C.msg(m.guest.icon + ' ' + m.guest.name + ' steigt ein: „Ich freu mich so auf eure Show!“', 2.6);
      } else if (m.step === 0) { AMC.Audio.sfx('coin'); C.msg(m.K.icon + ' Eingesammelt! Jetzt schnell zu ' + m.st.name + '.', 2.2); }
      m.step++; if (m.step >= m.pts.length) return endMission(true); showStep();
    }
  }
  G.onCrash = function (car, v) {
    if (!V) return;
    hype(Math.min(0.6, v / 25));
    if (V.m && V.m.kind === 'gast' && V.m.step === 1) { V.m.comfort = Math.max(0, V.m.comfort - Math.round(v * 2.2)); C.msg(V.m.guest.icon + ' ' + V.m.guest.name + ': „' + U.pick(['Uff! Mein Kaffee!', 'Fahrt ihr immer so?', 'Ich wollte eigentlich lebend ankommen!', 'Das erzähl ich heute Abend live!']) + '“ (Komfort ' + V.m.comfort + ' %)', 2.4); }
  };
  G.onPed = () => { if (V) hype(0.45); };
  G.onHonk = () => { if (V) { V.honks = (V.honks || 0) + 1; if (V.honks > 4) hype(0.15); } };

  function endMission(ok, silent) {
    const m = V.m; if (!m) return; V.m = null;
    (m.marks || []).forEach(g => g.parent && g.parent.remove(g));
    if (m.van && m.van.g.parent) m.van.g.parent.remove(m.van.g);
    if (silent) return;
    if (!ok) { AMC.Audio.sfx('lose'); C.msg('⏱ ' + m.K.name + ' verpasst – ' + say(U.pick(['a', 'm']), U.pick(['Nächstes Mal sind wir schneller.', 'Das schneiden wir einfach raus.', 'Kommt in die Pannen-Folge!'])), 3.4); addOffer(); updHud(); return; }
    const S = C.S, d = db(), fast = m.left > 30, comfort = m.kind === 'gast' ? m.comfort / 100 : 1;
    const funken = Math.round((3 + (fast ? 2 : 0)) * (0.5 + comfort * 0.5)), fan = Math.round((60 + (fast ? 30 : 0)) * (0.6 + comfort * 0.4) * (1 + V.hype * 0.05));
    S.got[m.K.rub] = (S.got[m.K.rub] || 0) + funken; if (C.drawRub) C.drawRub();
    Save.earn(fan); d.n++; d.done[m.kind] = (d.done[m.kind] || 0) + 1;
    const ox = Save.data.onair = Save.data.onair || {}; ox.xp = ox.xp || {}; ox.xp[m.st.slug] = (ox.xp[m.st.slug] || 0) + 2;   // Sender-Ruf
    if (AMC.Feed) AMC.Feed.post(m.K.icon, m.K.name + ' für ' + m.st.name + ' geschafft! ' + (m.kind === 'gast' ? m.guest.name + ' ist heute Abend im Studio 🎙️' : 'Mehr davon heute Abend im Podcast 🎙️'), 'story');
    let extra = '';
    if (m.kind === 'gast' && AMC.Career && AMC.Guests) { const t = AMC.Career.state().today; const g = AMC.Guests.list().find(x => x.id === m.guest.id); if (!t.guest && g && g.open) { t.guest = g.id; extra = ' · 🎙️ ' + g.name + ' ist heute Abend Studiogast!'; } else if (comfort > 0.6) extra = ' · ' + m.guest.name + ' kommt bestimmt wieder!'; }
    S.score += 800;
    Save.save();
    AMC.Audio.sfx('win'); W.particles.burst(S.pl.x, 2.4, S.pl.z, m.K.col, 70, { speed: 8 });
    if (AMC_FX()) AMC_FX().confetti(S.pl.x, 2, S.pl.z, m.K.col);
    C.msg('✅ ' + m.K.name + ' geschafft! +' + funken + ' ' + D.RUBRICS[m.K.rub].icon + ' für die Abendfolge · +' + fan + ' 🎟️ · ' + m.st.name + ' +Ruf' + extra, 5);
    setTimeout(addOffer, 2500); updHud();
  }
  const AMC_FX = () => root.AMC_BJS && root.AMC_BJS.fx && W.babylon ? root.AMC_BJS.fx(W.renderer) : null;

  // ------------------------------------------------------------------ Hype-Sterne & Paparazzi
  function hype(n) {
    const before = Math.floor(V.hype); V.hype = U.clamp(V.hype + n, 0, 5); V.calmT = 0;
    if (Math.floor(V.hype) > before) { AMC.Audio.sfx('star'); if (Math.floor(V.hype) === 1) C.msg('📸 Hype! Die Paparazzi sind euch auf den Fersen – entwischt ihnen oder lächelt.', 3); if (Math.floor(V.hype) === 5) C.msg('🚁 Kanal 9 schickt den Hubschrauber! Ihr seid DIE Schlagzeile.', 3.2); }
    drawStars();
  }
  G.hype = () => (V ? V.hype : 0);
  async function spawnPap() {
    const S = C.S, my = V;
    const fig = await W.makeFan(4000 + Math.floor(Math.random() * 999), { top: '#1d1d24', hat: { type: 'cap', color: '#ff3da8' } }).catch(() => null);
    if (V !== my || !fig) { if (fig) fig.dispose(); return; }
    const a = Math.random() * Math.PI * 2, x = S.pl.x + Math.cos(a) * 26, z = S.pl.z + Math.sin(a) * 26;
    fig.root.position.set(x, 0.16, z); S.group.add(fig.root);
    const cam = new T.Sprite(new T.SpriteMaterial({ map: W.textTex(['📸'], { w: 128, h: 128, size: 84, bg: '#1a0d18', accent: '#ff3da8' }) })); cam.scale.set(0.55, 0.55, 1); cam.position.y = 2.35; fig.root.add(cam);
    const flash = new T.PointLight(0xffffff, 0, 9); flash.position.set(0, 1.8, 0.4); fig.root.add(flash);
    const pp = { fig, x, y: 0.16, z, vx: 0, vy: 0, vz: 0, yaw: 0, onGround: true, anim: '', cd: 1 + Math.random(), flash, fl: 0 };
    C.setAnim(pp, 'jog'); V.paps.push(pp);
  }
  function updPaps(dt) {
    const S = C.S, p = S.drive || S.pl, want = Math.min(5, Math.floor(V.hype)) + (V.hype >= 1 ? 1 : 0);
    if (V.paps.length + (V.spawning || 0) < want && !(V.spawnT > 0)) { V.spawnT = 1.2; V.spawning = (V.spawning || 0) + 1; spawnPap().finally(() => { if (V) V.spawning--; }); }
    if (V.spawnT > 0) V.spawnT -= dt;
    for (let i = V.paps.length - 1; i >= 0; i--) {
      const q = V.paps[i]; q.fig.update(dt);
      const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz);
      if (q.fl > 0) { q.fl -= dt; q.flash.intensity = q.fl > 0 ? 6 * q.fl / 0.15 : 0; }
      if (V.hype < 1 || d > 70) { // abziehen
        q.leave = (q.leave || 0) + dt; C.moveBody(q, dt, -dx / (d || 1), -dz / (d || 1), 5, 6); C.setAnim(q, 'jog');
        if (q.leave > 3) { if (q.fig.root.parent) q.fig.root.parent.remove(q.fig.root); q.fig.dispose(); V.paps.splice(i, 1); }
        continue;
      }
      const spd = (S.drive ? 7.5 : 5.4) + V.hype * 0.35;
      const s = C.moveBody(q, dt, d > 3 ? dx / d : 0, d > 3 ? dz / d : 0, d > 3 ? spd : 0, 7);
      C.setAnim(q, s < 0.5 ? 'idle' : s < 3 ? 'walk' : 'jog');
      if (d < 3.2) q.fig.root.rotation.y = Math.atan2(dx, dz);
      q.cd -= dt;
      if (d < 7 && q.cd <= 0) {   // Blitz!
        q.cd = 2.2 + Math.random() * 1.5; q.fl = 0.15; AMC.Audio.sfx('tick'); C.setAnim(q, 'yes');
        if (d < 4 && !S.drive) {
          const d0 = db(); d0.flash++; const lose = Math.min(Save.data.fan, 8);
          Save.data.fan -= lose; Save.save();
          screenFlash();
          C.msg('📸 Schnappschuss! „' + U.pick(['Andrew, ein Lächeln!', 'Marco, wo ist Gisela?', 'Stimmt es, dass ihr bald ins Fernsehen geht?', 'Hier, für die Titelseite!']) + '“' + (lose ? ' −' + lose + ' 🎟️' : ''), 2);
          V.hype = Math.max(0, V.hype - 0.35); drawStars();
        }
      }
    }
  }
  function screenFlash() { const f = U.el('div', 'gta-flash'); document.body.appendChild(f); setTimeout(() => f.remove(), 450); }
  function updHeli(dt) {
    const S = C.S, p = S.drive || S.pl;
    if (V.hype >= 5 && !V.heli) {
      const g = new T.Group(); g.userData.dyn = true;
      const body = W.mat(0x2f6bff, { r: 0.35, m: 0.4 }), dark = W.mat(0x15161c, { r: 0.6 });
      W.box(1.8, 1.5, 3.4, body, 0, 0, 0, g); W.box(0.4, 0.4, 3.4, body, 0, 0.3, -3, g); W.box(1.2, 0.9, 1.2, W.mat(0x9fd8ff, { r: 0.1, m: 0.6 }), 0, 0.1, 1.5, g);
      const rotor = W.box(9, 0.08, 0.35, dark, 0, 1.05, 0, g, false); const tail = W.box(0.08, 1.6, 0.3, dark, 0.25, 0.4, -4.6, g, false);
      const tag = new T.Sprite(new T.SpriteMaterial({ map: W.textTex(['📺 KANAL 9', 'LIVE'], { w: 256, h: 140, size: 56, bg: '#0d1530', accent: '#ff3040' }) })); tag.scale.set(2.6, 1.4, 1); tag.position.y = 2.2; g.add(tag);
      const spot = new T.SpotLight(0xfff6d8, 3.2, 70, 0.24, 0.6, 1); spot.position.set(0, -0.6, 0.6); g.add(spot); g.add(spot.target);
      g.position.set(p.x + 30, 24, p.z); S.group.add(g);
      V.heli = { g, rotor, tail, spot, a: 0 }; AMC.Audio.sfx('whoosh');
    }
    if (!V.heli) return;
    const h = V.heli; h.a += dt * 0.45;
    const leave = V.hype < 4;
    const tx = p.x + Math.cos(h.a) * (leave ? 90 : 16), tz = p.z + Math.sin(h.a) * (leave ? 90 : 16), ty = leave ? 40 : 22;
    h.g.position.x = U.damp(h.g.position.x, tx, 0.8, dt); h.g.position.z = U.damp(h.g.position.z, tz, 0.8, dt); h.g.position.y = U.damp(h.g.position.y, ty, 0.8, dt);
    h.g.rotation.y = Math.atan2(-Math.sin(h.a), Math.cos(h.a)) + Math.PI / 2;
    h.rotor.rotation.y += dt * 30; h.tail.rotation.x += dt * 40;
    h.spot.target.position.set(p.x - h.g.position.x, -h.g.position.y, p.z - h.g.position.z).applyAxisAngle(new T.Vector3(0, 1, 0), -h.g.rotation.y);
    h.spot.intensity = leave ? 0 : 3.2;
    if (leave && Math.hypot(h.g.position.x - p.x, h.g.position.z - p.z) > 80) { if (h.g.parent) h.g.parent.remove(h.g); V.heli = null; }
  }
  function updHype(dt) {
    const S = C.S, car = S.drive;
    // Raserei abseits der Straße zählt (Gehweg, Plätze)
    if (car && Math.abs(car.v) > 13) { const onRoad = C.ROADS.some(r => Math.abs(car.x - r) < 5.2 || Math.abs(car.z - r) < 5.2); if (!onRoad) { V.hype = Math.min(5, V.hype + dt * 0.12); V.calmT = 0; } }
    V.calmT += dt;
    if (V.calmT > 10 && V.hype > 0) {
      const b = Math.floor(V.hype); V.hype = Math.max(0, V.hype - dt * 0.18);
      if (b >= 2 && V.hype < 0.05) { V.hype = 0; const d = db(); d.escapes++; Save.save(); if (AMC.Feed) AMC.Feed.post('🕶️', 'Den Paparazzi entwischt! Wer uns sehen will: heute Abend live im Podcast.', ''); C.msg('🕶️ Entwischt! Die Paparazzi geben auf · App-Follower +', 2.6); }
    }
    if (V.honks && Math.random() < dt * 0.3) V.honks--;
    if ((V.starT = (V.starT || 0) - dt) <= 0) { V.starT = 0.5; drawStars(); }
  }

  // ------------------------------------------------------------------ Stunt-Rampen
  function buildRamps() {
    const S = C.S, mat = W.mat(0xffc12e, { r: 0.5, m: 0.2 }), str = W.mat(0x1d1d24, { r: 0.6 });
    [[-45, 25, 'z', 1], [45, -25, 'z', -1], [25, 0, 'x', 1], [-25, 45, 'x', -1]].forEach(([a, b, ax, dir]) => {
      const x = ax === 'z' ? a + 2.6 * dir : b, z = ax === 'z' ? b : a + 2.6 * dir;
      const g = new T.Group(); g.userData.dyn = true; g.position.set(x, 0, z); g.rotation.y = ax === 'z' ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? Math.PI / 2 : -Math.PI / 2);
      const shape = new T.Shape(); shape.moveTo(-2.2, 0); shape.lineTo(2.2, 0); shape.lineTo(2.2, 1.15); shape.closePath();
      const geo = new T.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false }); geo.translate(0, 0, -1.6);
      const m = new T.Mesh(geo, mat); m.rotation.y = -Math.PI / 2; m.castShadow = true; m.receiveShadow = true; g.add(m);
      for (let i = -1; i <= 1; i += 2) W.box(0.25, 0.06, 4.6, str, i * 0.9, 0.62, 0, g, false).rotation.x = -Math.atan2(1.15, 4.4);
      const sign = new T.Sprite(new T.SpriteMaterial({ map: W.textTex(['🎬', 'STUNT'], { w: 160, h: 160, size: 70, bg: '#1a1408', accent: '#ffc12e' }) })); sign.scale.set(1.3, 1.3, 1); sign.position.set(2.1, 2.4, -1.8); g.add(sign);
      S.group.add(g);
      V.ramps.push({ x, z, ax, dir, g });
    });
  }
  function updStunt(dt) {
    const S = C.S, car = S.drive; if (!car) return;
    if (car.air) {
      car.vy -= 22 * dt; car.y += car.vy * dt; car.airT += dt;
      car.g.position.y = Math.max(0, car.y); car.g.rotation.x = U.clamp(-car.vy * 0.03, -0.35, 0.35);
      if (car.y <= 0) {
        car.y = 0; car.air = false; car.g.rotation.x = 0; W.cam.shake = 0.5; AMC.Audio.sfx('hit');
        W.particles.burst(car.x, 0.4, car.z, 0xcfcfcf, 30, { speed: 5 });
        const t = car.airT, d = db();
        if (t > 0.45) {
          d.stunts++; d.best = Math.max(d.best, Math.round(t * 10) / 10); const pts = Math.round(t * 40);
          Save.earn(pts); Save.save(); hype(0.5);
          if (AMC.Feed) AMC.Feed.post('🎬', 'Stunt-Clip: ' + t.toFixed(1) + ' s Flug ' + (car.gisela ? 'mit GISELA?!' : 'im ' + car.name) + ' 🤯', 'story');
          C.msg('🎬 Stunt-Clip! ' + t.toFixed(1) + ' s in der Luft · +' + pts + ' 🎟️ · ' + say(car.gisela ? 'm' : U.pick(['a', 'm']), car.gisela ? 'GISELA! Das hat sie noch nie gemacht!' : U.pick(['Das kommt in die App!', 'Ich hab alles gefilmt! … glaub ich.', 'Nochmal! NOCHMAL!'])), 3.6);
        }
      }
      return;
    }
    if (Math.abs(car.v) < 9) return;
    for (const r of V.ramps) {
      const dx = car.x - r.x, dz = car.z - r.z, along = r.ax === 'z' ? dz * r.dir * -1 : dx * r.dir * -1, side = r.ax === 'z' ? Math.abs(dx) : Math.abs(dz);
      const heading = r.ax === 'z' ? Math.cos(car.h) * Math.sign(car.v) : Math.sin(car.h) * Math.sign(car.v);
      if (side < 1.7 && Math.abs(along) < 2.2 && heading * -r.dir > 0.6 && along > 0.8) {
        car.air = true; car.y = 1.1; car.vy = Math.abs(car.v) * 0.42; car.airT = 0; AMC.Audio.sfx('whoosh');
        W.particles.burst(car.x, 1, car.z, 0xffc12e, 20, { speed: 4 });
      }
    }
  }

  // ------------------------------------------------------------------ Autoradio
  function radioCard() {
    if (!V || !AMC.Media) return; const st = AMC.Media.station();
    if (!V.radio) { V.radio = U.el('div', 'gta-radio'); document.body.appendChild(V.radio); }
    V.radio.innerHTML = '<img src="' + AMC.UI.senderLogo(st.slug) + '" alt=""><span><small>📻 Autoradio</small><b>' + U.esc(st.name) + '</b><em>' + U.esc(st.desc) + '</em></span>';
    V.radio.style.setProperty('--c', st.color); V.radio.classList.add('on'); V.radioT = 2.8;
  }

  // ------------------------------------------------------------------ Anzeige
  function buildHud() {
    V.hud = U.el('div', 'gta-hud glass'); V.hud.hidden = true; document.getElementById('hud').appendChild(V.hud);
    V.stars = U.el('div', 'gta-stars'); document.getElementById('hud').appendChild(V.stars); drawStars();
  }
  function drawStars() {
    if (!V || !V.stars) return; const n = Math.floor(V.hype + 0.001);
    V.stars.innerHTML = n || V.hype > 0.2 ? '<span title="Hype-Sterne: Paparazzi">📸</span>' + [1, 2, 3, 4, 5].map(i => '<i class="' + (i <= n ? 'on' : '') + '">★</i>').join('') : '';
    V.stars.classList.toggle('hot', n >= 3);
  }
  function updHud() {
    if (!V || !V.hud) return; const m = V.m;
    if (!m) { V.hud.hidden = true; return; }
    V.hud.hidden = false;
    const q = m.any ? null : m.pts[m.step];
    const obj = m.kind === 'jagd' ? 'Bleibt dicht am Funkloch-Van (' + Math.round(m.dist || 0) + ' m)' : m.any ? 'Hörerwünsche: ' + m.pts.filter(x => x.got).length + '/5' : m.kind === 'live' ? 'Schalte ' + (m.step + 1) + '/3: im Kreis stehen bleiben' : q ? q.what : '';
    const bar = m.kind === 'jagd' || m.kind === 'live' ? '<div class="gta-bar"><i style="width:' + Math.round(m.meter) + '%"></i></div>' : m.kind === 'gast' && m.step === 1 ? '<div class="gta-bar comfort"><i style="width:' + m.comfort + '%"></i></div>' : '';
    V.hud.innerHTML = '<b>' + m.K.icon + ' ' + m.K.name + ' <small>· ' + U.esc(m.st.name) + '</small></b><span class="gta-time' + (m.left < 15 ? ' low' : '') + '">⏱ ' + U.time(m.left) + '</span><p>' + U.esc(obj) + '</p>' + bar;
  }

  // ------------------------------------------------------------------ Schnittstellen für play.js
  G.interact = function (p) {
    if (!V || V.m || C.S.drive) return null;
    const o = V.offers.find(o => Math.hypot(o.x - p.x, o.z - p.z) < 3);
    return o ? { label: '▶ ' + o.K.icon + ' ' + o.K.name + ' für ' + o.st.name, run: () => startMission(o) } : null;
  };
  G.update = function (dt) {
    if (!V || V.S !== C.S) return;
    const S = C.S; V.t += dt;
    V.offers.forEach(o => { o.g.userData.ring.rotation.z += dt * 1.5; if (o.g.userData.icon) o.g.userData.icon.position.y = 7.9 + Math.sin(V.t * 2.5 + o.x) * 0.2; });
    // Im Auto genügt langsam hineinfahren
    if (S.drive && !V.m) { const car = S.drive, o = V.offers.find(o => Math.hypot(o.x - car.x, o.z - car.z) < 3.2); if (o && Math.abs(car.v) < 5) startMission(o); }
    updMission(dt); updHype(dt); updPaps(dt); updHeli(dt); updStunt(dt);
    if (V.radioT > 0 && (V.radioT -= dt) <= 0 && V.radio) V.radio.classList.remove('on');
    if (S.drive && !V.wasDriving && AMC.Media && AMC.Media.active() && AMC.Media.kind !== 'podcast') radioCard();
    V.wasDriving = !!S.drive;
    if ((V.hudT = (V.hudT || 0) - dt) <= 0) { V.hudT = 0.25; updHud(); }
  };
  G.mapDots = function () {
    if (!V) return [];
    const out = V.offers.map(o => ({ x: o.x, z: o.z, t: o.K.icon, c: '#' + new T.Color(o.K.col).getHexString() }));
    const m = V.m;
    if (m) {
      (m.any ? m.pts.filter(p => !p.got) : m.pts[m.step] ? [m.pts[m.step]] : []).forEach(p => out.push({ x: p.x, z: p.z, ring: true, c: '#' + new T.Color(m.K.col).getHexString() }));
      if (m.van) out.push({ x: m.van.g.position.x, z: m.van.g.position.z, ring: true, c: '#ff4040' });
    }
    V.paps.forEach(p => out.push({ x: p.x, z: p.z, dot: true, c: '#ff3da8' }));
    return out;
  };
  G.stats = () => Object.assign({}, db());
  /** Übersicht im Gesamtmenü */
  G.panel = function () {
    const d = db(), off = V ? V.offers : [];
    const s = AMC.UI.open('<div class="panel glass"><header><h2>🎬 Medien-Aufträge</h2><button class="btn small" data-nav data-first id="gtB">' + AMC.glyph('b') + ' Zurück</button></header>' +
      '<p class="hint">Fahrt die bunten Marker in der Stadt an. Jeder Auftrag gehört zu einem AnMaCha-Sender und bringt Themen-Funken für eure Abendfolge, Sender-Ruf und Fan-Punkte.</p><div class="st-list">' +
      Object.keys(KINDS).map(k => { const K = KINDS[k], o = off.find(x => x.kind === k); return '<div class="st-item"><span class="st-ic">' + K.icon + '</span><span><b>' + K.name + '</b><small>' + (o ? '📍 Jetzt in der Stadt für ' + U.esc(o.st.name) : 'Gerade kein Marker') + ' · geschafft: ' + (d.done[k] || 0) + ' · ' + D.RUBRICS[K.rub].icon + ' ' + D.RUBRICS[K.rub].name + '</small></span></div>'; }).join('') +
      '</div><p class="hint">🎬 Stunts: ' + d.stunts + ' (bester Flug ' + d.best + ' s) · 📸 Schnappschüsse: ' + d.flash + ' · 🕶️ Paparazzi entwischt: ' + d.escapes + '</p></div>', { back: () => AMC.UI.close(s) });
    s.el.querySelector('#gtB').onclick = () => AMC.UI.close(s);
    return s;
  };
  // Für Tests
  G._start = kind => { if (!V) return false; const o = V.offers.find(x => x.kind === kind) || (() => { const st = U.pick(stations()), K = KINDS[kind], g = marker(K.col, K.icon, 7); g.position.set(C.S.pl.x + 4, 0, C.S.pl.z); const o = { kind, st, x: C.S.pl.x + 4, z: C.S.pl.z, g, K }; V.offers.push(o); return o; })(); startMission(o); return true; };
  G._mission = () => V && V.m;
  G._finish = () => V && V.m && endMission(true);
  G._hype = n => V && hype(n);
})(typeof window !== 'undefined' ? window : globalThis);
