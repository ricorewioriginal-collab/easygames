// Prozedurale, stilisierte Low-Poly-Menschen für RicoLife 3D.
//
// Aufbau: EIN THREE.SkinnedMesh pro Figur, ein gemeinsames MeshLambertMaterial für alle Figuren (Farben stecken in
// Vertexfarben). Jeder Vertex hängt starr an genau einem Bone (25 Bones inkl. Gesichts-Bones für Augen, Mund, Brauen).
// Animationen sind rein prozedural (Sinus-Funktionen je AnimId) mit ~0,2 s Überblendung, Blinzeln, Atmen und Mimik.
//
// ===================== Koordinaten- und Positionierungskonvention =====================
// 1 Einheit = 1 m, Figur schaut nach +z, Füße bei lokal y = 0. Der Aufrufer setzt object.position und object.rotation.y.
// object.position.y = Sim.rt.y, also die y-Höhe des Slots (siehe data/objects.ts):
//  • Stehen/Gehen (Slot 'use'/'stand'): object.y = Boden (0 bzw. Etagenhöhe/Treppe).
//  • Sitzen (Slot 'sit', y ≈ 0,45): object.y = slot.y. Die Sitzpose legt das Gesäß (Unterseite des Beckens) genau auf
//    lokal y = 0; die Unterschenkel hängen nach unten und werden so angewinkelt, dass die Füße bei lokal y = −seatY den
//    Boden berühren. seatY = HumanAnimState.seatY (Standard 0,45). Kinder lassen die Beine baumeln.
//    Von Natur aus sitzende Anims: sit, eat, tv, type, piano, chess, toilet, swing, cuddle (siehe SEATED_ANIMS).
//    Für jede andere Anim im Sitzen (z. B. 'read', 'talk', 'phone' auf dem Sofa) seatY mitgeben → Beine/Hüfte sitzen,
//    Oberkörper animiert normal.
//  • Liegen ('sleep', 'baby'; Slot 'sleep', y ≈ 0,5): object.y = slot.y (Matratzenoberkante). Die Figur liegt auf dem
//    Rücken, Rücken auf lokal y = 0, Kopf Richtung lokal −z, Körpermitte am Ursprung (Bett-Slot = Bettmitte, Kissen bei −z).
//  • Auf dem Boden: 'sitfloor', 'play' (Schneidersitz), 'garden'/'repair' (Knien), 'pet' (Hocke), 'crawl', 'pushups',
//    'yoga' – alles relativ zu lokal y = 0 = Boden.
//  • 'bath': sitzt mit ausgestreckten Beinen, Gesäß bei lokal y = 0 → object.y = Wannenboden (slot.y).
//  • 'swim': waagerecht, Brustmitte bei lokal y ≈ 0 → object.y = Wasseroberfläche.
// =====================================================================================
import * as THREE from 'three';
import type { AgeStage, Appearance, EmotionId, OutfitKind } from '../data/types';
import type { AnimId } from '../sim/types';
import { GeoBuilder, PI, clamp, figureHighlightMaterial, figureMaterial, hash01, lerp, makeBones, makeSkinned, mix, osc, pulse, shade, smooth01 } from './anim';

export interface HumanAnimState {
  anim: AnimId;
  /** Sekunden seit Anim-Start (Echtzeit) */
  t: number;
  emo: EmotionId;
  emoPower: number;
  talking?: boolean;
  /** Requisite in der Hand: 'plate','cup','book','phone','guitar','baby','tray','mic','fishingrod','camera','brush','box','dirty' */
  holding?: string | null;
  /** Sitzhöhe (= slot.y) wenn die Figur sitzt; erzwingt die Sitz-Beinhaltung auch für stehende Anims */
  seatY?: number;
}

/** Anims, die immer im Sitzen gespielt werden (seatY Standard 0,45) */
export const SEATED_ANIMS: ReadonlySet<AnimId> = new Set<AnimId>(['sit', 'eat', 'tv', 'type', 'piano', 'chess', 'toilet', 'swing', 'cuddle']);

// ---------- Bones ----------
const B = {
  root: 0, hips: 1, spine: 2, chest: 3, neck: 4, head: 5, eyes: 6, mouth: 7, mouthL: 8, mouthR: 9, browL: 10, browR: 11, blush: 12,
  upArmL: 13, foreArmL: 14, handL: 15, upArmR: 16, foreArmR: 17, handR: 18,
  thighL: 19, shinL: 20, footL: 21, thighR: 22, shinR: 23, footR: 24,
} as const;
const NB = 25;

// ---------- Maße ----------
interface Dims {
  H: number; s: number; ws: number; hs: number;
  hrx: number; hry: number; hrz: number; hcY: number; headY: number;
  neckY: number; shY: number; shX: number; chestY: number; spineY: number; hipY: number; hipX: number; crotchY: number;
  kneeY: number; ankleY: number; thighLen: number; shinLen: number; upLen: number; foreLen: number;
  thighR: number; shinR: number; armR: number; foreR: number;
  chestRx: number; chestRz: number; shRx: number; waistRx: number; hipRx: number;
  footLen: number; footH: number;
  eyeY: number; eyeX: number; mouthY: number; browY: number; noseY: number;
  baby: boolean; kid: boolean; senior: boolean; frame: number; weight: number; mouthOut: number;
}

const AGE_T: Record<AgeStage, { H: number; hs: number; leg: number; hv: number }> = {
  baby: { H: 0.6, hs: 0.25, leg: 0.27, hv: 0 },
  toddler: { H: 0.88, hs: 0.29, leg: 0.33, hv: 0.02 },
  child: { H: 1.2, hs: 0.32, leg: 0.41, hv: 0.03 },
  teen: { H: 1.6, hs: 0.33, leg: 0.45, hv: 0.05 },
  youngadult: { H: 1.75, hs: 0.34, leg: 0.46, hv: 0.08 },
  adult: { H: 1.75, hs: 0.34, leg: 0.46, hv: 0.08 },
  senior: { H: 1.7, hs: 0.34, leg: 0.45, hv: 0.07 },
};

function computeDims(look: Appearance, age: AgeStage): Dims {
  const a = AGE_T[age];
  const hgt = clamp(look.height || 0, -1, 1), w = clamp(look.weight || 0, -1, 1), m = clamp(look.muscle || 0, -1, 1);
  const H = a.H * (1 + a.hv * hgt);
  const s = H / 1.75;
  const ws = Math.pow(s, 0.72) * (age === 'baby' || age === 'toddler' ? 1.08 : 1);
  const hs = a.hs * (1 + 0.04 * hgt) * (age === 'baby' ? 1 : 1);
  const kid = age === 'baby' || age === 'toddler' || age === 'child';
  // Kopfform: Radien
  const shp = ((look.headShape | 0) % 4 + 4) % 4;
  const shapeMul: [number, number, number][] = [[0.95, 1.06, 0.98], [1.02, 0.98, 1.0], [1.0, 1.0, 1.0], [1.0, 1.02, 0.98]];
  const sm = shapeMul[shp]!;
  const hrx = hs * 0.45 * sm[0] * (1 + 0.04 * w), hry = hs * 0.5 * sm[1], hrz = hs * 0.47 * sm[2];
  const hcY = H - hry;
  const headY = hcY - hry * 0.62;
  const neckLen = (kid ? 0.025 : 0.05) * s + 0.01;
  const shY = hcY - hry * 0.92 - neckLen;
  const neckY = shY - 0.02 * s;
  const hipY = H * a.leg;
  const torso = shY - hipY;
  const chestY = hipY + torso * 0.5;
  const spineY = hipY + torso * 0.14;
  const frame = look.frame ? 1 : 0;
  const wm = 1 + 0.16 * w + 0.07 * m;
  const shX = (frame ? 0.2 : 0.178) * ws * (1 + 0.08 * w + 0.1 * m);
  const shRx = shX * 0.9;
  const chestRx = (frame ? 0.162 : 0.15) * ws * wm;
  const chestRz = 0.112 * ws * (1 + 0.22 * w + 0.06 * m);
  const waistRx = (frame ? 0.135 : 0.128) * ws * (1 + 0.32 * w);
  const hipRx = (frame ? 0.145 : 0.16) * ws * (1 + 0.24 * w);
  const footH = 0.08 * ws;
  const ankleY = footH * 1.05;
  const kneeY = ankleY + (hipY - ankleY) * 0.5;
  const lw = 1 + 0.3 * w + 0.15 * m;
  return {
    H, s, ws, hs, hrx, hry, hrz, hcY, headY, neckY, shY, shX, chestY, spineY, hipY,
    hipX: hipRx * 0.5, crotchY: hipY - 0.075 * ws,
    kneeY, ankleY, thighLen: hipY - kneeY, shinLen: kneeY - ankleY,
    upLen: torso * 0.48, foreLen: torso * 0.42,
    thighR: 0.084 * ws * lw, shinR: 0.06 * ws * lw, armR: 0.056 * ws * (1 + 0.28 * w + 0.28 * m), foreR: 0.047 * ws * (1 + 0.22 * w + 0.2 * m),
    chestRx, chestRz, shRx, waistRx, hipRx,
    footLen: 0.26 * ws, footH,
    eyeY: hcY - hs * 0.06, eyeX: hrx * 0.4, mouthY: hcY - hs * 0.3, browY: hcY + hs * 0.08, noseY: hcY - hs * 0.17,
    baby: age === 'baby', kid, senior: age === 'senior', frame, weight: w,
    mouthOut: kid || age === 'teen' ? 0 : (look.beard | 0) === 2 ? hrz * 0.1 : (look.beard | 0) === 1 ? hrz * 0.03 : 0,
  };
}

/** z-Koordinate der Gesichtsoberfläche (Ellipsoid) an Stelle x, y */
function faceZ(d: Dims, x: number, y: number): number {
  const u = x / d.hrx, v = (y - d.hcY) / d.hry;
  return d.hrz * Math.sqrt(Math.max(0.04, 1 - u * u - v * v));
}

// ---------- Kleidungsstile ----------
const LONG_SLEEVE = new Set([1, 2, 3, 5, 7, 9, 10]);
const SHORT_SLEEVE = new Set([0, 4]);
const LONG_PANTS = new Set([0, 1, 4, 5, 6]);

