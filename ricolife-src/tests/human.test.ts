// Rauchtest: prozedurale Menschen und Haustiere lassen sich in Node (ohne WebGL) bauen und animieren.
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { AGE_STAGES, OUTFIT_KINDS, type EmotionId } from '../src/data/types';
import type { AnimId } from '../src/sim/types';
import { randomLook } from '../src/sim/look';
import { HumanModel, type HumanAnimState } from '../src/render/human';
import { FUR_COLORS, PetModel, type PetAnim } from '../src/render/pet';

const ANIMS: AnimId[] = [
  'idle', 'walk', 'run', 'sit', 'sleep', 'eat', 'eatStand', 'drink', 'cook', 'fridge', 'wash', 'shower', 'bath',
  'toilet', 'talk', 'listen', 'laugh', 'hug', 'kiss', 'wave', 'highfive', 'angry', 'cry', 'dance', 'tv', 'type',
  'read', 'treadmill', 'lift', 'yoga', 'punch', 'paint', 'piano', 'guitar', 'chess', 'telescope', 'garden', 'fish',
  'photo', 'repair', 'clean', 'phone', 'swim', 'grill', 'play', 'swing', 'carry', 'cuddle', 'think', 'cheer',
  'mirror', 'serve', 'examine', 'mic', 'register', 'pet', 'sitfloor', 'flirt', 'embarrassed', 'stretch', 'baby', 'crawl', 'pushups',
];
const EMOS: EmotionId[] = ['fine', 'happy', 'sad', 'love', 'tense', 'focused', 'inspired', 'angry', 'embarrassed', 'tired', 'playful', 'confident'];
const PROPS = [null, 'plate', 'cup', 'book', 'phone', 'guitar', 'baby', 'tray', 'mic', 'fishingrod', 'camera', 'brush', 'box', 'unbekannt'];

function finiteBones(h: HumanModel): boolean {
  let ok = true;
  h.object.traverse((o) => {
    const v = [o.position.x, o.position.y, o.position.z, o.quaternion.x, o.quaternion.y, o.quaternion.z, o.quaternion.w, o.scale.x, o.scale.y, o.scale.z];
    if (v.some((n) => !Number.isFinite(n))) ok = false;
  });
  return ok;
}

describe('HumanModel', () => {
  it('baut alle Altersstufen und spielt jede Anim ohne NaN', () => {
    let seed = 1;
    for (const age of AGE_STAGES) {
      for (let v = 0; v < 2; v++) {
        const look = randomLook(seed++, age);
        const h = new HumanModel(look, age, 'everyday');
        expect(h.triangles).toBeGreaterThan(500);
        expect(h.triangles).toBeLessThan(4000);
        const st: HumanAnimState = { anim: 'idle', t: 0, emo: 'fine', emoPower: 2 };
        for (const [i, anim] of ANIMS.entries()) {
          st.anim = anim;
          st.emo = EMOS[i % EMOS.length]!;
          st.talking = i % 3 === 0;
          st.holding = PROPS[i % PROPS.length]!;
          st.seatY = i % 5 === 0 ? 0.45 : undefined;
          for (let f = 0; f < 8; f++) {
            st.t = f * 0.37;
            h.update(st, 1 / 30);
          }
          expect(finiteBones(h), `${age} ${anim}`).toBe(true);
        }
        const hh = h.headHeight();
        expect(Number.isFinite(hh)).toBe(true);
        h.setHighlight(true);
        h.setHighlight(false);
        h.dispose();
      }
    }
  });

  it('alle Stile und Outfits bauen fehlerfrei; setLook baut nur bei Änderung neu', () => {
    const look = randomLook(42, 'adult');
    const h = new HumanModel(look, 'adult', 'everyday');
    for (let i = 0; i < 16; i++) {
      look.hair = i; look.beard = i % 5; look.glasses = i % 4; look.accessory = i % 7; look.headShape = i % 4; look.nose = i % 4; look.eyes = i % 4; look.brows = i % 3;
      look.outfits.everyday = { top: i % 12, topColor: '#c44536', bottom: i % 8, bottomColor: '#33658a', shoes: i % 6, shoeColor: '#1b1b1e' };
      h.setLook(look, 'adult', 'everyday');
      h.update({ anim: 'walk', t: i * 0.1, emo: 'happy', emoPower: 3 }, 0.016);
      expect(finiteBones(h)).toBe(true);
    }
    for (const k of OUTFIT_KINDS) h.setLook(look, 'adult', k);
    const mesh = h.object.children[0] as THREE.SkinnedMesh;
    h.setLook(look, 'adult', OUTFIT_KINDS[OUTFIT_KINDS.length - 1]!);
    expect(h.object.children[0]).toBe(mesh);
    // Größenordnung der Altersstufen
    const tall = new HumanModel(randomLook(3, 'adult'), 'adult', 'everyday');
    const baby = new HumanModel(randomLook(3, 'baby'), 'baby', 'everyday');
    expect(tall.height).toBeGreaterThan(1.55);
    expect(baby.height).toBeLessThan(0.7);
    // ungültige Zeitwerte
    tall.update({ anim: 'idle', t: Number.NaN, emo: 'fine', emoPower: Number.NaN }, Number.NaN);
    expect(finiteBones(tall)).toBe(true);
    h.dispose(); tall.dispose(); baby.dispose();
  });
});

describe('PetModel', () => {
  it('Hund und Katze in allen Fellfarben und Anims', () => {
    expect(FUR_COLORS.length).toBeGreaterThanOrEqual(6);
    const anims: PetAnim[] = ['idle', 'walk', 'run', 'sit', 'sleep', 'eat', 'play', 'beg', 'pet'];
    for (const kind of ['dog', 'cat'] as const) {
      for (let fur = 0; fur < FUR_COLORS.length; fur++) {
        const p = new PetModel(kind, fur);
        for (const a of anims) for (let f = 0; f < 6; f++) p.update(a, f * 0.4, 1 / 30);
        let ok = true;
        p.object.traverse((o) => {
          if (![o.position.y, o.quaternion.x, o.quaternion.w, o.scale.y].every(Number.isFinite)) ok = false;
        });
        expect(ok).toBe(true);
        p.dispose();
      }
    }
  });
});
