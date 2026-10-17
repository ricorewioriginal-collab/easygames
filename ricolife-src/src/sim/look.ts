// Optionskataloge für den Charaktereditor und zufällige, sinnvoll unterschiedliche Erscheinungsbilder.
import type { AgeStage, Appearance, Outfit, OutfitKind } from '../data/types';
import { Rng } from '../core/rng';

export const SKIN_TONES = ['#f6dcc8', '#f1cfb2', '#e8bc96', '#d9a47a', '#c68a5e', '#a96f47', '#8c5634', '#6f4127', '#55301c', '#3e2316'];
export const HAIR_COLORS = ['#1d1612', '#3b2a20', '#5e3d26', '#8a5a34', '#b07a45', '#d2a65f', '#e6cc8f', '#a33b20', '#c9572e', '#9a9a9a', '#e8e4dc', '#4a6fb5', '#b45cc9', '#3f9b7a'];
export const EYE_COLORS = ['#3b2a1d', '#5c3d22', '#6b8a3a', '#3f7fb3', '#7a8b99', '#2f2f2f', '#9a6b2f'];
export const CLOTH_COLORS = ['#2f4858', '#33658a', '#86bbd8', '#758e4f', '#f6ae2d', '#f26419', '#c44536', '#772e25', '#e8d5b7', '#f4f1ea', '#3d3d3d', '#9c89b8', '#f0a6ca', '#3a7d44', '#d1495b', '#00798c', '#edae49', '#1b1b1e', '#6d597a', '#b56576'];

export const HAIR_STYLES = ['Glatze', 'Kurz', 'Igel', 'Seitenscheitel', 'Locken kurz', 'Bob', 'Pferdeschwanz', 'Lang offen', 'Dutt', 'Afro', 'Zöpfe', 'Undercut', 'Wellen schulterlang', 'Pixie', 'Rastas', 'Haarband lang'];
export const TOPS = ['T-Shirt', 'Hemd', 'Pullover', 'Kapuzenpulli', 'Bluse', 'Blazer', 'Tanktop', 'Strickjacke', 'Kleid', 'Schlafanzug', 'Kittel', 'Badeanzug'];
export const BOTTOMS = ['Jeans', 'Chino', 'Shorts', 'Rock', 'Jogginghose', 'Stoffhose', 'Leggings', 'Badehose'];
export const SHOES = ['Sneaker', 'Halbschuhe', 'Stiefel', 'Sandalen', 'Hausschuhe', 'Barfuß'];
export const GLASSES = ['Keine', 'Rund', 'Eckig', 'Sonnenbrille'];
export const ACCESSORIES = ['Keins', 'Ohrringe', 'Halskette', 'Mütze', 'Kappe', 'Schal', 'Armreif'];
export const BEARDS = ['Keiner', 'Dreitagebart', 'Vollbart', 'Schnurrbart', 'Kinnbart'];
export const HEAD_SHAPES = ['Oval', 'Rund', 'Eckig', 'Herzförmig'];
export const NOSES = ['Gerade', 'Stups', 'Breit', 'Adler'];
export const EYE_SHAPES = ['Mandel', 'Rund', 'Schmal', 'Groß'];
export const BROWS = ['Weich', 'Gerade', 'Kräftig'];

export const OUTFIT_NAMES: Record<OutfitKind, string> = { everyday: 'Alltag', work: 'Arbeit', sport: 'Sport', party: 'Feier', sleep: 'Schlafen', swim: 'Baden' };

export const AGE_NAMES: Record<AgeStage, string> = { baby: 'Baby', toddler: 'Kleinkind', child: 'Kind', teen: 'Jugendlich', youngadult: 'Junge:r Erwachsene:r', adult: 'Erwachsen', senior: 'Senior:in' };