// ---------- Geometrie ----------
function buildGeometry(look: Appearance, age: AgeStage, kind: OutfitKind, d: Dims): THREE.BufferGeometry {
  const g = new GeoBuilder();
  const of = look.outfits?.[kind] ?? look.outfits?.everyday ?? { top: 0, topColor: '#33658a', bottom: 0, bottomColor: '#2f4858', shoes: 0, shoeColor: '#f4f1ea' };
  const skin = look.skin || '#e8bc96';
  const skinD = shade(skin, 0.9);
  const hair = look.hairColor || '#3b2a20';
  let top = of.top | 0, bot = of.bottom | 0, shoes = of.shoes | 0;
  let tc = of.topColor || '#33658a';
  let bc = of.bottomColor || '#2f4858';
  const sc = of.shoeColor || '#3b2a20';
  if (d.baby) {
    // Babys tragen einen Strampler in der Oberteilfarbe
    top = 9; bot = 0; bc = tc; shoes = 5;
  }
  if (top === 9 && !d.baby) tc = of.topColor || '#9fb7d9';
  const dress = top === 8, swimsuit = top === 11, coat = top === 10;
  const sleeve: 'long' | 'short' | 'none' = LONG_SLEEVE.has(top) ? 'long' : SHORT_SLEEVE.has(top) ? 'short' : 'none';
  const pelvisC = dress || swimsuit ? tc : bc;
  const legStyle: 'long' | 'shorts' | 'skirt' | 'trunks' | 'bare' = dress || swimsuit ? 'bare' : LONG_PANTS.has(bot) ? 'long' : bot === 2 ? 'shorts' : bot === 3 ? 'skirt' : bot === 7 ? 'trunks' : 'long';
  const { s, ws, hs } = d;

  // ----- Rumpf -----
  g.cyl(B.hips, pelvisC, d.waistRx, d.hipRx * 0.94, d.hipY + 0.05 * s - d.crotchY, 0, (d.crotchY + d.hipY + 0.05 * s) / 2, 0, 0, 0, 0, 8, d.chestRz / d.waistRx * 0.95);
  g.sph(B.hips, pelvisC, d.hipRx * 0.8, 0.04 * ws, d.chestRz * 0.85, 0, d.crotchY + 0.005, 0, 8, 4);
  const bellyH = d.chestY + 0.03 * s - (d.hipY + 0.02 * s);
  g.cyl(B.spine, tc, d.chestRx * 0.96, d.waistRx, bellyH, 0, d.hipY + 0.02 * s + bellyH / 2, 0, 0, 0, 0, 8, d.chestRz / d.chestRx);
  const chestH = d.shY - d.chestY;
  g.cyl(B.chest, tc, d.shRx, d.chestRx * 0.96, chestH, 0, d.chestY + chestH / 2, 0, 0, 0, 0, 8, d.chestRz / d.chestRx);
  g.sph(B.chest, tc, d.shRx, 0.05 * ws, d.chestRz * 0.98, 0, d.shY, 0, 8, 4);
  // Kleiderdetails am Oberkörper
  const fz = d.chestRz * 0.97;
  const light = shade(tc, 1.35), dark = shade(tc, 0.72);
  if (top === 1 || top === 4 || top === 9) {
    g.ring(B.chest, light, 0.05 * ws, 0.012 * ws, 0, d.shY + 0.025 * s, 0.005, PI / 2 - 0.2, 0, 0, 1, 1, 8);
    if (top !== 4) for (let i = 0; i < 3; i++) g.sph(B.chest, top === 9 ? '#f4f1ea' : dark, 0.009 * ws, 0.009 * ws, 0.006 * ws, 0, d.shY - (0.07 + i * 0.09) * s, fz + 0.002, 4, 3);
  } else if (top === 2) {
    g.ring(B.chest, dark, 0.05 * ws, 0.013 * ws, 0, d.shY + 0.02 * s, 0.0, PI / 2, 0, 0, 1, 1, 8);
  } else if (top === 3) {
    g.sph(B.chest, dark, d.shRx * 0.55, 0.07 * ws, 0.07 * ws, 0, d.shY + 0.01, -d.chestRz * 0.75, 8, 5);
    g.box(B.spine, dark, d.waistRx * 1.1, 0.07 * s, 0.01, 0, d.hipY + bellyH * 0.4, d.chestRz * 0.9);
  } else if (top === 5 || top === 7) {
    // offene Jacke: helles Hemd in der Mitte
    g.box(B.chest, '#f2efe8', 0.07 * ws, chestH * 0.95, 0.02, 0, d.chestY + chestH * 0.5, fz - 0.004, 0, 0, 0);
    g.box(B.spine, '#f2efe8', 0.06 * ws, bellyH * 0.9, 0.02, 0, d.hipY + bellyH * 0.55, d.chestRz * 0.9 - 0.004, 0, 0, 0);
    if (top === 5) {
      g.box(B.chest, dark, 0.035 * ws, chestH * 0.8, 0.012, 0.045 * ws, d.chestY + chestH * 0.45, fz + 0.004, 0, 0, 0.25);
      g.box(B.chest, dark, 0.035 * ws, chestH * 0.8, 0.012, -0.045 * ws, d.chestY + chestH * 0.45, fz + 0.004, 0, 0, -0.25);
    }
  } else if (top === 10) {
    g.box(B.spine, dark, 0.06 * ws, 0.04 * s, 0.01, 0.06 * ws, d.hipY + bellyH * 0.35, d.chestRz * 0.95);
  }

  // ----- Hals & Kopf -----
  const neckR = 0.042 * ws * (1 + 0.2 * d.weight);
  g.cyl(B.neck, skin, neckR, neckR * 1.08, d.headY + 0.03 - (d.neckY - 0.01), 0, (d.headY + 0.03 + d.neckY - 0.01) / 2, 0, 0, 0, 0, 7);
  const shp = ((look.headShape | 0) % 4 + 4) % 4;
  const jaw = clamp(look.jaw || 0, -1, 1);
  const shapeK = d.kid ? 0.5 : 1;
  g.sph(B.head, skin, d.hrx, d.hry, d.hrz, 0, d.hcY, 0, 12, 9, 0, 0, 0, (v) => {
    if (shp === 2) {
      const mx = Math.max(Math.abs(v.x), Math.abs(v.y) * 0.9, 0.0001);
      const k = 0.28 * shapeK * Math.max(0, 1 - Math.max(0, v.z) * 0.6);
      v.x = lerp(v.x, v.x / mx * Math.sign(1), k) ;
    }
    if (shp === 3) v.x *= 1 + 0.12 * shapeK * v.y;
    if (v.y < 0) v.x *= 1 + 0.13 * jaw * -v.y * shapeK;
    if (v.y < -0.3) v.z *= 1 + 0.06 * jaw * shapeK;
  });
  // Ohren
  for (const sg of [1, -1]) g.sph(B.head, skinD, 0.035 * hs, 0.075 * hs, 0.05 * hs, sg * d.hrx * 0.97, d.eyeY - 0.03 * hs, -0.02 * hs, 6, 4);
  // Nase
  const nsz = (1 + 0.3 * clamp(look.noseSize || 0, -1, 1)) * hs * (d.kid ? 0.8 : 1);
  const nz = faceZ(d, 0, d.noseY);
  const noseC = shade(skin, 0.94);
  switch (((look.nose | 0) % 4 + 4) % 4) {
    case 0: g.sph(B.head, noseC, 0.04 * nsz, 0.075 * nsz, 0.05 * nsz, 0, d.noseY + 0.01 * hs, nz - 0.005, 6, 4, -0.25); break;
    case 1: g.sph(B.head, noseC, 0.045 * nsz, 0.045 * nsz, 0.045 * nsz, 0, d.noseY, nz - 0.008, 6, 4); break;
    case 2: g.sph(B.head, noseC, 0.07 * nsz, 0.05 * nsz, 0.05 * nsz, 0, d.noseY, nz - 0.01, 6, 4); break;
    default: g.sph(B.head, noseC, 0.038 * nsz, 0.085 * nsz, 0.06 * nsz, 0, d.noseY + 0.015 * hs, nz - 0.004, 6, 4, -0.4); break;
  }
  // Augen (am Augen-Bone, Blinzeln durch y-Skalierung)
  const eShape = ((look.eyes | 0) % 4 + 4) % 4;
  const eMul: [number, number][] = [[1.12, 0.82], [1, 1], [1.12, 0.62], [1.2, 1.18]];
  const em = eMul[eShape]!;
  const eyeBig = d.kid ? 1.15 : 1;
  const ew = 0.08 * hs * em[0] * eyeBig, eh = 0.09 * hs * em[1] * eyeBig;
  const irisC = mix(look.eyeColor || '#3b2a1d', '#000000', 0.25);
  for (const sg of [1, -1]) {
    const ex = sg * d.eyeX, ez = faceZ(d, ex, d.eyeY);
    g.sph(B.eyes, '#f7f5f0', ew, eh, ew * 0.55, ex, d.eyeY, ez - ew * 0.2, 8, 6);
    const ir = Math.min(ew * 0.82, eh * 0.9);
    g.sph(B.eyes, irisC, ir, ir * 1.1, ir * 0.45, ex + sg * 0.004 * hs, d.eyeY - eh * 0.04, ez + ew * 0.22, 7, 5);
    g.sph(B.eyes, '#ffffff', ir * 0.3, ir * 0.3, ir * 0.15, ex + ir * 0.35, d.eyeY + ir * 0.38, ez + ew * 0.38, 4, 3);
  }
  // Brauen
  const browC = shade(hair, 0.75);
  const bh = [0.02, 0.026, 0.04][((look.brows | 0) % 3 + 3) % 3]! * hs;
  for (const [bone, sg] of [[B.browL, 1], [B.browR, -1]] as const) {
    const bx = sg * d.eyeX;
    g.box(bone, browC, 0.13 * hs, bh, 0.03 * hs, bx, d.browY, faceZ(d, bx, d.browY) + 0.004, 0, sg * 0.2, sg * -0.06);
  }
  // Mund: Mitte (öffnet per y-Skalierung) + Mundwinkel (heben/senken)
  const mz = faceZ(d, 0, d.mouthY) + d.mouthOut;
  const mw = 0.075 * hs, mh = 0.016 * hs;
  g.box(B.mouth, '#6e2a30', mw, mh, 0.03 * hs, 0, d.mouthY, mz - 0.008);
  for (const [bone, sg] of [[B.mouthL, 1], [B.mouthR, -1]] as const) {
    const cx = sg * (mw / 2 + 0.016 * hs);
    g.box(bone, '#6e2a30', 0.036 * hs, mh * 0.9, 0.028 * hs, cx, d.mouthY, faceZ(d, cx, d.mouthY) + d.mouthOut - 0.008, 0, sg * 0.35, 0);
  }
  // Wangenröte (versteckt, Bone-Skalierung)
  for (const sg of [1, -1]) {
    const cx = sg * d.hrx * 0.58, cy = d.eyeY - 0.13 * hs;
    g.sph(B.blush, '#e98a8f', 0.06 * hs, 0.035 * hs, 0.02 * hs, cx, cy, faceZ(d, cx, cy) - 0.004, 6, 3, 0, sg * 0.5, 0);
  }
  // Bart
  if (!d.kid && age !== 'teen') buildBeard(g, look, d, hair, skin);
  // Haare
  buildHair(g, look, d, hair, age);
  // Brille
  buildGlasses(g, look.glasses | 0, d, ew, eh);
  // Accessoire
  buildAccessory(g, look, d, neckR);

  // ----- Arme -----
  const elbowY = d.shY - d.upLen, wristY = elbowY - d.foreLen;
  for (const [ua, fa, ha, sg] of [[B.upArmL, B.foreArmL, B.handL, 1], [B.upArmR, B.foreArmR, B.handR, -1]] as const) {
    const x = sg * d.shX;
    const upC = sleeve === 'long' ? tc : skin;
    g.sph(ua, sleeve === 'none' ? skin : tc, d.armR * 1.08, d.armR * 1.15, d.armR * 1.08, x - sg * d.armR * 0.15, d.shY - 0.01, 0, 7, 5);
    g.limb(ua, upC, d.armR, d.armR * 0.86, x, d.shY, 0, x, elbowY, 0);
    if (sleeve === 'short') g.limb(ua, tc, d.armR * 1.28, d.armR * 1.2, x, d.shY + 0.01, 0, x, d.shY - d.upLen * (top === 4 ? 0.45 : 0.55), 0);
    const er = Math.min(d.armR * 0.86, d.foreR) * 0.98;
    g.sph(fa, sleeve === 'long' ? tc : skin, er, er, er, x, elbowY, 0, 7, 5);
    g.limb(fa, sleeve === 'long' ? tc : skin, d.foreR, d.foreR * 0.8, x, elbowY, 0, x, wristY, 0);
    if (sleeve === 'long' && top === 3) g.limb(fa, dark, d.foreR * 0.88, d.foreR * 0.88, x, wristY + 0.03 * s, 0, x, wristY + 0.005, 0);
    g.sph(ha, skin, 0.038 * ws, 0.058 * ws, 0.048 * ws, x, wristY - 0.045 * ws, 0.004, 6, 5);
    g.sph(ha, skin, 0.012 * ws, 0.025 * ws, 0.013 * ws, x - sg * 0.004, wristY - 0.03 * ws, 0.035 * ws, 4, 3, 0.4, 0, 0);
  }

  // ----- Beine -----
  for (const [th, sh, ft, sg] of [[B.thighL, B.shinL, B.footL, 1], [B.thighR, B.shinR, B.footR, -1]] as const) {
    const x = sg * d.hipX;
    const thC = legStyle === 'long' ? bc : skin;
    const shC = legStyle === 'long' ? bc : skin;
    const slim = bot === 6 && legStyle === 'long' ? 0.9 : 1;
    g.limb(th, thC, d.thighR * slim, d.thighR * 0.74 * slim, x, d.hipY + 0.01, 0, x, d.kneeY, 0);
    if (legStyle === 'shorts') g.limb(th, bc, d.thighR * 1.14, d.thighR * 1.02, x, d.hipY + 0.02, 0, x, d.hipY - d.thighLen * 0.62, 0);
    if (legStyle === 'trunks') g.limb(th, bc, d.thighR * 1.1, d.thighR * 1.05, x, d.hipY + 0.02, 0, x, d.hipY - d.thighLen * 0.28, 0);
    // Rock/Kleid/Kittel: Hälften an den Oberschenkeln (folgen beim Sitzen dem Schoß)
    if (legStyle === 'skirt' || dress || coat) {
      const len = dress ? d.thighLen * 0.92 : coat ? d.thighLen * 0.72 : d.thighLen * 0.78;
      const col = dress || coat ? tc : bc;
      const rT = (dress || coat ? d.waistRx : d.waistRx * 0.98) * 1.03;
      const rB = d.hipRx * (dress ? 1.45 : coat ? 1.3 : 1.35);
      const y0 = d.hipY + (dress || coat ? 0.07 : 0.05) * s;
      const hgt = y0 - (d.hipY - len);
      g.cyl(th, col, rT, rB, hgt, 0, y0 - hgt / 2, 0, 0, 0, 0, 12, d.chestRz / d.waistRx * 1.05, true, sg > 0 ? -0.2 : PI - 0.2, PI + 0.4);
    }
    const kr = Math.min(d.thighR * 0.74, d.shinR) * 0.98;
    g.sph(sh, shC, kr, kr, kr, x, d.kneeY, 0, 7, 5);
    g.limb(sh, shC, d.shinR, d.shinR * 0.68, x, d.kneeY, 0, x, d.ankleY, 0);
    if (legStyle === 'long' && bot === 4) g.limb(sh, shade(bc, 0.75), d.shinR * 0.78, d.shinR * 0.78, x, d.ankleY + 0.035 * s, 0, x, d.ankleY + 0.005, 0);
    if (bot === 0 && legStyle === 'long') g.limb(sh, shade(bc, 1.25), d.shinR * 0.74, d.shinR * 0.74, x, d.ankleY + 0.025 * s, 0, x, d.ankleY + 0.01, 0);
    buildFoot(g, ft, sh, shoes, sc, skin, d, x);
  }
  return g.build(true);
}

