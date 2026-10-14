/* Titelbildschirm, Spielstände, neues Spiel (Modus → Figur → Start), Pause, Einstellungen, Hilfe. */
import type { Game } from '../game.ts';
import { applyBI1Import, browserKV, newSave, readBI1Saves, SLOT_COUNT, type GameMode, type SaveData } from '../persistence/save.ts';
import { DEFAULT_APPEARANCE, PRESETS, sanitizeAppearance } from '../characters/appearance.ts';
import { BTN_LABEL, DEFAULT_KEYS, type Btn } from '../input/input.ts';
import { recentErrors } from '../core/log.ts';
import { btn, clear, closeAllModals, confirmBox, h, modal, seg, slider, uiRoot } from './dom.ts';
import { openEditor } from './editor.ts';

declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;
export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
export const BUILD = typeof __APP_BUILD__ !== 'undefined' ? __APP_BUILD__ : '';

export interface MenuHooks { play(save: SaveData): void; toTitle(): void; afterSettings(): void; unlockAudio(): void }

const fmtTime = (s: number) => { const h2 = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h2 ? h2 + ' Std ' + m + ' Min' : m + ' Min'; };

export class Menus {
  private titleEl: HTMLElement | null = null;
  constructor(private g: Game, private hooks: MenuHooks) { }

  /* ---------- Titel ---------- */
  showTitle(): void {
    this.titleEl?.remove();
    const last = this.g.store.getMeta().last;
    const lastInfo = last ? this.g.store.info(last) : null;
    const cont = lastInfo?.exists && !lastInfo.corrupt;
    const logo = h('div', { class: 'title-logo' },
      h('div', { class: 'big' }, h('span', { class: 'c1' }, 'B'), h('span', { class: 'c2' }, 'u'), h('span', { class: 'c3' }, 'n'), h('span', { class: 'c4' }, 't'), h('span', { class: 'c5' }, 'e'), ' ',
        h('span', { class: 'c4' }, 'I'), h('span', { class: 'c3' }, 'n'), h('span', { class: 'c2' }, 's'), h('span', { class: 'c1' }, 'e'), h('span', { class: 'c5' }, 'l'), h('span', { class: 'two' }, '2 ♥')),
      h('div', { class: 'sub' }, 'Das große Abenteuer – deine Insel, viele Welten, ein Geheimnis'));
    const menu = h('div', { class: 'title-menu' },
      cont ? btn('▶ Weiterspielen' + (lastInfo!.name ? ' – ' + lastInfo!.name : ''), () => { this.hooks.unlockAudio(); this.loadSlot(last); }, 'green', { id: 'btn-continue' }) : null,
      btn('📂 Spielstände', () => { this.hooks.unlockAudio(); this.showSlots(); }, cont ? 'blue' : 'green', { id: 'btn-slots' }),
      btn('⚙️ Einstellungen', () => this.showSettings(), 'ghost'),
      btn('❓ Hilfe & Steuerung', () => this.showHelp(), 'ghost'));
    this.titleEl = h('div', { class: 'screen', id: 'title' }, logo, menu, h('div', { class: 'title-foot' }, 'Version ' + VERSION + (BUILD ? ' · ' + BUILD : '') + ' · Nachfolger von Bunte Insel · Alles bleibt auf deinem Gerät'));
    uiRoot().append(this.titleEl);
  }
  hideTitle(): void { this.titleEl?.remove(); this.titleEl = null; }

  loadSlot(slot: number): void {
    const r = this.g.store.load(slot);
    if (!r.ok) {
      if (r.reason === 'empty') { this.newGame(slot); return; }
      const m = modal({ title: 'Spielstand ' + slot + ' lässt sich nicht laden', icon: '⚠️' });
      m.body.append(h('p', null, r.reason === 'newer' ? 'Dieser Spielstand stammt aus einer neueren Version. Bitte aktualisiere das Spiel.' : 'Der Spielstand ist beschädigt (' + r.message + '). Die Sicherungskopie war auch nicht lesbar.'));
      m.footer.classList.remove('hidden');
      m.footer.append(btn('Zurück', () => m.close(), 'ghost'), r.reason === 'corrupt' ? btn('Platz leeren', () => { this.g.store.remove(slot); m.close(); this.showSlots(); }, 'danger') : null as unknown as HTMLElement);
      return;
    }
    if (r.fromBackup) this.g.toast('Der letzte Spielstand war beschädigt – die Sicherungskopie wurde geladen.', '🛟', 5000);
    closeAllModals();
    this.hideTitle();
    this.hooks.play(r.data);
  }

