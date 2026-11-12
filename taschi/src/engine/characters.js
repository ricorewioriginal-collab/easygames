// Humanoid characters: modular appearance, articulated rig and a procedural
// animation system with blended clips (idle, walk, run, talk, interact,
// throw, cheer, defeat, wave, look). Parts are merged per bone so a
// character costs ~13 draw calls with one shared toon material.
import { THREE as T3 } from './three.js';
import { Builder, matrix, fineThree, fineCapsule, fineLathe } from './geometry.js';
// feinere Rundungen (siehe geometry.js › fineThree)
const THREE = fineThree(T3), capsule = fineCapsule, lathe = fineLathe;
import { toonVertexMaterial, outlineMaterial, glowMaterial, characterMaterial } from './materials.js';
import { createRng, hashString } from '../core/rng.js';
import { buildZotikRig } from './zotik.js';
import { KKCharacter } from './kaykit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const C = (c) => new THREE.Color(c);
const shade = (c, f) => C(c).multiplyScalar(f).getHex();

export const EYE_COLORS = [0x5a3a22, 0x2f6fb0, 0x3a8a5a, 0x8a5a2a, 0x5a4a8a, 0x2a7a8a];
export const SKIN_TONES = [0xf6d2b8, 0xeec09a, 0xd49a6a, 0xa86f48, 0x7a4a2e];
export const HAIR_COLORS = [0x3b2a22, 0x6b4128, 0xa86a3a, 0xe0b35a, 0x1d1d26, 0xb83a2a, 0x8a96b8, 0xf2efe8, 0x5a3a8a, 0x2f7a6a];
export const OUTFIT_COLORS = [0xd8483a, 0x3a7fd0, 0x2fa07a, 0xf0a030, 0x7d4fa3, 0xe86aa0, 0x3a4a5a, 0xf2efe6];
export const HAIR_STYLES = ['short', 'spiky', 'ponytail', 'long', 'bun', 'bob', 'curly', 'twin'];

// Player looks, one per gender choice in the character creator. TASCHI's own
// modern explorer: long-sleeved softshell jacket with stand collar, diagonal
// zip and shoulder panels, explorer goggles on a headband, leather bracers,
// a cross-body strap, a utility belt with a small glowing "Licht" lantern and
// capsule pouches, a roll-top backpack, cargo pockets and hiking boots.
// (Internal keys stay 'trainer'/'trainercap' so existing saves keep working.)
export const GENDERS = [['m', 'Männlich'], ['w', 'Weiblich'], ['d', 'Divers']];
export const BODY_FOR_GENDER = { m: 'teenM', w: 'teenF', d: 'teen' };
export const PLAYER_PRESETS = {
  m: { name: 'Rio', gender: 'm', body: 'teenM', skin: 1, hair: 'spiky', hairColor: 4, top: 'trainer', topColor: 0x2e6e78, accent: 0xf0a030, inner: 0x2a2d36, bottom: 'pants', bottomColor: 0x4a4a3a, hat: 'trainercap', hatColor: 0x2a2d36, capFront: 0x8ff0ff, gloves: 0x8a5a3a, belt: 0x5a4030, backpack: 0xd8642a, shoes: 0x5a4030 },
  w: { name: 'Mila', gender: 'w', body: 'teenF', skin: 0, hair: 'ponytail', hairColor: 2, top: 'trainer', topColor: 0xd9573f, accent: 0xf2e2c4, inner: 0x3a4a5a, bottom: 'pants', bottomColor: 0x3a3048, hat: 'trainercap', hatColor: 0xf2e2c4, capFront: 0xffc86a, gloves: 0x6a4a3a, belt: 0x3a3048, backpack: 0x2f8a7a, shoes: 0x6a4a3a, lashes: true },
  d: { name: 'Juna', gender: 'd', body: 'teen', skin: 3, hair: 'bob', hairColor: 8, top: 'trainer', topColor: 0x6a7a3a, accent: 0xf0a030, inner: 0xf2efe6, bottom: 'shorts', bottomColor: 0x3a3048, hat: 'beanie', hatColor: 0xf0a030, gloves: 0x3a4a5a, belt: 0x4a3a2a, backpack: 0x3a7fd0, shoes: 0x3a3330 }
};

const BODY = {
  teen: { h: 1.55, w: 1, head: 1.08 }, teenM: { h: 1.58, w: 1.05, head: 1.06 }, teenF: { h: 1.53, w: 0.93, head: 1.08, hips: 1.12 }, adult: { h: 1.72, w: 1.05, head: 1 }, slim: { h: 1.78, w: 0.88, head: 0.98 },
  stocky: { h: 1.62, w: 1.3, head: 1.02 }, elder: { h: 1.6, w: 1.05, head: 1, stoop: 0.18 }, child: { h: 1.15, w: 0.9, head: 1.25 }
};

// Resolve appearance definition into concrete colours.
export function resolveLook(look = {}) {
  const pick = (v, list, d) => typeof v === 'number' && v < list.length ? list[v] : (v ?? d);
  return {
    body: look.body || 'adult', skin: pick(look.skin, SKIN_TONES, SKIN_TONES[1]), hair: look.hair || 'short', hairColor: pick(look.hairColor, HAIR_COLORS, HAIR_COLORS[0]),
    top: look.top || 'tshirt', topColor: pick(look.topColor, OUTFIT_COLORS, OUTFIT_COLORS[1]), accent: look.accent ?? 0xf2efe6, bottom: look.bottom || 'pants', bottomColor: look.bottomColor ?? 0x34465f,
    shoes: look.shoes ?? 0x3a3330, hat: look.hat || null, hatColor: look.hatColor ?? 0xd8483a, glasses: !!look.glasses, beard: look.beard ? (look.beardColor ?? null) || true : false,
    backpack: look.backpack ?? null, bag: look.bag ?? null, scarf: look.scarf ?? null, apron: look.apron ?? null, goggles: !!look.goggles, mask: !!look.mask, feather: look.feather ?? null, gloves: look.gloves ?? null,
    inner: look.inner ?? 0x2a2d36, capFront: look.capFront ?? 0xf2efe6, belt: look.belt ?? null, lashes: !!look.lashes, eyeColor: look.eyeColor ?? null
  };
}

