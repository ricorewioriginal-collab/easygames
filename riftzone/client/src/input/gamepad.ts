// Gamepad über die Gamepad-API (Standard-Belegung: Xbox/PlayStation-ähnlich).
import { settings } from '../core/settings';
import type { Input } from './input';

const DEAD = 0.16;
const dz = (v: number): number => (Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD));

export class GamepadInput {
  private prev: boolean[] = [];
  connected = false;
  constructor(private readonly input: Input) {}

  poll(dt: number, building: boolean, uiOpen: boolean): void {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = Array.from(pads).find((p) => p && p.connected) ?? null;
    const P = this.input.pad;
    if (!gp) {
      this.connected = false;
      P.mx = P.mz = 0;
      P.fire = P.aim = P.jump = P.crouch = P.sprint = P.interact = P.dive = false;
      return;
    }
    this.connected = true;
    const b = gp.buttons.map((x) => x.pressed || x.value > 0.4);
    const pressed = (i: number): boolean => !!b[i] && !this.prev[i];
    const ax = gp.axes;
    const lx = dz(ax[0] ?? 0),
      ly = dz(ax[1] ?? 0),
      rx = dz(ax[2] ?? 0),
      ry = dz(ax[3] ?? 0);
    if (b.some((x) => x) || Math.abs(lx) + Math.abs(ly) + Math.abs(rx) + Math.abs(ry) > 0) this.input.lastDevice = 'pad';
    const S = this.input.shots;
    if (pressed(9)) S.push({ k: 'ui', a: 'pause' });
    if (pressed(8)) S.push({ k: 'ui', a: 'map' });
    if (uiOpen) {
      this.prev = b;
      P.mx = P.mz = 0;
      return;
    }
    P.mx = lx;
    P.mz = -ly;
    const sens = 3.2 * settings.data.gamepadSensitivity * dt * (P.aim ? 0.5 : 1);
    this.input.lookX += rx * Math.abs(rx) * sens;
    this.input.lookY += ry * Math.abs(ry) * sens * (settings.data.invertY ? -1 : 1);
    P.fire = !!b[7];
    P.aim = !!b[6];
    P.jump = !!b[0];
    P.crouch = !!b[1];
    P.sprint = !!b[10];
    P.interact = !!b[2];
    if (pressed(2)) S.push({ k: 'interact' });
    if (pressed(3)) S.push({ k: 'reload' });
    if (pressed(11)) S.push({ k: 'build' });
    if (pressed(4)) S.push(building ? { k: 'piece', n: 0 } : { k: 'slotNext', d: -1 });
    if (pressed(5)) S.push(building ? { k: 'piece', n: 2 } : { k: 'slotNext', d: 1 });
    if (pressed(12)) S.push(building ? { k: 'piece', n: 1 } : { k: 'ui', a: 'emote' });
    if (pressed(13)) S.push(building ? { k: 'buildMat' } : { k: 'ui', a: 'inventory' });
    if (pressed(14)) S.push({ k: 'slot', n: 0 });
    if (pressed(15)) S.push({ k: 'ui', a: 'marker' });
    this.prev = b;
  }
}