  /* ---------- Spielstände ---------- */
  showSlots(): void {
    const m = modal({ title: 'Spielstände', icon: '📂', wide: true });
    const draw = () => {
      clear(m.body);
      const grid = h('div', { class: 'slots' });
      for (let s = 1; s <= SLOT_COUNT; s++) {
        const i = this.g.store.info(s);
        const card = h('div', { class: 'slot', id: 'slot-' + s });
        if (!i.exists) {
          card.append(h('div', { class: 'avatar' }, '✨'), h('h3', null, 'Platz ' + s + ' – frei'), h('p', { class: 'muted' }, 'Starte ein neues Abenteuer.'),
            btn('➕ Neues Spiel', () => { m.close(); this.newGame(s); }, 'green'));
        } else if (i.corrupt) {
          card.append(h('div', { class: 'avatar' }, '⚠️'), h('h3', null, 'Platz ' + s + ' – beschädigt'), btn('Platz leeren', () => confirmBox('Platz leeren?', 'Der beschädigte Spielstand wird gelöscht.', 'Löschen', () => { this.g.store.remove(s); draw(); }, true), 'danger'));
        } else {
          card.append(h('span', { class: 'chip mode' }, i.mode === 'story' ? '📖 Story' : '🌍 Freie Welt'), h('div', { class: 'avatar' }, '🙂'),
            h('h3', null, i.name), h('div', { class: 'muted' }, '⭐ ' + i.stars + ' · Stufe ' + i.level + (i.mode === 'story' ? ' · Kapitel ' + (i.chapter + 1) : '')),
            h('div', { class: 'muted' }, '⏱ ' + fmtTime(i.playTime) + ' · zuletzt ' + new Date(i.updated).toLocaleDateString('de-DE')),
            btn('▶ Spielen', () => { m.close(); this.loadSlot(s); }, 'green'),
            h('div', { class: 'row' },
              btn('📤', () => this.exportSlot(s), 'ghost small', { title: 'Sicherungsdatei speichern', 'aria-label': 'Exportieren' }),
              btn('🗑️', () => confirmBox('Spielstand löschen?', '„' + i.name + '“ wird endgültig gelöscht. Das kann man nicht rückgängig machen.', 'Löschen', () => { this.g.store.remove(s); draw(); }, true), 'danger small', { 'aria-label': 'Löschen' })));
        }
        card.append(btn('📥 Datei laden', () => this.importSlot(s, draw), 'ghost small'));
        grid.append(card);
      }
      m.body.append(grid);
      const bi1 = readBI1Saves(browserKV());
      if (bi1.length) m.body.append(h('p', { class: 'muted', style: 'margin-top:14px' }, '💡 Auf diesem Gerät gibt es Spielstände aus Bunte Insel 1. Beim Start eines neuen Spiels kannst du Erinnerungen daraus übernehmen – dein altes Spiel bleibt dabei unverändert.'));
    };
    draw();
  }
  private exportSlot(s: number): void {
    const txt = this.g.store.exportSlot(s);
    if (!txt) { this.g.toast('Export nicht möglich.', '⚠️'); return; }
    const a = h('a', { href: URL.createObjectURL(new Blob([txt], { type: 'application/json' })), download: 'bunte-insel-2-spielstand-' + s + '.json' });
    document.body.append(a); a.click(); a.remove();
  }
  private importSlot(s: number, after: () => void): void {
    const inp = h('input', { type: 'file', accept: '.json,application/json' }) as HTMLInputElement;
    inp.onchange = () => {
      const f = inp.files?.[0]; if (!f) return;
      f.text().then(t => {
        const go = () => { const r = this.g.store.importSlot(s, t); this.g.toast(r.message, r.ok ? '✅' : '⚠️', 3500); after(); };
        if (this.g.store.info(s).exists) confirmBox('Überschreiben?', 'Platz ' + s + ' ist belegt. Mit der Datei überschreiben?', 'Überschreiben', go, true); else go();
      });
    };
    inp.click();
  }

