/* Grundgerüst für die 3D-Minispiele: eigene Babylon-Szene, eine Bedienung für alle Geräte (Richtung + A-Knopf, Touch-Knöpfe
   hochkant und quer, Gamepad, Tastatur), Anzeige (Punkte, Zeit, Ansagen) und Effekte (Glitzer-Partikel, Spritzer, Konfetti,
   Kamera-Wackler, Blitz, Zeitlupe, schwebende Punkte). Jedes Spiel erbt davon und baut nur Welt und Regeln. */
import type { GameScene } from '../../engine/Engine';
import { Vector3, Color4, ParticleSystem, Scene, type FreeCamera } from '../../engine/bjs';
import { canvasTex } from '../../engine/geo';
import { el, $, hints } from '../../ui/ui';
import { music, sfx, type Sfx } from '../../engine/Audio';
import type { Game } from '../Game';

export interface MiniResult { id: string; score: number; won: boolean; quit: boolean; best: number; /** spielspezifische Zahlen (z. B. Drinks, Trinkgeld) */ extra?: Record<string, number> }
export interface MiniDef {
  id: string;
  icon: string; name: string; sub: string;
  /** Name/Beschreibung mit „Inhalte ab 18“ (frecher, gleiche Regeln) */
  adultIcon?: string; adultName?: string; adultSub?: string;
  /** nur mit 18+ spielbar */
  adultOnly?: boolean;
  /** Knopf-Beschriftung (Touch) */
  btn: string;
  /** Punkte, ab denen eine Runde als gewonnen zählt */
  goal: number;
  /** Orte, an denen das Spiel passt (Club, Bar, Wohnung …) – für Clubs, Story und Innenräume */
  tags: string[];
  /** ersetzt dieses Gay-Life!-Minispiel (2D-Original bleibt unter Minispiele → Originale erreichbar) */
  gl?: string;
  /** ohne ◀ ▶ (nur A-Knopf) */
  noPad?: boolean;
  /** Musik der Szene */
  song?: 'club' | 'show' | 'neon' | 'title';
  make: (g: Game, def: MiniDef, adult: boolean, done: (r: MiniResult) => void) => Arcade;
}

type Burst = { pos: Vector3; n: number; c1: Color4; c2: Color4; speed: number; size: number; up: number };

/** Partikel-Effekte: drei feste Systeme (Glitzer, Spritzer, Konfetti), Ausbrüche werden je Bild nacheinander abgearbeitet */
export class Fx {
  private sys: Record<'spark' | 'goo' | 'confetti', ParticleSystem>;
  private queue: Record<string, Burst[]> = { spark: [], goo: [], confetti: [] };
  constructor(sc: Scene, mobile: boolean) {
    const tex = canvasTex(sc, 64, 64, (g) => {
      const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 64, 64);
      g.fillStyle = '#fff'; g.fillRect(30, 4, 4, 56); g.fillRect(4, 30, 56, 4); // Glitzerkreuz
    }, true);
    const mk = (name: string, cap: number, add: boolean, grav: number) => {
      const p = new ParticleSystem(name, mobile ? Math.round(cap * .6) : cap, sc);
      p.particleTexture = tex; p.emitter = new Vector3(0, -999, 0);
      p.minEmitBox = new Vector3(-.05, -.05, -.05); p.maxEmitBox = new Vector3(.05, .05, .05);
      p.emitRate = 0; p.manualEmitCount = 0;
      p.blendMode = add ? ParticleSystem.BLENDMODE_ADD : ParticleSystem.BLENDMODE_STANDARD;
      p.gravity = new Vector3(0, grav, 0);
      p.minLifeTime = .45; p.maxLifeTime = 1.1;
      p.colorDead = new Color4(0, 0, 0, 0);
      p.minAngularSpeed = -6; p.maxAngularSpeed = 6;
      p.direction1 = new Vector3(-1, 1, -1); p.direction2 = new Vector3(1, 1, 1);
      p.updateSpeed = 1 / 60;
      p.start();
      return p;
    };
    this.sys = { spark: mk('spark', 400, true, -3), goo: mk('goo', 300, false, -14), confetti: mk('confetti', 300, false, -5) };
    this.sys.goo.colorDead = new Color4(1, 1, 1, 0);
    this.sys.confetti.minLifeTime = 1; this.sys.confetti.maxLifeTime = 2;
  }
  /** Ausbruch an einer Stelle: Farben als 0xrrggbb, n Teilchen */
  burst(kind: 'spark' | 'goo' | 'confetti', pos: Vector3, c1 = 0xffffff, c2 = c1, n = 30, speed = 4, size = .18, up = 1) {
    const c = (x: number) => new Color4(((x >> 16) & 255) / 255, ((x >> 8) & 255) / 255, (x & 255) / 255, 1);
    this.queue[kind].push({ pos: pos.clone(), n, c1: c(c1), c2: c(c2), speed, size, up });
  }
  update() {
    for (const k of ['spark', 'goo', 'confetti'] as const) {
      const b = this.queue[k].shift(); if (!b) continue;
      const p = this.sys[k];
      (p.emitter as Vector3).copyFrom(b.pos);
      p.color1 = b.c1; p.color2 = b.c2;
      p.minSize = b.size * .5; p.maxSize = b.size * 1.4;
      p.minEmitPower = b.speed * .4; p.maxEmitPower = b.speed;
      p.direction1.set(-1, b.up * .2, -.6); p.direction2.set(1, b.up, .6);
      p.manualEmitCount = b.n;
    }
  }
}

