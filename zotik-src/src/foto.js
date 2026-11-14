/* Erinnerungslinse (Fotomodus): freie Kamera, Filter, Posen, Rahmen, Speichern/Teilen. Freigeschaltet am Ende von Kapitel 2 (S.lens).
   Das Spiel steht still (nur Figuren und Welt-Animationen laufen). Bedienung wie überall: Touch (ziehen = drehen, zwei Finger = zoomen/schieben),
   Maus (ziehen, Rad, Shift/rechts = schieben), Tastatur (WASD, Pfeile, Q/E, Enter), Controller (Sticks, A Foto, B zurück, X Pose, Y Rahmen, LB/RB Filter).
   Ein Echo-Zeichen (Forscherzeichen) im Bild wird beim Auslösen eingesammelt. */

const FILT = [['Original', ''], ['Warm', 'sepia(.25) saturate(1.25) hue-rotate(-10deg) contrast(1.05)'], ['Kühl', 'hue-rotate(14deg) saturate(1.1) brightness(1.03) contrast(1.05)'],
  ['Schwarzweiß', 'grayscale(1) contrast(1.15)'], ['Retro', 'sepia(.7) contrast(1.1) brightness(.95)'], ['Traum', 'saturate(1.35) brightness(1.1) contrast(.9)'], ['Nacht', 'brightness(.8) contrast(1.2) saturate(.9) sepia(.3) hue-rotate(170deg)']];
const FRAMES = ['Ohne', 'Kino', 'Polaroid', 'Siegel'];
const HOME = 'https://ricorewioriginal-collab.github.io/easygames/zotik/';
const CSS = `body.photo>*:not(#photo):not(#phRes):not(#toast):not(#cv):not(script):not(style){display:none!important}
#photo{position:fixed;inset:0;z-index:99999;touch-action:none;user-select:none;-webkit-user-select:none;font:600 14px system-ui,sans-serif;color:#fff}
#photo .pg{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.4%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.7%),linear-gradient(0deg,transparent 33.2%,rgba(255,255,255,.35) 33.3%,transparent 33.4%,transparent 66.5%,rgba(255,255,255,.35) 66.6%,transparent 66.7%)}
#photo .pk{position:absolute;inset:0;pointer-events:none}#photo .pk i{position:absolute;left:0;right:0;height:11%;background:#000}#photo .pk i:first-child{top:0}#photo .pk i:last-child{bottom:0}
#photo .pb{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}
#photo .pr{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:0 12px;pointer-events:auto}
#photo button{font:inherit;color:#fff;background:rgba(18,14,36,.72);border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:9px 14px;min-height:42px;backdrop-filter:blur(6px);cursor:pointer}
#photo button:active{transform:scale(.96)}#photo .sh{width:76px;height:76px;min-height:76px;padding:0;font-size:32px;border:4px solid #fff;background:rgba(255,255,255,.22)}
#photo .px{position:absolute;top:calc(12px + env(safe-area-inset-top));right:12px;pointer-events:auto}#photo .ph{position:absolute;top:calc(14px + env(safe-area-inset-top));left:14px;right:70px;font-size:12px;opacity:.8;text-shadow:0 1px 3px #000;pointer-events:none}
#photo.hid .pr,#photo.hid .ph{display:none}#photo .fl{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .25s}
#phRes{position:fixed;inset:0;z-index:100000;background:rgba(6,4,16,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px;color:#fff;font:600 14px system-ui,sans-serif}
#phRes[hidden]{display:none}#phRes img{max-width:min(94vw,900px);max-height:68vh;border-radius:10px;box-shadow:0 8px 40px #000}#phRes .pr{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
#phRes button{font:inherit;color:#fff;background:#4a3a9a;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:11px 20px;min-height:44px;cursor:pointer}`;

