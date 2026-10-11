import * as THREE from 'three';
import type { Layout, WorldId } from '@shared/levels/types';
import { Rng, hashString } from '@shared/rng';
import type { QualitySettings } from '../quality';
import { BoardView, THEMES, skyDome, type Decor, type DecorFactory } from './common';
import { createDecor as prismara } from './prismara';
import { createDecor as novaNexus } from './nova-nexus';
import { createDecor as wurzelwild } from './wurzelwild';
import { createDecor as paradoxCity } from './paradox-city';
import { createDecor as infinityCarnival } from './infinity-carnival';

export { BoardView, THEMES } from './common';

const FACTORIES: Record<WorldId, DecorFactory> = {
  prismara,
  'nova-nexus': novaNexus,
  wurzelwild,
  'paradox-city': paradoxCity,
  'infinity-carnival': infinityCarnival,
};

/** Komplette 3D-Welt eines Bretts: Szene mit Himmel, Licht, Brett und Dekoration */
export class WorldScene {
  readonly scene = new THREE.Scene();
  readonly board: BoardView;
  readonly decor: Decor;
  private readonly sky: THREE.Mesh;
  readonly sun: THREE.DirectionalLight;
  private t = 0;

  constructor(
    readonly layout: Layout,
    quality: QualitySettings,
  ) {
    const theme = THEMES[layout.world];
    this.scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);
    this.sky = skyDome(theme.skyTop, theme.skyBottom);
    this.scene.add(this.sky);
    this.scene.add(new THREE.HemisphereLight(theme.ambient, theme.island, 1.5));
    this.sun = new THREE.DirectionalLight(theme.sun, 2.1);
    this.sun.castShadow = quality.shadows;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.board = new BoardView(layout, theme, quality);
    const r = this.board.radius;
    const c = this.board.center;
    this.sun.position.set(c.x + r * 0.8, c.y + r * 1.4, c.z + r * 0.5);
    this.sun.target.position.copy(c);
    const cam = this.sun.shadow.camera;
    cam.left = cam.bottom = -r * 1.1;
    cam.right = cam.top = r * 1.1;
    cam.near = 1;
    cam.far = r * 5;
    this.scene.add(this.sun, this.sun.target, this.board.group);
    this.decor = FACTORIES[layout.world]({
      layout,
      theme,
      quality,
      rng: new Rng(hashString(layout.id)),
      center: c.clone(),
      radius: r,
    });
    this.scene.add(this.decor.group);
  }

  update(dt: number, cameraPos: THREE.Vector3): void {
    this.t += dt;
    this.board.update(dt);
    this.decor.update(dt, this.t);
    this.sky.position.copy(cameraPos);
  }

  dispose(): void {
    this.board.dispose();
    this.decor.dispose?.();
    this.sky.geometry.dispose();
    (this.sky.material as THREE.Material).dispose();
  }
}
