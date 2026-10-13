// Touch-Steuerung für Handy und Tablet: schwebender Bewegungs-Stick, Blickfeld zum Wischen,
// große, kontextabhängige Aktionstasten (Feuer mit Mitdrehen, Bauen, Interagieren, Gleiten …).
import { h } from '../core/dom';
import { settings } from '../core/settings';
import type { Input } from './input';

interface BtnDef {
  id: string;
  label: string;
  cls: string;
}

export interface TouchContext {
  interact: string | null;
  building: boolean;
  buildEnabled: boolean;
  falling: boolean;
  vehicle: boolean;
  downed: boolean;
  weapon: boolean;
  dead: boolean;
  bus: boolean;
}

export class TouchControls {
  readonly root: HTMLElement;
  private readonly stick: HTMLElement;
  private readonly knob: HTMLElement;
  private stickId: number | null = null;
  private stickX = 0;
  private stickY = 0;
  private lookId: number | null = null;
  private lookX = 0;
  private lookY = 0;
  private readonly btns = new Map<string, HTMLElement>();
  private readonly held = new Map<number, string>();
  private fireLook = new Map<number, [number, number]>();
  private ctx: TouchContext = { interact: null, building: false, buildEnabled: true, falling: false, vehicle: false, downed: false, weapon: false, dead: false, bus: false };
  visible = false;
  private crouchLatched = false;
  /** Zusätzliche Tippziele (z. B. Schnellzugriffsleiste); true = verbraucht */
  extraTap: ((x: number, y: number) => boolean) | null = null;

  constructor(private readonly input: Input) {
    this.root = h('div', { class: 'touch' });
    this.stick = h('div', { class: 't-stick' });
    this.knob = h('div', { class: 't-knob' });
    this.stick.appendChild(this.knob);
    this.root.appendChild(this.stick);
    const defs: BtnDef[] = [
      { id: 'fire', label: '', cls: 't-fire' },
      { id: 'fireL', label: '', cls: 't-fire t-fire-l' },
      { id: 'aim', label: '◎', cls: 't-aim' },
      { id: 'jump', label: '⤒', cls: 't-jump' },
      { id: 'crouch', label: '⤓', cls: 't-crouch' },
      { id: 'reload', label: '↻', cls: 't-reload' },
      { id: 'build', label: '▦', cls: 't-build' },
      { id: 'wall', label: 'Wand', cls: 't-piece t-p0' },
      { id: 'floor', label: 'Boden', cls: 't-piece t-p1' },
      { id: 'ramp', label: 'Rampe', cls: 't-piece t-p2' },
      { id: 'mat', label: 'Mat', cls: 't-piece t-p3' },
      { id: 'interact', label: 'Aufheben', cls: 't-interact' },
      { id: 'sprint', label: '»', cls: 't-sprint' },
      { id: 'map', label: '◫', cls: 't-top t-map' },
      { id: 'inv', label: '☰', cls: 't-top t-inv' },
      { id: 'emote', label: '☺', cls: 't-top t-emote' },
      { id: 'pause', label: 'II', cls: 't-top t-pause' },
    ];
    for (const d of defs) {
      const b = h('div', { class: 't-btn ' + d.cls, 'data-id': d.id }, d.label ? h('span', null, d.label) : null);
      this.btns.set(d.id, b);
      this.root.appendChild(b);
    }
    this.root.addEventListener('touchstart', this.onStart, { passive: false });
    this.root.addEventListener('touchmove', this.onMove, { passive: false });
    this.root.addEventListener('touchend', this.onEnd, { passive: false });
    this.root.addEventListener('touchcancel', this.onEnd, { passive: false });
    this.applySettings();
    settings.onChange(() => this.applySettings());
  }

  applySettings(): void {
    this.root.style.setProperty('--t-scale', String(settings.data.touchScale));
    this.root.style.setProperty('--t-op', String(settings.data.touchOpacity));
  }

  show(v: boolean): void {
    this.visible = v;
    this.root.style.display = v ? '' : 'none';
    if (!v) this.reset();
  }

