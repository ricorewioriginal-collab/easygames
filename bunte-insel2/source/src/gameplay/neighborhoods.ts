/* Ortsgebundene Aktivitäten in der 3D-Welt. Alle Fortschritte überstehen Welt-Streaming und Speichern.
   Gemeinsame Werkzeuge, unterschiedliche Orte: Garten, Backstube, Klanggarten, Balancierpfad und Fußballplatz. */
import type { Game, GameSystem } from '../game.ts';
import type { LoadedWorld } from '../world/registry.ts';
import type { NpcSystem } from './npc.ts';
import type { QuestEngine } from './quests.ts';
import { NEIGHBORHOODS, type Neighborhood } from '../data/neighborhoods.ts';
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { labelSprite } from '../engine/textures.ts';
import { insideDepth } from '../world/terrain.ts';
import { btn, h, modal, anyModal } from '../ui/dom.ts';
import { itemName, itemIcon } from '../data/items.ts';
interface Site { def: Neighborhood; x: number; z: number; root: THREE.Group; updates: ((dt: number) => void)[]; begin(): void; reset(): void }
export class Neighborhoods implements GameSystem {
  id = 'neighborhoods';
  readonly sites = new Map<string, Site>();
  constructor(private g: Game, private npcs: NpcSystem, private quests: QuestEngine) {
    g.panels.neighborhood = arg => this.explain(String(arg));
    g.panels.hofkueche = () => this.cook({ world: 'hub', name: 'Minas Hofküche', host: 'Hofköchin Mina', icon: '🥣', x: 0, z: 0, color: 0xefb957, kind: 'kitchen', reward: 'burger', ingredients: [['karotte', 2]], intro: 'Zwei Karotten ergeben einen warmen Gemüseburger für unterwegs.', outcome: 'Frisch vom Hof auf den Teller!' });
  }
  private prefix(d: Neighborhood): string { return 'ort:' + d.world + ':'; }
  private completed(d: Neighborhood): string { return this.prefix(d) + 'fertig'; }
  private finish(s: Site): void {
    const g = this.g, d = s.def;
    if (!g.flag(this.completed(d))) {
      g.setFlag(this.completed(d)); if (d.kind !== 'garden' && d.kind !== 'kitchen') g.give(d.reward);
      g.bark(d.host, d.outcome, d.icon); g.sfx('quest');
      g.burst(s.x, g.field.height(s.x, s.z) + 2, s.z, [d.color, 0xfff2b3, 0xffffff], 24);
    }
  }
  /** Sucht nahe am gewünschten Ort eine freie, trockene Fläche. Gebäude und alte Quest-Objekte bleiben zugänglich. */
  private clearing(w: LoadedWorld, d: Neighborhood): { x: number; z: number } {
    const desired = { x: w.def.shape.x + d.x, z: w.def.shape.z + d.z };
    if (d.kind === 'ball') return { x: w.def.shape.x, z: w.def.shape.z };
    const width = d.kind === 'course' ? 14 : 10, depth = d.kind === 'course' ? 10 : 8;
    const free = (x: number, z: number): boolean => {
      if (insideDepth(w.def.shape, x, z) < 9) return false;
      for (const dx of [-width / 2, 0, width / 2]) for (const dz of [-depth / 2, 0, depth / 2]) {
        const px = x + dx, pz = z + dz, y = this.g.field.height(px, pz);
        const ground = this.g.physics.ground(px, pz, 200);
        if (y < 0.6 || ground.water > y || ground.y > y + 0.6) return false;
        const p = { x: px, y: y + 0.05, z: pz };
        if (this.g.physics.move(p, 0, 0, 1.2, 2).hit) return false;
      }
      return true;
    };
    for (let radius = 0; radius <= 28; radius += 4) for (let i = 0; i < (radius ? 16 : 1); i++) {
      const a = i * Math.PI / 8, x = desired.x + Math.cos(a) * radius, z = desired.z + Math.sin(a) * radius;
      if (free(x, z)) return { x, z };
    }
    // Kleine Inseln: eine offene Fläche ohne neue massive Kollisionskörper ist besser als ein blockierter Eingang.
    for (let radius = 12; radius < w.def.shape.r - 10; radius += 5) for (let i = 0; i < 24; i++) {
      const a = i * Math.PI / 12, x = w.def.shape.x + Math.cos(a) * radius, z = w.def.shape.z + Math.sin(a) * radius;
      if (free(x, z)) return { x, z };
    }
    throw new Error('Keine freie Fläche für ' + d.name);
  }
  private mesh(s: Site, b: GeoBuilder): THREE.Mesh { const m = b.mesh(mats().vc, this.g.renderer.profile.shadows); s.root.add(m); return m; }
  private interaction(s: Site, key: string, x: number, z: number, label: string | (() => string), act: () => void, y?: number): void {
    this.g.interact.add({ id: this.prefix(s.def) + key, tag: s.def.world, x, y: y ?? this.g.field.height(x, z), z, r: 2.5, icon: s.def.icon, label, priority: 1, meta: { flag: this.completed(s.def), item: s.def.reward }, act });
  }
  onWorldLoad(w: LoadedWorld): void {
    const d = NEIGHBORHOODS.find(d => d.world === w.def.id); if (!d) return;
    const p = this.clearing(w, d), root = new THREE.Group(); root.name = 'nachbarschaft:' + d.world; w.root.add(root);
    const s: Site = { def: d, ...p, root, updates: [], begin: () => {}, reset: () => {} }; this.sites.set(d.world, s);
    const y = this.g.field.height(p.x, p.z), b = new GeoBuilder();
    // Nutzbarer Ort mit Ankündigung und Sitzplatz, statt alleinstehendem Spielautomaten.
    const boardX = p.x - 5, boardZ = p.z + 5;
    b.box(boardX, this.g.field.height(boardX, boardZ), boardZ, 0.18, 1.8, 0.18, 0x9a714b);
    b.box(boardX, this.g.field.height(boardX, boardZ) + 1.3, boardZ, 2.4, 1, 0.16, d.color);
    const label = labelSprite(d.name, 1.2, { size: 40, bg: '#fff8ed', fg: '#34334c', icon: d.icon });
    label.position.set(boardX, y + 3, boardZ); label.scale.multiplyScalar(0.7); root.add(label);
    // labelSprite owns its canvas texture (world-unload disposes the sprite below).
    (label.material as THREE.Material).userData.disposeWithWorld = true;
    b.box(p.x + 5, y + 0.45, p.z + 4, 3, 0.18, 0.8, 0xa87950);
    b.box(p.x + 5, y + 0.5, p.z + 4.35, 3, 0.8, 0.12, 0xa87950);
    this.mesh(s, b);
    this.interaction(s, 'tafel', boardX, boardZ, d.name + ' – mitmachen', () => this.explain(d.world));
    if (d.kind === 'garden') this.garden(s);
    if (d.kind === 'kitchen') this.kitchen(s);
    if (d.kind === 'music') this.music(s);
    if (d.kind === 'course') this.course(s);
    if (d.kind === 'ball') this.ball(s);
    const npcId = 'nachbar_' + d.world, qid = 'ort_' + d.world;
    this.npcs.register([{ id: npcId, name: d.host, world: d.world, x: boardX - 1.8, z: boardZ + 1.8, icon: d.icon, role: d.name, wander: 1.5, night: 'stay', greet: ['Hallo! Magst du mitmachen?'], chat: [d.intro, d.outcome], topics: [{ label: d.name, to: 'mitmachen' }], dialog: { mitmachen: { t: d.intro, do: [{ panel: 'neighborhood', panelArg: d.world }], end: true } }, likes: [d.reward], look: { age: d.kind === 'course' ? 1 : 2 } }]);
    if (!this.npcs.live.has(npcId)) this.npcs.spawn(this.npcs.defs.get(npcId)!);
    this.quests.register([{ id: qid, title: d.name, icon: d.icon, world: d.world, kind: 'side', giver: npcId, summary: d.intro,
      stages: [{ text: d.intro, hints: [d.intro, 'An der farbigen Tafel kannst du die Erklärung jederzeit wieder öffnen.', 'Die Stationen stehen direkt neben der Tafel.'], objectives: [{ id: 'mitmachen', type: 'flag', target: this.completed(d), at: { x: p.x, z: p.z }, label: d.name + ': mitmachen' }] }],
      rewards: { stars: 4, xp: 25, text: d.outcome } }]);
    w.def.pois.nachbarschaft = { x: p.x, z: p.z, name: d.name, icon: d.icon };
  }
  onWorldUnload(id: string): void { this.sites.delete(id); }
  onStart(): void { for (const s of this.sites.values()) s.reset(); }
  onStop(): void { for (const s of this.sites.values()) s.reset(); }
  update(dt: number): void { for (const s of this.sites.values()) for (const f of s.updates) f(dt); }
  private explain(id: string): void {
    const s = this.sites.get(id); if (!s) return;
    const d = s.def, m = modal({ title: d.name, icon: d.icon });
    m.body.append(h('p', { class: 'activity-intro' }, d.intro));
    if (this.g.flag(this.completed(d))) m.body.append(h('p', { class: 'card on' }, '✓ ' + d.outcome));
    m.footer.classList.remove('hidden');
    m.footer.append(btn(d.kind === 'music' ? '🎵 Melodie anhören' : 'Los geht’s', () => { m.close(); this.quests.start('ort_' + d.world); if (!this.quests.isDone('ort_' + d.world)) this.g.save.tracked = 'ort_' + d.world; s.begin(); }, 'green'));
  }
  private garden(s: Site): void {
    const g = this.g, d = s.def, prefix = this.prefix(d), plants: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const x = s.x - 3.5 + i * 3.5, z = s.z, y = g.field.height(x, z), b = new GeoBuilder();
      b.box(x, y, z, 2.8, 0.15, 3.8, 0x79543d);
      for (const sign of [-1, 1]) b.box(x + sign * 1.45, y, z, 0.12, 0.3, 4, 0xb69770);
      this.mesh(s, b);
      const crop = new GeoBuilder();
      for (let k = 0; k < 4; k++) { const px = x + (k % 2 - 0.5), pz = z + (Math.floor(k / 2) - 0.5) * 1.6;
        crop.box(px, y + 0.16, pz, 0.08, 0.7, 0.08, 0x479659); crop.sph(px, y + 0.9, pz, 0.3, [d.color, 0xffe8a2, 0xf7b3c7][i]); }
      const plant = this.mesh(s, crop); plant.geometry.translate(0, -y, 0); plant.position.y = y; plants.push(plant);
      const key = prefix + 'beet' + i, grow = prefix + 'wuchs' + i;
      const ready = () => g.flag(key) === 2 && g.save.playTime >= g.flag(grow);
      this.interaction(s, 'beet' + i, x, z + 2, () => !g.flag(key) ? 'Beet ' + (i + 1) + ': säen' : g.flag(key) === 1 ? 'Beet ' + (i + 1) + ': gießen' : ready() ? 'Beet ' + (i + 1) + ': ernten' : 'Wächst … noch ' + Math.ceil(Math.max(0, g.flag(grow) - g.save.playTime)) + ' Sekunden', () => {
        const stage = g.flag(key);
        if (!stage) { g.setFlag(key, 1); g.sfx('dig'); }
        else if (stage === 1) { g.setFlag(grow, g.save.playTime + 14); g.setFlag(key, 2); g.sfx('splash'); }
        else if (ready()) {
          g.setFlag(key, 0); g.setFlag(prefix + 'geerntet' + i); g.give(d.reward); g.sfx('pickup');
          if ([0, 1, 2].every(k => g.flag(prefix + 'geerntet' + k))) this.finish(s);
        }
      });
      s.updates.push(() => { const stage = g.flag(key); plants[i].visible = stage > 0; plants[i].scale.y = stage === 2 ? Math.min(1, Math.max(0.3, 1 - (g.flag(grow) - g.save.playTime) / 20)) : 0.2; });
    }
    s.begin = () => g.bark(d.host, 'Erst säen, dann gießen. Die Pflanzen wachsen auch weiter, wenn du die Insel erkundest.', d.icon);
    if (d.world === 'hub') {
      const b = new GeoBuilder(), x = s.x + 7, z = s.z - 1, y = g.field.height(x, z);
      b.box(x, y, z, 2.6, 1.2, 1.2, 0xc89165); b.box(x, y + 1.2, z, 2.8, 0.12, 1.4, 0xfaf2db); b.cyl(x + 0.6, y + 1.32, z, 0.4, 0.4, 0.3, 0x6d7884, 12); this.mesh(s, b);
      this.interaction(s, 'hofkueche', x, z + 1.5, 'Hofküche: aus Karotten kochen', () => g.openPanel('hofkueche'));
    }
  }
  private kitchen(s: Site): void {
    const d = s.def, b = new GeoBuilder(), y = this.g.field.height(s.x, s.z);
    b.box(s.x, y, s.z, 5, 1.2, 1.5, d.color); b.box(s.x, y + 1.2, s.z, 5.2, 0.12, 1.7, 0xfff5df);
    b.box(s.x + 1.4, y + 0.3, s.z + 0.8, 1, 0.7, 0.05, 0x41465c);
    b.cyl(s.x - 1.4, y + 1.32, s.z, 0.5, 0.5, 0.4, 0x8390a0, 12);
    for (let i = 0; i < 3; i++) b.sph(s.x - 0.2 + i * 0.5, y + 1.4, s.z, 0.18, 0xe99d50);
    this.mesh(s, b);
    const table = new GeoBuilder(); table.box(s.x + 3.5, y + 0.75, s.z - 3.5, 2.5, 0.15, 1.5, 0xffebc1);
    for (let i = 0; i < 3; i++) table.sph(s.x + 2.8 + i * 0.65, y + 1, s.z - 3.5, 0.24, 0xe7a65c);
    const served = this.mesh(s, table); s.updates.push(() => { served.visible = !!this.g.flag(this.completed(d)); });
    this.interaction(s, 'kochen', s.x, s.z + 1.8, 'Selbst zubereiten: ' + itemName(d.reward), () => this.cook(d, () => this.finish(s)));
    s.begin = () => this.cook(d, () => this.finish(s));
  }
  private cook(d: Neighborhood, done?: () => void): void {
    const g = this.g, needs = d.ingredients ?? [], m = modal({ title: d.name, icon: d.icon });
    const available = () => needs.every(([id, n]) => g.has(id, n));
    m.body.append(h('p', null, d.intro), h('p', { class: 'card' }, 'Zutaten: ' + needs.map(([id, n]) => n + ' ' + itemIcon(id) + ' ' + itemName(id)).join(' + ')));
    if (!available()) { m.body.append(h('p', null, 'Dir fehlen noch Zutaten. Äpfel und Karotten gibt es am Hof; Honig gibt es im Märchenland oder beim Händler. Deine Zutaten werden erst beim fertigen Gericht verbraucht.')); return; }
    const text = h('p', { 'aria-live': 'polite' }, '1 · Zutaten vorbereiten'), controls = h('div');
    m.body.append(text, controls); let started = 0, raf = 0, stopped = false;
    const bar = h('div', { class: 'cooking-meter', role: 'meter', 'aria-label': 'Garzeit' }, h('div', { class: 'good' }), h('i'));
    const pointer = bar.querySelector('i')!;
    const showButton = (label: string, action: () => void) => controls.replaceChildren(btn(label, action, 'green'));
    showButton('🔪 Zutaten schneiden', () => { g.sfx('chop'); text.textContent = '2 · Alles gut vermischen'; showButton('🥣 Rühren', () => {
      text.textContent = '3 · Im grünen Bereich stoppen. Zu früh oder zu spät? Du kannst es ohne Zutatenverlust wiederholen.';
      m.body.append(bar); started = performance.now();
      const value = () => (Math.sin((performance.now() - started) / 900 - Math.PI / 2) + 1) / 2;
      const animate = () => { if (!document.body.contains(bar) || stopped) return; pointer.style.left = (value() * 100) + '%'; raf = requestAnimationFrame(animate); }; animate();
      showButton('🍳 Jetzt herausnehmen', () => {
        const v = value(); if (v < 0.38 || v > 0.72) { started = performance.now(); g.sfx('bump', 0.3); text.textContent = 'Fast! Versuch es noch einmal im grünen Bereich.'; return; }
        if (!available()) { text.textContent = 'Die Zutaten sind nicht mehr im Rucksack.'; return; }
        stopped = true; cancelAnimationFrame(raf); for (const [id, n] of needs) g.take(id, n);
        g.give(d.reward); done?.(); g.sfx('success'); text.textContent = 'Geschafft! ' + itemName(d.reward) + ' ist im Rucksack.'; showButton('✔ Fertig', () => m.close());
      });
    }); });
  }
  private music(s: Site): void {
    const g = this.g, d = s.def, notes = [0, 2, 4, 7], tune = d.tune ?? [0, 2, 4, 2];
    let step = 0, listen = -1, clock = 0;
    const lights: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const x = s.x - 4.5 + i * 3, z = s.z, y = g.field.height(x, z), b = new GeoBuilder();
      b.cyl(x, y, z, 0.8, 1, 0.5 + i * 0.3, d.color, 10); b.cyl(x, y + 0.5 + i * 0.3, z, 0.9, 0.9, 0.14, 0xfff5d8, 12); this.mesh(s, b);
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe89d })); light.material.userData.disposeWithWorld = true;
      light.position.set(x, y + 1.4 + i * 0.3, z); s.root.add(light); lights.push(light);
      this.interaction(s, 'ton' + i, x, z + 1.5, 'Ton ' + (i + 1) + ' spielen', () => {
        g.sfx('note' + notes[i]); if (listen >= 0 || g.flag(this.completed(d))) return;
        if (notes[i] !== tune[step]) { step = 0; g.bark(d.host, 'Noch einmal von vorn. An der Tafel kannst du die Melodie wieder anhören.', d.icon); return; }
        step++; g.toast('♪ ' + step + '/' + tune.length, d.icon, 900); if (step === tune.length) this.finish(s);
      });
    }
    s.reset = () => { listen = -1; step = 0; };
    s.begin = () => { listen = 0; clock = 0; step = 0; g.bark(d.host, 'Hör zu und spiel die Töne auf den Klangplatten nach.', d.icon); };
    s.updates.push(dt => {
      lights.forEach((l, i) => { l.visible = !!g.flag(this.completed(d)) || notes[i] === tune[Math.max(0, listen - 1)] && listen >= 0; });
      if (listen < 0 || anyModal()) return;
      clock -= dt; if (clock <= 0) { if (listen >= tune.length) { listen = -1; return; } g.sfx('note' + tune[listen++]); clock = 0.7; }
    });
  }
  private course(s: Site): void {
    const g = this.g, d = s.def, b = new GeoBuilder(), points: { x: number; z: number; y: number; ring: THREE.Mesh }[] = [];
    let active = false, step = 0, began = 0;
    for (let i = 0; i < 5; i++) {
      const x = s.x - 5 + i * 2.5, z = s.z + (i % 2 ? -1.8 : 1.8), base = g.field.height(x, z), height = [0.45, 1.1, 1.8, 1.2, 0.6][i];
      b.cyl(x, base, z, 1.1, 1.2, height, d.color, d.world === 'huepf' ? 12 : 6);
      if (d.world === 'huepf') { b.sph(x, base + height - 0.2, z, 1.3, d.color, { sy: 0.35 }); }
      g.physics.circle(d.world, x, z, 1.1, base, base + height);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.07, 6, 16), new THREE.MeshBasicMaterial({ color: 0xffdf74 })); ring.material.userData.disposeWithWorld = true;
      ring.position.set(x, base + height + 1.3, z); s.root.add(ring); points.push({ x, z, y: base + height, ring });
    }
    this.mesh(s, b);
    s.reset = () => { active = false; step = 0; };
    s.begin = () => { active = true; step = 0; began = g.save.playTime; g.bark(d.host, 'Spring auf die erste leuchtende Stufe. Kein Zeitdruck!', d.icon); };
    this.interaction(s, 'start', s.x - 6, s.z + 4, 'Balancierpfad starten', s.begin);
    s.updates.push(() => {
      points.forEach((p, i) => { p.ring.visible = active && i >= step; p.ring.rotation.y += 0.02; });
      if (!active || anyModal()) return;
      const p = points[step], player = g.player.pos;
      if (Math.hypot(player.x - p.x, player.z - p.z) < 1.2 && player.y >= p.y - 0.15 && player.y < p.y + 2) {
        step++; g.sfx('note' + Math.min(7, step));
        if (step === points.length) { active = false; const key = this.prefix(d) + 'best', time = g.save.playTime - began; const previous = g.save.stats[key]; if (!previous || time < previous) g.save.stats[key] = time; this.finish(s); g.toast('Geschafft · ' + time.toFixed(1) + ' s · beste Runde ' + g.save.stats[key].toFixed(1) + ' s', d.icon, 3500); }
      }
    });
  }
  private ball(s: Site): void {
    const g = this.g, d = s.def, y = g.field.height(s.x, s.z), ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }));
    ball.material.userData.disposeWithWorld = true; s.root.add(ball);
    let vx = 0, vz = 0, goals = 0;
    const reset = () => { ball.position.set(s.x, y + 0.35, s.z); vx = vz = 0; };
    reset();
    const inter = g.interact.add({ id: this.prefix(d) + 'ball', tag: d.world, x: s.x, y, z: s.z, r: 2.5, icon: '⚽', label: () => 'Schießen · ' + goals + '/3 Tore', priority: 3, meta: { flag: this.completed(d) }, act: () => {
      const dx = ball.position.x - g.player.pos.x, dz = ball.position.z - g.player.pos.z, len = Math.hypot(dx, dz) || 1;
      vx = dx / len * 18; vz = dz / len * 18; g.sfx('kick');
    } });
    s.reset = () => { goals = 0; reset(); };
    s.begin = () => { goals = 0; reset(); g.bark(d.host, 'Die Tore stehen links und rechts am Spielfeld. Stell dich hinter den Ball und schieß!', d.icon); };
    s.updates.push(dt => {
      const oldX = ball.position.x; ball.position.x += vx * dt; ball.position.z += vz * dt;
      ball.rotation.z -= vx * dt / 0.35; ball.rotation.x += vz * dt / 0.35;
      vx *= Math.exp(-0.55 * dt); vz *= Math.exp(-0.55 * dt);
      if (Math.abs(ball.position.x - s.x) >= 24 && Math.abs(oldX - s.x) < 24 && Math.abs(ball.position.z - s.z) < 3.5) { goals++; g.sfx('success'); g.toast('Tor! ' + goals + '/3', '⚽'); if (goals >= 3) this.finish(s); reset(); }
      if (Math.abs(ball.position.x - s.x) > 25 || Math.abs(ball.position.z - s.z) > 14) { reset(); g.toast('Aus! Der Ball liegt wieder am Mittelpunkt.', '⚽'); }
      ball.position.y = g.field.height(ball.position.x, ball.position.z) + 0.35;
      inter.x = ball.position.x; inter.y = ball.position.y; inter.z = ball.position.z;
    });
  }
}