function buildFoot(g: GeoBuilder, ft: number, sh: number, style: number, sc: string, skin: string, d: Dims, x: number): void {
  const { ws, footLen: L, footH: h } = d;
  const w = 0.1 * ws, zc = L * 0.27;
  const toe = (c: string | THREE.Color, hk: number, y: number): void => g.sph(ft, c, w * 0.5, h * hk, L * 0.22, x, y, zc + L * 0.28, 7, 4);
  switch (style) {
    case 0: // Sneaker
      g.box(ft, '#f2f0ea', w * 1.04, h * 0.3, L, x, h * 0.15, zc);
      g.box(ft, sc, w, h * 0.72, L * 0.7, x, h * 0.62, zc - L * 0.13);
      toe(sc, 0.42, h * 0.42);
      break;
    case 1: // Halbschuhe
      g.box(ft, shade(sc, 0.6), w * 1.02, h * 0.2, L, x, h * 0.1, zc);
      g.box(ft, sc, w * 0.98, h * 0.75, L * 0.7, x, h * 0.55, zc - L * 0.13);
      toe(sc, 0.38, h * 0.4);
      break;
    case 2: // Stiefel
      g.box(ft, shade(sc, 0.6), w * 1.04, h * 0.22, L, x, h * 0.11, zc);
      g.box(ft, sc, w, h * 0.8, L * 0.7, x, h * 0.6, zc - L * 0.13);
      toe(sc, 0.42, h * 0.42);
      g.limb(sh, sc, d.shinR * 0.95, d.shinR * 0.85, x, d.ankleY + d.shinLen * 0.42, 0, x, d.ankleY - 0.01, 0);
      break;
    case 3: // Sandalen
      g.box(ft, sc, w * 1.04, h * 0.18, L, x, h * 0.09, zc);
      g.sph(ft, skin, w * 0.48, h * 0.45, L * 0.5, x, h * 0.5, zc, 7, 4);
      g.box(ft, sc, w * 1.02, h * 0.22, L * 0.14, x, h * 0.55, zc + L * 0.12);
      break;
    case 4: // Hausschuhe
      g.sph(ft, sc, w * 0.62, h * 0.62, L * 0.56, x, h * 0.55, zc, 7, 5);
      break;
    default: // barfuß
      g.sph(ft, skin, w * 0.5, h * 0.5, L * 0.5, x, h * 0.5, zc, 7, 4);
      break;
  }
}

function buildBeard(g: GeoBuilder, look: Appearance, d: Dims, hair: string, skin: string): void {
  const { hs } = d;
  const b = look.beard | 0;
  if (b <= 0) return;
  const mz = faceZ(d, 0, d.mouthY);
  if (b === 1 || b === 2) {
    const col = b === 1 ? mix(skin, hair, 0.45) : hair;
    const k = b === 1 ? 1.025 : 1.09;
    // untere Gesichtshälfte als Schale (Theta-Bereich unten, vorne)
    const geo = new THREE.SphereGeometry(1, 10, 4, PI * 0.18, PI * 0.64, PI * 0.6, PI * 0.33);
    g.add(geo, B.head, col, 0, d.hcY - (b === 2 ? 0.02 * hs : 0), 0, d.hrx * k, d.hry * k * (b === 2 ? 1.08 : 1), d.hrz * k);
    geo.dispose();
    if (b === 2) g.box(B.head, hair, 0.12 * hs, 0.035 * hs, 0.03 * hs, 0, d.mouthY + 0.045 * hs, mz + 0.004);
  } else if (b === 3) {
    g.box(B.head, hair, 0.13 * hs, 0.03 * hs, 0.035 * hs, 0, d.mouthY + 0.04 * hs, mz + 0.002, 0.2, 0, 0);
  } else {
    g.sph(B.head, hair, 0.05 * hs, 0.06 * hs, 0.04 * hs, 0, d.mouthY - 0.11 * hs, faceZ(d, 0, d.mouthY - 0.11 * hs) - 0.005, 6, 4);
    g.box(B.head, hair, 0.1 * hs, 0.025 * hs, 0.03 * hs, 0, d.mouthY + 0.04 * hs, mz + 0.002, 0.2, 0, 0);
  }
}

function buildHair(g: GeoBuilder, look: Appearance, d: Dims, hc: string, age: AgeStage): void {
  let st = look.hair | 0;
  const { hrx: rx, hry: ry, hrz: rz, hcY: cy } = d;
  if (st <= 0) return;
  if (age === 'baby') {
    g.cap(B.head, hc, rx * 1.03, ry * 1.03, rz * 1.03, 0, cy, -0.01 * d.hs, PI * 0.38, -0.45, 9, 4);
    g.sph(B.head, hc, rx * 0.15, ry * 0.25, rz * 0.12, 0, cy + ry * 1.0, rz * 0.2, 5, 4, -0.6);
    return;
  }
  if (st > 15) st = 1 + (st % 15);
  const hd = shade(hc, 0.82);
  // Mit Mütze/Kappe: nur Haarteile unterhalb der Kopfbedeckung (Kappe, Oberkopf-Details entfallen)
  const hat = (look.accessory | 0) === 3 || (look.accessory | 0) === 4;
  if (hat && (st === 2 || st === 4 || st === 8 || st === 11 || st === 13)) st = 1;
  if (hat && st === 9) st = 12;
  const capStd = (k = 1.07, th = 0.57, tilt = -0.42): void => {
    if (hat) g.cap(B.head, hc, rx * k, ry * k, rz * k, 0, cy, -0.01 * d.hs, PI * th, tilt - 0.15, 10, 5);
    else g.cap(B.head, hc, rx * k, ry * k, rz * k, 0, cy, -0.01 * d.hs, PI * th, tilt, 10, 5);
  };
  const back = (yOff: number, h: number, k = 1): void => {
    g.sph(B.head, hc, rx * 0.98 * k, h, rz * 0.5, 0, cy - yOff, -rz * 0.5, 9, 6);
  };
  switch (st) {
    case 1: capStd(); break;
    case 2: // Igel
      capStd(1.05, 0.55);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * PI * 2, r = i === 0 ? 0 : 0.5;
        const x = Math.sin(a) * r * rx, z = Math.cos(a) * r * rz * 0.9 - 0.1 * rz;
        g.cyl(B.head, hc, 0.002, 0.05 * d.hs, 0.12 * d.hs, x, cy + ry * 0.95 - r * 0.25 * ry, z, -z / rz * 0.6, 0, x / rx * 0.6, 5);
      }
      break;
    case 3: // Seitenscheitel
      capStd(1.08, 0.58);
      g.sph(B.head, hc, rx * 0.75, ry * 0.3, rz * 0.55, rx * 0.15, cy + ry * 0.62, rz * 0.35, 8, 5, 0.2, 0, -0.25);
      break;
    case 4: // Locken kurz
      capStd(1.06, 0.56);
      for (let i = 0; i < 16; i++) {
        const a = hash01(i * 3.1) * PI * 2, el = 0.15 + hash01(i * 7.7) * 0.9;
        const x = Math.sin(a) * Math.sin(el) * rx * 1.05, y = Math.cos(el) * ry * 1.04, z = Math.cos(a) * Math.sin(el) * rz * 1.05 - 0.04 * rz;
        if (z > rz * 0.55 && y < ry * 0.5) continue;
        g.sph(B.head, i % 3 ? hc : hd, rx * 0.26, ry * 0.24, rz * 0.26, x, cy + y, z, 5, 4);
      }
      break;
    case 5: // Bob
      capStd(1.1, 0.6);
      g.cyl(B.head, hc, rx * 1.1, rx * 1.16, ry * 1.0, 0, cy - ry * 0.32, -0.02 * d.hs, 0, 0, 0, 12, rz / rx * 1.02, true, PI * 0.3, PI * 1.4);
      break;
    case 6: // Pferdeschwanz
      capStd(1.07, 0.6, -0.35);
      g.sph(B.head, hd, rx * 0.22, ry * 0.2, rz * 0.2, 0, cy + ry * 0.35, -rz * 1.02, 6, 4);
      g.sph(B.head, hc, rx * 0.3, ry * 0.85, rz * 0.3, 0, cy - ry * 0.35, -rz * 1.18, 7, 6, -0.25);
      break;
    case 7: // Lang offen
      capStd(1.08, 0.6);
      back(ry * 0.75, ry * 1.15);
      for (const sg of [1, -1]) g.sph(B.head, hc, rx * 0.28, ry * 0.9, rz * 0.35, sg * rx * 0.85, cy - ry * 0.55, rz * 0.0, 6, 5);
      break;
    case 8: // Dutt
      capStd(1.06, 0.58, -0.35);
      g.sph(B.head, hc, rx * 0.42, ry * 0.36, rz * 0.42, 0, cy + ry * 0.8, -rz * 0.5, 7, 5);
      break;
    case 9: // Afro
      g.cap(B.head, hc, rx * 1.42, ry * 1.32, rz * 1.38, 0, cy + ry * 0.15, -rz * 0.18, PI * 0.66, -0.6, 12, 6);
      break;
    case 10: // Zöpfe
      capStd(1.07, 0.58);
      for (const sg of [1, -1]) {
        for (let i = 0; i < 4; i++) g.sph(B.head, i === 3 ? hd : hc, rx * 0.2 * (1 - i * 0.08), ry * 0.2, rz * 0.2, sg * rx * 0.95, cy - ry * (0.25 + i * 0.32), -rz * 0.45, 6, 4);
      }
      break;
    case 11: // Undercut
      g.cap(B.head, hd, rx * 1.03, ry * 1.03, rz * 1.03, 0, cy, -0.01 * d.hs, PI * 0.52, -0.35, 10, 5);
      g.sph(B.head, hc, rx * 0.78, ry * 0.38, rz * 0.95, 0, cy + ry * 0.7, rz * 0.05, 8, 5, 0.15);
      break;
    case 12: // Wellen schulterlang
      capStd(1.09, 0.6);
      back(ry * 0.5, ry * 0.85);
      for (const sg of [1, -1]) {
        g.sph(B.head, hc, rx * 0.32, ry * 0.55, rz * 0.45, sg * rx * 0.85, cy - ry * 0.45, -rz * 0.05, 6, 5);
        g.sph(B.head, hd, rx * 0.26, ry * 0.3, rz * 0.35, sg * rx * 0.85, cy - ry * 0.95, -rz * 0.2, 6, 4);
      }
      break;
    case 13: // Pixie
      capStd(1.06, 0.55);
      g.sph(B.head, hc, rx * 0.8, ry * 0.25, rz * 0.4, -rx * 0.1, cy + ry * 0.58, rz * 0.55, 8, 5, 0.5, 0, 0.2);
      break;
    case 14: // Rastas
      capStd(1.08, 0.6);
      for (let i = 0; i < 13; i++) {
        const a = PI * 0.42 + (i / 12) * PI * 1.16;
        const x = Math.sin(a) * rx * 1.02, z = Math.cos(a) * rz * 1.02 - 0.02;
        const len = ry * (1.0 + hash01(i) * 0.4);
        g.cyl(B.head, i % 2 ? hc : hd, rx * 0.07, rx * 0.06, len, x, cy - len / 2 + ry * 0.1, z, 0, 0, 0, 5);
      }
      break;
    case 15: // Haarband lang
      capStd(1.08, 0.6);
      back(ry * 0.8, ry * 1.2);
      if (!hat) g.ring(B.head, look.accessoryColor || '#c44536', rx * 1.08, 0.02 * d.hs, 0, cy + ry * 0.32, -rz * 0.05, PI / 2 + 0.45, 0, 0, 1, rz / rx * 1.02, 12);
      break;
    default: capStd(); break;
  }
}

function buildGlasses(g: GeoBuilder, kind: number, d: Dims, ew: number, eh: number): void {
  if (kind <= 0) return;
  const { hs } = d;
  const frame = '#2a2522';
  const r = Math.max(ew, eh) * 1.25;
  for (const sg of [1, -1]) {
    const ex = sg * d.eyeX, ez = faceZ(d, ex, d.eyeY) + 0.025 * hs;
    if (kind === 1) g.ring(B.head, frame, r, 0.008 * hs + 0.002, ex, d.eyeY, ez, 0, 0, 0, 1, 1, 12);
    else if (kind === 2) {
      const fw = r * 1.15, fh = r * 0.85, th = 0.016 * hs + 0.002;
      g.box(B.head, frame, fw * 2, th, th, ex, d.eyeY + fh, ez);
      g.box(B.head, frame, fw * 2, th, th, ex, d.eyeY - fh, ez);
      g.box(B.head, frame, th, fh * 2, th, ex + fw, d.eyeY, ez);
      g.box(B.head, frame, th, fh * 2, th, ex - fw, d.eyeY, ez);
    }
    else g.sph(B.head, '#1b1b1e', r * 1.05, r * 0.85, r * 0.25, ex, d.eyeY, ez, 8, 5);
    // Bügel
    const tx = sg * d.hrx * 0.98;
    g.limb(B.head, frame, 0.006 * hs + 0.001, 0.006 * hs + 0.001, ex + sg * r, d.eyeY + 0.01 * hs, ez - 0.01, tx, d.eyeY + 0.01 * hs, -0.05 * hs, 4);
  }
  g.box(B.head, frame, d.eyeX * 2 - r * 2 + 0.01, 0.012 * hs + 0.002, 0.01 * hs, 0, d.eyeY + 0.02 * hs, faceZ(d, 0, d.eyeY) + 0.03 * hs);
}