// Trainer-Optik aus den KayKit-Abenteurern (CC0): umgefärbte Kleidung, Mütze,
// Rucksack und Kapselgürtel statt Rüstung und Waffen – deutlich eigener Stil.
// [Modell, Bezeichnung im Editor, Geschlecht der Figur]
export const TRAINER_MODELS = [['Knight', 'Sportlich', 'm'], ['Barbarian', 'Kräftig', 'm'], ['Ranger', 'Abenteuerlich', 'm'], ['Mage', 'Gelehrt', 'w'], ['Rogue', 'Flink', 'w'], ['Rogue_Hooded', 'Kapuze', 'w']];
export const TRAINER_COLORS = [0xd8483a, 0x3a7fd0, 0x2fa07a, 0xf0a030, 0x7d4fa3, 0xe86aa0, 0x3a4a5a, 0x2ab0c0];
export function trainerLook(model, seed = 0, extra = {}) {
  const rng = createRng('kk:' + model + ':' + seed);
  return { kk: model, outfit: TRAINER_COLORS[rng.int(0, TRAINER_COLORS.length - 1)], accent: [0xf2efe6, 0xf5cd77, 0x2a2d36, 0xffffff][rng.int(0, 3)], skin: rng.int(0, 4),
    cap: rng.next() < 0.6 ? TRAINER_COLORS[rng.int(0, TRAINER_COLORS.length - 1)] : null, backpack: rng.next() < 0.6 ? [0xf09a3a, 0x3a7fd0, 0x7d4fa3, 0x2fa07a][rng.int(0, 3)] : null, belt: true, ...extra };
}
// Spielerfigur im Trainer-Stil: Startfigur je Geschlecht, Farben für den Editor
export const KK_DEFAULT = { m: 'Knight', w: 'Rogue', d: 'Ranger' };
export const KK_SKIN_SWATCH = [0xf2c8a8, 0xe0ac88, 0xc08a68, 0x96684e, 0x6a4a3a];
export const KK_ACCENTS = [0xf2efe6, 0xf5cd77, 0x2a2d36, 0xd8483a, 0x3a7fd0, 0x2fa07a];
export const KK_BAGS = [0xf09a3a, 0x3a7fd0, 0x7d4fa3, 0x2fa07a, 0xd8483a];
export function playerTrainerLook(gender = 'm', model = null) {
  return trainerLook(model || KK_DEFAULT[gender] || 'Knight', 0, { outfit: gender === 'w' ? 0xe86aa0 : 0x3a7fd0, accent: 0xf2efe6, skin: 1, cap: 0x3a4a5a, backpack: 0xf09a3a });
}
// Trainer-Rollen: weibliche Titel (…in) bekommen eine weibliche Figur
function trainerFor(role, name) {
  const h = hashString('kk:' + role + ':' + name), fem = /(in|Oma|Frau|Tante)\b/.test(name.split(' ')[0] || '') ? true : /\b(Herr|Opa|Onkel)\b/.test(name) ? false : null;
  const pool = TRAINER_MODELS.filter(m => fem === null || (m[2] === 'w') === fem);
  const model = pool[h % pool.length][0];
  if (role === 'leader') return trainerLook(model, name, { cap: null, accent: 0xf5cd77, backpack: null });
  if (role === 'champion') return trainerLook(model, name, { cap: null, accent: 0xf5cd77, backpack: null, cape: true, height: 1.82 });
  return trainerLook(model, name);
}

// Appearance generated from a role and a name (deterministic variety).
// Stadtbewohner und Story-Figuren im selben KayKit-Stil, mit Kleidung je Rolle statt Trainer-Ausrüstung
const KK_PLAIN = { cap: null, backpack: null, belt: false };
function femOf(name, h) {
  const first = (name || '').split(' ')[0];
  if (/(in|Oma|Frau|Tante|Schwester)$/.test(first) || /\b(Oma|Frau|Tante|Schwester)\b/.test(name)) return true;
  if (/\b(Herr|Opa|Onkel|Bruder)\b/.test(name)) return false;
  return h % 2 === 0;
}
function kkModel(fem, h, pool = null) {
  const list = (pool || TRAINER_MODELS.filter(m => m[2] === (fem ? 'w' : 'm')).map(m => m[0]));
  return list[h % list.length];
}
export function residentLook(role, name = '') {
  const h = hashString('kkr:' + role + ':' + name), rng = createRng('kkr:' + role + ':' + name), fem = femOf(name, h);
  const base = (model, extra) => trainerLook(model, name + ':' + role, { ...KK_PLAIN, ...extra });
  const pick = (a) => a[rng.int(0, a.length - 1)];
  switch (role) {
    case 'kind': return base(kkModel(fem, h, ['Knight', 'Rogue', 'Ranger', 'Mage']), { height: 1.12, backpack: rng.next() < 0.5 ? pick([0xf09a3a, 0x3a7fd0, 0xe86aa0]) : null });
    case 'forscher': return base(kkModel(fem, h, fem ? ['Mage', 'Rogue'] : ['Knight', 'Ranger']), { outfit: 0xeef0ee, accent: 0xeef0ee, glasses: rng.next() < 0.7 });
    case 'professor': return base(kkModel(fem, h, fem ? ['Mage'] : ['Ranger', 'Barbarian']), { outfit: 0xeef0ee, accent: 0xeef0ee, glasses: true, height: 1.8 });
    case 'haendler': return base(kkModel(fem, h, fem ? ['Rogue', 'Mage'] : ['Barbarian', 'Knight']), { apron: pick([0x7a5a3a, 0x3a7fd0, 0x2fa07a]) });
    case 'clerk': return base(kkModel(fem, h, fem ? ['Rogue', 'Mage'] : ['Knight', 'Ranger']), { outfit: 0x3a7fd0, accent: 0xf2efe6, apron: 0x2f6ab0 });
    case 'nurse': return base(fem ? 'Rogue' : 'Knight', { outfit: 0xf4a6b8, accent: 0xffffff, nursecap: 0xe86aa0 });
    case 'reisender': return base(kkModel(fem, h, fem ? ['Rogue_Hooded', 'Rogue'] : ['Ranger', 'Barbarian']), { outfit: pick([0x8a6a4a, 0x6a7a3a, 0x5a6a7a]), cape: true, backpack: 0x7a5a3a });
    case 'handwerker': return base(kkModel(fem, h, fem ? ['Rogue', 'Ranger'] : ['Barbarian', 'Ranger']), { outfit: pick([0x3a5a8a, 0x8a6a4a, 0x6a5a4a]), apron: 0x5a4030, cap: rng.next() < 0.4 ? 0x6a5a4a : null });
    case 'grunt': return base('Rogue_Hooded', { outfit: 0x5e3a7c, accent: 0xf0974f, hood: true });
    case 'varga': return trainerLook('Mage', 'varga', { ...KK_PLAIN, outfit: 0x4a2a6a, accent: 0xf0974f, skin: 0, cape: true, height: 1.84 });
    case 'selma': return trainerLook('Rogue', 'selma', { ...KK_PLAIN, outfit: 0x8a4fa3, accent: 0xf0974f, skin: 2, cape: true });
    case 'brix': return trainerLook('Ranger', 'brix', { ...KK_PLAIN, outfit: 0x5e3a7c, accent: 0xf0974f, skin: 1, cap: 0xf0974f, backpack: 0x5a5d66 });
    case 'twin': return trainerLook(name.includes('Kora') ? 'Rogue' : 'Knight', 'twin:' + name, { ...KK_PLAIN, outfit: 0x5e3a7c, accent: 0xf0974f, skin: 1, cap: 0xf0974f, height: 1.6 });
    case 'lyra': return trainerLook('Mage', 'lyra', { ...KK_PLAIN, outfit: 0x3c5fa8, accent: 0xffd27a, skin: 0, cape: true });
    case 'familie': return base(kkModel(fem, h), { height: rng.next() < 0.3 ? 1.66 : 1.76 });
    default: return base(kkModel(fem, h), {});
  }
}

export function lookForRole(role, name = '', regionPal = null) {
  if (role === 'trainer' || role === 'leader' || role === 'champion') return trainerFor(role, name);
  return residentLook(role, name);
}

