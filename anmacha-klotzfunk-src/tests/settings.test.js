import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.localStorage = { m: {}, getItem(k) { return this.m[k] ?? null; }, setItem(k, v) { this.m[k] = String(v); } };
const { loadSettings, saveSettings, DEFAULTS, QUALITY } = await import('../src/settings.js');

test('Einstellungen: Standardwerte, Speichern, ungültige Werte werden ignoriert', () => {
  assert.deepEqual(loadSettings(), DEFAULTS);
  saveSettings({ ...DEFAULTS, lefty: true, mouseSens: 1.5 });
  const s = loadSettings();
  assert.equal(s.lefty, true); assert.equal(s.mouseSens, 1.5);
  localStorage.setItem('klotzfunk.settings', JSON.stringify({ quality: 'ultra', lefty: 'ja', btnScale: 1.2 }));
  const t = loadSettings();
  assert.equal(t.quality, 'auto'); assert.equal(t.lefty, false); assert.equal(t.btnScale, 1.2);
  localStorage.setItem('klotzfunk.settings', '{kaputt');
  assert.deepEqual(loadSettings(), DEFAULTS);
  for (const q of Object.values(QUALITY)) assert.ok(q.dpr > 0 && q.view >= 2 && q.budget > 0);
});
