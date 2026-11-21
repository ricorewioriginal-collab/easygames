/* Glitzer-Match in 3D (ersetzt das 2D-Spiel aus Gay Life!): Glitzersteine im Automaten tauschen und Ketten bilden.
   Antippen oder mit Pfeilen/Stick wählen, A tauscht mit dem Nachbarn. Drei gleiche in einer Reihe verschwinden,
   neue fallen nach, Kettenreaktionen zählen mehr. 25 Züge. */
import { Vector3, HemisphericLight, PointLight, Mesh, type InstancedMesh, Scene, col } from '../../engine/bjs';
import { box, cyl, sphere, torus, pbr, glow, planeZ, canvasTex } from '../../engine/geo';
import { CreateIcoSphere } from '@babylonjs/core/Meshes/Builders/icoSphereBuilder';
import { Arcade, rng } from './arcade';

const N = 7, S = .92;
const GEM = [0xff3b6b, 0xffd23b, 0x3ee69a, 0x3a9bff, 0xb56bff, 0xff8a3b];

export class GlitterMatch extends Arcade {
  private b: number[] = [];
  private cells: (InstancedMesh | null)[] = [];
  private src: Mesh[] = [];
  private cur = 24; private sel = -1;
  private moves = 25; private busy = 0; private chain = 0;
  private cursor!: Mesh; private selM!: Mesh;
  private rnd = rng(23);
  private onTap = (e: PointerEvent) => this.tap(e);

  protected howto() { return 'Stein antippen oder mit den Pfeilen wählen, A wählt bzw. tauscht mit dem Nachbarn. Drei gleiche verschwinden. 25 Züge!'; }

  async build() {
    const sc = this.scene;
    sc.fogMode = Scene.FOGMODE_LINEAR; sc.fogStart = 14; sc.fogEnd = 40; sc.fogColor = col(0x120a26);
    const h = new HemisphericLight('h', new Vector3(0, 1, .6), sc); h.intensity = .8; h.diffuse = col(0xf0e8ff); h.groundColor = col(0x2a1840);
    const pl = new PointLight('pl', new Vector3(0, 4, 5), sc); pl.intensity = 40; pl.range = 16;
    // Automat: Gehäuse mit Neonrahmen, Schriftzug, dunkle Spielfläche
    const cab = box(sc, N * S + 1.4, N * S + 2.8, 1); cab.material = pbr(sc, 0x1a1030, .4, .3); cab.position.set(0, N * S / 2 + .4, -.8);
    const screen = planeZ(sc, N * S + .3, N * S + .3); screen.material = pbr(sc, 0x0a0618, .3, 0, { emissive: 0x140a30, ei: 1 }); screen.position.set(0, N * S / 2 - .05, -.29);
    for (const [w, hgt, x, y] of [[N * S + .6, .08, 0, N * S + .12], [N * S + .6, .08, 0, -.22], [.08, N * S + .4, -(N * S + .5) / 2, N * S / 2 - .05], [.08, N * S + .4, (N * S + .5) / 2, N * S / 2 - .05]] as const) {
      const r = box(sc, w, hgt, .08); r.material = glow(sc, 0xff3fb0, 1.8); r.position.set(x, y, -.25);
    }
    const sign = planeZ(sc, 5, 1);
    sign.material = glow(sc, 0xffffff, 1.6, { tex: canvasTex(sc, 512, 112, (g) => { g.font = '900 56px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffd23b'; g.shadowBlur = 16; g.fillStyle = '#fff'; g.fillText('GLITZER-MATCH', 256, 56); }, true) });
    sign.position.set(0, N * S + .95, -.28);
    // Steine: sechs Formen und Farben (Instanzen)
    const shapes = [() => sphere(sc, .34, 14), () => box(sc, .5, .5, .5), () => CreateIcoSphere('ico', { radius: .38, subdivisions: 1 }, sc), () => cyl(sc, .3, .3, .5, 6), () => torus(sc, .26, .12, 18), () => cyl(sc, 0, .36, .6, 4)];
    this.src = shapes.map((f, i) => { const m = f(); m.material = pbr(sc, GEM[i], .15, .4, { emissive: GEM[i], ei: .35 }); m.position.y = -99; return m; });
    this.cursor = box(sc, S * .98, S * .98, .02); this.cursor.material = glow(sc, 0xffffff, 1.6, { alpha: .25 });
    this.selM = box(sc, S, S, .03); this.selM.material = glow(sc, 0xffd23b, 2, { alpha: .45 });
    // Spielfeld ohne fertige Dreier füllen
    do { this.b = []; for (let i = 0; i < N * N; i++) { let v; do v = Math.floor(this.rnd() * 6); while ((i % N >= 2 && this.b[i - 1] === v && this.b[i - 2] === v) || (i >= 2 * N && this.b[i - N] === v && this.b[i - 2 * N] === v)); this.b.push(v); } } while (!this.hasMove());
    for (let i = 0; i < N * N; i++) this.cells.push(this.make(i, this.b[i], 0));
    this.camPos.set(0, N * S / 2 + .2, 9.2); this.camAt.set(0, N * S / 2 + .3, 0);
  }
  override enter() { super.enter(); this.g.engine.canvas.addEventListener('pointerdown', this.onTap); }
  override exit() { this.g.engine.canvas.removeEventListener('pointerdown', this.onTap); super.exit(); }

