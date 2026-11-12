// Bildtafel: Spielfiguren, NPCs und Taschis in Nahaufnahme (für Optik-Vergleiche).
// Run: node tests/e2e/portraits.mjs <screenshot-dir> [name]
import { startSeeded } from './helpers.mjs';
const dir = process.argv[2], name = process.argv[3] || 'portraits';
const t = await startSeeded({ width: 1280, height: 1040 }, () => {});
const { page, close, errors } = t;
try {
  await page.evaluate(async () => {
    const { PLAYER_PRESETS, lookForRole } = await import('./src/engine/characters.js');
    const g = window.__taschi, p = g.preview;
    const shot = (show, face) => {
      p.renderer.setSize(256, 256, false); p.camera.aspect = 1; p.camera.updateProjectionMatrix();
      const m = show(); m.root ? (m.root.rotation.y = 0.35) : 0; m.update?.(0.016);
      if (face) { face.ch.root.updateMatrixWorld(true); const top = new THREE.Box3().setFromObject(face.ch.root).max.y; p.camera.position.set(0.25, top - 0.12, 1.25); p.camera.lookAt(0, top - 0.3, 0); }
      p.renderer.render(p.scene, p.camera); const url = p.canvas.toDataURL('image/png'); p.clearModel(); return url;
    };
    const looks = [PLAYER_PRESETS.m, PLAYER_PRESETS.w, PLAYER_PRESETS.d, lookForRole('kind', 'Pia'), lookForRole('forscher', 'Ole'), lookForRole('haendler', 'Kai'), lookForRole('nurse', 'Lea'), lookForRole('grunt', 'X'), lookForRole('professor', 'Linde'), lookForRole('familie', 'Oma')];
    const mons = ['glutzahn', 'plaetscher', 'samenling', 'fellino', 'blitzi', 'flatterling', 'pilzling', 'form_0_0', 'form_6_12', 'zotik'];
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#e8eef4;display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:4px;overflow:hidden';
    for (const l of looks) { const img = new Image(); const f = {}; img.src = shot(() => { const ch = p.showCharacter(l); f.ch = ch; return { root: ch.root, update: (dt) => ch.update(dt) }; }, f); img.style.width = '100%'; wrap.append(img); }
    for (const id of mons) { const img = new Image(); img.src = shot(() => p.showCreature(id)); img.style.width = '100%'; wrap.append(img); }
    document.body.append(wrap);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: dir + '/' + name + '.png' });
  console.log('portraits ok', errors.length ? errors : '');
} finally { await close(); }
