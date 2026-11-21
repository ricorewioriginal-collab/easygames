/* Dein Club in 3D: Was du im Management einstellst, sieht man im Raum. DJ-Schild und Lichtfarben der Tanzfläche,
   Preistafel, Deko-Thema (Neon, Discokugel, Ballroom-Gold, Tropical), Samtkordel bei strenger Tür, Awareness-Schild,
   Banner der Themennacht, „Zu verkaufen“ bei fremden Clubs und so viele Gäste, wie die Beliebtheit hergibt.
   Sparsam: wenige Meshes, Schilder werden nur bei Änderungen neu gemalt, Deko erst beim ersten Bedarf gebaut. */
import { Matrix, TransformNode, type Scene, type Mesh, type PBRMaterial, type DynamicTexture, col } from '../engine/bjs';
import { planeZ, box, cyl, sphere, torus, pbr, glow, canvasTex } from '../engine/geo';
import { instance } from '../engine/Assets';
import { PRICES, DECOS, type ClubState } from './club';

/** Lage je Club-Innenraum: Tanzflächenmitte, Wandabstand der Schilder, Stelle fürs Management */
export const CLUB_LAYOUT: Record<string, { floor: [number, number]; wallZ: number; spot: [number, number] }> = {
  club: { floor: [0, 1.5], wallZ: -4.3, spot: [-4.2, -2.4] },
  onelove: { floor: [0, -.6], wallZ: -4.3, spot: [4.2, -2.6] },
  kaleido: { floor: [0, -2.4], wallZ: -4.15, spot: [5.2, -1.2] },
  komet: { floor: [-.5, .4], wallZ: -4.3, spot: [1.5, -2.8] },
  wolke: { floor: [-1.2, .1], wallZ: -4.3, spot: [2.6, -3.2] },
};

