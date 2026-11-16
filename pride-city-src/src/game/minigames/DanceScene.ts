/* Tanz-Battle im Club Prisma (3D): Pfeile fliegen auf einer Leuchtbahn heran, im Takt drücken.
   Deine Figur tanzt bei Treffern, Rex tanzt dagegen, die Menge jubelt. Drei Runden, wer mehr Punkte hat, gewinnt. */
import * as THREE from 'three';
import type { GameScene } from '../../engine/Engine';
import type { Action } from '../../engine/Input';
import { Actor, playerLook } from '../Actor';
import type { Game } from '../Game';
import { el, $, hints } from '../../ui/ui';
import { music, sfx, SONGS } from '../../engine/Audio';
import { NPCS } from '../story';

const LANES: Action[] = ['left', 'down', 'up', 'right'];
const ARROW = ['◀', '▼', '▲', '▶'];
const COLORS = [0xff3b8d, 0x3bd1ff, 0x5dff7a, 0xffd23b];
const SPEED = 9;          // Einheiten pro Sekunde
const HIT_Z = 2;          // Trefferlinie (Abstand zur Kamera-Seite)
const LEAD = 2.2;         // Sekunden Vorlauf bis zur Trefferlinie
const ROUNDS = 3;
const BEATS_PER_ROUND = 32;

interface Note { lane: number; t: number; mesh: THREE.Mesh; done: boolean }

