import * as THREE from 'three';
import { CHARACTERS, isCharacterId } from '@shared/characters';
import { Engine, type Screen } from '../render/engine';
import { toon } from '../render/materials';
import { HAT_IDS, createCharacter, type CharacterAnim, type CharacterRig, type HatId } from '../render/characters';

/** Figuren-Labor: ?charlab=1[&id=pip][&anim=walk][&hat=krone][&trail=ff00aa][&once=1][&look=1] */

const ANIMS: readonly CharacterAnim[] = ['idle', 'walk', 'run', 'jump', 'celebrate', 'lose', 'roll', 'cheer', 'shock', 'dance', 'teleportOut', 'teleportIn', 'win', 'point'];

interface CharLabApi {
  rigs: CharacterRig[];
  errors: string[];
  frames: number;
  play(anim: CharacterAnim): void;
  setHat(hat: HatId | null): void;
}
declare global {
  interface Window {
    __charlab?: CharLabApi;
  }
}

function finiteTree(root: THREE.Object3D): string | null {
  let bad: string | null = null;
  root.traverse((o) => {
    if (bad) return;
    const vals = [o.position.x, o.position.y, o.position.z, o.rotation.x, o.rotation.y, o.rotation.z, o.scale.x, o.scale.y, o.scale.z];
    if (vals.some((v) => !Number.isFinite(v))) bad = `NaN in ${o.name || o.type}`;
  });
  return bad;
}

export function startCharLab(params: URLSearchParams): void {
  const el = document.getElementById('app');
  if (!el) return;
  el.textContent = '';
  el.style.position = 'relative';
  el.style.width = '100vw';
  el.style.height = '100vh';
  const errors: string[] = [];
  window.addEventListener('error', (e) => errors.push(String(e.message)));

  const idParam = params.get('id');
  const ids = idParam && isCharacterId(idParam) ? [idParam] : CHARACTERS.map((c) => c.id);
  const animParam = params.get('anim') as CharacterAnim | null;
  const anim: CharacterAnim = animParam && ANIMS.includes(animParam) ? animParam : 'idle';
  const hatParam = params.get('hat');
  const hat: HatId | null = hatParam && (HAT_IDS as readonly string[]).includes(hatParam) ? (hatParam as HatId) : hatParam === 'all' ? null : null;
  const trailParam = params.get('trail');
  const trail = trailParam ? parseInt(trailParam.replace('#', ''), 16) : null;
  const once = params.get('once') === '1';
  const lookOn = params.get('look') === '1';
  const rotDeg = parseFloat(params.get('rot') ?? '0') || 0;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#bfe3ff');
  scene.fog = new THREE.Fog('#bfe3ff', 22, 48);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7fa86a, 1.7));
  const sun = new THREE.DirectionalLight(0xfff2d8, 2.2);
  sun.position.set(3, 7, 5);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 48), toon('#8fd16f'));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  // Bodenmuster als Orientierung
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(60, 1.1), toon('#e9d8a6'));
  strip.rotation.x = -Math.PI / 2;
  strip.position.set(0, 0.005, 0.2);
  scene.add(strip);
  const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff3b0' }));
  sunDisc.position.set(-14, 11, -30);
  scene.add(sunDisc);

  const spacing = 2.5;
  const rigs: CharacterRig[] = [];
  const labels: HTMLDivElement[] = [];
  ids.forEach((id, i) => {
    const rig = createCharacter(id);
    rig.root.position.x = (i - (ids.length - 1) / 2) * spacing;
    rig.root.name = id;
    if (hat) rig.setHat(hat);
    if (trail !== null && Number.isFinite(trail)) rig.setTrail(trail);
    rig.root.rotation.y = (rotDeg * Math.PI) / 180;
    rig.play(anim, { loop: !once });
    scene.add(rig.root);
    rigs.push(rig);
    const def = CHARACTERS.find((c) => c.id === id);
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;z-index:10;transform:translate(-50%,0);font:700 14px/1.15 system-ui,sans-serif;color:#1d2a44;text-align:center;pointer-events:none;text-shadow:0 1px 0 #fff8;white-space:nowrap';
    d.innerHTML = `${def?.name ?? id}<br><span style="font-weight:500;font-size:11px;opacity:.75">${def?.species ?? ''}</span>`;
    el.appendChild(d);
    labels.push(d);
  });

  const info = document.createElement('div');
  info.style.cssText = 'position:absolute;z-index:10;left:10px;top:8px;font:600 13px system-ui,sans-serif;color:#1d2a44;background:#ffffffb0;padding:4px 9px;border-radius:8px;pointer-events:none';
  el.appendChild(info);

  const camera = new THREE.PerspectiveCamera(30, 2, 0.1, 100);
  const look = new THREE.Vector3();
  const lookTarget = new THREE.Vector3(0, 1.3, 4);
  let frames = 0;
  let t = 0;

  const fit = (aspect: number): void => {
    const n = ids.length;
    const halfW = ((n - 1) * spacing) / 2 + 1.35;
    const halfH = ids.length === 1 ? 1.15 : 1.2;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const distV = halfH / Math.tan(vfov / 2);
    const distH = halfW / (Math.tan(vfov / 2) * aspect);
    const dist = Math.max(distV, distH) * 1.08;
    camera.position.set(0, 1.35 + dist * 0.12, dist);
    look.set(0, 1.0, 0);
    camera.lookAt(look);
  };

  const screen: Screen = {
    scene,
    camera,
    update(dt: number) {
      frames++;
      t += dt;
      fit(camera.aspect);
      if (lookOn) {
        lookTarget.set(Math.sin(t * 0.8) * 4, 1.2 + Math.sin(t * 0.5), 4);
      }
      for (const r of rigs) {
        if (lookOn) r.lookAt(lookTarget);
        r.update(dt);
        if (frames % 20 === 0) {
          const bad = finiteTree(r.root);
          if (bad) errors.push(`${r.id}: ${bad}`);
        }
      }
      info.textContent = `anim: ${rigs[0]?.current ?? ''}${hat ? ' | hut: ' + hat : ''}${trail !== null ? ' | spur' : ''}`;
      camera.updateMatrixWorld();
      const rect = el.getBoundingClientRect();
      rigs.forEach((r, i) => {
        const v = new THREE.Vector3(r.root.position.x, -0.1, 0.3).project(camera);
        const lab = labels[i];
        lab.style.left = `${((v.x + 1) / 2) * rect.width}px`;
        lab.style.top = `${((1 - v.y) / 2) * rect.height}px`;
      });
    },
  };

  const engine = new Engine(el);
  engine.autoQuality = false;
  engine.setScreen(screen);
  engine.start();

  window.__charlab = {
    rigs,
    errors,
    get frames() {
      return frames;
    },
    play(a: CharacterAnim) {
      rigs.forEach((r) => r.play(a, { loop: !once }));
    },
    setHat(h: HatId | null) {
      rigs.forEach((r) => r.setHat(h));
    },
  } as CharLabApi;
}
