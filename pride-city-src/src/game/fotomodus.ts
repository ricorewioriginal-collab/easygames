/* Fotomodus: Die Zeit läuft weiter, die Figur bleibt stehen und posiert, die Kamera fliegt frei (Drohne) oder hält
   das Handy vor dich (Selfie). Filter siehst du sofort, beim Auslösen wird das Bild mit demselben Filter gerechnet und
   kann auf Glitzergram (gram.ts) gepostet werden. Ein Bedienkonzept für alle Geräte: Knopfleiste unten (Touch/Maus),
   Ziehen dreht die Kamera, Stick/WASD bewegt sie; Controller: A auslösen, B zurück, LB/RB Filter, X Pose, Y Modus. */
import { Vector3, type AbstractMesh } from '../engine/bjs';
import { el, esc, toast } from '../ui/ui';
import { sfx } from '../engine/Audio';
import type { Game } from './Game';
import type { CityScene } from './CityScene';
import type { Anim } from './Actor';
import { FILTERS, postShot, isParade, followers, fmtNum, activeBrief, type FilterId, type ShotCtx } from './gram';
import { hour } from './life';
import { muskel, tattoos } from './figur';
import { BARE_OUTFITS } from './koerper';

const POSES: Array<[Anim, string]> = [['idle', 'Lässig'], ['wave', 'Winken'], ['cheer', 'Jubeln'], ['talk', 'Erzählen'], ['dance1', 'Tanzen'], ['laugh', 'Lachen'], ['clap', 'Klatschen'], ['phone', 'Handy']];
/** CSS-Vorschau (das gespeicherte Bild rechnet dieselben Werte von Hand, siehe grade()) */
const CSS: Record<FilterId, string> = {
  none: '', regenbogen: 'saturate(1.25)', neon: 'saturate(1.7) contrast(1.15) brightness(1.05)', gold: 'sepia(.3) saturate(1.35) brightness(1.06)',
  vintage: 'sepia(.6) contrast(.92) brightness(1.04)', sw: 'grayscale(1) contrast(1.2)', glitzer: 'saturate(1.25) brightness(1.08)',
};
const TINT: Partial<Record<FilterId, string>> = {
  regenbogen: 'linear-gradient(160deg,#ff3b3b55,#ff9f1c44,#ffe14d33,#3ee69a33,#3bb0ff44,#b45cff55)',
  neon: 'linear-gradient(200deg,#ff2fd244,#00000000 45%,#2fd2ff44)', gold: 'linear-gradient(180deg,#ffb34744,#ff5e3a22)',
  vintage: 'radial-gradient(ellipse at center,#00000000 55%,#2a160aaa)',
};

export class PhotoMode {
  on = false;
  private ui: HTMLElement | null = null;
  private tint: HTMLElement | null = null;
  private filter = 0;
  private pose = 0;
  private selfie = false;
  private yaw = 0; private pitch = .2; private dist = 4.5;
  private pivot = new Vector3();
  private drag: { x: number; y: number } | null = null;
  private busy = false;
  private keep: AbstractMesh[] = [];
  constructor(private g: Game, private city: CityScene) {}

