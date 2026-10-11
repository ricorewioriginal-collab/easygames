import * as THREE from 'three';
import { Engine, type Screen } from '../render/engine';
import { QUALITY_PRESETS } from '../render/quality';
import {
  CAR_BODIES,
  createActors,
  createCarPreview,
  type ActorLook,
  type CarBody,
  type CarDecal,
} from '../render/actors';
import {
  NEUTRAL_CAR_INPUT,
  type CarState,
  type SimEvent,
  type SimState,
  type TeamId,
} from '@shared/sim/types';

/**
 * actors-Labor (?lab=actors&body=flitzer|…|all&decal=…&team=0|1|both&anim=drive|boost|dodge|demo|goal|ball|all
 * &t0=Sekunden Vorlauf&sub=Schritte je Bild&cam=x,y,z,tx,ty,tz)
 * Baut einen Dummy-Spielzustand (Autos auf Kreisen, Boost, Ausweichen, Zerstörung, Tor) und zeigt ihn mit den Akteuren.
 */
export function startActorsLab(params: URLSearchParams): void {
  const host = document.getElementById('app');
  if (!host) return;
  const lab = { errors: [] as string[], frames: 0 };
  (window as unknown as { __lab: typeof lab }).__lab = lab;
  window.addEventListener('error', (e) => lab.errors.push(String(e.message || e.error)));
  window.addEventListener('unhandledrejection', (e) =>
    lab.errors.push('Promise: ' + String((e as PromiseRejectionEvent).reason)),
  );

  const bodyP = params.get('body') ?? 'flitzer';
  const anim = params.get('anim') ?? 'drive';
  const teamP = params.get('team') ?? '0';
  const decalP = params.get('decal');
  const ids = CAR_BODIES.map((b) => b.id);
  const all = bodyP === 'all';
  const decals: CarDecal[] = ['streifen', 'blitz', 'punkte', 'keins', 'streifen'];
  const teams: TeamId[] = teamP === 'both' ? [0, 1] : [teamP === '1' ? 1 : 0];

  // Autos: eine Reihe je Team
  const looks: ActorLook[] = [];
  const carTeams: TeamId[] = [];
  const slots: Array<[number, number]> = []; // Mittelpunkt (x, z)
  const bodiesShown: CarBody[] = all
    ? ids
    : [(ids.includes(bodyP as CarBody) ? bodyP : 'flitzer') as CarBody];
  teams.forEach((team, row) => {
    bodiesShown.forEach((b, i) => {
      looks.push({
        body: b,
        decal: (decalP as CarDecal | null) ?? (all ? (decals[i] as CarDecal) : 'streifen'),
      });
      carTeams.push(team);
      const spacing = all ? 3.3 : 5;
      slots.push([(i - (bodiesShown.length - 1) / 2) * spacing, row * 3.6 - (teams.length - 1) * 1.8]);
    });
  });
  const N = looks.length;
  const radius = all ? 1.15 : 2.4;

  const engine = new Engine(host, { ...QUALITY_PRESETS.high, pixelRatio: 1 });
  engine.autoQuality = false;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080f);
  scene.fog = new THREE.Fog(0x07080f, 25, 70);
  scene.add(new THREE.HemisphereLight(0x6f7fb8, 0x151a2c, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 10, 6);
  scene.add(key);
  const rimA = new THREE.PointLight(0xff7a1a, 12, 14);
  rimA.position.set(-6, 2.5, -4);
  const rimB = new THREE.PointLight(0x19c8ff, 12, 14);
  rimB.position.set(6, 2.5, -4);
  scene.add(rimA, rimB);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0a0d18, metalness: 0.4, roughness: 0.6 }),
  );
  scene.add(ground);
  const grid = new THREE.GridHelper(80, 80, 0x1c8bc0, 0x143048);
  grid.position.y = 0.003;
  scene.add(grid);

  const actors = createActors(engine.quality, N);
  scene.add(actors.group);
  actors.setLooks(looks);

  const camera = new THREE.PerspectiveCamera(46, 1.6, 0.1, 200);
  const camP = params.get('cam')?.split(',').map(Number);
  if (camP && camP.length >= 6 && camP.every(Number.isFinite)) {
    camera.position.set(camP[0] as number, camP[1] as number, camP[2] as number);
    camera.lookAt(camP[3] as number, camP[4] as number, camP[5] as number);
  } else if (all) {
    camera.position.set(0, teams.length > 1 ? 8.5 : 5.2, teams.length > 1 ? 13 : 12.5);
    camera.lookAt(0, 0.4, -0.5);
  } else {
    camera.position.set(4.6, 2.6, 6.2);
    camera.lookAt(0, 0.7, 0);
  }

  // Dummy-Zustand
  const cars: CarState[] = [];
  for (let i = 0; i < N; i++) {
    cars.push({
      id: i,
      team: carTeams[i] as TeamId,
      pos: [0, 0.18, 0],
      quat: [0, 0, 0, 1],
      vel: [0, 0, 0],
      angVel: [0, 0, 0],
      boost: 70,
      wheelsOnSurface: 4,
      jumpUsed: false,
      canDodge: true,
      demolished: 0,
      dodgeTimer: 0,
      jumpTimer: 0,
      boosting: false,
      input: { ...NEUTRAL_CAR_INPUT },
      supersonic: false,
    });
  }
  const state: SimState = {
    tick: 0,
    phase: 'playing',
    phaseTimer: 0,
    clock: 300,
    overtime: false,
    score: [0, 0],
    cars,
    ball: { pos: [0, 1.6, -4], vel: [0, 0, 0], angVel: [2.5, 4, 1.2] },
    pads: [
      { pos: [-6, 0, -6], big: true, active: true, timer: 0 },
      { pos: [6, 0, -6], big: false, active: true, timer: 0 },
    ],
    lastTouch: 0,
    prevTouch: -1,
    winner: -1,
    rngState: 1,
  };

  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const Y = new THREE.Vector3(0, 1, 0);
  const X = new THREE.Vector3(1, 0, 0);
  let t = 0;
  let events: SimEvent[] = [];
  const every = (t0: number, t1: number, period: number, offset: number): boolean =>
    Math.floor((t1 - offset) / period) > Math.floor((t0 - offset) / period);

  const modeBoost = anim === 'boost' || anim === 'all';
  const modeDodge = anim === 'dodge' || anim === 'all';
  const modeDemo = anim === 'demo' || anim === 'all';
  const modeGoal = anim === 'goal' || anim === 'all';
  const modeBall = anim === 'ball' || anim === 'all' || anim === 'goal';
  const pose = params.get('pose'); // Standbild: Gierwinkel in Grad
  const speedBase = anim === 'boost' || anim === 'all' ? 7.5 : 4.5;

  function step(dt: number): void {
    const t0 = t;
    t += dt;
    events = [];
    for (let i = 0; i < N; i++) {
      const c = cars[i] as CarState;
      const [cx, cz] = slots[i] as [number, number];
      const v = (modeBoost ? speedBase + 2 : speedBase) * (1 + (i % 3) * 0.08);
      const w = v / radius;
      const th = w * t + i * 1.3;
      const x = pose !== null ? cx : cx + Math.cos(th) * radius;
      const z = pose !== null ? cz : cz + Math.sin(th) * radius;
      // Fahrtrichtung (−sin, cos); Gier ψ = −θ
      qa.setFromAxisAngle(Y, pose !== null ? (Number(pose) * Math.PI) / 180 : -th);
      let y = 0.18;
      let wos = 4;
      c.dodgeTimer = 0;
      c.input.steer = pose !== null ? 0 : 0.7;
      c.input.throttle = 1;
      c.boosting = modeBoost && Math.floor(t * 0.7 + i * 0.4) % 4 !== 3;
      c.supersonic = anim === 'boost' && c.boosting && i % 2 === 0;
      // Ausweichen: Sprung, Flip, Landung (Periode 2,6 s)
      if (modeDodge) {
        const ph = ((t + i * 0.45) % 2.6) / 2.6;
        if (every(t0 + i * 0.45, t + i * 0.45, 2.6, 0)) events.push({ t: 'jump', car: i, kind: 'jump' });
        if (ph > 0.18 && ph < 0.5) {
          const a = (ph - 0.18) / 0.32;
          y = 0.18 + 1.6 * Math.sin(a * Math.PI);
          wos = 0;
          if (ph > 0.24 && ph < 0.42) {
            c.dodgeTimer = 0.4;
            qb.setFromAxisAngle(X, ((ph - 0.24) / 0.18) * Math.PI * 2);
            qa.multiply(qb);
          }
          if (Math.abs(ph - 0.24) < 0.012) events.push({ t: 'jump', car: i, kind: 'dodge' });
        }
      }
      // Zerstörung: Auto 1 (oder alle gestaffelt) wird alle 4,5 s zerstört
      if (modeDemo) {
        const per = 4.5;
        const ph = (t + i * 0.8) % per;
        if (every(t0 + i * 0.8, t + i * 0.8, per, 1.2))
          events.push({ t: 'demo', victim: i, attacker: (i + 1) % N });
        c.demolished = ph > 1.2 && ph < 3.1 ? 3.1 - ph : 0;
      } else c.demolished = 0;
      c.pos = [x, y, z];
      c.quat = [qa.x, qa.y, qa.z, qa.w];
      c.vel = pose !== null ? [0, 0, 0] : [-Math.sin(th) * v, 0, Math.cos(th) * v];
      c.wheelsOnSurface = wos;
    }
    // Ball
    const b = state.ball;
    if (modeBall) {
      const bx = Math.sin(t * 1.1) * (all ? 9 : 6);
      b.pos = [bx, 1.6 + 0.5 * Math.sin(t * 2), all ? -4.5 : -2.5];
      b.vel = [Math.cos(t * 1.1) * (all ? 9 : 6) * 1.1 * (anim === 'ball' ? 4 : 2.2), 0, 0];
      state.lastTouch = (Math.floor(t / 1.6) % (N + 1)) - 1;
      if (every(t0, t, 1.6, 0.2))
        events.push({ t: 'touch', car: Math.max(0, state.lastTouch), speed: 20, ballSpeed: 28 });
      if (every(t0, t, 3.1, 0.5)) events.push({ t: 'wall', speed: 30 });
    } else {
      b.pos = [all ? 0 : -4.5, 1.6 + 0.3 * Math.sin(t * 2), all ? -4.5 : -5];
      b.vel = [0, 0, 0];
      state.lastTouch = 0;
    }
    if (modeGoal && every(t0, t, 5, 1)) {
      b.pos = [0, 1.4, -1];
      events.push({ t: 'goal', team: (Math.floor(t / 5) % 2) as TeamId, scorer: 0, assist: -1, speed: 40 });
    }
    // Pads
    if (every(t0, t, 2.2, 0.4)) events.push({ t: 'pad', car: 0, pad: 0, big: true });
    if (every(t0, t, 1.7, 0.4)) events.push({ t: 'pad', car: N - 1, pad: 1, big: false });
    if (params.get('nan') && Math.floor(t * 30) % 7 === 0) {
      // Müll aus dem Netz: Auto 0 und Ball mit ungültigen Werten
      (cars[0] as CarState).pos = [NaN, 0.18, Infinity];
      (cars[0] as CarState).quat = [0, 0, 0, 0];
      (cars[0] as CarState).vel = [NaN, NaN, NaN];
      b.angVel = [NaN, 1, 1];
      b.pos = [1, NaN, 1];
    }
    actors.update(dt, state, events);
  }

  // Vorlauf
  const pre = Number(params.get('t0') ?? (anim === 'demo' ? 1.0 : anim === 'goal' ? 1.4 : 1.4));
  const FIXED = 1 / 30;
  for (let s = 0; s < Math.round(pre / FIXED); s++) step(FIXED);
  const sub = Math.max(0, Number(params.get('sub') ?? 1));

  const prev = params.get('preview') ? createCarPreview(looks[0] as ActorLook, carTeams[0] as TeamId) : null;
  if (prev) {
    prev.object.position.set(-2.2, 0, 1.5);
    scene.add(prev.object);
  }

  const screen: Screen = {
    scene,
    camera,
    update(): void {
      for (let k = 0; k < sub; k++) step(FIXED);
      prev?.update(FIXED);
      lab.frames++;
    },
  };
  engine.setScreen(screen);
  engine.start();
}
