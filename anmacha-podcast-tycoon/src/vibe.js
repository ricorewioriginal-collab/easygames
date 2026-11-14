/* AnMaCha – Der Podcast · Club-Feeling in der Stadt: Emotes, Tanzen, Fans, die mittanzen, Chat-Blasen und Stadt-Vibe */
(function (root) {
  'use strict';
  const AMC = root.AMC, U = AMC.U, I = AMC.Input, W = AMC.World, D = AMC.Data, Save = AMC.Save;
  const CV = AMC.CityVibe = {};
  const SHORT = ['Hey, ihr zwei! 👋', 'Ich hör euch jeden Tag! 🎧', 'Macht ein Selfie mit mir! 🤳', 'AnMaCha forever! 🧡', 'Der Beat in der Stadt! 🔥', 'Tanzt ihr mit? 💃',
    'Wo ist Gisela? 🚐', 'Grüße an Rico! 📱', 'Läuft gerade Clubradio24? 🪩', 'Neue Folge wann? 🎙️', 'Ich hab euch im Radio gehört! 📻', 'Straßenparty! 🎉', 'Spielt Kultradio24! 📼', 'Wer ist Ralf Rauschmann? 😅'];
  let V = null;

  CV.start = function (S) {
    CV.stop();
    if (!S || S.mode !== 'free' || S.net) return;
    V = { S, vibe: Save.data.cityVibe || 20, dancing: false, bubT: 2.5, feedT: 4, party: 0, bubs: [] };
    const hud = U.$('hud'); if (!hud) return;
    const el = V.el = U.el('div', 'cv-ui');
    el.innerHTML = '<div class="hm-emo cv-emo" id="cvEmo"><div class="cv-vibe" title="Stadt-Vibe"><span>🔥</span><i><em id="cvBar"></em></i></div>' +
      '<button type="button" data-e="dance" data-pad="✚↑" data-kb="1">💃<small>Tanzen</small></button><button type="button" data-e="yes" data-pad="✚←" data-kb="2">👋<small>Winken</small></button><button type="button" data-e="arms" data-pad="✚→" data-kb="3">🙌<small>Jubeln</small></button></div>' +
      '<div class="hm-feed cv-feed" id="cvFeed"></div>';
    hud.appendChild(el); I.dpadEmotes = true;
    el.querySelector('#cvEmo').addEventListener('click', e => { const b = e.target.closest('[data-e]'); if (b) emote(b.dataset.e); });
    draw();
  };
  CV.stop = function () {
    if (!V) return;
    I.dpadEmotes = false;
    if (V.el) V.el.remove(); V.bubs.forEach(b => b.el.remove());
    Save.data.cityVibe = Math.round(V.vibe); V = null;
  };
  CV.state = () => V;
  CV.emote = e => emote(e);

  function near(r) { const p = V.S.pl; return V.S.npcs.filter(n => n.fig && n.fig.root.visible && !n.follow && !n.guest && Math.hypot(n.x - p.x, n.z - p.z) < r); }
  function emote(e) {
    if (!V) return; const p = V.S.pl; if (!p.fig || !p.onGround) return;
    if (e === 'dance') { V.dancing = !V.dancing; AMC.Audio.sfx(V.dancing ? 'combo' : 'ui'); if (V.dancing) { if (AMC.WorldFX && AMC.WorldFX.react) AMC.WorldFX.react(p.x, p.z, 10, 'dance'); p.fig.play('dance', { fade: 0.2 }); p.anim = 'dance'; p.busy = 0.3; if (AMC.Career && near(9).length) AMC.Career.mark('dance'); } else { p.busy = 0; } draw(); return; }
    V.dancing = false; p.fig.play(e, { restart: true, fade: 0.1 }); p.anim = e; p.busy = 1.5; AMC.Audio.sfx(e === 'arms' ? 'cheer' : 'ui');
    if (AMC.WorldFX && AMC.WorldFX.react) AMC.WorldFX.react(p.x, p.z, 9, e);
    const fans = near(9); fans.forEach(n => { n.fig.play(e, { restart: true, fade: 0.1 }); n.anim = e; n.danceT = 1.4; n.fig.root.rotation.y = Math.atan2(p.x - n.x, p.z - n.z); });
    if (fans.length) { if (AMC.Career) AMC.Career.mark('dance'); bump(4 + fans.length * 2); const n = U.pick(fans); bubble(n, e === 'yes' ? U.pick(['Hallo! 👋', 'Huhu! 😄', 'Moin! 👋']) : U.pick(['Jaaa! 🙌', 'Woohoo! 🎉', 'AnMaCha! 🧡'])); Save.earn(2); }
    draw();
  }
  function bump(n) {
    V.vibe = Math.min(100, V.vibe + n);
    if (V.vibe >= 100) {
      V.vibe = 30; V.party = 12; const fp = Save.earn(60); Save.data.cityParties = (Save.data.cityParties || 0) + 1; Save.save();
      const p = V.S.pl; for (let i = 0; i < 5; i++) setTimeout(() => V && W.particles.burst(p.x + U.rand(-4, 4), 3.5, p.z + U.rand(-4, 4), [0xffd23f, 0xff3da8, 0x3dd6ff, 0x6cff8a][i % 4], 40, { speed: 6 }), i * 220);
      AMC.Audio.sfx('applause'); AMC.Play.msg('🎉 Straßenparty! Die ganze Straße tanzt mit! +' + fp + ' 🎟️', 3.5, true);
    }
    draw();
  }
  function draw() { if (!V) return; const b = U.$('cvBar'); if (b) b.style.width = Math.round(V.vibe) + '%'; const d = V.el && V.el.querySelector('[data-e=dance]'); if (d) d.classList.toggle('on', V.dancing); }
  function bubble(n, text) {
    if (!V) return; let b = V.bubs.find(x => x.n === n);
    if (!b) { b = { n, el: U.el('div', 'hm-bub') }; V.el.appendChild(b.el); V.bubs.push(b); }
    b.el.textContent = text; b.t = 3.2; b.el.hidden = false; b.el.classList.remove('pop'); void b.el.offsetWidth; b.el.classList.add('pop');
  }
  function feed(who, text) {
    const box = U.$('cvFeed'); if (!box) return; const row = U.el('div', 'hm-fl'); row.innerHTML = '<b>' + U.esc(who) + ':</b> ' + U.esc(text); box.appendChild(row);
    while (box.children.length > 3) box.firstChild.remove(); setTimeout(() => row.remove(), 7000);
  }

  CV.update = function (dt, S) {
    if (!V || V.S !== S) return;
    const p = S.pl;
    if (I.hit('k1')) emote('dance'); if (I.hit('k2')) emote('yes'); if (I.hit('k3')) emote('arms');
    // Tanzen endet beim Losgehen oder Springen
    if (V.dancing) { if (Math.hypot(I.move.x, I.move.y) > 0.25 || !p.onGround) { V.dancing = false; p.busy = 0; draw(); } else { p.busy = 0.3; if (p.anim !== 'dance') { p.fig.play('dance', { fade: 0.2 }); p.anim = 'dance'; } } }
    if (V.party > 0) V.party -= dt;
    // Fans in der Nähe kommen zum Mittanzen
    const fans = near(V.party > 0 ? 18 : 10);
    if (V.dancing || V.party > 0) {
      fans.forEach((n, i) => {
        if (n.ang === undefined) n.ang = i * 1.3 + Math.random();
        const tx = p.x + Math.cos(n.ang) * 2.3, tz = p.z + Math.sin(n.ang) * 2.3, dx = tx - n.x, dz = tz - n.z, d = Math.hypot(dx, dz);
        if (d > 0.5) { const s = Math.min(d, dt * 3.2); n.x += dx / d * s; n.z += dz / d * s; n.fig.root.position.set(n.x, n.y, n.z); n.fig.root.rotation.y = Math.atan2(dx, dz); if (n.anim !== 'jog') { n.fig.play('jog', { fade: 0.2 }); n.anim = 'jog'; } }
        else { n.fig.root.rotation.y += U.angDiff(n.fig.root.rotation.y, Math.atan2(p.x - n.x, p.z - n.z)) * Math.min(1, dt * 4); if (n.anim !== 'dance') { n.fig.play('dance', { fade: 0.3, speed: 0.9 + (i % 3) * 0.12 }); n.anim = 'dance'; } }
        n.hx = n.x; n.hz = n.z;
      });
      const close = fans.filter(n => Math.hypot(n.x - p.x, n.z - p.z) < 3.2).length;
      if (V.dancing) { V.vibe = Math.min(100, V.vibe + dt * (0.8 + close * 1.4)); if (V.vibe >= 100) bump(0); }
    } else {
      fans.forEach(n => { if (n.danceT > 0) n.danceT -= dt; else if (n.anim === 'dance' && !n.dancer) { n.fig.play('idle', { fade: 0.3 }); n.anim = 'idle'; } });
      V.vibe = Math.max(0, V.vibe - dt * 0.4);
    }
    // Chat: Sprechblasen über Fans und Stadt-Chat
    V.bubT -= dt;
    if (V.bubT <= 0) { V.bubT = 2.5 + Math.random() * 3; const c = near(22); if (c.length) { const n = U.pick(c), g = AMC.Social && Math.random() < 0.6 && AMC.Social.greet(n.name, p.id), l = g ? g : V.dancing || V.party > 0 ? U.pick(['Mega Moves! 💃', 'Tanz weiter! 🔥', 'Straßenparty! 🎉', 'Ich film das! 📱']) : U.pick(SHORT); bubble(n, l); if (Math.random() < 0.6) feed(n.name, l); } }
    V.feedT -= dt; if (V.feedT <= 0) { V.feedT = 9 + Math.random() * 8; const st = U.pick(D.STATIONS); feed(U.pick(D.FAN_NAMES), U.pick(['Hört gerade ' + st.name + ' ' + st.icon, 'Ist auf dem Weg zum Senderhaus von ' + st.name, 'Hat ein Autogramm von ' + U.pick(['Andrew', 'Marco']) + ' bekommen ✍️'])); }
    const cam = W.camera, wv = new root.THREE.Vector3(), cw = W.renderer.domElement.clientWidth, ch = W.renderer.domElement.clientHeight;
    V.bubs.forEach(b => {
      if (b.el.hidden) return; b.t -= dt; if (b.t <= 0 || !b.n.fig) { b.el.hidden = true; return; }
      wv.set(b.n.x, b.n.y + 2.4, b.n.z).project(cam);
      const far = Math.hypot(b.n.x - p.x, b.n.z - p.z) > 26;
      b.el.style.transform = 'translate(-50%,-100%) translate(' + Math.round((wv.x + 1) / 2 * cw) + 'px,' + Math.round((1 - wv.y) / 2 * ch) + 'px)'; b.el.style.opacity = wv.z < 1 && !far ? 1 : 0;
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