  /* ---------- Neues Spiel ---------- */
  newGame(slot: number): void {
    const m = modal({ title: 'Wie möchtest du spielen?', icon: '🌈', wide: true });
    const choose = (mode: GameMode) => { m.close(); this.bi1Step(slot, mode); };
    m.body.append(h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fit,minmax(260px,1fr))' },
      h('div', { class: 'card', id: 'mode-story' }, h('h3', null, '📖 Story-Modus'),
        h('p', null, 'Der Regenbogen-Kompass ist zerbrochen! Die Wege zwischen den Welten spielen verrückt und Bewohner vergessen Dinge. Finde heraus, was dahintersteckt – Kapitel für Kapitel, mit Entscheidungen und einem großen Finale.'),
        h('p', { class: 'muted' }, 'Welten öffnen sich im Lauf der Geschichte.'), btn('Story beginnen', () => choose('story'), 'grape')),
      h('div', { class: 'card', id: 'mode-free' }, h('h3', null, '🌍 Freie Welt'),
        h('p', null, 'Alle Inseln und Welten sind sofort offen. Erkunde, sprich mit allen, spiele die Weltgeschichten, sammle, fahre, baue Freundschaften auf – ganz in deinem Tempo.'),
        h('p', { class: 'muted' }, 'Ohne Hauptgeschichte, mit allen Nebenabenteuern.'), btn('Frei spielen', () => choose('free'), 'blue'))));
    m.body.append(h('p', { class: 'muted', style: 'margin-top:12px' }, 'Jeder Spielstand hat seinen eigenen Modus und eigenen Fortschritt.'));
  }
  private bi1Step(slot: number, mode: GameMode): void {
    const bi1 = readBI1Saves(browserKV());
    if (!bi1.length) { this.editorStep(slot, mode, null); return; }
    const m = modal({ title: 'Erinnerungen aus Bunte Insel 1', icon: '🏝️' });
    m.body.append(h('p', null, 'Wir haben Spielstände aus Bunte Insel 1 gefunden. Möchtest du deinen Namen, ein paar Bonus-Sterne und ein Erinnerungsabzeichen mitnehmen? Dein altes Spiel wird dabei nur gelesen und nicht verändert.'));
    for (const b of bi1) m.body.append(h('div', { class: 'card row', style: 'margin:8px 0' }, h('div', null, h('b', null, (b.name || 'Spielstand') + ' (Platz ' + b.slot + ')'), h('div', { class: 'muted' }, '⭐ ' + b.stars + ' · 🏅 ' + b.stickers + ' Sticker')), h('span', { class: 'spacer' }),
      btn('Übernehmen', () => { m.close(); this.editorStep(slot, mode, b); }, 'green small')));
    m.footer.classList.remove('hidden');
    m.footer.append(btn('Ohne Übernahme starten', () => { m.close(); this.editorStep(slot, mode, null); }, 'ghost'));
  }
  private editorStep(slot: number, mode: GameMode, bi1: ReturnType<typeof readBI1Saves>[number] | null): void {
    this.hideTitle();
    const preset = PRESETS[0];
    openEditor(this.g, {
      look: sanitizeAppearance({ ...DEFAULT_APPEARANCE, ...preset.look }), name: bi1?.name || '', owned: [], askName: true, title: 'Deine Figur',
      cancel: () => { this.showTitle(); },
      done: (look, name) => {
        let s = newSave(slot, mode, name, look);
        if (bi1) s = applyBI1Import(s, bi1);
        if (mode === 'free') { s.story.chapter = 0; s.flags.free_mode = 1; }
        this.g.store.save(s);
        this.hooks.play(s);
      }
    });
  }

  /* ---------- Pause ---------- */
  showPause(extra: { label: string; act: () => void; cls?: string }[]): void {
    const g = this.g;
    g.paused = true;
    const m = modal({ title: 'Pause', icon: '⏸️', onClose: () => { g.paused = false; } });
    const s = g.save;
    m.body.append(h('div', { class: 'card', style: 'margin-bottom:12px' }, h('b', null, s.name), h('div', { class: 'muted' }, (s.mode === 'story' ? '📖 Story-Modus' : '🌍 Freie Welt') + ' · ⭐ ' + s.stars + ' · gespielt ' + fmtTime(s.playTime))));
    const list = h('div', { class: 'title-menu', style: 'width:100%' },
      btn('▶ Weiterspielen', () => m.close(), 'green'),
      ...extra.map(e => btn(e.label, () => { m.close(); e.act(); }, e.cls ?? 'ghost')),
      btn('💾 Jetzt speichern', () => { if (g.persist()) g.toast('Gespeichert!', '💾'); }, 'blue'),
      btn('⚙️ Einstellungen', () => this.showSettings(), 'ghost'),
      btn('❓ Hilfe', () => this.showHelp(), 'ghost'),
      btn('🏠 Speichern & zum Titel', () => { m.close(); g.persist(); this.hooks.toTitle(); }, 'ghost'));
    m.body.append(list);
  }

  /* ---------- Einstellungen ---------- */
  showSettings(): void {
    const g = this.g, st = g.settings;
    const save = () => { g.store.saveSettings(st); this.hooks.afterSettings(); };
    const m = modal({ title: 'Einstellungen', icon: '⚙️', tabs: [{ id: 'grafik', label: '🖼️ Grafik' }, { id: 'ton', label: '🔊 Ton' }, { id: 'spiel', label: '🎮 Spiel' }, { id: 'tasten', label: '⌨️ Tasten' }, { id: 'info', label: 'ℹ️ Info' }],
      onTab: id => draw(id), onClose: save });
    const row = (label: string, ctl: HTMLElement) => h('div', { class: 'toggle' }, h('span', null, label), ctl);
    const chk = (v: boolean, on: (b: boolean) => void) => { const c = h('input', { type: 'checkbox', checked: v }); c.addEventListener('change', () => { on((c as HTMLInputElement).checked); save(); }); return c; };
    const draw = (id: string) => {
      clear(m.body);
      if (id === 'grafik') {
        m.body.append(row('Grafikqualität', seg([{ v: 'auto', l: 'Automatisch' }, { v: 'low', l: 'Sparsam' }, { v: 'medium', l: 'Mittel' }, { v: 'high', l: 'Schön' }], st.quality, v => { g.setQuality(v); })),
          h('p', { class: 'muted' }, 'Automatisch passt die Auflösung an dein Gerät an. „Sparsam“ schont den Akku (keine Schatten, weniger Gras).'),
          row('Weniger Bewegung', chk(st.reduceMotion, b => { st.reduceMotion = b; })),
          row('Bildrate anzeigen', chk(st.showFps, b => { st.showFps = b; })));
      } else if (id === 'ton') {
        const vol = (label: string, k: 'musicVol' | 'sfxVol' | 'ambientVol') => row(label, slider(0, 1, 0.05, st[k], v => { st[k] = v; save(); }));
        m.body.append(vol('Musik', 'musicVol'), vol('Geräusche', 'sfxVol'), vol('Umgebung', 'ambientVol'), row('Ton aus', chk(st.muted, b => { st.muted = b; })),
          row('Vorlesen (Browser-Stimme)', chk(st.tts, b => { st.tts = b; })), h('p', { class: 'muted' }, 'Vorlesen liest Gespräche und Aufgaben mit der eingebauten Stimme des Geräts vor.'));
      } else if (id === 'spiel') {
        m.body.append(row('Schwierigkeit (Wald-Kämpfe, Rätselzeit)', seg([{ v: 'easy', l: 'Leicht' }, { v: 'normal', l: 'Normal' }, { v: 'hard', l: 'Schwer' }], st.difficulty, v => { st.difficulty = v; save(); })),
          row('Hilfen', seg([{ v: 'off', l: 'Aus' }, { v: 'gentle', l: 'Sanft' }, { v: 'full', l: 'Viele' }], st.hints, v => { st.hints = v; save(); })),
          h('p', { class: 'muted' }, 'Hinweise gibt es immer im Tagebuch (📖 → Hinweis). „Viele“ zeigt zusätzlich Tipps automatisch an.'),
          row('Kamera-Empfindlichkeit', slider(0.4, 2, 0.1, st.camSens, v => { st.camSens = v; g.input.sens = v; save(); })),
          row('Kamera vertikal umkehren', chk(st.invertY, b => { st.invertY = b; g.input.invertY = b; })),
          row('Größe der Touch-Knöpfe', slider(0.8, 1.4, 0.05, st.touchScale, v => { st.touchScale = v; document.documentElement.style.setProperty('--ui-scale', String(v)); save(); })),
          row('Text-Tempo', slider(0.5, 2, 0.1, st.textSpeed, v => { st.textSpeed = v; save(); })));
      } else if (id === 'tasten') {
        const keys = Object.keys(BTN_LABEL) as Btn[];
        for (const k of keys) {
          const cur = g.input.keysFor(k);
          const b = btn(cur.map(c => c.replace(/^Key|^Digit/, '')).join(' / '), () => {
            b.textContent = '… Taste drücken'; g.input.capture = code => { st.keys[k] = code; g.input.setKeys(st.keys); save(); draw('tasten'); };
          }, 'ghost small');
          m.body.append(row(BTN_LABEL[k], b));
        }
        m.body.append(h('div', { class: 'row', style: 'margin-top:12px' }, btn('↺ Standard', () => { st.keys = {}; g.input.setKeys({}); save(); draw('tasten'); }, 'ghost')),
          h('p', { class: 'muted' }, 'Gamepads (Xbox, PlayStation, Switch) werden automatisch erkannt. Laufen: WASD/Pfeile, Kamera: Maus ziehen.'));
        void DEFAULT_KEYS;
      } else {
        m.body.append(h('p', null, 'Bunte Insel 2 · Version ' + VERSION + (BUILD ? ' (' + BUILD + ')' : '')), h('p', { class: 'muted' }, 'Spielstände und Einstellungen bleiben nur auf diesem Gerät (localStorage). Es gibt keine Konten und keine Werbung.'),
          h('p', { class: 'muted' }, 'Three.js r' + THREE.REVISION + ' (MIT). Geräusche: CC0 / gemeinfrei. Musik: eigene Kompositionen aus Bunte Insel, im Browser erzeugt.'),
          h('p', { class: 'muted' }, 'Grafik: ' + g.renderer.profile.name + ' · ' + (g.renderer.gl.capabilities.isWebGL2 ? 'WebGL 2' : 'WebGL 1')),
          ...(recentErrors().length ? [h('details', null, h('summary', null, 'Letzte Fehler'), h('pre', { style: 'white-space:pre-wrap;font-size:.8rem' }, recentErrors().join('\n')))] : []));
      }
    };
  }
  /* ---------- Hilfe ---------- */
  showHelp(): void {
    const m = modal({ title: 'Hilfe & Steuerung', icon: '❓', tabs: [{ id: 'start', label: '🌟 Erste Schritte' }, { id: 'steuer', label: '🎮 Steuerung' }, { id: 'welt', label: '🗺️ Die Welt' }, { id: 'kampf', label: '🌲 Wald' }], onTab: id => draw(id) });
    const P = (t: string) => h('p', null, t);
    const draw = (id: string) => {
      clear(m.body);
      if (id === 'start') m.body.append(P('Willkommen auf der Bunten Insel! Lauf herum, sprich mit den Bewohnern (✋ Aktion) und schau ins Tagebuch 📖 – dort stehen deine Aufgaben und Tipps.'),
        P('Oben links siehst du dein aktuelles Ziel. Antippen öffnet das Tagebuch. Die Karte 🗺️ zeigt alle Inseln; an Weltensteinen kannst du schnell reisen.'),
        P('Steckst du fest? Im Tagebuch gibt es zu jeder Aufgabe drei Hinweise – vom kleinen Tipp bis zur Lösung.'));
      if (id === 'steuer') m.body.append(h('table', { style: 'width:100%;border-spacing:0 6px' }, ...[
        ['Laufen', 'WASD / Pfeile', 'Joystick links', 'Linker Stick'], ['Rennen', 'Umschalt', '🏃 oder Stick ganz raus', 'RT'], ['Springen / Doppelsprung', 'Leertaste', '⤒', 'B'],
        ['Aktion / Reden / Einsteigen', 'E', '✋ (zeigt, was geht)', 'A'], ['Zweite Aktion', 'F', '✦', 'Y'], ['Kamera', 'Maus ziehen, Rad = Abstand, C', 'rechts wischen', 'Rechter Stick'],
        ['Karte / Tagebuch / Rucksack', 'M / Q / I', 'Knöpfe oben rechts', 'Steuerkreuz'], ['Pause', 'Esc', '⏸️', 'Start']
      ].map(r => h('tr', null, h('td', null, h('b', null, r[0])), h('td', null, h('span', { class: 'kbd' }, r[1])), h('td', { class: 'muted' }, r[2]), h('td', { class: 'muted' }, r[3])))));
      if (id === 'welt') m.body.append(P('Die Hauptinsel Sonnenhafen ist der Mittelpunkt. Brücken führen zu allen anderen Welten: Stadtinsel, Fellretter-Bucht, Drachenhöhen, Dampfer-Hafen, Märchenland, Schlüsselreich, Wunsch-Insel, Regenbogenwelt, Hüpfland, Fußball-Arena, Rätsel-Insel, Lunaris, Funkwelle, Freizeitpark, Taschi-Land, Bauland, Prisma-Insel, Schwammi-Bucht – und tief unter der Erde Atlantis.'),
        P('Fahrzeuge stehen überall bereit. Steig mit ✋ ein und mit ✋ wieder aus.'));
      if (id === 'kampf') m.body.append(P('Gekämpft wird nur im Verbotenen Wald im Nordwesten der Hauptinsel. Überall sonst gibt es keine Kämpfe.'),
        P('⚔️ Schlag (J) – dreimal hintereinander für eine Kombo. 🌀 Rolle (K) weicht aus. 🛡️ Abwehr (L) halten. 🌟 Lichtwelle (U) braucht Energie.'),
        P('Wer alle Herzen verliert, wacht am Waldtor wieder auf – nichts geht verloren. Monster verpuffen in Sterne.'));
    };
  }
}
