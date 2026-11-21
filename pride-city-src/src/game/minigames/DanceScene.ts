/* Tanz-Battle im Club Prisma (3D): Pfeile fliegen auf einer Leuchtbahn heran, im Takt drücken.
   Deine Figur tanzt bei Treffern, Rex tanzt dagegen, die Menge jubelt. Drei Runden, wer mehr Punkte hat, gewinnt. */
import type { GameScene } from '../../engine/Engine';
import { Vector3, TransformNode, HemisphericLight, SpotLight, ShadowGenerator, Mesh, VertexData, Scene, type FreeCamera, type PBRMaterial, col } from '../../engine/bjs';
import { box, cyl, ground, ring, pbr, glow } from '../../engine/geo';
import type { Action } from '../../engine/Input';
import { Actor, playerLook, ROLE_LOOKS, type Look } from '../Actor';
import type { Game } from '../Game';
import { el, $, hints } from '../../ui/ui';
import { music, sfx, SONGS, playScore } from '../../engine/Audio';
import { type ShowSong, type PianoParts, type ChartNote, beatChart, HYMN, ytStart } from './showSongs';
import { NPCS } from '../story';

const LANES: Action[] = ['left', 'down', 'up', 'right'];
const ARROW = ['◀', '▼', '▲', '▶'];
const COLORS = [0xff3b8d, 0x3bd1ff, 0x5dff7a, 0xffd23b];
const SPEED = 9;          // Einheiten pro Sekunde
const HIT_Z = 2;          // Trefferlinie (Abstand zur Kamera-Seite)
const LEAD = 2.2;         // Sekunden Vorlauf bis zur Trefferlinie
const ROUNDS = 3;
const BEATS_PER_ROUND = 32;

interface Note { lane: number; t: number; mesh: Mesh; done: boolean; rx?: boolean }

export class DanceScene implements GameScene {
  scene: Scene;
  camera: FreeCamera;
  bloom = 1;
  transient = true;
  private me!: Actor;
  private rex!: Actor;
  private crowd: Actor[] = [];
  private notes: Note[] = [];
  private tiles: PBRMaterial[] = [];
  private beams: TransformNode[] = [];
  private hitRing: Mesh[] = [];
  private arrow: Mesh[] = [];
  private t = -LEAD - 1;
  private beat = 60 / SONGS.club.bpm;
  private score = 0; private rival = 0; private combo = 0; private best = 0;
  private hud!: HTMLElement;
  private ended = false;
  private round = 0;
  private start = 0;