// Klassische Figur einer Rolle (prozedural, z. B. für den Editor-Stil „Klassisch“)
export function classicLookForRole(role, name = '') {
  const rng = createRng('look:' + name + ':' + role);
  const hair = HAIR_STYLES[rng.int(0, HAIR_STYLES.length - 1)];
  const base = { skin: rng.int(0, 4), hair, hairColor: rng.int(0, 7), topColor: rng.int(0, 7), bottomColor: [0x34465f, 0x4a3a2a, 0x2f3e55, 0x5a5a62, 0x6a4a3a][rng.int(0, 4)], body: rng.pick(['adult', 'adult', 'slim', 'stocky']) };
  switch (role) {
    case 'kind': return { ...base, body: 'child', top: rng.pick(['tshirt', 'hoodie', 'dress']), bottom: rng.pick(['shorts', 'pants']), hat: rng.next() < 0.4 ? 'cap' : null, hatColor: OUTFIT_COLORS[rng.int(0, 5)] };
    case 'forscher': return { ...base, top: 'labcoat', glasses: rng.next() < 0.7, bag: rng.next() < 0.5 ? 0x8a6a4a : null };
    case 'haendler': return { ...base, top: 'tshirt', apron: [0x7a5a3a, 0x3a7fd0, 0x2fa07a][rng.int(0, 2)], body: rng.pick(['stocky', 'adult']) };
    case 'trainer': return { ...base, top: rng.pick(['jacket', 'trainer']), gloves: rng.next() < 0.4 ? OUTFIT_COLORS[rng.int(0, 7)] : null, hat: rng.pick(['cap', 'cap', 'beanie', null]), hatColor: OUTFIT_COLORS[rng.int(0, 7)], backpack: [0xf09a3a, 0x3a7fd0, 0x7d4fa3][rng.int(0, 2)] };
    case 'reisender': return { ...base, top: 'coat', hat: rng.pick(['sunhat', 'beret', null]), hatColor: 0x8a6a4a, bag: 0x7a5a3a, scarf: rng.next() < 0.5 ? OUTFIT_COLORS[rng.int(0, 7)] : null };
    case 'familie': return { ...base, body: rng.pick(['adult', 'elder', 'stocky']), top: rng.pick(['tshirt', 'vest', 'dress', 'coat']), beard: rng.next() < 0.3 };
    case 'handwerker': return { ...base, top: 'overalls', body: rng.pick(['stocky', 'adult']), gloves: 0x8a6a4a, hat: rng.next() < 0.4 ? 'beanie' : null, hatColor: 0x6a5a4a };
    case 'professor': return { ...base, body: rng.pick(['adult', 'elder', 'slim']), top: 'labcoat', glasses: rng.next() < 0.6, beard: rng.next() < 0.35, accent: OUTFIT_COLORS[rng.int(0, 7)] };
    case 'nurse': return { ...base, top: 'dress', topColor: 0xf4a6b8, accent: 0xffffff, hat: 'nursecap', hatColor: 0xffffff, hair: 'bun', body: 'adult' };
    case 'clerk': return { ...base, top: 'vest', topColor: 0x3a7fd0, apron: 0x3a7fd0, body: 'adult' };
    case 'leader': return { ...base, top: 'uniform', accent: 0xf5cd77, body: rng.pick(['adult', 'slim', 'stocky']) };
    case 'champion': return { ...base, top: 'coat', accent: 0xf5cd77, scarf: 0xf5cd77, body: rng.pick(['adult', 'slim']) };
    case 'grunt': return { ...base, top: 'uniform', topColor: 0x5e3a7c, accent: 0xf0974f, bottomColor: 0x2a2232, hat: 'cap', hatColor: 0x3a2a4a, mask: true, scarf: 0xf0974f };
    case 'varga': return { body: 'slim', skin: 0, hair: 'bun', hairColor: 7, top: 'coat', topColor: 0x4a2a6a, accent: 0xf0974f, bottomColor: 0x241a30, shoes: 0x1a1420, scarf: 0xf0974f, glasses: false };
    case 'selma': return { body: 'slim', skin: 2, hair: 'long', hairColor: 9, top: 'dress', topColor: 0x8a4fa3, accent: 0xf0974f, hat: 'sunhat', hatColor: 0x5e3a7c, feather: 0xf0974f };
    case 'brix': return { body: 'teen', skin: 1, hair: 'curly', hairColor: 2, top: 'overalls', topColor: 0x5e3a7c, accent: 0xf0974f, goggles: true, gloves: 0xf0974f, backpack: 0x5a5d66 };
    case 'twin': return { body: 'teen', skin: 1, hair: name.includes('Kora') ? 'twin' : 'spiky', hairColor: 3, top: 'jacket', topColor: 0x5e3a7c, accent: 0xf0974f, bottom: 'shorts', bottomColor: 0x2a2232, hat: 'cap', hatColor: 0xf0974f };
    case 'lyra': return { body: 'slim', skin: 0, hair: 'long', hairColor: 7, top: 'robe', topColor: 0x3c5fa8, accent: 0xffd27a, scarf: 0xffd27a };
    default: return { ...base, top: rng.pick(['tshirt', 'vest', 'hoodie', 'coat']) };
  }
}

let LANTERN = null;
function lanternGlow() { return LANTERN || (LANTERN = glowMaterial(0xffd27a, 0.95)); }

// ---------------------------------------------------------------------------
function partMesh(builder, outline = false, mat = characterMaterial()) {
  const g = builder.build();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  if (outline) {
    const o = new THREE.Mesh(g, outlineMaterial());
    o.scale.setScalar(1.06);
    m.add(o);
  }
  return m;
}

