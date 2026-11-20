// Nachtwache: Du hältst das Feuer am Leben und verscheuchst Tiere von den Vorräten.
// Eigenständige Szene auf der Camp-Bühne (Camp.Stage), dieselbe Steuerung wie im Camp.
(() => {
  const { R, UI, In, D } = UL, T = THREE, Camp = UL.Camp;
  const LEN = 70, STASH = { x: 3.8, z: -2.5 };
  const CRITTERS = [['Opossum', 0x9a8f86], ['Waschbär', 0x6a6460], ['Riesenratte', 0x5a4a3e], ['Stachelschwein', 0x4a3a2a]];

  function critterMesh(col) {
    const g = new T.Group(), m = R.mat(col);
    const body = new T.Mesh(new T.SphereGeometry(0.28, 10, 8), m); body.scale.set(1, 0.8, 1.5); body.position.y = 0.25; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(0.17, 10, 8), m); head.position.set(0, 0.36, 0.42); g.add(head);
    const tail = new T.Mesh(new T.CylinderGeometry(0.03, 0.06, 0.6, 6), m); tail.rotation.x = 1.1; tail.position.set(0, 0.3, -0.55); g.add(tail);
    const eyeM = new T.MeshBasicMaterial({ color: 0xfff27a });
    for (const s of [-1, 1]) { const e = new T.Mesh(new T.SphereGeometry(0.035, 6, 5), eyeM); e.position.set(s * 0.07, 0.41, 0.56); g.add(e); }
    // leuchtende Augen, schon von weitem sichtbar
    const glow = new T.Sprite(new T.SpriteMaterial({ color: 0xfff27a, transparent: true, opacity: 0.8, depthTest: false, blending: T.AdditiveBlending }));
    glow.scale.set(0.5, 0.25, 1); glow.position.set(0, 0.42, 0.6); g.add(glow);
    g.userData.glow = glow;
    return g;
  }

  Camp.watch = ({ theme, me }) => new Promise(async (resolve) => {
    const Show = UL.Show;
    await UI.fade(true, 0.3);
    UI.cmd([]); UI.hud('');
    const st = new Camp.Stage(theme, 'night');
    const f = UL.makeFig(me.look); st.scene.add(f.root); st.figs.push(f);
    const o = { f, x: 0, z: 3.4 }; f.root.position.set(o.x, st.h(o.x, o.z), o.z); f.root.rotation.y = Math.PI;
    const P = st.poi;
    UL.Tags.set('n:beds', v => v.set(P.beds.x, 2.2, P.beds.z), '💤 Zzz …', 'tag');
    UL.Tags.set('n:stash', v => v.set(STASH.x, 2.0, STASH.z), '🍖 Vorräte', 'tag crew');
    R.set(st);
    UL.Audio.music('night'); UL.Audio.atmo(theme === 'studio' ? 'studio' : 'night');
    UI.hint({ move: 'Laufen', run: 'Rennen', look: 'Kamera', ok: 'Kommando', start: 'Pause' });
    const S = { t: 0, fire: 0.75, out: 0, carry: false, scared: 0, stolen: 0, critters: [], next: UL.bot ? 2 : 8, done: false };
    const wood = R.log(0.8, 0.09);
    const hud = () => {
      const fl = Math.round(S.fire * 100), left = Math.max(0, Math.ceil(LEN - S.t));
      UI.hud(`<span class="chip big">🌙 Nachtwache</span><span class="chip ${fl < 25 ? 'warn' : ''}">🔥 ${'▮'.repeat(Math.ceil(S.fire * 8))}${'▯'.repeat(8 - Math.ceil(S.fire * 8))}</span><span class="chip">⏱ ${left} s</span><span class="chip">🦝 ${S.scared} verscheucht</span>${S.stolen ? `<span class="chip warn">🍖 −${S.stolen}</span>` : ''}${S.carry ? '<span class="chip">🪵 Holz</span>' : ''}`);
    };
    hud();
    await UI.fade(false, 0.4);
    await UI.banner('🌙 Nachtwache', 'Halte das Feuer am Leben und schütze die Vorräte!', 2000);
    if (!UL.bot) UI.toast('Hol Holz vom Stapel und leg nach. Leuchtende Augen? Hinlaufen und verscheuchen!', '🔥', 4200);

    const near = (p, r) => Math.hypot(o.x - p.x, o.z - p.z) < r;
    function spawn() {
      const [name, col] = UL.pick(CRITTERS), a = Math.random() * 6.28, m = critterMesh(col);
      const c = { name, m, x: Math.cos(a) * 11.8, z: Math.sin(a) * 11.8, sp: UL.rand(0.75, 1.05), flee: 0 };
      m.position.set(c.x, st.h(c.x, c.z), c.z); st.scene.add(m); S.critters.push(c);
      UL.Audio.sfx('tense');
      UI.toast(`Es raschelt … ein ${name} schleicht zu den Vorräten!`, '👀', 2400);
    }
    // Kamera wie im Camp: folgt weich, rechter Stick / Maus / Wischen dreht
    const camWant = new T.Vector3(), look = new T.Vector3(); let camInit = false;
    function camTick(dt) {
      const c = st.cam;
      c.yaw -= In.look.x; c.pitch = UL.clamp(c.pitch + In.look.y, 0.15, 1.1); c.dist = UL.clamp(c.dist - In.zoom * 1.2, 3.5, 11);
      const p = f.root.position, d = c.dist * (UL.portrait() ? 1.3 : 1);
      camWant.set(p.x + Math.sin(c.yaw) * Math.cos(c.pitch) * d, p.y + 1.2 + Math.sin(c.pitch) * d, p.z + Math.cos(c.yaw) * Math.cos(c.pitch) * d);
      camWant.y = Math.max(camWant.y, st.h(camWant.x, camWant.z) + 0.6);
      if (!camInit) { camInit = true; st.camera.position.copy(camWant); look.copy(p); }
      st.camera.position.lerp(camWant, 1 - Math.exp(-7 * dt)); look.lerp(new T.Vector3(p.x, p.y + 1.1, p.z), 1 - Math.exp(-6 * dt)); st.camera.lookAt(look);
    }
    function finish() {
      if (S.done) return; S.done = true;
      UI.cmd([]); UI.hint({}); UL.Tags.clear(); UI.hud('');
      S.critters.forEach(c => st.scene.remove(c.m));
      UI.fade(true, 0.5).then(() => resolve({ fireOk: S.out < 4, scared: S.scared, stolen: S.stolen }));
    }
    let botT = 0;
    st.update = (dt) => {
      st.tick(dt);
      if (S.done) return;
      camTick(dt);
      S.t += dt * (UL.bot ? 6 : 1);
      // Feuer brennt herunter
      S.fire = Math.max(0, S.fire - dt / 38);
      if (S.fire <= 0) S.out += dt;
      st.fire.scale.setScalar(0.25 + S.fire * 1.1);
      if (S.fire < 0.25 && !S.warned) { S.warned = true; UI.toast('Das Feuer geht aus – schnell Holz holen!', '🔥', 2600); UL.Audio.sfx('bad'); }
      if (S.fire > 0.4) S.warned = false;
      // Tiere
      if ((S.next -= dt * (UL.bot ? 3 : 1)) <= 0) { S.next = UL.rand(8, 13); spawn(); }
      for (const c of S.critters.slice()) {
        const tx = c.flee ? c.x * 1.4 : STASH.x, tz = c.flee ? c.z * 1.4 : STASH.z, dx = tx - c.x, dz = tz - c.z, d = Math.hypot(dx, dz);
        const sp = c.flee ? 5 : c.sp;
        c.x += dx / (d || 1) * sp * dt; c.z += dz / (d || 1) * sp * dt;
        c.m.position.set(c.x, st.h(c.x, c.z) + Math.abs(Math.sin(S.t * 14)) * 0.05, c.z); c.m.rotation.y = Math.atan2(dx, dz);
        c.m.userData.glow.material.opacity = 0.5 + Math.sin(S.t * 6) * 0.3;
        if (c.flee && Math.hypot(c.x, c.z) > 13) { st.scene.remove(c.m); S.critters.splice(S.critters.indexOf(c), 1); }
        else if (!c.flee && d < 1.1) { S.stolen++; UL.Audio.sfx('boo'); UI.toast(`Mist! Der ${c.name} klaut eine Portion.`, '🍖', 2400); c.flee = 1; hud(); }
      }
      // Spieler laufen
      let mx = In.move.x, my = In.move.y; if (UL.bot) mx = my = 0;
      const mag = Math.min(1, Math.hypot(mx, my)), sp = (In.run ? 5.2 : 2.8) * (mag < 0.15 ? 0 : 0.35 + 0.65 * mag);
      if (sp > 0.05) {
        const yaw = st.cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), vx = fx * -my - fz * mx, vz = fz * -my + fx * mx, l = Math.hypot(vx, vz) || 1;
        o.x += vx / l * sp * dt; o.z += vz / l * sp * dt;
        const p = { x: o.x, z: o.z }; st.push(p); o.x = p.x; o.z = p.z;
        f.root.rotation.y = UL.angDamp(f.root.rotation.y, Math.atan2(vx, vz), 12, dt);
      }
      f.root.position.set(o.x, st.h(o.x, o.z), o.z); f.move(sp);
      if (S.carry) { if (!wood.parent) st.scene.add(wood); wood.position.copy(f.root.position).add(new T.Vector3(Math.sin(f.root.rotation.y) * 0.35, 1.0, Math.cos(f.root.rotation.y) * 0.35)); wood.rotation.y = f.root.rotation.y + Math.PI / 2; }
      else if (wood.parent) st.scene.remove(wood);
      // Kommandos
      const cmds = [], cr = S.critters.find(c => !c.flee && Math.hypot(c.x - o.x, c.z - o.z) < 2.3);
      if (cr) cmds.push({ id: 'scare', label: cr.name + ' verscheuchen', icon: '👋', hot: true, c: cr });
      if (!S.carry && near(P.wood, 2.4)) cmds.push({ id: 'wood', label: 'Holz holen', icon: '🪵', hot: true });
      if (S.carry && near({ x: 0, z: 0 }, 2.6)) cmds.push({ id: 'fire', label: 'Holz nachlegen', icon: '🔥', hot: true });
      if (S.t >= LEN) cmds.push({ id: 'end', label: 'Wache übergeben', icon: '🌅', hot: true });
      UI.cmd(cmds);
      let c = UI.cmdTick();
      if (UL.bot && st.time > botT) {   // Testpilot: Holz holen, nachlegen, Tiere verscheuchen
        botT = st.time + 0.3;
        const t = S.critters.find(x => !x.flee);
        if (t) { o.x = t.x * 0.9; o.z = t.z * 0.9; } else if (S.carry) { o.x = 0; o.z = 2; } else { o.x = P.wood.x - 1.4; o.z = P.wood.z - 1; }
        c = cmds.find(x => x.hot) || null;
      }
      if (c) {
        if (c.id === 'scare') { c.c.flee = 1; S.scared++; f.play('block'); UL.Audio.sfx('whoosh'); UL.Tags.bubble('me', v => v.copy(f.root.position).add(new T.Vector3(0, 2.2, 0)), UL.pick(['Husch, husch!', 'Weg da, das ist unser Essen!', 'Verschwinde!']), 1.8); }
        else if (c.id === 'wood') { S.carry = true; f.play('pickup'); UL.Audio.sfx('chop'); }
        else if (c.id === 'fire') { S.carry = false; S.fire = Math.min(1, S.fire + 0.4); S.out = Math.max(0, S.out - 2); f.play('throw'); UL.Audio.sfx('whoosh'); }
        else if (c.id === 'end') finish();
        hud();
      }
      if (S.t >= LEN + (UL.bot ? 0 : 20)) finish();   // nach der Wache automatisch Schichtwechsel
      if (Math.floor(S.t) !== S.lastSec) { S.lastSec = Math.floor(S.t); hud(); }
    };
  });
})();
