import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ARENA } from '@shared/sim/types';
import type { SimState } from '@shared/sim/types';
import { Rng, hashString } from '@shared/rng';
import type { QualitySettings } from '../quality';
import { StandsView } from './crowd';
import { Fireworks, Weather } from './effects';
import { axisCoords, buildShell } from './geometry';
import { GoalsView } from './goals';
import { PadsView } from './pads';
import { SceneryView } from './scenery';
import { createUniforms, floorMaterial, hullMaterial } from './shaders';
import type { ArenaUniforms } from './shaders';
import { ARENA_THEMES, TEAM_COLORS, palette } from './themes';
import type { ArenaTheme } from './themes';

export { ARENA_THEMES } from './themes';
export type { ArenaTheme } from './themes';

export interface ArenaView {
  /** Alle Objekte der Arena (Szene.add(view.group)) */
  readonly group: THREE.Group;
  /** Setzt Nebel und Hintergrund der Szene (Lichter/Himmel liegen bereits in group) */
  applyTo(scene: THREE.Scene): void;
  /** Jedes Bild: dt in Sekunden, aktueller Zustand (Pads, Ballposition, Spielstand/Phase für die Anzeigetafel) */
  update(dt: number, state: SimState): void;
  /** Torjubel: team = Team, das GETROFFEN hat (0 oder 1) */
  celebrate(team: 0 | 1): void;
  /** Schatten ein-/ausschalten (Partikel-/Publikumsmenge wird nur beim Erzeugen festgelegt) */
  setQuality(q: QualitySettings): void;
  dispose(): void;
}

const CHEER_TIME = 7;
const FLASH_TIME = 3.2;
const PULSE_TIME = 4;

class ArenaImpl implements ArenaView {
  readonly group = new THREE.Group();
  private readonly u: ArenaUniforms;
  private readonly sun: THREE.DirectionalLight;
  private readonly hemi: THREE.HemisphereLight;
  private readonly fog: THREE.FogExp2;
  private scene: THREE.Scene | null = null;
  private readonly geos: THREE.BufferGeometry[] = [];
  private readonly mats: THREE.Material[] = [];
  private readonly pads: PadsView;
  private readonly goals: GoalsView;
  private readonly stands: StandsView;
  private readonly scenery: SceneryView;
  private readonly weather: Weather;
  private readonly fireworks: Fireworks;
  private time = 0;
  // Alter der Effekte in Sekunden (Infinity = aus)
  private flashAge: [number, number] = [Infinity, Infinity];
  private pulseAge = Infinity;
  private cheerAge = Infinity;

  constructor(theme: ArenaTheme, quality: QualitySettings) {
    const pal = palette(theme);
    const u = createUniforms(pal);
    this.u = u;
    const rng = new Rng(hashString('turbokick-arena-' + theme));
    const W = ARENA.halfWidth;
    const H = ARENA.height;
    const L = ARENA.halfLength;
    const R = ARENA.coveRadius;
    const GW = ARENA.goalHalfWidth;
    const GH = ARENA.goalHeight;

    this.fog = new THREE.FogExp2(pal.fog, pal.fogDensity);

    // Lichter
    this.hemi = new THREE.HemisphereLight(pal.hemiSky, pal.hemiGround, pal.hemiIntensity * 2);
    this.sun = new THREE.DirectionalLight(pal.lightCol, pal.lightIntensity * 2.2);
    const ld = new THREE.Vector3(...pal.lightDir).normalize().multiplyScalar(90);
    this.sun.position.copy(ld);
    this.sun.castShadow = quality.shadows;
    this.sun.shadow.mapSize.set(2048, 2048);
    const sc = this.sun.shadow.camera;
    sc.left = -66;
    sc.right = 66;
    sc.top = 74;
    sc.bottom = -74;
    sc.near = 20;
    sc.far = 220;
    sc.updateProjectionMatrix();
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.group.add(this.hemi, this.sun, this.sun.target);

    // Hülle: abgerundeter Quader mit Tor-Ausschnitten (Boden separat)
    const hullGeo = buildShell(
      [-W, 0, -L],
      [W, H, L],
      R,
      [axisCoords(-W, W, R, 8, [-GW, GW], 4), axisCoords(0, H, R, 8, [GH], 3), axisCoords(-L, L, R, 8, [], 6)],
      (t) => {
        if (t.maxY < 1e-4) return false; // ebener Boden: eigenes Mesh mit Markierungen
        return !(Math.abs(t.cx) < GW && t.cy < GH && Math.abs(t.cz) > L - R + 1e-3);
      },
    );
    this.geos.push(hullGeo);
    const hullMat = hullMaterial(u, pal);
    this.mats.push(hullMat);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.renderOrder = 2;
    hull.frustumCulled = false;
    this.group.add(hull);

    // Boden: Hauptfläche + Streifen vor den Toren (dort fehlt die Rundung)
    const main = new THREE.PlaneGeometry(2 * (W - R), 2 * (L - R)).rotateX(-Math.PI / 2);
    const strip = (s: number): THREE.BufferGeometry => new THREE.PlaneGeometry(2 * GW, R).rotateX(-Math.PI / 2).translate(0, 0, s * (L - R / 2));
    const floorGeo = mergeGeometries([main, strip(1), strip(-1)]);
    this.geos.push(floorGeo);
    const floorMat = floorMaterial(u, pal);
    this.mats.push(floorMat);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.group.add(floor);

    this.pads = new PadsView(pal);
    this.goals = new GoalsView(u);
    this.stands = new StandsView(u, pal, quality.particles, rng.fork(1));
    this.scenery = new SceneryView(theme, u, pal, rng.fork(2));
    this.weather = new Weather(theme, u, quality.particles, rng.fork(3));
    this.fireworks = new Fireworks(u, quality.particles, rng.fork(4));
    this.group.add(this.pads.group, this.goals.group, this.stands.group, this.scenery.group, this.weather.points, this.fireworks.points);
  }