function buildAccessory(g: GeoBuilder, look: Appearance, d: Dims, neckR: number): void {
  const a = look.accessory | 0;
  const c = look.accessoryColor || '#d4af37';
  const { hrx: rx, hry: ry, hrz: rz, hcY: cy, hs, ws } = d;
  const big = (look.hair | 0) === 9 ? 1.3 : (look.hair | 0) === 8 ? 1.08 : 1;
  switch (a) {
    case 1:
      for (const sg of [1, -1]) g.sph(B.head, c, 0.02 * hs, 0.02 * hs, 0.02 * hs, sg * rx * 0.98, d.eyeY - 0.12 * hs, -0.02 * hs, 5, 4);
      break;
    case 2:
      g.ring(B.chest, c, neckR * 1.55, 0.006 * ws + 0.002, 0, d.shY + 0.0, 0.012 * ws, PI / 2 - 0.45, 0, 0, 1.15, 1, 12);
      g.sph(B.chest, c, 0.014 * ws, 0.018 * ws, 0.01 * ws, 0, d.shY - 0.05 * ws, d.chestRz * 0.95, 5, 4);
      break;
    case 3: // Mütze
      g.cap(B.head, c, rx * 1.14 * big, ry * 1.12 * big, rz * 1.14 * big, 0, cy + ry * 0.04, -0.01, PI * 0.5, -0.22, 10, 5);
      g.ring(B.head, shade(c, 0.8), rx * 1.13 * big, 0.022 * hs, 0, cy + ry * 0.04, -0.01, PI / 2 - 0.22, 0, 0, 1, rz / rx, 12);
      g.sph(B.head, '#f4f1ea', rx * 0.25, rx * 0.25, rx * 0.25, 0, cy + ry * 1.12 * big, -rz * 0.2, 6, 4);
      break;
    case 4: // Kappe
      g.cap(B.head, c, rx * 1.1 * big, ry * 1.08 * big, rz * 1.1 * big, 0, cy + ry * 0.05, 0, PI * 0.5, -0.12, 10, 5);
      g.sph(B.head, shade(c, 0.85), rx * 0.78, 0.018 * hs + 0.003, rz * 0.62, 0, cy + ry * 0.2, rz * 1.02, 8, 3, -0.12);
      break;
    case 5: // Schal
      g.ring(B.chest, c, neckR * 1.4, 0.035 * ws, 0, d.shY + 0.02 * ws, 0, PI / 2, 0, 0, 1.15, 1.05, 10);
      g.box(B.chest, shade(c, 0.88), 0.06 * ws, 0.22 * ws, 0.03 * ws, 0.06 * ws, d.shY - 0.1 * ws, d.chestRz * 0.98, 0.1, 0, 0.12);
      break;
    case 6: { // Armreif am linken Handgelenk
      const wristY = d.shY - d.upLen - d.foreLen;
      g.ring(B.foreArmL, c, d.foreR * 0.95, 0.009 * ws + 0.002, d.shX, wristY + 0.03 * ws, 0, PI / 2, 0, 0, 1, 1, 8);
      break;
    }
    default: break;
  }
}

// ---------- Requisiten (geteilte Geometrien, nicht gehäutet) ----------
const propCache = new Map<string, THREE.BufferGeometry | null>();
function propGeometry(id: string): THREE.BufferGeometry | null {
  if (propCache.has(id)) return propCache.get(id)!;
  const g = new GeoBuilder();
  switch (id) {
    case 'plate':
    case 'dirty':
      g.cyl(0, '#f4f2ec', 0.11, 0.08, 0.018, 0, 0, 0, 0, 0, 0, 10);
      if (id === 'plate') { g.sph(0, '#d9822b', 0.05, 0.025, 0.045, 0.01, 0.02, 0, 6, 4); g.sph(0, '#6aa84f', 0.03, 0.02, 0.03, -0.04, 0.018, 0.02, 5, 3); }
      else { g.cyl(0, '#e8e2d4', 0.1, 0.075, 0.016, 0, 0.022, 0, 0, 0, 0, 10); g.sph(0, '#8a6a4a', 0.04, 0.012, 0.03, 0.01, 0.034, 0, 5, 3); }
      break;
    case 'cup': g.cyl(0, '#f2efe8', 0.036, 0.03, 0.09, 0, 0, 0, 0, 0, 0, 8); g.cyl(0, '#5a3a22', 0.032, 0.032, 0.005, 0, 0.044, 0, 0, 0, 0, 8); g.ring(0, '#f2efe8', 0.022, 0.006, 0.038, 0, 0, 0, PI / 2, 0, 1, 1, 6); break;
    case 'book': g.box(0, '#8c2f39', 0.15, 0.2, 0.035, 0, 0, 0); g.box(0, '#f4efe0', 0.14, 0.19, 0.03, 0.006, 0, 0); break;
    case 'phone': g.box(0, '#1d1f24', 0.07, 0.14, 0.012, 0, 0, 0); g.box(0, '#5fb4e6', 0.06, 0.12, 0.002, 0, 0, 0.0065); break;
    case 'guitar':
      g.sph(0, '#c07a3a', 0.16, 0.14, 0.05, 0, -0.12, 0, 9, 5); g.sph(0, '#c07a3a', 0.12, 0.1, 0.05, 0, 0.06, 0, 8, 5);
      g.sph(0, '#2a1a10', 0.04, 0.04, 0.01, 0, -0.02, 0.048, 7, 3);
      g.box(0, '#5a3a22', 0.045, 0.42, 0.025, 0, 0.32, 0.01); g.box(0, '#3a2414', 0.06, 0.08, 0.03, 0, 0.56, 0.01);
      break;
    case 'baby':
      g.sph(0, '#f3e3a3', 0.1, 0.1, 0.17, 0, 0, 0, 8, 6); g.sph(0, '#f1cfb2', 0.075, 0.075, 0.075, 0, 0.02, 0.19, 8, 6); g.sph(0, '#f3e3a3', 0.08, 0.05, 0.08, 0, 0.06, 0.18, 7, 4);
      break;
    case 'tray': g.box(0, '#7a5638', 0.38, 0.018, 0.28, 0, 0, 0); g.cyl(0, '#f2efe8', 0.035, 0.03, 0.09, 0.08, 0.05, 0.03, 0, 0, 0, 8); g.cyl(0, '#e86a5c', 0.03, 0.03, 0.12, -0.08, 0.06, -0.04, 0, 0, 0, 7); break;
    case 'mic': g.cyl(0, '#2a2a2e', 0.016, 0.012, 0.16, 0, 0, 0, 0, 0, 0, 6); g.sph(0, '#8a8f99', 0.032, 0.032, 0.032, 0, 0.1, 0, 7, 5); break;
    case 'fishingrod': g.cyl(0, '#3a3024', 0.006, 0.014, 1.6, 0, 0.75, 0, 0, 0, 0, 5); g.cyl(0, '#9aa0a8', 0.03, 0.03, 0.03, 0.03, 0.08, 0, 0, 0, PI / 2, 8); break;
    case 'camera': g.box(0, '#26282c', 0.13, 0.08, 0.06, 0, 0, 0); g.cyl(0, '#3d3f44', 0.03, 0.033, 0.05, 0, 0, 0.05, PI / 2, 0, 0, 8); g.box(0, '#c9ccd1', 0.03, 0.015, 0.02, 0.04, 0.045, 0); break;
    case 'brush': g.cyl(0, '#c9a46a', 0.006, 0.008, 0.24, 0, 0, 0, 0, 0, 0, 5); g.sph(0, '#c44536', 0.012, 0.03, 0.012, 0, 0.13, 0, 5, 4); break;
    case 'box': g.box(0, '#c49a6c', 0.34, 0.26, 0.28, 0, 0, 0); g.box(0, '#a77d52', 0.345, 0.03, 0.06, 0, 0.12, 0); break;
    default: propCache.set(id, null); return null;
  }
  const geo = g.build(false);
  propCache.set(id, geo);
  return geo;
}

interface PropMount { bone: number; x: number; y: number; z: number; rx: number; ry: number; rz: number }
function propMount(id: string, d: Dims): PropMount {
  const hy = -0.05 * d.ws;
  switch (id) {
    case 'guitar': return { bone: B.chest, x: 0.02, y: d.chestY - d.chestY - 0.06 * d.s, z: d.chestRz + 0.06, rx: 0, ry: 0, rz: 1.05 };
    case 'baby': return { bone: B.chest, x: -0.03, y: -0.08 * d.s, z: d.chestRz + 0.11, rx: 0, ry: 1.4, rz: 0 };
    case 'tray': return { bone: B.handR, x: 0, y: hy - 0.03, z: 0.02, rx: PI / 2, ry: 0, rz: 0 };
    case 'box': return { bone: B.chest, x: 0, y: -0.04 * d.s, z: d.chestRz + 0.2 * d.ws, rx: 0, ry: 0, rz: 0 };
    case 'plate': case 'dirty': return { bone: B.handL, x: 0, y: hy - 0.02, z: 0.03, rx: PI / 2, ry: 0, rz: 0 };
    case 'book': return { bone: B.handR, x: d.shX * 0.85, y: hy - 0.04, z: 0.04, rx: PI / 2 - 0.5, ry: 0, rz: 0 };
    case 'phone': return { bone: B.handR, x: 0, y: hy - 0.03, z: 0.03, rx: 0, ry: 0, rz: 0 };
    case 'fishingrod': return { bone: B.handR, x: 0, y: hy, z: 0.02, rx: PI - 0.9, ry: 0, rz: 0 };
    case 'camera': return { bone: B.handR, x: 0.06, y: hy - 0.02, z: 0.04, rx: 0, ry: 0, rz: 0 };
    case 'brush': return { bone: B.handR, x: 0, y: hy - 0.02, z: 0.03, rx: PI - 0.5, ry: 0, rz: 0 };
    case 'mic': return { bone: B.handR, x: 0, y: hy - 0.02, z: 0.02, rx: PI - 0.3, ry: 0, rz: 0 };
    case 'cup': return { bone: B.handR, x: 0, y: hy - 0.01, z: 0.035, rx: PI / 2, ry: 0, rz: 0 };
    default: return { bone: B.handR, x: 0, y: hy - 0.03, z: 0.03, rx: 0, ry: 0, rz: 0 };
  }
}

// ---------- Posen ----------
class Pose {
  readonly r = new Float32Array(NB * 3);
  px = 0; py = 0; pz = 0;
  reset(): void { this.r.fill(0); this.px = this.py = this.pz = 0; }
  copy(o: Pose): void { this.r.set(o.r); this.px = o.px; this.py = o.py; this.pz = o.pz; }
  blend(a: Pose, b: Pose, w: number): void {
    const r = this.r, ra = a.r, rb = b.r;
    for (let i = 0; i < r.length; i++) r[i] = ra[i]! + (rb[i]! - ra[i]!) * w;
    this.px = lerp(a.px, b.px, w); this.py = lerp(a.py, b.py, w); this.pz = lerp(a.pz, b.pz, w);
  }
}

/** Gesichts-Überschreibungen durch Anims */
interface FaceOv { mode: EmotionId | 'closed' | 'kiss' | 'laugh' | 'cry' | 'shout' | null; open: number }

interface FaceParams { brow: number; browUp: number; smile: number; open: number; eye: number; blush: number; pucker: number }
const EMO_FACE: Record<EmotionId, FaceParams> = {
  fine: { brow: 0, browUp: 0, smile: 0.2, open: 0, eye: 1, blush: 0, pucker: 0 },
  happy: { brow: -0.1, browUp: 0.35, smile: 0.85, open: 0.15, eye: 0.95, blush: 0, pucker: 0 },
  sad: { brow: -0.8, browUp: 0.1, smile: -0.7, open: 0, eye: 0.75, blush: 0, pucker: 0 },
  love: { brow: -0.3, browUp: 0.2, smile: 0.6, open: 0, eye: 0.8, blush: 0.7, pucker: 0 },
  tense: { brow: 0.4, browUp: 0.1, smile: -0.3, open: 0, eye: 1.05, blush: 0, pucker: 0.2 },
  focused: { brow: 0.35, browUp: -0.1, smile: 0, open: 0, eye: 0.8, blush: 0, pucker: 0 },
  inspired: { brow: -0.2, browUp: 0.6, smile: 0.5, open: 0.2, eye: 1.1, blush: 0, pucker: 0 },
  angry: { brow: 1, browUp: -0.2, smile: -0.6, open: 0.1, eye: 0.85, blush: 0.25, pucker: 0 },
  embarrassed: { brow: -0.5, browUp: 0.1, smile: -0.15, open: 0, eye: 0.85, blush: 1, pucker: 0.2 },
  tired: { brow: -0.2, browUp: -0.1, smile: -0.15, open: 0, eye: 0.45, blush: 0, pucker: 0 },
  playful: { brow: -0.1, browUp: 0.4, smile: 0.75, open: 0.1, eye: 1, blush: 0.1, pucker: 0 },
  confident: { brow: 0.15, browUp: 0.05, smile: 0.45, open: 0, eye: 0.95, blush: 0, pucker: 0 },
};
const OV_FACE: Record<'closed' | 'kiss' | 'laugh' | 'cry' | 'shout', FaceParams> = {
  closed: { brow: 0, browUp: 0, smile: 0.15, open: 0, eye: 0, blush: 0, pucker: 0 },
  kiss: { brow: -0.3, browUp: 0.2, smile: 0.2, open: 0, eye: 0, blush: 0.6, pucker: 1 },
  laugh: { brow: -0.2, browUp: 0.5, smile: 1, open: 0.8, eye: 0.35, blush: 0.2, pucker: 0 },
  cry: { brow: -1, browUp: 0.2, smile: -1, open: 0.4, eye: 0.2, blush: 0.4, pucker: 0 },
  shout: { brow: 1, browUp: -0.2, smile: -0.8, open: 0.7, eye: 0.9, blush: 0.5, pucker: 0 },
};

