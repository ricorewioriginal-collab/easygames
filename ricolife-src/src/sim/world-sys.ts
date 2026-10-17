// Welt-Systeme: Wetter und Temperatur, Rechnungen und Strom, Gartenwachstum, verderbliche Reste, Verkauf von Gegenständen.
import type { Season, WeatherId } from '../data/types';
import { getDef } from '../world/defs';
import { cellKey } from '../world/world';
import { itemDef, type Game } from './game';
import type { Sim } from './types';

const WEATHER: Record<Season, [WeatherId, number][]> = {
  spring: [['sunny', 35], ['cloudy', 30], ['rain', 25], ['windy', 10]],
  summer: [['sunny', 55], ['cloudy', 20], ['rain', 10], ['storm', 8], ['windy', 7]],
  autumn: [['sunny', 20], ['cloudy', 30], ['rain', 30], ['storm', 8], ['windy', 12]],
  winter: [['sunny', 15], ['cloudy', 30], ['snow', 42], ['windy', 8], ['rain', 5]],
};
const BASE_TEMP: Record<Season, number> = { spring: 12, summer: 23, autumn: 11, winter: -1 };
export const WEATHER_NAMES: Record<WeatherId, string> = { sunny: 'Sonnig', cloudy: 'Bewölkt', rain: 'Regen', storm: 'Gewitter', snow: 'Schnee', windy: 'Windig' };
export const WEATHER_ICONS: Record<WeatherId, string> = { sunny: '☀️', cloudy: '⛅', rain: '🌧️', storm: '⛈️', snow: '❄️', windy: '🌬️' };

export function season(g: Game): Season {
  return g.settings.fixedSeason || g.clock.season;
}

export function rollWeather(g: Game): void {
  const s = season(g);
  const opts = WEATHER[s];
  const w = g.rng.weighted(opts, (x) => x[1])![0];
  const prev = g.weather.now;
  g.weather.now = w;
  g.weather.until = g.clock.min + g.rng.int(4 * 60, 10 * 60);
  g.weather.wind = w === 'storm' ? 0.9 : w === 'windy' ? 0.7 : w === 'rain' ? 0.4 : 0.15;
  updateTemp(g);
  if (prev !== w && (w === 'storm' || w === 'snow') && g.hh) g.notify(`Wetter: ${WEATHER_NAMES[w]} zieht auf.`, WEATHER_ICONS[w], undefined, 'info');
}
function updateTemp(g: Game): void {
  const s = season(g);
  const h = g.clock.hour;
  const day = Math.sin(((h - 9) / 24) * Math.PI * 2) * 4;
  const wmod = g.weather.now === 'rain' || g.weather.now === 'storm' ? -3 : g.weather.now === 'snow' ? -3 : g.weather.now === 'sunny' ? 2 : 0;
  g.weather.temp = Math.round(BASE_TEMP[s] + day + wmod);
}

/** Wöchentliche Rechnung eines Haushalts */
export function billAmount(g: Game, hhId: string): number {
  const h = g.hhs.get(hhId);
  if (!h?.lot) return 0;
  let power = 0;
  for (const o of g.world.objs.values()) if (o.lot === h.lot && getDef(o.def).func?.some((f) => ['tv', 'computer', 'stove', 'oven', 'fridge', 'microwave', 'dishwasher', 'stereo', 'light'].includes(f))) power++;
  return Math.round(g.world.lotValue(h.lot) * 0.008 + h.members.length * 25 + power * 3);
}

