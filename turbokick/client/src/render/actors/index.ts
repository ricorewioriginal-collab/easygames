import * as THREE from 'three';
import { BALL_RADIUS, CAR_HALF, type SimEvent, type SimState, type TeamId } from '@shared/sim/types';
import { BlobShadow, TEAM_COLORS, finite3, isNum } from './common';
import { BallActor } from './ball';
import { CarActor, buildCarPreview, carSig } from './cars';
import { Fx } from './fx';
import type { QualitySettings } from '../quality';
import { disposeTree } from '../materials';
import type { ActorLook } from './types';

export { CAR_BODIES, CAR_DECALS } from './types';
export type { ActorLook, CarBody, CarDecal } from './types';

export interface ActorsView {
  /** Wird der Szene hinzugefügt (scene.add(view.group)) */
  readonly group: THREE.Group;
  /** looks[i] gehört zu state.cars[i]; Team kommt aus state.cars[i].team */
  setLooks(looks: ReadonlyArray<ActorLook>): void;
  /** Jedes Bild: dt, aktueller (ggf. interpolierter) Zustand, Ereignisse seit dem letzten Bild (dürfen leer sein). Setzt Positionen/Drehungen direkt aus dem Zustand. */
  update(dt: number, state: SimState, events: ReadonlyArray<SimEvent>): void;
  /** Welches Auto soll nicht gezeichnet werden (Ego-Perspektive o. Ä.), −1 = alle zeigen */
  setHidden(carId: number): void;
  /** Zusatz: Qualität nachträglich ändern (Partikelanteil) – optional aufrufen, wenn der Renderer die Qualität anpasst */
  setQuality(q: QualitySettings): void;
  dispose(): void;
}

const DEFAULT_LOOK: ActorLook = { body: 'flitzer', decal: 'keins' };

/**
 * Stellt Autos, Ball, Schatten und alle Ereignis-Effekte dar. Keine Allokation pro Bild im Normalbetrieb
 * (Neuaufbau eines Autos nur bei geändertem Look/Team).
 */
