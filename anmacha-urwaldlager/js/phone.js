/* Urwaldlager – Buschtelefon: eigenes Interview-Set (Sessel, altes Telefon, Bambuswand), Fragen aus dem Off,
   Antworten als Sprechblase, Zuschauer-Reaktion mit Trend. Auch für die Morgen-Clips der Mit-Camper. */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, UI = UL.UI, A = UL.A, D = UL.D, esc = UL.esc;
  const Ph = UL.Phone = {};

  // Zuschauer-Platz (1 = beliebteste/r) unter allen, die noch im Lager sind
  Ph.rank = (c) => { const l = UL.Show.alive().slice().sort((a, b) => UL.Show.pop(b) - UL.Show.pop(a)); return { pos: l.indexOf(c) + 1, n: l.length }; };

  function wallTex(studio) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d');
    g.fillStyle = studio ? '#241c34' : '#6a4a26'; g.fillRect(0, 0, 512, 256);
    for (let x = 0; x < 512; x += 26) {   // Bambusrohre
      const c = studio ? (x / 26 % 2 ? '#3a2c55' : '#2e2346') : (x / 26 % 2 ? '#9a7a3e' : '#8a6a34');
      g.fillStyle = c; g.fillRect(x + 2, 0, 22, 256);
      g.fillStyle = '#0003'; for (let y = 30 + (x * 7) % 40; y < 256; y += 70) g.fillRect(x + 2, y, 22, 4);
      g.fillStyle = '#fff1'; g.fillRect(x + 5, 0, 4, 256);
    }
    const t = new T.CanvasTexture(cv); t.wrapS = T.RepeatWrapping; t.repeat.set(2, 1); if (T.sRGBEncoding) t.encoding = T.sRGBEncoding; return t;
  }

  class PhoneSet extends R.Stage {
    constructor(theme) {
      super();
      const sc = this.scene, studio = theme === 'studio';
      sc.background = new T.Color(R.lin ? R.lin(0x120c08) : 0x120c08);
      sc.add(new T.HemisphereLight(0xffe2b0, 0x302018, 0.55));
      const key = new T.PointLight(R.lin(0xffc070), 1.4, 9); key.position.set(1.2, 2.4, 2.2); sc.add(key);
      const rim = new T.PointLight(R.lin(studio ? 0xff4fa0 : 0x60ff90), 0.8, 6); rim.position.set(-1.6, 2.2, -0.6); sc.add(rim);
      this.key = key;
      // Hütte: Rückwand, Seitenwände, Boden
      const wm = new T.MeshLambertMaterial({ map: wallTex(studio) });
      const back = new T.Mesh(new T.PlaneGeometry(6, 4.6), wm); back.position.set(0, 2.2, -1.1); sc.add(back);
      for (const s of [-1, 1]) { const w = new T.Mesh(new T.PlaneGeometry(5, 4.6), wm); w.position.set(s * 2.2, 2.2, 1.2); w.rotation.y = -s * Math.PI / 2; sc.add(w); }
      const floor = new T.Mesh(new T.PlaneGeometry(6, 5), R.mat(studio ? 0x2a2433 : 0x5a4026)); floor.rotation.x = -Math.PI / 2; sc.add(floor);
      const sign = R.sign(['📞 ' + D.SHOW.phone.toUpperCase()], 1.9, 0.4, { bg: studio ? '#141824' : '#3a2410', w: 512, h: 108, font: '900 58px system-ui' }); sign.position.set(0, 2.55, -1.05); sc.add(sign);
      // Sessel und altes Telefon auf einem Hocker
      this.chair = A.has('kf_armchair') ? A.sized('kf_armchair', 1.05) : new T.Mesh(new T.BoxGeometry(1, 1, 0.9), R.mat(0x7a2a2a));
      this.chair.position.set(0, 0, -0.45); sc.add(this.chair);
      const stool = new T.Mesh(new T.CylinderGeometry(0.22, 0.26, 0.55, 10), R.mat(0x4a3018)); stool.position.set(0.85, 0.275, -0.2); sc.add(stool);
      const ph = new T.Group(); ph.position.set(0.85, 0.6, -0.2); sc.add(ph);
      const body = new T.Mesh(new T.BoxGeometry(0.3, 0.12, 0.24), R.mat(studio ? 0xff4fa0 : 0xc0302a)); body.position.y = 0.06; ph.add(body);
      const dial = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.02, 14), R.mat(0xf2f2ee)); dial.position.set(0, 0.13, 0.03); ph.add(dial);
      this.hand = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.3, 8), R.mat(studio ? 0xff4fa0 : 0xc0302a));
      this.hand.rotation.z = Math.PI / 2; this.hand.position.set(0, 0.17, -0.04); ph.add(this.hand); this.phone = ph;
      // Deko: Fackeln/Pflanzen
      if (A.has('kd_torch_mounted')) { const t = A.sized('kd_torch_mounted', 0.9); t.position.set(-1.7, 1.2, -1.0); sc.add(t); this.torch = t; }
      if (A.has('plant_bush')) { const b = A.sized('plant_bush', 0.7); b.position.set(-1.3, 0, -0.6); sc.add(b); }
      this.camBase = new T.Vector3(0, 1.3, UL.portrait() ? 3.2 : 2.4); this.lookAt = new T.Vector3(0, 0.95, -0.4);
      this.camera.position.copy(this.camBase); this.camera.lookAt(this.lookAt);
      this.zoom = 0; this.t = 0;
    }
    update(dt) {
      this.tick(dt); this.t += dt;
      // Handkamera: leichtes Wackeln, langsamer Zoom auf das Gesicht
      const z = this.zoom, c = this.camera;
      c.position.set(this.camBase.x + Math.sin(this.t * 0.7) * 0.04, this.camBase.y + 0.05 * z + Math.sin(this.t * 1.1) * 0.02, this.camBase.z - (UL.portrait() ? 1.1 : 0.8) * z);
      c.lookAt(this.lookAt.x, this.lookAt.y + 0.2 * z, this.lookAt.z);
      this.key.intensity = 1.3 + Math.sin(this.t * 13) * 0.05 + Math.sin(this.t * 7) * 0.05;
    }
  }

  // Overlay: REC, Bauchbinde
  function overlay(c, sub) {
    const el = document.createElement('div'); el.className = 'phonecam';
    el.innerHTML = `<div class="rec">● REC</div><div class="lower"><b>${esc(c.name)}</b><small>${esc(sub || c.job || '')}</small></div>`;
    document.getElementById('ui').appendChild(el); return el;
  }
  // Zuschauer-Reaktion: fliegende Emojis + Trend-Chip
  Ph.react = (d, c) => {
    const ui = document.getElementById('ui'); if (!ui) return;
    const pool = [].concat(d.sym > 0 ? ['❤️', '👏', '🥰'] : d.sym < 0 ? ['👎', '😠', '🙄'] : [], d.ent > 2 ? ['😂', '🍿', '🔥'] : []);
    if (!pool.length) pool.push('📺');
    const n = Math.min(18, 4 + Math.round((Math.abs(d.sym || 0) + Math.abs(d.ent || 0)) * 1.5));
    const box = document.createElement('div'); box.className = 'reactfx';
    for (let i = 0; i < n; i++) { const s = document.createElement('span'); s.textContent = UL.pick(pool); s.style.left = (8 + Math.random() * 84) + '%'; s.style.animationDelay = (Math.random() * 0.9).toFixed(2) + 's'; s.style.fontSize = (22 + Math.random() * 20) + 'px'; box.appendChild(s); }
    if (c) { const r = Ph.rank(c); const t = document.createElement('div'); t.className = 'trend ' + (d.sym > 0 ? 'up' : d.sym < 0 ? 'down' : ''); t.innerHTML = `📺 Zuschauer: ${d.sym > 0 ? '▲ mögen das' : d.sym < 0 ? '▼ finden das daneben' : '● neugierig'}${d.ent > 2 ? ' · 😂 unterhaltsam' : ''}<br><b>Trend: Platz ${r.pos} von ${r.n}</b>`; box.appendChild(t); }
    ui.appendChild(box); setTimeout(() => box.remove(), 3600);
  };

  // Set öffnen, Figur in den Sessel setzen; gibt {st, f, close} zurück
  async function open(theme, c) {
    const prev = R.stage;
    await UI.fade(true, 0.3);
    UI.cmd([]); UI.hint({});
    const st = new PhoneSet(theme);
    const f = UL.makeFig(c.look); st.scene.add(f.root); st.figs.push(f);
    f.root.position.set(0, 0.32, -0.35); f.root.rotation.y = 0; f.set('sit');
    R.set(st);
    UL.Audio.sfx('phone');
    await UI.fade(false, 0.35);
    const close = async (restore) => { UL.Tags.del('b:phone'); await UI.fade(true, 0.3); if (restore && prev) R.set(prev); await UI.fade(false, 0.3); };
    return { st, f, close };
  }
  const say = (f, text, sec = 3.6) => UL.Tags.set('b:phone', v => v.copy(f.root.position).add(new T.Vector3(0, f.height + 0.35, 0)), esc(text), 'bubble', sec);

  // Spieler im Buschtelefon: zwei Fragen, jede Antwort wirkt aufs Voting → Summe {sym, ent}
  Ph.interview = async ({ theme, me, others }) => {
    const { st, f, close } = await open(theme, me);
    const hud = overlay(me, 'im ' + D.SHOW.phone);
    const qs = UL.rng.shuffle(D.PHONE.slice()).slice(0, UL.bot ? 1 : 2), sum = { sym: 0, ent: 0 }, said = [];
    for (const q of qs) {
      const tgt = UL.pick(others) || me, x = UL.Show.first(tgt);
      st.zoom = 0.2;
      const i = await UI.choose('📞 ' + D.SHOW.phone, `<i>„${esc(q.q)}“</i>`, q.a.map((a, k) => ({ label: a[0].replace(/\{x\}/g, x), value: k + 1 })), { who: 'Stimme aus dem Off', icon: '📞', cls: 'clear' });
      if (!i) break;
      const a = q.a[i - 1], txt = a[0].replace(/\{x\}/g, x);
      st.zoom = 0.75; f.play(a[2] >= 4 ? 'cheer' : 'interact'); say(f, txt);
      UL.Audio.sfx(a[1] < 0 ? 'ooh' : a[2] >= 4 ? 'laugh' : 'ok');
      const d = { sym: a[1], ent: a[2] }; Ph.react(d, me);
      sum.sym += a[1]; sum.ent += a[2]; said.push(txt);
      if (a[0].includes('{x}') && a[1] < 0 && tgt !== me) UL.Show.rel(me, tgt, -6);
      await UL.sleep(UL.bot ? 0.05 : 3.4);
    }
    hud.remove();
    await close(true);
    return { sum, said };
  };

  // Morgen-Clips: Mit-Camper reden im Buschtelefon (oft über dich)
  Ph.clips = async ({ theme, list }) => {
    if (!list.length) return;
    const prev = R.stage;
    for (const { c, text } of list) {
      const { st, f } = await open(theme, c);
      const hud = overlay(c, 'Gestern im ' + D.SHOW.phone);
      st.zoom = 0.4; f.play('interact');
      await UI.say('camp', text, { name: '📞 ' + UL.Show.first(c) });
      hud.remove(); UL.Tags.del('b:phone');
    }
    await UI.fade(true, 0.3); if (prev) R.set(prev); await UI.fade(false, 0.3);
  };
})();
