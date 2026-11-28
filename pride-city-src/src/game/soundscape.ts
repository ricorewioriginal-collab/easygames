/* Stadt-Atmo: berechnet aus der Umgebung die Pegel der Dauerschichten (Audio.ambience) und plant Einzelgeräusche
   (Vögel am Tag, Grillen nachts, Möwen am Wasser, ferne Hupen und Sirenen, Hunde). Reine Logik, testbar. */
import type { AmbLevels, AmbFx } from '../engine/Audio';

export interface Around { sea: number; cars: number; people: number; night: boolean; rain: boolean; inCar: boolean; high: boolean; dogs: number }

export function levels(a: Around): AmbLevels {
  const muffle = a.inCar ? .45 : 1;
  return {
    traffic: Math.min(1, .25 + a.cars * .12) * (a.high ? .4 : 1) * muffle,
    sea: Math.min(1, a.sea * 1.3) * muffle,
    crowd: a.high ? 0 : Math.min(1, a.people * .14) * (a.rain ? .5 : 1) * muffle,
    wind: (a.high ? .9 : a.sea * .4 + (a.rain ? .4 : .1)) * (a.inCar ? .6 : 1),
  };
}

/** nächstes Einzelgeräusch: [Art, Lautstärke] oder null, dazu Wartezeit bis zum nächsten Versuch */
export function nextFx(a: Around, r: number, r2: number): { fx: [AmbFx, number] | null; wait: number } {
  const wait = 2.5 + r2 * 5, k = a.inCar ? .45 : 1;
  if (a.high) return { fx: null, wait };
  if (a.sea > .3 && r < .3) return { fx: ['gull', .8 * k], wait };
  if (r < .08) return { fx: ['hornfar', .7 * k], wait };
  if (r < .11) return { fx: ['sirenfar', .6 * k], wait };
  if (a.dogs > 0 && r < .17) return { fx: ['dog', .6 * k], wait };
  if (a.rain) return { fx: null, wait };
  if (a.night) return { fx: ['cricket', .8 * k], wait: wait * .4 };
  return { fx: ['bird', .7 * k], wait: wait * .7 };
}