export function createActors(quality: QualitySettings, count: number): ActorsView {
  const group = new THREE.Group();
  group.name = 'actors';
  const fx = new Fx(quality.particles);
  const ball = new BallActor();
  const ballShadow = new BlobShadow(group, BALL_RADIUS * 3, BALL_RADIUS * 3, BALL_RADIUS, 0.7);
  group.add(ball.root);
  group.add(fx.group);

  let looks: ReadonlyArray<ActorLook> = [];
  const actors: Array<CarActor | undefined> = new Array<CarActor | undefined>(Math.max(0, count));
  const shadows: BlobShadow[] = [];
  let hidden = -1;
  let time = 0;
  let q = quality.particles;
  // Ballspur
  let prevBall = new THREE.Vector3();
  let hasPrevBall = false;
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();

  const lookOf = (i: number): ActorLook => looks[i] ?? DEFAULT_LOOK;

  function ensure(i: number, team: TeamId, demolished: number): CarActor {
    let a = actors[i];
    const look = lookOf(i);
    if (!a || a.sig !== carSig(look, team)) {
      const old = a;
      a = new CarActor(i, look, team);
      if (old) {
        // Zustand der Zerstörung/Respawn-Anzeige übernehmen
        a.exploded = old.exploded;
        old.dispose();
      } else if (demolished > 0) {
        a.exploded = true;
      }
      group.add(a.rig.root);
      actors[i] = a;
    }
    if (!shadows[i])
      shadows[i] = new BlobShadow(group, CAR_HALF[0] * 2.8, CAR_HALF[2] * 2.9, CAR_HALF[1], 0.62);
    return a;
  }

  function handle(e: SimEvent, state: SimState): void {
    const cars = state.cars;
    switch (e.t) {
      case 'goal': {
        if (!finite3(state.ball.pos)) return;
        const team = e.team === 1 ? 1 : 0;
        fx.goal(state.ball.pos[0], state.ball.pos[1], state.ball.pos[2], team);
        break;
      }
      case 'demo': {
        const v = cars[e.victim];
        if (!v || !finite3(v.pos)) return;
        fx.demo(v.pos[0], v.pos[1], v.pos[2], v.team);
        const a = actors[e.victim];
        if (a) a.exploded = true;
        break;
      }
      case 'pad': {
        const p = state.pads?.[e.pad];
        const c = cars[e.car];
        if (!p || !finite3(p.pos)) return;
        fx.pad(p.pos[0], p.pos[1], p.pos[2], c ? c.team : 0, e.big === true || p.big === true);
        break;
      }
      case 'jump': {
        const c = cars[e.car];
        if (!c || !finite3(c.pos)) return;
        fx.jump(
          c.pos[0],
          c.pos[1],
          c.pos[2],
          c.team,
          e.kind === 'dodge',
          (c.wheelsOnSurface ?? 0) > 0 || c.pos[1] < 0.7,
        );
        break;
      }
      case 'touch': {
        const c = cars[e.car];
        if (!c || !finite3(c.pos) || !finite3(state.ball.pos)) return;
        tmp.set(c.pos[0] - state.ball.pos[0], c.pos[1] - state.ball.pos[1], c.pos[2] - state.ball.pos[2]);
        if (tmp.lengthSq() < 1e-6) tmp.set(0, 1, 0);
        tmp.normalize();
        const b = state.ball.pos;
        fx.touch(
          b[0] + tmp.x * BALL_RADIUS,
          b[1] + tmp.y * BALL_RADIUS,
          b[2] + tmp.z * BALL_RADIUS,
          tmp.x,
          tmp.y,
          tmp.z,
          c.team,
          isNum(e.speed) ? e.speed : 10,
          isNum(e.ballSpeed) ? e.ballSpeed : 10,
        );
        ball.pulse(0.6);
        break;
      }
      case 'wall': {
        if (!finite3(state.ball.pos)) return;
        fx.wall(state.ball.pos[0], state.ball.pos[1], state.ball.pos[2], isNum(e.speed) ? e.speed : 10);
        break;
      }
      default:
        break;
    }
  }

  return {
    group,
    setLooks(l): void {
      looks = l.slice();
    },
    setHidden(id): void {
      hidden = id;
    },
    setQuality(nq): void {
      q = nq.particles;
      fx.q = Math.max(0, Math.min(1, q));
    },
    update(dt, state, events): void {
      const d = isNum(dt) ? Math.max(0, Math.min(0.1, dt)) : 0;
      time += d;
      if (!state || !Array.isArray(state.cars) || !state.ball) return;
      fx.q = Math.max(0, Math.min(1, q));
      const cars = state.cars;
      for (let i = 0; i < cars.length; i++) {
        const c = cars[i];
        if (c) ensure(i, c.team === 1 ? 1 : 0, c.demolished);
      }
      for (const e of events) handle(e, state);

      for (let i = 0; i < cars.length; i++) {
        const c = cars[i];
        const a = actors[i];
        if (!c || !a) continue;
        if (c.demolished > 0 && !a.exploded && finite3(c.pos)) {
          fx.demo(c.pos[0], c.pos[1], c.pos[2], c.team);
          a.exploded = true;
        }
        a.update(d, time, c, fx, i === hidden, q);
        (shadows[i] as BlobShadow).update(a.x, a.y, a.z, a.yaw, a.shown);
      }

      // Ball
      const lt = state.lastTouch;
      const toucher = lt >= 0 ? cars[lt] : undefined;
      ball.update(d, state.ball, toucher ? TEAM_COLORS[toucher.team === 1 ? 1 : 0].main : -1);
      ballShadow.update(ball.x, ball.y, ball.z, 0, true);
      if (d > 0 && ball.speed > 15 && q > 0.01) {
        tmp.set(ball.x, ball.y, ball.z);
        const dist = hasPrevBall ? tmp.distanceTo(prevBall) : 99;
        if (dist < 12) {
          const n = Math.min(14, Math.round((dist / 0.3) * q));
          const s = Math.min(1, (ball.speed - 15) / 30);
          for (let k = 0; k < n; k++) {
            tmp2.lerpVectors(prevBall, tmp, (k + 1) / n);
            fx.glow.emit(
              tmp2.x,
              tmp2.y,
              tmp2.z,
              0,
              0,
              0,
              ball.color,
              BALL_RADIUS * (1.0 + s * 0.5),
              BALL_RADIUS * 0.15,
              0.3 + s * 0.3,
              0.38 + s * 0.3,
            );
          }
        }
      }
      prevBall.set(ball.x, ball.y, ball.z);
      hasPrevBall = true;

      fx.update(d);
    },
    dispose(): void {
      for (const a of actors) a?.dispose();
      for (const s of shadows) s.dispose();
      ballShadow.dispose();
      ball.dispose();
      fx.dispose();
      disposeTree(group);
      actors.length = 0;
      shadows.length = 0;
      prevBall = new THREE.Vector3();
    },
  };
}

/** Auto für die Garage im Menü (dreht sich langsam, Räder rollen). Der Ursprung liegt am Boden unter dem Auto. */
export function createCarPreview(
  look: ActorLook,
  team: 0 | 1,
): { object: THREE.Group; update(dt: number): void; dispose(): void } {
  return buildCarPreview(look, team);
}