/** Basis jedes 3D-Minispiels. Spiele setzen camPos/camAt, rufen score/pop/shake/flash und am Ende end(). */
export abstract class Arcade implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = 1.3;
  transient = true;
  fx!: Fx;
  protected hud!: HTMLElement;
  protected t = 0;
  protected points = 0;
  protected ended = false;
  /** Restzeit in Sekunden (Infinity = ohne Uhr) */
  protected left = Infinity;
  /** spielspezifische Zahlen fürs Ergebnis */
  protected extra: Record<string, number> = {};
  protected camPos = new Vector3(0, 3, 10);
  protected camAt = new Vector3(0, 1, 0);
  private shakeK = 0;
  private slowT = 0;
  private slowK = 1;
  private last = { s: '', l: '' };

  constructor(protected g: Game, protected def: MiniDef, protected adult: boolean, private done: (r: MiniResult) => void, clear = 0x0b0618) {
    this.scene = g.engine.newScene(clear);
    this.camera = g.engine.newCamera(this.scene, 55, .1, 220);
    this.fx = new Fx(this.scene, g.engine.mobile);
  }
  get name() { return this.adult && this.def.adultName ? this.def.adultName : this.def.name; }
  get icon() { return this.adult && this.def.adultIcon ? this.def.adultIcon : this.def.icon; }

  abstract build(): Promise<void>;
  /** Spiel-Logik je Bild (dt mit Zeitlupe) */
  protected abstract tick(dt: number, t: number): void;
  /** kurze Anleitung beim Start */
  protected abstract howto(): string;

  enter() {
    const best = this.g.save.data.best['mini_' + this.def.id] || 0;
    this.hud = el(`<div id="mg" class="arc">
      <button class="aQuit" aria-label="Aufgeben">✕</button>
      <div class="score"><div class="s"><small>${this.icon} Punkte</small><span class="aPts">0</span></div>${this.left < Infinity ? '<div class="s"><small>Zeit</small><span class="aTime"></span></div>' : ''}<div class="s aBest"><small>Rekord</small><span>${best}</span></div></div>
      <div class="aMeter"><i></i></div>
      <div class="judge"></div><div class="combo"></div>
      <div class="aHow"><b>${this.name}</b><span>${this.howto()}</span></div>
      <div class="aFlash"></div>
      <div class="aPad"><button data-a="left" aria-label="Links">◀</button><button data-a="right" aria-label="Rechts">▶</button></div>
      <button class="aBtn" data-a="confirm">${this.def.btn}</button>
    </div>`);
    document.body.appendChild(this.hud);
    if (this.def.noPad) this.hud.querySelector('.aPad')?.remove();
    const inp = this.g.engine.input;
    this.hud.querySelectorAll<HTMLButtonElement>('[data-a]').forEach((b) => {
      const a = b.dataset.a as 'left' | 'right' | 'confirm';
      const up = () => { b.classList.remove('on'); inp.touchUp(a); };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); b.classList.add('on'); inp.touchDown(a); });
      b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    });
    $<HTMLButtonElement>('.aQuit', this.hud).onclick = () => inp.tap('back');
    hints([['lr', 'Steuern'], ['a', this.def.btn.replace(/<[^>]+>/g, '')], ['b', 'Aufgeben']]);
    this.g.hud.show(false); this.g.touch.show(false);
    music(this.def.song || 'club');
    setTimeout(() => this.hud?.querySelector('.aHow')?.classList.add('off'), 3200);
  }
  exit() {
    this.hud?.remove();
    const inp = this.g.engine.input; (['left', 'right', 'confirm'] as const).forEach((a) => inp.touchUp(a));
    music('city');
  }

  /* ---------- Effekte ---------- */
  shake(k = .35) { this.shakeK = Math.max(this.shakeK, k); }
  slowmo(sec = .6, k = .3) { this.slowT = sec; this.slowK = k; }
  flash(color = '#fff', a = .6) {
    if (!this.hud) return;
    const f = $('.aFlash', this.hud); f.style.background = color; f.style.opacity = String(a);
    f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
  }
  judge(t: string, color = '#fff') {
    if (!this.hud) return;
    const j = $('.judge', this.hud); j.textContent = t; j.style.color = color;
    j.classList.remove('pop'); void j.offsetWidth; j.classList.add('pop');
  }
  combo(t: string) { if (this.hud) $('.combo', this.hud).textContent = t; }
  /** Leiste unter den Punkten (0–1), z. B. Druck, Turbo, Kraft */
  meter(v: number | null, color = '#ff5fd0') {
    if (!this.hud) return;
    const m = $('.aMeter', this.hud); m.style.display = v === null ? 'none' : 'block';
    if (v !== null) { const i = m.firstElementChild as HTMLElement; i.style.width = `${Math.max(0, Math.min(1, v)) * 100}%`; i.style.background = color; }
  }
  /** schwebender Text an einer Stelle der Welt (+10, „Perfekt!“) */
  pop(text: string, at: Vector3, color = '#ffd23b') {
    if (!this.hud || this.hud.querySelectorAll('.aPop').length > 8) return;
    const p = this.g.engine.project(at); if (p.behind) return;
    const e = el(`<div class="aPop" style="left:${p.x}px;top:${p.y}px;color:${color}">${text}</div>`);
    this.hud.appendChild(e); setTimeout(() => e.remove(), 900);
  }
  add(n: number, at?: Vector3, color?: string) {
    this.points = Math.max(0, this.points + n);
    if (at && n) this.pop((n > 0 ? '+' : '') + n, at, color || (n > 0 ? '#ffd23b' : '#ff6b6b'));
  }
  sfx(k: Sfx) { sfx(k); }

  /* ---------- Ablauf ---------- */
  update(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (inp.pressed('back') && !this.ended) { inp.consume('back'); inp.consume('menu'); this.end(true); return; }
    if (this.slowT > 0) { this.slowT -= dt; dt *= this.slowK; }
    this.t += dt;
    if (!this.ended) {
      if (this.left < Infinity) { this.left = Math.max(0, this.left - dt); if (this.left <= 0) { this.end(false); } }
      this.tick(dt, t);
    } else this.tick(dt * .4, t);
    this.fx.update();
    // Anzeige nur bei Änderung anfassen
    const s = String(this.points), l = this.left < Infinity ? String(Math.ceil(this.left)) : '';
    if (s !== this.last.s) { $('.aPts', this.hud).textContent = s; this.last.s = s; }
    if (l !== this.last.l) { const e = this.hud.querySelector('.aTime'); if (e) { e.textContent = l; e.classList.toggle('low', this.left <= 10); } this.last.l = l; }
    // Kamera mit Wackler
    this.shakeK = Math.max(0, this.shakeK - dt * 1.8);
    const k = this.shakeK * this.shakeK;
    this.camera.position.set(this.camPos.x + Math.sin(t * 61) * k, this.camPos.y + Math.cos(t * 53) * k, this.camPos.z);
    this.camera.setTarget(this.camAt);
  }

  /** Runde beenden: Rekord speichern, Ergebnis zeigen, dann zurück */
  protected end(quit: boolean) {
    if (this.ended) return;
    this.ended = true;
    const s = this.g.save.data, key = 'mini_' + this.def.id, old = s.best[key] || 0;
    const won = !quit && this.points >= this.def.goal;
    if (!quit) s.best[key] = Math.max(old, this.points);
    const rec = !quit && this.points > old;
    this.judge(quit ? 'Aufgegeben' : rec ? 'NEUER REKORD!' : won ? 'Geschafft!' : 'Vorbei!', rec || won ? '#ffd84a' : '#ff8ad8');
    this.combo(quit ? '' : `${this.points} Punkte · Ziel ${this.def.goal} · Rekord ${s.best[key]}`);
    if (!quit) { sfx(won ? 'win' : 'miss'); if (won) { sfx('cheer'); this.fx.burst('confetti', this.camAt.add(new Vector3(0, 2, 0)), 0xff3b8d, 0x3bd1ff, 120, 7, .22, 1.4); this.flash('#ffd23b', .35); } }
    this.hud.querySelector('.aBtn')?.remove(); this.hud.querySelector('.aPad')?.remove();
    setTimeout(() => this.done({ id: this.def.id, score: this.points, won, quit, best: s.best[key], extra: this.extra }), quit ? 250 : 2800);
  }
}

/** Zufall mit Startwert (gleiche Läufe beim Testen) */
export function rng(seed = 7) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