  setContext(c: TouchContext): void {
    const prev = this.ctx;
    this.ctx = c;
    const vis = (id: string, on: boolean): void => {
      const b = this.btns.get(id)!;
      b.classList.toggle('hidden', !on);
    };
    const play = !c.dead && !c.bus;
    vis('fire', play && !c.falling && !c.downed);
    vis('fireL', play && !c.falling && !c.downed && c.weapon && !c.building);
    vis('aim', play && c.weapon && !c.building && !c.falling && !c.downed);
    vis('jump', play && !c.downed);
    vis('crouch', play && !c.vehicle);
    vis('reload', play && c.weapon && !c.building && !c.falling);
    vis('build', play && c.buildEnabled && !c.falling && !c.vehicle && !c.downed);
    for (const id of ['wall', 'floor', 'ramp', 'mat']) vis(id, play && c.building);
    vis('sprint', play && (c.vehicle || !c.falling) && !c.downed);
    vis('interact', !!c.interact);
    if (c.interact !== prev.interact) this.btns.get('interact')!.firstElementChild!.textContent = c.interact ?? '';
    const jumpLbl = c.bus ? 'Abspringen' : c.falling ? 'Gleiter' : '⤒';
    const jb = this.btns.get('jump')!;
    jb.classList.toggle('hidden', !(play || c.bus));
    if (jb.textContent !== jumpLbl) jb.firstElementChild!.textContent = jumpLbl;
    this.btns.get('crouch')!.firstElementChild!.textContent = c.falling ? 'Sturzflug' : '⤓';
    this.btns.get('fire')!.classList.toggle('building', c.building);
  }

  private hit(x: number, y: number): string | null {
    for (const [id, b] of this.btns) {
      if (b.classList.contains('hidden')) continue;
      const r = b.getBoundingClientRect();
      const pad = 8;
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return id;
    }
    return null;
  }

  private onStart = (e: TouchEvent): void => {
    e.preventDefault();
    this.input.lastDevice = 'touch';
    for (const t of Array.from(e.changedTouches)) {
      const id = this.hit(t.clientX, t.clientY);
      if (id) {
        this.held.set(t.identifier, id);
        this.press(id, true);
        if (id === 'fire' || id === 'fireL' || id === 'aim') this.fireLook.set(t.identifier, [t.clientX, t.clientY]);
        this.btns.get(id)!.classList.add('down');
        continue;
      }
      if (this.extraTap?.(t.clientX, t.clientY)) continue;
      if (t.clientX < window.innerWidth * 0.42 && this.stickId === null) {
        this.stickId = t.identifier;
        this.stickX = t.clientX;
        this.stickY = t.clientY;
        this.stick.style.left = `${t.clientX}px`;
        this.stick.style.top = `${t.clientY}px`;
        this.stick.classList.add('active');
        this.knob.style.transform = 'translate(-50%,-50%)';
      } else if (this.lookId === null) {
        this.lookId = t.identifier;
        this.lookX = t.clientX;
        this.lookY = t.clientY;
      }
    }
  };