  start() {
    const c = this.city;
    if (this.on || c.driving) { if (c.driving) toast('Erst aussteigen, dann fotografieren.'); return; }
    this.on = true; c.photo = true;
    const p = c.player.root.position;
    this.pivot.set(p.x, p.y + 1.3, p.z);
    const cam = c.camera.position; this.yaw = Math.atan2(cam.x - p.x, cam.z - p.z); this.dist = Math.min(7, Math.max(2.5, Math.hypot(cam.x - p.x, cam.z - p.z)));
    this.g.hud.show(false); this.g.touch.show(false); this.g.hud.prompt(null);
    this.build(); this.applyFilter(); this.setPose(0);
    // Nahaufnahmen: Babylon prüft Figuren mit der Ruhepose-Box, aus der Nähe fiele sonst der Kopf heraus
    this.keep = c.player.root.getChildMeshes().filter((m) => !m.alwaysSelectAsActiveMesh);
    this.keep.forEach((m) => (m.alwaysSelectAsActiveMesh = true));
    c.cine = (dt) => this.cam(dt);
    sfx('phone');
  }
  stop() {
    if (!this.on) return;
    const c = this.city;
    this.on = false; c.photo = false; c.cine = null;
    this.ui?.remove(); this.ui = null; this.tint?.remove(); this.tint = null;
    this.g.engine.canvas.style.filter = '';
    c.player.play('idle');
    this.keep.forEach((m) => { if (!m.isDisposed()) m.alwaysSelectAsActiveMesh = false; }); this.keep = [];
    this.g.hud.show(true); this.g.touch.show(true);
  }

