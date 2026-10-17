import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { VEHICLES, CAB_LAYOUTS, type CabLayout } from '../src/trains/stock';
import { buildVehicle, clearVehicleCache, type VehicleAnim, type Quality } from '../src/engine/models/vehicles';
import { buildCab, clearCabCache, type CabState } from '../src/engine/models/cab';

function tris(o: THREE.Object3D): number {
  let n = 0;
  o.traverse((c) => { const m = c as THREE.Mesh; if (m.isMesh) { const g = m.geometry; n += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
  return Math.round(n);
}
const QS: Quality[] = ['low', 'medium', 'high'];
const BUDGET: Record<Quality, number> = { low: 1550, medium: 5000, high: 12000 };
const anim = (o: Partial<VehicleAnim> = {}): VehicleAnim => ({ wheelAngle: 3.3, panto: 1, doorL: 1, doorR: 0.4, frontLights: 2, rearLights: 1, cabLight: true, load: 1, cargo: null, smoke: 0.8, speed: 20, ...o });

describe('Fahrzeugmodelle', () => {
  const report: string[] = [];
  for (const v of VEHICLES) {
    it(`${v.id} (${v.body})`, () => {
      const row: number[] = [];
      for (const q of QS) {
        const m = buildVehicle(v, q);
        expect(m.bogies.length).toBe(v.bogies.length);
        m.bogies.forEach((b, i) => expect(b.position.x).toBeCloseTo(v.bogies[i]));
        m.update(anim());
        m.update(anim({ frontLights: 3, rearLights: 2, load: 0.3, cargo: v.cargo?.[v.cargo.length - 1] ?? null, panto: 0, doorL: 0 }));
        const t = tris(m.group);
        expect(t).toBeLessThanOrEqual(BUDGET[q]);
        const box = new THREE.Box3().setFromObject(m.group, true);
        expect(box.max.x - box.min.x).toBeLessThan(v.len + 0.6);
        expect(box.min.y).toBeGreaterThan(-0.1); // Spurkränze reichen unter SOK
        row.push(t);
        m.dispose();
        expect(m.group.children.length).toBe(0);
      }
      report.push(`${v.body.padEnd(11)} ${row.join(' / ')}`);
    });
  }
  it('Bericht', () => { console.log('Dreiecke low/medium/high\n' + [...new Set(report)].join('\n')); });
});

const state = (o: Partial<CabState> = {}): CabState => ({
  kmh: 87, vmax: 160, limit: 100, target: 60, targetDist: 1200, throttle: 0.6, brake: 0, dyn: 0, reverser: 1, cutoff: 0.35,
  pipe: 5, cyl: 0, mainRes: 9, power: 0.6, panto: 1, mainSwitch: true, engineRpm: 1500,
  doorL: 0, doorR: 0, releaseL: true, releaseR: false, lights: 1, cabLight: true, wipers: true, parking: false, sand: false, emergency: false,
  boiler: 14, glass: 0.6, fire: 0.7, fuel: 0.8, aspect: 'Langsamfahrt 60', pzb: { warn: true, monitor: true, brake: false }, sifaWarn: false, forced: false,
  clock: '08:15:30', nextStop: 'Bergheim', nextStopDist: 2300, gradient: 12, slip: false, time: 12.3, night: false, ...o,
});

describe('Führerstände', () => {
  for (const layout of Object.keys(CAB_LAYOUTS) as CabLayout[]) {
    it(layout, () => {
      const row: number[] = [];
      for (const q of QS) {
        const c = buildCab(layout, q);
        expect(c.controls.length).toBeGreaterThan(8);
        const ids = new Set(c.controls.map((x) => x.id));
        for (const need of ['horn', 'emergency', 'lights', 'cabLight'] as const) expect(ids.has(need)).toBe(true);
        expect(ids.has('throttle') || ids.has('combined')).toBe(true);
        for (const ctl of c.controls) {
          expect(ctl.label.length).toBeGreaterThan(1);
          let meshes = 0;
          ctl.obj.traverse((o) => { if ((o as THREE.Mesh).isMesh) { meshes++; expect(o.userData.ctl).toBe(ctl.id); } });
          expect(meshes).toBeGreaterThan(0);
        }
        expect(c.eye.y).toBeGreaterThan(layout === 'tram' ? 2.2 : 2.85);
        c.update(state(), 0.016);
        c.update(state({ throttle: 0, brake: 0.8, emergency: true, wipers: false, reverser: -1, cabLight: false, night: true }), 0.2);
        row.push(tris(c.group));
        c.dispose();
      }
      console.log(`Cab ${layout.padEnd(8)} ${row.join(' / ')}`);
    });
  }
});

describe('Canvas-Malpfade (Attrappe statt DOM)', () => {
  it('alle Texturen/Displays lassen sich zeichnen', () => {
    let calls = 0;
    const ctx: any = new Proxy({}, {
      get: (_t, k) => {
        if (k === 'createLinearGradient') return () => ({ addColorStop: () => { calls++; } });
        if (k === 'measureText') return (t: string) => ({ width: t.length * 10 });
        return (..._a: unknown[]) => { calls++; };
      },
      set: () => true,
    });
    const g = globalThis as any;
    const had = 'document' in g;
    g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
    try {
      clearVehicleCache(); clearCabCache();
      for (const v of VEHICLES) { const m = buildVehicle(v, 'medium'); m.update(anim()); m.dispose(); }
      for (const l of Object.keys(CAB_LAYOUTS) as CabLayout[]) {
        const c = buildCab(l, 'high');
        c.update(state(), 0.2); c.update(state({ kmh: 120, target: null, targetDist: null, nextStopDist: null, aspect: 'Halt' }), 0.2);
        c.dispose();
      }
      expect(calls).toBeGreaterThan(1000);
    } finally {
      if (!had) delete g.document;
      clearVehicleCache(); clearCabCache();
    }
  });
});