  private xy(i: number) { return new Vector3(((i % N) - (N - 1) / 2) * S, (N - 1 - Math.floor(i / N)) * S + .35, 0); }
  private make(i: number, v: number, drop: number) {
    const m = this.src[v].createInstance('gem'); const p = this.xy(i); m.position.set(p.x, p.y + drop, 0);
    m.metadata = { v }; m.isPickable = true; return m;
  }
  private matches() {
    const m = new Set<number>();
    for (let r = 0; r < N; r++) for (let c = 0; c < N;) { const v = this.b[r * N + c]; let l = 1; while (c + l < N && this.b[r * N + c + l] === v) l++; if (v >= 0 && l >= 3) for (let k = 0; k < l; k++) m.add(r * N + c + k); c += l; }
    for (let c = 0; c < N; c++) for (let r = 0; r < N;) { const v = this.b[r * N + c]; let l = 1; while (r + l < N && this.b[(r + l) * N + c] === v) l++; if (v >= 0 && l >= 3) for (let k = 0; k < l; k++) m.add((r + k) * N + c); r += l; }
    return [...m];
  }
  private sw(i: number, j: number) { [this.b[i], this.b[j]] = [this.b[j], this.b[i]]; [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]]; }
  private hasMove() {
    for (let i = 0; i < N * N; i++) for (const j of [i % N < N - 1 ? i + 1 : -1, i + N < N * N ? i + N : -1]) {
      if (j < 0) continue; [this.b[i], this.b[j]] = [this.b[j], this.b[i]]; const ok = this.matches().length > 0; [this.b[i], this.b[j]] = [this.b[j], this.b[i]]; if (ok) return true;
    }
    return false;
  }
  private adj(i: number, j: number) { return (Math.abs(i - j) === 1 && Math.floor(i / N) === Math.floor(j / N)) || Math.abs(i - j) === N; }

  private choose(i: number) {
    if (this.busy || this.ended) return;
    this.cur = i;
    if (this.sel < 0 || this.sel === i) { this.sel = this.sel === i ? -1 : i; this.sfx('move'); return; }
    if (!this.adj(this.sel, i)) { this.sel = i; this.sfx('move'); return; }
    const a = this.sel; this.sel = -1;
    this.sw(a, i);
    if (!this.matches().length) { this.sw(a, i); this.sfx('miss'); this.judge('Kein Treffer', '#ff8a6b'); this.shake(.15); return; }
    this.moves--; this.chain = 0; this.sfx('whoosh'); this.busy = .22;
  }
  private tap(e: PointerEvent) {
    const pk = this.scene.pick(e.offsetX, e.offsetY, (m) => this.cells.includes(m as InstancedMesh));
    const i = pk?.pickedMesh ? this.cells.indexOf(pk.pickedMesh as InstancedMesh) : -1;
    if (i >= 0) this.choose(i);
  }

  /** Treffer auflösen: Steine platzen, Lücken füllen sich von oben */
  private resolve() {
    const m = this.matches();
    if (!m.length) {
      this.busy = 0;
      if (this.moves <= 0) { this.end(false); return; }
      if (!this.hasMove()) { this.judge('Neu gemischt!', '#9effc4'); for (let i = 0; i < N * N; i++) { this.cells[i]?.dispose(); this.b[i] = Math.floor(this.rnd() * 6); this.cells[i] = this.make(i, this.b[i], 4); } this.busy = .4; }
      return;
    }
    this.chain++;
    const pts = m.length * 10 * this.chain;
    const c = m.reduce((a, i) => a.addInPlace(this.xy(i)), new Vector3()).scale(1 / m.length);
    this.add(pts, c.add(new Vector3(0, 0, .5)));
    for (const i of m) { const p = this.xy(i); this.fx.burst('spark', p.add(new Vector3(0, 0, .3)), GEM[this.b[i]], 0xffffff, 10, 2.5, .18); this.cells[i]?.dispose(); this.cells[i] = null; this.b[i] = -1; }
    this.sfx(this.chain > 1 ? 'cheer' : 'coin');
    if (m.length >= 5 || this.chain >= 3) { this.flash('#ffd23b', .2); this.shake(.3); this.judge(this.chain >= 3 ? `${this.chain}er Kette!` : 'Glitzerbombe!', '#ffd84a'); this.fx.burst('confetti', c.add(new Vector3(0, 1, 1)), 0xff3b6b, 0x3a9bff, 50, 4, .2); }
    // Schwerkraft je Spalte
    for (let col2 = 0; col2 < N; col2++) {
      let w = N - 1;
      for (let r = N - 1; r >= 0; r--) { const i = r * N + col2; if (this.b[i] >= 0) { const j = w * N + col2; if (j !== i) { this.b[j] = this.b[i]; this.cells[j] = this.cells[i]; this.b[i] = -1; this.cells[i] = null; } w--; } }
      for (let r = w; r >= 0; r--) { const i = r * N + col2; this.b[i] = Math.floor(this.rnd() * 6); this.cells[i] = this.make(i, this.b[i], (w + 1) * S + 1); }
    }
    this.busy = .45;
  }

  protected tick(dt: number, t: number) {
    const inp = this.g.engine.input;
    if (!this.ended && !this.busy) {
      const r = Math.floor(this.cur / N), c = this.cur % N;
      if (inp.pressed('left') && c > 0) { this.cur--; this.sfx('move'); }
      if (inp.pressed('right') && c < N - 1) { this.cur++; this.sfx('move'); }
      if (inp.pressed('up') && r > 0) { this.cur -= N; this.sfx('move'); }
      if (inp.pressed('down') && r < N - 1) { this.cur += N; this.sfx('move'); }
      if (inp.pressed('confirm')) this.choose(this.cur);
    }
    if (this.busy) { this.busy -= dt; if (this.busy <= 0) this.resolve(); }
    // Steine gleiten an ihren Platz, drehen sich leicht und funkeln
    for (let i = 0; i < N * N; i++) {
      const m = this.cells[i]; if (!m) continue; const p = this.xy(i);
      m.position.x += (p.x - m.position.x) * Math.min(1, dt * 14); m.position.y += (p.y - m.position.y) * Math.min(1, dt * 10);
      m.rotation.y = Math.sin(t * 1.5 + i) * .5 + (i === this.sel ? t * 4 : 0);
      const s = i === this.sel ? 1.15 + Math.sin(t * 10) * .05 : 1; m.scaling.setAll(s);
    }
    this.camPos.z = this.g.engine.aspect < 1 ? 9.2 / Math.max(.42, this.g.engine.aspect) * .5 + 4 : 9.2;
    const cp = this.xy(this.cur); this.cursor.position.set(cp.x, cp.y, -.2);
    this.selM.setEnabled(this.sel >= 0); if (this.sel >= 0) { const sp = this.xy(this.sel); this.selM.position.set(sp.x, sp.y, -.22); }
    this.combo(`${this.moves} Züge übrig`);
  }
}