/** Schreib-Kontext für Posen */
class Rig {
  P!: Pose;
  d!: Dims;
  face: FaceOv = { mode: null, open: 0 };
  /** Grundhaltung ist stehend (für Emotions-Haltung und Sitz-Überschreibung) */
  standing = true;
  set(i: number, x: number, y: number, z: number): void { const r = this.P.r; r[i * 3] = x; r[i * 3 + 1] = y; r[i * 3 + 2] = z; }
  add(i: number, x: number, y = 0, z = 0): void { const r = this.P.r; r[i * 3] = r[i * 3]! + x; r[i * 3 + 1] = r[i * 3 + 1]! + y; r[i * 3 + 2] = r[i * 3 + 2]! + z; }
  /** linker Arm: Schulter (x vor/zurück: negativ = nach vorn heben, z = seitlich abspreizen), Ellbogen (negativ = beugen), Handgelenk */
  armL(x: number, z: number, elbow: number, y = 0, wrist = 0): void { this.set(B.upArmL, x, y, z); this.set(B.foreArmL, elbow, 0, 0); this.set(B.handL, wrist, 0, 0); }
  armR(x: number, z: number, elbow: number, y = 0, wrist = 0): void { this.set(B.upArmR, x, -y, -z); this.set(B.foreArmR, elbow, 0, 0); this.set(B.handR, wrist, 0, 0); }
  /** dreht den Oberarm um seine Längsachse, damit der gebeugte Unterarm zur Körpermitte zeigt (positiv = einwärts) */
  foreIn(l: number, r: number): void { this.add(B.upArmL, 0, -l, 0); this.add(B.upArmR, 0, r, 0); }
  /** Bein: Oberschenkel nach vorn (positiv), Knie beugen (positiv), Fuß */
  legL(fwd: number, knee: number, foot = 0, spread = 0): void { this.set(B.thighL, -fwd, 0, spread); this.set(B.shinL, knee, 0, 0); this.set(B.footL, foot, 0, 0); }
  legR(fwd: number, knee: number, foot = 0, spread = 0): void { this.set(B.thighR, -fwd, 0, -spread); this.set(B.shinR, knee, 0, 0); this.set(B.footR, foot, 0, 0); }
  /** senkt die Hüfte so, dass der tiefere Fuß den Boden berührt (für Stehposen mit gebeugten Knien) */
  ground(extra = 0): void {
    const d = this.d;
    const m = Math.max(this.drop(B.thighL, B.shinL), this.drop(B.thighR, B.shinR));
    this.P.py = d.ankleY + m - d.hipY + extra;
  }
  private drop(th: number, sh: number): number {
    const r = this.P.r, d = this.d;
    const a = -r[th * 3]!, k = r[sh * 3]!;
    return d.thighLen * Math.cos(a) + d.shinLen * Math.cos(a - k);
  }
  /** Sitz-Beinhaltung: Gesäß bei lokal y=0, Füße bei −seatY */
  sitLegs(seatY: number, t: number): void {
    const d = this.d;
    this.standing = false;
    this.P.py = -(d.hipY - d.thighR * 0.9);
    if (seatY < 0.2) { this.floorLegs(); return; }
    const reach = seatY - d.footH * 0.5;
    const ang = d.shinLen > reach ? Math.acos(clamp(reach / d.shinLen, 0, 1)) : 0;
    const dangle = d.kid && d.shinLen + d.footH < seatY - 0.03 ? 0.15 * osc(t, 0.6) : 0;
    this.legL(PI / 2 - 0.05, PI / 2 - 0.05 - ang - dangle, -0.05 + ang * 0.6, 0.06);
    this.legR(PI / 2 - 0.05, PI / 2 - 0.05 - ang + dangle, -0.05 + ang * 0.6, 0.06);
  }
  /** Schneidersitz auf dem Boden, Gesäß bei y=0 */
  floorLegs(): void {
    const d = this.d;
    this.standing = false;
    this.P.py = -(d.hipY - d.thighR * 0.9);
    this.set(B.thighL, -1.35, 0.0, 0.85); this.set(B.shinL, 2.5, 0, -0.35); this.set(B.footL, 0.3, 0, 0);
    this.set(B.thighR, -1.35, 0.0, -0.85); this.set(B.shinR, 2.5, 0, 0.35); this.set(B.footR, 0.3, 0, 0);
  }
  /** Knien (beide Knie am Boden), Oberkörper aufrecht */
  kneel(): void {
    const d = this.d;
    this.legL(0.1, PI / 2 + 0.1, 0.6, 0.05);
    this.legR(0.1, PI / 2 + 0.1, 0.6, 0.05);
    this.P.py = d.thighLen * Math.cos(0.1) + d.shinR - d.hipY;
  }
  /** Hocke */
  crouch(): void {
    this.legL(1.7, 2.4, -0.6, 0.25);
    this.legR(1.4, 2.25, -0.75, 0.15);
    this.ground();
  }
  /** Rückenlage (Kopf −z, Körpermitte am Ursprung, Rücken auf y=0) */
  lie(): void {
    const d = this.d;
    this.standing = false;
    this.set(B.root, -PI / 2, 0, 0);
    this.P.pz = d.H * 0.5;
    this.P.py = Math.max(d.chestRz, d.hipRx * 0.6) * 0.95;
    this.set(B.head, 0.25, 0, 0);
  }
  breathe(t: number, k = 1): void {
    this.add(B.chest, -0.025 * k * osc(t, 0.25));
    this.add(B.spine, 0.01 * k * osc(t, 0.25));
    this.add(B.upArmL, 0, 0, 0.02 * k * osc(t, 0.25));
    this.add(B.upArmR, 0, 0, -0.02 * k * osc(t, 0.25));
  }
}

type PoseFn = (X: Rig, t: number) => void;

// --- Grundbausteine ---
function idle(X: Rig, t: number): void {
  X.breathe(t);
  const sway = osc(t, 0.12);
  X.set(B.hips, 0, 0.03 * osc(t, 0.07), 0.025 * sway);
  X.add(B.spine, 0, 0, -0.02 * sway);
  X.add(B.chest, 0, 0, -0.01 * sway);
  X.legL(0.02, 0.04 + 0.04 * Math.max(0, -sway), -0.02, 0.03);
  X.legR(0.02, 0.04 + 0.04 * Math.max(0, sway), -0.02, 0.03);
  X.add(B.thighL, 0, 0, -0.025 * sway); X.add(B.thighR, 0, 0, -0.025 * sway);
  // gelegentlich umsehen
  const look = smooth01((osc(t, 0.045, 0.3) - 0.55) * 4) - smooth01((-osc(t, 0.045, 0.3) - 0.6) * 4);
  X.add(B.head, 0.03 * osc(t, 0.09), 0.45 * look + 0.04 * osc(t, 0.13), 0);
  X.add(B.neck, 0, 0.12 * look, 0);
  X.add(B.upArmL, 0.03 * osc(t, 0.2), 0, 0); X.add(B.upArmR, 0.03 * osc(t, 0.2, 0.5), 0, 0);
  X.add(B.foreArmL, -0.12); X.add(B.foreArmR, -0.12);
  X.ground();
}

function walkCycle(X: Rig, t: number, run: boolean): void {
  const d = X.d;
  const f = (run ? 1.35 : 0.9) * (d.kid ? 1.25 : 1) * (d.senior ? 0.9 : 1);
  const ph = t * f * PI * 2;
  const sn = Math.sin(ph), cs = Math.cos(ph);
  const A = run ? 0.75 : 0.42, K = run ? 1.45 : 0.75;
  const aL = A * sn, aR = -A * sn;
  const kL = 0.08 + K * Math.max(0, cs) ** 1.4 + (run ? 0.25 : 0), kR = 0.08 + K * Math.max(0, -cs) ** 1.4 + (run ? 0.25 : 0);
  X.legL(aL, kL, (aL - kL) * -0.55 + 0.05, 0.02);
  X.legR(aR, kR, (aR - kR) * -0.55 + 0.05, 0.02);
  const arm = run ? 0.8 : 0.38;
  X.armL(arm * sn, 0.0, run ? -1.5 : -0.25 - 0.15 * Math.max(0, -sn));
  X.armR(-arm * sn, 0.0, run ? -1.5 : -0.25 - 0.15 * Math.max(0, sn));
  X.set(B.hips, 0, 0.12 * sn * (run ? 0.6 : 1), 0.03 * Math.sin(ph * 2));
  X.set(B.spine, run ? 0.18 : 0.03, -0.06 * sn, 0);
  X.set(B.chest, run ? 0.06 : 0.01, -0.08 * sn, 0);
  X.set(B.head, run ? -0.12 : -0.02, 0.05 * sn, 0);
  X.ground(run ? 0.05 * Math.abs(Math.sin(ph)) : 0.008 * Math.cos(ph * 2));
}

/** Arme vor dem Körper auf Arbeitshöhe (Hände nach vorn), w = Grundneigung */
function armsFront(X: Rig, l: number, r: number, elbow = -1.2): void {
  X.armL(-l, 0.12, elbow);
  X.armR(-r, 0.12, elbow);
  X.foreIn(0.35, 0.35);
}

function talk(X: Rig, t: number): void {
  idle(X, t);
  const g1 = pulse(t, 0.55), g2 = pulse(t, 0.43, 0.35);
  X.armR(-0.35 - 0.45 * g1, 0.15 + 0.15 * g1, -1.0 - 0.5 * g1, 0, -0.2);
  X.armL(-0.15 - 0.4 * g2, 0.12 + 0.2 * g2, -0.6 - 0.6 * g2);
  X.foreIn(-0.5 * g2, -0.5 * g1);
  X.add(B.head, 0.06 * osc(t, 1.1), 0.08 * osc(t, 0.3), 0.04 * osc(t, 0.4));
  X.face.open = 1;
}

function seated(X: Rig, t: number): void {
  X.breathe(t);
  X.armL(-0.4, 0.1, -0.85);
  X.armR(-0.4, 0.1, -0.85);
  X.foreIn(0.25, 0.25);
  X.add(B.head, 0.04 * osc(t, 0.1), 0.25 * osc(t, 0.05), 0);
}

