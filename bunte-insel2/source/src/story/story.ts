/* Hauptgeschichte „Der zerbrochene Regenbogen-Kompass“.
   Story-Modus: Kapitel öffnen die Welten nach und nach (Lichtschleier an den Brücken), die Hauptquest des Kapitels startet von selbst.
   Freie Welt: nichts ist gesperrt, die Hauptquests gibt es dort nicht (Weltgeschichten und Nebenabenteuer schon). */
import type { Game, GameSystem } from '../game.ts';
import type { Hud } from '../ui/hud.ts';
import type { QuestEngine } from '../gameplay/quests.ts';
import type { NpcSystem } from '../gameplay/npc.ts';
import type { Dialogue } from '../gameplay/dialogue.ts';
import type { Action, Cond } from '../gameplay/script.ts';
import type { TrackerInfo } from '../ui/hud.ts';
import { insideDepth } from '../world/terrain.ts';
import { BRIDGES, bridgeEnds } from '../world/layout.ts';
import { h, modal, btn } from '../ui/dom.ts';

export interface StoryHost { quests: QuestEngine; npcs: NpcSystem; run(a: Action[] | undefined, npc?: string): void; check(c: Cond | undefined): boolean; achieve(id: string): void; dialogue: Dialogue }

export const CHAPTERS = [
  { n: 0, title: 'Prolog: Der Sturm über dem Leuchtturm', quest: 'main_0', icon: '🌩️' },
  { n: 1, title: 'Kapitel 1: Splitter in der Stadt', quest: 'main_1', icon: '🏙️' },
  { n: 2, title: 'Kapitel 2: Spuren im Sand', quest: 'main_2', icon: '🐾' },
  { n: 3, title: 'Kapitel 3: Farbe und Feuer', quest: 'main_3', icon: '🐉' },
  { n: 4, title: 'Kapitel 4: Vergessene Erinnerungen', quest: 'main_4', icon: '🌈' },
  { n: 5, title: 'Kapitel 5: Das Licht der Märchen', quest: 'main_5', icon: '🏰' },
  { n: 6, title: 'Kapitel 6: Tief unter den Wellen', quest: 'main_6', icon: '🔱' },
  { n: 7, title: 'Kapitel 7: Die Prisma-Insel', quest: 'main_7', icon: '🌀' },
  { n: 8, title: 'Finale: Das Herz des Waldes', quest: 'main_8', icon: '🌑' },
  { n: 9, title: 'Epilog: Das große Insel-Fest', quest: '', icon: '🎉' }
];

