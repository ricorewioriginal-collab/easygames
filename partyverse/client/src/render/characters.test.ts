import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CHARACTER_IDS } from '@shared/characters';
import { HAT_IDS, createCharacter, type CharacterAnim, type CharacterRig } from './characters';

const ALL_ANIMS: CharacterAnim[] = ['idle', 'walk', 'run', 'jump', 'celebrate', 'lose', 'roll', 'cheer', 'shock', 'dance', 'teleportOut', 'teleportIn', 'win', 'point'];
const ONE_SHOT: CharacterAnim[] = ['jump', 'celebrate', 'lose', 'roll', 'cheer', 'shock', 'teleportIn', 'win', 'point'];

function countMeshes(root: THREE.Object3D): number {
  let n = 0;
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n++;
  });
  return n;
}
function countAll(root: THREE.Object3D): number {
  let n = 0;
  root.traverse(() => n++);
  return n;
}
function allFinite(root: THREE.Object3D): string | null {
  let bad: string | null = null;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (bad) return;
    const v = [o.position.x, o.position.y, o.position.z, o.rotation.x, o.rotation.y, o.rotation.z, o.scale.x, o.scale.y, o.scale.z, ...o.matrixWorld.elements];
    if (v.some((x) => !Number.isFinite(x))) bad = o.name || o.type;
  });
  return bad;
}
const size = (root: THREE.Object3D): THREE.Vector3 => new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
const step = (rig: CharacterRig, seconds: number, dt = 1 / 60): void => {
  for (let t = 0; t < seconds; t += dt) rig.update(dt);
};

describe('Figuren: Erzeugung und Maße', () => {
  it('alle acht Figuren sind erzeugbar (Toon und ohne Toon)', () => {
    expect(CHARACTER_IDS.length).toBe(8);
    for (const id of CHARACTER_IDS) {
      for (const toon of [true, false]) {
        const rig = createCharacter(id, { toon });
        expect(rig.id).toBe(id);
        expect(rig.root).toBeInstanceOf(THREE.Group);
        expect(rig.current).toBe('idle');
        rig.dispose();
      }
    }
  });

  it('bleibt im Mesh-Limit', () => {
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      const n = countMeshes(rig.root);
      expect(n, id).toBeGreaterThan(12);
      expect(n, id).toBeLessThanOrEqual(35);
      for (const hat of HAT_IDS) {
        rig.setHat(hat);
        expect(countMeshes(rig.root), `${id}+${hat}`).toBeLessThanOrEqual(45);
      }
      rig.setHat(null);
      rig.setTrail(0xff00aa);
      expect(countMeshes(rig.root)).toBeLessThanOrEqual(37);
      rig.dispose();
    }
  });

  it('Höhe der Bounding Box liegt zwischen 1.4 und 2.4, Füße etwa bei y = 0', () => {
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      step(rig, 0.5);
      const box = new THREE.Box3().setFromObject(rig.root);
      const h = box.max.y - box.min.y;
      expect(h, id).toBeGreaterThanOrEqual(1.4);
      expect(h, id).toBeLessThanOrEqual(2.4);
      expect(box.min.y, id).toBeGreaterThan(-0.25);
      expect(box.min.y, id).toBeLessThan(0.3);
      rig.dispose();
    }
  });

  it('scale-Option skaliert die Figur', () => {
    const a = createCharacter('pip');
    const b = createCharacter('pip', { scale: 2 });
    expect(size(b.root).y / size(a.root).y).toBeCloseTo(2, 1);
    a.dispose();
    b.dispose();
  });

  it('Silhouetten sind paarweise verschieden', () => {
    const sig = CHARACTER_IDS.map((id) => {
      const rig = createCharacter(id);
      const s = size(rig.root);
      const out = { id, wh: s.x / s.y, dh: s.z / s.y, meshes: countMeshes(rig.root), nodes: countAll(rig.root) };
      rig.dispose();
      return out;
    });
    for (let i = 0; i < sig.length; i++)
      for (let j = i + 1; j < sig.length; j++) {
        const a = sig[i];
        const b = sig[j];
        const different = Math.abs(a.wh - b.wh) > 0.02 || Math.abs(a.dh - b.dh) > 0.02 || a.meshes !== b.meshes || a.nodes !== b.nodes;
        expect(different, `${a.id} vs ${b.id}`).toBe(true);
        // Teile-Anordnung: Verhältnis Knoten/Meshes ebenfalls nicht identisch
        expect(a.nodes === b.nodes && a.meshes === b.meshes && Math.abs(a.wh - b.wh) < 0.02, `${a.id} vs ${b.id}`).toBe(false);
      }
  });
});

