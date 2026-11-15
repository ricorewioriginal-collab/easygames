/* Urwaldlager – das Camp: frei herumlaufen, Holz/Wasser, Feuer, Gespräche, Buschtelefon, Schatzkiste, Ereignisse; Abendessen und Auszug */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, UI = UL.UI, A = UL.A, D = UL.D, In = UL.In, esc = UL.esc;
  const Camp = UL.Camp = {};
  const ENERGY = 4;

  const CHATTER = ['Ich hab so Hunger …', 'Wer hat schon wieder die Bohnen versteckt?', 'Ich vermisse mein Bett.', 'Hast du das Krabbeln gehört?', 'Heute Nacht hat jemand geschnarcht. Laut!', 'Noch ein Tag Reis und ich werd selber zur Bohne.', 'Die Zuschauer lieben mich, oder?', 'Wann kommt endlich das Luxuspaket?', 'Ich geh gleich in die Lagune.', 'Pssst – ich glaub, wir werden gefilmt. Ach so, ja.'];

  // ---------- Kulisse ----------
  class CampStage extends R.Stage {
    constructor(theme, tod = 'day') {
      super();
      this.theme = theme; this.tod = tod;
      const sc = this.scene, studio = theme === 'studio';
      if (studio) { this.env = UL.Env.studio(sc, { radius: 17, screenText: ['URWALDLAGER', tod === 'day' ? 'DAS CAMP · LIVE' : 'DER ABEND IM CAMP'] }); this.updaters.push(dt => this.env.update(dt)); if (tod !== 'day') { sc.children.forEach(o => { if (o.isHemisphereLight) o.intensity = 0.3; if (o.isDirectionalLight) o.intensity = 0.35; }); } }
      else this.env = UL.Env.jungle(sc, { tod, radius: 16, clear: [{ x: 0, z: 0, r: 12 }, { x: 0, z: -14, r: 3 }], water: { x: 8, z: -4, r: 3.2 }, seed: 21 });
      this.h = (x, z) => studio || !this.env.height ? 0 : this.env.height(x, z);
      if (studio) {   // Dschungel-Kulisse auf der Bühne: Sandboden, Palmen in Kübeln, Rasenflecken
        const sand = new T.Mesh(new T.CircleGeometry(13.2, 48), R.mat(0x9a7a4a)); sand.rotation.x = -Math.PI / 2; sand.position.y = 0.01; sand.receiveShadow = true; sc.add(sand);
        const ring = []; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; ring.push({ x: Math.cos(a) * 13.6, z: Math.sin(a) * 13.6, y: 0, ry: a }); }
        sc.add(A.instanced('palm2', ring.filter((_, i) => i % 2), 6, { shadow: true })); sc.add(A.instanced('bush_large', ring.filter((_, i) => !(i % 2)), 1.6));
        sc.add(A.instanced('grass_green_group', Array.from({ length: 30 }, (_, i) => ({ x: Math.cos(i * 2.4) * (4 + (i % 7)), z: Math.sin(i * 2.4) * (4 + (i % 7)), y: 0.01, ry: i })), 0.5));
      }
      this.solid = [];   // Hindernisse {x, z, r}
      const at = (o, x, z, ry = 0) => { o.position.set(x, this.h(x, z), z); o.rotation.y = ry; sc.add(o); return o; };
      // Lagerfeuer mit Sitzstämmen
      at(A.sized('campfire', 0.35, 'xz'), 0, 0).scale.multiplyScalar(4.2);
      sc.add(R.logs(6, 0.5)); this.fire = this.add(R.fire(tod === 'day' ? 0.55 : 0.9)); this.solid.push({ x: 0, z: 0, r: 1.1 });
      this.seats = [];
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3; this.seats.push({ x: Math.cos(a) * 2.5, z: Math.sin(a) * 2.5, a }); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.3 + Math.PI / 10; const l = R.log(1.7, 0.17); at(l, Math.cos(a) * 2.6, Math.sin(a) * 2.6, -a + Math.PI / 2); }
      const pot = new T.Mesh(new T.CylinderGeometry(0.28, 0.22, 0.32, 12), R.mat(0x2a2a2e)); pot.position.set(0.15, 0.55, 0); sc.add(pot);
      // Schlafplatz unter der Plane
      const P = this.poi = {};
      P.beds = { x: -7.5, z: -3.5 };
      for (let i = 0; i < 5; i++) at(A.has('kd_bed_floor') ? A.sized('kd_bed_floor', 0.35) : new T.Mesh(new T.BoxGeometry(0.9, 0.2, 1.9), R.mat(0x3a5a8a)), -9.6 + i * 1.1, -3.6, 0);
      const tarp = new T.Mesh(new T.PlaneGeometry(6.4, 3.6), new T.MeshLambertMaterial({ color: R.lin(studio ? 0x2a8cff : 0x3a6a8a), side: T.DoubleSide })); tarp.position.set(-7.5, 2.4, -3.6); tarp.rotation.x = -Math.PI / 2 + 0.18; sc.add(tarp);
      for (const x of [-10.6, -4.4]) for (const z of [-5.3, -1.9]) { const p = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 2.6, 6), R.mat(0x5a3a1e)); p.position.set(x, 1.2 + this.h(x, z), z); sc.add(p); }
      this.solid.push({ x: -7.5, z: -3.8, r: 2.2 });
      // Wasser: Lagune mit Wasserfall (Dschungel) bzw. Becken (Studio)
      P.water = { x: 8, z: -4 };
      if (studio) { const pool = new T.Mesh(new T.CylinderGeometry(2.6, 2.6, 0.5, 28), R.mat(0xc0c8d0)); pool.position.set(8, 0.25, -4); sc.add(pool); const w = R.water(5, 5, 0x2a8aa8, 0.9); w.geometry = new T.CircleGeometry(2.4, 28); w.position.set(8, 0.52, -4); this.add(w); }
      else {
        const w = R.water(6, 6, 0x2a9aa0, 0.88); w.geometry = new T.CircleGeometry(3.2, 32); w.position.set(8, 0.05, -4); this.add(w);
        for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; at(A.sized(i % 2 ? 'rock_medium_1' : 'rock_small', 0.5 + (i % 3) * 0.25), 8 + Math.cos(a) * 3.4, -4 + Math.sin(a) * 3.4, a); }
        at(A.sized('rock_tall', 3.6), 10.4, -6.4, 0.6);
        const fall = R.water(1, 3.2, 0x9adfff, 0.7); fall.position.set(10.0, 1.7, -5.7); fall.rotation.set(0, -0.9, 0); this.add(fall);
        sc.add(A.instanced('waterlily_pink_group', [{ x: 7.2, z: -3.2, y: 0.07 }, { x: 9, z: -4.8, y: 0.07 }], 0.2));
      }
      this.solid.push({ x: 8, z: -4, r: 2.9 });
      // Buschtelefon-Hütte
      P.phone = { x: -6.2, z: 5.6 };
      const hut = UL.hut(2.4, 2.2, 2.3, studio ? 0x2a2833 : 0x8a6a42, studio ? 0xff4fa0 : 0xc9a45a, [D.SHOW.phone.toUpperCase()]); at(hut, -6.8, 6.6, Math.atan2(6.8, -6.6));
      const chair = A.sized('kf_armchair', 1.0); chair.position.set(0, 0, -0.3); hut.add(chair);
      this.solid.push({ x: -6.8, z: 6.6, r: 1.4 });
      // Holzstapel und Axt-Stumpf
      P.wood = { x: 6.2, z: 5.2 };
      for (let i = 0; i < 7; i++) { const l = R.log(1.3, 0.14); const row = Math.floor(i / 3), k = i % 3; const o = (k - 1 + (row % 2) * 0.5) * 0.29; at(l, 6.9 + Math.sin(0.6) * o, 5.9 + Math.cos(0.6) * o, 0.6).position.y += row * 0.25; }
      at(A.sized('stump', 0.55), 5.6, 6.5);
      this.solid.push({ x: 6.9, z: 5.9, r: 1.1 });
      // Latrine
      P.loo = { x: 10.2, z: 3.2 };
      at(UL.hut(1.3, 1.3, 2.0, studio ? 0x3a3a48 : 0x7a5a3a, studio ? 0x7cff6a : 0xb8944a, ['KLO']), 11.0, 3.4, -Math.PI / 2 - 0.4);
      this.solid.push({ x: 11, z: 3.4, r: 0.9 });
      // Ausgang: Hängebrücke (Dschungel) bzw. Tor (Studio)
      P.exit = { x: 0, z: -12 };
      if (studio) { const g = new T.Group(); for (const x of [-1.4, 1.4]) { const p = new T.Mesh(new T.BoxGeometry(0.3, 3, 0.3), R.mat(0xc0c8d0)); p.position.set(x, 1.5, 0); g.add(p); } const s = R.sign(['AUSGANG'], 3, 0.6, { bg: '#141824', w: 400, h: 80, font: '900 52px system-ui' }); s.position.y = 3.1; g.add(s); at(g, 0, -12.5); }
      else { const br = UL.ropeBridge(12, 1.2); br.position.set(0, 1.1, -19); sc.add(br); const s = R.sign([D.SHOW.bridge.toUpperCase()], 2.6, 0.6, { bg: '#5a3a1e', w: 400, h: 90, font: '900 50px system-ui' }); s.position.set(0, 2.4, -12.6); sc.add(s); }
      // Kisten, Fässer, Deko
      at(A.sized('kd_barrel_large', 0.9), 3.4, -3.2); at(A.sized('kd_crates_stacked', 1.0), 4.3, -2.6, 0.4); at(A.sized('kd_table_medium_decorated_A', 0.8), 3.6, -1.6, 0.6);
      this.solid.push({ x: 3.8, z: -2.5, r: 1.0 });
      if (!studio) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + 0.2; at(A.sized('kd_torch_mounted', 1.2), Math.cos(a) * 11.5, Math.sin(a) * 11.5, -a); }
      this.cine = new UL.Cine(this.camera);
      this.cam = { yaw: Math.PI * 0.85, pitch: 0.38, dist: 6.5 };
    }
    // Figur aus Hindernissen schieben
    push(p, r = 0.35) {
      for (const s of this.solid) { const dx = p.x - s.x, dz = p.z - s.z, d = Math.hypot(dx, dz), m = s.r + r; if (d < m && d > 0.001) { p.x = s.x + dx / d * m; p.z = s.z + dz / d * m; } }
      const d = Math.hypot(p.x, p.z), lim = 12.5; if (d > lim) { p.x *= lim / d; p.z *= lim / d; }
    }
  }
  Camp.Stage = CampStage;

  // Camper-Figuren erzeugen
  function cast(st, list, withMe = true) {
    const figs = [];
    list.forEach(c => {
      if (c.id === 'me' && !withMe) return;
      const f = UL.makeFig(c.look); st.scene.add(f.root); st.figs.push(f);
      const o = { c, f, x: 0, z: 0, tx: 0, tz: 0, state: 'idle', t: UL.rand(0.5, 4), act: '' };
      figs.push(o);
      UL.Tags.set('n:' + c.id, v => v.copy(f.root.position).add(new T.Vector3(0, f.height + 0.35, 0)), esc(UL.Show.first(c)) + (c.id === 'me' ? ' ⭐' : ''), 'tag' + (c.id === 'me' ? ' me' : ''));
    });
    return figs;
  }
  function place(st, o, x, z, ry) { o.x = x; o.z = z; o.f.root.position.set(x, st.h(x, z), z); if (ry != null) o.f.root.rotation.y = ry; }
  function seat(st, o, i) { const s = st.seats[i % st.seats.length]; place(st, o, s.x, s.z, Math.atan2(-s.x, -s.z)); o.f.set('sit'); o.f.root.position.y = st.h(s.x, s.z) + 0.05; o.state = 'sit'; }

  // NPC-Verhalten: Ziel suchen, hinlaufen, etwas tun
  function npcTick(st, o, dt, others) {
    const f = o.f;
    if (o.state === 'busy') return;
    if (o.state === 'walk') {
      const dx = o.tx - o.x, dz = o.tz - o.z, d = Math.hypot(dx, dz);
      if (d < 0.25) { o.state = 'do'; o.t = UL.rand(4, 10); f.move(0); if (o.act === 'sit') { f.set('sit'); f.root.rotation.y = Math.atan2(-o.x, -o.z); } else if (o.act) f.set(o.act); return; }
      const sp = 1.4; o.x += dx / d * sp * dt; o.z += dz / d * sp * dt;
      const p = { x: o.x, z: o.z }; st.push(p); o.x = p.x; o.z = p.z;
      f.root.position.set(o.x, st.h(o.x, o.z), o.z); f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(dx, dz), 8, dt); f.move(sp);
      return;
    }
    o.t -= dt;
    if (o.t > 0) return;
    // neues Ziel
    const P = st.poi, r = Math.random();
    let tx, tz, act = 'idle';
    if (r < 0.35) { const s = st.seats[(Math.random() * st.seats.length) | 0]; tx = s.x; tz = s.z; act = 'sit'; }
    else if (r < 0.5) { tx = P.water.x - 3.2; tz = P.water.z + 1.2; act = 'interact'; }
    else if (r < 0.62) { tx = P.wood.x - 1.2; tz = P.wood.z - 0.4; act = 'use'; }
    else if (r < 0.74) { tx = P.beds.x + UL.rand(-2, 2); tz = P.beds.z + 2.2; act = 'idle2'; }
    else { const a = Math.random() * 6.28, d = UL.rand(4, 9); tx = Math.cos(a) * d; tz = Math.sin(a) * d; act = 'idle'; }
    const p = { x: tx, z: tz }; st.push(p);
    o.tx = p.x; o.tz = p.z; o.act = act; o.state = 'walk'; f.set('idle');
  }

  // ---------- Camp-Phase (Tag) ----------
  Camp.run = ({ theme, tod = 'day' }) => new Promise(async (resolve) => {
    const S = UL.Show.S, Show = UL.Show;
    await UI.fade(true, 0.3);
    const st = new CampStage(theme, tod);
    const list = Show.alive();
    const figs = cast(st, list);
    const meO = figs.find(o => o.c.id === 'me'), npcs = figs.filter(o => o !== meO);
    npcs.forEach((o, i) => { if (i < 4) seat(st, o, i * 2 + 1); else { const a = Math.random() * 6.28, d = UL.rand(4, 9); const p = { x: Math.cos(a) * d, z: Math.sin(a) * d }; st.push(p); place(st, o, p.x, p.z, Math.random() * 6); } });
    place(st, meO, 0, 4.2, Math.PI);
    R.set(st);
    UL.Audio.music('camp'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'jungle');
    UI.hint({ move: 'Laufen', look: 'Kamera', ok: 'Kommando', menu: 'Buschtrommel', start: 'Pause' });
    await UI.fade(false, 0.4);
    const me = meO.c;
    const day = st.day = { energy: ENERGY, carry: null, event: false, eventT: UL.rand(25, 45), chestOpen: false, busy: false, done: false, talked: {} };
    // Schatzkiste an manchen Tagen
    const chestSpots = [[-3, 9], [9.5, 8], [-10, 2], [4, -9], [-4, -9.5]];
    let chest = null;
    if (S.day % 2 === 0 || Math.random() < 0.35) { const [x, z] = UL.pick(chestSpots); chest = A.sized('kd_chest', 0.7); chest.position.set(x, st.h(x, z), z); chest.rotation.y = Math.atan2(-x, -z); st.scene.add(chest); st.solid.push({ x, z, r: 0.5 }); chest.userData.p = { x, z }; }
    // Trag-Objekte
    const carryObj = { holz: R.log(0.8, 0.09), wasser: new T.Mesh(new T.CylinderGeometry(0.16, 0.13, 0.3, 10), R.mat(0x8a8f99)) };
    let chatT = 3;
    if (!UL.bot) UI.toast(`Tag ${S.day}: Hilf im Camp, rede mit den anderen – du hast ${ENERGY} Aktionen.`, '🌴', 4200);

    const near = (p, r) => Math.hypot(meO.x - p.x, meO.z - p.z) < r;
    const hud = () => UI.hud(`<span class="chip big">📅 Tag ${S.day}/${S.days}</span><span class="chip">⚡ ${'●'.repeat(day.energy)}${'○'.repeat(ENERGY - day.energy)}</span><span class="chip">❤️ ${Math.round(me.sym)} · 😂 ${Math.round(me.ent)}</span>${day.carry ? `<span class="chip">${day.carry === 'holz' ? '🪵 Holz' : '🪣 Wasser'}</span>` : ''}`);
    hud();

    const spend = () => { day.energy--; hud(); };
    const fx = (d, txt) => { Show.change(me, d); const parts = []; if (d.sym) parts.push(`❤️ ${d.sym > 0 ? '+' : ''}${Math.round(d.sym)}`); if (d.ent) parts.push(`😂 ${d.ent > 0 ? '+' : ''}${Math.round(d.ent)}`); UI.toast((txt ? txt + '  ' : '') + parts.join('  '), '📺', 2200); hud(); };
    const bubble = (o, text, sec = 3) => UL.Tags.bubble(o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, o.f.height + 0.75, 0)), text, sec);
    const fmtX = (s, x) => s.replace(/\{x\}/g, x);
    const others = () => npcs;
    const busy = async (fn) => { day.busy = true; UI.cmd([]); try { await fn(); } catch (e) { console.error(e); } day.busy = false; hud(); };

    // Aktionen
    async function talk(o) {
      const c = o.c, rel = c.rel.me ?? 50;
      o.state = 'busy'; o.f.set('idle'); UL.faceTo(o.f, meO.x, meO.z); UL.faceTo(meO.f, o.x, o.z);
      const topics = D.TALK.filter(t => (!t.need || c.mood < 0.45) && (!t.minRel || rel >= t.minRel));
      const pickT = await UI.choose(`Gespräch mit ${c.name}`, `<small>${esc(c.job)} · Beziehung ${'❤'.repeat(Math.max(1, Math.round(rel / 20)))}</small><br>„${esc(c.quote)}“`, topics.map(t => ({ label: t.label, icon: t.icon, value: t.id })), { cancel: 'Zurück', who: 'Camp', icon: '🔥' });
      if (!pickT) { o.state = 'idle'; o.t = 1; return false; }
      const t = D.TALK.find(x => x.id === pickT);
      let target = null;
      if (t.gossip) {
        const pool = Show.alive().filter(x => x.id !== 'me' && x.id !== c.id);
        const tid = pool.length ? await UI.choose('Über wen?', null, pool.map(x => ({ label: x.name, value: x.id })), { cancel: 'Doch nicht' }) : null;
        if (!tid) { o.state = 'idle'; o.t = 1; return false; }
        target = Show.byId(tid);
      }
      spend();
      bubble(meO, fmtX(UL.pick(t.lines), target ? UL.Show.first(target) : ''), 3.2);
      meO.f.play('interact');
      await UL.sleep(UL.bot ? 0.05 : 1.6);
      let good = Math.random() < 0.45 + rel / 220 + c.t.nett * 0.25 + (t.id === 'witz' ? c.t.humor * 0.3 - 0.1 : 0);
      if (t.gossip) good = Math.random() < c.t.drama * 0.8 + 0.1;
      const reply = t.gossip ? UL.pick(good ? D.REPLY.gossipYes : D.REPLY.gossipNo) : UL.pick(good ? D.REPLY.good : D.REPLY.bad);
      bubble(o, reply, 3.2); o.f.play(good ? (t.id === 'witz' ? 'cheer' : 'interact') : 'block');
      Show.rel(me, c, good ? t.rel : -Math.round(t.rel / 2));
      if (target) Show.rel(me, target, -8);
      if (t.id === 'troest' && good) c.mood = Math.min(1, c.mood + 0.3);
      if (t.id === 'buendnis' && good) Show.log(`${me.name} und ${c.name} schmieden ein Bündnis.`, '🤝');
      if (t.gossip) Show.log(`${me.name} lästert bei ${UL.Show.first(c)} über ${UL.Show.first(target)}.`, '🐍');
      fx({ sym: good ? t.sym : Math.min(t.sym, 0) - 1, ent: t.ent + (good ? 0 : 1) }, good ? 'Kommt gut an!' : 'Hm, das lief nicht so.');
      await UL.sleep(UL.bot ? 0.05 : 1.2);
      o.state = 'idle'; o.t = UL.rand(1, 3); day.talked[c.id] = true;
      return true;
    }
    async function phone() {
      const q = UL.pick(D.PHONE), x = UL.Show.first(UL.pick(Show.alive().filter(c => c.id !== 'me')) || me);
      // Kamera in die Hütte
      st.cine.cut(new T.Vector3(st.poi.phone.x + 0.2, 1.6, st.poi.phone.z - 0.6), new T.Vector3(-6.8, 1.0, 6.6));
      st.camLock = true;
      UL.Audio.sfx('phone');
      const i = await UI.choose('📞 ' + D.SHOW.phone, `<i>„${esc(q.q)}“</i>`, q.a.map((a, k) => ({ label: fmtX(a[0], x), value: k + 1 })), { who: 'Stimme aus dem Off', icon: '📞' });
      st.camLock = false;
      if (!i) return;
      const a = q.a[i - 1]; spend();
      if (a[0].includes('{x}') && a[1] < 0) { const t = Show.alive().find(c => UL.Show.first(c) === x); if (t) Show.rel(me, t, -6); }
      Show.log(`Buschtelefon: „${fmtX(a[0], x)}“`, '📞');
      fx({ sym: a[1], ent: a[2] }, 'Das sehen die Zuschauer heute Abend.');
    }
    async function treasure() {
      const [q, ans] = UL.pick(D.QUIZ), order = UL.rng.shuffle([0, 1, 2, 3]);
      spend();
      const i = await UI.choose('🧰 Schatzkiste', `Ein Rätsel klebt am Deckel: <b>${esc(q)}</b>`, order.map(o => ({ label: ans[o], value: o + 1 })), { who: 'Schatzsuche', icon: '🗝️' });
      day.chestOpen = true;
      if (i === 1) {
        const [n, ic] = UL.pick(D.LOOT); S.lux.push(n); UL.Audio.sfx('fanfare');
        Show.alive().forEach(c => { c.mood = Math.min(1, c.mood + 0.15); if (c.id !== 'me') Show.rel(me, c, 4); });
        Show.log(`Schatzkiste geknackt: ${n} fürs Camp!`, ic);
        fx({ sym: 5, ent: 2 }, `Richtig! ${ic} ${n} für alle!`);
        npcs.forEach(o => { if (Math.random() < 0.5) { bubble(o, UL.pick(['Jaaa!', 'Du bist die Beste! Der Beste! Egal!', n + '! Endlich!']), 2.5); o.f.play('cheer'); } });
      } else { UL.Audio.sfx('boo'); fx({ sym: -1, ent: 2 }, `Falsch! Richtig wäre „${ans[0]}“ gewesen.`); }
      if (chest) { chest.rotation.x = -0.3; }
    }
    // Story-Momente mit Rivale und Kumpel
    async function story() {
      const rv = Show.byId(S.rival), bd = Show.byId(S.buddy);
      const ro = rv && !rv.out && npcs.find(o => o.c === rv), bo = bd && !bd.out && npcs.find(o => o.c === bd);
      if (ro && (me.rel[rv.id] ?? 50) < 42 && !S.storyDone?.['clash' + S.day] && Math.random() < 0.6) {
        (S.storyDone = S.storyDone || {})['clash' + S.day] = 1;
        ro.state = 'busy'; place(st, ro, meO.x + 1.2, meO.z + 0.6); UL.faceTo(ro.f, meO.x, meO.z); UL.faceTo(meO.f, ro.x, ro.z); ro.f.play('block');
        st.cam.yaw = Math.atan2(meO.x - ro.x, meO.z - ro.z) + Math.PI * 0.6;
        bubble(ro, UL.pick(['Ich hab genau gehört, was du über mich erzählst!', 'Du hältst dich wohl für was Besseres!', 'Wir zwei müssen mal reden. Jetzt!']), 3.5);
        UL.Audio.sfx('tense');
        const i = await UI.choose('💥 Zoff mit ' + rv.name, `${esc(Show.first(rv))} baut sich vor dir auf. Alle Kameras sind auf euch gerichtet.`, [
          { label: 'Entschuldigen und die Hand reichen', icon: '🤝', value: 1 }, { label: 'Zurückschießen: „Sag’s mir ins Gesicht!“', icon: '🔥', value: 2 }, { label: 'Einfach stehen lassen', icon: '🚶', value: 3 }], { who: 'Drama im Camp', icon: '🎭' });
        if (i === 1) { Show.rel(me, rv, 18); fx({ sym: 4, ent: 1 }, 'Versöhnung vor laufender Kamera'); bubble(ro, 'Na gut … Frieden.', 2.5); Show.log(`${me.name} und ${rv.name} vertragen sich.`, '🤝'); }
        else if (i === 2) { Show.rel(me, rv, -12); fx({ sym: -2, ent: 7 }, 'Der Streit des Tages!'); ro.f.play('hit'); meO.f.play('block'); UL.Audio.sfx('gasp'); npcs.forEach(o => { if (o !== ro && Math.random() < 0.5) bubble(o, UL.pick(['Uiuiui!', 'Popcorn, bitte!', 'Hört auf, ihr zwei!']), 2.2); }); Show.log(`Lauter Streit zwischen ${me.name} und ${rv.name}!`, '💥'); }
        else { Show.rel(me, rv, -4); fx({ sym: 1, ent: 2 }, 'Cool geblieben'); Show.log(`${me.name} lässt ${rv.name} einfach stehen.`, '🚶'); }
        ro.state = 'idle'; ro.t = 2; return true;
      }
      if (bo && (me.rel[bd.id] ?? 50) >= 62 && !S.ally) {
        S.ally = bd.id;
        bo.state = 'busy'; place(st, bo, meO.x - 1.1, meO.z + 0.5); UL.faceTo(bo.f, meO.x, meO.z); UL.faceTo(meO.f, bo.x, bo.z);
        bubble(bo, 'Hey … wollen wir zwei zusammenhalten? Bis ganz zum Schluss?', 3.5);
        const i = await UI.choose('🤝 ' + bd.name, `${esc(Show.first(bd))} bietet dir ein Bündnis an.`, [{ label: 'Ja, wir halten zusammen!', icon: '🤝', value: 1 }, { label: 'Lieber nicht', icon: '🙅', value: 2 }], { who: 'Freundschaft', icon: '💚' });
        if (i === 1) { Show.rel(me, bd, 15); fx({ sym: 3, ent: 1 }, 'Ein Bündnis!'); bo.f.play('cheer'); Show.log(`${me.name} und ${bd.name} schmieden ein Bündnis.`, '🤝'); }
        else { Show.rel(me, bd, -10); fx({ ent: 2 }, 'Autsch, das saß.'); Show.log(`${me.name} lehnt das Bündnis mit ${bd.name} ab.`, '💔'); }
        bo.state = 'idle'; bo.t = 2; return true;
      }
      return false;
    }
    async function event() {
      day.event = true;
      if (await story()) return;
      const ev = UL.pick(D.EVENTS), pool = npcs.slice().sort(() => Math.random() - 0.5);
      const a = pool[0] ? pool[0].c : me, b = pool[1] ? pool[1].c : me;
      const f = s => s.replace(/\{a\}/g, UL.Show.first(a)).replace(/\{b\}/g, UL.Show.first(b));
      UL.Audio.sfx('tense');
      if (pool[0]) { st.cam.yaw = Math.atan2(pool[0].x - meO.x, pool[0].z - meO.z) + Math.PI; bubble(pool[0], '!!!', 2); }
      const i = await UI.choose('⚡ ' + ev.title, esc(f(ev.text)), ev.opts.map((o, k) => ({ label: f(o[0]), value: k + 1 })), { who: 'Ereignis im Camp', icon: '🔥' });
      const eff = ev.opts[(i || 1) - 1][1];
      if (eff.relA) Show.rel(me, a, eff.relA); if (eff.relB) Show.rel(me, b, eff.relB);
      Show.log(`${ev.title}: ${f(ev.opts[(i || 1) - 1][0])}`, '⚡');
      fx({ sym: eff.sym, ent: eff.ent }, ev.title);
    }
    async function endDay(ask) {
      if (ask && day.energy > 0) { const ok = await UI.choose('Tag beenden?', `Du hast noch ${day.energy} Aktionen übrig. Wer im Camp hilft, sammelt Sympathie.`, [{ label: 'Ja, ab zum Abendessen', icon: '🌅', value: 1 }, { label: 'Weiter im Camp', icon: '🌴', value: 2 }]); if (ok !== 1) return; }
      day.done = true; UI.cmd([]); UI.hint({}); UL.Tags.clear(); UI.hud('');
      await UI.fade(true, 0.5);
      resolve();
    }

    // Kamera hinter dem Spieler (rechter Stick / Maus / Wischen dreht)
    function camTick(dt) {
      if (st.camLock) { st.cine.update(dt); return; }
      const c = st.cam;
      c.yaw -= In.look.x; c.pitch = UL.clamp(c.pitch + In.look.y, 0.12, 1.1); c.dist = UL.clamp(c.dist - In.zoom * 1.2, 3.5, 11);
      const p = meO.f.root.position, port = UL.portrait(), d = c.dist * (port ? 1.25 : 1);
      const want = new T.Vector3(p.x + Math.sin(c.yaw) * Math.cos(c.pitch) * d, p.y + 1.2 + Math.sin(c.pitch) * d, p.z + Math.cos(c.yaw) * Math.cos(c.pitch) * d);
      st.camera.position.lerp(want, 1 - Math.exp(-8 * dt)); st.camera.lookAt(p.x, p.y + 1.1, p.z);
    }

    st.update = (dt) => {
      st.tick(dt);
      if (day.done) return;
      camTick(dt);
      // NPCs
      for (const o of npcs) npcTick(st, o, dt, npcs);
      chatT -= dt;
      if (chatT <= 0) { chatT = UL.rand(4, 8); const o = UL.pick(npcs); if (o && o.state !== 'busy') bubble(o, Math.random() < 0.3 ? o.c.quote : UL.pick(CHATTER), 3.4); }
      if (day.busy) return;
      // Spieler laufen
      let mx = In.move.x, my = In.move.y;
      if (UL.bot) { mx = my = 0; }
      const sp = (In.run ? 4.6 : 2.4) * Math.min(1, Math.hypot(mx, my));
      if (sp > 0.05) {
        const yaw = st.cam.yaw, fx_ = -Math.sin(yaw), fz = -Math.cos(yaw);
        const vx = fx_ * -my - fz * mx, vz = fz * -my + fx_ * mx;
        const l = Math.hypot(vx, vz) || 1;
        meO.x += vx / l * sp * dt; meO.z += vz / l * sp * dt;
        const p = { x: meO.x, z: meO.z }; st.push(p); meO.x = p.x; meO.z = p.z;
        meO.f.root.rotation.y = UL.angDamp(meO.f.root.rotation.y, Math.atan2(vx, vz), 12, dt);
        if (meO.f.base === 'sit') meO.f.set('idle');
      }
      meO.f.root.position.set(meO.x, st.h(meO.x, meO.z), meO.z);
      meO.f.move(sp);
      // Tragen
      for (const [k, o] of Object.entries(carryObj)) { if (day.carry === k) { if (!o.parent) st.scene.add(o); o.position.copy(meO.f.root.position).add(new T.Vector3(0, 1.0, 0)).addScaledVector(new T.Vector3(Math.sin(meO.f.root.rotation.y), 0, Math.cos(meO.f.root.rotation.y)), 0.35); o.rotation.y = meO.f.root.rotation.y + Math.PI / 2; } else if (o.parent) st.scene.remove(o); }
      // Ereignis
      day.eventT -= dt;
      if (!day.event && (day.eventT <= 0 || day.energy <= 1) && !UL.bot) { busy(event); return; }
      // Kommandomenü je nach Ort
      const P = st.poi, cmds = [];
      let npcNear = null, nd = 2.0;
      for (const o of npcs) { const d = Math.hypot(o.x - meO.x, o.z - meO.z); if (d < nd) { nd = d; npcNear = o; } }
      if (day.energy > 0) {
        if (npcNear) cmds.push({ id: 'talk', label: 'Reden mit ' + UL.Show.first(npcNear.c), icon: '💬', hot: true, o: npcNear });
        if (!day.carry && near(P.wood, 2.4)) cmds.push({ id: 'holz', label: 'Holz sammeln', icon: '🪵', hot: true });
        if (!day.carry && near(P.water, 4.4)) cmds.push({ id: 'wasser', label: 'Wasser holen', icon: '🪣', hot: true });
        if (day.carry === 'holz' && near({ x: 0, z: 0 }, 2.6)) cmds.push({ id: 'feuer', label: 'Feuer schüren', icon: '🔥', hot: true });
        if (day.carry === 'wasser' && near({ x: 0, z: 0 }, 2.6)) cmds.push({ id: 'kochen', label: 'Wasser abkochen', icon: '♨️', hot: true });
        if (near(P.loo, 2.2)) cmds.push({ id: 'klo', label: 'Klo putzen', icon: '🧽', hot: true });
        if (near(P.phone, 2.6)) cmds.push({ id: 'phone', label: D.SHOW.phone, icon: '📞', hot: true });
        if (chest && !day.chestOpen && near(chest.userData.p, 1.8)) cmds.push({ id: 'chest', label: 'Schatzkiste öffnen', icon: '🧰', hot: true });
      }
      if (!npcNear && near({ x: 0, z: 0 }, 3.2) && meO.f.base !== 'sit') cmds.push({ id: 'sit', label: 'Ans Feuer setzen', icon: '🪵' });
      cmds.push({ id: 'drum', label: 'Buschtrommel', icon: '🥁' });
      cmds.push({ id: 'end', label: day.energy > 0 ? 'Tag beenden' : 'Abendessen!', icon: '🌅', hot: day.energy <= 0 });
      UI.cmd(cmds);
      if (In.pressed('menu')) { Show.drum(); return; }
      let c = UI.cmdTick();
      if (UL.bot) c = botPick(cmds);
      if (!c) return;
      if (c.id === 'talk') busy(() => talk(c.o));
      else if (c.id === 'holz') { day.carry = 'holz'; meO.f.play('pickup'); UL.Audio.sfx('chop'); hud(); }
      else if (c.id === 'wasser') { day.carry = 'wasser'; meO.f.play('pickup'); UL.Audio.sfx('splash'); hud(); }
      else if (c.id === 'feuer' || c.id === 'kochen') { spend(); day.carry = null; meO.f.play('throw'); UL.Audio.sfx(c.id === 'feuer' ? 'whoosh' : 'splash'); st.fire.scale.setScalar(1.4); UL.after(2, () => st.fire.scale.setScalar(1)); Show.log(`${me.name} ${c.id === 'feuer' ? 'schürt das Feuer' : 'kocht Wasser ab'}.`, c.id === 'feuer' ? '🔥' : '♨️'); fx({ sym: 2 + Math.random() * 2, ent: 0.5 }, c.id === 'feuer' ? 'Das Feuer brennt!' : 'Trinkwasser fürs Camp!'); npcs.forEach(o => { if (o.state === 'sit' && Math.random() < 0.4) bubble(o, UL.pick(['Danke dir!', 'Endlich mal jemand, der was tut!', 'Wärmt schön.']), 2.4); }); }
      else if (c.id === 'klo') { spend(); meO.f.play('use'); Show.log(`${me.name} putzt das Klo. Respekt!`, '🧽'); fx({ sym: 4, ent: 2 }, 'Klo geputzt – die Zuschauer staunen.'); }
      else if (c.id === 'phone') busy(phone);
      else if (c.id === 'chest') busy(treasure);
      else if (c.id === 'sit') { let best = 0, bd = 1e9; st.seats.forEach((s, i) => { const d = Math.hypot(s.x - meO.x, s.z - meO.z); if (d < bd) { bd = d; best = i; } }); const s = st.seats[best]; meO.x = s.x; meO.z = s.z; meO.f.root.rotation.y = Math.atan2(-s.x, -s.z); meO.f.set('sit'); }
      else if (c.id === 'drum') Show.drum();
      else if (c.id === 'end') busy(() => endDay(day.energy > 0));
      if (day.energy <= 0 && !day.hinted) { day.hinted = true; UI.toast('Keine Aktionen mehr – Zeit fürs Abendessen!', '🌅', 3000); }
    };
    // Testpilot: macht ein paar Aktionen, dann Feierabend
    let botT = 0.5;
    function botPick(cmds) {
      if (st.time < botT) return null; botT = st.time + 0.4;
      const hot = cmds.find(c => c.hot && c.id !== 'end' && c.id !== 'talk');
      if (hot) return hot;
      if (day.energy <= 0) return cmds.find(c => c.id === 'end');
      meO.x = st.poi.wood.x - 1.4; meO.z = st.poi.wood.z - 1; if (day.carry) { meO.x = 0; meO.z = 2; }
      return null;
    }
  });

  // ---------- Abendessen ----------
  Camp.evening = ({ theme, stars, max, text, by }) => new Promise(async (resolve) => {
    const Show = UL.Show, S = Show.S;
    await UI.fade(true, 0.3);
    UI.cmd([]); UI.hud(''); UI.hint({});
    const st = new CampStage(theme, 'evening');
    const figs = cast(st, Show.alive());
    figs.forEach((o, i) => seat(st, o, i));
    R.set(st);
    UL.Audio.music('night'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'night');
    let ang = 0.4;
    st.update = (dt) => { st.tick(dt); ang += dt * 0.08; st.camera.position.set(Math.cos(ang) * 7.5, 4.2, Math.sin(ang) * 7.5); st.camera.lookAt(0, 0.6, 0); };
    await UI.fade(false, 0.5);
    await UI.banner('🍲 Abendessen', `${stars} von ${max} Portionen`, 1800);
    await UI.say('camp', (by ? `${by} hat heute ${stars} Sterne geholt. ` : '') + text, { name: 'Am Lagerfeuer' });
    const q = stars / Math.max(1, max);
    figs.forEach(o => { if (o.c.id === 'me') return; if (q >= 0.6 && Math.random() < 0.6) { o.f.play('cheer'); UL.Tags.bubble(o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Endlich was Richtiges!', 'Hmmm, Fisch!', 'Danke, danke, danke!']), 2.6); } else if (q < 0.3 && Math.random() < 0.5) UL.Tags.bubble(o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Schon wieder Bohnen …', 'Mein Magen knurrt.', 'Ich ess einfach Luft.']), 2.6); });
    UL.Audio.sfx(q >= 0.6 ? 'cheer' : 'eat');
    if (stars > 0) {
      const me = Show.me();
      const i = await UI.choose('Wie isst du heute?', 'Alle schauen auf den Topf …', [
        { label: 'Gerecht teilen', icon: '🤝', sub: 'Jeder bekommt gleich viel.', value: 1 },
        { label: 'Die größte Portion nehmen', icon: '😋', sub: 'Hunger ist Hunger. Die Zuschauer sehen alles.', value: 2 },
        { label: 'Verzichten – die anderen brauchen es mehr', icon: '💚', sub: 'Du gehst hungrig ins Bett.', value: 3 }]);
      if (i === 1) Show.change(me, { sym: 2 });
      else if (i === 2) { Show.change(me, { sym: -4, ent: 4 }); Show.alive().forEach(c => Show.rel(me, c, -3)); Show.log(`${me.name} schnappt sich die größte Portion.`, '😋'); }
      else if (i === 3) { Show.change(me, { sym: 5 }); me.mood = Math.max(0, me.mood - 0.2); Show.alive().forEach(c => Show.rel(me, c, 3)); Show.log(`${me.name} verzichtet aufs Essen.`, '💚'); }
    }
    await UI.say(UL.pick(['lotte', 'mats']), UL.pick(D.MOD.evening)[1]);
    UL.Tags.clear();
    await UI.fade(true, 0.4);
    resolve();
  });

  // ---------- Auszug in der Nacht ----------
  Camp.exit = ({ theme, safe, last2, out }) => new Promise(async (resolve) => {
    const Show = UL.Show;
    await UI.fade(true, 0.3);
    UI.cmd([]); UI.hud(''); UI.hint({});
    const st = new CampStage(theme, 'night');
    const all = safe.concat([last2, out]);
    const figs = cast(st, UL.rng.shuffle(all));
    figs.forEach((o, i) => seat(st, o, i));
    R.set(st);
    UL.Audio.music('tense'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'night');
    const cam = { p: new T.Vector3(0, 3, 7), l: new T.Vector3(0, 0.8, 0) };
    st.update = (dt) => { st.tick(dt); st.camera.position.lerp(cam.p, 1 - Math.exp(-3 * dt)); st.camera.lookAt(cam.l); };
    const focus = c => { const o = figs.find(x => x.c === c); if (!o) return; const p = o.f.root.position, d = new T.Vector3(p.x, 0, p.z).normalize(); cam.p.copy(p).add(new T.Vector3(-d.x * 2.4, 1.1, -d.z * 2.4)); cam.l.copy(p).add(new T.Vector3(0, 0.9, 0)); };
    st.camera.position.copy(cam.p); st.camera.lookAt(cam.l);
    await UI.fade(false, 0.5);
    UL.Audio.sfx('phone');
    await UI.banner('Die Entscheidung', 'Wer muss das Lager verlassen?', 1800);
    for (const [w, t] of [UL.pick(D.MOD.exitIntro)]) await UI.say(w, t);
    if (safe.length) {
      const names = safe.map(c => c.name);
      UL.Audio.sfx('drum');
      await UI.say('lotte', names.length > 1 ? `Sicher sind: ${names.slice(0, -1).join(', ')} und ${names[names.length - 1]}.` : `Sicher ist: ${names[0]}.`);
      figs.forEach(o => { if (safe.includes(o.c)) o.f.play('cheer'); });
    }
    cam.p.set(0, 2.2, 5); cam.l.set(0, 0.8, 0);
    await UI.say('mats', `Jetzt sind nur noch zwei übrig: ${last2.name} und ${out.name}.`);
    focus(last2); UL.Audio.sfx('tense'); await UL.sleep(UL.bot ? 0.05 : 1.4);
    focus(out); await UL.sleep(UL.bot ? 0.05 : 1.4);
    UL.Audio.sfx('drum');
    await UI.say('lotte', UI.fmt(UL.pick(D.MOD.safe)[1], { n: last2.name }));
    const oo = figs.find(x => x.c === out);
    focus(out);
    await UI.say('mats', UI.fmt(UL.pick(D.MOD.out)[1], { n: out.name }));
    if (out.id !== 'me') {
      oo.f.set('idle'); oo.f.play('cheer');
      UL.Tags.bubble(out.id, v => v.copy(oo.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Danke für alles, ihr Lieben!', 'Ich komm wieder. Mit Pizza!', 'Endlich ein richtiges Bett!', out.quote]), 3.4);
      await UL.sleep(UL.bot ? 0.05 : 1.8);
      // zum Ausgang laufen
      const ex = st.poi.exit; let tt = 0;
      cam.p.set(ex.x + 3, 3, ex.z + 9); cam.l.set(ex.x, 1, ex.z);
      await new Promise(r => { const upd = st.update; st.update = (dt) => { upd(dt); tt += dt; const p = oo.f.root.position, dx = ex.x - p.x, dz = ex.z - 2 - p.z, d = Math.hypot(dx, dz); if (d > 0.3 && tt < 6) { p.x += dx / d * 2.2 * dt; p.z += dz / d * 2.2 * dt; p.y = st.h(p.x, p.z); oo.f.root.rotation.y = Math.atan2(dx, dz); oo.f.move(2.2); } else { st.update = upd; r(); } }; });
    }
    UL.Tags.clear();
    await UI.fade(true, 0.5);
    resolve(out.id);
  });
})();
