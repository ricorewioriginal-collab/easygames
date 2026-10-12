'use strict';
/* Grafik-Diagnose (nur mit ?dbg=1 in der Adresse): zeigt Daten der Grafikkarte und lässt einzelne Dinge live ein-/ausschalten,
   um Darstellungsfehler (helle Flächen, fehlender Boden, Flackern) einzugrenzen. Nichts davon läuft im normalen Spiel. */
(function () {
  const b = window.__bi; if (!b) return; const { scene, renderer } = b, gl = renderer.getContext(), ex = gl.getExtension('WEBGL_debug_renderer_info');
  let cam = null; const orig = renderer.render.bind(renderer); renderer.render = (s, c) => { cam = c; return orig(s, c); };
  const info = () => {
    const f = scene.fog, ri = renderer.info.render, p = b.P;
    return ['GPU: ' + (ex ? gl.getParameter(ex.UNMASKED_RENDERER_WEBGL) : '?'), 'WebGL' + (renderer.capabilities.isWebGL2 ? '2' : '1') + ' (Adresse: ?gl=1 / ?gl=2 / ?aa=0)' + ' · Tiefe ' + gl.getParameter(gl.DEPTH_BITS) + ' Bit · ' + renderer.capabilities.precision + ' · Auflösung ×' + renderer.getPixelRatio().toFixed(2),
      'Nebel ' + (f ? Math.round(f.near) + '–' + Math.round(f.far) : 'aus') + ' · Kamera near ' + (cam ? cam.near.toFixed(1) : '?') + ' far ' + (cam ? cam.far : '?'), 'Zeichenaufrufe ' + ri.calls + ' · Dreiecke ' + Math.round(ri.triangles / 1000) + 'k', 'Ort ' + Math.round(p.x) + ' / ' + Math.round(p.z)].join('\n');
  };
  const box = document.createElement('div'); box.style.cssText = 'position:fixed;left:6px;top:6px;z-index:99999;background:rgba(0,0,0,.72);color:#fff;font:12px/1.35 monospace;padding:6px 8px;border-radius:8px;max-width:92vw;pointer-events:none;white-space:pre-wrap'; document.body.appendChild(box);
  const bar = document.createElement('div'); bar.style.cssText = 'position:fixed;left:6px;bottom:120px;z-index:99999;display:flex;flex-wrap:wrap;gap:5px;max-width:60vw'; document.body.appendChild(bar);
  const mats = f => { const seen = new Set(); scene.traverse(o => { if (!o.material) return; for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (!seen.has(m)) { seen.add(m); f(m, o); } }); };
  const fog0 = scene.fog, st = {};
  const T = {
    'Nebel': on => { scene.fog = on ? null : fog0; },
    'Versatz': on => { mats(m => { if (m.userData._po === undefined) m.userData._po = m.polygonOffset; m.polygonOffset = on ? false : m.userData._po; m.needsUpdate = true; }); },
    'Culling': on => { scene.traverse(o => { if (o.isMesh || o.isInstancedMesh) { if (o.userData._fc === undefined) o.userData._fc = o.frustumCulled; o.frustumCulled = on ? false : o.userData._fc; } }); },
    'Zotik': on => { const Z = BI.ZOTIK; scene.traverse(o => { if (!o.isMesh || !o.geometry) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const c = o.geometry.boundingSphere.center.clone().applyMatrix4(o.matrixWorld); if (Math.hypot(c.x - Z.x, c.z - Z.z) < Z.R * 1.6 && c.z > 300) { if (o.userData._v === undefined) o.userData._v = o.visible; o.visible = on ? false : o.userData._v; } }); },
    'Wasser': on => { if (b.W.water) b.W.water.visible = !on; if (b.W.foam) b.W.foam.visible = !on; },
    'Himmel': on => { scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius > 600) o.visible = !on; }); },
    'Nah 3': on => { if (cam) { cam.near = on ? 3 : 1.4; cam.updateProjectionMatrix(); } },
  };
  for (const k of Object.keys(T)) { const btn = document.createElement('button'); btn.textContent = k + ': normal'; btn.style.cssText = 'font:700 13px system-ui;padding:6px 9px;border-radius:10px;border:0;background:#fff;color:#123'; btn.onclick = () => { st[k] = !st[k]; T[k](st[k]); btn.textContent = k + (st[k] ? ': AUS/ANDERS' : ': normal'); btn.style.background = st[k] ? '#ffb400' : '#fff'; }; bar.appendChild(btn); }
  setInterval(() => { box.textContent = info(); }, 500);
})();
