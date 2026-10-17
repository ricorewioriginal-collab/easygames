import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { routeNet } from '../src/data/routes';
import { Network } from '../src/railway/network';
import { WorldView, type WorldEnv, type WorldQuality } from '../src/engine/world';

const renderer = { capabilities: { maxTextureSize: 2048 }, shadowMap: {} } as any;
const env = (over: Partial<WorldEnv> = {}): WorldEnv => ({ timeOfDay: 12 * 3600, weather: 'clear', season: 'summer', signalAspect: () => 'stop', crossingClosed: () => 0, ...over });
const Q: Record<string, WorldQuality> = {
  low: { level: 'low', viewDist: 1500, shadows: false },
  mid: { level: 'mid', viewDist: 2500, shadows: false },
  high: { level: 'high', viewDist: 4000, shadows: false },
};

function stationCamera(net: Network, far: number, idx = 0) {
  const st = net.def.stations.filter((s) => s.kind !== 'yard' && s.platforms.length)[idx];
  const p = st.platforms[0], t = net.tracks.get(p.track)!, pt = t.point((p.s0 + p.s1) / 2);
  const cam = new THREE.PerspectiveCamera(60, 16 / 9, 0.5, far);
  cam.position.set(pt.x, pt.y + 3.5, pt.z);
  cam.lookAt(pt.x + pt.dx * 100, pt.y + 2, pt.z + pt.dz * 100);
  cam.updateMatrixWorld(true);
  return { cam, pt, st };
}

function load(w: WorldView, cam: THREE.Camera, e: WorldEnv) {
  let frames = 0;
  const t0 = performance.now();
  while (w.progress() < 1 && frames < 20000) { w.update(cam, e, 1 / 60); frames++; }
  w.update(cam, e, 1 / 60);
  return { frames, ms: performance.now() - t0 };
}

/** Draw-Calls und Dreiecke im Sichtkegel (wie WebGLRenderer: sichtbar + Frustum-Culling) */
function viewStats(scene: THREE.Scene, cam: THREE.Camera) {
  scene.updateMatrixWorld(true);
  const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  let calls = 0, tris = 0; const by: Record<string, number> = {};
  scene.traverseVisible((o) => {
    const m = o as THREE.Mesh;
    if (!(m.isMesh || (o as THREE.Points).isPoints || (o as THREE.Line).isLine)) return;
    if (o.frustumCulled && !fr.intersectsObject(o)) return;
    calls++; by[o.name || o.type] = (by[o.name || o.type] ?? 0) + 1;
    if (m.isMesh) {
      const g = m.geometry, n = g.index ? g.index.count : g.getAttribute('position').count;
      tris += (n / 3) * ((m as unknown as THREE.InstancedMesh).isInstancedMesh ? (m as unknown as THREE.InstancedMesh).count : 1);
    }
  });
  return { calls, tris: Math.round(tris), by };
}

function nearTrackCheck(w: WorldView, net: Network, cx: number, cz: number, radius: number) {
  let n = 0, worst = 0;
  // Punkte an Tunneln/Brücken (auch am Parallelgleis) ausnehmen: dort gilt Berg bzw. Tal
  const special: number[] = [];
  for (const t of net.tracks.values()) if (t.def.tunnel || t.def.bridge) for (let i = 0; i < t.px.length; i++) special.push(t.px[i], t.pz[i]);
  const nearSpecial = (x: number, z: number) => { for (let k = 0; k < special.length; k += 2) if (Math.hypot(special[k] - x, special[k + 1] - z) < 60) return true; return false; };
  for (const t of net.tracks.values()) {
    if (t.def.tunnel || t.def.bridge) continue;
    for (let i = 0; i < t.px.length; i++) {
      if (Math.hypot(t.px[i] - cx, t.pz[i] - cz) > radius || nearSpecial(t.px[i], t.pz[i])) continue;
      const h = w.heightAt(t.px[i], t.pz[i]);
      worst = Math.max(worst, Math.abs(h - (t.py[i] - 0.8)));
      n++;
    }
  }
  return { n, worst };
}