const POSES: Record<AnimId, PoseFn> = {
  idle,
  walk: (X, t) => walkCycle(X, t, false),
  run: (X, t) => walkCycle(X, t, true),
  sit: (X, t) => { seated(X, t); X.set(B.spine, -0.05, 0, 0); },
  sleep: (X, t) => {
    X.lie();
    X.add(B.chest, -0.03 * osc(t, 0.18));
    X.armL(-0.1, 0.25, -0.2); X.armR(-0.15, 0.15, -1.7); X.foreIn(0, 0.9);
    X.legL(0.04, 0.08, 0.5, 0.08); X.legR(0.08, 0.15, 0.5, 0.04);
    X.add(B.head, 0, 0.25, 0);
    X.face.mode = 'closed';
  },
  eat: (X, t) => {
    seated(X, t);
    const c = pulse(t, 0.33);
    X.set(B.chest, 0.12, 0, 0); X.set(B.head, 0.2 - 0.15 * c, 0, 0);
    X.armL(-0.55, 0.12, -1.1); X.foreIn(0.6, 0);
    X.armR(-0.55 - 0.35 * c, 0.2, -1.1 - 1.0 * c); X.foreIn(0, 0.3 + 0.4 * c);
    X.face.open = c > 0.7 ? 0.6 : 0.4 * Math.max(0, osc(t, 2.4));
  },
  eatStand: (X, t) => {
    idle(X, t);
    const c = pulse(t, 0.33);
    X.armL(-0.4, 0.1, -1.3); X.foreIn(0.5, 0);
    X.armR(-0.4 - 0.4 * c, 0.2, -1.1 - 1.0 * c); X.foreIn(0, 0.3 + 0.4 * c);
    X.set(B.head, 0.25 - 0.2 * c, 0, 0);
    X.face.open = c > 0.7 ? 0.6 : 0.4 * Math.max(0, osc(t, 2.4));
  },
  drink: (X, t) => {
    idle(X, t);
    const c = smooth01((osc(t, 0.2) - 0.1) * 2.5);
    X.armR(-0.35 - 0.35 * c, 0.25, -1.0 - 1.15 * c); X.foreIn(0, 0.35 + 0.45 * c);
    X.set(B.head, 0.05 - 0.35 * c, 0, 0);
  },
  cook: (X, t) => {
    idle(X, t);
    armsFront(X, 0.55, 0.65, -1.0);
    X.add(B.upArmR, 0.12 * osc(t, 1.2), 0, 0.12 * osc(t, 1.2, 0.25));
    X.add(B.foreArmR, 0.1 * osc(t, 1.2, 0.25));
    X.set(B.chest, 0.1, 0, 0); X.set(B.head, 0.35, 0, 0);
  },
  fridge: (X, t) => {
    idle(X, t);
    const reach = smooth01(t * 1.5);
    X.armR(-0.6 - 0.6 * reach, 0.15, -0.3 - 0.2 * osc(t, 0.5));
    X.armL(-0.2, 0.1, -0.5);
    X.set(B.spine, 0.12 * reach, 0, 0); X.set(B.chest, 0.08, 0.1 * osc(t, 0.3), 0);
    X.set(B.head, 0.15 + 0.1 * osc(t, 0.25), 0.2 * osc(t, 0.2), 0);
  },
  wash: (X, t) => {
    idle(X, t);
    armsFront(X, 0.6, 0.6, -1.1);
    X.add(B.upArmL, 0.1 * osc(t, 1.6), 0, 0.05 * osc(t, 1.6, 0.25));
    X.add(B.upArmR, 0.1 * osc(t, 1.6, 0.5), 0, 0.05 * osc(t, 1.6, 0.75));
    X.set(B.spine, 0.12, 0, 0); X.set(B.chest, 0.1, 0, 0); X.set(B.head, 0.4, 0, 0);
  },
  shower: (X, t) => {
    idle(X, t);
    X.armL(-2.4, 0.5, -1.6 + 0.2 * osc(t, 1.5)); X.armR(-2.4, 0.5, -1.6 + 0.2 * osc(t, 1.5, 0.5));
    X.foreIn(0.4, 0.4);
    X.set(B.head, -0.25, 0.15 * osc(t, 0.3), 0);
    X.set(B.hips, 0, 0, 0.05 * osc(t, 0.4));
    X.face.mode = 'closed';
  },
  bath: (X, t) => {
    X.breathe(t);
    X.standing = false;
    X.P.py = -(X.d.hipY - X.d.thighR * 0.9);
    X.legL(PI / 2 - 0.1, 0.2, 0.1, 0.1); X.legR(PI / 2 - 0.2, 0.35, 0.1, 0.06);
    X.set(B.spine, -0.35, 0, 0); X.set(B.chest, -0.1, 0, 0);
    X.armL(0.1, 0.7, -0.4); X.armR(0.1, 0.7, -0.4);
    X.set(B.head, 0.1, 0.2 * osc(t, 0.07), 0);
    X.face.mode = osc(t, 0.05) > 0.3 ? 'closed' : 'happy';
  },
  toilet: (X, t) => {
    seated(X, t);
    X.set(B.spine, 0.15, 0, 0); X.set(B.chest, 0.12, 0, 0);
    X.armL(-0.8, 0.15, -1.3); X.armR(-0.8, 0.15, -1.3);
    X.set(B.head, 0.25 + 0.05 * osc(t, 0.3), 0, 0);
  },
  talk,
  listen: (X, t) => {
    idle(X, t);
    const nod = Math.max(0, osc(t, 0.4)) ** 3;
    X.add(B.head, 0.18 * nod, 0, 0.08);
    X.armL(-0.25, 0.12, -1.5); X.armR(-0.25, 0.12, -1.5); X.foreIn(0.9, 0.9);
  },
  laugh: (X, t) => {
    idle(X, t);
    const b = Math.abs(osc(t, 3));
    X.set(B.chest, -0.15 + 0.06 * b, 0, 0); X.set(B.head, -0.3 + 0.08 * b, 0, 0);
    X.armL(-0.5, 0.2, -1.6); X.foreIn(1.0, 0); X.armR(-0.2, 0.2, -0.4 - 0.2 * b);
    X.add(B.upArmL, 0, 0, 0.05 * b); X.add(B.upArmR, 0, 0, -0.05 * b);
    X.face.mode = 'laugh';
  },
  hug: (X, t) => {
    idle(X, t);
    X.armL(-1.35, 0.25, -0.9, -0.2); X.armR(-1.25, 0.25, -0.9, -0.2);
    X.foreIn(0.9, 0.9);
    X.set(B.chest, 0.05, 0.1 * osc(t, 0.4), 0); X.set(B.head, 0.1, 0.35, 0.15);
    X.face.mode = 'closed';
  },
  kiss: (X, t) => {
    idle(X, t);
    X.armL(-0.9, 0.3, -1.2); X.armR(-0.9, 0.3, -1.2); X.foreIn(0.5, 0.5);
    X.set(B.spine, 0.08, 0, 0); X.set(B.chest, 0.1, 0, 0); X.set(B.head, 0.1, 0, 0.3 + 0.03 * osc(t, 0.5));
    X.face.mode = 'kiss';
  },
  wave: (X, t) => {
    idle(X, t);
    const up = smooth01(t * 4);
    X.armR(-0.25 * up, 2.55 * up, 0);
    X.set(B.foreArmR, -0.25 * up, 0, -(0.45 + 0.4 * osc(t, 1.6)) * up);
    X.set(B.head, -0.05, 0, -0.08 * up);
    X.face.mode = 'happy';
  },
  highfive: (X, t) => {
    idle(X, t);
    const c = (t % 1.6) / 1.6;
    const up = smooth01(c * 3) * (1 - smooth01((c - 0.7) * 4));
    X.armR(-1.8 * up - 0.1, 0.4 * up, -0.4 * (1 - up) - 0.15);
    X.set(B.chest, -0.05 * up, -0.2 * up, 0);
    X.face.mode = 'happy';
  },
  angry: (X, t) => {
    idle(X, t);
    const s = pulse(t, 0.8);
    X.armL(-0.15 - 0.4 * s, 0.25, -1.4); X.armR(-0.15 - 0.4 * pulse(t, 0.8, 0.5), 0.25, -1.4);
    X.set(B.chest, 0.15, 0, 0); X.set(B.head, -0.05, 0.15 * osc(t, 1.6), 0);
    X.legL(0.2 * s, 0.4 * s, 0, 0.05); X.ground();
    X.face.mode = 'shout';
  },
  cry: (X, t) => {
    idle(X, t);
    const sob = Math.abs(osc(t, 2.2)) * 0.5;
    X.armL(-1.0, 0.25, -2.2, -0.2); X.armR(-1.0, 0.25, -2.2, -0.2); X.foreIn(0.7, 0.7);
    X.set(B.chest, 0.25 + 0.04 * sob, 0, 0); X.set(B.head, 0.4 + 0.05 * sob, 0, 0);
    X.face.mode = 'cry';
  },
  dance: (X, t) => {
    const b = 2.0;
    const ph = t * b * PI;
    X.legL(0.25 + 0.25 * Math.sin(ph), 0.4 + 0.3 * Math.max(0, Math.sin(ph)), 0, 0.12);
    X.legR(0.25 - 0.25 * Math.sin(ph), 0.4 + 0.3 * Math.max(0, -Math.sin(ph)), 0, 0.12);
    X.set(B.hips, 0, 0.3 * Math.sin(ph * 0.5), 0.12 * Math.sin(ph));
    X.set(B.spine, 0.05, -0.15 * Math.sin(ph * 0.5), -0.1 * Math.sin(ph));
    X.armL(-0.8 - 0.8 * pulse(t, b / 2), 0.4 + 0.3 * Math.sin(ph), -1.2);
    X.armR(-0.8 - 0.8 * pulse(t, b / 2, 0.5), 0.4 - 0.3 * Math.sin(ph), -1.2);
    X.set(B.head, 0.1 * Math.sin(ph * 2), 0.2 * Math.sin(ph * 0.5), 0.1 * Math.sin(ph));
    X.ground(0.02 * Math.abs(Math.sin(ph)));
    X.face.mode = 'happy';
  },
  tv: (X, t) => {
    seated(X, t);
    X.set(B.spine, -0.18, 0, 0); X.set(B.chest, -0.05, 0, 0);
    X.armL(-0.25, 0.3, -0.6); X.armR(-0.35, 0.2, -1.0);
    X.set(B.head, 0.05, 0.03 * osc(t, 0.07), 0.06);
    if (pulse(t, 0.04, 0.2) > 0.85) X.face.mode = 'laugh';
  },
  type: (X, t) => {
    seated(X, t);
    X.set(B.chest, 0.08, 0, 0);
    X.armL(-0.55, 0.15, -1.25 + 0.06 * osc(t, 4.1), 0, 0.2); X.armR(-0.55, 0.15, -1.25 + 0.06 * osc(t, 3.7, 0.3), 0, 0.2);
    X.foreIn(0.35, 0.35);
    X.set(B.head, 0.12 + 0.03 * osc(t, 0.2), 0.05 * osc(t, 0.13), 0);
    X.face.mode = 'focused';
  },
  read: (X, t) => {
    idle(X, t);
    X.armL(-0.5, 0.15, -1.6); X.armR(-0.5, 0.15, -1.6); X.foreIn(0.65, 0.65);
    X.set(B.head, 0.45, 0.06 * osc(t, 0.15), 0);
    if (Math.floor(t / 6) % 2 === 1) X.face.mode = 'focused';
  },
  treadmill: (X, t) => walkCycle(X, t, true),
  lift: (X, t) => {
    idle(X, t);
    const c = pulse(t, 0.5);
    X.armL(-0.15, 0.2, -0.3 - 2.0 * c); X.armR(-0.15, 0.2, -0.3 - 2.0 * pulse(t, 0.5, 0.5));
    X.set(B.chest, -0.05, 0, 0);
    X.face.mode = 'tense';
  },
  yoga: (X, t) => {
    const ph = Math.floor(t / 8) % 2;
    if (ph === 0) {
      // Baum
      X.legL(0.25, 0, 0.3, 1.25); X.set(B.shinL, 0, 0, -2.5);
      X.legR(0, 0, 0, 0);
      X.armL(0, 2.9, -0.15); X.armR(0, 2.9, -0.15); X.foreIn(0.2, 0.2);
      X.set(B.hips, 0, 0, 0.03 * osc(t, 0.3));
    } else {
      // Krieger
      X.legL(0.75, 0.9, -0.3, 0); X.legR(-0.55, 0.0, 0.4, 0);
      X.armL(0, 1.5, 0); X.armR(0, 1.5, 0);
      X.set(B.hips, 0, 0.5, 0); X.set(B.chest, 0, -0.4, 0); X.set(B.head, 0, 0.1, 0);
    }
    X.breathe(t, 2);
    X.ground();
    X.face.mode = 'closed';
  },
  punch: (X, t) => {
    const j1 = pulse(t, 0.9), j2 = pulse(t, 0.9, 0.5);
    X.legL(0.25, 0.3, 0, 0.12); X.legR(-0.15, 0.25, 0, 0.12);
    X.set(B.hips, 0, 0.35, 0); X.set(B.chest, 0.1, -0.2 - 0.25 * j1 + 0.25 * j2, 0);
    X.armL(-1.0 - 0.6 * j2, 0.2, -2.0 + 1.8 * j2); X.armR(-1.0 - 0.6 * j1, 0.2, -2.0 + 1.8 * j1);
    X.foreIn(0.4, 0.4);
    X.set(B.head, 0.1, -0.3, 0);
    X.ground(0.02 * osc(t, 1.8));
    X.face.mode = 'tense';
  },
  paint: (X, t) => {
    idle(X, t);
    X.armL(-0.6, 0.35, -1.6); X.foreIn(0.4, 0);
    X.armR(-1.1 - 0.25 * osc(t, 0.7), 0.2 + 0.2 * osc(t, 0.5), -0.6 - 0.3 * osc(t, 0.7, 0.3));
    X.set(B.head, 0.05, 0.1 * osc(t, 0.2), 0.08);
    X.face.mode = 'focused';
  },
  piano: (X, t) => {
    seated(X, t);
    X.set(B.chest, 0.06 + 0.05 * osc(t, 0.5), 0.08 * osc(t, 0.25), 0);
    X.armL(-0.65, 0.18 + 0.08 * osc(t, 0.3), -1.0 + 0.1 * pulse(t, 2.2), 0, 0.2); X.armR(-0.65, 0.18 + 0.08 * osc(t, 0.3, 0.4), -1.0 + 0.1 * pulse(t, 2.6, 0.3), 0, 0.2);
    X.foreIn(0.3, 0.3);
    X.set(B.head, 0.15 + 0.08 * osc(t, 1), 0, 0.06 * osc(t, 0.5));
    X.face.mode = 'inspired';
  },
  guitar: (X, t) => {
    idle(X, t);
    X.armL(-0.7, 0.55, -1.8, 0.3); X.foreIn(0.3, 0);
    X.armR(-0.35, 0.1, -1.3 + 0.18 * osc(t, 2.2)); X.foreIn(0, 0.5);
    X.set(B.head, 0.25, 0.15, 0.1 * osc(t, 0.6));
    X.add(B.hips, 0, 0, 0.04 * osc(t, 0.6));
    X.face.mode = 'happy';
  },
  chess: (X, t) => {
    seated(X, t);
    const mv = smooth01((osc(t, 0.08) - 0.75) * 6);
    X.set(B.chest, 0.15, 0, 0);
    X.armL(-1.1, 0.25, -2.2, 0); X.foreIn(0.5, 0);
    X.armR(-0.45 - 0.45 * mv, 0.15, -1.2 + 0.6 * mv);
    X.set(B.head, 0.35, 0, 0.12 * (1 - mv));
    X.face.mode = 'focused';
  },
  telescope: (X, t) => {
    idle(X, t);
    X.set(B.spine, 0.25, 0, 0); X.set(B.chest, 0.15, 0, 0); X.set(B.head, -0.25, 0.04 * osc(t, 0.1), 0);
    X.armL(-1.4, 0.25, -1.2); X.armR(-1.2, 0.2, -1.5 + 0.1 * osc(t, 0.3)); X.foreIn(0.4, 0.4);
    X.face.mode = 'focused';
  },
  garden: (X, t) => {
    X.kneel();
    X.set(B.spine, 0.35, 0, 0); X.set(B.chest, 0.3, 0, 0); X.set(B.head, 0.3, 0.1 * osc(t, 0.2), 0);
    X.armL(-1.0 - 0.15 * osc(t, 0.8), 0.15, -0.3); X.armR(-1.0 - 0.15 * osc(t, 0.8, 0.5), 0.15, -0.3 - 0.3 * pulse(t, 0.8));
  },
  fish: (X, t) => {
    idle(X, t);
    const cast = smooth01(((t % 12) - 0.2) * 2) * (1 - smooth01(((t % 12) - 0.9) * 3));
    X.armR(-0.6 + 0.9 * cast, 0.15, -1.0 - 0.6 * cast); X.foreIn(0, 0.2);
    X.armL(-0.6, 0.1, -1.2); X.foreIn(0.6, 0);
    X.set(B.head, 0.1, 0, 0);
  },
  photo: (X, t) => {
    idle(X, t);
    X.armL(-1.0, 0.3, -1.9); X.armR(-1.0, 0.3, -1.9); X.foreIn(0.7, 0.7);
    X.set(B.head, 0.05, 0, 0);
    X.set(B.chest, 0, 0.15 * osc(t, 0.1), 0);
  },
  repair: (X, t) => {
    X.kneel();
    X.set(B.spine, 0.25, 0, 0); X.set(B.chest, 0.15, 0, 0); X.set(B.head, 0.3, 0, 0);
    const h = pulse(t, 1.4);
    X.armL(-1.0, 0.15, -0.6); X.armR(-1.4 + 0.5 * h, 0.15, -1.2 + 0.4 * h);
    X.face.mode = 'focused';
  },
  clean: (X, t) => {
    idle(X, t);
    X.set(B.spine, 0.25, 0, 0); X.set(B.chest, 0.15, 0.1 * osc(t, 0.6), 0);
    X.armR(-1.0 + 0.2 * osc(t, 0.9), 0.25 + 0.2 * osc(t, 0.9, 0.25), -0.5); X.armL(-0.3, 0.15, -0.6);
    X.set(B.head, 0.35, 0, 0);
  },
  phone: (X, t) => {
    idle(X, t);
    if (Math.floor(t / 7) % 2 === 0) {
      X.armR(-0.3, 0.45, -2.5, 0, 0); X.foreIn(0, 0.4);
      X.armL(-0.2, 0.12, -1.4); X.foreIn(0.8, 0);
      X.add(B.head, 0, 0, -0.15);
      X.face.open = 1;
    } else {
      X.armR(-0.35, 0.15, -1.5); X.foreIn(0, 0.5);
      X.armL(-0.35, 0.15, -1.5); X.foreIn(0.3, 0);
      X.set(B.head, 0.45, 0, 0);
    }
  },
  swim: (X, t) => {
    const d = X.d;
    X.standing = false;
    X.set(B.root, PI / 2 - 0.15, 0, 0);
    X.P.pz = -d.H * 0.5; X.P.py = -d.hipY * 0.15 + 0.02 * osc(t, 0.8);
    const ph = t * 0.8;
    X.armL(-PI / 2 + 1.6 * Math.sin(ph * PI * 2), 0.15, -0.3); X.armR(-PI / 2 - 1.6 * Math.sin(ph * PI * 2), 0.15, -0.3);
    X.legL(0.25 * osc(t, 2), 0.2, -0.6); X.legR(-0.25 * osc(t, 2), 0.2, -0.6);
    X.set(B.head, -0.7, 0.2 * osc(t, 0.8), 0);
    X.set(B.chest, 0, 0.15 * osc(t, 0.8), 0);
  },
  grill: (X, t) => {
    idle(X, t);
    const flip = pulse(t, 0.4);
    X.armR(-0.7 - 0.3 * flip, 0.2, -0.9 + 0.2 * flip, 0, -0.6 * flip); X.armL(-0.3, 0.15, -1.3); X.foreIn(0.5, 0.2);
    X.set(B.chest, 0.1, 0, 0); X.set(B.head, 0.35, 0, 0);
  },
  play: (X, t) => {
    X.floorLegs();
    X.breathe(t);
    X.set(B.chest, 0.2, 0.2 * osc(t, 0.3), 0);
    X.armL(-0.9 - 0.2 * osc(t, 1), 0.2, -0.8); X.armR(-0.9 - 0.2 * osc(t, 1, 0.5), 0.2, -0.8);
    X.set(B.head, 0.35, 0.2 * osc(t, 0.3), 0);
    X.face.mode = 'happy';
  },
  swing: (X, t) => {
    seated(X, t);
    const s = osc(t, 0.45);
    X.set(B.root, 0.25 * s, 0, 0);
    X.set(B.spine, -0.25 * s, 0, 0);
    X.armL(-0.5 - 0.3 * s, -0.1, -1.6); X.armR(-0.5 - 0.3 * s, -0.1, -1.6);
    X.face.mode = 'happy';
  },
  carry: (X, t) => {
    idle(X, t);
    X.armL(-1.0, 0.2, -0.9); X.armR(-1.0, 0.2, -0.9); X.foreIn(0.55, 0.55);
    X.set(B.chest, -0.06, 0, 0);
  },
  cuddle: (X, t) => {
    seated(X, t);
    X.set(B.spine, -0.1, 0, 0.18); X.set(B.chest, 0, 0.2, 0.1);
    X.armL(-0.5, 1.3, -0.9); X.armR(-0.5, 0.2, -1.2);
    X.set(B.head, 0.1, 0.3, 0.3);
    X.face.mode = 'love';
  },
  think: (X, t) => {
    idle(X, t);
    X.armR(-0.5, 0.25, -2.4); X.foreIn(0, 0.7);
    X.armL(-0.4, 0.2, -1.5); X.foreIn(1.0, 0);
    X.set(B.head, -0.15, 0.15 * osc(t, 0.1), 0.15);
    X.face.mode = 'focused';
  },
  cheer: (X, t) => {
    const b = Math.max(0, osc(t, 1.3));
    X.legL(0.1 * b, 0.25 * b, 0, 0.05); X.legR(0.1 * b, 0.25 * b, 0, 0.05);
    X.armL(-0.3, 2.6 + 0.3 * b, -0.3); X.armR(-0.3, 2.6 + 0.3 * b, -0.3);
    X.set(B.head, -0.2, 0, 0);
    X.ground(0.12 * b);
    X.face.mode = 'laugh';
  },
  mirror: (X, t) => {
    idle(X, t);
    const ph = Math.floor(t / 4) % 3;
    if (ph === 0) { X.armR(-0.6, 1.8, -1.8); X.foreIn(0, 0.5); }
    else if (ph === 1) { X.armL(0.2, 0.5, -1.6); X.armR(0.2, 0.5, -1.6); X.set(B.hips, 0, 0.3, 0.05); }
    else { X.armL(-0.4, 0.2, -2.3); X.set(B.head, 0, 0.3, 0.1); }
    X.face.mode = 'confident';
  },
  serve: (X, t) => {
    idle(X, t);
    X.armR(-0.3, 0.6, -2.0, 0, -0.2); X.foreIn(0, -0.5);
    X.armL(-0.2, 0.12, -0.4);
    X.face.mode = 'happy';
  },
  examine: (X, t) => {
    idle(X, t);
    X.set(B.spine, 0.2, 0, 0); X.set(B.chest, 0.1, 0, 0); X.set(B.head, 0.3, 0.1 * osc(t, 0.2), 0);
    X.armR(-1.1, 0.2, -0.6 + 0.2 * osc(t, 0.3)); X.armL(-0.2, 0.25, -1.9); X.foreIn(0.3, 0.3);
    X.face.mode = 'focused';
  },
  mic: (X, t) => {
    idle(X, t);
    X.armR(-0.5, 0.4, -2.3); X.foreIn(0, 0.6);
    X.armL(-0.6 - 0.6 * pulse(t, 0.5), 0.5 + 0.3 * pulse(t, 0.3), -0.6);
    X.add(B.hips, 0, 0, 0.06 * osc(t, 0.7));
    X.set(B.head, -0.05, 0.15 * osc(t, 0.35), 0.08 * osc(t, 0.7));
    X.face.open = 1;
  },
  register: (X, t) => {
    idle(X, t);
    const sc = pulse(t, 0.6);
    X.armR(-0.6 - 0.25 * sc, 0.25 + 0.3 * sc, -1.0); X.armL(-0.55, 0.15, -1.1 + 0.1 * osc(t, 3));
    X.foreIn(0.4, 0.3);
    X.set(B.chest, 0.06, 0.15 * sc, 0); X.set(B.head, 0.25, 0.1 * sc, 0);
  },
  pet: (X, t) => {
    X.crouch();
    X.set(B.spine, 0.3, 0, 0); X.set(B.chest, 0.2, 0, 0); X.set(B.head, 0.35, 0, 0.1);
    const s = osc(t, 0.8);
    X.armR(-0.9 - 0.12 * s, 0.15, -0.35 + 0.15 * s); X.armL(-0.4, 0.2, -1.4);
    X.face.mode = 'happy';
  },
  sitfloor: (X, t) => {
    X.floorLegs();
    X.breathe(t);
    X.set(B.chest, 0.08, 0, 0);
    X.armL(-0.55, 0.25, -0.6); X.armR(-0.55, 0.25, -0.6); X.foreIn(0.3, 0.3);
    X.set(B.head, 0.1, 0.2 * osc(t, 0.06), 0);
  },
  flirt: (X, t) => {
    idle(X, t);
    X.set(B.hips, 0, 0.15, 0.08); X.legL(0.15, 0.25, 0, -0.08); X.ground();
    X.armR(0.0, 0.55, -1.9, 0); X.foreIn(0, -0.4);
    X.armL(-0.5, 1.4 + 0.1 * osc(t, 0.4), -2.0); X.foreIn(0.4, 0);
    X.set(B.head, 0.05, 0.1, 0.22 + 0.05 * osc(t, 0.3));
    X.face.mode = 'love';
  },
  embarrassed: (X, t) => {
    idle(X, t);
    X.set(B.chest, 0.15, 0, 0); X.set(B.head, 0.45, 0.2 * osc(t, 0.25), 0);
    X.armL(0.3, 0.12, -0.6); X.armR(0.3, 0.12, -0.6); X.foreIn(-0.3, -0.3);
    X.add(B.hips, 0, 0, 0.05 * osc(t, 0.5));
    X.face.mode = 'embarrassed';
  },
  stretch: (X, t) => {
    const c = smooth01(((t % 5) / 5) * 3) * (1 - smooth01(((t % 5) / 5 - 0.7) * 4));
    X.armL(-0.4 * c, 2.8 * c + 0.1, -0.3 * c); X.armR(-0.4 * c, 2.8 * c + 0.1, -0.3 * c);
    X.set(B.spine, -0.12 * c, 0, 0.12 * osc(t, 0.2) * c); X.set(B.chest, -0.1 * c, 0, 0); X.set(B.head, -0.3 * c, 0, 0);
    X.ground(0.02 * c);
    X.face.mode = c > 0.5 ? 'closed' : null;
  },
  baby: (X, t) => {
    X.lie();
    X.set(B.head, 0.1, 0.35 * osc(t, 0.2), 0);
    X.armL(-1.4 + 0.4 * osc(t, 0.9), 0.4, -1.2 + 0.3 * osc(t, 1.3)); X.armR(-1.4 + 0.4 * osc(t, 0.8, 0.3), 0.4, -1.2 + 0.3 * osc(t, 1.1));
    X.legL(1.1 + 0.3 * osc(t, 0.7), 1.2 + 0.3 * osc(t, 1.0), 0, 0.3); X.legR(1.1 + 0.3 * osc(t, 0.75, 0.5), 1.2 + 0.3 * osc(t, 0.9), 0, 0.3);
    X.face.mode = osc(t, 0.07) > 0.6 ? 'closed' : 'happy';
  },
  crawl: (X, t) => {
    const d = X.d;
    X.standing = false;
    const ph = t * 1.1 * PI * 2, s = Math.sin(ph);
    X.set(B.hips, PI / 2 - 0.12, 0.05 * s, 0);
    X.set(B.spine, 0.05, 0, 0);
    X.set(B.chest, 0.05, -0.05 * s, 0);
    X.set(B.thighL, -PI / 2 + 0.12 - 0.25 * s, 0, 0.1); X.set(B.shinL, PI / 2 + 0.25 * s, 0, 0);
    X.set(B.thighR, -PI / 2 + 0.12 + 0.25 * s, 0, -0.1); X.set(B.shinR, PI / 2 - 0.25 * s, 0, 0);
    X.set(B.footL, 0.6, 0, 0); X.set(B.footR, 0.6, 0, 0);
    // Arme: im Körperrahmen "nach vorn" = zum Boden
    const armTilt = PI / 2 - 0.12 - 0.15;
    X.armL(-armTilt + 0.25 * s, 0.1, -0.15); X.armR(-armTilt - 0.25 * s, 0.1, -0.15);
    X.set(B.neck, -0.4, 0, 0); X.set(B.head, -0.7, 0.15 * Math.sin(ph * 0.5), 0);
    X.P.py = d.thighLen + d.shinR - d.hipY + 0.01;
    X.face.mode = 'happy';
  },
  pushups: (X, t) => {
    const d = X.d;
    X.standing = false;
    const c = (Math.sin(t * 0.9 * PI * 2) + 1) / 2; // 1 = oben
    const armLen = d.upLen + d.foreLen + 0.06 * d.ws;
    const bend = (1 - c) * 1.3;
    const effArm = armLen * (0.55 + 0.45 * Math.cos(bend * 0.5) * c + 0.45 * (1 - c) * 0.55);
    const th = Math.acos(clamp(effArm / d.shY, 0.05, 0.98));
    X.set(B.root, th, 0, 0);
    X.armL(-th - 0.05, 0.12, -bend); X.armR(-th - 0.05, 0.12, -bend);
    X.set(B.footL, 0.7, 0, 0); X.set(B.footR, 0.7, 0, 0);
    X.set(B.head, -0.5, 0, 0);
    X.face.mode = 'tense';
  },
};