export function createCharacter(lookIn, { outline = false } = {}) {
  if (lookIn && lookIn.kk) {
    // Ersatz, falls das KayKit-Modell nicht lädt: klassische Figur in ähnlichen Farben
    const fallback = () => createCharacter({ skin: Math.min(4, lookIn.skin | 0), topColor: lookIn.outfit ?? 0x3a7fd0, accent: lookIn.accent, backpack: lookIn.backpack ?? null, body: (lookIn.height || 1.74) < 1.3 ? 'child' : 'adult' }, { outline });
    return new KKCharacter(lookIn.kk, { outline, look: lookIn, height: lookIn.height || 1.74, fallback });
  }
  if (lookIn && lookIn.zotik) return createZotik(outline);
  const L = resolveLook(lookIn);
  const P = BODY[L.body] || BODY.adult;
  const s = P.h / 1.72, w = P.w;
  // moderne Proportionen: größerer Kopf mit großen Augen (wie in aktuellen Konsolen-Rollenspielen)
  const legLen = 0.82 * s, torsoLen = 0.58 * s, headR = 0.17 * s * P.head * (L.body === 'child' ? 1.12 : 1) * 1.2;
  const root = new THREE.Group();
  root.name = 'character';
  const bones = {};
  const pivot = (name, parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); bones[name] = g; return g; };
  const hips = pivot('hips', root, 0, legLen, 0);
  const torso = pivot('torso', hips, 0, 0, 0);
  const neck = pivot('neck', torso, 0, torsoLen, 0);
  const head = pivot('head', neck, 0, 0.06 * s, 0);
  const shoulderY = torsoLen - 0.07 * s, shoulderX = 0.2 * s * w;
  const armL = pivot('armL', torso, shoulderX, shoulderY, 0), armR = pivot('armR', torso, -shoulderX, shoulderY, 0);
  const upperArm = 0.28 * s, foreArm = 0.26 * s;
  const elbowL = pivot('elbowL', armL, 0, -upperArm, 0), elbowR = pivot('elbowR', armR, 0, -upperArm, 0);
  const hipW = P.hips || 1, legX = 0.09 * s * w * hipW;
  const thighL = pivot('thighL', hips, legX, 0, 0), thighR = pivot('thighR', hips, -legX, 0, 0);
  const thigh = legLen * 0.5, shin = legLen * 0.48;
  const kneeL = pivot('kneeL', thighL, 0, -thigh, 0), kneeR = pivot('kneeR', thighR, 0, -thigh, 0);

  const top = L.topColor, accent = L.accent;
  const longTop = ['coat', 'labcoat', 'robe', 'dress'].includes(L.top);

  // --- hips / pelvis
  const hb = new Builder();
  hb.add(capsule(0.15 * s * w * hipW, 0.05 * s, 10, 3), L.bottom === 'skirt' || L.top === 'dress' ? top : L.bottomColor, matrix(0, -0.02 * s, 0, 0, 0, Math.PI / 2, 1, 1, 0.75));
  if (L.bottom === 'skirt' || L.top === 'dress') hb.add(new THREE.CylinderGeometry(0.16 * s * w, 0.27 * s * w, 0.34 * s, 12, 1, true), L.top === 'dress' ? top : L.bottomColor, matrix(0, -0.16 * s, 0));
  if (L.apron) hb.box(0.26 * s * w, 0.38 * s, 0.02, L.apron, 0, -0.12 * s, 0.13 * s * w);
  let lantern = null;
  if (L.belt) {
    // utility belt: flat buckle, two upright capsule pouches on the right hip, a small "Licht" lantern on the left
    const R = 0.15 * s * w * hipW, onBelt = (a, d = 0) => [Math.sin(a) * (R + d), Math.cos(a) * (R * 0.8 + d)];
    hb.add(new THREE.TorusGeometry(R, 0.026 * s, 4, 18), L.belt, matrix(0, 0.03 * s, 0, Math.PI / 2, 0, 0, 1, 0.76, 1));
    hb.box(0.07 * s, 0.045 * s, 0.02 * s, 0x9aa3ad, 0, 0.03 * s, 0.12 * s * w * hipW);
    for (const a of [-1.05, -1.5]) {
      const [bx, bz] = onBelt(a, 0.012 * s);
      hb.add(capsule(0.024 * s, 0.05 * s, 8, 2), shade(L.belt, 1.25), matrix(bx, 0.02 * s, bz));
      hb.cyl(0.026 * s, 0.026 * s, 0.012 * s, 0x8ff0ff, bx, 0.02 * s, bz, 8);
    }
    const [lx, lz] = onBelt(1.25, 0.03 * s);
    hb.cyl(0.03 * s, 0.03 * s, 0.012 * s, 0x3a3d45, lx, 0.0, lz, 8);
    hb.cyl(0.03 * s, 0.03 * s, 0.012 * s, 0x3a3d45, lx, -0.075 * s, lz, 8);
    hb.add(new THREE.TorusGeometry(0.018 * s, 0.005 * s, 4, 8), 0x3a3d45, matrix(lx, 0.015 * s, lz));
    lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.024 * s, 0.024 * s, 0.065 * s, 8), lanternGlow());
    lantern.position.set(lx, -0.037 * s, lz);
  }
  hips.add(partMesh(hb, outline));
  if (lantern) hips.add(lantern);

  // --- torso
  const tb = new Builder();
  const chestR = 0.17 * s * w;
  tb.add(lathe([[0.13 * w, 0], [0.16 * w, 0.12], [0.18 * w, 0.32], [0.17 * w, 0.48], [0.11 * w, 0.58]].map(([r, y]) => [r * s, y * s]), 14), top, matrix(0, 0, 0, 0, 0, 0, 1, 1, 0.72), { shade: 0.15 });
  if (L.top === 'jacket' || L.top === 'coat' || L.top === 'labcoat' || L.top === 'uniform') {
    tb.box(0.03 * s, 0.5 * s, 0.02, shade(top, 0.75), 0, 0.27 * s, chestR * 0.72);
    tb.box(0.24 * s * w, 0.06 * s, 0.25 * s * w * 0.7, accent, 0, 0.52 * s, 0);
  }
  if (L.top === 'trainer') {
    // explorer softshell: shoulder yoke in the accent colour, high stand collar with a glimpse of the shirt,
    // diagonal zip from the collar to the hip, chest pocket, longer hem band and a cross-body strap
    tb.add(lathe([[0.155 * w, 0.4], [0.18 * w, 0.44], [0.172 * w, 0.5], [0.115 * w, 0.585]].map(([r, y]) => [r * s, y * s]), 14), accent, matrix(0, 0, 0, 0, 0, 0, 1.02, 1, 0.75));
    tb.add(new THREE.CylinderGeometry(0.085 * s, 0.1 * s, 0.09 * s, 12, 1, true), accent, matrix(0, 0.61 * s, -0.005 * s, 0, 0, 0, 1, 1, 0.92));
    tb.box(0.05 * s, 0.05 * s, 0.02, L.inner, 0, 0.6 * s, 0.088 * s);
    tb.add(new THREE.BoxGeometry(0.018 * s, 0.5 * s, 0.025), shade(top, 0.62), matrix(0.03 * s, 0.31 * s, chestR * 0.73, 0, 0, -0.16));
    tb.box(0.012 * s, 0.035 * s, 0.03, 0xd8dee6, 0.068 * s, 0.53 * s, chestR * 0.76);
    tb.box(0.075 * s, 0.065 * s, 0.02, shade(top, 0.84), -0.085 * s * w, 0.36 * s, chestR * 0.7);
    tb.box(0.075 * s, 0.012 * s, 0.025, accent, -0.085 * s * w, 0.395 * s, chestR * 0.71);
    tb.add(new THREE.CylinderGeometry(0.152 * s * w, 0.16 * s * w, 0.09 * s, 14, 1, true), shade(top, 0.8), matrix(0, -0.0 * s, 0, 0, 0, 0, 1, 1, 0.76));
    if (L.belt) {
      // cross-body strap from the right shoulder to the left hip, round buckle on the chest
      const st = shade(L.belt, 0.95);
      tb.add(new THREE.BoxGeometry(0.035 * s, 0.62 * s, 0.025), st, matrix(0, 0.3 * s, chestR * 0.76, 0, 0, 0.62));
      tb.add(new THREE.BoxGeometry(0.035 * s, 0.62 * s, 0.025), st, matrix(0, 0.3 * s, -chestR * 0.74, 0, 0, -0.62));
      tb.cyl(0.026 * s, 0.026 * s, 0.015 * s, 0x9aa3ad, 0.0, 0.3 * s, chestR * 0.78, 10);
    }
  }
  if (L.top === 'hoodie') { tb.add(new THREE.TorusGeometry(0.11 * s, 0.04 * s, 5, 14), shade(top, 0.9), matrix(0, 0.56 * s, -0.02, Math.PI / 2, 0, 0)); tb.box(0.18 * s, 0.1 * s, 0.03, shade(top, 0.85), 0, 0.18 * s, chestR * 0.7); }
  if (L.top === 'vest') { tb.box(0.08 * s, 0.5 * s, 0.02, accent, 0.05 * s, 0.28 * s, chestR * 0.72); tb.box(0.08 * s, 0.5 * s, 0.02, accent, -0.05 * s, 0.28 * s, chestR * 0.72); }
  if (L.top === 'overalls') { tb.box(0.2 * s * w, 0.2 * s, 0.03, accent, 0, 0.22 * s, chestR * 0.7); tb.box(0.035 * s, 0.32 * s, 0.03, accent, 0.07 * s, 0.4 * s, chestR * 0.7); tb.box(0.035 * s, 0.32 * s, 0.03, accent, -0.07 * s, 0.4 * s, chestR * 0.7); }
  if (L.top === 'uniform') tb.box(0.3 * s * w, 0.05 * s, 0.26 * s * w * 0.72, accent, 0, 0.05 * s, 0);
  if (longTop) tb.add(new THREE.CylinderGeometry(0.17 * s * w, 0.24 * s * w, 0.42 * s, 12, 1, true), top, matrix(0, -0.18 * s, 0, 0, 0, 0, 1, 1, 0.8));
  if (L.top === 'labcoat') tb.box(0.04 * s, 0.9 * s, 0.03, 0xe8ecef, 0, 0.1 * s, chestR * 0.74);
  if (L.scarf) { tb.add(new THREE.TorusGeometry(0.1 * s, 0.045 * s, 6, 14), L.scarf, matrix(0, 0.55 * s, 0, Math.PI / 2, 0, 0)); tb.box(0.06 * s, 0.25 * s, 0.03, L.scarf, 0.06 * s, 0.42 * s, chestR * 0.72); }
  if (L.apron) tb.box(0.26 * s * w, 0.36 * s, 0.02, L.apron, 0, 0.22 * s, chestR * 0.74);
  if (L.backpack) {
    tb.add(capsule(0.13 * s, 0.14 * s, 8, 3), L.backpack, matrix(0, 0.32 * s, -0.17 * s, 0, 0, 0, 1.1, 1, 0.7));
    tb.box(0.2 * s, 0.1 * s, 0.05 * s, shade(L.backpack, 0.8), 0, 0.22 * s, -0.25 * s);
    tb.box(0.03 * s, 0.4 * s, 0.03 * s, shade(L.backpack, 0.7), 0.09 * s, 0.35 * s, 0.11 * s);
    tb.box(0.03 * s, 0.4 * s, 0.03 * s, shade(L.backpack, 0.7), -0.09 * s, 0.35 * s, 0.11 * s);
    if (L.top === 'trainer') {
      // roll-top with a buckle strap and a bedroll on top
      tb.box(0.2 * s, 0.05 * s, 0.11 * s, shade(L.backpack, 0.85), 0, 0.48 * s, -0.17 * s);
      tb.box(0.035 * s, 0.16 * s, 0.02 * s, shade(L.backpack, 0.6), 0, 0.4 * s, -0.255 * s);
      tb.add(new THREE.CylinderGeometry(0.055 * s, 0.055 * s, 0.3 * s, 10), L.accent === L.backpack ? L.inner : shade(L.accent, 0.9), matrix(0, 0.55 * s, -0.17 * s, 0, 0, Math.PI / 2));
      for (const bx of [-0.09, 0.09]) tb.add(new THREE.CylinderGeometry(0.058 * s, 0.058 * s, 0.02 * s, 10), shade(L.backpack, 0.6), matrix(bx * s, 0.55 * s, -0.17 * s, 0, 0, Math.PI / 2));
    }
  }
  if (L.bag) { tb.box(0.18 * s, 0.16 * s, 0.07 * s, L.bag, -0.2 * s * w, 0.02 * s, 0.05 * s); tb.add(new THREE.TorusGeometry(0.24 * s, 0.012 * s, 4, 16), shade(L.bag, 0.7), matrix(0, 0.3 * s, 0, 0, Math.PI / 2, 0.6)); }
  // neck
  tb.cyl(0.05 * s, 0.06 * s, 0.1 * s, L.skin, 0, 0.6 * s, 0, 8);
  torso.add(partMesh(tb, outline));

  // --- head
  const hd = new Builder();
  hd.add(new THREE.SphereGeometry(headR, 18, 14), L.skin, matrix(0, headR, 0, 0, 0, 0, 0.95, 1.02, 0.95));
  hd.add(new THREE.SphereGeometry(headR * 0.22, 8, 6), L.skin, matrix(headR * 0.94, headR * 1.0, 0, 0, 0, 0, 0.5, 1, 0.8));
  hd.add(new THREE.SphereGeometry(headR * 0.22, 8, 6), L.skin, matrix(-headR * 0.94, headR * 1.0, 0, 0, 0, 0, 0.5, 1, 0.8));
  hd.add(new THREE.SphereGeometry(headR * 0.12, 6, 5), shade(L.skin, 0.94), matrix(0, headR * 0.9, headR * 0.93));
  hd.add(new THREE.SphereGeometry(headR * 0.15, 6, 4), 0xf49a9a, matrix(headR * 0.5, headR * 0.78, headR * 0.76, 0, 0, 0, 1, 0.6, 0.4));
  hd.add(new THREE.SphereGeometry(headR * 0.15, 6, 4), 0xf49a9a, matrix(-headR * 0.5, headR * 0.78, headR * 0.76, 0, 0, 0, 1, 0.6, 0.4));
  // brows (schmal, leicht geschwungen)
  for (const sx of [-1, 1]) hd.add(capsule(headR * 0.035, headR * 0.26, 6, 2), shade(L.hairColor, 0.75), matrix(sx * headR * 0.38, headR * 1.42, headR * 0.97, 0, 0, Math.PI / 2 + sx * 0.12));
  hairFor(hd, L, headR);
  if (L.beard) hd.add(new THREE.SphereGeometry(headR * 0.62, 10, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), typeof L.beard === 'number' ? L.beard : L.hairColor, matrix(0, headR * 0.82, headR * 0.12, 0, 0, 0, 1, 0.9, 1.05));
  if (L.glasses) { for (const sx of [-1, 1]) hd.add(new THREE.TorusGeometry(headR * 0.2, headR * 0.035, 4, 12), 0x2a2f3a, matrix(sx * headR * 0.36, headR * 1.12, headR * 0.92)); hd.box(headR * 0.2, headR * 0.04, headR * 0.04, 0x2a2f3a, 0, headR * 1.14, headR * 0.98); }
  if (L.goggles) { hd.add(new THREE.TorusGeometry(headR * 1.0, headR * 0.06, 4, 20), 0x3a3d45, matrix(0, headR * 1.5, 0, Math.PI / 2 - 0.25, 0, 0)); for (const sx of [-1, 1]) hd.cyl(headR * 0.24, headR * 0.24, headR * 0.16, 0xf0974f, sx * headR * 0.38, headR * 1.62, headR * 0.82, 10); }
  if (L.mask) hd.add(new THREE.SphereGeometry(headR * 1.0, 14, 8, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.32), 0x2a2232, matrix(0, headR * 0.98, 0.0, 0, 0, 0, 1.02, 1, 1.03));
  hatFor(hd, L, headR);
  head.add(partMesh(hd, outline));
  // eyes (separate for blinking) and mouth (for talking)
  const eb = new Builder();
  // große Anime-Augen: Iris mit hellem Kern, Pupille, zwei Glanzpunkte und ein Lidstrich
  const eyeCol = L.eyeColor ?? EYE_COLORS[(L.hairColor >>> 4) % EYE_COLORS.length];
  for (const sx of [-1, 1]) {
    const ex = sx * headR * 0.37;
    eb.add(new THREE.SphereGeometry(headR * 0.2, 14, 10), 0xffffff, matrix(ex, 0, 0, 0, 0, 0, 0.82, 1.2, 0.45));
    eb.add(new THREE.SphereGeometry(headR * 0.15, 14, 10), eyeCol, matrix(ex, -headR * 0.015, headR * 0.035, 0, 0, 0, 0.82, 1.08, 0.45));
    eb.add(new THREE.SphereGeometry(headR * 0.09, 10, 8), shade(eyeCol, 1.55), matrix(ex, -headR * 0.06, headR * 0.06, 0, 0, 0, 0.9, 0.8, 0.4));
    eb.add(new THREE.SphereGeometry(headR * 0.072, 10, 8), 0x141820, matrix(ex, -headR * 0.005, headR * 0.075, 0, 0, 0, 0.85, 1.1, 0.4));
    eb.add(new THREE.SphereGeometry(headR * 0.045, 8, 6), 0xffffff, matrix(ex + headR * 0.045, headR * 0.065, headR * 0.1));
    eb.add(new THREE.SphereGeometry(headR * 0.022, 6, 4), 0xffffff, matrix(ex - headR * 0.04, -headR * 0.07, headR * 0.1));
    eb.add(capsule(headR * 0.03, headR * 0.3, 6, 2), 0x1d1d26, matrix(ex + sx * headR * 0.01, headR * 0.225, headR * 0.05, 0, 0, Math.PI / 2 - sx * 0.14));
    if (L.lashes) eb.add(new THREE.ConeGeometry(headR * 0.035, headR * 0.12, 4), 0x1d1d26, matrix(ex + sx * headR * 0.17, headR * 0.23, headR * 0.05, 0, 0, -sx * 1.0));
  }
  const eyes = new THREE.Mesh(eb.build(), characterMaterial());
  eyes.position.set(0, headR * 1.1, headR * 0.86);
  head.add(eyes); bones.eyes = eyes;
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.13, 8, 6), new THREE.MeshBasicMaterial({ color: 0x8a3a3a }));
  mouth.scale.set(1.3, 0.35, 0.4); mouth.position.set(0, headR * 0.62, headR * 0.92);
  head.add(mouth); bones.mouth = mouth;

  // --- arms
  for (const [side, arm, elbow] of [[1, armL, elbowL], [-1, armR, elbowR]]) {
    const ub = new Builder();
    ub.add(capsule(0.058 * s * w, upperArm * 0.75, 8, 3), L.top === 'vest' || L.top === 'overalls' || L.top === 'dress' ? L.skin : top, matrix(0, -upperArm / 2, 0));
    ub.add(new THREE.SphereGeometry(0.072 * s * w, 8, 6), L.top === 'trainer' ? accent : top, matrix(0, 0, 0));
    if (L.top === 'trainer') ub.box(0.03 * s, 0.09 * s, 0.03 * s, accent, side * 0.05 * s * w, -upperArm * 0.45, 0);
    arm.add(partMesh(ub, outline));
    const fb = new Builder();
    const sleeve = ['coat', 'labcoat', 'jacket', 'hoodie', 'uniform', 'robe', 'trainer'].includes(L.top);
    fb.add(capsule(0.048 * s * w, foreArm * 0.75, 8, 3), sleeve ? top : L.skin, matrix(0, -foreArm / 2, 0));
    if (sleeve) fb.cyl(0.055 * s * w, 0.055 * s * w, 0.04 * s, accent, 0, -foreArm * 0.85, 0, 8);
    fb.add(new THREE.SphereGeometry(0.058 * s, 8, 6), L.gloves ? shade(L.gloves, 0.82) : L.skin, matrix(0, -foreArm - 0.03 * s, 0.005, 0, 0, 0, 0.85, 1.1, 0.7));
    fb.add(new THREE.SphereGeometry(0.025 * s, 5, 4), L.gloves ? shade(L.gloves, 0.82) : L.skin, matrix(side * -0.03 * s, -foreArm - 0.01 * s, 0.04 * s));
    // gloves: full gloves with a leather bracer over the wrist and a strap
    if (L.gloves) { fb.cyl(0.058 * s, 0.054 * s, 0.11 * s, L.gloves, 0, -foreArm * 0.78, 0.004, 8); fb.cyl(0.06 * s, 0.06 * s, 0.014 * s, shade(L.gloves, 0.6), 0, -foreArm * 0.74, 0.004, 8); }
    elbow.add(partMesh(fb, outline));
    bones['hand' + (side > 0 ? 'L' : 'R')] = (() => { const h = new THREE.Group(); h.position.set(0, -foreArm - 0.04 * s, 0.03 * s); elbow.add(h); return h; })();
  }
  // --- legs
  for (const [thighG, knee] of [[thighL, kneeL], [thighR, kneeR]]) {
    const lb = new Builder();
    const shortsOrSkirt = L.bottom === 'shorts' || L.bottom === 'skirt' || L.top === 'dress';
    lb.add(capsule(0.072 * s * w, thigh * 0.7, 8, 3), shortsOrSkirt ? L.skin : L.bottomColor, matrix(0, -thigh / 2, 0));
    if (L.bottom === 'shorts') lb.add(new THREE.CylinderGeometry(0.085 * s * w, 0.08 * s * w, thigh * 0.55, 8), L.bottomColor, matrix(0, -thigh * 0.25, 0));
    if (L.top === 'trainer' && !shortsOrSkirt || L.top === 'trainer' && L.bottom === 'shorts') {
      // cargo pocket on the outer thigh
      const ox = (thighG === thighL ? 1 : -1) * 0.07 * s * w;
      lb.box(0.03 * s, 0.11 * s, 0.09 * s, shade(L.bottomColor, 0.82), ox, -thigh * 0.5, 0.005 * s);
      lb.box(0.034 * s, 0.025 * s, 0.095 * s, shade(L.bottomColor, 0.7), ox, -thigh * 0.5 + 0.055 * s, 0.005 * s);
    }
    thighG.add(partMesh(lb, outline));
    const sb = new Builder();
    sb.add(capsule(0.06 * s * w, shin * 0.75, 8, 3), shortsOrSkirt ? L.skin : L.bottomColor, matrix(0, -shin / 2, 0));
    sb.add(capsule(0.065 * s, 0.1 * s, 8, 3), L.shoes, matrix(0, -shin - 0.01 * s, 0.05 * s, Math.PI / 2, 0, 0, 1, 1, 0.75));
    sb.box(0.12 * s, 0.03 * s, 0.24 * s, L.top === 'trainer' ? 0x3a3330 : 0xf2efe6, 0, -shin - 0.06 * s, 0.05 * s);
    if (L.top === 'trainer') { sb.cyl(0.07 * s, 0.075 * s, 0.1 * s, L.shoes, 0, -shin + 0.03 * s, 0, 8); sb.cyl(0.072 * s, 0.072 * s, 0.015 * s, shade(L.shoes, 1.35), 0, -shin + 0.08 * s, 0, 8); }
    knee.add(partMesh(sb, outline));
  }
  const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(0.32 * s, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
  shadowBlob.rotation.x = -Math.PI / 2; shadowBlob.position.y = 0.03; shadowBlob.renderOrder = -1; root.add(shadowBlob);

  const ch = new Character(root, bones, { s, legLen, stoop: P.stoop || 0, headR });
  root.userData.character = ch;
  return ch;
}