describe('WorldView 3D-Welt', () => {
  for (const id of ['d1', 'f3']) {
    it(`${id}: lädt Chunks um einen Bahnhof, Budget, Signale, Höhen`, () => {
      const net = new Network(routeNet(id));
      const scene = new THREE.Scene();
      const out: string[] = [];
      for (const lvl of ['low', 'mid', 'high'] as const) {
        const q = Q[lvl];
        const t0 = performance.now();
        const w = new WorldView(renderer, scene, net, q);
        const tCtor = performance.now() - t0;
        const { cam, pt } = stationCamera(net, q.viewDist + 500);
        const e = env();
        const ld = load(w, cam, e);
        expect(w.progress()).toBe(1);
        const s = w.stats();
        expect(s.chunks).toBeGreaterThan(5);
        const v = viewStats(scene, cam);
        out.push(`${id} ${lvl}: ctor ${tCtor.toFixed(0)} ms, ${s.chunks} chunks in ${ld.frames} frames (${(ld.ms / s.chunks).toFixed(1)} ms/chunk), loaded tris ${s.triangles}, in view: ${v.calls} calls, ${v.tris} tris ${JSON.stringify(v.by)}`);
        if (lvl === 'mid') { expect(v.calls).toBeLessThan(150); expect(v.tris).toBeLessThan(300000); }
        if (lvl === 'low') { expect(v.calls).toBeLessThan(150); expect(v.tris).toBeLessThan(200000); }
        // Signallampen: Material vorhanden, Farbe folgt dem Signalbild
        const lamps = scene.getObjectByName('signalLamps') as THREE.InstancedMesh;
        expect(lamps).toBeTruthy();
        expect((lamps.material as THREE.Material).name).toBe('signal-lamp');
        const c0 = new THREE.Color(); lamps.getColorAt(0, c0);
        w.update(cam, env({ signalAspect: () => 'go' }), 1 / 60);
        const c1 = new THREE.Color(); lamps.getColorAt(0, c1);
        expect(c0.r).toBeGreaterThan(0.5); // rot an (Halt)
        expect(c1.r).toBeLessThan(0.1);    // rot aus (Fahrt)
        // Gelände am Gleis ≈ Schienenoberkante − 0,8 m
        const nt = nearTrackCheck(w, net, pt.x, pt.z, 1200);
        expect(nt.n).toBeGreaterThan(10);
        expect(nt.worst).toBeLessThan(1.5);
        // Höhe außerhalb geladener Chunks (analytischer Weg) bleibt endlich
        expect(Number.isFinite(w.heightAt(pt.x + 50000, pt.z - 50000))).toBe(true);
        // Nacht, Gewitter, Schnee: keine Fehler
        w.update(cam, env({ timeOfDay: 1 * 3600, weather: 'storm', lightning: true }), 1 / 60);
        w.update(cam, env({ timeOfDay: 19 * 3600, weather: 'snow', season: 'winter' }), 1 / 60);
        w.update(cam, env({ weather: 'fog' }), 1 / 60);
        w.dispose();
        expect(w.stats().chunks).toBe(0);
        expect(scene.getObjectByName('world')).toBeUndefined();
        expect(scene.getObjectByName('signalLamps')).toBeUndefined();
        expect(scene.fog).toBeNull();
      }
      console.log(out.join('\n'));
    }, 120000);
  }

  it('f2: inTunnel erkennt die Tunnelröhre', () => {
    const net = new Network(routeNet('f2'));
    const scene = new THREE.Scene();
    const w = new WorldView(renderer, scene, net, Q.low);
    const tun = [...net.tracks.values()].find((t) => t.def.tunnel)!;
    const p = tun.point(tun.len / 2);
    expect(w.inTunnel(p.x, p.y + 2, p.z)).toBe(true);
    expect(w.inTunnel(p.x, p.y + 60, p.z)).toBe(false);
    expect(w.inTunnel(p.x + p.dz * 40, p.y + 2, p.z - p.dx * 40)).toBe(false);
    const open = [...net.tracks.values()].find((t) => !t.def.tunnel)!;
    const q = open.point(open.len / 2);
    expect(w.inTunnel(q.x, q.y + 2, q.z)).toBe(false);
    // Gelände über dem Tunnel liegt über der Röhre
    expect(w.heightAt(p.x, p.z)).toBeGreaterThan(p.y + 8);
    // Kamera im Tunnel: Chunk mit Röhre laden
    const cam = new THREE.PerspectiveCamera(60, 1.5, 0.5, 2000); cam.position.set(p.x, p.y + 3, p.z); cam.lookAt(p.x + p.dx, p.y + 3, p.z + p.dz); cam.updateMatrixWorld(true);
    load(w, cam, env({ weather: 'rain', season: 'winter' }));
    expect(w.stats().chunks).toBeGreaterThan(0);
    w.dispose();
    expect(w.stats().chunks).toBe(0);
  });

  it('alle Strecken: Aufbau ohne Fehler, Bahnübergänge schließen', () => {
    for (const id of ['d1', 'd2', 'd3', 'd4', 'f1', 'f2', 'f3', 'f4']) {
      const net = new Network(routeNet(id));
      const scene = new THREE.Scene();
      const w = new WorldView(renderer, scene, net, { level: 'low', viewDist: 700, shadows: true });
      for (const k of [0, 1]) {
        const { cam } = stationCamera(net, 1500, k);
        load(w, cam, env());
      }
      // Bahnübergang: Kamera hin, Schranke schließen
      const xc = net.def.crossings[0];
      if (xc) {
        const t = net.tracks.get(xc.track)!, p = t.point(xc.s);
        const cam = new THREE.PerspectiveCamera(60, 1.5, 0.5, 1500); cam.position.set(p.x + 20, p.y + 5, p.z); cam.lookAt(p.x, p.y, p.z); cam.updateMatrixWorld(true);
        load(w, cam, env({ crossingClosed: () => 1 }));
        const arms: THREE.Object3D[] = [];
        scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && (m.material as THREE.Material).name === 'barrier') arms.push(m.parent!); });
        expect(arms.length).toBeGreaterThanOrEqual(2);
        for (const a of arms) expect(Math.abs(a.rotation.z)).toBeLessThan(1e-6); // geschlossen: waagerecht
        w.update(cam, env({ crossingClosed: () => 0 }), 1 / 60);
        for (const a of arms) expect(a.rotation.z).toBeCloseTo(Math.PI / 2, 5); // offen: senkrecht
      }
      const nans = [] as string[];
      scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.geometry?.boundingSphere && !Number.isFinite(m.geometry.boundingSphere.radius)) nans.push(id + ':' + m.name); });
      expect(nans).toEqual([]);
      w.setQuality({ level: 'mid', viewDist: 600, shadows: false });
      expect(w.stats().chunks).toBe(0);
      w.dispose();
    }
  }, 120000);
});