function outfit(rng: Rng, kind: OutfitKind, frame: number): Outfit {
  const c = (): string => rng.pick(CLOTH_COLORS);
  switch (kind) {
    case 'sleep':
      return { top: 9, topColor: rng.pick(['#9fb7d9', '#e8c3d1', '#c9dcb6', '#d8d1e8']), bottom: 4, bottomColor: rng.pick(['#7f96bf', '#c993a9', '#9db58a']), shoes: 4, shoeColor: '#e8e2d6' };
    case 'swim':
      return { top: frame ? 6 : 11, topColor: c(), bottom: 7, bottomColor: c(), shoes: 5, shoeColor: '#000000' };
    case 'sport':
      return { top: rng.pick([0, 3, 6]), topColor: c(), bottom: rng.pick([2, 4, 6]), bottomColor: rng.pick(['#1b1b1e', '#3d3d3d', '#33658a']), shoes: 0, shoeColor: rng.pick(['#f4f1ea', '#f26419', '#33658a']) };
    case 'work':
      return { top: rng.pick([1, 4, 5, 7]), topColor: rng.pick(['#f4f1ea', '#86bbd8', '#2f4858', '#e8d5b7']), bottom: rng.pick([1, 5, 3]), bottomColor: rng.pick(['#3d3d3d', '#2f4858', '#772e25', '#1b1b1e']), shoes: 1, shoeColor: rng.pick(['#3b2a20', '#1b1b1e']) };
    case 'party':
      return { top: rng.pick([1, 4, 5, 8]), topColor: c(), bottom: rng.pick([1, 3, 5]), bottomColor: c(), shoes: 1, shoeColor: '#1b1b1e' };
    default:
      return { top: rng.pick([0, 1, 2, 3, 4, 7, 8]), topColor: c(), bottom: rng.pick([0, 1, 2, 3, 5]), bottomColor: rng.pick(['#33658a', '#2f4858', '#3d3d3d', '#e8d5b7', '#758e4f', '#772e25']), shoes: rng.pick([0, 1, 2, 3]), shoeColor: rng.pick(['#f4f1ea', '#3b2a20', '#1b1b1e', '#c44536']) };
  }
}

export function randomLook(seed: number, age: AgeStage, hint: Partial<Appearance> & { topColor?: string } = {}): Appearance {
  const rng = new Rng(seed);
  const frame = (hint.frame ?? (rng.chance(0.5) ? 1 : 0)) as 0 | 1;
  const old = age === 'senior';
  const kid = age === 'child' || age === 'toddler' || age === 'baby';
  const hairColor = hint.hairColor ?? (old ? rng.pick(['#9a9a9a', '#e8e4dc', '#c9c4ba']) : rng.chance(0.08) ? rng.pick(HAIR_COLORS.slice(11)) : rng.pick(HAIR_COLORS.slice(0, 9)));
  const longish = [5, 6, 7, 8, 10, 12, 15];
  const short = [1, 2, 3, 4, 11, 13];
  const hair = hint.hair ?? (rng.chance(0.08) ? rng.pick([9, 14]) : frame ? rng.pick(rng.chance(0.75) ? short : longish) : rng.pick(rng.chance(0.7) ? longish : short));
  const look: Appearance = {
    frame,
    height: kid ? 0 : rng.range(-0.8, 0.8),
    weight: rng.range(-0.7, 0.8),
    muscle: rng.range(-0.6, 0.6),
    skin: hint.skin ?? rng.pick(SKIN_TONES),
    headShape: rng.int(0, 3),
    jaw: rng.range(-0.8, 0.8),
    nose: rng.int(0, 3),
    noseSize: rng.range(-0.6, 0.6),
    eyes: rng.int(0, 3),
    eyeColor: rng.pick(EYE_COLORS),
    brows: rng.int(0, 2),
    hair: old && rng.chance(0.15) && frame ? 0 : hair,
    hairColor,
    beard: hint.beard ?? (!kid && age !== 'teen' && frame && rng.chance(0.35) ? rng.int(1, 4) : 0),
    glasses: hint.glasses ?? (rng.chance(old ? 0.6 : 0.2) ? rng.int(1, 2) : 0),
    accessory: rng.chance(0.3) ? rng.int(1, 6) : 0,
    accessoryColor: rng.pick(['#d4af37', '#c0c0c0', '#c44536', '#33658a', '#f4f1ea']),
    outfits: {} as Record<OutfitKind, Outfit>,
  };
  for (const k of ['everyday', 'work', 'sport', 'party', 'sleep', 'swim'] as OutfitKind[]) look.outfits[k] = outfit(rng, k, frame);
  if (hint.topColor) look.outfits.everyday.topColor = hint.topColor;
  return look;
}

export function cloneLook(a: Appearance): Appearance {
  return JSON.parse(JSON.stringify(a)) as Appearance;
}