  private onMove = (e: TouchEvent): void => {
    e.preventDefault();
    const sens = 0.0055 * settings.data.touchSensitivity * (this.input.touch.aim ? settings.data.aimSensitivity : 1);
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === this.stickId) {
        const R = 56 * settings.data.touchScale;
        let dx = t.clientX - this.stickX,
          dy = t.clientY - this.stickY;
        const l = Math.hypot(dx, dy);
        // Stick folgt dem Finger, wenn er weit herausgezogen wird
        if (l > R * 1.6) {
          this.stickX += (dx / l) * (l - R * 1.6);
          this.stickY += (dy / l) * (l - R * 1.6);
          this.stick.style.left = `${this.stickX}px`;
          this.stick.style.top = `${this.stickY}px`;
          dx = t.clientX - this.stickX;
          dy = t.clientY - this.stickY;
        }
        const cl = Math.min(R, Math.hypot(dx, dy));
        const a = Math.atan2(dy, dx);
        this.knob.style.transform = `translate(calc(-50% + ${Math.cos(a) * cl}px), calc(-50% + ${Math.sin(a) * cl}px))`;
        this.input.touch.mx = (Math.cos(a) * cl) / R;
        this.input.touch.mz = (-Math.sin(a) * cl) / R;
        this.input.touch.sprint = (settings.data.touchSprintAuto && Math.hypot(dx, dy) > R * 1.25) || this.held.has(-99);
      } else if (t.identifier === this.lookId) {
        this.input.lookX += (t.clientX - this.lookX) * sens;
        this.input.lookY += (t.clientY - this.lookY) * sens * (settings.data.invertY ? -1 : 1);
        this.lookX = t.clientX;
        this.lookY = t.clientY;
      } else if (this.fireLook.has(t.identifier)) {
        // Feuertaste gedrückt halten und gleichzeitig zielen
        const [lx, ly] = this.fireLook.get(t.identifier)!;
        this.input.lookX += (t.clientX - lx) * sens;
        this.input.lookY += (t.clientY - ly) * sens * (settings.data.invertY ? -1 : 1);
        this.fireLook.set(t.identifier, [t.clientX, t.clientY]);
      }
    }
  };

  private onEnd = (e: TouchEvent): void => {
    e.preventDefault();
    for (const t of Array.from(e.changedTouches)) {
      const id = this.held.get(t.identifier);
      if (id) {
        this.held.delete(t.identifier);
        this.fireLook.delete(t.identifier);
        this.press(id, false);
        this.btns.get(id)?.classList.remove('down');
      }
      if (t.identifier === this.stickId) {
        this.stickId = null;
        this.input.touch.mx = this.input.touch.mz = 0;
        this.input.touch.sprint = false;
        this.stick.classList.remove('active');
      }
      if (t.identifier === this.lookId) this.lookId = null;
    }
  };

  private press(id: string, down: boolean): void {
    const T = this.input.touch,
      S = this.input.shots;
    switch (id) {
      case 'fire':
      case 'fireL':
        T.fire = down;
        if (down) this.input.vibrate(8);
        break;
      case 'aim':
        if (down) T.aim = !T.aim;
        break;
      case 'jump':
        T.jump = down;
        if (down) this.input.latchJump = true;
        break;
      case 'crouch':
        if (this.ctx.falling) T.dive = down;
        else if (down) {
          // Ducken umschalten (Rutschen beim Sprinten wird durch kurzes Drücken ausgelöst)
          this.crouchLatched = !this.crouchLatched;
          this.input.crouchToggle = this.crouchLatched;
        }
        break;
      case 'sprint':
        T.sprint = down;
        break;
      case 'reload':
        if (down) S.push({ k: 'reload' });
        break;
      case 'build':
        if (down) S.push({ k: 'build' });
        break;
      case 'wall':
        if (down) S.push({ k: 'piece', n: 0 });
        break;
      case 'floor':
        if (down) S.push({ k: 'piece', n: 1 });
        break;
      case 'ramp':
        if (down) S.push({ k: 'piece', n: 2 });
        break;
      case 'mat':
        if (down) S.push({ k: 'buildMat' });
        break;
      case 'interact':
        T.interact = down;
        if (down) S.push({ k: 'interact' });
        break;
      case 'map':
        if (down) S.push({ k: 'ui', a: 'map' });
        break;
      case 'inv':
        if (down) S.push({ k: 'ui', a: 'inventory' });
        break;
      case 'emote':
        if (down) S.push({ k: 'ui', a: 'emote' });
        break;
      case 'pause':
        if (down) S.push({ k: 'ui', a: 'pause' });
        break;
    }
  }

  /** Nach dem Rutschen Ducken wieder lösen */
  releaseCrouch(): void {
    this.crouchLatched = false;
    this.input.crouchToggle = false;
  }

  reset(): void {
    const T = this.input.touch;
    T.mx = T.mz = 0;
    T.fire = T.aim = T.jump = T.crouch = T.sprint = T.interact = T.dive = false;
    this.stickId = this.lookId = null;
    this.held.clear();
    this.fireLook.clear();
    this.releaseCrouch();
    for (const b of this.btns.values()) b.classList.remove('down');
  }
}