interface Sign { m: Mesh; tex: DynamicTexture; txt: string; set(text: string, color: string): void }
function sign(sc: Scene, w: number, h: number, px = 512): Sign {
  const ph = Math.round(px * h / w), tex = canvasTex(sc, px, ph, () => { /* leer */ }, true) as DynamicTexture;
  const m = planeZ(sc, w, h); m.material = glow(sc, 0xffffff, 1.6, { tex }); m.isPickable = false;
  const s: Sign = { m, tex, txt: '', set(text, color) {
    if (s.txt === text + color) return; s.txt = text + color;
    const g = tex.getContext() as unknown as CanvasRenderingContext2D; g.clearRect(0, 0, px, ph);
    g.font = `900 ${Math.round(ph * .62)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = ph * .2; g.fillStyle = color; g.fillText(text, px / 2, ph * .54, px - 12);
    g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(text, px / 2, ph * .54, px - 12);
    tex.update(true);
  } };
  return s;
}

export interface Folk { root: { setEnabled(v: boolean): void; isEnabled(): boolean } }

export class ClubDeco {
  private djSign: Sign; private priceSign: Sign; private awareSign: Sign; private banner: Sign;
  private rope: TransformNode;
  private groups = new Map<string, TransformNode>();
  private spin: TransformNode | null = null;
  private tiles: Array<{ m: PBRMaterial; odd: boolean; c0: number }> = [];
  pulse = 3;
  constructor(private sc: Scene, private themeId: string, private W: number, private D: number, private H: number, glowMats: PBRMaterial[]) {
    const L = CLUB_LAYOUT[themeId], z = L.wallZ;
    this.djSign = sign(sc, 2.6, .5); this.djSign.m.position.set(-W / 2 + 1.7, 2.55, z);
    this.priceSign = sign(sc, 2.2, .42); this.priceSign.m.position.set(W / 2 - 1.5, 2.55, z);
    this.awareSign = sign(sc, 2.8, .4); this.awareSign.m.position.set(W / 2 - .05, 2.55, -1.6); this.awareSign.m.rotation.y = -Math.PI / 2;
    this.banner = sign(sc, 5.2, .6, 768); this.banner.m.position.set(-W / 2 + .05, 3.0, .2); this.banner.m.rotation.y = Math.PI / 2;
    for (const s of [this.djSign, this.priceSign, this.awareSign, this.banner]) s.m.freezeWorldMatrix();
    // Samtkordel vor der Tür (nur bei Dresscode oder Gästeliste)
    this.rope = new TransformNode('rope', sc);
    const gold = pbr(sc, 0xffc83d, .3, .9), red = pbr(sc, 0xb0102a, .6);
    for (const pz of [1.0, 2.4]) { const p = cyl(sc, .05, .07, 1, 10); p.material = gold; p.position.set(W / 2 - 1, .5, pz); p.parent = this.rope; const k = sphere(sc, .08, 8); k.material = gold; k.position.set(W / 2 - 1, 1.02, pz); k.parent = this.rope; }
    const r = cyl(sc, .03, .03, 1.4, 8); r.material = red; r.rotation.x = Math.PI / 2; r.position.set(W / 2 - 1, .88, 1.7); r.parent = this.rope;
    // Kacheln der Tanzfläche: die zwei häufigsten Leuchtfarben im Raum
    const count = new Map<number, number>(); for (const m of glowMats) { const c = m.metadata?.c; if (typeof c === 'number') count.set(c, (count.get(c) || 0) + 1); }
    const top = [...count].filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c]) => c);
    for (const m of glowMats) if (top.includes(m.metadata?.c)) this.tiles.push({ m, odd: m.metadata.c === top[1], c0: m.metadata.c });
  }

  /** Deko-Gruppe beim ersten Bedarf bauen */
  private group(id: string): TransformNode {
    let g = this.groups.get(id); if (g) return g;
    const sc = this.sc, W = this.W, D = this.D, H = this.H, [fx, fz] = CLUB_LAYOUT[this.themeId].floor;
    g = new TransformNode('deco_' + id, sc); this.groups.set(id, g);
    const add = (m: Mesh, x: number, y: number, z: number) => { m.position.set(x, y, z); m.parent = g!; m.isPickable = false; return m; };
    if (id === 'neon') {
      const pink = glow(sc, 0xff3bd1, 2), cyan = glow(sc, 0x3be8ff, 2);
      for (let i = 0; i < 6; i++) add(box(sc, .07, 2.4, .07), -W / 2 + 1 + i * (W - 2) / 5, 1.5, -D / 2 + .08).material = i % 2 ? cyan : pink;
      for (let i = 0; i < 4; i++) add(box(sc, .07, 2.4, .07), -W / 2 + .08, 1.5, -D / 2 + 1.4 + i * (D - 2.8) / 3).material = i % 2 ? pink : cyan;
      add(box(sc, W - .4, .06, .06), 0, H - .35, -D / 2 + .1).material = pink;
      add(box(sc, .06, .06, D - .4), -W / 2 + .1, H - .35, 0).material = cyan;
    } else if (id === 'disco') {
      const ball = add(sphere(sc, .38, 14), fx, H - .62, fz); ball.material = pbr(sc, 0xe8e8f0, .12, 1, { emissive: 0x8888aa, ei: .35 });
      add(cyl(sc, .01, .01, .3, 4), fx, H - .15, fz).material = pbr(sc, 0x222222, .5);
      this.spin = new TransformNode('beams', sc); this.spin.parent = g; this.spin.position.set(fx, H - .62, fz);
      const beamCols = [0xff3bd1, 0x3be8ff, 0xffd23b, 0x7b5cff];
      for (let i = 0; i < 4; i++) {
        const b = cyl(sc, .02, .55, 2.8, 10, false); b.material = glow(sc, beamCols[i], 1, { alpha: .16, add: true, double: true });
        b.parent = this.spin; b.isPickable = false; const a = i * Math.PI / 2;
        b.rotation.set(.55, a, 0); b.position.set(Math.sin(a) * .5, -1.3, Math.cos(a) * .5);
      }
      ball.parent = this.spin; ball.position.set(0, 0, 0);
    } else if (id === 'ballroom') {
      const gold = pbr(sc, 0xffc83d, .25, 1, { emissive: 0xffa020, ei: .25 });
      add(torus(sc, .7, .05, 28), fx, H - .9, fz).material = gold;
      add(torus(sc, .4, .04, 22), fx, H - .65, fz).material = gold;
      add(cyl(sc, .02, .02, .6, 6), fx, H - .3, fz).material = gold;
      const bulb = add(sphere(sc, .07, 6), fx, H - .82, fz); bulb.material = glow(sc, 0xffe6a0, 2.2);
      const ms = new Float32Array(14 * 16);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? .4 : .7; Matrix.Translation(Math.cos(a) * r, i % 2 ? .2 : 0, Math.sin(a) * r).copyToArray(ms, i * 16); }
      bulb.thinInstanceSetBuffer('matrix', ms, 16, true);
      const velvet = pbr(sc, 0x8a0f2a, .9);
      for (const x of [-W / 2 + .7, W / 2 - .7]) add(box(sc, 1.1, H - .3, .1), x, (H - .3) / 2, -D / 2 + .12).material = velvet;
      add(box(sc, W - .3, .08, .05), 0, 1.0, -D / 2 + .06).material = gold;
      add(box(sc, .05, .08, D - .3), -W / 2 + .06, 1.0, 0).material = gold;
    } else if (id === 'tropic') {
      const ms = new Float32Array(26 * 16), cs = new Float32Array(26 * 4), bulb = add(sphere(sc, .06, 6), 0, 0, 0);
      bulb.material = glow(sc, 0xffffff, 1.4);
      for (let i = 0; i < 26; i++) { const u = i / 25; Matrix.Translation(-W / 2 + .5 + u * (W - 1), H - .3 - Math.abs(Math.sin(u * Math.PI * 3)) * .35, fz - 1.2 + Math.sin(u * 9) * .4).copyToArray(ms, i * 16); const c = col([0xffd23b, 0xff6ad5, 0x3ee69a, 0xff9a3b][i % 4], 1.6); cs.set([c.r, c.g, c.b, 1], i * 4); }
      bulb.thinInstanceSetBuffer('matrix', ms, 16, true); bulb.thinInstanceSetBuffer('color', cs, 4, true);
      const leaf = pbr(sc, 0x2f9f5a, .8), trunk = pbr(sc, 0x8a5a35, .9);
      for (const [x, z] of [[-W / 2 + .6, -.6], [-W / 2 + .6, 2], [W / 2 - .7, -D / 2 + 1.6]] as const) {
        add(cyl(sc, .08, .12, 2, 8), x, 1, z).material = trunk;
        for (let j = 0; j < 5; j++) { const a = j * 1.26, l = add(box(sc, 1, .03, .28), x + Math.cos(a) * .42, 1.92, z - Math.sin(a) * .42); l.material = leaf; l.rotation.set(0, a, -.38); }
      }
      void instance(sc, 'home/cactus_medium_A.gltf').then((o) => { o.position.set(-W / 2 + .7, 0, -D / 2 + 1.8); o.scaling.setAll(.9); o.parent = g!; }).catch(() => { /* fehlt: egal */ });
      const flam = sign(sc, 3.4, .5); flam.set('🌴 TROPICAL PRIDE', '#ff6ad5'); flam.m.parent = g; flam.m.position.set(0, 3.0, D / 2 - .05); flam.m.rotation.y = Math.PI;
    }
    g.getChildMeshes().forEach((m) => { if (!m.parent || m.parent === g) m.freezeWorldMatrix(); });
    return g;
  }

  /** Zustand anwenden. st = null: Club gehört dir nicht */
  apply(st: ClubState | null, o: { sale: boolean; event?: string; party: boolean }, folk: Folk[], pop: number) {
    this.djSign.m.setEnabled(!!st); this.priceSign.m.setEnabled(!!st); this.awareSign.m.setEnabled(!!st?.aware);
    this.rope.setEnabled(!!st && st.door > 0);
    for (const [id, g] of this.groups) g.setEnabled(st?.deco === id);
    if (st?.deco && DECOS.some((d) => d.id === st.deco)) this.group(st.deco).setEnabled(true);
    if (st) {
      this.djSign.set(st.dj.id === 'haus' ? '🎶 PLAYLIST' : '🎧 ' + st.dj.name.toUpperCase(), st.dj.neon);
      this.priceSign.set('🍸 ' + PRICES[st.price].text.split(':')[0].toUpperCase(), '#ffd23b');
      if (st.aware) this.awareSign.set('💜 AWARENESS: SPRICH UNS AN', '#c58bff');
      for (const t of this.tiles) t.m.metadata.c = st.dj.id === 'haus' ? t.c0 : t.odd ? st.dj.c2 : st.dj.c1;
    } else for (const t of this.tiles) t.m.metadata.c = t.c0;
    for (const t of this.tiles) { delete t.m.metadata.cc; t.m.albedoColor.copyFrom(col(t.m.metadata.c)); }
    this.banner.m.setEnabled(!!o.event || o.sale);
    if (o.event) this.banner.set('🏳️‍🌈 ' + o.event, '#ffffff'); else if (o.sale) this.banner.set('ZU VERKAUFEN · FRAG AN DER BAR', '#ff4b6b');
    // Gäste: ohne Club alle, sonst nach Beliebtheit (2–6), in der Clubnacht alle
    const n = !st || o.party ? folk.length : Math.max(2, Math.min(folk.length, Math.round(1 + pop / 18)));
    folk.forEach((a, i) => a.root.setEnabled(i < n));
    this.pulse = o.party ? 7 : st && st.dj.id !== 'haus' ? 4.5 : 3;
  }
  update(dt: number) { if (this.spin && this.groups.get('disco')?.isEnabled()) this.spin.rotation.y += dt * .6; }
}