/** Gegenstand aus dem Inventar verkaufen (Fische, Ernte, Kunst, Manuskripte) */
export function sellValue(g: Game, s: Sim, id: string): number {
  const it = itemDef(id);
  if (!it) return 0;
  if (it.kind === 'fish' || it.kind === 'harvest') return it.value ?? 1;
  if (it.kind === 'painting') return Math.round((it.value ?? 50) * (1 + g.skillLv(s, 'painting') / 3));
  if (it.kind === 'photo') return Math.round((it.value ?? 20) * (1 + g.skillLv(s, 'photography') / 3));
  if (id === 'manuscript') return Math.round((it.value ?? 100) * (1 + g.skillLv(s, 'writing') / 2.5));
  return Math.round(it.price * 0.4);
}
export function sellItem(g: Game, s: Sim, id: string, n = 1): number {
  const have = s.inv[id] ?? 0;
  const k = Math.min(n, have);
  if (k <= 0 || !s.hh) return 0;
  const v = sellValue(g, s, id) * k;
  g.giveItem(s, id, -k);
  g.money(s.hh, v, `Verkauf: ${k}× ${itemDef(id)!.name}`);
  const it = itemDef(id)!;
  if (it.kind === 'painting' || it.kind === 'photo' || id === 'manuscript') {
    s.flags.soldArt = (s.flags.soldArt ?? 0) + k;
    g.bus.emit('interaction', { sim: s.id, id: 'sellArt' });
  }
  g.bus.emit('interaction', { sim: s.id, id: 'sell' });
  return v;
}

/** Essen aus dem Inventar (Apfel, Brötchen, Kuchen) */
export function eatItem(g: Game, s: Sim, id: string): boolean {
  const it = itemDef(id);
  if (!it?.hunger || !(s.inv[id] ?? 0)) return false;
  g.giveItem(s, id, -1);
  g.addNeed(s, 'hunger', it.hunger);
  g.bubble(s, it.icon, 3);
  return true;
}

export function installWorldSys(g: Game): void {
  g.systems.push({
    name: 'world',
    hourly: (g2) => {
      if (g2.clock.min >= g2.weather.until) rollWeather(g2);
      else updateTemp(g2);
      const rain = g2.weather.now === 'rain' || g2.weather.now === 'storm';
      const winter = season(g2) === 'winter';
      const now = g2.clock.min;
      for (const o of [...g2.world.objs.values()]) {
        const st = o.st;
        if (!st) continue;
        // Garten
        if (st.crop) {
          const outdoor = !g2.world.floors.has(cellKey(o.l, o.x, o.z));
          if (rain && outdoor) st.water = 1;
          if ((st.water ?? 0) > 0 && !winter && (st.growth ?? 0) < 1) {
            st.growth = Math.min(1, (st.growth ?? 0) + 1 / 30);
            if (st.growth >= 1) g2.world.touch(o.lot);
          }
          st.water = Math.max(0, (st.water ?? 0) - 1 / 20);
          if (st.growth !== undefined && Math.floor(st.growth * 4) !== Math.floor((st.growth - 1 / 30) * 4)) g2.world.touch(o.lot);
        }
        // verderbliche Reste
        if (o.def === 'prop-meal' && st.until !== undefined && now > st.until) {
          const lot = o.lot,
            l = o.l,
            x = o.x + 0.5,
            z = o.z + 0.5;
          g2.removeObject(o.id);
          g2.spawnProp('prop-trash', lot, l, { x, z });
        }
      }
    },
    daily: (g2) => {
      // Rechnungen jeden Montag; nach drei Tagen ohne Zahlung wird der Strom abgestellt
      for (const h of g2.hhs.values()) {
        if (!h.lot) continue;
        const active = h.id === g2.activeHh;
        if (h.bills && g2.clock.min > h.bills.due && !h.powerOff) {
          if (!active) {
            g2.money(h.id, -Math.min(h.funds, h.bills.amount), 'Rechnungen', `bill:${h.bills.issued}`);
            h.bills = null;
          } else {
            h.powerOff = true;
            g2.notify('Die Rechnungen wurden nicht bezahlt – der Strom ist abgestellt! Am Briefkasten bezahlen.', '🔌', undefined, 'bad');
          }
        }
        if (g2.clock.weekday === 0 && !h.bills) {
          const amount = billAmount(g2, h.id);
          if (amount > 0) {
            h.bills = { amount, due: g2.clock.min + 3 * 1440, issued: g2.clock.day };
            if (active) g2.notify(`Neue Rechnungen: ${amount} RT. Bitte innerhalb von 3 Tagen am Briefkasten bezahlen.`, '✉️', undefined, 'info');
          }
        }
      }
    },
  });
}
