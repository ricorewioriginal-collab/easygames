// Überlebensmodus: Gesundheit, Hunger, Luft. Reine Logik ohne Oberfläche (testbar).
export const MAX_HP = 20, MAX_FOOD = 20, MAX_AIR = 10;

// Fallschaden aus der Aufprallgeschwindigkeit (Blöcke/s). Bis ~4 Blöcke Fallhöhe kein Schaden.
export const SAFE_IMPACT = 15.5;
export function fallDamage(v) { return v > SAFE_IMPACT ? Math.floor((v - SAFE_IMPACT) / 2.5) + 1 : 0; }

// Hungerverbrauch je Sekunde (Punkte): Grundumsatz, Laufen, Rennen
const BURN = { idle: 0.018, walk: 0.028, sprint: 0.06 };

export class Vitals {
  constructor(s = {}) {
    const num = (v, d, max) => (Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : d);
    this.hp = num(s.hp, MAX_HP, MAX_HP); this.food = num(s.food, MAX_FOOD, MAX_FOOD); this.air = num(s.air, MAX_AIR, MAX_AIR);
    if (this.hp <= 0) this.hp = MAX_HP; // nie tot laden
    this.regenT = 0; this.starveT = 0; this.drownT = 0; this.magmaT = 0; this.cause = '';
  }

  // Schaden; Rückgabe true = gestorben
  hurt(n, cause) {
    if (n <= 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - n); this.cause = cause;
    return this.hp <= 0;
  }

  // Essen: Rückgabe false, wenn satt
  eat(points) {
    if (this.food >= MAX_FOOD) return false;
    this.food = Math.min(MAX_FOOD, this.food + points);
    return true;
  }

  // ctx: { moving, sprint, eyeWater, onMagma }. Rückgabe: erlittener Schaden in diesem Schritt
  tick(dt, ctx) {
    const hp0 = this.hp;
    this.food = Math.max(0, this.food - dt * (ctx.sprint && ctx.moving ? BURN.sprint : ctx.moving ? BURN.walk : BURN.idle));
    // Erholen bei vollem Magen, Hunger zehrt bis auf ein halbes Herz
    if (this.food >= 16 && this.hp < MAX_HP) {
      this.regenT += dt;
      if (this.regenT >= 3) { this.regenT = 0; this.hp = Math.min(MAX_HP, this.hp + 1); this.food = Math.max(0, this.food - 0.6); }
    } else this.regenT = 0;
    if (this.food <= 0 && this.hp > 1) {
      this.starveT += dt;
      if (this.starveT >= 4) { this.starveT = 0; this.hurt(1, 'Hunger'); }
    } else this.starveT = 0;
    // Luft unter Wasser
    if (ctx.eyeWater) {
      this.air = Math.max(0, this.air - dt);
      if (this.air <= 0) { this.drownT += dt; if (this.drownT >= 1) { this.drownT = 0; this.hurt(2, 'Ertrunken'); } }
    } else { this.air = Math.min(MAX_AIR, this.air + dt * 4); this.drownT = 0; }
    // Magma brennt
    if (ctx.onMagma) { this.magmaT += dt; if (this.magmaT >= 1) { this.magmaT = 0; this.hurt(1, 'Magma'); } }
    else this.magmaT = 0.6; // erster Treffer kurz nach dem Betreten
    return hp0 - this.hp > 0 ? hp0 - this.hp : 0;
  }

  get dead() { return this.hp <= 0; }
  toJSON() { return { hp: Math.round(this.hp * 10) / 10, food: Math.round(this.food * 10) / 10, air: Math.round(this.air * 10) / 10 }; }
}