  private build() {
    const ui = (this.ui = el(`<div class="photoUi">
      <div class="phTop"><b>📸 Fotomodus</b><span class="phInfo"></span></div>
      <div class="phBar">
        <button data-a="fl">◀</button><button data-a="fname" class="wide"></button><button data-a="fr">▶</button>
        <button data-a="mode"></button><button data-a="pose"></button>
        <button data-a="zi">＋</button><button data-a="zo">－</button>
        <button data-a="shoot" class="shoot">📸</button><button data-a="x">✖</button>
      </div></div>`));
    this.tint = el('<div class="photoTint"></div>');
    document.body.appendChild(this.tint); document.body.appendChild(ui);
    ui.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('button')?.getAttribute('data-a'); if (!a) return;
      e.stopPropagation(); this.act(a);
    });
    // Ziehen auf dem freien Bild dreht die Kamera (Maus und Finger)
    const cv = this.g.engine.canvas;
    const down = (e: PointerEvent) => { if (!this.on || (e.target as HTMLElement).closest('.phBar')) return; this.drag = { x: e.clientX, y: e.clientY }; };
    const move = (e: PointerEvent) => { if (!this.drag) return; this.yaw -= (e.clientX - this.drag.x) * .008; this.pitch = Math.max(-.35, Math.min(1.2, this.pitch + (e.clientY - this.drag.y) * .006)); this.drag = { x: e.clientX, y: e.clientY }; };
    const up = () => { this.drag = null; };
    ui.addEventListener('pointerdown', down); cv.addEventListener('pointerdown', down); addEventListener('pointermove', move); addEventListener('pointerup', up);
    const old = ui.remove.bind(ui); ui.remove = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); cv.removeEventListener('pointerdown', down); old(); };
    this.label();
  }
  private label() {
    const ui = this.ui; if (!ui) return;
    const f = FILTERS[this.filter], b = activeBrief(this.g.save.data);
    ui.querySelector('[data-a=fname]')!.textContent = `${f.icon} ${f.name}`;
    ui.querySelector('[data-a=mode]')!.textContent = this.selfie ? '🤳 Selfie' : '🚁 Drohne';
    ui.querySelector('[data-a=pose]')!.textContent = `💃 ${POSES[this.pose][1]}`;
    ui.querySelector('.phInfo')!.textContent = `${fmtNum(followers(this.g.save.data))} Follower${b ? ` · Auftrag: ${b.icon} ${b.brand}` : ''}`;
  }
  private act(a: string) {
    if (this.busy) return;
    if (a === 'fl' || a === 'fr' || a === 'fname') { this.filter = (this.filter + (a === 'fl' ? -1 : 1) + FILTERS.length) % FILTERS.length; this.applyFilter(); sfx('tick' as never); }
    else if (a === 'mode') { this.selfie = !this.selfie; if (this.selfie) this.pitch = .1; }
    else if (a === 'pose') this.setPose(this.pose + 1);
    else if (a === 'zi') this.dist = Math.max(1.2, this.dist - .6);
    else if (a === 'zo') this.dist = Math.min(14, this.dist + .6);
    else if (a === 'shoot') void this.shoot();
    else if (a === 'x') this.stop();
    this.label();
  }
  private setPose(i: number) { this.pose = (i + POSES.length) % POSES.length; this.city.player.play(POSES[this.pose][0], .25); }
  private applyFilter() {
    const id = FILTERS[this.filter].id;
    this.g.engine.canvas.style.filter = CSS[id];
    if (this.tint) { this.tint.style.background = TINT[id] || ''; this.tint.classList.toggle('sparkle', id === 'glitzer'); }
  }

  /** Kamera im Bild-Takt (ersetzt die Folgekamera) und Eingaben von Tastatur/Controller */
  private cam(dt: number) {
    const c = this.city, inp = this.g.engine.input, pl = c.player.root;
    if (!this.busy) {
      if (inp.pressed('confirm')) { inp.consume('confirm'); void this.shoot(); }
      else if (inp.pressed('back') || inp.pressed('menu')) { inp.consume('back'); inp.consume('menu'); this.stop(); return; }
      else if (inp.pressed('tabL')) { inp.consume('tabL'); this.act('fl'); }
      else if (inp.pressed('tabR')) { inp.consume('tabR'); this.act('fr'); }
      else if (inp.pressed('attack')) { inp.consume('attack'); this.act('pose'); }
      else if (inp.pressed('weapon') || inp.pressed('phone')) { inp.consume('weapon'); inp.consume('phone'); this.act('mode'); }
    }
    this.yaw -= inp.look.x * .004; this.pitch = Math.max(-.35, Math.min(1.2, this.pitch + inp.look.y * .004));
    this.dist = Math.max(1.2, Math.min(14, this.dist + inp.zoom * .5));
    const p = pl.position;
    if (this.selfie) {
      // Handy auf Armlänge vor dem Gesicht, die Figur schaut in die Kamera
      const d = Math.min(this.dist, 2.2);
      this.pivot.set(p.x, p.y + 1.55, p.z);
      pl.rotation.y = this.yaw;
      const cp = c.camera.position;
      cp.set(p.x + Math.sin(this.yaw) * d, p.y + 1.55 + Math.sin(this.pitch) * d * .6, p.z + Math.cos(this.yaw) * d);
      c.camera.setTarget(this.pivot);
      return;
    }
    // Drohne: Stick bewegt den Blickpunkt (höchstens 25 m von der Figur weg), Ziehen dreht, ＋/－ zoomt
    const mx = inp.move.x, my = inp.move.y;
    if (mx || my) {
      const f = dt * 6, fx = -Math.sin(this.yaw), fz = -Math.cos(this.yaw);   // wie movePlayer: relativ zur Kamera
      this.pivot.x += (fx * my - fz * mx) * f; this.pivot.z += (fz * my + fx * mx) * f;
      if (inp.held('rise')) this.pivot.y += f; if (inp.held('sink')) this.pivot.y -= f;
      const dx = this.pivot.x - p.x, dz = this.pivot.z - p.z, l = Math.hypot(dx, dz);
      if (l > 25) { this.pivot.x = p.x + dx / l * 25; this.pivot.z = p.z + dz / l * 25; }
    }
    this.pivot.y = Math.max(.3, Math.min(p.y + 12, this.pivot.y));
    const cp = c.camera.position;
    cp.set(this.pivot.x + Math.sin(this.yaw) * Math.cos(this.pitch) * this.dist, Math.max(.25, this.pivot.y + Math.sin(this.pitch) * this.dist), this.pivot.z + Math.cos(this.yaw) * Math.cos(this.pitch) * this.dist);
    c.camera.setTarget(this.pivot);
  }

  /** Was ist im Bild? Ort, Leute, du selbst */
  private context(): ShotCtx {
    const c = this.city, s = this.g.save.data, h = hour(s), cam = c.camera.position;
    const look = this.selfie ? c.player.root.position : this.pivot;
    let spot: string | null = null, spotName = 'Rainbow City', bd = 1e9;
    for (const q of c.world.pois) { const d = Math.hypot(q.x - look.x, q.z - look.z); if (d < Math.max(14, q.r * 3) && d < bd) { bd = d; spot = q.id; spotName = q.name; } }
    const me = this.inView(c.player.root.position, 1.2) && Vector3.Distance(cam, c.player.root.position) < 22;
    const lk = c.player.look;
    return {
      spot, spotName, hour: h, day: s.day, people: c.peopleInView(), me, selfie: this.selfie && me, filter: FILTERS[this.filter].id,
      bare: !!lk.outfit && BARE_OUTFITS.has(lk.outfit), mus: muskel(s), tattoos: tattoos(s).length,
      parade: isParade(s, h), rainbow: c.weather.rainbow, rain: c.weather.rain > .2, x: look.x, z: look.z,
    };
  }
  private inView(p: Vector3, up = 1) {
    const q = this.g.engine.project({ x: p.x, y: p.y + up, z: p.z });
    return !q.behind && q.x > 0 && q.x < innerWidth && q.y > 0 && q.y < innerHeight;
  }

  private async shoot() {
    if (this.busy) return;
    this.busy = true;
    const ctx = this.context();
    sfx('coin');
    const flash = el('<div class="photoFlash"></div>'); document.body.appendChild(flash); setTimeout(() => flash.remove(), 450);
    const img = await this.grab(FILTERS[this.filter].id).catch(() => '');
    if (!img) { this.busy = false; toast('Das Foto ist leider nichts geworden.'); return; }
    this.review(img, ctx);
  }
  /** Bild direkt nach dem nächsten Zeichnen abgreifen und mit dem Filter rechnen (640 px breit) */
  private grab(f: FilterId): Promise<string> {
    const sc = this.city.scene, cv = this.g.engine.canvas;
    return new Promise((res, rej) => {
      sc.onAfterRenderObservable.addOnce(() => {
        try {
          const w = 640, h = Math.round(w * cv.height / Math.max(1, cv.width));
          const out = document.createElement('canvas'); out.width = w; out.height = h;
          const x = out.getContext('2d')!; x.drawImage(cv, 0, 0, w, h);
          grade(x, w, h, f);
          res(out.toDataURL('image/jpeg', .74));
        } catch (e) { rej(e); }
      });
    });
  }
  private review(img: string, ctx: ShotCtx) {
    const s = this.g.save.data, b = activeBrief(s), why = b?.check(ctx, s);
    const box = el(`<div class="photoReview"><div class="prCard"><img src="${img}" alt="Foto"><p><b>📍 ${esc(ctx.spotName)}</b> · ${ctx.people} ${ctx.people === 1 ? 'Person' : 'Leute'} im Bild${ctx.me ? ' · du bist drauf' : ''}</p>
      ${b ? `<p class="${why ? 'bad' : 'good'}">${b.icon} ${esc(b.brand)}: ${why ? esc(why) : 'passt! Auftrag erfüllt, sobald du postest.'}</p>` : ''}
      <input class="prCap" maxlength="80" placeholder="Bildunterschrift (optional)">
      <div class="prBtns"><button data-a="post" class="shoot">🌈 Auf Glitzergram posten</button><button data-a="again">↺ Nochmal</button></div></div></div>`);
    document.body.appendChild(box);
    const done = () => { box.remove(); this.busy = false; };
    (box.querySelector('[data-a=post]') as HTMLButtonElement).focus();
    box.addEventListener('keydown', (e) => e.stopPropagation());
    box.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('button')?.getAttribute('data-a'); if (!a) return;
      if (a === 'again') { done(); return; }
      const cap = (box.querySelector('.prCap') as HTMLInputElement).value.trim().slice(0, 80);
      const r = postShot(s, ctx, img, cap);
      this.g.save.write(); this.city.refreshHud();
      sfx('win');
      done();
      this.g.hud.banner(`❤️ ${fmtNum(r.likes)} Likes`, `+${fmtNum(r.gain)} Follower · jetzt ${fmtNum(followers(s))}${r.brief ? ` · ${r.brief.icon} Auftrag erfüllt: +${r.brief.pay} €` : ''}`, 'good', 4200);
      this.label();
    });
  }
}