export function createFoto(C) {
  const { T, cv } = C;
  const S = () => C.S();
  let on = false, root = null, res = null, yaw = 0, pitch = .3, dist = 6, ox = 0, oy = 0, oz = 0, fi = 0, fr = 0, grid = false, pose = -1, hid = false, last = 0, blob = null, url = '', prevP = null;
  const keys = {}, ptr = new Map(), pad = { prev: [] };
  const $ = id => document.getElementById(id);
  let styled = false;
  function style() { if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s) }
  const poses = () => [{ id: '', icon: '🧍', name: 'Stehen' }].concat(C.poses());
  const lbl = () => {
    if (!root) return; const p = poses()[pose + 1] || poses()[0];
    root.querySelector('[data-k=f]').textContent = '🎨 ' + FILT[fi][0]; root.querySelector('[data-k=p]').textContent = p.icon + ' ' + p.name;
    root.querySelector('[data-k=r]').textContent = '🖼️ ' + FRAMES[fr]; root.querySelector('[data-k=g]').textContent = grid ? '▦ Raster an' : '▦ Raster';
    cv.style.filter = FILT[fi][1] || ''; root.querySelector('.pg').style.display = grid ? '' : 'none'; root.querySelector('.pk').style.display = fr === 1 ? '' : 'none';
  };
  const nextF = d => { fi = (fi + d + FILT.length) % FILT.length; C.sfx('ui'); lbl() };
  const nextP = () => { const l = poses(); pose = (pose + 2) % l.length - 1; C.pose(pose < 0 ? '' : l[pose + 1].id); C.sfx('ui'); lbl() };
  const nextR = () => { fr = (fr + 1) % FRAMES.length; C.sfx('ui'); lbl() };
  function build() {
    style(); root = document.createElement('div'); root.id = 'photo';
    root.innerHTML = `<div class="pg"></div><div class="pk"><i></i><i></i></div><div class="fl"></div><div class="ph">📷 Ziehen: drehen · zwei Finger: zoomen/schieben · Auslöser: Foto. Ein Echo-Zeichen im Bild wird eingesammelt.</div>
<div class="px"><button data-k="x" aria-label="Linse schließen">✕</button></div>
<div class="pb"><div class="pr"><button data-k="f"></button><button data-k="p"></button><button data-k="r"></button><button data-k="g"></button><button data-k="h">👁</button></div><div class="pr"><button class="sh" data-k="s" aria-label="Foto aufnehmen">📸</button></div></div>`;
    document.body.appendChild(root);
    root.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (!b) return; e.stopPropagation(); ({ f: () => nextF(1), p: nextP, r: nextR, g: () => { grid = !grid; lbl() }, h: () => { hid = !hid; root.classList.toggle('hid', hid) }, s: shoot, x: close })[b.dataset.k]() });
    root.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; ptr.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey }); try { root.setPointerCapture(e.pointerId) } catch (_) { } });
    root.addEventListener('pointermove', e => {
      const p = ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (ptr.size === 2) { const [a, b] = [...ptr.values()], d0 = Math.hypot(a.x - b.x, a.y - b.y); p.x = e.clientX; p.y = e.clientY; const [c, d] = [...ptr.values()], d1 = Math.hypot(c.x - d.x, c.y - d.y); dist *= d0 / (d1 || d0); pan(-dx * .01 * .5, dy * .01 * .5, true); return }
      p.x = e.clientX; p.y = e.clientY; if (p.b === 2 || p.b === 1 || p.sh) pan(-dx * .02, dy * .02, true); else { yaw -= dx * .006; pitch += dy * .005 }
    });
    const up = e => ptr.delete(e.pointerId); root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    root.addEventListener('wheel', e => { dist *= 1 + e.deltaY * .001; e.preventDefault() }, { passive: false });
    root.addEventListener('contextmenu', e => e.preventDefault());
    res = document.createElement('div'); res.id = 'phRes'; res.hidden = true; res.innerHTML = '<img alt="Foto"><div class="pr"><button data-r="s">📤 Teilen</button><button data-r="d">💾 Speichern</button><button data-r="c">Weiter fotografieren</button></div><div style="font-size:12px;opacity:.75">Am Handy: Bild lange drücken zum Speichern</div>';
    document.body.appendChild(res); res.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b) ({ s: share, d: save, c: closeRes })[b.dataset.r]() });
  }
  /* Schieben relativ zur Blickrichtung (rechts/vorwärts) bzw. Höhe */
  function pan(sx, sy, drag) {
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    if (drag) { oy += sy; ox += rx * sx; oz += rz * sx } else { ox += rx * sx + fx * sy; oz += rz * sx + fz * sy }
  }
  function open() {
    if (on) return true; if (!S().lens) { C.toast('🔒 Die Erinnerungslinse bekommst du am Ende von Kapitel 2'); return false }
    if (!C.canOpen()) return false; C.closeMenu(); on = true; yaw = C.camYaw(); pitch = .3; dist = 6; ox = oy = oz = 0; hid = false; pose = -1; grid = false;
    if (!root) build(); root.hidden = false; root.classList.remove('hid'); document.body.classList.add('photo'); C.pl.mv = 0; lbl(); C.sfx('ui');
    addEventListener('keydown', onKey, true); addEventListener('keyup', onUp, true); return true;
  }
  function close() {
    if (!on) return; on = false; closeRes(); C.pose(''); cv.style.filter = ''; document.body.classList.remove('photo'); if (root) root.hidden = true; ptr.clear();
    removeEventListener('keydown', onKey, true); removeEventListener('keyup', onUp, true); for (const k in keys) keys[k] = false; C.snapCam(); C.sfx('ui');
  }
  const resOpen = () => res && !res.hidden;
  function closeRes() { if (res) res.hidden = true; if (url) { URL.revokeObjectURL(url); url = '' } blob = null }
  function onUp(e) { if (!on) return; keys[e.code] = false; e.stopImmediatePropagation() }
  function onKey(e) {
    if (!on) return; if (e.ctrlKey || e.metaKey || e.altKey) return; e.stopImmediatePropagation(); e.preventDefault(); keys[e.code] = true; if (e.repeat) return;
    const c = e.code; if (resOpen()) { if (c === 'Escape' || c === 'Enter' || c === 'Backspace') closeRes(); return }
    if (c === 'Escape' || c === 'KeyP' || c === 'Backspace') close(); else if (c === 'Enter' || c === 'Space') shoot(); else if (c === 'KeyF') nextF(1); else if (c === 'KeyG') nextP(); else if (c === 'KeyR') nextR();
    else if (c === 'KeyT') { grid = !grid; lbl() } else if (c === 'KeyH') { hid = !hid; root.classList.toggle('hid', hid) }
  }
  function padPoll(dt) {
    let g = null; try { g = [...navigator.getGamepads()].find(Boolean) } catch (_) { } if (!g) return; const B = i => !!(g.buttons[i] && g.buttons[i].pressed), pr = pad.prev, edge = i => B(i) && !pr[i];
    const ax = (i) => { const v = g.axes[i] || 0; return Math.abs(v) < .18 ? 0 : v };
    if (!resOpen()) { pan(ax(0) * dt * 6, -ax(1) * dt * 6); yaw -= ax(2) * dt * 2.2; pitch += ax(3) * dt * 1.6; dist *= 1 + ((g.buttons[6] ? g.buttons[6].value : 0) - (g.buttons[7] ? g.buttons[7].value : 0)) * dt * -1.2 }
    if (resOpen()) { if (edge(0) || edge(1)) closeRes() } else { if (edge(0)) shoot(); if (edge(1) || edge(9)) close(); if (edge(2)) nextP(); if (edge(3)) nextR(); if (edge(4)) nextF(-1); if (edge(5)) nextF(1) }
    pr.length = 0; for (let i = 0; i < 12; i++) pr[i] = B(i);
  }
  function tick(dt) {
    if (!on) return; padPoll(dt);
    if (!resOpen()) {
      const k = keys, s = dt * 7; pan(((k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0)) * s, ((k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0)) * s);
      yaw += ((k.ArrowLeft ? 1 : 0) - (k.ArrowRight ? 1 : 0)) * dt * 1.8; pitch += ((k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0)) * dt * 1.2; oy += ((k.KeyE ? 1 : 0) - (k.KeyQ ? 1 : 0)) * dt * 3;
      dist *= 1 + ((k.PageDown || k.Minus || k.NumpadSubtract ? 1 : 0) - (k.PageUp || k.Equal || k.NumpadAdd ? 1 : 0)) * dt * 1.2;
    }
    pitch = Math.max(-.15, Math.min(1.45, pitch)); dist = Math.max(1.6, Math.min(24, dist)); oy = Math.max(-1.2, Math.min(7, oy));
    const pl = C.pl, r = 28, L = Math.hypot(ox, oz); if (L > r) { ox *= r / L; oz *= r / L }
    C.animate(dt);
    const fx = pl.x + ox, fy = pl.y + 1.4 + oy, fz = pl.z + oz, cp = Math.cos(pitch), cam = C.camera;
    let cx = fx + Math.sin(yaw) * cp * dist, cy = fy + Math.sin(pitch) * dist, cz = fz + Math.cos(yaw) * cp * dist; const gh = C.hgt(cx, cz) + .5; if (cy < gh) cy = gh;
    cam.position.set(cx, cy, cz); cam.lookAt(fx, fy, fz);
  }
  const worldTxt = () => C.worldName();
  /* Auslöser: sofort rendern, Bild samt Filter und Rahmen in ein 2D-Bild schreiben */
  function shoot() {
    if (!on || resOpen() || performance.now() - last < 400) return; last = performance.now();
    const hidUI = root.classList.contains('hid'); root.classList.add('hid'); const got = C.shot(C.camera);
    C.render(); const w = cv.width, h = cv.height, F = FILT[fi][1], padV = fr === 2 ? Math.round(w * .035) : 0, bot = fr === 2 ? Math.round(w * .11) : 0;
    const o = document.createElement('canvas'); o.width = w + padV * 2; o.height = h + padV + (fr === 2 ? bot : 0); const x = o.getContext('2d');
    if (fr === 2) { x.fillStyle = '#f6f2ea'; x.fillRect(0, 0, o.width, o.height) }
    let okF = true; if (F) { if ('filter' in x) x.filter = F; else okF = false }
    x.drawImage(cv, padV, padV, w, h); x.filter = 'none';
    if (fr === 1) { x.fillStyle = '#000'; const b = Math.round(h * .11); x.fillRect(padV, padV, w, b); x.fillRect(padV, padV + h - b, w, b) }
    const d = new Date(), ds = d.toLocaleDateString('de-DE'), fs = Math.round(w * .022);
    if (fr === 2) { x.fillStyle = '#3a2f55'; x.font = `600 ${Math.round(w * .03)}px Georgia,serif`; x.textAlign = 'center'; x.fillText(worldTxt() + ' · ' + ds, o.width / 2, padV + h + bot * .62) }
    else if (fr === 3) { x.fillStyle = 'rgba(14,10,30,.62)'; x.fillRect(0, h - fs * 2.6, w, fs * 2.6); x.fillStyle = '#ffe8a0'; x.font = `700 ${fs}px system-ui,sans-serif`; x.textAlign = 'left'; x.fillText('ZOTIK · ' + worldTxt(), fs, h - fs * .9); x.textAlign = 'right'; x.fillStyle = '#fff'; x.fillText(ds, w - fs, h - fs * .9) }
    root.classList.toggle('hid', hidUI);
    const f = root.querySelector('.fl'); f.style.transition = 'none'; f.style.opacity = '.9'; requestAnimationFrame(() => { f.style.transition = 'opacity .35s'; f.style.opacity = '0' });
    C.sfx('chest'); S().foto = (S().foto | 0) + 1; C.saveGame(true);
    o.toBlob(b => { if (!b) { C.toast('Foto konnte nicht erstellt werden'); return } blob = b; url = URL.createObjectURL(b); res.querySelector('img').src = url; res.hidden = false; if (!okF) C.toast('Hinweis: Dieser Browser brennt den Filter nicht ins Bild ein'); if (got) C.toast('🔎 Echo-Zeichen fotografiert!') }, 'image/jpeg', .92);
  }
  const fname = () => 'zotik-' + Date.now() + '.jpg';
  async function share() {
    if (!blob) return; const file = new File([blob], fname(), { type: 'image/jpeg' }), data = { files: [file], title: 'Zotik', text: 'Mein Moment in Zotik – ' + worldTxt() + ' · ' + HOME };
    try { if (navigator.canShare && navigator.canShare(data)) { await navigator.share(data); return } } catch (e) { if (e && e.name === 'AbortError') return }
    save();
  }
  function save() { if (!blob) return; const a = document.createElement('a'); a.href = url; a.download = fname(); document.body.appendChild(a); a.click(); a.remove(); C.toast('💾 Foto gespeichert (Downloads)') }
  return { open, close, tick, get on() { return on } };
}