export class DanceScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, 1, .1, 200);
  bloom = 1;
  private me!: Actor;
  private rex!: Actor;
  private crowd: Actor[] = [];
  private notes: Note[] = [];
  private tiles: THREE.Mesh[] = [];
  private beams: THREE.Mesh[] = [];
  private hitRing: THREE.Mesh[] = [];
  private t = -LEAD - 1;
  private beat = 60 / SONGS.club.bpm;
  private score = 0; private rival = 0; private combo = 0; private best = 0;
  private hud!: HTMLElement;
  private ended = false;
  private round = 0;
  private start = 0;

  constructor(private g: Game, private finish: (won: boolean, score: number) => void) {}

  async build() {
    const r = this.root;
    r.background = new THREE.Color(0x07040f);
    r.fog = new THREE.Fog(0x07040f, 18, 46);
    r.add(new THREE.HemisphereLight(0xb09cff, 0x30204a, 1.6));
    const spot = new THREE.SpotLight(0xffffff, 80, 40, .45, .6, 1.2); spot.position.set(0, 12, 4); spot.target.position.set(0, 0, -4); spot.castShadow = true; r.add(spot, spot.target);
    // Leuchtende Tanzfläche (Kacheln blinken im Takt)
    const tg = new THREE.BoxGeometry(1.9, .2, 1.9);
    for (let x = -4; x <= 4; x++) for (let z = -7; z <= 1; z++) {
      const m = new THREE.MeshStandardMaterial({ color: 0x140c26, emissive: new THREE.Color(COLORS[(x + z + 20) % 4]), emissiveIntensity: .05, roughness: .3, metalness: .3 });
      const tile = new THREE.Mesh(tg, m); tile.position.set(x * 2, -.1, z * 2); tile.receiveShadow = true; r.add(tile); this.tiles.push(tile);
    }
    // DJ-Pult mit Nova
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 1.2), new THREE.MeshStandardMaterial({ color: 0x1a1030, emissive: 0x6b2bff, emissiveIntensity: .4 }));
    desk.position.set(0, .6, -15); r.add(desk);
    const nova = NPCS.find((n) => n.id === 'nova')!;
    const dj = await Actor.create(nova.look); dj.root.position.set(0, 0, -16.2); dj.play('dance1', 0); r.add(dj.root); this.crowd.push(dj);
    // Lichtkegel
    const cone = new THREE.ConeGeometry(2.2, 14, 24, 1, true).translate(0, -7, 0);
    COLORS.forEach((c, i) => {
      const b = new THREE.Mesh(cone, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      b.position.set(-9 + i * 6, 13, -10); r.add(b); this.beams.push(b);
    });
    // Figuren
    const s = this.g.save.data;
    this.me = await Actor.create(playerLook(s));
    this.me.root.position.set(-2.6, 0, -6); r.add(this.me.root);
    const rx = NPCS.find((n) => n.id === 'rex')!;
    this.rex = await Actor.create(rx.look); this.rex.root.position.set(2.6, 0, -6); r.add(this.rex.root);
    const looks = ['rainbow', 'trans', 'bi', 'pan', 'gay', 'lesbian', 'bear', 'nonbinary'];
    const bodies = ['Man2', 'Man', 'Woman', 'Woman2', 'Hero'];
    for (let i = 0; i < 8; i++) {
      const a = await Actor.create({ body: bodies[i % 5], palette: looks[i], skin: (i * 2) % 6 });
      const side = i < 4 ? -1 : 1;
      a.root.position.set(side * (7 + (i % 2) * 1.6), 0, -3 - (i % 4) * 2.4);
      a.root.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      a.play(i % 2 ? 'cheer' : 'dance1', 0, .9 + (i % 3) * .1);
      r.add(a.root); this.crowd.push(a);
    }
    // Bahn mit vier Spuren und Trefferlinie
    const lane = new THREE.PlaneGeometry(1.1, 34);
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(lane, new THREE.MeshBasicMaterial({ color: COLORS[i], transparent: true, opacity: .08, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(this.laneX(i), .02, HIT_Z - 15); r.add(m);
      const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .55, 32), new THREE.MeshBasicMaterial({ color: COLORS[i], toneMapped: false, transparent: true, opacity: .9 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(this.laneX(i), .05, HIT_Z); r.add(ring); this.hitRing.push(ring);
    }
    this.makeNotes();
  }
  private laneX(i: number) { return (i - 1.5) * 1.25; }

  /* Feste, wiederholbare Choreografie: jede Runde dichter */
  private makeNotes() {
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const shape = new THREE.Shape(); shape.moveTo(0, .45); shape.lineTo(.42, 0); shape.lineTo(.16, 0); shape.lineTo(.16, -.4); shape.lineTo(-.16, -.4); shape.lineTo(-.16, 0); shape.lineTo(-.42, 0); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: .12, bevelEnabled: false });
    const mats = COLORS.map((c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(1.6), toneMapped: false }));
    const rot = [Math.PI / 2, Math.PI, 0, -Math.PI / 2];
    for (let r = 0; r < ROUNDS; r++) {
      for (let b = 0; b < BEATS_PER_ROUND; b++) {
        const beatT = (r * (BEATS_PER_ROUND + 4) + b) * this.beat;
        const dens = [.55, .75, .95][r];
        if (b % 8 === 7 || rnd() > dens) continue;
        const lane = Math.floor(rnd() * 4);
        this.addNote(lane, beatT, geo, mats, rot);
        if (r === 2 && b % 4 === 1) this.addNote((lane + 2) % 4, beatT + this.beat / 2, geo, mats, rot);
      }
    }
  }
  private addNote(lane: number, t: number, geo: THREE.BufferGeometry, mats: THREE.Material[], rot: number[]) {
    const m = new THREE.Mesh(geo, mats[lane]);
    m.rotation.x = -Math.PI / 2; m.rotation.z = rot[lane]; m.scale.setScalar(1.35);
    m.position.set(this.laneX(lane), .1, -100); this.root.add(m);
    this.notes.push({ lane, t, mesh: m, done: false });
  }

  enter() {
    this.hud = el(`<div id="mg"><div class="score"><div class="s"><small>Du</small><span id="sMe">0</span></div><div class="s" style="min-width:70px"><small>Runde</small><span id="sR">1/3</span></div><div class="s"><small>Rex</small><span id="sRx">0</span></div></div>
      <div class="judge"></div><div class="combo"></div><div class="lanes">${ARROW.map((a, i) => `<button data-l="${i}">${a}</button>`).join('')}</div></div>`);
    document.body.appendChild(this.hud);
    this.hud.querySelectorAll<HTMLButtonElement>('.lanes button').forEach((b) => {
      const l = +b.dataset.l!;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.classList.add('on'); this.hit(l); });
      const up = () => b.classList.remove('on'); b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up);
    });
    hints([['lr', 'Pfeile ◀ ▶'], ['dpad', 'Pfeile ▲ ▼'], ['b', 'Aufgeben']]);
    this.g.hud.show(false); this.g.touch.show(false);
    this.judge('Bereit?');
    music(null);
    this.start = performance.now() / 1000 + 1.2;
    setTimeout(() => { if (!this.ended) music('club'); }, 1200 + LEAD * 1000);
  }
  exit() { this.hud?.remove(); music('city'); }

  private judge(t: string, color = '#fff') {
    const j = $('.judge', this.hud); j.textContent = t; j.style.color = color;
    j.classList.remove('pop'); void j.offsetWidth; j.classList.add('pop');
  }

  private hit(lane: number) {
    if (this.ended || this.t < -LEAD) return;
    this.hitRing[lane].scale.setScalar(1.35);
    let best: Note | null = null, bd = 1;
    for (const n of this.notes) {
      if (n.done || n.lane !== lane) continue;
      const d = Math.abs(n.t - this.t);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best || bd > .2) { this.combo = 0; this.judge('Daneben', '#ff6b6b'); sfx('miss'); return; }
    best.done = true; best.mesh.visible = false;
    const pts = bd < .06 ? 100 : bd < .12 ? 70 : 40;
    this.combo++; this.best = Math.max(this.best, this.combo);
    this.score += pts + Math.min(50, this.combo * 2);
    this.judge(bd < .06 ? 'PERFEKT!' : bd < .12 ? 'Super' : 'Gut', bd < .06 ? '#ffd84a' : '#9effc4');
    sfx('hit');
    if (this.combo % 8 === 0) { this.me.play(['dance1', 'cheer', 'dance3'][(this.combo / 8) % 3 | 0] as 'dance1'); sfx('cheer'); }
    else if (this.me.anim === 'idle') this.me.play('dance1');
  }

  update(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.t = performance.now() / 1000 - this.start - LEAD;
    // Eingabe
    LANES.forEach((a, i) => { if (inp.pressed(a)) this.hit(i); });
    if (inp.pressed('back') && !this.ended) { inp.consume('back'); inp.consume('menu'); this.end(true); return; }
    // Noten bewegen, verpasste werten
    let left = 0;
    for (const n of this.notes) {
      if (n.done) continue;
      left++;
      const dz = (n.t - this.t) * SPEED;
      n.mesh.position.z = HIT_Z - dz;
      n.mesh.visible = dz < 34 && dz > -3;
      if (this.t - n.t > .2) { n.done = true; n.mesh.visible = false; this.combo = 0; this.judge('Verpasst', '#ff6b6b'); }
    }
    // Rivale punktet nach eigenem Rhythmus (fair: ~80–88 % Treffer)
    const round = Math.max(0, Math.floor(this.t / ((BEATS_PER_ROUND + 4) * this.beat)));
    if (round !== this.round && round < ROUNDS) { this.round = round; $('#sR', this.hud).textContent = `${round + 1}/${ROUNDS}`; this.judge(`Runde ${round + 1}`, '#ff8ad8'); this.rex.play('cheer'); }
    for (const n of this.notes) if (!n.mesh.userData.rx && this.t >= n.t) {
      n.mesh.userData.rx = 1;
      const h = Math.sin(n.t * 12.9898 + n.lane * 78.233) * 43758.5453; const frac = h - Math.floor(h);
      if (frac < .8 + .04 * this.round) { this.rival += 85; if (this.rex.anim === 'idle') this.rex.play('dance1'); }
    }
    $('#sMe', this.hud).textContent = String(this.score);
    $('#sRx', this.hud).textContent = String(this.rival);
    $('.combo', this.hud).textContent = this.combo >= 4 ? `${this.combo}er Combo!` : '';
    if (!left && !this.ended && this.t > 0) this.end(false);

    // Show: Takt-Licht, Kamera wippt leicht
    const ph = ((this.t % this.beat) + this.beat) % this.beat / this.beat, pulse = Math.pow(1 - ph, 3);
    const beatN = Math.floor(this.t / this.beat);
    this.tiles.forEach((m, i) => { (m.material as THREE.MeshStandardMaterial).emissiveIntensity = ((i + beatN) % 7 === 0 ? .55 : .03) * (.4 + pulse * .9); });
    this.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * .8 + i) * .5; b.rotation.x = Math.cos(t * .6 + i) * .3; });
    this.hitRing.forEach((r) => r.scale.lerp(new THREE.Vector3(1, 1, 1), Math.min(1, dt * 10)));
    this.camera.position.set(Math.sin(t * .3) * .6, 6.4 + pulse * .06, HIT_Z + 6.4);
    this.camera.lookAt(0, .4, -5.5);
    this.me.update(dt); this.rex.update(dt); this.crowd.forEach((a) => a.update(dt));
    if (this.me.anim === 'dance1' && this.combo === 0) this.me.play('idle');
  }

  private end(quit: boolean) {
    this.ended = true;
    music(null);
    const won = !quit && this.score >= this.rival;
    const s = this.g.save.data;
    s.best.dance = Math.max(s.best.dance || 0, this.score);
    this.judge(quit ? 'Aufgegeben' : won ? 'GEWONNEN!' : 'Rex gewinnt', won ? '#ffd84a' : '#ff8ad8');
    if (won) { sfx('win'); sfx('cheer'); this.me.play('cheer'); this.rex.play('hit'); } else { this.rex.play('cheer'); }
    $('.combo', this.hud).textContent = quit ? '' : `Beste Combo: ${this.best} · Rekord: ${s.best.dance}`;
    setTimeout(() => this.finish(won, this.score), quit ? 300 : 2600);
  }
}
