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
      sc.add(R.logs(6, 0.5)); this.fire = this.add(R.fire(tod === 'day' ? 0.55 : 0.9)); this.solid.push({ x: 0, z: 0, r: 1.1, low: 1 });
      this.seats = [];
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3; this.seats.push({ x: Math.cos(a) * 2.5, z: Math.sin(a) * 2.5, a }); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.3 + Math.PI / 10; const l = R.log(1.7, 0.17); at(l, Math.cos(a) * 2.6, Math.sin(a) * 2.6, -a + Math.PI / 2); }
      const pot = new T.Mesh(new T.CylinderGeometry(0.28, 0.22, 0.32, 12), R.mat(0x2a2a2e)); pot.position.set(0.15, 0.55, 0); sc.add(pot); this.pot = pot;
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
      this.solid.push({ x: 8, z: -4, r: 2.9, low: 1 });
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
      // Sani-Zelt von Doc Rudi (weißes Zelt mit rotem Kreuz)
      P.doc = { x: 3.2, z: 9.0 };
      { const g = new T.Group(), white = new T.MeshLambertMaterial({ color: R.lin(0xf2f2ee), side: T.DoubleSide });
        const roof = new T.Mesh(new T.ConeGeometry(1.7, 1.6, 4, 1, true), white); roof.position.y = 2.0; roof.rotation.y = Math.PI / 4; g.add(roof);
        for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) { const p = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1.3, 6), R.mat(0xc0c0c8)); p.position.set(x, 0.65, z); g.add(p); }
        const back = new T.Mesh(new T.PlaneGeometry(2.3, 1.3), white); back.position.set(0, 0.65, 1.15); g.add(back);
        const cross = R.sign(['✚'], 0.6, 0.6, { bg: '#ffffff', fg: '#d8262b', w: 128, h: 128, font: '900 110px system-ui' }); cross.position.set(0, 2.05, -0.86); cross.rotation.x = -0.45; cross.rotation.y = Math.PI; g.add(cross);
        if (A.has('kd_bed_floor')) { const b = A.sized('kd_bed_floor', 0.35); b.position.set(0.4, 0, 0.3); g.add(b); }
        at(g, 3.6, 10.0, Math.PI); this.solid.push({ x: 3.6, z: 10.3, r: 1.0 }); }
      // Kisten, Fässer, Deko
      at(A.sized('kd_barrel_large', 0.9), 3.4, -3.2); at(A.sized('kd_crates_stacked', 1.0), 4.3, -2.6, 0.4); at(A.sized('kd_table_medium_decorated_A', 0.8), 3.6, -1.6, 0.6);
      this.solid.push({ x: 3.8, z: -2.5, r: 1.0 });
      if (A.has('ph_bucket')) { at(A.sized('ph_bucket', 0.4), 4.3, -3.3, 0.3); at(A.sized('ph_crate', 0.45), 3.1, -2.9, 0.9); }   // Poly Haven, im Sperrbereich der Kisten
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
  // Freundschaft 💚 / Zoff ⚡ mit dir am Namensschild
  function relIcon(c) { const r = c.rel && c.rel.me; return r == null ? '' : r >= 72 ? ' 💚' : r <= 30 ? ' ⚡' : ''; }
  Camp.relIcon = relIcon;
  function cast(st, list, withMe = true) {
    const figs = [];
    list.forEach(c => {
      if (c.id === 'me' && !withMe) return;
      const f = UL.makeFig(c.look); st.scene.add(f.root); st.figs.push(f);
      const o = { c, f, x: 0, z: 0, tx: 0, tz: 0, state: 'idle', t: UL.rand(0.5, 4), act: '' };
      figs.push(o);
      UL.Tags.set('n:' + c.id, v => v.copy(f.root.position).add(new T.Vector3(0, f.height + 0.35, 0)), esc(UL.Show.first(c)) + (c.id === 'me' ? ' ⭐' : relIcon(c)), 'tag' + (c.id === 'me' ? ' me' : ''));
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
    // Doc Rudi am Sani-Zelt, Ranger Kalle dreht seine Runden am Lagerrand
    const crewTag = (o, txt) => UL.Tags.set('n:' + o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, o.f.height + 0.35, 0)), txt, 'tag crew');
    const docO = { c: { id: 'doc' }, f: UL.makeFig(D.DOC.look, 1.7), x: 0, z: 0 }, rangerO = { c: { id: 'ranger' }, f: UL.makeFig(D.RANGER.look, 1.85), x: 0, z: 0, wp: 0, wait: 0 };
    for (const o of [docO, rangerO]) { st.scene.add(o.f.root); st.figs.push(o.f); }
    place(st, docO, st.poi.doc.x, st.poi.doc.z, Math.PI); crewTag(docO, '🩺 ' + D.DOC.name); crewTag(rangerO, '🪖 ' + D.RANGER.name);
    const PATROL = [[0, -10.6], [8.5, -8], [11.2, 0], [9, 8.5], [0, 11.2], [-8.5, 8.5], [-11.2, 0], [-9, -8.5]];
    place(st, rangerO, PATROL[0][0], PATROL[0][1], 0);
    st.crew = { doc: docO, ranger: rangerO };
    function rangerTick(dt) {
      const o = rangerO; if (o.busy) return;
      if (o.wait > 0) { o.wait -= dt; o.f.move(0); return; }
      const [tx, tz] = PATROL[o.wp], dx = tx - o.x, dz = tz - o.z, d = Math.hypot(dx, dz);
      if (d < 0.3) { o.wp = (o.wp + 1) % PATROL.length; o.wait = UL.rand(1.5, 4); o.f.move(0); if (Math.random() < 0.4) o.f.play('idle2'); return; }
      const sp = 1.2; o.x += dx / d * sp * dt; o.z += dz / d * sp * dt;
      o.f.root.position.set(o.x, st.h(o.x, o.z), o.z); o.f.root.rotation.y = UL.angDamp(o.f.root.rotation.y, Math.atan2(dx, dz), 6, dt); o.f.move(sp);
    }
    R.set(st);
    UL.Audio.music('camp'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'jungle');
    UI.hint({ move: 'Laufen', run: 'Rennen', look: 'Kamera', ok: 'Kommando', menu: 'Buschtrommel', start: 'Pause' });
    await UI.fade(false, 0.4);
    const me = UL.Show.vit(meO.c);
    // hungrig oder müde: weniger Kraft für Aktionen
    const MAXE = Math.max(2, ENERGY - (me.slp < 35 && !UL.Show.hasLux('kaffee') ? 1 : 0) - (me.hun < 30 ? 1 : 0));
    const day = st.day = { energy: MAXE, carry: null, event: false, eventT: UL.rand(25, 45), chestOpen: false, busy: false, done: false, talked: {} };
    // Schatzkiste an manchen Tagen
    const chestSpots = [[-3, 9], [9.5, 8], [-10, 2], [4, -9], [-4, -9.5]];
    let chest = null;
    if (S.day % 2 === 0 || Math.random() < 0.35) { const [x, z] = UL.pick(chestSpots); chest = A.sized('kd_chest', 0.7); chest.position.set(x, st.h(x, z), z); chest.rotation.y = Math.atan2(-x, -z); st.scene.add(chest); st.solid.push({ x, z, r: 0.5 }); chest.userData.p = { x, z }; }
    // Trag-Objekte
    const carryObj = { holz: R.log(0.8, 0.09), wasser: new T.Mesh(new T.CylinderGeometry(0.16, 0.13, 0.3, 10), R.mat(0x8a8f99)) };
    let chatT = 3;
    if (!UL.bot) UI.toast(`Tag ${S.day}: Hilf im Camp, rede mit den anderen – du hast ${MAXE} Aktionen.${MAXE < ENERGY ? (me.hun < 30 ? ' Dein Magen knurrt.' : '') + (me.slp < 35 ? ' Du bist todmüde.' : '') : ''}`, '🌴', 4200);

    const near = (p, r) => Math.hypot(meO.x - p.x, meO.z - p.z) < r;
    const rank0 = UL.Phone.rank(me).pos;
    const rankChip = () => { const r = UL.Phone.rank(me), d = rank0 - r.pos; return `<span class="chip ${d > 0 ? 'up' : d < 0 ? 'warn' : ''}">📺 Platz ${r.pos}/${r.n}${d > 0 ? ' ▲' : d < 0 ? ' ▼' : ''}</span>`; };
    const hud = () => UI.hud(`<span class="chip big">📅 Tag ${S.day}/${S.days}</span><span class="chip">⚡ ${'●'.repeat(day.energy)}${'○'.repeat(MAXE - day.energy)}</span><span class="chip ${me.hun < 30 ? 'warn' : ''}">🍗 ${Math.round(me.hun)}</span><span class="chip ${me.slp < 35 ? 'warn' : ''}">😴 ${Math.round(me.slp)}</span><span class="chip">❤️ ${Math.round(me.sym)} · 😂 ${Math.round(me.ent)}</span>${rankChip()}${(me.lux || []).length ? `<span class="chip">🎒 ${(me.lux || []).map(id => { const l = D.LUX.find(x => x.id === id); return UL.Show.hasLux(id) ? l.icon + (S.luxUses && S.luxUses[id] != null ? '×' + S.luxUses[id] : '') : '🚫'; }).join(' ')}</span>` : ''}${day.carry ? `<span class="chip">${day.carry === 'holz' ? '🪵 Holz' : '🪣 Wasser'}</span>` : ''}`);
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
      // eigenes Interview-Set: zwei Fragen aus dem Off, Zuschauer reagieren sofort
      UL.Tags.clear();
      const r = await UL.Phone.interview({ theme: S.theme, me, others: Show.alive().filter(c => c.id !== 'me') });
      figs.forEach(o => UL.Tags.set('n:' + o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, o.f.height + 0.35, 0)), esc(UL.Show.first(o.c)) + (o.c.id === 'me' ? ' ⭐' : relIcon(o.c)), 'tag' + (o.c.id === 'me' ? ' me' : '')));
      crewTag(docO, '🩺 ' + D.DOC.name); crewTag(rangerO, '🪖 ' + D.RANGER.name);
      if (!r.said.length) return;
      spend();
      Show.log(`Buschtelefon: „${r.said[0]}“`, '📞');
      (S.phoneSaid = S.phoneSaid || []).push({ d: S.day, txt: r.said[r.said.length - 1] });
      fx(r.sum, 'Das sehen die Zuschauer heute Abend.');
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
    // Besuch im Sani-Zelt: Check-up hebt die Stimmung, Doc gibt Tipps
    async function docVisit() {
      spend(); UL.faceTo(docO.f, meO.x, meO.z); UL.faceTo(meO.f, docO.x, docO.z); docO.f.play('interact');
      st.cam.yaw = Math.atan2(meO.x - docO.x, meO.z - docO.z) + Math.PI * 0.35;
      await UI.say('doc', UL.pick(D.DOC_LINES.check));
      me.mood = Math.min(1, (me.mood || 0.5) + 0.25); day.docSeen = true;
      await UI.say('doc', UL.pick(D.DOC_LINES.tips));
      Show.log(`${me.name} lässt sich von ${D.DOC.name} durchchecken.`, '🩺');
      fx({ sym: 1 }, 'Gesundheits-Check');
    }
    // Ranger ansprechen: kostet nichts, verrät Tipps – und manchmal, wo die Schatzkiste steht
    async function rangerTalk() {
      rangerO.busy = true; rangerO.f.move(0); UL.faceTo(rangerO.f, meO.x, meO.z); UL.faceTo(meO.f, rangerO.x, rangerO.z); rangerO.f.play('interact');
      if (chest && !day.chestOpen && !day.chestHint) {
        day.chestHint = true; await UI.say('ranger', UL.pick(D.RANGER_LINES.chest));
        const p = chest.userData.p; UL.Tags.set('n:chest', v => v.set(p.x, st.h(p.x, p.z) + 1.4, p.z), '🧰 Schatzkiste', 'tag crew');
      } else await UI.say('ranger', UL.pick(day.rangerTalked ? D.RANGER_LINES.tips : D.RANGER_LINES.hello.concat(D.RANGER_LINES.tips)));
      day.rangerTalked = true; rangerO.busy = false; rangerO.wait = 2;
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
    // ---------- Gespräche, Lästereien und Zoff unter den Mit-Campern ----------
    const scene = { t: UL.rand(8, 14), cur: null };
    st.talks = scene; st.meO = meO;   // für Tests
    const fmtS = (txt, a, b) => txt.replace(/\{a\}/g, Show.first(a.c)).replace(/\{b\}/g, Show.first(b.c)).replace(/\{m\}/g, Show.first(me));
    function sceneEnd(cur) {
      for (const o of [cur.a, cur.b]) { o.state = 'idle'; o.t = UL.rand(1, 3); o.f.set('idle'); }
      scene.cur = null; scene.t = UL.rand(18, 30);
    }
    function sceneTick(dt) {
      const cur = scene.cur;
      if (cur) {
        if (!cur.go) {   // b läuft noch zu a
          cur.wait -= dt;
          if (cur.b.state === 'do' || cur.wait <= 0) { cur.go = true; cur.b.state = 'busy'; UL.faceTo(cur.a.f, cur.b.x, cur.b.z); UL.faceTo(cur.b.f, cur.a.x, cur.a.z); if (cur.kind === 'fight') { UL.Audio.sfx('tense'); UI.toast(`💥 Zoff zwischen ${Show.first(cur.a.c)} und ${Show.first(cur.b.c)}!`, '🎭', 2600); } }
          return;
        }
        cur.next -= dt;
        if (cur.next > 0) return;
        if (cur.i < cur.lines.length) {
          const who = cur.i % 2 ? cur.b : cur.a, oth = who === cur.a ? cur.b : cur.a;
          bubble(who, fmtS(cur.lines[cur.i], cur.a, cur.b), 2.8);
          who.f.play(cur.kind === 'fight' ? (cur.i === 2 ? 'hit' : 'block') : 'interact');
          if (cur.kind === 'fight') { UL.Audio.sfx(cur.i === 2 ? 'gasp' : 'bad'); npcs.forEach(o => { if (o !== cur.a && o !== cur.b && o.state !== 'busy' && Math.random() < 0.15) bubble(o, UL.pick(['Uiuiui!', 'Popcorn!', 'Nicht schon wieder …']), 2); }); }
          cur.i++; cur.next = 2.9;
          return;
        }
        // ohne Einmischung: Folgen für die beiden
        if (cur.kind === 'fight') { Show.rel(cur.a.c, cur.b.c, -8); Show.change(cur.a.c, { ent: 3 }); Show.change(cur.b.c, { ent: 2 }); Show.log(`Zoff zwischen ${Show.first(cur.a.c)} und ${Show.first(cur.b.c)}.`, '💥'); }
        else if (cur.kind === 'gossip') { Show.rel(cur.a.c, me, -3); Show.log(`${Show.first(cur.a.c)} lästert bei ${Show.first(cur.b.c)} über ${Show.first(me)}.`, '🐍'); }
        else Show.rel(cur.a.c, cur.b.c, 4);
        sceneEnd(cur); return;
      }
      scene.t -= dt;
      if (scene.t > 0 || npcs.length < 2) return;
      scene.t = 6;
      const free = npcs.filter(o => o.state !== 'busy' && o.state !== 'walk');
      if (free.length < 2) return;
      const [a, b] = UL.rng.shuffle(free), rab = a.c.rel[b.c.id] ?? 50, ram = a.c.rel.me ?? 50;
      const kind = Math.random() < 0.25 + (rab < 45 ? 0.3 : 0) + a.c.t.drama * 0.2 ? 'fight' : ram < 45 && Math.random() < 0.6 ? 'gossip' : 'chat';
      a.state = 'busy'; a.f.set('idle');
      const ang = Math.random() * 6.28, p = { x: a.x + Math.cos(ang) * 1.3, z: a.z + Math.sin(ang) * 1.3 }; st.push(p);
      b.tx = p.x; b.tz = p.z; b.act = 'idle'; b.state = 'walk';
      scene.cur = { a, b, kind, lines: UL.pick(D.SCENES[kind]), i: 0, next: 0.3, go: false, wait: 6 };
    }
    // Einmischen: schlichten oder mitmischen / zur Rede stellen
    async function meddle(how) {
      const cur = scene.cur; if (!cur) return;
      const { a, b } = cur; spend();
      UL.faceTo(meO.f, (a.x + b.x) / 2, (a.z + b.z) / 2);
      if (how === 'calm') {
        bubble(meO, UL.pick(['Hey, hey! Atmet mal durch!', 'Leute, wir sitzen alle im selben Boot.', 'Schluss jetzt – vertragt euch!']), 2.8); meO.f.play('interact');
        await UL.sleep(UL.bot ? 0.05 : 1.6);
        bubble(a, 'Na gut …', 2); bubble(b, 'Okay, sorry.', 2);
        Show.rel(me, a.c, 5); Show.rel(me, b.c, 5); Show.rel(a.c, b.c, 6);
        Show.log(`${me.name} schlichtet den Streit zwischen ${Show.first(a.c)} und ${Show.first(b.c)}.`, '🕊️');
        fx({ sym: 5, ent: 1 }, 'Streit geschlichtet');
      } else if (how === 'stir') {
        const side = Math.random() < 0.5 ? a : b, other = side === a ? b : a;
        bubble(meO, `${Show.first(side.c)} hat völlig recht!`, 2.8); meO.f.play('block'); UL.Audio.sfx('gasp');
        await UL.sleep(UL.bot ? 0.05 : 1.6);
        bubble(other, UL.pick(['Ach, jetzt du auch noch?!', 'Klar, verbündet euch nur!']), 2.4); other.f.play('hit');
        Show.rel(me, side.c, 6); Show.rel(me, other.c, -10); Show.rel(a.c, b.c, -6);
        Show.log(`${me.name} mischt beim Zoff mit – auf der Seite von ${Show.first(side.c)}.`, '🔥');
        fx({ sym: -2, ent: 7 }, 'Öl ins Feuer!');
      } else {
        bubble(meO, UL.pick(['Ich hab alles gehört!', 'Sagt es mir doch ins Gesicht!']), 2.8); meO.f.play('block');
        await UL.sleep(UL.bot ? 0.05 : 1.6);
        bubble(a, UL.pick(['Äh … war nicht so gemeint!', 'Na und? Stimmt doch!']), 2.4);
        Show.rel(me, a.c, -4);
        Show.log(`${me.name} stellt ${Show.first(a.c)} zur Rede.`, '🗯️');
        fx({ sym: 2, ent: 5 }, 'Konfrontation vor laufender Kamera');
      }
      sceneEnd(cur);
    }
    // Extra-Aktionen fürs Zuschauer-Voting
    async function showAct(id, o) {
      spend();
      if (id === 'sing') {
        meO.f.set('idle'); meO.f.play('cheer'); bubble(meO, UL.pick(['♪ Oh du schöner Urwald … ♪', '♪ Bohnen zum Frühstück, Bohnen zur Nacht … ♪', '♪ Ich will nach Haus, doch ich halt durch … ♪']), 3.2); UL.Audio.sfx('fanfare');
        await UL.sleep(UL.bot ? 0.05 : 1.8);
        const good = UL.Show.hasLux('harmonika') || Math.random() < 0.55 + me.ent / 400;
        npcs.forEach(n => { if (n.state !== 'busy' && Math.random() < 0.5) { bubble(n, good ? UL.pick(['Zugabe!', 'Wie schön!', 'Hahaha, Gänsehaut!']) : UL.pick(['Bitte aufhören …', 'Meine Ohren!', 'Die Mücken fliehen!']), 2.2); if (good) n.f.play('cheer'); } });
        Show.log(`${me.name} singt am Lagerfeuer${good ? ' – alle klatschen' : ' – schief'}.`, '🎤');
        fx(good ? { sym: 3, ent: 5 } : { sym: -1, ent: 6 }, good ? 'Gänsehaut-Moment!' : 'Schief, aber unterhaltsam');
      } else if (id === 'massage') {
        UL.faceTo(meO.f, o.x, o.z); o.state = 'busy'; meO.f.play('use');
        bubble(meO, 'Komm, ich massier dir mal den Rücken.', 2.6);
        await UL.sleep(UL.bot ? 0.05 : 1.6);
        bubble(o, UL.pick(['Ohhh, das tut gut!', 'Du hast goldene Hände!', 'Aua – ah, doch gut!']), 2.4);
        Show.rel(me, o.c, 9); o.c.mood = Math.min(1, o.c.mood + 0.2); o.state = 'idle'; o.t = 2;
        Show.log(`${me.name} massiert ${Show.first(o.c)}.`, '💆');
        fx({ sym: 3, ent: 1 }, 'Wellness im Urwald');
      } else if (id === 'snack') {
        meO.f.play('pickup'); UL.Audio.sfx('crunch');
        const seen = npcs.find(n => n.state !== 'busy' && Math.hypot(n.x - meO.x, n.z - meO.z) < 7 && Math.random() < 0.45);
        await UL.sleep(UL.bot ? 0.05 : 1.2);
        if (seen) { bubble(seen, UL.pick(['Hey! Was isst du da?!', 'Ich hab’s genau gesehen!', 'Teilen ist wohl nicht dein Ding?!']), 2.6); seen.f.play('block'); Show.alive().forEach(c => Show.rel(me, c, -2)); Show.rel(me, seen.c, -6); Show.log(`${Show.first(seen.c)} erwischt ${me.name} beim heimlichen Naschen!`, '🍫'); fx({ sym: -6, ent: 6 }, 'Erwischt!'); }
        else { me.mood = Math.min(1, me.mood + 0.2); Show.log(`${me.name} nascht heimlich – die Zuschauer sehen alles.`, '🍫'); fx({ sym: -2, ent: 4 }, 'Niemand hat’s gesehen … außer ganz Deutschland'); }
      } else if (id === 'pose') {
        meO.f.play('cheer'); bubble(meO, UL.pick(['Hallo Mama! Hallo Fans!', 'Das ist meine gute Seite!', 'Wählt mich, ihr Lieben!']), 2.6); UL.Audio.sfx('laugh');
        Show.log(`${me.name} posiert für die Kamera.`, '📸');
        fx({ sym: -1, ent: 4 }, 'Kamera-Liebling … oder Selbstdarsteller?');
      }
    }

    // Kamera: folgt weich, dreht beim Laufen von selbst hinter die Figur, schaut etwas voraus,
    // weicht Hütten/Felsen aus und taucht nie in den Boden
    const camLook = new T.Vector3(), camWant = new T.Vector3();
    let lookIdle = 9, camInit = false;
    function camTick(dt) {
      if (st.camLock) { st.cine.update(dt); return; }
      const c = st.cam;
      const manual = Math.abs(In.look.x) + Math.abs(In.look.y) > 0.0005;
      lookIdle = manual ? 0 : lookIdle + dt;
      c.yaw -= In.look.x; c.pitch = UL.clamp(c.pitch + In.look.y, 0.12, 1.1); c.dist = UL.clamp(c.dist - In.zoom * 1.2, 3.5, 11);
      const p = meO.f.root.position, port = UL.portrait(), moving = meO.f.base === 'walk' || meO.f.base === 'run';
      if (moving && lookIdle > 1.2 && !day.busy) c.yaw = UL.angDamp(c.yaw, meO.f.root.rotation.y + Math.PI, In.run ? 1.6 : 0.9, dt);
      let d = c.dist * (port ? 1.3 : 1) * (In.run && moving ? 1.12 : 1);
      // Hindernisse zwischen Figur und Kamera: näher heranrücken
      const sx = Math.sin(c.yaw) * Math.cos(c.pitch), sz = Math.cos(c.yaw) * Math.cos(c.pitch);
      for (let k = 0.15; k <= 1.001; k += 0.12) {
        const x = p.x + sx * d * k, z = p.z + sz * d * k;
        if (st.solid.some(o => o.r > 0.8 && !o.low && Math.hypot(x - o.x, z - o.z) < o.r * 0.9) && k * d > 2.2) { d = Math.max(2.4, k * d - 0.4); break; }
      }
      camWant.set(p.x + sx * d, p.y + 1.2 + Math.sin(c.pitch) * d, p.z + sz * d);
      camWant.y = Math.max(camWant.y, st.h(camWant.x, camWant.z) + 0.6);
      const ahead = moving ? (In.run ? 1.1 : 0.6) : 0, ry = meO.f.root.rotation.y;
      const lt = new T.Vector3(p.x + Math.sin(ry) * ahead, p.y + 1.1, p.z + Math.cos(ry) * ahead);
      if (!camInit) { camInit = true; st.camera.position.copy(camWant); camLook.copy(lt); }
      st.camera.position.lerp(camWant, 1 - Math.exp(-7 * dt)); camLook.lerp(lt, 1 - Math.exp(-6 * dt)); st.camera.lookAt(camLook);
    }

    st.update = (dt) => {
      st.tick(dt);
      if (day.done) return;
      camTick(dt);
      // NPCs
      for (const o of npcs) npcTick(st, o, dt, npcs);
      rangerTick(dt);
      chatT -= dt;
      if (chatT <= 0) { chatT = UL.rand(4, 8); const o = UL.pick(npcs); if (o && o.state !== 'busy') bubble(o, Math.random() < 0.3 ? o.c.quote : UL.pick(CHATTER), 3.4); }
      sceneTick(dt);
      if (day.busy) return;
      // Spieler laufen
      let mx = In.move.x, my = In.move.y;
      if (UL.bot) { mx = my = 0; }
      const mag = Math.min(1, Math.hypot(mx, my)), sp = (In.run ? 5.2 : 2.6) * (mag < 0.15 ? 0 : 0.35 + 0.65 * mag);
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
        const sc = scene.cur;
        if (sc && sc.go && sc.kind !== 'chat' && Math.hypot((sc.a.x + sc.b.x) / 2 - meO.x, (sc.a.z + sc.b.z) / 2 - meO.z) < 4.5) {
          if (sc.kind === 'fight') { cmds.push({ id: 'calm', label: 'Streit schlichten', icon: '🕊️', hot: true }); cmds.push({ id: 'stir', label: 'Mitmischen', icon: '🔥', hot: true }); }
          else cmds.push({ id: 'confront', label: 'Zur Rede stellen', icon: '🗯️', hot: true });
        }
        if (npcNear && npcNear.state !== 'busy') { cmds.push({ id: 'talk', label: 'Reden mit ' + UL.Show.first(npcNear.c), icon: '💬', hot: true, o: npcNear }); cmds.push({ id: 'massage', label: 'Massage', icon: '💆', o: npcNear }); }
        if (near({ x: 0, z: 0 }, 3.4)) cmds.push({ id: 'sing', label: 'Lied singen', icon: '🎤' });
        if (near(P.beds, 3.4)) cmds.push({ id: 'snack', label: 'Heimlich naschen', icon: '🍫' });
        if (!npcNear && !near({ x: 0, z: 0 }, 3.4)) cmds.push({ id: 'pose', label: 'Für die Kamera posen', icon: '📸' });
        if (!day.carry && near(P.wood, 2.4)) cmds.push({ id: 'holz', label: 'Holz sammeln', icon: '🪵', hot: true });
        if (!day.carry && near(P.water, 4.4)) cmds.push({ id: 'wasser', label: 'Wasser holen', icon: '🪣', hot: true });
        if (day.carry === 'holz' && near({ x: 0, z: 0 }, 2.6)) cmds.push({ id: 'feuer', label: 'Feuer schüren', icon: '🔥', hot: true });
        if (day.carry === 'wasser' && near({ x: 0, z: 0 }, 2.6)) cmds.push({ id: 'kochen', label: 'Wasser abkochen', icon: '♨️', hot: true });
        if (near(P.loo, 2.2)) cmds.push({ id: 'klo', label: 'Klo putzen', icon: '🧽', hot: true });
        if (near(P.phone, 2.6)) cmds.push({ id: 'phone', label: D.SHOW.phone, icon: '📞', hot: true });
        if (!day.docSeen && near(P.doc, 2.6)) cmds.push({ id: 'doc', label: 'Check-up bei ' + D.DOC.name, icon: '🩺', hot: true });
        if (chest && !day.chestOpen && near(chest.userData.p, 1.8)) cmds.push({ id: 'chest', label: 'Schatzkiste öffnen', icon: '🧰', hot: true });
      }
      if (!rangerO.busy && Math.hypot(rangerO.x - meO.x, rangerO.z - meO.z) < 2.4) cmds.unshift({ id: 'ranger', label: D.RANGER.name + ' ansprechen', icon: '🪖', hot: !day.rangerTalked });
      if (!npcNear && near({ x: 0, z: 0 }, 3.2) && meO.f.base !== 'sit') cmds.push({ id: 'sit', label: 'Ans Feuer setzen', icon: '🪵' });
      // Luxusartikel (kosten keine Aktion)
      if (UL.Show.hasLux('schoko') && S.luxUses && S.luxUses.schoko > 0) cmds.push({ id: 'lux_schoko', label: `Schokolade naschen (${S.luxUses.schoko})`, icon: '🍫' });
      if (UL.Show.hasLux('foto') && !day.foto) cmds.push({ id: 'lux_foto', label: 'Familienfoto anschauen', icon: '🖼️' });
      if (UL.Show.hasLux('karten') && !day.karten && npcNear && npcNear.state !== 'busy') cmds.push({ id: 'lux_karten', label: 'Karten spielen mit ' + UL.Show.first(npcNear.c), icon: '🃏', o: npcNear });
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
      else if (c.id === 'doc') busy(docVisit);
      else if (c.id === 'ranger') busy(rangerTalk);
      else if (c.id === 'calm' || c.id === 'stir' || c.id === 'confront') busy(() => meddle(c.id === 'confront' ? 'confront' : c.id));
      else if (c.id === 'sing' || c.id === 'massage' || c.id === 'snack' || c.id === 'pose') busy(() => showAct(c.id, c.o));
      else if (c.id === 'chest') busy(treasure);
      else if (c.id === 'sit') { let best = 0, bd = 1e9; st.seats.forEach((s, i) => { const d = Math.hypot(s.x - meO.x, s.z - meO.z); if (d < bd) { bd = d; best = i; } }); const s = st.seats[best]; meO.x = s.x; meO.z = s.z; meO.f.root.rotation.y = Math.atan2(-s.x, -s.z); meO.f.set('sit'); }
      else if (c.id === 'lux_schoko') { S.luxUses.schoko--; me.hun = Math.min(100, me.hun + 20); meO.f.play('pickup'); UL.Audio.sfx('crunch'); UI.toast('Mmmh, Schokolade! 🍗 +20', '🍫', 2200); hud(); }
      else if (c.id === 'lux_foto') { day.foto = true; me.mood = Math.min(1, (me.mood || 0.5) + 0.3); meO.f.play('interact'); bubble(meO, UL.pick(['Ich vermiss euch so …', 'Bald bin ich wieder da!', 'Für euch halte ich durch!']), 2.6); fx({ sym: 2, ent: 1 }, 'Heimweh-Moment'); }
      else if (c.id === 'lux_karten') { day.karten = true; const o = c.o; UL.faceTo(meO.f, o.x, o.z); meO.f.play('interact'); Show.rel(me, o.c, 6); bubble(o, UL.pick(['Ha, gewonnen!', 'Noch eine Runde!', 'Du schummelst doch!']), 2.4); Show.log(`${me.name} spielt Karten mit ${Show.first(o.c)}.`, '🃏'); fx({ sym: 1, ent: 1 }, 'Kartenrunde im Lager'); }
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
    const Show = UL.Show, S = Show.S, me = Show.me(), V = T.Vector3, wait = s => UL.sleep(UL.bot ? 0.05 : s);
    await UI.fade(true, 0.3);
    UI.cmd([]); UI.hud(''); UI.hint({});
    const st = new CampStage(theme, 'evening');
    const figs = cast(st, Show.alive());
    figs.forEach((o, i) => seat(st, o, i));
    R.set(st);
    UL.Audio.music('night'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'night');
    const fx = R.particles(st.scene, { n: 140, colors: [0xffffff, 0xe6edf2], size: 0.07, gravity: 1.4, life: 1.8 });
    st.updaters.push(dt => fx.update(dt));
    // Kamera (weich nachgeführt) und Laufwege
    const cam = { p: new V(0, 3.2, 7.5), l: new V(0, 0.8, 0) }, walkers = [];
    let follow = null, orbit = false, ang = 0.4, steamT = 0, steam = false;
    const walk = (o, x, z, sp = 1.6) => new Promise(res => { if (UL.bot) { place(st, o, x, z); return res(); } o.f.set('idle'); walkers.push({ o, x, z, sp, res }); });
    st.update = (dt) => {
      st.tick(dt);
      walkers.slice().forEach(w => {
        const o = w.o, dx = w.x - o.x, dz = w.z - o.z, d = Math.hypot(dx, dz);
        if (d < 0.12) { o.f.move(0); walkers.splice(walkers.indexOf(w), 1); w.res(); return; }
        const k = Math.min(d, w.sp * dt); o.x += dx / d * k; o.z += dz / d * k;
        o.f.root.position.set(o.x, st.h(o.x, o.z), o.z); o.f.root.rotation.y = UL.angDamp(o.f.root.rotation.y, Math.atan2(dx, dz), 10, dt); o.f.move(w.sp);
      });
      if (follow) { const p = follow.f.root.position; cam.p.set(p.x + 2.6, p.y + 2.3, p.z + 3.6); cam.l.set(p.x, p.y + 1, p.z); }
      else if (orbit) { ang += dt * 0.08; cam.p.set(Math.cos(ang) * 7.5, 4.2, Math.sin(ang) * 7.5); cam.l.set(0, 0.6, 0); }
      if (steam && (steamT -= dt) <= 0) { steamT = 0.12; const pp = st.pot.position; fx.burst(pp.x, pp.y + 0.2, pp.z, 2, 0.25, 0.9); }
      st.camera.position.lerp(cam.p, 1 - Math.exp(-3 * dt)); st.camera.lookAt(cam.l);
    };
    st.camera.position.set(3, 2.6, -6); st.camera.lookAt(0, 1, -11);
    await UI.fade(false, 0.5);
    await UI.banner('🍲 Abendessen', `${stars} von ${max} Portionen`, 1800);
    // 1) Die Lieferung: ein Helfer bringt die Kiste mit den erspielten Portionen
    const staff = { c: { id: 'staff' }, f: UL.makeFig(D.RANGER.look, 1.85), x: 0, z: -11.5 };
    st.scene.add(staff.f.root); st.figs.push(staff.f); place(st, staff, 0, -11.5, 0);
    const box = A.has('crate') ? A.sized('crate', 0.45) : new T.Mesh(new T.BoxGeometry(0.6, 0.4, 0.45), R.mat(0x8a6a3a));
    box.position.set(0, 0.95, 0.42); staff.f.root.add(box);
    UL.Tags.set('n:staff', v => v.copy(staff.f.root.position).add(new V(0, 2.1, 0)), '🪖 ' + D.RANGER.name + ' · 📦 Lieferung', 'tag crew');
    follow = staff; UL.Audio.sfx('drum');
    UI.toast(stars ? `Die Lieferung kommt: ${stars} Portion${stars === 1 ? '' : 'en'}!` : 'Die Lieferung kommt … nur ein Sack.', '📦', 2600);
    figs.forEach(o => { if (o.c.id !== 'me' && Math.random() < 0.5) { o.f.set('idle'); o.f.root.position.y = st.h(o.x, o.z); } });
    await walk(staff, 0, -3.7, 1.7);
    follow = null; cam.p.set(1.8, 2.0, -0.6); cam.l.set(0, 0.6, -3.4);
    staff.f.play('pickup');
    st.scene.attach(box); box.position.set(0, st.h(0, -3.2) + 0.22, -3.2); box.rotation.set(0, 0.2, 0);
    UL.Audio.sfx('pick');
    await wait(0.5);
    const kinds = ['fish', 'banana', 'apple', 'carrot', 'pumpkin', 'watermelon'].filter(A.has);
    const items = [];
    const bp = box.position;
    if (stars > 0) {
      for (let i = 0; i < stars; i++) {
        const k = kinds.length ? kinds[i % kinds.length] : null;
        const it = k ? A.sized(k, 0.26) : new T.Mesh(new T.SphereGeometry(0.12, 10, 8), R.mat(0xff8a3a));
        const n = Math.min(stars, 6), row = Math.floor(i / 6), col = i % 6;
        it.position.set(bp.x + (col - (Math.min(n, stars - row * 6) - 1) / 2) * 0.34, bp.y + 0.45 + row * 0.32, bp.z + 0.05);
        st.scene.add(it); items.push(it);
        UL.Audio.sfx('star'); fx.burst(it.position.x, it.position.y, it.position.z, 8, 1.2, 1.4, [0xffd23a, 0xffffff]);
        await wait(stars > 6 ? 0.18 : 0.3);
      }
      figs.forEach(o => { if (o.c.id !== 'me' && Math.random() < 0.6) o.f.play('cheer'); });
      UL.Audio.sfx(stars / max >= 0.6 ? 'cheer' : 'ooh');
    } else {
      const sack = new T.Mesh(new T.CylinderGeometry(0.22, 0.28, 0.5, 10), R.mat(0xc8a878)); sack.position.set(bp.x, bp.y + 0.45, bp.z); st.scene.add(sack); items.push(sack);
      const lab = R.sign(['REIS & BOHNEN'], 0.9, 0.22, { bg: '#5a3a1e', w: 300, h: 70, font: '900 34px system-ui' }); lab.position.set(bp.x, bp.y + 0.95, bp.z + 0.1); st.scene.add(lab); items.push(lab);
      UL.Audio.sfx('boo');
    }
    await UI.say('camp', (by ? `${by} hat heute ${stars} Stern${stars === 1 ? '' : 'e'} geholt. ` : '') + text, { name: 'Am Lagerfeuer' });
    walk(staff, 0, -12.5, 2).then(() => { staff.f.root.visible = false; UL.Tags.del('n:staff'); });
    // 2) Wer kocht?
    const npcO = figs.filter(o => o.c.id !== 'me'), meO = figs.find(o => o.c.id === 'me');
    const bud = npcO.find(o => o.c.id === S.buddy) || npcO.slice().sort((a, b) => b.c.t.fleiss - a.c.t.fleiss)[0];
    let cook = meO, zoff = false;
    if (bud) {
      const v = UL.bot ? 1 : await UI.choose('Wer kocht heute?', 'Der Topf hängt schon über dem Feuer …', [
        { label: 'Ich koche!', icon: '🧑‍🍳', sub: 'Die Zuschauer mögen Camper, die anpacken.', value: 1 },
        { label: `${Show.first(bud.c)} kochen lassen`, icon: '🤝', sub: 'Gemütlich zusehen – gut für eure Freundschaft.', value: 2 },
        { label: `${Show.first(bud.c)} kocht – du redest rein`, icon: '🗯️', sub: 'Besserwisser-Zoff am Topf. Unterhaltsam, aber unbeliebt.', value: 3 }]);
      if (v !== 1) cook = bud;
      if (v === 1) { Show.change(me, { sym: 3, ent: 1 }); Show.log(`${me.name} kocht heute für alle.`, '🧑‍🍳'); }
      else if (v === 2) { Show.rel(me, bud.c, 4); Show.change(bud.c, { sym: 2 }); }
      else { zoff = true; Show.change(me, { ent: 5, sym: -3 }); Show.rel(me, bud.c, -7); Show.log(`${me.name} und ${Show.first(bud.c)} streiten ums Kochen.`, '💥'); }
    }
    // Kamera innerhalb des Sitzkreises, Blick über den Topf auf den Koch
    const pp = st.pot.position, cx = pp.x + 1.25, cz = pp.z + 0.35;
    cam.p.set(-0.5, 2.1, 1.9); cam.l.set(pp.x + 0.6, 0.75, pp.z + 0.1);
    await walk(cook, cx, cz, 1.6);
    cook.f.root.rotation.y = Math.atan2(pp.x - cx, pp.z - cz); cook.f.set('use');
    if (zoff) {
      await walk(meO, cx + 0.35, cz + 0.95, 1.8); UL.faceTo(meO.f, cx, cz);
      const at = o => v => v.copy(o.f.root.position).add(new V(0, 2.2, 0));
      bubble2(meO, at, UL.pick(['Mehr Salz! Nicht so viel Wasser!', 'Das brennt doch an!', 'Lass mich mal ran!']));
      await wait(1.6); UL.Audio.sfx('bad'); cook.f.play('block');
      bubble2(cook, at, UL.pick(['Dann koch doch selbst!', 'Finger weg von meinem Topf!', 'Du kannst nicht mal Wasser kochen!']));
      await wait(1.6); cook.f.set('use');
    }
    // 3) Kochen: selbst gekocht → drei Zutaten im richtigen Moment in den Topf (Hitze-Leiste)
    S.cookQ = -1;
    if (cook === meO) { cam.p.set(pp.x + 1.6, 1.7, pp.z + 1.9); cam.l.set(pp.x, 0.7, pp.z); S.cookQ = await cookGame(st); }
    steam = true; UL.Audio.sfx('splash');
    for (const it of items) {
      if (UL.bot) { it.visible = false; continue; }
      const from = it.position.clone(), to = new V(pp.x, pp.y + 0.25, pp.z);
      await new Promise(res => { let t = 0; st.updaters.push(function f(dt) { t += dt / 0.45; const k = Math.min(1, t); it.position.lerpVectors(from, to, k); it.position.y += Math.sin(k * Math.PI) * 0.8; if (k >= 1) { it.visible = false; st.updaters.splice(st.updaters.indexOf(f), 1); res(); } return; }); });
      UL.Audio.sfx('gulp');
    }
    UI.toast(`${cook === meO ? 'Du kochst' : Show.first(cook.c) + ' kocht'} … es duftet ${stars ? 'richtig gut' : 'nach Reis'}.`, '🍳', 2400);
    await wait(2.4);
    steam = false; cook.f.set('idle');
    // 4) Essen am Feuer
    seat(st, cook, figs.indexOf(cook)); if (zoff) seat(st, meO, figs.indexOf(meO));
    orbit = true;
    const q = stars / Math.max(1, max);
    figs.forEach(o => { if (o.c.id === 'me') return; if (q >= 0.6 && Math.random() < 0.6) { o.f.play('cheer'); UL.Tags.bubble(o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Endlich was Richtiges!', 'Hmmm, Fisch!', 'Danke, danke, danke!', cook !== meO ? 'Lecker gekocht!' : 'Du kannst ja kochen!']), 2.6); } else if (q < 0.3 && Math.random() < 0.5) UL.Tags.bubble(o.c.id, v => v.copy(o.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Schon wieder Bohnen …', 'Mein Magen knurrt.', 'Ich ess einfach Luft.']), 2.6); });
    UL.Audio.sfx(q >= 0.6 ? 'cheer' : 'eat');
    if (stars > 0) {
      const i = UL.bot ? 1 : await UI.choose('Wie isst du heute?', 'Alle schauen auf den Topf …', [
        { label: 'Gerecht teilen', icon: '🤝', sub: 'Jeder bekommt gleich viel.', value: 1 },
        { label: 'Die größte Portion nehmen', icon: '😋', sub: 'Hunger ist Hunger. Die Zuschauer sehen alles.', value: 2 },
        { label: 'Verzichten – die anderen brauchen es mehr', icon: '💚', sub: 'Du gehst hungrig ins Bett.', value: 3 }]);
      S.mealPick = i;
      if (i === 1) Show.change(me, { sym: 2 });
      else if (i === 2) { Show.change(me, { sym: -4, ent: 4 }); Show.alive().forEach(c => Show.rel(me, c, -3)); Show.log(`${me.name} schnappt sich die größte Portion.`, '😋'); }
      else if (i === 3) { Show.change(me, { sym: 5 }); me.mood = Math.max(0, me.mood - 0.2); Show.alive().forEach(c => Show.rel(me, c, 3)); Show.log(`${me.name} verzichtet aufs Essen.`, '💚'); }
    }
    // 5) Lagerfeuer-Gespräch: ein Camper fragt in die Runde, deine Antwort zählt
    if (npcO.length >= 2) await fireTalk(npcO, meO, cam, () => { orbit = false; }, () => { orbit = true; });
    await UI.say(UL.pick(['lotte', 'mats']), UL.pick(D.MOD.evening)[1]);
    UL.Tags.clear();
    await UI.fade(true, 0.4);
    resolve();
  });

  // Kochen am Feuer: Zeiger pendelt über die Hitze-Leiste, im grünen Bereich die Zutat in den Topf geben
  function cookGame(st) {
    if (UL.bot) return Promise.resolve(2);
    const NAMES = [['🧅', 'Zwiebeln'], ['🐟', 'Fisch'], ['🌿', 'Dschungel-Kräuter']];
    const ui = document.createElement('div'); ui.className = 'tui cookgame'; document.getElementById('ui').appendChild(ui);
    let round = 0, x = 0, dir = 1, good = 0, wait = 0, tapped = false, res;
    const zone = () => [0.5 - (0.13 - round * 0.025), 0.5 + (0.13 - round * 0.025)];
    const draw = (msg) => { const [a, b] = zone(); ui.innerHTML = `<div class="lbl">🍳 ${NAMES[round] ? NAMES[round][0] + ' ' + NAMES[round][1] + ' in den Topf – im grünen Bereich ' + In.glyph('ok') + ' drücken!' : ''}</div>
      <div style="position:relative;width:min(78vw,420px);height:26px;margin:8px auto;border-radius:13px;background:linear-gradient(90deg,#3a7ae0,#ffd23a 40%,#ff5a2a 80%,#7a1a10);box-shadow:0 2px 8px #0008">
      <i style="position:absolute;left:${a * 100}%;width:${(b - a) * 100}%;top:0;bottom:0;background:#5ad05acc;border:2px solid #fff;border-radius:8px"></i>
      <b style="position:absolute;left:calc(${x * 100}% - 4px);top:-6px;width:8px;height:38px;background:#fff;border-radius:4px;box-shadow:0 0 6px #000"></b></div>
      <div class="lbl">${msg || '⭐'.repeat(good) + '☆'.repeat(Math.max(0, round - good))}</div>`; };
    const tap = () => { tapped = true; }; addEventListener('pointerdown', tap);   // Handy: Tippen irgendwo
    const f = (dt) => {
      if (wait > 0) { wait -= dt; if (wait <= 0) { round++; if (round >= 3) { st.updaters.splice(st.updaters.indexOf(f), 1); removeEventListener('pointerdown', tap); ui.remove(); res(good); return; } } return; }
      x += dir * dt * (0.75 + round * 0.3); if (x > 1) { x = 1; dir = -1; } if (x < 0) { x = 0; dir = 1; }
      if (In.pressed('ok') || tapped) {
        tapped = false; const [a, b] = zone(), hit = x >= a && x <= b, near = x >= a - 0.12 && x <= b + 0.12;
        if (hit) { good++; UL.Audio.sfx('star'); } else UL.Audio.sfx(near ? 'gulp' : 'bad');
        draw(hit ? 'Perfekt! 👌' : near ? 'Geht so …' : x > b ? 'Angebrannt! 🔥' : 'Noch zu kalt … 🥶'); wait = 0.9; return;
      }
      draw();
    };
    return new Promise(r => { res = r; draw(); st.updaters.push(f); });
  }

  // Lagerfeuer-Gespräch mit Entscheidung
  async function fireTalk(npcO, meO, cam, stop, go) {
    const Show = UL.Show, me = meO.c, S = Show.S;
    const ask = UL.pick(npcO), others = npcO.filter(o => o !== ask), x = UL.pick(others);
    const t = UL.pick(D.FIRETALK.filter(t => !(S.talked || []).includes(t.q))) || UL.pick(D.FIRETALK);
    S.talked = (S.talked || []).concat([t.q]).slice(-6);
    const nm = Show.first(x.c), fill = s => s.replace(/\{x\}/g, nm);
    stop(); const p = ask.f.root.position; cam.p.set(p.x * 0.4, 1.9, p.z * 0.4 + 0.1); cam.l.set(p.x, p.y + 0.9, p.z);
    ask.f.play('interact');
    await UI.say('camp', t.q, { name: '🔥 ' + Show.first(ask.c) });
    const opts = t.a.map((a, i) => ({ label: fill(a[0]), value: i, icon: ['💬', '😄', '🙃'][i] }));
    const i = UL.bot ? 0 : await UI.choose('🔥 Am Lagerfeuer', `${UL.esc(Show.first(ask.c))} fragt: „${UL.esc(t.q)}“`, opts);
    const [, sym, ent, rA, rAll, rX, re] = t.a[i];
    Show.change(me, { sym, ent });
    if (rAll) npcO.forEach(o => Show.rel(me, o.c, rAll));
    if (rA) Show.rel(me, ask.c, rA);
    if (rX) Show.rel(me, x.c, rX);
    const who = rX && /\{x\}/.test(re) ? x : rX < -5 ? x : ask;
    who.f.play(rX < 0 && who === x ? 'block' : sym >= 2 || ent >= 4 ? 'cheer' : 'interact');
    UL.Tags.bubble(who.c.id, v => v.copy(who.f.root.position).add(new T.Vector3(0, 2.2, 0)), fill(re), 2.8);
    if (rX <= -5) { UL.Tags.bubble(x.c.id, v => v.copy(x.f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Wie bitte?!', 'Das sagst du mir nicht ins Gesicht?', 'Na warte …']), 2.6); Show.log(`${me.name} lästert am Feuer über ${nm}.`, '🐍'); }
    else if (rX >= 6) Show.log(`${me.name} lobt ${nm} am Lagerfeuer.`, '💚');
    UL.Audio.sfx(ent >= 4 ? 'laugh' : sym >= 2 ? 'ooh' : 'tick');
    await UL.sleep(UL.bot ? 0.05 : 2.6);
    go();
  }
  function bubble2(o, at, text) { UL.Tags.bubble(o.c.id, at(o), text, 2.4); }

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