describe('Figuren: Animationen', () => {
  it('alle Animationen laufen 300 Bilder ohne NaN (auch bei unruhigem dt)', () => {
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      rig.setHat('propeller');
      rig.setTrail(0x00ffcc);
      rig.lookAt(new THREE.Vector3(3, 1, 4));
      rig.faceTowards(1.2);
      for (const anim of ALL_ANIMS) {
        rig.play(anim, { loop: true, speed: 1.3 });
        for (let f = 0; f < 300; f++) {
          rig.update(f % 7 === 0 ? 0.045 : f % 11 === 0 ? 0 : 1 / 60);
          rig.root.position.x += 0.02;
          if (f % 50 === 0) expect(allFinite(rig.root), `${id}/${anim}/${f}`).toBeNull();
        }
        expect(allFinite(rig.root), `${id}/${anim}`).toBeNull();
      }
      rig.update(NaN);
      rig.update(-1);
      expect(allFinite(rig.root)).toBeNull();
      rig.dispose();
    }
  });

  it('einmalige Animationen kehren zu idle zurück', () => {
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      for (const anim of ONE_SHOT) {
        rig.play(anim);
        expect(rig.current).toBe(anim);
        step(rig, 0.3);
        expect(rig.current, `${id}/${anim} mitten drin`).toBe(anim);
        step(rig, 3.2);
        expect(rig.current, `${id}/${anim}`).toBe('idle');
      }
      rig.dispose();
    }
  });

  it('Schleifen-Animationen laufen weiter, wiederholtes play startet nicht neu', () => {
    const rig = createCharacter('zapp');
    rig.play('walk');
    step(rig, 4);
    expect(rig.current).toBe('walk');
    const y1 = rig.root.children[0].position.y;
    rig.play('walk');
    rig.update(1 / 60);
    expect(Math.abs(rig.root.children[0].position.y - y1)).toBeLessThan(0.2);
    rig.play('dance', { loop: true });
    step(rig, 5);
    expect(rig.current).toBe('dance');
    rig.dispose();
  });

  it('teleportOut macht unsichtbar, teleportIn bringt zurück', () => {
    const rig = createCharacter('lumi');
    const pose = rig.root.children[0] as THREE.Group;
    rig.play('teleportOut');
    step(rig, 1.5);
    expect(rig.current).toBe('teleportOut');
    expect(pose.visible).toBe(false);
    rig.play('teleportIn');
    step(rig, 1.5);
    expect(rig.current).toBe('idle');
    expect(pose.visible).toBe(true);
    expect(pose.scale.y).toBeGreaterThan(0.9);
    expect(pose.scale.y).toBeLessThan(1.1);
    rig.dispose();
  });

  it('Animationen bewegen die Figur tatsächlich (nicht alle gleich)', () => {
    const rig = createCharacter('pip');
    const pose = rig.root.children[0] as THREE.Group;
    let maxY = 0;
    rig.play('jump');
    for (let f = 0; f < 50; f++) {
      rig.update(1 / 60);
      maxY = Math.max(maxY, pose.position.y);
    }
    expect(maxY).toBeGreaterThan(0.4);
    rig.dispose();
  });

  it('faceTowards dreht weich zum Ziel', () => {
    const rig = createCharacter('mokka');
    rig.faceTowards(Math.PI / 2);
    rig.update(1 / 60);
    expect(rig.root.rotation.y).toBeGreaterThan(0);
    expect(rig.root.rotation.y).toBeLessThan(Math.PI / 2);
    step(rig, 2);
    expect(rig.root.rotation.y).toBeCloseTo(Math.PI / 2, 2);
    // kürzester Weg über die Nahtstelle
    rig.faceTowards(-Math.PI / 2 - 0.2);
    step(rig, 2);
    expect(Math.cos(rig.root.rotation.y + Math.PI / 2 + 0.2)).toBeGreaterThan(0.999);
    rig.dispose();
  });

  it('lookAt dreht den Kopf zum Ziel und löst sich wieder', () => {
    const rig = createCharacter('flora');
    step(rig, 0.3);
    const head = (): number => {
      let hy = 0;
      rig.root.traverse((o) => {
        if (o.name === 'head') hy = o.rotation.y;
      });
      return hy;
    };
    rig.lookAt(new THREE.Vector3(5, 1.5, 5));
    step(rig, 1);
    expect(head()).toBeGreaterThan(0.3);
    expect(allFinite(rig.root)).toBeNull();
    rig.lookAt(null);
    step(rig, 1.5);
    expect(Math.abs(head())).toBeLessThan(0.3);
    expect(allFinite(rig.root)).toBeNull();
    rig.dispose();
  });
});

describe('Figuren: Hüte, Spur, Aufräumen', () => {
  it('Hüte setzen und entfernen ändern die Kinderzahl', () => {
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      const base = countAll(rig.root);
      for (const hat of HAT_IDS) {
        rig.setHat(hat);
        expect(countAll(rig.root), `${id}+${hat}`).toBeGreaterThan(base);
        rig.setHat(null);
        expect(countAll(rig.root), `${id}-${hat}`).toBe(base);
      }
      // Hutwechsel ersetzt, statt zu stapeln
      rig.setHat('krone');
      const withCrown = countAll(rig.root);
      rig.setHat('krone');
      expect(countAll(rig.root)).toBe(withCrown);
      rig.setHat('zylinder');
      rig.setHat(null);
      expect(countAll(rig.root)).toBe(base);
      rig.dispose();
    }
  });

  it('setTrail fügt Spur hinzu und entfernt sie wieder', () => {
    const rig = createCharacter('vex');
    const base = countAll(rig.root);
    rig.setTrail(0xff0000);
    expect(countAll(rig.root)).toBe(base + 1);
    rig.play('run');
    for (let f = 0; f < 120; f++) {
      rig.root.position.x += 0.05;
      rig.update(1 / 60);
    }
    expect(allFinite(rig.root)).toBeNull();
    rig.setTrail(null);
    expect(countAll(rig.root)).toBe(base);
    rig.dispose();
  });

  it('dispose entfernt alles aus der Szene', () => {
    const scene = new THREE.Scene();
    for (const id of CHARACTER_IDS) {
      const rig = createCharacter(id);
      rig.setHat('blumenkranz');
      rig.setTrail(0x112233);
      scene.add(rig.root);
      expect(scene.children.length).toBe(1);
      rig.dispose();
      expect(scene.children.length).toBe(0);
      expect(rig.root.children.length).toBe(0);
      rig.update(1 / 60); // nach dispose wirkungslos, kein Fehler
      rig.dispose();
    }
  });
});
