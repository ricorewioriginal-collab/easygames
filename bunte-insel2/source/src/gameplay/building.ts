/* Freies Bauen im Bauland: Raster mit echten 3D-Blöcken, Kollision, Farben, Abtragen und Rückgängig.
   Belegte Zellen werden als begrenzte numerische Flags gespeichert; bestehende Spielstände bleiben kompatibel. */
import type { Game, GameSystem } from '../game.ts';
import type { LoadedWorld } from '../world/registry.ts';
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { btn, h, modal } from '../ui/dom.ts';
export const BLOCK_COLORS = [0xe85c4a, 0xffc85a, 0x6acb88, 0x62b9ee, 0xb49ae8, 0xfffaf0, 0xa87950, 0x667386];
const N = 10, MAX_HEIGHT = 8, MAX_BLOCKS = 256, TAG = '_freebuild', PREFIX = 'bau:';
export class Building implements GameSystem {
  id = 'building';
  private mesh: THREE.Mesh | null = null;
  constructor(private g: Game) { g.panels.freebuild = () => this.open(); }
  private origin(): { x: number; z: number } { const w = this.g.worlds.byId('bauland')!; return { x: w.shape.x + 62, z: w.shape.z + 30 }; }
  private key(x: number, z: number, y: number): string { return PREFIX + x + ':' + z + ':' + y; }
  private height(x: number, z: number): number { let y = 0; while (y < MAX_HEIGHT) { const c = this.g.flag(this.key(x, z, y)); if (!Number.isInteger(c) || c < 1 || c > BLOCK_COLORS.length) break; y++; } return y; }
  private count(): number { let n = 0; for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) n += this.height(x, z); return n; }
  private clearMesh(): void { if (this.mesh) { this.g.scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh = null; } this.g.physics.removeTag(TAG); }
  onStop(): void { this.clearMesh(); }
  onStart(): void { this.rebuild(); }
  onWorldUnload(id: string): void { if (id === 'bauland') this.clearMesh(); }
  onWorldLoad(w: LoadedWorld): void {
    if (w.def.id !== 'bauland') return;
    const p = this.origin(), y = this.g.field.height(p.x, p.z);
    this.g.interact.add({ id: 'freie_baukiste', tag: 'bauland', x: p.x, y, z: p.z + 13, r: 3, icon: '🧱', label: 'Freies Bauen – deine eigene Kreation', act: () => this.open() });
    if (this.g.save) this.rebuild();
  }
  private rebuild(): void {
    this.clearMesh(); if (!this.g.save || !this.g.worlds.loaded.has('bauland')) return;
    const o = this.origin(), b = new GeoBuilder();
    for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
      const wx = o.x + (x - 4.5) * 2, wz = o.z + (z - 4.5) * 2, base = this.g.field.height(wx, wz);
      for (let y = 0; y < this.height(x, z); y++) {
        const c = this.g.flag(this.key(x, z, y)) - 1;
        b.box(wx, base + y * 2, wz, 1.96, 2, 1.96, BLOCK_COLORS[c] ?? BLOCK_COLORS[0]);
      }
      const height = this.height(x, z); if (height) this.g.physics.box(TAG, wx, wz, 2, 2, base, base + height * 2);
    }
    if (!b.empty) { this.mesh = b.mesh(mats().vc, this.g.renderer.profile.shadows); this.g.scene.add(this.mesh); }
  }
  open(): void {
    if (this.g.currentWorld?.id !== 'bauland') return;
    let color = 0, remove = false;
    const undo: { key: string; before: number }[] = [];
    const m = modal({ title: 'Deine Bauwiese', icon: '🧱' });
    m.wrap.classList.add('build-panel');
    const status = h('p', { class: 'muted', 'aria-live': 'polite' });
    const grid = h('div', { class: 'build-grid' });
    const palette = h('div', { class: 'build-palette' });
    BLOCK_COLORS.forEach((c, i) => { const b = btn('', () => { color = i; remove = false; paint(); }, '', { 'aria-label': ['Rot', 'Gelb', 'Grün', 'Blau', 'Lila', 'Weiß', 'Holz', 'Stein'][i], style: 'background:#' + c.toString(16).padStart(6, '0') }); b.dataset.color = String(i); palette.append(b); });
    const paint = () => {
      status.textContent = this.count() + '/' + MAX_BLOCKS + ' Klötze · ' + (remove ? 'Obersten Klotz entfernen' : 'Klick setzt einen Klotz obenauf') + ' · bis 8 hoch';
      for (const b of palette.querySelectorAll('button')) b.classList.toggle('selected', !remove && b.dataset.color === String(color));
      grid.replaceChildren();
      for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) {
        const y = this.height(x, z), c = this.g.flag(this.key(x, z, y - 1)) - 1;
        grid.append(btn(y ? String(y) : '·', () => {
          const hgt = this.height(x, z);
          if (remove ? hgt === 0 : hgt >= MAX_HEIGHT || this.count() >= MAX_BLOCKS) { this.g.toast(remove ? 'Hier steht noch nichts.' : 'Abtragen schafft wieder Platz.', '🧱'); return; }
          const key = this.key(x, z, remove ? hgt - 1 : hgt), before = this.g.flag(key);
          undo.push({ key, before }); if (remove) delete this.g.save.flags[key]; else this.g.save.flags[key] = color + 1;
          this.rebuild(); paint(); this.g.sfx('bump', 0.3);
        }, '', { 'aria-label': 'Spalte ' + (x + 1) + ', Reihe ' + (z + 1) + ', Höhe ' + y, style: y ? 'background:#' + BLOCK_COLORS[c].toString(16).padStart(6, '0') : '' }));
      }
    };
    m.body.append(h('p', null, 'Baue ein Haus, eine Brücke oder eine Figur. Die Baukiste ist kostenlos. Dein Bauwerk bleibt auf der Wiese stehen und lässt sich betreten.'), palette, status, grid);
    m.footer.classList.remove('hidden');
    m.footer.append(btn('⛏ Abtragen', () => { remove = !remove; paint(); }, 'ghost'), btn('↶ Rückgängig', () => { const a = undo.pop(); if (!a) return; if (a.before) this.g.save.flags[a.key] = a.before; else delete this.g.save.flags[a.key]; this.rebuild(); paint(); }, 'ghost'), btn('✔ Anschauen', () => { this.g.persist(); m.close(); }, 'green'));
    paint();
  }
}
