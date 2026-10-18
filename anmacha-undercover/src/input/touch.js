/* AnMaCha UNDERCOVER 3D – Touch-Steuerung: schwebender Stick links, runde Aktionsknöpfe rechts (Pointer Events, Multi-Touch).
   AMU.Touch.create(container, { onAction(id, phase), onAxis(x, y), zoneTop }) → t
     t.setButtons([{ id, label, icon, enabled, cd, primary }]) (max. 6), t.axis() → {x, y}, t.show(bool), t.bind(fn), t.destroy()
   Mit AMU.Input: inp.attachTouch(t) – dann gehen Knöpfe über inp (onAction von Input), der Stick wird über t.axis() gelesen.
   AMU.Touch.isTouch() → true auf Touch-Geräten. */
(function (root) {
  'use strict';
  const AMU = root.AMU = root.AMU || {};
  const R = 56, DEAD = 0.12, MAXB = 6;

  const CSS = `
.amu-t-layer{position:absolute;inset:0;pointer-events:none;z-index:40;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;
 -webkit-tap-highlight-color:transparent;font:600 10px/1.1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#e8f1ff}
.amu-t-layer.amu-t-fix{position:fixed}
.amu-t-layer[hidden]{display:none}
.amu-t-zone{position:absolute;left:0;bottom:0;width:45%;top:var(--amu-t-top,22%);pointer-events:auto;touch-action:none}
.amu-t-base,.amu-t-knob{position:absolute;left:0;top:0;border-radius:50%;pointer-events:none;will-change:transform}
.amu-t-base{width:${R * 2}px;height:${R * 2}px;margin:-${R}px 0 0 -${R}px;background:radial-gradient(#0b163088,#13224acc);
 border:2px solid #29d3ff66;box-shadow:0 0 18px #29d3ff33,inset 0 0 18px #0008;opacity:0;transition:opacity .15s}
.amu-t-knob{width:52px;height:52px;margin:-26px 0 0 -26px;background:radial-gradient(circle at 35% 30%,#7fe6ff,#29d3ff 45%,#0f6f99);
 border:2px solid #c9f4ff;box-shadow:0 0 14px #29d3ffaa;opacity:0;transition:opacity .15s}
.amu-t-act .amu-t-base{opacity:1}.amu-t-act .amu-t-knob{opacity:.95}
.amu-t-idle .amu-t-base{opacity:.35}.amu-t-idle .amu-t-knob{opacity:.4}
.amu-t-pad{position:absolute;right:calc(16px + env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));width:0;height:0}
.amu-t-btn{position:absolute;left:0;top:0;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;box-sizing:border-box;pointer-events:auto;
 touch-action:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;overflow:hidden;cursor:pointer;
 background:linear-gradient(160deg,#1b2f63e6,#0b1630e6);border:2px solid #29d3ff77;box-shadow:0 0 12px #29d3ff33,inset 0 0 12px #0007;
 transition:scale .08s,filter .15s,opacity .15s}
.amu-t-btn.amu-t-pri{width:76px;height:76px;margin:-38px 0 0 -38px;border-color:#ffb24d;background:linear-gradient(160deg,#4a3010ee,#1b1306ee);
 box-shadow:0 0 16px #ff9a2e66,inset 0 0 14px #0007}
.amu-t-ic{font-size:22px;line-height:1;position:relative;z-index:1}
.amu-t-pri .amu-t-ic{font-size:30px}
.amu-t-lb{max-width:52px;font-size:9.5px;letter-spacing:-.1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;position:relative;z-index:1;text-shadow:0 1px 2px #000}
.amu-t-pri .amu-t-lb{max-width:66px;font-size:12px;color:#ffe2bd}
.amu-t-cd{position:absolute;inset:0;border-radius:50%;pointer-events:none;
 background:conic-gradient(#000a calc(var(--cd,0) * 1turn),#0000 0)}
.amu-t-on{scale:.9;filter:brightness(1.35)}
.amu-t-off{opacity:.42;filter:grayscale(.85)}
@media (orientation:landscape) and (max-height:430px){.amu-t-pad{bottom:calc(10px + env(safe-area-inset-bottom,0px))}}`;

  function isTouch() {
    try {
      if (root.matchMedia && root.matchMedia('(pointer:coarse)').matches) return true;
      return !!(root.navigator && root.navigator.maxTouchPoints > 0);
    } catch (e) { return false; }
  }

  // Positionen relativ zur Mitte des Hauptknopfs: innerer Bogen (r 96, links → oben), ab 4 Knöpfen äußerer Bogen (r 164)
  const pt = (deg, r) => [Math.cos(deg * Math.PI / 180) * r, Math.sin(deg * Math.PI / 180) * r];
  function slots(n) {
    const inner = [[], [225], [195, 255], [180, 225, 270]][Math.min(n, 3)], outer = [[], [225], [202.5, 247.5]][Math.max(0, n - 3)];
    return inner.map(d => pt(d, 96)).concat(outer.map(d => pt(d, 164)));
  }

  function create(container, opts) {
    opts = opts || {};
    const doc = root.document;
    if (!doc || !container) return { setButtons() {}, axis: () => ({ x: 0, y: 0 }), show() {}, bind() {}, destroy() {}, el: null };
    if (!doc.getElementById('amu-touch-css')) {
      const s = doc.createElement('style'); s.id = 'amu-touch-css'; s.textContent = CSS; (doc.head || doc.documentElement).appendChild(s);
    }
    const layer = doc.createElement('div');
    layer.className = 'amu-t-layer' + (container === doc.body ? ' amu-t-fix' : '');
    if (opts.zoneTop) layer.style.setProperty('--amu-t-top', opts.zoneTop);
    layer.innerHTML = '<div class="amu-t-zone amu-t-idle"><div class="amu-t-base"></div><div class="amu-t-knob"></div></div><div class="amu-t-pad"></div>';
    container.appendChild(layer);
    const zone = layer.firstChild, base = zone.children[0], knob = zone.children[1], pad = layer.lastChild;
    let joyId = null, ox = 0, oy = 0, ax = 0, ay = 0, bound = null, dead = false;
    const btns = new Map();   // id -> { el, cfg, pid }

    function emit(id, phase) {
      const f = bound || opts.onAction;
      if (f) { try { f(id, phase); } catch (e) { if (root.console) console.error(e); } }
    }
    function setAxis(x, y) {
      if (x === ax && y === ay) return;
      ax = x; ay = y;
      if (opts.onAxis) { try { opts.onAxis(x, y); } catch (e) { if (root.console) console.error(e); } }
    }
    function place(el, x, y) { el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; }
    function idlePos() {
      const r = zone.getBoundingClientRect();
      ox = Math.min(r.width - R - 8, Math.max(R + 16, r.width * 0.42));
      oy = Math.max(R + 8, r.height - R - 28);
      place(base, ox, oy); place(knob, ox, oy);
    }

    // ---------- Stick ----------
    function jDown(e) {
      if (joyId !== null || dead) return;
      e.preventDefault();
      joyId = e.pointerId;
      try { zone.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
      const r = zone.getBoundingClientRect();
      ox = Math.min(r.width - R - 4, Math.max(R + 4, e.clientX - r.left));
      oy = Math.min(r.height - R - 4, Math.max(R + 4, e.clientY - r.top));
      zone.classList.add('amu-t-act'); zone.classList.remove('amu-t-idle');
      place(base, ox, oy); jMove(e);
    }
    function jMove(e) {
      if (e.pointerId !== joyId) return;
      e.preventDefault();
      const r = zone.getBoundingClientRect();
      let dx = e.clientX - r.left - ox, dy = e.clientY - r.top - oy;
      const m = Math.hypot(dx, dy);
      if (m > R) { dx *= R / m; dy *= R / m; }
      place(knob, ox + dx, oy + dy);
      const n = Math.min(1, m / R);
      if (n < DEAD) setAxis(0, 0);
      else { const k = (n - DEAD) / (1 - DEAD) / (Math.hypot(dx, dy) || 1); setAxis(+(dx * k).toFixed(3), +(dy * k).toFixed(3)); }
    }
    function jUp(e) {
      if (e.pointerId !== joyId) return;
      joyId = null; setAxis(0, 0);
      zone.classList.remove('amu-t-act'); zone.classList.add('amu-t-idle');
      idlePos();
    }

    // ---------- Knöpfe ----------
    function bDown(e) {
      const el = e.target.closest && e.target.closest('.amu-t-btn'); if (!el || dead) return;
      const b = btns.get(el.dataset.id); if (!b) return;
      e.preventDefault();
      if (b.pid !== null || b.cfg.enabled === false) return;
      b.pid = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
      el.classList.add('amu-t-on');
      emit(b.cfg.id, 'down');
    }
    function bUp(e) {
      for (const b of btns.values()) if (b.pid === e.pointerId) release(b);
    }
    function release(b) {
      if (b.pid === null) return;
      b.pid = null; b.el.classList.remove('amu-t-on');
      emit(b.cfg.id, 'up');
    }
    function setButtons(list) {
      list = (list || []).filter(c => c && c.id != null).slice(0, MAXB);
      const pri = list.find(c => c.primary) || list[0], rest = list.filter(c => c !== pri), pos = slots(rest.length), keep = new Set();
      list.forEach(c => {
        const id = String(c.id); keep.add(id);
        let b = btns.get(id);
        if (!b) {
          const el = doc.createElement('div');
          el.className = 'amu-t-btn'; el.dataset.id = id; el.setAttribute('role', 'button');
          el.innerHTML = '<span class="amu-t-ic"></span><span class="amu-t-lb"></span><span class="amu-t-cd"></span>';
          pad.appendChild(el);
          b = { el, cfg: c, pid: null, k: '' };
          btns.set(id, b);
        }
        b.cfg = c;
        const p = c === pri ? [-38, -38] : [pos[rest.indexOf(c)][0] - 38, pos[rest.indexOf(c)][1] - 38];   // Mitte Hauptknopf = (-38, -38)
        const cd = Math.max(0, Math.min(1, +c.cd || 0)), off = c.enabled === false;
        const k = [c.icon, c.label, off, c === pri, cd.toFixed(3), p[0].toFixed(1), p[1].toFixed(1)].join('|');
        if (k === b.k) return;   // unverändert: kein DOM-Zugriff
        b.k = k;
        b.el.children[0].textContent = c.icon || '';
        b.el.children[1].textContent = c.label || '';
        b.el.setAttribute('aria-label', c.label || id);
        b.el.setAttribute('aria-disabled', off ? 'true' : 'false');
        b.el.classList.toggle('amu-t-pri', c === pri);
        b.el.classList.toggle('amu-t-off', off);
        b.el.style.setProperty('--cd', cd.toFixed(3));
        b.el.children[2].style.display = cd > 0 ? '' : 'none';
        place(b.el, p[0], p[1]);
        if (off) release(b);
      });
      for (const [id, b] of btns) if (!keep.has(id)) { release(b); b.el.remove(); btns.delete(id); }
    }

    function show(on) {
      layer.hidden = !on;
      if (!on) { if (joyId !== null) jUp({ pointerId: joyId }); for (const b of btns.values()) release(b); }
      else idlePos();
    }
    function noMenu(e) { e.preventDefault(); }
    function onResize() { if (joyId === null && !layer.hidden) idlePos(); }

    zone.addEventListener('pointerdown', jDown);
    zone.addEventListener('pointermove', jMove);
    zone.addEventListener('pointerup', jUp);
    zone.addEventListener('pointercancel', jUp);
    zone.addEventListener('lostpointercapture', jUp);
    pad.addEventListener('pointerdown', bDown);
    pad.addEventListener('pointerup', bUp);
    pad.addEventListener('pointercancel', bUp);
    pad.addEventListener('lostpointercapture', bUp);
    layer.addEventListener('contextmenu', noMenu);
    root.addEventListener('resize', onResize);
    idlePos();

    return {
      el: layer,
      setButtons,
      axis: () => ({ x: ax, y: ay }),
      show,
      bind(fn) { bound = typeof fn === 'function' ? fn : null; },
      destroy() {
        if (dead) return;
        show(false); dead = true;
        zone.removeEventListener('pointerdown', jDown); zone.removeEventListener('pointermove', jMove);
        zone.removeEventListener('pointerup', jUp); zone.removeEventListener('pointercancel', jUp); zone.removeEventListener('lostpointercapture', jUp);
        pad.removeEventListener('pointerdown', bDown); pad.removeEventListener('pointerup', bUp);
        pad.removeEventListener('pointercancel', bUp); pad.removeEventListener('lostpointercapture', bUp);
        layer.removeEventListener('contextmenu', noMenu);
        root.removeEventListener('resize', onResize);
        layer.remove(); btns.clear(); bound = null;
      }
    };
  }

  AMU.Touch = { create, isTouch };
})(typeof window !== 'undefined' ? window : globalThis);
