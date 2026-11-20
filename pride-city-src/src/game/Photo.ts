/* Fotostudio für Profilbilder (Rainbow Match): rendert eine Rocketbox-Figur mit eigener kleiner Babylon-Engine und
   liefert ein JPEG. Bilder werden pro Profil und Motiv zwischengespeichert. */
import { Engine, Scene, FreeCamera, HemisphericLight, DirectionalLight, Vector3, Color4, ImageProcessingConfiguration, Color3, col } from '../engine/bjs';
import { Actor, type Look } from './Actor';

export interface Shot { look: Look; clip: string; t?: number; bg: string; yaw?: number; close?: boolean }

let eng: Engine | null = null, scene: Scene | null = null, cam: FreeCamera | null = null;
const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();

function setup() {
  const c = document.createElement('canvas'); c.width = 800; c.height = 600;
  eng = new Engine(c, true, { preserveDrawingBuffer: true, audioEngine: false } as never, false);
  eng.setSize(800, 600);
  scene = new Scene(eng); scene.useRightHandedSystem = true;
  const ip = scene.imageProcessingConfiguration; ip.toneMappingEnabled = true; ip.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  cam = new FreeCamera('c', new Vector3(0, .75, 4.3), scene); cam.fov = 30 * Math.PI / 180; cam.minZ = .1; cam.inputs.clear();
  const h = new HemisphericLight('h', new Vector3(0, 1, 0), scene); h.intensity = 1.2; h.diffuse = col(0xfff1f8); h.groundColor = col(0x2a1650);
  const key = new DirectionalLight('k', new Vector3(-2, -4, -4).normalize(), scene); key.intensity = 2.4;
  const rim = new DirectionalLight('r', new Vector3(3, -2, 3).normalize(), scene); rim.intensity = 1.2; rim.diffuse = col(0xb9a6ff);
}

export function photo(id: string, s: Shot): Promise<string> {
  const k = id + '|' + JSON.stringify(s);
  const hit = cache.get(k); if (hit) return Promise.resolve(hit);
  const job = queue.then(async () => {
    const again = cache.get(k); if (again) return again;
    if (!eng) setup();
    const a = await Actor.create(scene!, s.look);
    a.pose(s.clip, s.t ?? .6);
    a.root.rotation.y = s.yaw ?? .35;
    const bg = Color3.Lerp(Color3.FromHexString(s.bg.length === 7 ? s.bg : '#ff4fa3'), Color3.FromHexString('#1a0f33'), .7).toLinearSpace();
    scene!.clearColor = new Color4(bg.r, bg.g, bg.b, 1);
    if (s.close) { const hy = a.head().y; cam!.position.set(0, hy - .05, 2.4); cam!.setTarget(new Vector3(0, hy - .2, 0)); } else { cam!.position.set(0, .75, 4.3); cam!.setTarget(new Vector3(0, .95, 0)); } // leicht von unten: wirkt größer und selbstbewusster
    await scene!.whenReadyAsync();
    scene!.render(); scene!.render();
    const url = (eng!.getRenderingCanvas() as HTMLCanvasElement).toDataURL('image/jpeg', .86);
    a.dispose();
    cache.set(k, url);
    return url;
  });
  queue = job.catch(() => null);
  return job;
}