// ---------- Modell ----------
const _wp = new THREE.Vector3();

export class HumanModel {
  readonly object: THREE.Object3D;
  private mesh: THREE.SkinnedMesh | null = null;
  private bones: THREE.Bone[] = [];
  private d!: Dims;
  private key = '';
  private readonly cur = new Pose();
  private readonly from = new Pose();
  private readonly tgt = new Pose();
  private readonly rig = new Rig();
  private blendT = 1;
  private lastAnim: AnimId | null = null;
  private lastSeated = false;
  private clock = 0;
  private nextBlink = 2;
  private blinkT = -1;
  private readonly seed: number;
  private readonly face: FaceParams = { brow: 0, browUp: 0, smile: 0.2, open: 0, eye: 1, blush: 0, pucker: 0 };
  private slump = 0;
  private bounce = 0;
  private browBase: [number, number] = [0, 0];
  private prop: THREE.Mesh | null = null;
  private propId: string | null = null;
  private highlight = false;
  private age: AgeStage = 'adult';

  constructor(look: Appearance, age: AgeStage, outfit: OutfitKind) {
    this.object = new THREE.Group();
    this.object.name = 'human';
    this.seed = Math.random() * 1000;
    this.nextBlink = 1 + hash01(this.seed) * 3;
    this.setLook(look, age, outfit);
  }

