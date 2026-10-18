/* AnMaCha UNDERCOVER 3D – Figuren-Editor (Fenster).
   AMU.Editor.open({ look, name, onSave(look, name), onClose, quality, level }) → modal
   Live-3D-Vorschau mit eigenem kleinen Renderer (dreht sich langsam, rendert nur solange offen; beim Schließen wird alles freigegeben).
   Ohne WebGL: 2D-Farbfeld. level (optional) sperrt Accessoires mit höherer Stufe. Alle Auswahlen sind Knöpfe (Tastatur/Controller). */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};

  const CSS = '.ui-modal.uic-edm{padding:12px;display:flex;flex-direction:column;overflow:hidden;height:min(640px,92vh)}' +
    '.uic-ed{display:flex;gap:12px;min-height:0;flex:1}.uic-prev{position:relative;flex:0 0 40%;border-radius:12px;overflow:hidden;' +
    'background:radial-gradient(circle at 50% 40%,#24407f,#0b1630 72%);border:1px solid var(--ln);min-height:200px}' +
    '.uic-prev canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.uic-fb{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:10px}' +
    '.uic-fb .uic-fbh{width:64px;height:64px;border-radius:50%;border:3px solid #fff4}.uic-fb .uic-fbb{width:110px;height:120px;border-radius:44px 44px 22px 22px;' +
    'display:grid;place-items:center;font-size:34px;color:#04121fcc;font-weight:800;border:3px solid #fff4;margin-top:-10px}' +
    '.uic-side{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0}.uic-scroll{flex:1;overflow:auto;padding-right:4px;min-height:0}' +
    '.uic-grp{margin:8px 0 2px}.uic-grp>h3{font-size:13px;margin:0 0 4px;color:var(--mu);font-weight:600}' +
    '.uic-opts{display:flex;flex-wrap:wrap;gap:6px}.uic-opts .ui-segb{min-height:40px}.uic-opts .ui-segb[disabled]{opacity:.45;cursor:default}' +
    '.uic-sw{width:40px;height:40px;border-radius:50%;border:2px solid #ffffff44;cursor:pointer;padding:0;display:inline-grid;place-items:center;font-size:11px;color:#04121f;font-weight:700}' +
    '.uic-sw.on{outline:3px solid var(--or);outline-offset:2px;border-color:#fff}.uic-swl{display:inline-flex;flex-direction:column;align-items:center;gap:2px;font-size:11px;color:var(--mu);width:52px;text-align:center}' +
    '.uic-foot{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;padding-top:10px;border-top:1px solid #29d3ff22;margin-top:6px}' +
    '.uic-name{margin:0 44px 4px 0}' +
    '@media (max-width:700px),(orientation:portrait) and (max-width:900px){.ui-modal.uic-edm{height:calc(100vh - 20px);height:calc(100dvh - 20px - var(--sat) - var(--sab));max-height:none;width:96vw}' +
    '.uic-ed{flex-direction:column;gap:8px}.uic-prev{flex:0 0 30%;min-height:150px}.uic-foot .ui-btn{flex:1 1 auto}}';
  function css() {
    let el = document.getElementById('amu-uic-css');
    if (!el) { el = document.createElement('style'); el.id = 'amu-uic-css'; (document.head || document.documentElement).appendChild(el); }
    if (!el.dataset.ed) { el.dataset.ed = '1'; el.textContent += CSS; }
  }

  function open(opt) {
    opt = opt || {}; css();
    const C = AMU.COSMETICS, UI = AMU.UI, esc = UI.esc;
    let look = C.validLook(opt.look || C.defaultLook());
    let name = AMU.U ? AMU.U.cleanName(opt.name || '', 16) : String(opt.name || '').slice(0, 16);
    const set = AMU.Save ? AMU.Save.settings() : {};
    const aid = !!set.colorAid, rm = !!set.reduceMotion || (typeof document !== 'undefined' && document.body.classList.contains('rm'));
    const lvl = opt.level == null ? Infinity : opt.level;
    let saved = false;

    // ---------- Auswahl-HTML ----------
    const btn = (k, id, label, cur, dis) => '<button class="ui-segb' + (String(id) === String(cur) ? ' on' : '') + '" data-a="pick" data-v="' + k + ':' + esc(id) + '" aria-pressed="' + (String(id) === String(cur)) + '"' + (dis ? ' disabled' : '') + '>' + label + '</button>';
    const sw = (k, id, hex, label, cur) => {
      const b = '<button class="uic-sw' + (String(id) === String(cur) ? ' on' : '') + '" style="background:' + hex + '" data-a="pick" data-v="' + k + ':' + esc(id) + '" aria-pressed="' + (String(id) === String(cur)) + '" aria-label="' + esc(label) + '" title="' + esc(label) + '"></button>';
      return aid ? '<span class="uic-swl">' + b + esc(label) + '</span>' : b;
    };
    const grp = (k, title, inner) => '<div class="uic-grp" data-g="' + k + '" role="group" aria-label="' + esc(title) + '"><h3>' + esc(title) + '</h3><div class="uic-opts">' + inner + '</div></div>';
    const hcName = ['Schwarzbraun', 'Braun', 'Kupfer', 'Blond', 'Grau', 'Rot', 'Cyan', 'Pink'];
    const skName = ['Hell', 'Hell-warm', 'Mittel', 'Gebräunt', 'Dunkel', 'Sehr dunkel', 'Robo-Blau', 'Robo-Silber'];
    function choosers() {
      return grp('body', 'Körperbau', C.bodies.map(b => btn('body', b.id, esc(b.n), look.body)).join('')) +
        grp('skin', 'Hautton', C.skins.map((h, i) => sw('skin', i, h, skName[i] || 'Ton ' + (i + 1), look.skin)).join('')) +
        grp('color', 'Anzugfarbe', C.colors.map(c => sw('color', c.id, c.hex, c.n, look.color)).join('')) +
        grp('hair', 'Frisur', C.hair.map(h => btn('hair', h.id, esc(h.n), look.hair)).join('')) +
        grp('hairColor', 'Haarfarbe', C.hairColors.map((h, i) => sw('hairColor', h, h, hcName[i] || h, look.hairColor)).join('')) +
        grp('hat', 'Accessoire', C.hats.map(h => btn('hat', h.id, (h.lvl > lvl ? '🔒 ' : '') + esc(h.n) + (h.lvl > lvl ? ' <small>(Stufe ' + h.lvl + ')</small>' : ''), look.hat, h.lvl > lvl)).join('')) +
        grp('face', 'Gesicht', C.faces.map(f => btn('face', f.id, esc(f.n), look.face)).join(''));
    }
    const html = '<h1 class="ui-h1 uic-name">🎨 Figur gestalten</h1><div class="uic-ed"><div class="uic-prev" aria-label="Vorschau der Figur"></div><div class="uic-side">' +
      '<div class="ui-field"><label for="uic-name">Name (max. 16 Zeichen)</label><input type="text" id="uic-name" maxlength="16" autocomplete="off" spellcheck="false" value="' + esc(name) + '"></div>' +
      '<div class="uic-scroll">' + choosers() + '</div>' +
      '<div class="uic-foot"><button class="ui-btn" data-a="rand">🎲 Zufall</button><button class="ui-btn" data-a="cancel">Abbrechen</button><button class="ui-btn ui-pri" data-a="save">Speichern</button></div></div></div>';

    const m = UI.modal(html, { cls: 'wide uic-edm', on: onAct, onClose: cleanup });
    const box = m.el, prev = box.querySelector('.uic-prev'), nameEl = box.querySelector('#uic-name');
    nameEl.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });

    // ---------- Vorschau ----------
    const P = makePreview(prev, look, opt.quality || (set.quality && set.quality !== 'auto' ? set.quality : 'mid'), rm);

    function onAct(a, v) {
      if (a === 'pick' && v) {
        const i = v.indexOf(':'), k = v.slice(0, i), raw = v.slice(i + 1);
        const val = k === 'skin' ? parseInt(raw, 10) : raw;
        const nl = C.validLook(Object.assign({}, look, { [k]: val }));
        if (nl[k] !== val) return;   // ungültig/gesperrt
        if (k === 'hat') { const h = C.hats.find(x => x.id === val); if (h && h.lvl > lvl) return; }
        look = nl; mark(k); P.set(look);
      } else if (a === 'rand') {
        look = C.validLook(C.randomLook(null, lvl === Infinity ? null : lvl));
        ['body', 'skin', 'color', 'hair', 'hairColor', 'hat', 'face'].forEach(mark); P.set(look);
      } else if (a === 'cancel') m.close();
      else if (a === 'save') save();
    }
    function mark(k) {
      box.querySelectorAll('[data-g="' + k + '"] [data-a="pick"]').forEach(b => {
        const on = b.dataset.v === k + ':' + look[k]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
      });
    }
    function save() {
      const n = AMU.U ? AMU.U.cleanName(nameEl.value, 16) : nameEl.value.trim().slice(0, 16);
      if (!n) { UI.toast('Bitte gib einen Namen ein', 'warn'); nameEl.focus(); return; }
      saved = true;
      const l = C.validLook(look);
      m.close();
      if (opt.onSave) opt.onSave(l, n);
    }
    function cleanup() { P.dispose(); if (!saved && opt.onClose) opt.onClose(); }
    return m;
  }

  // 3D-Vorschau (oder 2D-Ersatz). Liefert { set(look), dispose() }
  function makePreview(host, look, quality, still) {
    const T = root.THREE, C = AMU.COSMETICS;
    let ren = null, scene, cam, actor = null, raf = 0, last = 0, dead = false, cheer = 0, ro = null, fitRef = null;
    if (T && AMU.Actors) {
      try {
        const cv = document.createElement('canvas');
        ren = new T.WebGLRenderer({ canvas: cv, antialias: quality !== 'low', alpha: true, powerPreference: 'low-power' });
        ren.setPixelRatio(Math.min(root.devicePixelRatio || 1, quality === 'low' ? 1 : 2));
        host.appendChild(cv);
        scene = new T.Scene();
        cam = new T.PerspectiveCamera(32, 1, 0.1, 50);
        scene.add(new T.HemisphereLight(0xcfe6ff, 0x1a2344, 0.9));
        const d = new T.DirectionalLight(0xffffff, 0.85); d.position.set(2, 4, 3); scene.add(d);
        const rim = new T.DirectionalLight(0x29d3ff, 0.5); rim.position.set(-3, 2, -2); scene.add(rim);
        const disc = new T.Mesh(new T.CylinderGeometry(0.75, 0.8, 0.06, 40), new T.MeshStandardMaterial({ color: 0x1b2f63, roughness: 0.8, metalness: 0.1 }));
        disc.position.y = -0.03; scene.add(disc); scene.userData.disc = disc;
        actor = AMU.Actors.create(look, { quality: quality === 'high' ? 'high' : quality === 'low' ? 'low' : 'mid' });
        scene.add(actor.root); actor.root.rotation.y = 0.5;
        frame();
      } catch (e) { cleanupGl(); ren = null; }
    }
    if (!ren) fallback(look);
    else {
      const fit = () => {
        const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
        ren.setSize(w, h, false); cam.aspect = w / h;
        const H = actor ? actor.height || 1.4 : 1.4, dist = (H * 0.62) / Math.tan(cam.fov * Math.PI / 360) * Math.max(1, 0.8 / cam.aspect);
        cam.position.set(0, H * 0.55, dist + 0.6); cam.lookAt(0, H * 0.48, 0); cam.updateProjectionMatrix();
      };
      fit();
      host._fit = fitRef = () => { fit(); if (still) frame(); };
      if (root.ResizeObserver) { ro = new root.ResizeObserver(fitRef); ro.observe(host); } else root.addEventListener('resize', fitRef);
      if (still) frame(); else raf = requestAnimationFrame(loop);   // Bewegung reduziert: nur bei Änderungen zeichnen
    }
    function frame() { actor.update(0.016, 0); ren.render(scene, cam); }
    function loop(t) {
      if (dead) return;
      raf = requestAnimationFrame(loop);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
      if (cheer > 0) { cheer -= dt; if (cheer <= 0) actor.setAnim('idle'); }
      if (!still) actor.root.rotation.y += dt * 0.6;
      actor.update(dt, 0); ren.render(scene, cam);
    }
    function fallback(l) {
      const skin = C.skins[l.skin] || C.skins[0], col = C.colorHex(l.color), cn = (C.colors.find(c => c.id === l.color) || {}).n || '';
      host.innerHTML = '<div class="uic-fb"><div class="uic-fbh" style="background:' + skin + '"></div><div class="uic-fbb" style="background:' + col + '">' +
        (C.symbols[C.colors.findIndex(c => c.id === l.color)] || '●') + '</div><small class="ui-muted">' + AMU.UI.esc(cn) + ' · 3D-Vorschau nicht verfügbar</small></div>';
    }
    function cleanupGl() {
      try { if (actor) actor.dispose(); } catch (e) { /* egal */ }
      try { const dc = scene && scene.userData.disc; if (dc) { dc.geometry.dispose(); dc.material.dispose(); } } catch (e) { /* egal */ }
      try { if (ren) { ren.dispose(); if (ren.forceContextLoss) ren.forceContextLoss(); if (ren.domElement) ren.domElement.remove(); } } catch (e) { /* egal */ }
      actor = null;
    }
    return {
      gl: !!ren,
      set(l) {
        if (dead) return;
        if (!ren) return fallback(l);
        actor.setLook(l); if (!still) { actor.setAnim('win'); cheer = 1.2; }
        if (host._fit) host._fit();   // Höhe ändert sich mit dem Körperbau
      },
      dispose() {
        if (dead) return; dead = true;
        cancelAnimationFrame(raf);
        if (ro) ro.disconnect(); else if (host._fit) root.removeEventListener('resize', fitRef);
        if (ren) cleanupGl();
      }
    };
  }

  AMU.Editor = { open };
  if (typeof module !== 'undefined' && module.exports) module.exports = AMU.Editor;
})(typeof window !== 'undefined' ? window : globalThis);