export class Story implements GameSystem {
  id = 'story';
  hud: Hud | null = null;
  private veils = new THREE.Group();
  private veilFor = new Map<string, THREE.Mesh[]>();
  private pushT = 0;
  constructor(private g: Game, private host: StoryHost) {
    g.scene.add(this.veils);
    g.panels.storyRecap = () => this.recap();
  }
  get chapter(): number { return this.g.save?.story.chapter ?? 0; }
  setChapter(n: number): void {
    const s = this.g.save;
    if (n <= s.story.chapter) return;
    s.story.chapter = n;
    const c = CHAPTERS[n];
    if (c) this.hud?.banner(c.icon + ' ' + c.title, s.mode === 'story' ? 'Neue Welten sind erreichbar!' : '');
    this.g.sfx('quest');
    this.buildVeils();
    this.ensureMain();
    if (n >= 9) this.host.achieve('insel_fest');
  }
  /** Welche Welt öffnet sich in welchem Kapitel (Story-Modus). */
  worldChapter(id: string): number { return this.g.worlds.byId(id)?.chapter ?? 0; }
  locked(id: string): boolean { return this.g.save?.mode === 'story' && this.worldChapter(id) > this.chapter; }
  lockReason(id: string): string { const c = CHAPTERS[this.worldChapter(id)]; return 'Öffnet sich in der Geschichte: ' + (c?.title ?? 'später'); }
  onStart(): void {
    this.buildVeils();
    this.ensureMain();
    if (this.g.save.mode === 'story' && !this.g.save.story.seen.includes('intro')) {
      this.g.save.story.seen.push('intro');
      setTimeout(() => this.intro(), 900);
    }
    if (this.g.save.mode === 'free' && !this.g.save.story.seen.includes('free_intro')) {
      this.g.save.story.seen.push('free_intro');
      setTimeout(() => this.hud?.banner('🌍 Freie Welt', 'Alle Inseln sind offen. Sprich mit den Bewohnern – viele haben Abenteuer für dich!'), 800);
    }
  }
  private ensureMain(): void {
    const s = this.g.save;
    if (s.mode !== 'story') return;
    const c = CHAPTERS[s.story.chapter];
    if (c?.quest && !s.quests[c.quest]) this.host.quests.start(c.quest);
  }
  private intro(): void {
    if (this.g.phase !== 'play') return;
    this.g.bark('Rosi', 'Da bist du! Der Sturm hat den Leuchtturm getroffen. Komm kurz zu mir!', '👩‍💼');
  }
  /** Lichtschleier vor den Brücken zu gesperrten Welten. */
  buildVeils(): void {
    for (const ms of this.veilFor.values()) for (const m of ms) { this.veils.remove(m); m.geometry.dispose(); }
    this.veilFor.clear();
    if (this.g.save?.mode !== 'story') return;
    const mat = new THREE.MeshBasicMaterial({ color: 0xb48aff, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
    for (const br of BRIDGES) {
      const target = this.locked(br.to) ? br.to : this.locked(br.from) ? br.from : null;
      if (!target) continue;
      const e = bridgeEnds(br);
      const atTo = target === br.to;
      const x = atTo ? e.bx : e.ax, z = atTo ? e.bz : e.az, ox = atTo ? e.ax : e.bx, oz = atTo ? e.az : e.bz;
      const L = Math.hypot(x - ox, z - oz), ux = (ox - x) / L, uz = (oz - z) / L;
      const px = x + ux * 8, pz = z + uz * 8, y = this.g.field.height(x, z) + 2.4;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.5), mat);
      m.position.set(px, y, pz); m.rotation.y = Math.atan2(ux, uz); m.renderOrder = 4;
      this.veils.add(m);
      const arr = this.veilFor.get(target) ?? []; arr.push(m); this.veilFor.set(target, arr);
    }
  }
  update(dt: number, t: number): void {
    const g = this.g;
    if (g.save.mode !== 'story') return;
    for (const ms of this.veilFor.values()) for (const m of ms) (m.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(t * 2 + m.position.x) * 0.08;
    // Gesperrte Welt betreten? → sanft zurück
    this.pushT -= dt;
    if (this.pushT > 0) return;
    this.pushT = 0.25;
    const p = g.player.pos;
    for (const w of g.worlds.defs) {
      if (!this.locked(w.id) || w.underground) continue;
      const f = insideDepth(w.shape, p.x, p.z);
      if (f > -14) {
        const dx = p.x - w.shape.x, dz = p.z - w.shape.z, L = Math.hypot(dx, dz) || 1;
        const tx = w.shape.x + dx / L * (w.shape.r + 24), tz = w.shape.z + dz / L * (w.shape.r + 24);
        if (g.vehicleCheck()) (g.system('vehicles') as unknown as { exit(f: boolean): void }).exit(true);
        g.teleport(tx, tz, Math.atan2(-dx, -dz));
        this.hud?.toast('🔒 ' + w.name + ' – ' + this.lockReason(w.id), undefined, 3500);
        break;
      }
    }
  }
  overrideTarget(): { x: number; z: number } | null { return null; }
  trackerOverride(): TrackerInfo | null { return null; }
  pauseExtras(): { label: string; act: () => void; cls?: string }[] {
    return this.g.save.mode === 'story' ? [{ label: '📖 Bisherige Geschichte', act: () => this.recap() }] : [];
  }
  recap(): void {
    const s = this.g.save;
    const m = modal({ title: 'Die Geschichte bisher', icon: '📖' });
    for (const c of CHAPTERS) {
      if (c.n > s.story.chapter) { m.body.append(h('div', { class: 'card locked', style: 'margin:6px 0' }, '🔒 ' + (c.n === s.story.chapter + 1 ? c.title : '???'))); continue; }
      const q = c.quest ? this.host.quests.defs.get(c.quest) : null;
      m.body.append(h('div', { class: 'card' + (q && s.quests[q.id]?.done ? ' on' : ''), style: 'margin:6px 0' }, h('b', null, c.icon + ' ' + c.title), q ? h('div', { class: 'muted' }, s.quests[q.id]?.done ? (q.rewards.text ?? q.summary) : q.summary) : null));
    }
    const ch = Object.entries(s.story.choices);
    if (ch.length) m.body.append(h('p', { class: 'muted' }, 'Deine Entscheidungen: ' + ch.map(([k, v]) => k + ' → ' + v).join(' · ')));
    m.footer.classList.remove('hidden'); m.footer.append(btn('Weiter', () => m.close(), 'green'));
  }
}