  setLook(look: Appearance, age: AgeStage, outfit: OutfitKind): void {
    const of = look.outfits?.[outfit];
    const key = JSON.stringify([look.frame, look.height, look.weight, look.muscle, look.skin, look.headShape, look.jaw, look.nose, look.noseSize, look.eyes, look.eyeColor, look.brows, look.hair, look.hairColor, look.beard, look.glasses, look.accessory, look.accessoryColor, of, age, outfit]);
    if (key === this.key) return;
    this.key = key;
    this.age = age;
    const d = computeDims(look, age);
    this.d = d;
    this.rig.d = d;
    const geo = buildGeometry(look, age, outfit, d);
    if (this.mesh) {
      this.object.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.skeleton.dispose();
    }
    const defs = [
      { p: -1, x: 0, y: 0, z: 0 },
      { p: 0, x: 0, y: d.hipY, z: 0 },
      { p: 1, x: 0, y: d.spineY, z: 0 },
      { p: 2, x: 0, y: d.chestY, z: 0 },
      { p: 3, x: 0, y: d.neckY, z: 0 },
      { p: 4, x: 0, y: d.headY, z: 0 },
      { p: 5, x: 0, y: d.eyeY, z: faceZ(d, 0, d.eyeY) },
      { p: 5, x: 0, y: d.mouthY, z: faceZ(d, 0, d.mouthY) + d.mouthOut },
      { p: 5, x: 0.0375 * d.hs, y: d.mouthY, z: faceZ(d, 0, d.mouthY) + d.mouthOut },
      { p: 5, x: -0.0375 * d.hs, y: d.mouthY, z: faceZ(d, 0, d.mouthY) + d.mouthOut },
      { p: 5, x: d.eyeX, y: d.browY, z: faceZ(d, d.eyeX, d.browY) },
      { p: 5, x: -d.eyeX, y: d.browY, z: faceZ(d, d.eyeX, d.browY) },
      { p: 5, x: 0, y: d.eyeY - 0.13 * d.hs, z: faceZ(d, 0, d.eyeY) },
      { p: 3, x: d.shX, y: d.shY, z: 0 },
      { p: 13, x: d.shX, y: d.shY - d.upLen, z: 0 },
      { p: 14, x: d.shX, y: d.shY - d.upLen - d.foreLen, z: 0 },
      { p: 3, x: -d.shX, y: d.shY, z: 0 },
      { p: 16, x: -d.shX, y: d.shY - d.upLen, z: 0 },
      { p: 17, x: -d.shX, y: d.shY - d.upLen - d.foreLen, z: 0 },
      { p: 1, x: d.hipX, y: d.hipY, z: 0 },
      { p: 19, x: d.hipX, y: d.kneeY, z: 0 },
      { p: 20, x: d.hipX, y: d.ankleY, z: 0 },
      { p: 1, x: -d.hipX, y: d.hipY, z: 0 },
      { p: 22, x: -d.hipX, y: d.kneeY, z: 0 },
      { p: 23, x: -d.hipX, y: d.ankleY, z: 0 },
    ];
    this.bones = makeBones(defs);
    this.browBase = [this.bones[B.browL]!.position.y, this.bones[B.browR]!.position.y];
    const { mesh } = makeSkinned(geo, this.bones, d.H * 0.5, Math.max(1.0, d.H * 0.75));
    mesh.material = this.highlight ? figureHighlightMaterial() : figureMaterial();
    this.mesh = mesh;
    this.object.add(mesh);
    // Requisite neu anhängen
    const pid = this.propId;
    this.propId = null;
    if (this.prop) { this.prop.parent?.remove(this.prop); this.prop = null; }
    this.setProp(pid);
    this.lastAnim = null;
  }

  /** Anzahl Dreiecke des Körpers (Diagnose) */
  get triangles(): number {
    const i = this.mesh?.geometry.getIndex();
    return i ? i.count / 3 : 0;
  }

  private setProp(id: string | null | undefined): void {
    const pid = id ?? null;
    if (pid === this.propId) return;
    this.propId = pid;
    if (this.prop) { this.prop.parent?.remove(this.prop); this.prop = null; }
    if (!pid) return;
    const geo = propGeometry(pid);
    if (!geo) return;
    const m = new THREE.Mesh(geo, this.highlight ? figureHighlightMaterial() : figureMaterial());
    const pm = propMount(pid, this.d);
    const k = this.d.kid ? Math.max(0.6, this.d.ws) : 1;
    m.position.set(pm.x, pm.y, pm.z);
    m.rotation.set(pm.rx, pm.ry, pm.rz);
    m.scale.setScalar(k);
    m.castShadow = true;
    this.bones[pm.bone]!.add(m);
    this.prop = m;
  }

  update(st: HumanAnimState, dt: number): void {
    if (!this.mesh) return;
    const step = Number.isFinite(dt) ? clamp(dt, 0, 0.25) : 0;
    this.clock += step;
    const t = Number.isFinite(st.t) ? Math.max(0, st.t) : 0;
    const anim: AnimId = POSES[st.anim] ? st.anim : 'idle';
    const seatedAnim = SEATED_ANIMS.has(anim);
    const seatY = st.seatY !== undefined && st.seatY > 0.15 ? st.seatY : seatedAnim ? (st.seatY ?? 0.45) : -1;
    const seatedNow = seatY > 0;
    if (anim !== this.lastAnim || seatedNow !== this.lastSeated) {
      if (this.lastAnim !== null) { this.from.copy(this.cur); this.blendT = 0; } else this.blendT = 1;
      this.lastAnim = anim;
      this.lastSeated = seatedNow;
    }
    this.setProp(st.holding);

    // ---- Zielpose ----
    const X = this.rig, P = this.tgt, d = this.d;
    P.reset();
    X.P = P;
    X.face.mode = null;
    X.face.open = 0;
    X.standing = true;
    // Grundhaltung: Arme leicht abgespreizt (gegen Durchdringen der Hüfte)
    const abd = 0.07 + 0.07 * Math.max(0, d.weight) + (d.kid ? 0.03 : 0);
    X.set(B.upArmL, 0, 0, abd); X.set(B.upArmR, 0, 0, -abd);
    if (d.senior) { X.set(B.chest, 0.1, 0, 0); X.set(B.neck, -0.05, 0, 0); }
    const fn = POSES[anim];
    // Emotionen beeinflussen das Tempo der Grundanims leicht
    const emo = st.emo in EMO_FACE ? st.emo : 'fine';
    const k = clamp(((st.emoPower || 0) - 1) / 4, 0.35, 1);
    const slow = (emo === 'sad' || emo === 'tired') && (anim === 'idle' || anim === 'walk') ? 0.8 : 1;
    fn(X, t * slow);
    if (d.senior && (anim === 'idle' || anim === 'walk')) X.add(B.chest, 0.06);
    if (seatedNow && !seatedAnim) X.sitLegs(seatY, t);
    else if (seatedAnim) {
      const r = P.r, i0 = B.root * 3;
      const rootRot = r[i0]!; // Schaukel behält Drehung
      X.sitLegs(seatY, t);
      r[i0] = rootRot;
    }
    // Emotions-Haltung (geglättet)
    const sl = (emo === 'sad' || emo === 'tired' ? 1 : emo === 'embarrassed' ? 0.5 : emo === 'confident' ? -0.5 : 0) * k;
    const bo = (emo === 'happy' || emo === 'playful' ? 1 : 0) * k;
    const a = 1 - Math.exp(-step * 3);
    this.slump += (sl - this.slump) * a;
    this.bounce += (bo - this.bounce) * a;
    if (X.standing && (anim === 'idle' || anim === 'walk' || anim === 'talk' || anim === 'listen' || anim === 'think' || anim === 'phone' || seatedNow)) {
      X.add(B.chest, 0.12 * this.slump);
      X.add(B.head, 0.15 * this.slump);
      X.add(B.upArmL, 0.04 * this.slump, 0, -0.03 * this.slump);
      X.add(B.upArmR, 0.04 * this.slump, 0, 0.03 * this.slump);
      if (anim === 'idle') { P.py += 0.008 * this.bounce * Math.abs(osc(t, 1.1)); X.add(B.head, 0, 0, 0.05 * this.bounce * osc(t, 0.55)); }
    }

    // ---- Überblendung ----
    if (this.blendT < 1) {
      this.blendT = Math.min(1, this.blendT + step / 0.22);
      this.cur.blend(this.from, P, smooth01(this.blendT));
    } else this.cur.copy(P);

    // ---- auf Bones anwenden ----
    const bones = this.bones, r = this.cur.r;
    for (let i = 0; i < NB; i++) {
      if (i >= B.eyes && i <= B.blush) continue;
      bones[i]!.rotation.set(r[i * 3]!, r[i * 3 + 1]!, r[i * 3 + 2]!);
    }
    bones[B.root]!.position.set(this.cur.px, this.cur.py, this.cur.pz);

    // ---- Mimik ----
    const ov = X.face.mode;
    let tf: FaceParams;
    let kk = 1;
    if (ov === 'closed' || ov === 'kiss' || ov === 'laugh' || ov === 'cry' || ov === 'shout') tf = OV_FACE[ov];
    else if (ov) tf = EMO_FACE[ov];
    else { tf = EMO_FACE[emo]; kk = k; }
    const fa = 1 - Math.exp(-step * 10);
    const F = this.face, N = EMO_FACE.fine;
    F.brow += (lerp(N.brow, tf.brow, kk) - F.brow) * fa;
    F.browUp += (lerp(N.browUp, tf.browUp, kk) - F.browUp) * fa;
    F.smile += (lerp(N.smile, tf.smile, kk) - F.smile) * fa;
    F.open += (lerp(N.open, tf.open, kk) - F.open) * fa;
    F.eye += (lerp(N.eye, tf.eye, kk) - F.eye) * fa;
    F.blush += (lerp(N.blush, tf.blush, kk) - F.blush) * fa;
    F.pucker += (lerp(N.pucker, tf.pucker, kk) - F.pucker) * fa;
    // Blinzeln
    if (this.clock >= this.nextBlink) { this.blinkT = 0; this.nextBlink = this.clock + 2 + hash01(this.clock + this.seed) * 4; }
    let blink = 1;
    if (this.blinkT >= 0) {
      this.blinkT += step;
      blink = Math.abs(this.blinkT / 0.075 - 1);
      if (this.blinkT > 0.15) { this.blinkT = -1; blink = 1; }
    }
    const eyeS = Math.max(0.06, Math.min(F.eye, 1.15) * Math.min(1, blink));
    bones[B.eyes]!.scale.set(1, eyeS, 1);
    // Mund
    const talking = !!st.talking || X.face.open > 0;
    let talkOpen = 0;
    if (talking) talkOpen = Math.abs(Math.sin(this.clock * 13) * Math.sin(this.clock * 4.7 + this.seed)) * (st.talking || X.face.open >= 1 ? 1 : X.face.open);
    const open = clamp(F.open + talkOpen * 0.8 + (ov === 'laugh' ? 0.3 * Math.abs(osc(t, 3)) : 0), 0, 1.2);
    bones[B.mouth]!.scale.set(1 - 0.45 * F.pucker + 0.1 * Math.max(0, F.smile), 1 + open * 3.2, 1 + F.pucker * 0.8);
    const cs = Math.max(0.0001, 1 - F.pucker);
    bones[B.mouthL]!.scale.setScalar(cs);
    bones[B.mouthR]!.scale.setScalar(cs);
    bones[B.mouthL]!.rotation.set(0, 0, 0.6 * F.smile);
    bones[B.mouthR]!.rotation.set(0, 0, -0.6 * F.smile);
    // Brauen (positiv = wütend: innen runter)
    bones[B.browL]!.rotation.set(0, 0, 0.35 * F.brow);
    bones[B.browR]!.rotation.set(0, 0, -0.35 * F.brow);
    const by = (F.browUp * 0.035 - Math.max(0, F.brow) * 0.012) * d.hs;
    bones[B.browL]!.position.y = this.browBase[0] + by;
    bones[B.browR]!.position.y = this.browBase[1] + by;
    bones[B.blush]!.scale.setScalar(Math.max(0.0001, F.blush));
  }

  /** Welt-Höhe der Kopfoberkante (für Sprechblasen/Namen) */
  headHeight(): number {
    const hb = this.bones[B.head];
    if (!hb) return this.object.position.y + 1.8;
    hb.updateWorldMatrix(true, false);
    hb.getWorldPosition(_wp);
    const sc = this.object.scale.y;
    return _wp.y + (this.d.H - this.d.headY + 0.04) * sc;
  }

  setHighlight(on: boolean): void {
    if (on === this.highlight) return;
    this.highlight = on;
    const m = on ? figureHighlightMaterial() : figureMaterial();
    if (this.mesh) this.mesh.material = m;
    if (this.prop) this.prop.material = m;
  }

  /** Körpergröße in Metern (stehend) */
  get height(): number {
    return this.d.H;
  }
  get ageStage(): AgeStage {
    return this.age;
  }

  dispose(): void {
    if (this.mesh) {
      this.object.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.skeleton.dispose();
      this.mesh = null;
    }
    if (this.prop) { this.prop.parent?.remove(this.prop); this.prop = null; }
  }
}