// Zotik als spielbare Figur (Taschi-Abenteurer): eigener Körper, gleiche Gelenke und Animationen wie die Menschen
function createZotik(outline) {
  const z = buildZotikRig((b, parent) => parent.add(partMesh(b, outline, toonVertexMaterial())), { scale: 0.8 });   // Zotik behält seinen Look
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.34, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; blob.renderOrder = -1; z.root.add(blob);
  const ch = new Character(z.root, z.bones, z.dims);
  z.root.userData.character = ch;
  return ch;
}

function hairFor(hd, L, r) {
  const c = L.hairColor, capped = ['cap', 'beanie'].includes(L.hat);
  // Haarkappe stärker nach hinten geneigt: Stirn und große Augen bleiben frei, hinten fällt das Haar in den Nacken
  const cap = (sx = 1, sy = 1, sz = 1, y = r * 1.1) => hd.add(new THREE.SphereGeometry(r * 1.05, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), c, matrix(0, y, -r * 0.05, -0.32, 0, 0, sx, sy, sz));
  switch (L.hair) {
    case 'bald': break;
    case 'short': cap(1, 0.95, 1.02); break;
    case 'spiky': if (capped) {
      // spikes stick out under the cap at the back and sides, bangs under the brim
      cap(1.02, 0.9, 1.02);
      for (let i = 0; i < 7; i++) { const a = Math.PI * (0.45 + i * 0.183); hd.add(new THREE.ConeGeometry(r * 0.22, r * 0.75, 5), c, matrix(Math.sin(a) * r * 1.0, r * 1.05, Math.cos(a) * r * 0.98, Math.cos(a) * 2.0, 0, -Math.sin(a) * 2.0)); }
      for (const bx of [-0.32, 0, 0.32]) hd.add(new THREE.ConeGeometry(r * 0.16, r * 0.42, 5), c, matrix(bx * r, r * 1.42, r * 0.88, 2.5, 0, -bx * 0.8));
      break;
    }
    cap(); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; hd.add(new THREE.ConeGeometry(r * 0.22, r * 0.55, 5), c, matrix(Math.cos(a) * r * 0.55, r * 1.85, Math.sin(a) * r * 0.5 - r * 0.15, Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7)); } hd.add(new THREE.ConeGeometry(r * 0.25, r * 0.5, 5), c, matrix(0, r * 1.62, r * 0.82, 1.2, 0, 0)); break;
    case 'ponytail': cap(1.02, 1, 1.05); hd.add(capsule(r * 0.22, r * 0.7, 8, 3), c, matrix(0, r * 1.15, -r * 1.1, -0.6, 0, 0)); hd.add(new THREE.SphereGeometry(r * 0.16, 6, 5), L.hatColor || 0xd8483a, matrix(0, r * 1.45, -r * 0.92)); break;
    case 'long': cap(1.05, 1, 1.08); hd.add(new THREE.CylinderGeometry(r * 0.95, r * 1.05, r * 1.6, 14, 1, true, Math.PI * 0.25, Math.PI * 1.5), c, matrix(0, r * 0.55, -r * 0.08)); break;
    case 'bun': cap(1, 0.95, 1.02); hd.add(new THREE.SphereGeometry(r * 0.38, 10, 8), c, matrix(0, r * 1.85, -r * 0.5)); break;
    case 'bob': cap(1.1, 1, 1.1); hd.add(new THREE.CylinderGeometry(r * 1.06, r * 1.12, r * 0.9, 16, 1, true, Math.PI * 0.2, Math.PI * 1.6), c, matrix(0, r * 0.95, -r * 0.03)); hd.add(capsule(r * 0.17, r * 1.1, 10, 3), c, matrix(0, r * 1.6, r * 0.8, 0, 0, Math.PI / 2)); break;
    case 'curly': for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, b = (i % 3) * 0.35; hd.add(new THREE.SphereGeometry(r * 0.34, 7, 6), c, matrix(Math.cos(a) * r * (0.8 - b * 0.4), r * (1.35 + b * 0.5), Math.sin(a) * r * (0.75 - b * 0.4) - r * 0.12)); } break;
    case 'twin': cap(1.02, 1, 1.05); for (const sx of [-1, 1]) hd.add(capsule(r * 0.2, r * 0.6, 8, 3), c, matrix(sx * r * 1.05, r * 0.8, -r * 0.3, 0.2, 0, sx * 0.3)); break;
  }
}
function hatFor(hd, L, r) {
  const c = L.hatColor;
  switch (L.hat) {
    case 'cap': hd.add(new THREE.SphereGeometry(r * 1.1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), c, matrix(0, r * 1.18, -r * 0.03, -0.12, 0, 0)); hd.add(new THREE.CylinderGeometry(r * 0.75, r * 0.75, r * 0.06, 16, 1, false, -Math.PI * 0.5, Math.PI), shade(c, 0.85), matrix(0, r * 1.38, r * 0.62, -0.12, 0, 0, 1, 1, 0.9)); hd.add(new THREE.SphereGeometry(r * 0.1, 6, 4), 0xffffff, matrix(0, r * 2.25, -r * 0.1)); break;
    case 'trainercap': {
      // explorer goggles pushed up onto a wide headband (key kept for old saves): round lenses with metal rims and a light-catching glint
      hd.add(new THREE.CylinderGeometry(r * 1.07, r * 1.07, r * 0.26, 18, 1, true), c, matrix(0, r * 1.5, -r * 0.04, -0.22, 0, 0, 1, 1, 1.02));
      hd.add(new THREE.BoxGeometry(r * 0.26, r * 0.3, r * 0.12), shade(c, 0.8), matrix(0, r * 1.38, -r * 1.06, -0.22, 0, 0));
      for (const sx of [-1, 1]) {
        const gm = matrix(sx * r * 0.36, r * 1.66, r * 0.86, Math.PI / 2 - 0.55, 0, 0);
        hd.add(new THREE.CylinderGeometry(r * 0.27, r * 0.29, r * 0.2, 14), 0x9aa3ad, gm);
        hd.add(new THREE.CylinderGeometry(r * 0.21, r * 0.21, r * 0.21, 14), L.capFront, gm);
        hd.add(new THREE.SphereGeometry(r * 0.06, 5, 4), 0xffffff, matrix(sx * r * 0.36 + r * 0.08, r * 1.8, r * 0.93));
      }
      hd.box(r * 0.2, r * 0.07, r * 0.08, 0x9aa3ad, 0, r * 1.66, r * 0.95);
      break;
    }
    case 'beanie': hd.add(new THREE.SphereGeometry(r * 1.1, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), c, matrix(0, r * 1.3, -r * 0.05, -0.22, 0, 0, 1, 1.05, 1)); hd.add(new THREE.SphereGeometry(r * 0.2, 7, 5), shade(c, 1.2), matrix(0, r * 2.45, -r * 0.2)); break;
    case 'sunhat': hd.add(new THREE.CylinderGeometry(r * 1.7, r * 1.75, r * 0.07, 18), c, matrix(0, r * 1.55, 0, -0.08, 0, 0)); hd.add(new THREE.CylinderGeometry(r * 0.8, r * 0.95, r * 0.6, 14), c, matrix(0, r * 1.85, 0, -0.08, 0, 0)); if (L.feather) hd.add(new THREE.ConeGeometry(r * 0.12, r * 1.4, 5), L.feather, matrix(r * 0.7, r * 2.2, -r * 0.2, 0.3, 0, -0.6)); break;
    case 'beret': hd.add(new THREE.SphereGeometry(r * 1.12, 14, 6), c, matrix(r * 0.12, r * 1.6, -r * 0.05, -0.25, 0, 0.18, 1, 0.38, 1)); break;
    case 'nursecap': hd.box(r * 1.0, r * 0.45, r * 0.12, c, 0, r * 1.95, r * 0.25, 0); hd.box(r * 0.3, r * 0.1, r * 0.13, 0xe0566e, 0, r * 2.0, r * 0.32); break;
  }
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------
const CLIP_NAMES = ['idle', 'walk', 'run', 'talk', 'interact', 'throw', 'cheer', 'defeat', 'wave', 'look', 'sad', 'ride'];
const BONES = ['hips', 'torso', 'neck', 'head', 'armL', 'armR', 'elbowL', 'elbowR', 'thighL', 'thighR', 'kneeL', 'kneeR'];

export class Character {
  constructor(root, bones, dims) {
    this.root = root; this.bones = bones; this.dims = dims;
    this.weights = Object.fromEntries(CLIP_NAMES.map(n => [n, n === 'idle' ? 1 : 0]));
    this.target = 'idle'; this.oneShot = null; this.oneShotT = 0;
    this.phase = 0; this.t = Math.random() * 10; this.speed = 0;
    this.blinkT = 2 + Math.random() * 3; this.lookT = 0; this.lookYaw = 0; this.talking = false;
    this.pose = Object.fromEntries(BONES.map(b => [b, new THREE.Euler()]));
    this.mood = 'talk';
  }
  get object() { return this.root; }
  setLocomotion(speed) { this.speed = speed; if (!this.oneShot) this.target = speed > 4.2 ? 'run' : speed > 0.25 ? 'walk' : (this.talking ? 'talk' : 'idle'); }
  setTalking(on, mood = 'talk') { this.talking = on; this.mood = mood; if (!this.oneShot && this.speed < 0.25) this.target = on ? (mood === 'sad' ? 'sad' : mood === 'happy' ? 'cheerLite' : 'talk') : 'idle'; if (this.target === 'cheerLite') this.target = 'talk'; }
  play(name, duration = 1.2, onDone) { this.oneShot = name; this.oneShotT = 0; this.oneShotDur = duration; this.oneShotDone = onDone; }
  hold(name) { this.target = name; this.oneShot = null; }
  update(dt) {
    this.t += dt;
    const cur = this.oneShot || this.target;
    for (const n of CLIP_NAMES) this.weights[n] += ((n === cur ? 1 : 0) - this.weights[n]) * Math.min(1, dt * 9);
    if (this.oneShot) {
      this.oneShotT += dt;
      if (this.oneShotT >= this.oneShotDur) { const cb = this.oneShotDone; this.oneShot = null; this.oneShotDone = null; cb && cb(); }
    }
    const stride = this.speed > 4.2 ? 1.75 : 1.25;
    this.phase += dt * Math.max(this.speed, 0.0) * stride * 1.15;
    for (const b of BONES) this.pose[b].set(0, 0, 0);
    let hipY = 0, hipBob = 0;
    const W = this.weights, P = this.pose, t = this.t, ph = this.phase;
    const add = (b, x, y, z, w) => { if (w > 0.001) { P[b].x += x * w; P[b].y += y * w; P[b].z += z * w; } };
    // idle: breathing and gentle sway
    const wi = W.idle + W.talk * 0.5 + W.look * 0.5;
    add('torso', Math.sin(t * 1.6) * 0.02 + this.dims.stoop, 0, 0, wi);
    add('armL', 0, 0, -0.08 + Math.sin(t * 1.6) * 0.02, wi); add('armR', 0, 0, 0.08 - Math.sin(t * 1.6) * 0.02, wi);
    add('elbowL', -0.12, 0, 0, wi); add('elbowR', -0.12, 0, 0, wi);
    add('head', Math.sin(t * 0.7) * 0.03, Math.sin(t * 0.43) * 0.12, 0, W.idle);
    // walk / run
    for (const [name, amp, lean] of [['walk', 0.55, 0.06], ['run', 0.95, 0.22]]) {
      const w = W[name]; if (w < 0.001) continue;
      const s = Math.sin(ph), c2 = Math.cos(ph);
      add('thighL', -s * amp, 0, 0, w); add('thighR', s * amp, 0, 0, w);
      add('kneeL', Math.max(0, -c2) * amp * 1.3, 0, 0, w); add('kneeR', Math.max(0, c2) * amp * 1.3, 0, 0, w);
      add('armL', s * amp * 0.8, 0, -0.1, w); add('armR', -s * amp * 0.8, 0, 0.1, w);
      add('elbowL', -0.35 - (name === 'run' ? 0.9 : 0.1), 0, 0, w); add('elbowR', -0.35 - (name === 'run' ? 0.9 : 0.1), 0, 0, w);
      add('torso', lean, Math.sin(ph) * 0.08, 0, w); add('head', -lean * 0.6, -Math.sin(ph) * 0.06, 0, w);
      hipBob += Math.abs(Math.cos(ph)) * (name === 'run' ? 0.06 : 0.03) * w;
    }
    // talk: gestures
    if (W.talk > 0.001) {
      const g = Math.sin(t * 3.1), g2 = Math.sin(t * 2.3 + 1);
      add('armR', -0.5 - g * 0.25, 0, 0.25, W.talk); add('elbowR', -0.9 - g2 * 0.3, 0, 0, W.talk);
      add('armL', -0.15 + g2 * 0.15, 0, -0.18, W.talk); add('elbowL', -0.5, 0, 0, W.talk);
      add('head', Math.sin(t * 4.2) * 0.07, Math.sin(t * 1.3) * 0.1, Math.sin(t * 1.9) * 0.05, W.talk);
    }
    if (W.sad > 0.001) { add('head', 0.35, 0, 0, W.sad); add('torso', 0.15, 0, 0, W.sad); add('armL', 0.05, 0, -0.02, W.sad); add('armR', 0.05, 0, 0.02, W.sad); }
    // one-shots
    const u = this.oneShot ? Math.min(1, this.oneShotT / this.oneShotDur) : 1;
    if (W.interact > 0.001) { const k = Math.sin(Math.min(1, u * 1.4) * Math.PI); add('armR', -1.3 * k, 0, 0.1, W.interact); add('elbowR', -0.3 * k, 0, 0, W.interact); add('torso', 0.15 * k, 0, 0, W.interact); add('head', 0.25 * k, 0, 0, W.interact); }
    if (W.throw > 0.001) {
      const wind = u < 0.45 ? u / 0.45 : 1 - (u - 0.45) / 0.55;
      const fwd = u < 0.45 ? 0 : Math.min(1, (u - 0.45) / 0.2);
      add('armR', -2.6 * wind * (1 - fwd) + (-1.6) * fwd * (1 - (u - 0.65) * 1.5 * (u > 0.65)), 0, 0.2, W.throw);
      add('elbowR', -1.2 * wind, 0, 0, W.throw);
      add('torso', -0.15 * wind + 0.25 * fwd, -0.6 * wind + 0.4 * fwd, 0, W.throw);
      add('thighL', -0.5 * fwd, 0, 0, W.throw); add('kneeR', 0.4 * fwd, 0, 0, W.throw);
      add('armL', -0.8 * wind, 0, -0.3, W.throw);
    }
    if (W.cheer > 0.001) { const j = Math.abs(Math.sin(this.t * 7)); add('armL', -2.7, 0, -0.35, W.cheer); add('armR', -2.7, 0, 0.35, W.cheer); add('elbowL', -0.2, 0, 0, W.cheer); add('elbowR', -0.2, 0, 0, W.cheer); add('head', -0.25, 0, 0, W.cheer); hipY += j * 0.12 * W.cheer; add('kneeL', j * 0.6, 0, 0, W.cheer); add('kneeR', j * 0.6, 0, 0, W.cheer); add('thighL', -j * 0.3, 0, 0, W.cheer); add('thighR', -j * 0.3, 0, 0, W.cheer); }
    if (W.defeat > 0.001) { add('head', 0.55, 0, 0, W.defeat); add('torso', 0.35, 0, 0, W.defeat); add('armL', 0.2, 0, -0.05, W.defeat); add('armR', 0.2, 0, 0.05, W.defeat); add('kneeL', 0.5, 0, 0, W.defeat); add('kneeR', 0.5, 0, 0, W.defeat); add('thighL', -0.4, 0, 0, W.defeat); add('thighR', -0.4, 0, 0, W.defeat); hipY -= 0.12 * W.defeat; }
    if (W.wave > 0.001) { add('armR', -2.6, 0, 0.5 + Math.sin(this.t * 10) * 0.25, W.wave); add('elbowR', -0.5, 0, 0, W.wave); add('head', -0.1, 0.1, 0.1, W.wave); }
    if (W.look > 0.001) add('head', -0.1, Math.sin(this.t * 1.5) * 0.6, 0, W.look);
    // Reitsitz: Beine nach vorn und gespreizt, Hände halten sich fest
    if (W.ride > 0.001) { add('thighL', -1.35, 0, 0.4, W.ride); add('thighR', -1.35, 0, -0.4, W.ride); add('kneeL', 1.25, 0, 0, W.ride); add('kneeR', 1.25, 0, 0, W.ride); add('torso', 0.18, 0, 0, W.ride); add('armL', -0.7, 0, -0.25, W.ride); add('armR', -0.7, 0, 0.25, W.ride); add('elbowL', -0.6, 0, 0, W.ride); add('elbowR', -0.6, 0, 0, W.ride); }
    // apply
    for (const b of BONES) this.bones[b].rotation.copy(P[b]);
    this.bones.hips.position.y = this.dims.legLen + hipY - hipBob + 0.015;
    if (this.bones.tail) { this.bones.tail.rotation.y = Math.sin(t * (this.speed > 0.25 ? 7 : 2.4)) * (this.speed > 0.25 ? 0.4 : 0.22); this.bones.tail.rotation.x = 0.55 + Math.sin(t * 1.3) * 0.06; }
    // blinking & mouth
    this.blinkT -= dt;
    const blink = this.blinkT < 0.12 ? 0.1 : 1;
    if (this.blinkT < 0) this.blinkT = 2 + Math.random() * 3.5;
    this.bones.eyes.scale.y = blink;
    this.bones.mouth.scale.y = this.talking ? 0.25 + Math.abs(Math.sin(this.t * 13)) * 0.6 : (this.mood === 'happy' ? 0.5 : 0.3);
  }
  attachToHand(obj, side = 'R') { this.bones['hand' + side].add(obj); }
}

export function seedFor(name) { return hashString(name); }