  private chart: ChartNote[] | null = null;
  private dur = 0;
  private stopAudio: (() => void) | null = null;
  private clock: (() => number | null) | null = null;
  private show = false;
  constructor(private g: Game, private finish: (won: boolean, score: number) => void, private opt: { song?: ShowSong; parts?: PianoParts; show?: boolean; /** eigenes Aussehen (z. B. Drag-Look) */ look?: Look; /** Gegner*in statt Rex (Lip-Sync-Battle): Trefferquote und Punkte je Treffer */ rival?: { name: string; look: Look; skill: number; pts: number } } = {}) {
    const so = opt.song;
    this.show = !!opt.show;
    this.scene = g.engine.newScene(0x07040f);
    this.camera = g.engine.newCamera(this.scene, 52, .1, 200);
    if (so?.kind === 'piano' && opt.parts) { this.chart = opt.parts.notes.map((n) => ({ t: n.t, lane: n.lane })); this.dur = opt.parts.dur; }
    else if (so?.kind === 'yt' || so?.kind === 'beat') { this.chart = beatChart(HYMN.bpm, HYMN.len); this.dur = HYMN.len; this.beat = 60 / HYMN.bpm; }
  }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 18; sc.fogEnd = 46; sc.fogColor = col(0x07040f);
    const h = new HemisphericLight('h', new Vector3(0, 1, 0), sc); h.intensity = .9; h.diffuse = col(0xb09cff); h.groundColor = col(0x30204a);
    const spot = new SpotLight('spot', new Vector3(0, 12, 4), new Vector3(0, -12, -8).normalize(), .9, 2, sc); spot.intensity = 80; spot.range = 40;
    const sg = new ShadowGenerator(1024, spot); sg.usePercentageCloserFiltering = true;
    // Leuchtende Tanzfläche (Kacheln blinken im Takt)
    for (let x = -4; x <= 4; x++) for (let z = -7; z <= 1; z++) {
      const m = pbr(sc, 0x140c26, .3, .3, { emissive: COLORS[(x + z + 20) % 4], ei: .05 }); m.metadata = { c: COLORS[(x + z + 20) % 4] };
      const tile = box(sc, 1.9, .2, 1.9); tile.material = m; tile.position.set(x * 2, -.1, z * 2); tile.receiveShadows = true; this.tiles.push(m);
    }
    // DJ-Pult mit Nova
    const desk = box(sc, 4, 1.2, 1.2); desk.material = pbr(sc, 0x1a1030, .5, 0, { emissive: 0x6b2bff, ei: .4 }); desk.position.set(0, .6, -15);
    const nova = NPCS.find((n) => n.id === 'nova')!;
    // Lichtkegel
    COLORS.forEach((c, i) => {
      const node = new TransformNode('beam', sc); node.position.set(-9 + i * 6, 13, -10);
      const b = cyl(sc, 0, 2.2, 14, 24, false); b.position.y = -7; b.rotation.x = Math.PI; b.parent = node; b.material = glow(sc, c, 1, { alpha: .12, add: true, double: true });
      this.beams.push(node);
    });
    // Figuren
    const s = this.g.save.data;
    const rx = NPCS.find((n) => n.id === 'rex')!;
    const crowd = ['Female_Party_01', 'Male_Adult_07', 'Female_Adult_09', 'Male_Adult_04', 'Female_Party_02', 'Male_Adult_02', 'Female_Adult_04', 'Male_Adult_10'];
    // alle Figuren gleichzeitig laden (deutlich schneller als nacheinander)
    const [dj, me, rex, ...folk] = await Promise.all([
      Actor.create(sc, nova.look), Actor.create(sc, this.opt.look || (this.show ? { ...ROLE_LOOKS.luma } : playerLook(s))), Actor.create(sc, this.opt.rival?.look || rx.look),
      ...crowd.map((id) => Actor.create(sc, { body: id, rb: id, palette: 'rainbow', skin: 0 })),
    ]);
    dj.root.position.set(0, 0, -16.2); dj.play('dance1', 0); this.crowd.push(dj);
    this.me = me; this.me.root.position.set(-2.6, 0, -6);
    this.rex = rex; this.rex.root.position.set(2.6, 0, -6);
    if (this.show) { this.rex.root.visible = false; this.me.root.position.x = 0; }
    folk.forEach((a, i) => {
      const side = i < 4 ? -1 : 1;
      a.root.position.set(side * (7 + (i % 2) * 1.6), 0, -3 - (i % 4) * 2.4);
      a.root.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      a.play((['dance1', 'cheer', 'dance2', 'clap', 'dance3', 'cheer', 'dance1', 'dance2'] as const)[i], 0, .9 + (i % 3) * .1);
      this.crowd.push(a);
    });
    for (const m of sc.meshes) if ((m as Mesh & { _pcCast?: boolean })._pcCast) sg.addShadowCaster(m, false);
    // Bahn mit vier Spuren und Trefferlinie
    for (let i = 0; i < 4; i++) {
      const m = ground(sc, 1.1, 34); m.material = glow(sc, COLORS[i], 1, { alpha: .08 }); m.position.set(this.laneX(i), .02, HIT_Z - 15);
      const r = ring(sc, .42, .55, 32); r.material = glow(sc, COLORS[i], 1.4, { alpha: .9 }); r.position.set(this.laneX(i), .05, HIT_Z); this.hitRing.push(r);
    }
    this.makeNotes();
  }
  private laneX(i: number) { return (i - 1.5) * 1.25; }

  /* Feste, wiederholbare Choreografie: jede Runde dichter */
  private makeNotes() {
    this.noteSrc();
    if (this.chart) { for (const n of this.chart) this.addNote(n.lane, n.t); return; }
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let r = 0; r < ROUNDS; r++) {
      for (let b = 0; b < BEATS_PER_ROUND; b++) {
        const beatT = (r * (BEATS_PER_ROUND + 4) + b) * this.beat;
        const dens = [.55, .75, .95][r];
        if (b % 8 === 7 || rnd() > dens) continue;
        const lane = Math.floor(rnd() * 4);
        this.addNote(lane, beatT);
        if (r === 2 && b % 4 === 1) this.addNote((lane + 2) % 4, beatT + this.beat / 2);
      }
    }
  }
  /** Pfeil (flach auf dem Boden, Spitze nach -z), je Spur eine Farbe */
  private noteSrc() {
    const sc = this.scene;
    const pos = [0, 0, -.45, .42, 0, 0, -.42, 0, 0, -.16, 0, 0, .16, 0, 0, .16, 0, .4, -.16, 0, .4];
    const idx = [0, 2, 1, 3, 5, 4, 3, 6, 5];
    const nor: number[] = []; for (let i = 0; i < 7; i++) nor.push(0, 1, 0);
    this.arrow = COLORS.map((c, i) => {
      const m = new Mesh('arrow' + i, sc), vd = new VertexData(); vd.positions = pos; vd.indices = idx; vd.normals = nor; vd.applyToMesh(m);
      m.material = glow(sc, c, 1.6, { double: true }); m.setEnabled(false); return m;
    });
  }
  private roundLen() { return this.chart ? Math.max(10, this.dur / ROUNDS) : (BEATS_PER_ROUND + 4) * this.beat; }
  private addNote(lane: number, t: number) {
    const m = this.arrow[lane].clone('note'); m.setEnabled(true);
    m.rotation.y = [Math.PI / 2, Math.PI, 0, -Math.PI / 2][lane]; m.scaling.setAll(1.35);
    m.position.set(this.laneX(lane), .1, -100);
    this.notes.push({ lane, t, mesh: m, done: false });
  }

  enter() {
    this.hud = el(`<div id="mg"><div class="score"><div class="s"><small>Du</small><span id="sMe">0</span></div><div class="s" style="min-width:70px"><small>Runde</small><span id="sR">1/3</span></div><div class="s"><small>${this.show ? 'Ziel' : this.opt.rival?.name || 'Rex'}</small><span id="sRx">0</span></div></div>
      <div class="judge"></div>${this.opt.song?.kind === 'yt' ? '<div class="ytBox"></div>' : ''}${this.opt.song?.kind === 'piano' ? `<div class="songTag">🎹 ${this.opt.song.title}${this.opt.song.lic ? ` · <small>${this.opt.song.lic}</small>` : ''}</div>` : ''}<div class="combo"></div><div class="lanes">${ARROW.map((a, i) => `<button data-l="${i}">${a}</button>`).join('')}</div></div>`);
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
    const so = this.opt.song;
    if (so?.kind === 'piano' && this.opt.parts) this.stopAudio = playScore(this.opt.parts.mel, this.opt.parts.acc, 1.2 + LEAD);
    else if (so?.kind === 'yt') {
      this.judge('Video lädt …');
      ytStart($('.ytBox', this.hud), () => { if (!this.ended) this.end(false); })
        .then((y) => { if (this.ended) { y.stop(); return; } this.stopAudio = y.stop; this.clock = y.clock; this.judge('Bühne frei!', '#ff8ad8'); })
        .catch(() => { this.judge('YouTube geht gerade nicht – Beat läuft', '#ffd84a'); $('.ytBox', this.hud)?.remove(); this.start = performance.now() / 1000 + 1.2; setTimeout(() => { if (!this.ended) music('show'); }, 1200 + LEAD * 1000); });
    } else setTimeout(() => { if (!this.ended) music(so?.kind === 'beat' ? 'show' : 'club'); }, 1200 + LEAD * 1000);
  }
  exit() { this.hud?.remove(); this.stopAudio?.(); music('city'); }

  private judge(t: string, color = '#fff') {
    const j = $('.judge', this.hud); j.textContent = t; j.style.color = color;
    j.classList.remove('pop'); void j.offsetWidth; j.classList.add('pop');
  }

  private hit(lane: number) {
    if (this.ended || this.t < -LEAD) return;
    this.hitRing[lane].scaling.setAll(1.35);
    let best: Note | null = null, bd = 1;
    for (const n of this.notes) {
      if (n.done || n.lane !== lane) continue;
      const d = Math.abs(n.t - this.t);
      if (d < bd) { bd = d; best = n; }
    }
    if (!best || bd > .2) { this.combo = 0; this.judge('Daneben', '#ff6b6b'); sfx('miss'); return; }
    best.done = true; best.mesh.setEnabled(false);
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
    if (this.clock) { const ct = this.clock(); this.t = ct == null ? Math.min(this.t, -LEAD - .5) : ct; }
    else this.t = performance.now() / 1000 - this.start - LEAD;
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
      n.mesh.setEnabled(dz < 34 && dz > -3);
      if (this.t - n.t > .2) { n.done = true; n.mesh.setEnabled(false); this.combo = 0; this.judge('Verpasst', '#ff6b6b'); }
    }
    // Rivale punktet nach eigenem Rhythmus (fair: ~80–88 % Treffer)
    const round = Math.max(0, Math.floor(this.t / this.roundLen()));
    if (round !== this.round && round < ROUNDS) { this.round = round; $('#sR', this.hud).textContent = `${round + 1}/${ROUNDS}`; this.judge(`Runde ${round + 1}`, '#ff8ad8'); this.rex.play('cheer'); }
    for (const n of this.notes) if (!n.rx && this.t >= n.t) {
      n.rx = true;
      const h = Math.sin(n.t * 12.9898 + n.lane * 78.233) * 43758.5453; const frac = h - Math.floor(h);
      const rv = this.opt.rival;
      if (frac < (rv ? rv.skill + .03 * this.round : this.show ? .7 : .8 + .04 * this.round)) { this.rival += rv ? rv.pts : 85; if (this.rex.anim === 'idle') this.rex.play('dance1'); }
    }
    $('#sMe', this.hud).textContent = String(this.score);
    $('#sRx', this.hud).textContent = String(this.rival);
    $('.combo', this.hud).textContent = this.combo >= 4 ? `${this.combo}er Combo!` : '';
    if (!left && !this.ended && this.t > 0) this.end(false);

    // Show: Takt-Licht, Kamera wippt leicht
    const ph = ((this.t % this.beat) + this.beat) % this.beat / this.beat, pulse = Math.pow(1 - ph, 3);
    const beatN = Math.floor(this.t / this.beat);
    this.tiles.forEach((m, i) => { m.emissiveColor = col(m.metadata.c, ((i + beatN) % 7 === 0 ? .55 : .03) * (.4 + pulse * .9) * 2); });
    this.beams.forEach((b, i) => { b.rotation.z = Math.sin(t * .8 + i) * .5; b.rotation.x = Math.cos(t * .6 + i) * .3; });
    this.hitRing.forEach((r) => Vector3.LerpToRef(r.scaling, Vector3.One(), Math.min(1, dt * 10), r.scaling));
    this.camera.position.set(Math.sin(t * .3) * .6, 6.4 + pulse * .06, HIT_Z + 6.4);
    this.camera.setTarget(new Vector3(0, .4, -5.5));
    this.me.update(dt); this.rex.update(dt); this.crowd.forEach((a) => a.update(dt));
    if (this.me.anim === 'dance1' && this.combo === 0) this.me.play('idle');
  }

  private end(quit: boolean) {
    this.ended = true;
    music(null); this.stopAudio?.(); this.stopAudio = null;
    if (this.show) sfx('applause');
    const won = !quit && this.score >= this.rival;
    const s = this.g.save.data;
    s.best.dance = Math.max(s.best.dance || 0, this.score);
    this.judge(quit ? 'Aufgegeben' : this.show ? (won ? 'STANDING OVATIONS!' : 'Applaus!') : won ? 'GEWONNEN!' : `${this.opt.rival?.name || 'Rex'} gewinnt`, won ? '#ffd84a' : '#ff8ad8');
    if (won) { sfx('win'); sfx('cheer'); this.me.play('cheer'); this.rex.play('hit'); } else { this.rex.play('cheer'); }
    $('.combo', this.hud).textContent = quit ? '' : `Beste Combo: ${this.best} · Rekord: ${s.best.dance}`;
    setTimeout(() => this.finish(won, this.score), quit ? 300 : 2600);
  }
}
