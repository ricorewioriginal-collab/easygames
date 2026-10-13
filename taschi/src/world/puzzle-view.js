// 3D presentation and interaction for the environmental puzzles. All clues
// are visible in the world (dots on pillars, mural plaques, glowing leaves,
// the light beam) – the dialog never spells out the solution.
import { THREE } from '../engine/three.js';
import { Builder, matrix, lumpy } from '../engine/geometry.js';
import { envMaterial, glowMaterial } from '../engine/materials.js';
import { clueTexture } from '../engine/textures.js';
import * as PZ from '../logic/puzzles.js';

const SYM_COLORS = ['#f0a030', '#3a7fd0', '#4fb86a', '#c58af0'];
function drawSymbol(x, i, cx = 64, cy = 64, r = 34) {
  x.fillStyle = SYM_COLORS[i]; x.strokeStyle = SYM_COLORS[i]; x.lineWidth = 8;
  x.beginPath();
  if (i === 0) { x.arc(cx, cy, r * 0.45, 0, Math.PI * 2); x.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; x.moveTo(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.stroke(); }
  else if (i === 1) { for (let k = 0; k < 2; k++) { x.moveTo(cx - r, cy - 8 + k * 18); for (let s = 0; s <= 8; s++) x.lineTo(cx - r + s * r / 4, cy - 8 + k * 18 + Math.sin(s * 1.6) * 8); } x.stroke(); }
  else if (i === 2) { x.ellipse(cx, cy, r * 0.5, r * 0.9, 0.6, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - r * 0.5, cy + r * 0.6); x.lineTo(cx + r * 0.45, cy - r * 0.6); x.stroke(); }
  else { for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * 0.42 : r, a = k / 10 * Math.PI * 2 - Math.PI / 2; k ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
}

export class PuzzleView {
  // area: { x, z, kind, key }, y: ground height, seed, difficulty, solved
  constructor(area, y, { seed, difficulty = 0, solved = false, palette = {} }) {
    this.area = area; this.y = y; this.kind = area.kind; this.solved = solved;
    this.state = PZ.generatePuzzle(this.kind, seed, difficulty);
    this.group = new THREE.Group(); this.group.position.set(area.x, y, area.z);
    this.cell = this.kind === 'maze' ? 2.2 : 2;
    this.interact = []; this.blockers = [];
    this.palette = palette;
    this.t = 0;
    this.build();
    if (solved) this.showSolved(true);
  }
  // local grid cell -> world
  cw(ix, iz, w = this.state.w, h = this.state.h) { const c = this.cell; return [this.area.x + (ix - (w - 1) / 2) * c, this.area.z + (iz - (h - 1) / 2) * c]; }
  lw(ix, iz, w = this.state.w, h = this.state.h) { const c = this.cell; return [(ix - (w - 1) / 2) * c, (iz - (h - 1) / 2) * c]; }
  build() {
    const s = this.state, b = new Builder(), g = this.group;
    const rock = this.palette.rock || 0x8a8f86;
    // base platform
    const size = this.kind === 'maze' ? (s.w + 1) * this.cell : this.kind === 'plates' || this.kind === 'ice' || this.kind === 'crystals' ? (Math.max(s.w, s.h) + 1) * this.cell : 14;
    b.box(size + 0.6, 0.3, size + 0.6, this.kind === 'ice' ? 0xcfe8f4 : 0xb8b0a0, 0, 0.0, 0);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { b.cyl(0.35, 0.4, 2.2, 0xd8d0c0, sx * (size / 2 + 0.1), 1.1, sz * (size / 2 + 0.1), 8); b.sphere(0.32, 0xf5cd77, sx * (size / 2 + 0.1), 2.35, sz * (size / 2 + 0.1), 1, 1, 1, 8); }
    this.size = size;
    const seal = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 8, 30), glowMaterial(0xffd35a, 0.25));
    seal.rotation.x = Math.PI / 2; seal.position.set(0, 0.3, -size / 2 - 1.4); g.add(seal); this.seal = seal;
    switch (this.kind) {
      case 'plates': case 'ice': {
        for (const k of s.walls) {
          const [x, z] = k.split(',').map(Number);
          if (x < 0 || z < 0 || x >= s.w || z >= s.h) continue;
          const [lx, lz] = this.lw(x, z);
          b.add(lumpy(new THREE.DodecahedronGeometry(0.85, 0), 0.12, x * 7 + z), rock, matrix(lx, 0.7, lz, 0, x + z, 0, 1, 1.1, 1), { shade: 0.3 });
          const [wx, wz] = this.cw(x, z);
          this.blockers.push([wx, wz, 0.9]);
        }
        this.plateMeshes = s.plates.map(([x, z]) => {
          const [lx, lz] = this.lw(x, z);
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16), new THREE.MeshLambertMaterial({ color: this.kind === 'ice' ? 0x9fe0ff : 0x6a8a9a, emissive: 0x2a6080, emissiveIntensity: 0.3 }));
          m.position.set(lx, 0.2, lz); g.add(m); return m;
        });
        const blockGeo = this.kind === 'ice' ? new THREE.BoxGeometry(1.5, 1.5, 1.5) : lumpy(new THREE.IcosahedronGeometry(0.85, 1), 0.12, 3);
        const blockMat = this.kind === 'ice' ? new THREE.MeshPhongMaterial({ color: 0xcff0ff, shininess: 90, transparent: true, opacity: 0.88 }) : new THREE.MeshLambertMaterial({ color: 0x7a9a5a });
        this.blockMeshes = s.blocks.map((blk, i) => {
          const m = new THREE.Mesh(blockGeo, blockMat); m.castShadow = true; g.add(m);
          if (this.kind !== 'ice') { const moss = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 4, 0, Math.PI * 2, 0, 1.1), new THREE.MeshLambertMaterial({ color: 0x4f8a3a })); moss.position.y = 0.5; m.add(moss); }
          m.userData.idx = i; return m;
        });
        // reset lever
        const [lx, lz] = [size / 2 + 1.4, 0];
        b.box(0.6, 0.5, 0.6, 0x5a5d66, lx, 0.25, lz); b.cyl(0.07, 0.07, 1.2, 0x8a6444, lx, 0.9, lz, 6); b.sphere(0.15, 0xd84a3a, lx, 1.5, lz, 1, 1, 1, 8);
        this.interact.push({ id: 'pz:lever', kind: 'puzzle', act: 'reset', x: this.area.x + lx, z: this.area.z + lz, r: 1.5, label: 'Rücksetzhebel', prompt: 'Zurücksetzen' });
        this.blockers.push([this.area.x + lx, this.area.z + lz, 0.5]);
        this.syncBlocks(true);
        break;
      }
      case 'switches': {
        const n = s.n, R = 4.6;
        this.lamps = [];
        for (let i = 0; i < n; i++) {
          const a = s.ring ? i / n * Math.PI * 2 : Math.PI + (i / (n - 1) - 0.5) * Math.PI * 0.9;
          const lx = Math.sin(a) * R, lz = Math.cos(a) * R * (s.ring ? 1 : 0.55) - (s.ring ? 0 : -1.5);
          b.cyl(0.3, 0.4, 1.4, 0x8a8f99, lx, 0.7, lz, 8); b.box(0.8, 0.12, 0.8, 0x5a5d66, lx, 1.45, lz);
          const glass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.6), new THREE.MeshLambertMaterial({ color: 0xfff0c0, emissive: 0xffc040, emissiveIntensity: 0 }));
          glass.position.set(lx, 1.85, lz); g.add(glass);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.4, 4), new THREE.MeshLambertMaterial({ color: 0x3a3d45 })); roof.position.set(lx, 2.4, lz); roof.rotation.y = Math.PI / 4; g.add(roof);
          this.lamps.push(glass);
          this.interact.push({ id: 'pz:lamp' + i, kind: 'puzzle', act: 'press', idx: i, x: this.area.x + lx, z: this.area.z + lz, r: 1.4, label: 'Laterne ' + (i + 1), prompt: 'Schalten' });
          this.blockers.push([this.area.x + lx, this.area.z + lz, 0.45]);
        }
        this.syncLamps();
        break;
      }
      case 'order': {
        const n = s.n;
        this.plates = [];
        for (let i = 0; i < n; i++) {
          const lx = (i - (n - 1) / 2) * 2.4, lz = 1;
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 6), new THREE.MeshLambertMaterial({ color: 0x8a9aa8, emissive: 0x4080ff, emissiveIntensity: 0 }));
          m.position.set(lx, 0.22, lz); g.add(m); this.plates.push(m);
          // clue pillar with dots
          const tex = clueTexture((x) => { x.fillStyle = '#3a2f2a'; const d = s.dots[i]; for (let k = 0; k < d; k++) { const cx = 64 + ((k % 3) - 1) * 30, cy = 40 + Math.floor(k / 3) * 34; x.beginPath(); x.arc(cx, cy, 11, 0, Math.PI * 2); x.fill(); } }, 'order' + s.dots[i]);
          b.box(0.7, 2.2, 0.7, 0xd8d0c0, lx, 1.1, lz - 2.2);
          const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: tex })); plaque.position.set(lx, 1.7, lz - 1.84); g.add(plaque);
          this.blockers.push([this.area.x + lx, this.area.z + lz - 2.2, 0.5]);
          this.interact.push({ id: 'pz:pillar' + i, kind: 'puzzle', act: 'look', x: this.area.x + lx, z: this.area.z + lz - 1.2, r: 0.8, label: 'Säule', prompt: 'Ansehen', hidden: true });
        }
        this.stepZones = s.dots.map((_, i) => [this.area.x + (i - (n - 1) / 2) * 2.4, this.area.z + 1, 0.85]);
        this.inZone = -1;
        break;
      }
      case 'runes': {
        const n = s.n;
        this.stones = [];
        for (let i = 0; i < n; i++) {
          const lx = (i - (n - 1) / 2) * 3, lz = 0.5;
          const stone = new THREE.Group(); stone.position.set(lx, 0, lz); g.add(stone);
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 1.6, 4), new THREE.MeshLambertMaterial({ color: 0xb8b0a0 })); body.position.y = 0.8; body.rotation.y = Math.PI / 4; stone.add(body);
          const faces = [];
          for (let k = 0; k < 4; k++) {
            const tex = clueTexture((x) => drawSymbol(x, k), 'rune' + k);
            const f = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), new THREE.MeshBasicMaterial({ map: tex }));
            const a = k * Math.PI / 2; f.position.set(Math.sin(a) * 0.56, 0.95, Math.cos(a) * 0.56); f.rotation.y = a; stone.add(f); faces.push(f);
          }
          this.stones.push(stone);
          // mural behind the stone shows the target symbol
          const mural = clueTexture((x) => { x.fillStyle = '#d8c8a0'; x.fillRect(10, 10, 108, 108); drawSymbol(x, s.target[i]); }, 'mural' + s.target[i]);
          b.box(1.6, 2.6, 0.3, 0xa89a80, lx, 1.3, lz - 3.2);
          const mm = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: mural })); mm.position.set(lx, 1.7, lz - 3.03); g.add(mm);
          this.blockers.push([this.area.x + lx, this.area.z + lz, 0.7], [this.area.x + lx, this.area.z + lz - 3.2, 0.8]);
          this.interact.push({ id: 'pz:rune' + i, kind: 'puzzle', act: 'rotate', idx: i, x: this.area.x + lx, z: this.area.z + lz + 1.2, r: 1.2, label: 'Runenstein', prompt: 'Drehen' });
        }
        this.syncRunes(true);
        break;
      }
      case 'crystals': {
        const [sx, sz] = this.lw(s.source.x, s.source.y);
        b.cyl(0.4, 0.5, 2.2, 0xd8d0c0, sx, 1.1, sz, 8);
        const src = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), glowMaterial(0xfff2a0, 0.95)); src.position.set(sx, 2.3, sz); g.add(src);
        this.blockers.push([this.area.x + sx, this.area.z + sz, 0.6]);
        const [tx, tz] = this.lw(s.target.x, s.target.y);
        this.targetMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshLambertMaterial({ color: 0x9ef0ff, emissive: 0x3ab0ff, emissiveIntensity: 0.2 }));
        this.targetMesh.position.set(tx, 1.2, tz); this.targetMesh.scale.y = 1.6; g.add(this.targetMesh);
        b.cyl(0.5, 0.6, 0.6, 0xd8d0c0, tx, 0.3, tz, 8);
        this.blockers.push([this.area.x + tx, this.area.z + tz, 0.6]);
        this.mirrors = s.mirrors.map((m, i) => {
          const [mx, mz] = this.lw(m.x, m.y);
          const grp = new THREE.Group(); grp.position.set(mx, 0, mz); g.add(grp);
          const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.8, 8), new THREE.MeshLambertMaterial({ color: 0x8a6444 })); stand.position.y = 0.4; grp.add(stand);
          const mirror = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.1), new THREE.MeshPhongMaterial({ color: 0xd8f0ff, shininess: 120, specular: 0xffffff })); mirror.position.y = 1.3; grp.add(mirror);
          const frame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 0.06), new THREE.MeshLambertMaterial({ color: 0xc8a050 })); frame.position.set(0, 1.3, -0.06); grp.add(frame);
          this.blockers.push([this.area.x + mx, this.area.z + mz, 0.55]);
          this.interact.push({ id: 'pz:mirror' + i, kind: 'puzzle', act: 'mirror', idx: i, x: this.area.x + mx, z: this.area.z + mz + 1.1, r: 1.0, label: 'Spiegel', prompt: 'Drehen' });
          return grp;
        });
        this.beam = new THREE.Group(); g.add(this.beam);
        this.syncMirrors();
        break;
      }
      case 'maze': {
        const c = this.cell, hedge = 0x3f7a3a;
        const W = s.w, H = s.h;
        const wallAt = (x1, z1, x2, z2) => { const len = Math.hypot(x2 - x1, z2 - z1); b.box(Math.abs(x2 - x1) > 0.1 ? len + 0.4 : 0.5, 1.9, Math.abs(z2 - z1) > 0.1 ? len + 0.4 : 0.5, hedge, (x1 + x2) / 2, 0.95, (z1 + z2) / 2, 0, { jitter: 0.12 }); };
        const segs = [];
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const cell = s.walls[x + ',' + y];
          const [lx, lz] = this.lw(x, y, W, H);
          if (cell.n && !(x === s.start[0] && y === s.start[1] && false)) segs.push([lx - c / 2, lz - c / 2, lx + c / 2, lz - c / 2]);
          if (cell.w) segs.push([lx - c / 2, lz - c / 2, lx - c / 2, lz + c / 2]);
          if (y === H - 1 && cell.s && !(x === s.start[0])) segs.push([lx - c / 2, lz + c / 2, lx + c / 2, lz + c / 2]);
          if (x === W - 1 && cell.e) segs.push([lx + c / 2, lz - c / 2, lx + c / 2, lz + c / 2]);
        }
        for (const sg of segs) wallAt(...sg);
        this.segs = segs.map(([a, b2, cc, d]) => [a + this.area.x, b2 + this.area.z, cc + this.area.x, d + this.area.z]);
        // glowing leaves at junctions on the true path
        for (const [x, y] of s.glow) { const [lx, lz] = this.lw(x, y, W, H); const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), glowMaterial(0xc8ff7a, 0.85)); leaf.position.set(lx, 1.9, lz); leaf.scale.set(1, 0.4, 1.6); g.add(leaf); }
        const [gx, gz] = this.lw(s.goal[0], s.goal[1], W, H);
        b.cyl(0.5, 0.6, 1, 0xd8d0c0, gx, 0.5, gz, 8);
        this.goalOrb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), glowMaterial(0xffe08a, 0.9)); this.goalOrb.position.set(gx, 1.35, gz); g.add(this.goalOrb);
        this.interact.push({ id: 'pz:goal', kind: 'puzzle', act: 'goal', x: this.area.x + gx, z: this.area.z + gz, r: 1.3, label: 'Siegelkugel', prompt: 'Berühren' });
        break;
      }
    }
    const m = new THREE.Mesh(b.build(), envMaterial()); m.castShadow = true; m.receiveShadow = true; g.add(m);
  }
  // collision test for world movement
  blocked(x, z) {
    for (const [bx, bz, r] of this.blockers) if (Math.hypot(x - bx, z - bz) < r + 0.35) return true;
    if (this.blockMeshes) for (const blk of this.state.blocks) { const [wx, wz] = this.cw(blk[0], blk[1]); if (Math.abs(x - wx) < 1.15 && Math.abs(z - wz) < 1.15) return true; }
    if (this.segs) for (const [a, b, c, d] of this.segs) {
      const minx = Math.min(a, c) - 0.55, maxx = Math.max(a, c) + 0.55, minz = Math.min(b, d) - 0.55, maxz = Math.max(b, d) + 0.55;
      if (x > minx && x < maxx && z > minz && z < maxz) return true;
    }
    return false;
  }
  // dynamic interactables (boulders)
  dynamicInteract() {
    if (!this.blockMeshes || this.solved) return [];
    return this.state.blocks.map((blk, i) => { const [wx, wz] = this.cw(blk[0], blk[1]); return { id: 'pz:block' + i, kind: 'puzzle', act: 'push', idx: i, x: wx, z: wz, r: 2.0, label: this.kind === 'ice' ? 'Eisblock' : 'Moosfindling', prompt: 'Schieben' }; });
  }
  // Perform an action; returns { changed, solved, sound, text }
  act(entry, player) {
    if (this.solved && entry.act !== 'look') return { text: 'Das Rätsel ist bereits gelöst.' };
    const s = this.state;
    switch (entry.act) {
      case 'push': {
        const [wx, wz] = this.cw(s.blocks[entry.idx][0], s.blocks[entry.idx][1]);
        const dx = wx - player.x, dz = wz - player.z;
        const dir = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'e' : 'w') : (dz > 0 ? 's' : 'n');
        const moved = PZ.pushBlock(s, entry.idx, dir);
        this.syncBlocks();
        if (!moved) return { sound: 'error', text: 'Der Stein bewegt sich nicht – dahinter ist etwas im Weg.' };
        return this.check({ sound: 'push' });
      }
      case 'reset': if (s.start) { PZ.resetPush(s); this.syncBlocks(); } return { sound: 'puzzle', text: 'Alles wurde in die Ausgangslage zurückgesetzt.' };
      case 'press': PZ.pressSwitch(s, entry.idx); this.syncLamps(); return this.check({ sound: 'puzzle' });
      case 'rotate': PZ.rotateRune(s, entry.idx); this.syncRunes(); return this.check({ sound: 'puzzle' });
      case 'mirror': PZ.rotateMirror(s, entry.idx); this.syncMirrors(); return this.check({ sound: 'puzzle' });
      case 'goal': s.solved = true; return this.check({ sound: 'solve' });
      case 'look': return { text: 'Auf der Säule sind Punkte eingemeißelt.' };
    }
    return {};
  }
  // called per frame with player position (step plates)
  step(px, pz) {
    if (this.kind !== 'order' || this.solved) return null;
    const zone = this.stepZones.findIndex(([x, z, r]) => Math.hypot(px - x, pz - z) < r);
    if (zone === this.inZone) return null;
    this.inZone = zone;
    if (zone < 0) return null;
    const res = PZ.stepOrder(this.state, zone);
    this.plates.forEach((p, i) => { p.material.emissiveIntensity = 0; });
    if (res.ok) { for (let i = 0; i < this.state.n; i++) if (this.state.dots[i] <= this.state.progress) this.plates[i].material.emissiveIntensity = 0.8; return this.check({ sound: 'puzzle' }); }
    this.flash = 0.6;
    return { sound: 'error', text: 'Die Platten erlöschen wieder.' };
  }
  check(res) {
    if (PZ.isSolved(this.state)) { this.solved = true; this.showSolved(); return { ...res, solved: true, sound: 'solve' }; }
    return res;
  }
  showSolved(instant = false) {
    this.seal.material.opacity = 0.95;
    if (this.plateMeshes) this.plateMeshes.forEach(p => p.material.emissiveIntensity = 1);
    if (this.lamps) this.lamps.forEach(l => l.material.emissiveIntensity = 1.2);
    if (this.targetMesh) this.targetMesh.material.emissiveIntensity = 1.2;
    if (this.plates) this.plates.forEach(p => p.material.emissiveIntensity = 0.9);
    if (this.goalOrb) this.goalOrb.scale.setScalar(1.6);
    void instant;
  }
  syncBlocks() {
    this.state.blocks.forEach((blk, i) => { const [lx, lz] = this.lw(blk[0], blk[1]); const m = this.blockMeshes[i]; m.userData.target = new THREE.Vector3(lx, this.kind === 'ice' ? 0.9 : 0.85, lz); if (!m.userData.init) { m.position.copy(m.userData.target); m.userData.init = true; } });
    if (this.plateMeshes) this.plateMeshes.forEach((p, i) => { const [x, z] = this.state.plates[i]; p.material.emissiveIntensity = this.state.blocks.some(b => b[0] === x && b[1] === z) ? 1 : 0.3; });
  }
  syncLamps() { this.state.lit.forEach((on, i) => { this.lamps[i].material.emissiveIntensity = on ? 1.2 : 0; this.lamps[i].material.color.set(on ? 0xfff0c0 : 0x6a6a70); }); }
  syncRunes(instant) { this.stones.forEach((st, i) => { st.userData.target = -this.state.current[i] * Math.PI / 2; if (instant) st.rotation.y = st.userData.target; }); }
  syncMirrors() {
    this.mirrors.forEach((m, i) => { m.userData.target = this.state.mirrors[i].o === 0 ? -Math.PI / 4 : Math.PI / 4; });
    // beam segments
    this.beam.clear();
    const tr = PZ.traceBeam(this.state);
    let [px, pz] = this.lw(this.state.source.x, this.state.source.y);
    const mat = glowMaterial(tr.hit ? 0xfff2a0 : 0xffd0a0, 0.75);
    const pts = [[px, pz], ...tr.cells.map(c => this.lw(c.x, c.y))];
    if (!tr.hit && tr.exit) pts.push(this.lw(tr.exit.x, tr.exit.y));
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], len = Math.hypot(bx - ax, bz - az);
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, len, 6), mat);
      seg.position.set((ax + bx) / 2, 1.3, (az + bz) / 2); seg.rotation.z = Math.PI / 2; seg.rotation.y = -Math.atan2(bz - az, bx - ax);
      this.beam.add(seg);
    }
  }
  update(dt) {
    this.t += dt;
    if (this.blockMeshes) for (const m of this.blockMeshes) if (m.userData.target) m.position.lerp(m.userData.target, Math.min(1, dt * (this.kind === 'ice' ? 6 : 10)));
    if (this.stones) for (const st of this.stones) st.rotation.y += (st.userData.target - st.rotation.y) * Math.min(1, dt * 8);
    if (this.mirrors) for (const m of this.mirrors) m.rotation.y += (m.userData.target - m.rotation.y) * Math.min(1, dt * 8);
    if (this.flash > 0 && this.plates) { this.flash -= dt; this.plates.forEach(p => p.material.color.set(this.flash > 0 ? 0xd86a6a : 0x8a9aa8)); }
    this.seal.rotation.z += dt * (this.solved ? 2 : 0.3);
    if (this.goalOrb) this.goalOrb.position.y = 1.35 + Math.sin(this.t * 2) * 0.1;
  }
}
