// Regression: gebündelte Landschaft (InstancedMesh) darf nicht per Frustum-Culling verschwinden – sonst ist auf den
// Außeninseln die ganze Welt weg (Bounding-Sphere sitzt im Ursprung, nicht bei den Instanzen).
const assert = require('node:assert/strict'), {load} = require('./harness.cjs');
for (let level = 0; level < 6; level++) {
  const h = load(); h.els.start.onclick(); h.finish(); if (level) h.api.level(level, false);
  let batches = 0; h.context.THREE && 0;
  assert.equal(h.api.culledBatches(), 0, `Level ${level}: gebündelte Landschaft wird nicht ausgeblendet`);
}
console.log('PASS culling: keine gebündelte Landschaft kann per Frustum-Culling verschwinden (6 Inseln).');
