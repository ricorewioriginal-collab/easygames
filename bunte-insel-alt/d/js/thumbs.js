'use strict';
/* Bunte Insel – Vorschaubilder: statt Emoji-Symbolen zeigen Auswahl-Knöpfe (Frisuren, Kleidung, Bauteile, Blöcke, Haustiere …) ein kleines
   3D-Bild des echten Teils. Gerendert wird mit EINEM kleinen Extra-Renderer (128×128), erst wenn ein Reiter wirklich angezeigt wird, eines pro
   Takt (kein Ruckeln), danach als Bild im Speicher zwischengelagert (jedes Bild nur einmal pro Sitzung). Fällt WebGL aus, bleibt das Emoji stehen. */
BI.Thumb = (function () {
  const SZ = 128, T = {}, cache = new Map(), queue = []; let R = null, S = null, cam = null, ok = true, busy = false;
  function init() {
    try {
      R = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(SZ, SZ, false); R.setClearColor(0x000000, 0);
      S = new THREE.Scene(); S.add(new THREE.HemisphereLight(0xffffff, 0x9fb4d0, .95)); const d = new THREE.DirectionalLight(0xffffff, .7); d.position.set(3, 6, 5); S.add(d); cam = new THREE.PerspectiveCamera(28, 1, .05, 200);
    } catch (e) { ok = false; R = null; }
  }
  const free = o => o.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material && c.material !== BI.mat() && c.material.dispose) c.material.dispose(); });
  /* obj rendern: region = Höhenbereich [von, bis] in Metern (z. B. Kopf), ohne Region wird alles eingepasst; az/el = Blickwinkel */
  T.render = function (obj, region, az, el) {
    if (!R && ok) init(); if (!ok) return null;
    S.add(obj); obj.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(obj), sz = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3());
    const y0 = region ? region[0] : bb.min.y, y1 = region ? region[1] : bb.max.y, h = Math.max(y1 - y0, .0001), cy = (y0 + y1) / 2;
    const rad = region ? Math.max(h, Math.min(sz.x, sz.z) * .8) * .62 : Math.max(sz.x, sz.y, sz.z) * .62, dist = rad / Math.tan(cam.fov * Math.PI / 360) * 1.08, a = az == null ? .45 : az, e = el == null ? .28 : el;
    cam.position.set(c.x + Math.sin(a) * Math.cos(e) * dist, cy + Math.sin(e) * dist, c.z + Math.cos(a) * Math.cos(e) * dist); cam.lookAt(c.x, cy, c.z); cam.updateProjectionMatrix();
    R.render(S, cam); const url = R.domElement.toDataURL('image/png'); S.remove(obj); free(obj); return url;
  };
  /* Bild für einen Schlüssel holen (zwischengespeichert); produce() liefert ein fertiges Bild (Daten-URL) */
  T.get = (key, produce) => { if (cache.has(key)) return cache.get(key); let u = null; try { u = produce(); } catch (e) { u = null; } if (u) cache.set(key, u); return u; };
  /* Knopf mit Bild: img erscheint, sobald das Bild fertig ist (nacheinander, je ein Takt) */
  T.attach = function (btn, key, produce) { btn._th = { key, produce, done: false }; };
  /* Nur sichtbare Knöpfe werden gerendert; die Knöpfe des gerade gezeigten Reiters kommen zuerst */
  T.load = function (root) {
    const add = []; for (const b of (root || document).querySelectorAll('.th')) { const t = b._th; if (!t || t.done || !b.offsetParent) continue; const i = queue.indexOf(b); if (i >= 0) queue.splice(i, 1); add.push(b); }
    queue.unshift(...add); if (!busy && queue.length) { busy = true; setTimeout(step, 0); }
  };
  function step() {
    const b = queue.shift(); if (!b) { busy = false; return; }
    const t = b._th; if (t && !t.done && b.isConnected && b.offsetParent) { const u = T.get(t.key, t.produce); if (u) { const im = b.querySelector('img'); if (im) { im.src = u; b.classList.add('ready'); } } t.done = true; }
    if (queue.length) setTimeout(step, 4); else busy = false;
  }
  /* Knopf bauen: Vorschau-Bild (zuerst Emoji als Platzhalter) + Beschriftung */
  T.button = function (cls, fallback, label) {
    const b = document.createElement('button'); b.className = (cls || 'hat') + ' th'; const w = document.createElement('span'), im = document.createElement('img'); w.className = 'tw'; w.textContent = fallback || ''; im.alt = ''; im.draggable = false; w.appendChild(im); b.appendChild(w);
    if (label) { const s = document.createElement('small'); s.textContent = label; b.appendChild(s); } return b;
  };
  return T;
})();