  applyTo(scene: THREE.Scene): void {
    this.scene = scene;
    scene.fog = this.fog;
    scene.background = this.fog.color;
  }

  update(dt: number, state: SimState): void {
    this.time += dt;
    const u = this.u;
    u.uTime.value = this.time;
    u.uBall.value.set(state.ball.pos[0], state.ball.pos[1], state.ball.pos[2]);

    this.flashAge[0] += dt;
    this.flashAge[1] += dt;
    this.pulseAge += dt;
    this.cheerAge += dt;
    u.uFlash.value.set(flashValue(this.flashAge[0]), flashValue(this.flashAge[1]));
    const pk = Math.max(0, 1 - this.pulseAge / PULSE_TIME);
    u.uPulse.value = pk * pk * (0.65 + 0.35 * Math.sin(this.pulseAge * 11));
    const ck = Math.max(0, 1 - this.cheerAge / CHEER_TIME);
    u.uCheer.value = Math.min(1, ck * 2.2) * (ck > 0 ? 1 : 0);

    this.pads.update(dt, state);
    this.goals.update(state);
    this.weather.update(dt);
    this.fireworks.update(dt);
  }

  celebrate(team: 0 | 1): void {
    // Team 0 trifft ins Tor bei +z, Team 1 ins Tor bei −z
    this.flashAge[team === 0 ? 1 : 0] = 0;
    this.pulseAge = 0;
    this.cheerAge = 0;
    this.u.uPulseCol.value.setHex(TEAM_COLORS[team]);
    this.fireworks.celebrate(team);
  }

  setQuality(q: QualitySettings): void {
    this.sun.castShadow = q.shadows;
  }

  dispose(): void {
    if (this.scene && this.scene.fog === this.fog) this.scene.fog = null;
    this.sun.shadow.map?.dispose();
    this.pads.dispose();
    this.goals.dispose();
    this.stands.dispose();
    this.scenery.dispose();
    this.weather.dispose();
    this.fireworks.dispose();
    for (const g of this.geos) g.dispose();
    for (const m of this.mats) m.dispose();
    this.group.removeFromParent();
  }
}

/** Blitzverlauf: schnelles Flackern, das abklingt */
function flashValue(age: number): number {
  if (!(age < FLASH_TIME)) return 0;
  const k = 1 - age / FLASH_TIME;
  return Math.min(1, k * (0.55 + 0.45 * Math.sin(age * 20)) + (age < 0.25 ? 0.6 : 0));
}

export function createArena(theme: ArenaTheme, quality: QualitySettings): ArenaView {
  if (!ARENA_THEMES.some((t) => t.id === theme)) theme = 'neon';
  return new ArenaImpl(theme, quality);
}
