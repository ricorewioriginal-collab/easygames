/* Gespräche: Rollenspiel-Textfeld mit Porträt, Schreibmaschinen-Text, Antwort-Auswahl, Aktionen, Vorlesen.
   Reihenfolge: Quest-Gespräch dieser Phase → Quest-Angebote → eigene Themen → Plaudern/Schenken/Laden. */
import type { Game } from '../game.ts';
import { h, uiRoot } from '../ui/dom.ts';
import type { NpcDef, NpcSystem } from './npc.ts';
import type { DialogTree, DNode, QuestDef } from './quests.ts';
import type { Action } from './script.ts';
import { ITEMS } from '../data/items.ts';

export interface DialogueHost {
  check: (c: import('./script.ts').Cond | undefined) => boolean;
  run: (a: Action[] | undefined, npc?: string) => void;
  offers: (npc: string) => QuestDef[];
  questDialog: (npc: string) => { q: QuestDef; tree: DialogTree } | null;
}

export class Dialogue {
  private el: HTMLElement | null = null;
  private typing = 0;
  private full = '';
  private lineEl: HTMLElement | null = null;
  private advance: (() => void) | null = null;
  active = false;
  constructor(private g: Game, private npcs: NpcSystem, private host: DialogueHost) { }

  private say(text: string): void {
    if (!this.g.settings.tts || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
      u.lang = 'de-DE'; u.rate = 1.0; u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch { /* ohne Stimme */ }
  }
  private fmt(t: string): string { return t.replace(/\{name\}/g, this.g.save.name); }
  private pick(t: string | string[] | undefined): string {
    if (!t) return '';
    if (Array.isArray(t)) return t[Math.floor(Math.random() * t.length)];
    return t;
  }

  /** Gespräch mit einer Figur beginnen. */
  talk(npcId: string): void {
    const d = this.npcs.defs.get(npcId);
    if (!d || this.active) return;
    this.npcs.talkingTo = npcId;
    this.npcs.face(npcId, this.g.player.pos.x, this.g.player.pos.z);
    const live = this.npcs.live.get(npcId);
    if (live) this.g.player.yaw = Math.atan2(live.pos.x - this.g.player.pos.x, live.pos.z - this.g.player.pos.z);
    if (d.sound) this.g.sfx(d.sound, 0.6);
    const qd = this.host.questDialog(npcId);
    const tree = qd ? qd.tree : this.defaultTree(d);
    this.runTree(tree, 'start', npcId);
    this.g.events.emit('talk', { npc: npcId });
  }
  /** Freier Dialogbaum (z. B. von einer Tafel oder einem Ereignis). */
  runTree(tree: DialogTree, start: string, npcId?: string): void {
    this.active = true;
    this.g.busy++;
    this.show(tree, start, npcId);
  }
  private defaultTree(d: NpcDef): DialogTree {
    const s = this.g.save, rel = s.npcs[d.id] ?? { friend: 0, lastTalkDay: -1, talks: 0, gifts: 0 };
    const live = this.npcs.live.get(d.id);
    const tree: DialogTree = { ...(d.dialog ?? {}) };
    const offers = this.host.offers(d.id);
    const choices: NonNullable<DNode['choices']> = [];
    for (const q of offers) {
      const key = 'offer:' + q.id;
      if (q.offer) {
        for (const [k, n] of Object.entries(q.offer)) tree[key + ':' + k] = this.prefix(n, key + ':');
        choices.push({ t: '📜 ' + q.title, to: key + ':start' });
      } else {
        tree[key] = { t: q.summary, choices: [{ t: '✅ Klar, ich helfe!', do: [{ start: q.id }] }, { t: 'Vielleicht später.' }] };
        choices.push({ t: '📜 ' + q.title, to: key });
      }
    }
    for (const tp of d.topics ?? []) if (this.host.check(tp.if)) choices.push({ t: '❓ ' + tp.label, to: tp.to });
    choices.push({ t: '💬 Plaudern', to: '__chat' });
    const gifts = Object.keys(s.inventory).filter(i => ITEMS[i]?.gift);
    if (gifts.length) choices.push({ t: '🎁 Etwas schenken', to: '__gift' });
    if (d.shop) choices.push({ t: '🛍️ Was verkaufst du?', do: [{ shop: d.shop }] });
    choices.push({ t: '👋 Tschüss!' });
    const greet = live?.asleep ? ['Hmm … Zzz … Oh, du bist es. Es ist schon spät, oder?', 'Psst … ich schlafe schon fast. Was gibt’s?'] : rel.friend >= 6 ? d.greet.map(x => x.replace(/^Hallo/, 'Hallo, liebe Freundin, lieber Freund')) : d.greet;
    tree.start = { t: greet, choices };
    tree.__chat = { t: d.chat, do: [{ friend: 1 }], next: 'start' };
    tree.__gift = { t: 'Oh, ein Geschenk? Für mich?', do: [{ panel: 'gift', panelArg: d.id }], end: true };
    return tree;
  }
  private prefix(n: DNode, p: string): DNode {
    return { ...n, next: n.next ? p + n.next : undefined, branch: n.branch?.map(b => ({ ...b, to: p + b.to })), choices: n.choices?.map(c => ({ ...c, to: c.to ? p + c.to : undefined })) };
  }
  private show(tree: DialogTree, id: string, npcId?: string): void {
    let node = tree[id];
    let guard = 0;
    while (node?.branch && guard++ < 10) {
      const b = node.branch.find(x => this.host.check(x.if));
      if (!b) break;
      node = tree[b.to];
    }
    if (!node) { this.close(); return; }
    this.host.run(node.do, npcId);
    if (!this.active) return; // Aktion hat das Gespräch beendet (z. B. Laden geöffnet)
    const speakerId = node.who && node.who !== 'player' ? node.who : npcId;
    const speaker = node.who === 'player' ? null : speakerId ? this.npcs.defs.get(speakerId) : null;
    if (node.emote && speakerId) this.npcs.emote(speakerId, node.emote as never, 1.8);
    const text = this.fmt(this.pick(node.t));
    const choices = (node.choices ?? []).filter(c => this.host.check(c.if));
    const friend = speaker ? this.g.save.npcs[speaker.id]?.friend ?? 0 : 0;
    this.render(node.who === 'player' ? '🙂' : speaker?.icon ?? '💬', node.who === 'player' ? this.g.save.name : speaker?.name ?? '', text, friend, choices.map(c => ({
      t: this.fmt(c.t), note: c.note,
      go: () => {
        this.host.run(c.do, npcId);
        if (!this.active) return;
        if (c.to) this.show(tree, c.to, npcId); else this.close();
      }
    })), node.end ? null : node.next ? () => this.show(tree, node!.next!, npcId) : choices.length ? null : () => this.close());
  }
  private render(face: string, who: string, text: string, friend: number, choices: { t: string; note?: string; go: () => void }[], onNext: (() => void) | null): void {
    this.el?.remove();
    this.lineEl = h('div', { class: 'line' });
    const hearts = friend > 0 ? h('span', { class: 'hearts-mini', title: 'Freundschaft' }, '❤️'.repeat(Math.min(5, Math.ceil(friend / 2)))) : null;
    const ch = h('div', { class: 'choices' });
    this.el = h('div', { class: 'dialog panel', role: 'dialog', 'aria-live': 'polite' }, h('div', { class: 'face' }, face), h('div', { class: 'txt' }, h('div', { class: 'who' }, who, hearts), this.lineEl, ch));
    uiRoot().append(this.el);
    this.full = text; this.typing = 0; this.lineEl.textContent = '';
    this.say(text);
    const showChoices = () => {
      ch.replaceChildren(...choices.map((c, i) => h('button', { type: 'button', 'data-i': i, onclick: (e: Event) => { e.stopPropagation(); this.g.sfx('click', 0.6); c.go(); } }, c.t, c.note ? h('div', { class: 'dlg-choice-note' }, c.note) : null)));
      if (!choices.length && onNext) ch.replaceChildren(h('span', { class: 'next' }, '▶ weiter'));
      (ch.querySelector('button') as HTMLElement | null)?.focus({ preventScroll: true });
    };
    this.advance = () => {
      if (this.typing < this.full.length) { this.typing = this.full.length; this.lineEl!.textContent = this.full; showChoices(); return; }
      if (!choices.length && onNext) { this.g.sfx('click', 0.4); onNext(); }
    };
    this.el.addEventListener('click', () => this.advance?.());
    this.showChoicesLater = showChoices;
  }
  private showChoicesLater: (() => void) | null = null;
  private close(): void {
    this.el?.remove(); this.el = null; this.advance = null;
    if (this.active) { this.active = false; this.g.busy = Math.max(0, this.g.busy - 1); }
    this.npcs.talkingTo = null;
    try { speechSynthesis?.cancel(); } catch { /* egal */ }
  }
  /** Von außen beenden (z. B. Panel öffnet sich). */
  end(): void { this.close(); }
  update(dt: number): void {
    if (!this.el || !this.lineEl) return;
    if (this.typing < this.full.length) {
      const before = Math.floor(this.typing);
      this.typing += dt * 45 * this.g.settings.textSpeed;
      const n = Math.floor(this.typing);
      if (n !== before) { this.lineEl.textContent = this.full.slice(0, n); if (n % 4 === 0) this.g.sfx('talk', 0.5); }
      if (this.typing >= this.full.length) { this.lineEl.textContent = this.full; this.showChoicesLater?.(); }
    }
    const inp = this.g.input;
    if (inp.pressed('action') || inp.pressed('jump')) {
      const btns = this.el.querySelectorAll<HTMLButtonElement>('.choices button');
      if (this.typing >= this.full.length && btns.length) {
        const f = document.activeElement as HTMLElement | null;
        (f && f.closest('.choices') ? f : btns[0]).click();
      } else this.advance?.();
    }
    // Pfeiltasten wählen Antworten
    if (inp.moveY !== 0 && this.el.querySelector('.choices button')) {
      this.navCooldown -= dt;
      if (this.navCooldown <= 0 && Math.abs(inp.moveY) > 0.6) {
        this.navCooldown = 0.22;
        const btns = [...this.el.querySelectorAll<HTMLButtonElement>('.choices button')];
        const i = btns.indexOf(document.activeElement as HTMLButtonElement);
        btns[(i + (inp.moveY > 0 ? -1 : 1) + btns.length) % btns.length]?.focus();
      }
    } else this.navCooldown = 0;
  }
  private navCooldown = 0;
}