/** Filter von Hand rechnen (gleiche Wirkung wie die CSS-Vorschau, klappt auch ohne ctx.filter) */
export function grade(x: CanvasRenderingContext2D, w: number, h: number, f: FilterId) {
  if (f === 'none') return;
  const im = x.getImageData(0, 0, w, h), d = im.data;
  const sat = { regenbogen: 1.25, neon: 1.7, gold: 1.35, vintage: 1, sw: 0, glitzer: 1.25 }[f], con = { neon: 1.15, sw: 1.2, vintage: .92 }[f as 'neon'] || 1;
  const bri = { neon: 1.05, gold: 1.06, vintage: 1.04, glitzer: 1.08 }[f as 'neon'] || 1, sep = { gold: .3, vintage: .6 }[f as 'gold'] || 0;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    if (sep) { const sr = r * .393 + g * .769 + b * .189, sg = r * .349 + g * .686 + b * .168, sb = r * .272 + g * .534 + b * .131; r += (sr - r) * sep; g += (sg - g) * sep; b += (sb - b) * sep; }
    const l = r * .2126 + g * .7152 + b * .0722; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
    r = ((r * bri) - 128) * con + 128; g = ((g * bri) - 128) * con + 128; b = ((b * bri) - 128) * con + 128;
    d[i] = r < 0 ? 0 : r > 255 ? 255 : r; d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  x.putImageData(im, 0, 0);
  if (f === 'regenbogen') {
    const gr = x.createLinearGradient(0, 0, w, h); ['#ff3b3b', '#ff9f1c', '#ffe14d', '#3ee69a', '#3bb0ff', '#b45cff'].forEach((c, i) => gr.addColorStop(i / 5, c));
    x.globalAlpha = .22; x.globalCompositeOperation = 'soft-light'; x.fillStyle = gr; x.fillRect(0, 0, w, h);
  } else if (f === 'neon') {
    const gr = x.createLinearGradient(w, 0, 0, h); gr.addColorStop(0, '#ff2fd2'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#2fd2ff');
    x.globalAlpha = .25; x.globalCompositeOperation = 'screen'; x.fillStyle = gr; x.fillRect(0, 0, w, h);
  } else if (f === 'gold') {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffb347'); gr.addColorStop(1, '#ff5e3a');
    x.globalAlpha = .18; x.globalCompositeOperation = 'soft-light'; x.fillStyle = gr; x.fillRect(0, 0, w, h);
  } else if (f === 'vintage') {
    const gr = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .7); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(42,22,10,.75)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  } else if (f === 'glitzer') {
    x.globalCompositeOperation = 'screen';
    for (let i = 0; i < 70; i++) { const px = (i * 7919 % 997) / 997 * w, py = (i * 104729 % 991) / 991 * h, r = 1 + (i % 4); x.globalAlpha = .5 + (i % 3) * .2; x.fillStyle = ['#ffffff', '#ffd6f6', '#fff2b0'][i % 3]; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); if (i % 5 === 0) { x.fillRect(px - r * 4, py - .5, r * 8, 1); x.fillRect(px - .5, py - r * 4, 1, r * 8); } }
  }
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  // kleines Wasserzeichen
  x.font = '600 14px system-ui, sans-serif'; x.fillStyle = 'rgba(255,255,255,.8)'; x.fillText('🌈 Glitzergram · Pride City', 10, h - 10);
}
