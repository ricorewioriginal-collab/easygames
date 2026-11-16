/* Urwaldlager – Menüs: Titel, neue Staffel, Figur-Editor, Prüfungen üben, Einstellungen, Steuerung, Pause, Mitwirkende */
(function () {
  'use strict';
  const UL = window.UL, T = THREE, R = UL.R, UI = UL.UI, In = UL.In, A = UL.A, esc = UL.esc;
  const M = UL.Menus = {};

  // ---------- Kulisse hinter dem Titel: Lagerfeuer am Abend, Camper sitzen drumherum ----------
  class TitleStage extends R.Stage {
    constructor(theme = 'dschungel') {
      super();
      this.noPause = true;
      const sc = this.scene;
      if (theme === 'studio') { this.env = UL.Env.studio(sc, { radius: 12, screenText: ['URWALDLAGER', 'DIE PROMI-SHOW'] }); this.updaters.push(dt => this.env.update(dt)); }
      else this.env = UL.Env.jungle(sc, { tod: 'evening', radius: 12, clear: [{ x: 0, z: 0, r: 5 }], seed: 5 });
      const stones = A.sized('campfire', 0.35, 'xz'); stones.scale.multiplyScalar(4.2); sc.add(stones);
      sc.add(R.logs(6, 0.5)); this.add(R.fire(0.8));
      const cast = UL.rng.shuffle(UL.D.CAST).slice(0, 5);
      cast.forEach((c, i) => {
        const a = -0.4 + i * 0.6 + Math.PI * 0.85, f = UL.makeFig(c.look);
        f.root.position.set(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4); UL.faceTo(f, 0, 0); sc.add(f.root); this.figs.push(f);
        const log = R.log(1.5, 0.16); log.position.set(Math.cos(a) * 2.75, 0, Math.sin(a) * 2.75); log.rotation.y = -a + Math.PI / 2; sc.add(log);
        f.set(i % 2 ? 'sit' : 'idle'); if (i % 2) f.root.position.y = 0.05;
        if (i === 2) f.set('cheer');
      });
      this.ang = 0.6;
    }
    update(dt) {
      this.tick(dt); this.ang += dt * 0.05;
      const r = UL.portrait() ? 9 : 7.5;
      this.camera.position.set(Math.cos(this.ang) * r, 2.6, Math.sin(this.ang) * r + 1.5);
      this.camera.lookAt(UL.portrait() ? 0 : -1.2, 1.1, 0);
    }
  }
  M.TitleStage = TitleStage;

  M.title = () => {
    if (UI._cap) UI._cap.fin(); document.querySelectorAll('#ui .tui, #ui .tint').forEach(e => e.remove()); document.getElementById('meter').hidden = true; document.getElementById('banner').hidden = true;
    UI.closeAll(); UL.Tags.clear(); UI.hud(''); UI.cmd([]); UI.hint({}); UL.paused = false;
    if (!(R.stage instanceof TitleStage)) R.set(new TitleStage());
    UI.fade(false, 0.5);
    UL.Audio.music('camp'); UL.Audio.atmo('jungle');
    const save = UL.Show.peek();
    const p = UI.open(`<img class="logo" src="logo.svg" alt="Urwaldlager – Die Promi-Show im Dschungel">
      <div class="menu">
        ${save ? `<button class="btn" data-a="cont"><b>▶ Weiterspielen</b><small>Tag ${save.day} von ${save.days} · ${save.theme === 'studio' ? 'TV-Studio' : 'Dschungel'} · ${esc(save.name)}</small></button>` : ''}
        <button class="btn" data-a="new"><b>🌴 Neue Staffel</b><small>Ab ins Camp – die Zuschauer entscheiden</small></button>
        <button class="btn" data-a="practice"><b>⭐ Prüfungen spielen</b><small>Alle 9 Urwaldprüfungen einzeln, Dschungel oder Studio</small></button>
        <button class="btn" data-a="settings"><b>⚙️ Einstellungen</b></button>
        <button class="btn" data-a="controls"><b>🎮 Steuerung</b><small>Handy · Tastatur · PlayStation · Switch</small></button>
        <button class="btn" data-a="cloud"><b>☁️ Speichern mit Google</b></button>
        <button class="btn" data-a="credits"><b>ℹ️ Mitwirkende & Lizenzen</b></button>
      </div><div class="ver">Urwaldlager ${UL.VERSION} · alles frei erfunden</div>`, { cls: 'title' });
    p.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'cont') { UI.close(p); UL.Show.continue(); }
      else if (a === 'new') M.newSeason();
      else if (a === 'practice') M.practice();
      else if (a === 'settings') M.settings();
      else if (a === 'controls') M.controls();
      else if (a === 'cloud') M.cloud();
      else if (a === 'credits') M.credits();
    });
  };

  // ---------- Neue Staffel ----------
  M.newSeason = async () => {
    const theme = await UI.choose('Neue Staffel', 'Wo soll die Show stattfinden?', [
      { label: 'Dschungel', icon: '🌴', sub: 'Das Original-Gefühl: Camp unter Palmen, Hängebrücke, Lagune und Moderationsposten am Waldrand.', value: 'dschungel' },
      { label: 'TV-Studio', icon: '🎬', sub: 'Die Studio-Ausgabe: Camp auf der Bühne, LED-Wand, Publikum, Scheinwerfer – gleiche Prüfungen.', value: 'studio' }], { cancel: 'Zurück' });
    if (!theme) return;
    const len = await UI.choose('Länge der Staffel', null, Object.entries(UL.D.LENGTHS).map(([k, v]) => ({ label: v.label, value: k, icon: k === 'kurz' ? '⏱️' : k === 'normal' ? '📺' : '🏆' })), { cancel: 'Zurück' });
    if (!len) return;
    const diff = await UI.choose('Schwierigkeit der Prüfungen', null, Object.entries(UL.D.DIFF).map(([k, v]) => ({ label: v.label, value: k, sub: k === 'leicht' ? 'Mehr Zeit, weniger Gemeinheiten' : k === 'schwer' ? 'Für Dschungel-Profis' : 'Wie im Fernsehen' })), { cancel: 'Zurück' });
    if (!diff) return;
    const me = await M.creator(theme);
    if (!me) return;
    UI.closeAll();
    UL.Show.newSeason({ theme, len, diff, me });
  };

  // ---------- Figur-Editor (KayKit-Figur mit Camp-Kleidung) ----------
  M.creator = (theme) => new Promise(res => {
    const st = R.stage;
    const me = UL.store.get('me', null) || { name: '', job: UL.D.PLAYER_JOBS[0], form: 'n', look: { model: 'rogue', skin: 0, shirt: 0xc8372d, pants: 0xb79a6a, accent: 0xf2e6c8, hat: 'busch', hatColor: 0xb08850, glasses: false } };
    let fig = null;
    const show = () => {
      if (fig) { fig.dispose(); st.figs.splice(st.figs.indexOf(fig), 1); }
      fig = UL.makeFig(Object.assign({}, me.look, { hat: me.look.hat === 'none' ? null : me.look.hat }), 1.75);
      fig.root.position.set(UL.portrait() ? 0 : -1.6, 0, 3.2); st.scene.add(fig.root); st.figs.push(fig); fig.play('cheer');
    };
    const oldUpd = st.update.bind(st);
    // Figur im freien Bildteil: hochkant oben über dem Fenster, quer links neben dem Fenster
    st.update = (dt) => { st.tick(dt); if (fig) fig.root.rotation.y += dt * 0.6; const c = st.camera, pt = UL.portrait(), fx = fig ? fig.root.position.x : 0;
      if (pt) { c.position.set(fx, 1.9, 10.6); c.lookAt(fx, -2.2, 3); } else { c.position.set(fx + 2.3, 1.4, 7.4); c.lookAt(fx + 2.3, 1.0, 3); } };
    const sw = (arr, key, cur) => arr.map(c => `<button class="swatch ${cur === c[0] ? 'on' : ''}" data-k="${key}" data-v="${c[0]}" style="background:#${c[0].toString(16).padStart(6, '0')}" title="${c[1]}"></button>`).join('');
    const SK = ['#f6d5bf', '#e7b896', '#c88f6a', '#9a6a4c', '#6b4636'];
    const draw = () => {
      const L = me.look;
      p.el.querySelector('.box').innerHTML = `<h2>Dein Promi</h2>
        <div class="set">
          <span>Name</span><input class="field" type="text" maxlength="18" value="${esc(me.name)}" placeholder="Dein Promi-Name" data-name>
          <span>Bekannt als</span><select class="field" data-job>${UL.D.PLAYER_JOBS.map(j => `<option ${j === me.job ? 'selected' : ''}>${esc(j)}</option>`).join('')}</select>
          <span>Titel bei Sieg</span><select class="field" data-form>${Object.entries(UL.D.TITLE).map(([k, v]) => `<option value="${k}" ${k === me.form ? 'selected' : ''}>${v}</option>`).join('')}</select>
        </div>
        <h3>Figur</h3><div class="row">${A.FIG.map((f, i) => `<button class="pill ${L.model === f ? 'on' : ''}" data-k="model" data-v="${f}">Typ ${i + 1}</button>`).join('')}</div>
        <h3>Hautton</h3><div class="row">${SK.map((c, i) => `<button class="swatch ${L.skin === i ? 'on' : ''}" data-k="skin" data-v="${i}" style="background:${c}"></button>`).join('')}</div>
        <h3>Camp-Hemd</h3><div class="row">${sw(UL.D.SHIRTS, 'shirt', L.shirt)}</div>
        <h3>Kopf</h3><div class="row">${UL.D.HATS.map(([k, n]) => `<button class="pill ${(L.hat || 'none') === k ? 'on' : ''}" data-k="hat" data-v="${k}">${n}</button>`).join('')}<button class="pill ${L.glasses ? 'on' : ''}" data-k="glasses" data-v="1">😎 Brille</button></div>
        <div class="row" style="margin-top:8px">${sw(UL.D.HATCOL.map(c => [c, '']), 'hatColor', L.hatColor)}</div>
        <div class="row" style="margin-top:16px"><button class="btn" data-go><b>✅ Ab in den ${theme === 'studio' ? 'Studio-Dschungel' : 'Dschungel'}!</b></button></div>
        <div class="foot">${In.glyph('back')} Zurück</div>`;
      p.el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
        const k = b.dataset.k, v = b.dataset.v;
        if (k === 'model' || k === 'hat') L[k] = v; else if (k === 'glasses') L.glasses = !L.glasses; else L[k] = +v;
        draw(); UI.refresh(p); const i = p.items.findIndex(x => x.dataset.k === k && x.dataset.v === v); UI.focus(p, i >= 0 ? i : 0); show();
      });
      const nm = p.el.querySelector('[data-name]'); nm.oninput = () => me.name = nm.value;
      nm.onkeydown = e => { if (e.key === 'Enter' || e.key === 'Escape') nm.blur(); e.stopPropagation(); };
      p.el.querySelector('[data-job]').onchange = e => me.job = e.target.value;
      p.el.querySelector('[data-form]').onchange = e => me.form = e.target.value;
      p.el.querySelector('[data-go]').onclick = () => {
        me.name = (me.name || '').trim() || 'Promi ' + UL.pick(['Sonnenschein', 'Glanz', 'Wirbelwind', 'Superstar', 'Paradiesvogel']);
        UL.store.set('me', me); done(me);
      };
    };
    const done = (v) => { st.update = oldUpd; if (fig) { fig.dispose(); } UI.close(p); res(v); };
    const p = UI.open('<div class="box"></div>', { cls: 'creator', onBack: () => done(null) });
    draw(); UI.refresh(p); UI.focus(p, 0); show();
  });

  // ---------- Prüfungen einzeln spielen ----------
  M.practice = () => {
    let theme = UL.store.get('practiceTheme', 'dschungel');
    const best = UL.store.get('best', {});
    const p = UI.open('<div class="box wide"></div>', { onBack: () => UI.close(p), onTab: () => { theme = theme === 'studio' ? 'dschungel' : 'studio'; draw(); } });
    const draw = () => {
      p.el.querySelector('.box').innerHTML = `<h2>⭐ Urwaldprüfungen</h2>
        <div class="tabs">${In.device === 'pad' ? In.glyph('l1') : ''}<button class="tab ${theme === 'dschungel' ? 'on' : ''}" data-t="dschungel">🌴 Dschungel</button><button class="tab ${theme === 'studio' ? 'on' : ''}" data-t="studio">🎬 TV-Studio</button>${In.device === 'pad' ? In.glyph('r1') : ''}</div>
        <div class="grid2">${UL.D.TRIALS.map(t => `<button class="opt" data-id="${t.id}"><b>${t.icon} ${esc(t.name)}</b><small>Bestwert: ${best[t.id] != null ? best[t.id] + ' / ' + t.stars + ' ⭐' : '–'}</small></button>`).join('')}</div>
        <div class="foot">${In.glyph('back')} Zurück</div>`;
      p.el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { theme = b.dataset.t; UL.store.set('practiceTheme', theme); draw(); UI.refresh(p); });
      p.el.querySelectorAll('[data-id]').forEach(b => b.onclick = async () => {
        const id = b.dataset.id; UI.closeAll();
        await UI.fade(true, 0.3);
        const me = UL.store.get('me', null);
        const r = await UL.Trials.run(id, { theme, practice: true, diff: 'normal', name: me ? me.name : 'Du', look: me ? Object.assign({}, me.look, { hat: me.look.hat === 'none' ? null : me.look.hat }) : undefined });
        const b2 = UL.store.get('best', {}); if (!(b2[id] >= r.stars)) { b2[id] = r.stars; UL.store.set('best', b2); }
        M.title(); M.practice();
      });
      UI.refresh(p);
    };
    draw(); UI.focus(p, 2);
  };

  // ---------- Einstellungen ----------
  M.settings = () => {
    const S = UL.settings, PN = window.EasyGamesPadNormal;
    const tog = (k, l) => `<span>${l}</span><button class="tog ${S[k] ? 'on' : ''}" data-tog="${k}">${S[k] ? 'An' : 'Aus'}</button>`;
    const rng = (k, l, min, max, step) => `<span>${l}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${S[k]}" data-rng="${k}">`;
    const p = UI.open(`<div class="box"><h2>⚙️ Einstellungen</h2><div class="set">
      <span>Grafik</span><select class="field" data-q>${[['auto', 'Automatisch'], ['low', 'Niedrig (schwache Handys)'], ['mid', 'Mittel'], ['high', 'Hoch']].map(([v, l]) => `<option value="${v}" ${S.quality === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      ${rng('music', 'Musik', 0, 1, 0.1)}${rng('sfx', 'Geräusche', 0, 1, 0.1)}
      ${tog('voice', 'Moderatoren-Stimme (Sprachausgabe)')}
      ${rng('sens', 'Kamera-Empfindlichkeit', 0.4, 2, 0.1)}
      ${tog('invertY', 'Kamera oben/unten umkehren')}
      ${tog('autoRun', 'Immer rennen')}
      ${tog('shake', 'Bildschirm wackeln')}
      ${tog('hints', 'Tasten-Hinweise anzeigen')}
      ${PN ? `<span>Controller-Symbole</span><select class="field" data-ps>${[['auto', 'Automatisch'], ['ps', 'PlayStation ✕○□△'], ['switch', 'Nintendo Switch'], ['xbox', 'Xbox']].map(([v, l]) => `<option value="${v}" ${PN.style() === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <span>Bestätigen-Taste</span><select class="field" data-pc>${[['auto', 'Automatisch (Switch: A rechts)'], ['bottom', 'Unten (✕ / A unten)'], ['right', 'Rechts (Nintendo-Art)']].map(([v, l]) => `<option value="${v}" ${PN.confirm() === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}
      </div><div class="row" style="margin-top:14px"><button class="btn" data-ok><b>Fertig</b></button></div></div>`, { onBack: () => fin() });
    const fin = () => { UL.saveSettings(); UL.Audio.vol(); UI.close(p); };
    p.el.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { const k = b.dataset.tog; S[k] = !S[k]; b.classList.toggle('on', S[k]); b.textContent = S[k] ? 'An' : 'Aus'; UL.saveSettings(); if (k === 'hints') UI.hint(UI._hint || {}); });
    p.el.querySelectorAll('[data-rng]').forEach(r => r.oninput = () => { S[r.dataset.rng] = +r.value; UL.Audio.vol(); UL.saveSettings(); });
    p.el.querySelector('[data-q]').onchange = e => { S.quality = e.target.value; UL.saveSettings(); UI.toast('Grafik wird beim nächsten Start ganz umgestellt.', '🖥️'); R.pixel = S.quality === 'low' ? 0.75 : S.quality === 'mid' ? Math.min(1.5, devicePixelRatio) : Math.min(2, devicePixelRatio); R.resize(); };
    const ps = p.el.querySelector('[data-ps]'); if (ps) ps.onchange = e => { PN.style(e.target.value); UI.drawCmd(); };
    const pc = p.el.querySelector('[data-pc]'); if (pc) pc.onchange = e => { PN.confirm(e.target.value); };
    p.el.querySelector('[data-ok]').onclick = fin;
  };

  // ---------- Steuerung ----------
  M.controls = () => {
    const rows = [
      ['Laufen', 'WASD / Pfeile', 'Linker Stick', 'Linker Stick', 'Daumen links ziehen'],
      ['Rennen', 'Shift', 'L3 (Stick drücken)', 'L-Stick drücken', 'Stick ganz außen'],
      ['Kamera', 'Maus (Klick fängt Maus)', 'Rechter Stick · L1/R1', 'Rechter Stick · L/R', 'rechts wischen'],
      ['Zoom', 'Mausrad · Z/C', 'L2 / R2', 'ZL / ZR', '–'],
      ['Aktion / Bestätigen', 'E · Leertaste · Enter', '✕', 'A (rechts)', 'grüner Knopf'],
      ['Zurück / Abbrechen', 'Rücktaste · Esc', '○', 'B (unten)', 'Zurück'],
      ['Zweite Aktion (Springen, Ducken …)', 'F', '□', 'Y (links)', '2. Knopf'],
      ['Buschtrommel (Übersicht)', 'Tab', '△', 'X (oben)', 'Menü'],
      ['Kommandomenü wählen', '1–9 · Mausklick', 'Steuerkreuz ▲▼', 'Steuerkreuz ▲▼', 'antippen'],
      ['„Ich bin raus!“ (Prüfung abbrechen)', 'H halten', 'Create halten', '− halten', 'Pause → Abbrechen'],
      ['Pause', 'Esc / P', 'Options', '+', '❚❚']
    ];
    const p = UI.open(`<div class="box wide"><h2>🎮 Steuerung</h2><p>Eine Bedienung für alle Geräte: Laufen mit Stick oder WASD, eine Aktionstaste für alles, was gerade geht, und das Kommandomenü unten links (wie in Action-Rollenspielen) für alle Möglichkeiten in der Nähe.</p>
      <div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font:600 13px system-ui">
      <tr style="color:var(--gold);text-align:left"><th style="padding:6px">Was</th><th>Tastatur & Maus</th><th>PlayStation</th><th>Nintendo Switch</th><th>Handy</th></tr>
      ${rows.map(r => `<tr style="border-top:1px solid #fff2">${r.map((c, i) => `<td style="padding:6px">${i ? esc(c) : '<b>' + esc(c) + '</b>'}</td>`).join('')}</tr>`).join('')}
      </table></div><p style="margin-top:10px">Xbox- und andere Controller funktionieren genauso (A/B/X/Y). Am Handy gehen Hoch- und Querformat.</p>
      <div class="row"><button class="btn" data-ok><b>Alles klar</b></button></div></div>`, { onBack: () => UI.close(p) });
    p.el.querySelector('[data-ok]').onclick = () => UI.close(p);
  };

  // ---------- Google-Sicherung (anmacha-cloud) ----------
  M.cloud = () => {
    const hold = document.getElementById('cloudHold'), box = document.getElementById('cloudBox');
    const p = UI.open(`<div class="box"><h2>☁️ Speichern mit Google</h2><p>Deine Staffel wird automatisch auf diesem Gerät gespeichert (jeden Morgen, nach Prüfungen und beim Verlassen). Mit Google kannst du sie zusätzlich sichern und auf anderen Geräten weiterspielen.</p><div data-mount></div><div class="row" style="margin-top:12px"><button class="btn" data-ok><b>Zurück</b></button></div></div>`, { onBack: () => fin() });
    p.el.querySelector('[data-mount]').appendChild(box); UI.refresh(p);
    const fin = () => { hold.appendChild(box); UI.close(p); };
    p.el.querySelector('[data-ok]').onclick = fin;
  };

  // ---------- Mitwirkende ----------
  M.credits = () => {
    const p = UI.open(`<div class="box"><h2>ℹ️ Mitwirkende & Lizenzen</h2>
      <p><b>Urwaldlager</b> – ein AnMaCha-Spiel für easygames. Show, Moderatoren, Camper, Sprüche und Prüfungen sind frei erfunden und angelehnt an das bekannte Format „Promis im Dschungelcamp“. Keine echten Personen, Logos oder Musik der TV-Sendung.</p>
      <h3>3D-Modelle (frei, CC0)</h3>
      <p>Figuren: <b>KayKit Adventurers</b> von Kay Lousberg (kaylousberg.com), umgefärbt zu Campern, Moderatoren und Lager-Arzt.<br>
      Möbel und Requisiten: <b>KayKit Furniture Bits</b> und <b>Dungeon Pack</b> (Kay Lousberg).<br>
      Pflanzen, Felsen, Feuerstelle, Essen: <b>Kenney Nature Kit / Food Kit</b> (kenney.nl).<br>
      Tiere: <b>Quaternius</b> (quaternius.com). Palmen, Kokospalmen, Seerosen: <b>Wizp</b> Lowpoly Stylized Fantasy Environment.</p>
      <h3>Technik</h3><p>three.js (MIT). Musik und Geräusche werden im Browser erzeugt. Details: models/LIZENZ.md.</p>
      <div class="row"><button class="btn" data-ok><b>Zurück</b></button></div></div>`, { onBack: () => UI.close(p) });
    p.el.querySelector('[data-ok]').onclick = () => UI.close(p);
  };

  // ---------- Pause ----------
  M.pause = () => {
    if (UL.paused) return;
    UL.paused = true; In.unlock(); UL.Voice.stop();
    const inTrial = !!UL.Trials.current, inSeason = !!(UL.Show && UL.Show.S);
    const p = UI.open(`<div class="box"><h2>❚❚ Pause</h2><div class="opts">
      <button class="opt" data-a="go"><b>▶ Weiter</b></button>
      ${inTrial ? `<button class="opt" data-a="quit"><b>🏳️ „${UL.D.SHOW.exit}“</b><small>Prüfung abbrechen – keine Sterne für das Camp</small></button>` : ''}
      ${inSeason && !inTrial ? `<button class="opt" data-a="drum"><b>🥁 Buschtrommel</b><small>Zuschauerstimmung, Camper, Tagebuch</small></button>` : ''}
      <button class="opt" data-a="settings"><b>⚙️ Einstellungen</b></button>
      <button class="opt" data-a="controls"><b>🎮 Steuerung</b></button>
      <button class="opt" data-a="title"><b>🏠 Speichern & zum Titel</b><small>${inSeason ? 'Weiter geht es am Morgen des aktuellen Tages.' : ''}</small></button>
      </div></div>`, { onBack: () => go(), startCloses: true });
    const go = () => { UI.close(p); UL.paused = false; };
    p.el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'go') go();
      else if (a === 'quit') { go(); const c = UL.Trials.current; if (c) { c.quit = true; c.end('quit'); } }
      else if (a === 'drum') { go(); UL.Show.drum(); }
      else if (a === 'settings') M.settings();
      else if (a === 'controls') M.controls();
      else if (a === 'title') { UL.Show.save(); UL.clearTimers(); UI.closeAll(); UL.paused = false; UL.Voice.stop(); UL.Show.S = null; UL.Trials.current = null; UL.Show.abort = true; R.set(null); M.title(); }
    });
  };
})();
