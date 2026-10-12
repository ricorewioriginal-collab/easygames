/** Menüs: Titel, Hauptmenü, Levelauswahl, Modi, Tutorial, Effekte, Rekorde, Einstellungen, Pause, Ergebnis. */
import { button, clear, h } from '../core/dom';
import { formatScore, formatTime } from '../core/math';
import {
  recordKey,
  type Quality,
  type Settings,
  type SaveStore,
  type TouchPads,
} from '../core/storage';
import type { AudioEngine } from '../audio/engine';
import { DIFFICULTIES, DIFFICULTY_ORDER, type Difficulty } from '../game/difficulty';
import { LEVELS, WORLDS, type LevelDef } from '../game/levels';
import {
  ENDLESS_LEVEL,
  MODES,
  SELECTABLE_MODES,
  SPRINT_LEVEL,
  dailyLevel,
  remixLevel,
  type ModeId,
} from '../game/modes';
import type { Grade, Judgement } from '../game/scoring';
import { TUTORIAL_LEVEL } from '../game/tutorial';
import {
  EFFECTS,
  SLOT_LABELS,
  isUnlocked,
  requirementText,
  type EffectItem,
  type EffectSlot,
} from '../game/unlocks';

export interface MenuHost {
  readonly store: SaveStore;
  readonly audio: AudioEngine;
  startRun(mode: ModeId, level: LevelDef, difficulty: Difficulty): void;
  resume(): void;
  restart(): void;
  quitToMenu(): void;
  applySettings(): void;
  applyCosmetics(): void;
  previewLevel(level: LevelDef): void;
  installAvailable(): boolean;
  install(): void;
  unlockAudio(): void;
  isTouch(): boolean;
}

export interface ResultsView {
  mode: ModeId;
  level: LevelDef;
  difficulty: Difficulty;
  cleared: boolean;
  score: number;
  grade: Grade;
  stars: number;
  accuracy: number;
  counts: Record<Judgement, number>;
  maxCombo: number;
  orbs: number;
  orbsTotal: number;
  wallHits: number;
  seconds: number;
  newBestScore: boolean;
  newBestTime: boolean;
  unlocked: EffectItem[];
  next: LevelDef | null;
}

type Screen = () => HTMLElement;

const starText = (n: number): string => '★'.repeat(n) + '☆'.repeat(3 - n);

export class Menus {
  private stack: Screen[] = [];
  private levelMode: ModeId = 'campaign';
  private world = 0;
  private effectSlot: EffectSlot = 'ship';
  private settingsFromPause = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly host: MenuHost,
  ) {}

  private get store(): SaveStore {
    return this.host.store;
  }

  private click(): void {
    this.host.audio.sfx('ui');
  }

  private render(screen: Screen): void {
    clear(this.root);
    const el = screen();
    this.root.append(el);
    this.root.hidden = false;
    const first = el.querySelector<HTMLElement>('[data-autofocus], button:not([disabled])');
    if (first && !this.host.isTouch()) first.focus({ preventScroll: true });
  }

  /** Neuen Bildschirm öffnen (mit Zurück-Navigation). */
  private push(screen: Screen): void {
    this.click();
    this.stack.push(screen);
    this.render(screen);
  }

  private replace(screen: Screen): void {
    this.stack = [screen];
    this.render(screen);
  }

  back(): boolean {
    if (this.stack.length <= 1) return false;
    this.click();
    this.stack.pop();
    this.render(this.stack[this.stack.length - 1]);
    return true;
  }

  /** Aktuellen Bildschirm neu aufbauen (nach Änderungen). */
  refresh(): void {
    const top = this.stack[this.stack.length - 1];
    if (top) this.render(top);
  }

  hide(): void {
    clear(this.root);
    this.root.hidden = true;
    this.stack = [];
  }

  private panel(
    title: string,
    body: (HTMLElement | null)[],
    opts: { back?: boolean; testId?: string; wide?: boolean } = {},
  ): HTMLElement {
    return h(
      'section',
      {
        class: `panel ${opts.wide ? 'wide' : ''}`,
        attrs: { 'data-testid': opts.testId ?? 'panel' },
      },
      [
        h('header', { class: 'panel-head' }, [
          opts.back !== false
            ? h('button', {
                class: 'icon-btn',
                text: '←',
                attrs: { type: 'button', 'aria-label': 'Zurück', 'data-testid': 'back' },
                on: { click: () => this.back() },
              })
            : null,
          h('h2', { text: title }),
        ]),
        h('div', { class: 'panel-body' }, body),
      ],
    );
  }

  private difficultyPicker(onChange?: () => void): HTMLElement {
    const current = this.store.settings.difficulty;
    return h(
      'div',
      {
        class: 'segmented',
        attrs: {
          role: 'radiogroup',
          'aria-label': 'Schwierigkeitsgrad',
          'data-testid': 'difficulty',
        },
      },
      DIFFICULTY_ORDER.map((d) =>
        h('button', {
          class: `seg ${d === current ? 'active' : ''}`,
          text: DIFFICULTIES[d].label,
          attrs: {
            type: 'button',
            role: 'radio',
            'aria-checked': d === current ? 'true' : 'false',
            'data-testid': `diff-${d}`,
          },
          on: {
            click: () => {
              this.click();
              this.store.updateSettings({ difficulty: d });
              if (onChange) onChange();
              else this.refresh();
            },
          },
        }),
      ),
    );
  }

  // ------------------------------------------------------------------ Titel

  showTitle(): void {
    this.replace(() =>
      h('section', { class: 'title-screen', attrs: { 'data-testid': 'title' } }, [
        h('h1', { class: 'logo', text: 'PRISMRUSH', attrs: { 'aria-label': 'PRISMRUSH' } }),
        h('p', { class: 'tagline', text: 'Licht. Rhythmus. Geschwindigkeit.' }),
        button(
          'Spiel starten',
          () => {
            this.host.unlockAudio();
            this.showMain();
          },
          { variant: 'primary', testId: 'start' },
        ),
        h('p', {
          class: 'hint-small',
          text: this.host.isTouch()
            ? 'Tippen zum Starten · Kopfhörer empfohlen'
            : 'Enter zum Starten · Kopfhörer empfohlen',
        }),
      ]),
    );
  }

  // ------------------------------------------------------------- Hauptmenü

  showMain(): void {
    this.click();
    const p = this.store.progress();
    this.replace(() =>
      h('section', { class: 'main-menu', attrs: { 'data-testid': 'main-menu' } }, [
        h('h1', { class: 'logo small', text: 'PRISMRUSH' }),
        h('div', { class: 'menu-stats' }, [
          h('span', { text: `★ ${p.totalStars} / ${LEVELS.length * 3}` }),
          h('span', { text: `Level ${p.clearedLevels} / ${LEVELS.length}` }),
        ]),
        h('nav', { class: 'menu-list' }, [
          button('Kampagne', () => this.openLevels('campaign'), {
            variant: 'primary',
            testId: 'menu-campaign',
          }),
          button('Spielmodi', () => this.push(() => this.modesScreen()), { testId: 'menu-modes' }),
          button('Tutorial', () => this.push(() => this.tutorialScreen()), {
            testId: 'menu-tutorial',
          }),
          button('Effekte', () => this.push(() => this.effectsScreen()), {
            testId: 'menu-effects',
          }),
          button('Rekorde', () => this.push(() => this.recordsScreen()), {
            testId: 'menu-records',
          }),
          button('Einstellungen', () => this.openSettings(false), { testId: 'menu-settings' }),
          this.host.installAvailable()
            ? button('App installieren', () => this.host.install(), {
                variant: 'ghost',
                testId: 'menu-install',
              })
            : null,
        ]),
        h('p', { class: 'version', text: `v${__APP_VERSION__}` }),
      ]),
    );
  }

  // --------------------------------------------------------- Levelauswahl

  openLevels(mode: ModeId): void {
    this.levelMode = mode;
    const last = LEVELS.find((l) => l.id === this.store.data.lastLevel);
    this.world = last ? last.world : 0;
    this.push(() => this.levelsScreen());
  }

  private levelsScreen(): HTMLElement {
    const mode = this.levelMode;
    const diff = this.store.settings.difficulty;
    const tabs = h(
      'div',
      { class: 'tabs', attrs: { role: 'tablist' } },
      WORLDS.map((w) =>
        h('button', {
          class: `tab ${w.index === this.world ? 'active' : ''}`,
          text: `${w.index + 1}. ${w.name}`,
          attrs: {
            type: 'button',
            role: 'tab',
            'aria-selected': w.index === this.world ? 'true' : 'false',
            'data-testid': `world-${w.index}`,
          },
          on: {
            click: () => {
              this.click();
              this.world = w.index;
              this.refresh();
            },
          },
        }),
      ),
    );
    const world = WORLDS[this.world];
    const grid = h(
      'div',
      { class: 'level-grid' },
      LEVELS.filter((l) => l.world === this.world).map((l) => {
        const unlocked = this.store.isLevelUnlocked(l.index);
        const rec = this.store.record(recordKey(mode, l.id, diff));
        const stars = mode === 'campaign' ? this.store.levelStars(l.id) : (rec?.stars ?? 0);
        return h(
          'button',
          {
            class: `level-card ${unlocked ? '' : 'locked'}`,
            attrs: {
              type: 'button',
              'data-testid': `level-${l.index}`,
              'aria-label': unlocked
                ? `Level ${l.index + 1}: ${l.name}`
                : `Level ${l.index + 1} gesperrt`,
              ...(unlocked ? {} : { disabled: true }),
            },
            style: {
              '--hue': String(Math.round(l.hue * 360)),
              '--hue2': String(Math.round(l.hue2 * 360)),
            },
            on: {
              click: () => {
                if (!unlocked) return;
                this.click();
                this.host.startRun(mode, l, this.store.settings.difficulty);
              },
              pointerenter: () => unlocked && this.host.previewLevel(l),
              focus: () => unlocked && this.host.previewLevel(l),
            },
          },
          [
            h('span', { class: 'lv-num', text: String(l.index + 1).padStart(2, '0') }),
            h('span', { class: 'lv-name', text: unlocked ? l.name : 'Gesperrt' }),
            h('span', {
              class: 'lv-meta',
              text: unlocked ? `${l.bpm} BPM · ${l.style}` : `Schließe Level ${l.index} ab`,
            }),
            h('span', { class: 'lv-stars', text: unlocked ? starText(stars) : '🔒' }),
            rec && rec.bestScore > 0
              ? h('span', { class: 'lv-best', text: formatScore(rec.bestScore) })
              : null,
          ],
        );
      }),
    );
    return this.panel(
      MODES[mode].label,
      [
        h('p', { class: 'muted', text: MODES[mode].description }),
        this.difficultyPicker(),
        tabs,
        h('p', { class: 'world-sub', text: world.subtitle }),
        grid,
      ],
      { testId: 'levels', wide: true },
    );
  }

  // ---------------------------------------------------------------- Modi

  private modesScreen(): HTMLElement {
    const diff = this.store.settings.difficulty;
    const today = dailyLevel(new Date());
    const rec = (mode: ModeId, id: string) => this.store.record(recordKey(mode, id, diff));
    const best = (mode: ModeId, id: string, fallback: string) => {
      const r = rec(mode, id);
      return r ? `Bestwert ${formatScore(r.bestScore)}` : fallback;
    };
    const start = (mode: ModeId, level: LevelDef) => {
      this.click();
      this.host.startRun(mode, level, this.store.settings.difficulty);
    };
    const extra = (mode: ModeId): string => {
      switch (mode) {
        case 'campaign':
          return `★ ${this.store.progress().totalStars}`;
        case 'endless': {
          const r = rec('endless', ENDLESS_LEVEL.id);
          return r
            ? `Bestzeit ${formatTime(r.bestTime)} · ${formatScore(r.bestScore)}`
            : 'Noch keine Bestzeit';
        }
        case 'daily':
          return best('daily', today.id, today.name);
        case 'sprint':
          return best('sprint', SPRINT_LEVEL.id, 'Noch kein Sprint');
        case 'remix':
          return best('remix', 'remix', 'Überrasch mich');
        default:
          return MODES[mode].scoreMul !== 1
            ? `Punkte ×${String(MODES[mode].scoreMul).replace('.', ',')}`
            : 'Level wählen';
      }
    };
    const action = (mode: ModeId) => {
      if (MODES[mode].needsLevel) return this.openLevels(mode);
      if (mode === 'daily') return start(mode, today);
      if (mode === 'sprint') return start(mode, SPRINT_LEVEL);
      if (mode === 'remix') return start(mode, remixLevel((Math.random() * 2 ** 32) >>> 0));
      start(mode, ENDLESS_LEVEL);
    };
    const card = (mode: ModeId) =>
      h(
        'button',
        {
          class: 'mode-card',
          attrs: { type: 'button', 'data-testid': `mode-${mode}` },
          on: { click: () => action(mode) },
        },
        [
          h('strong', { text: MODES[mode].label }),
          h('span', { text: MODES[mode].description }),
          h('em', { text: extra(mode) }),
        ],
      );
    return this.panel(
      'Spielmodi',
      [this.difficultyPicker(), h('div', { class: 'mode-grid' }, SELECTABLE_MODES.map(card))],
      { testId: 'modes', wide: true },
    );
  }

  // ------------------------------------------------------------- Tutorial

  private tutorialScreen(): HTMLElement {
    const row = (k: string, v: string) => h('tr', {}, [h('th', { text: k }), h('td', { text: v })]);
    return this.panel(
      'Tutorial',
      [
        h('p', {
          text: 'Kristalle (Noten) fliegen im Takt auf dich zu. Triff sie genau, wenn sie den Ring unter deinem Gleiter erreichen. Orbs sammelst du, indem du in ihrer Spur bist. Prismenwänden weichst du durch Spurwechsel aus.',
        }),
        h('div', { class: 'two-col' }, [
          h('div', {}, [
            h('h3', { text: 'Tastatur & Maus' }),
            h('table', { class: 'keys' }, [
              row('← →', 'Eine Spur wechseln (trifft dort)'),
              row('A S D / J K L', 'Spur direkt wählen und treffen'),
              row('Leertaste / ↑ ↓', 'In aktueller Spur treffen'),
              row('E / Umschalt', 'Overdrive (×2 Punkte)'),
              row('Mausklick', 'Spur unter dem Zeiger treffen'),
              row('Esc / P', 'Pause'),
            ]),
          ]),
          h('div', {}, [
            h('h3', { text: 'Touch' }),
            h('table', { class: 'keys' }, [
              row('Spurtasten', 'Spur wählen und treffen'),
              row('Über Tasten gleiten', 'Spur wechseln ohne abzusetzen'),
              row('Tippen', 'In aktueller Spur treffen'),
              row('Wischen ← →', 'Spur wechseln'),
              row('Wischen ↑ / ⚡', 'Overdrive'),
              row('II', 'Pause'),
            ]),
          ]),
        ]),
        h('p', {
          class: 'muted',
          text: 'Combos erhöhen den Multiplikator bis ×4. Perfekte Treffer füllen die Energie schneller. Volle Energie zündet den Overdrive für doppelte Punkte.',
        }),
        button('Tutorial starten', () => this.host.startRun('tutorial', TUTORIAL_LEVEL, 'easy'), {
          variant: 'primary',
          testId: 'tutorial-start',
        }),
      ],
      { testId: 'tutorial', wide: true },
    );
  }

  // -------------------------------------------------------------- Effekte

  private effectsScreen(): HTMLElement {
    const progress = this.store.progress();
    const slots = Object.keys(SLOT_LABELS) as EffectSlot[];
    const tabs = h(
      'div',
      { class: 'tabs' },
      slots.map((s) =>
        h('button', {
          class: `tab ${s === this.effectSlot ? 'active' : ''}`,
          text: SLOT_LABELS[s],
          attrs: { type: 'button', 'data-testid': `slot-${s}` },
          on: {
            click: () => {
              this.click();
              this.effectSlot = s;
              this.refresh();
            },
          },
        }),
      ),
    );
    const equipped = this.store.data.equipped[this.effectSlot];
    const list = h(
      'div',
      { class: 'effect-list' },
      EFFECTS.filter((e) => e.slot === this.effectSlot).map((e) => {
        const open = isUnlocked(e, progress);
        const active = equipped === e.id;
        return h(
          'button',
          {
            class: `effect ${open ? '' : 'locked'} ${active ? 'active' : ''}`,
            attrs: {
              type: 'button',
              'data-testid': `effect-${e.id}`,
              ...(open ? {} : { disabled: true }),
            },
            on: {
              click: () => {
                if (!open) return;
                this.click();
                this.store.equip(e.slot, e.id);
                this.host.applyCosmetics();
                this.refresh();
              },
            },
          },
          [
            h('strong', { text: e.name }),
            h('span', { text: e.description }),
            h('em', {
              text: active
                ? 'Ausgerüstet'
                : open
                  ? 'Ausrüsten'
                  : `🔒 ${requirementText(e.requirement)}`,
            }),
          ],
        );
      }),
    );
    const total = EFFECTS.length;
    const have = EFFECTS.filter((e) => isUnlocked(e, progress)).length;
    return this.panel(
      'Effekte',
      [
        h('p', {
          class: 'muted',
          text: `${have} von ${total} Effekten freigeschaltet · ★ ${progress.totalStars}`,
        }),
        tabs,
        list,
      ],
      {
        testId: 'effects',
        wide: true,
      },
    );
  }

  // -------------------------------------------------------------- Rekorde

  private recordsScreen(): HTMLElement {
    const st = this.store.data.stats;
    const diff = this.store.settings.difficulty;
    const today = dailyLevel(new Date());
    const stat = (k: string, v: string) =>
      h('div', { class: 'stat' }, [h('span', { text: k }), h('strong', { text: v })]);
    const endless = DIFFICULTY_ORDER.map((d) => {
      const r = this.store.record(recordKey('endless', ENDLESS_LEVEL.id, d));
      return stat(
        `Endlos ${DIFFICULTIES[d].label}`,
        r ? `${formatTime(r.bestTime)} · ${formatScore(r.bestScore)}` : '–',
      );
    });
    const daily = this.store.record(recordKey('daily', today.id, diff));
    const sprint = this.store.record(recordKey('sprint', SPRINT_LEVEL.id, diff));
    const remix = this.store.record(recordKey('remix', 'remix', diff));
    const rows = LEVELS.map((l) => {
      const r = this.store.record(recordKey('campaign', l.id, diff));
      return h('tr', {}, [
        h('td', { text: String(l.index + 1) }),
        h('td', { text: l.name }),
        h('td', { text: r ? formatScore(r.bestScore) : '–' }),
        h('td', { text: r && r.bestAccuracy > 0 ? `${(r.bestAccuracy * 100).toFixed(1)} %` : '–' }),
        h('td', { text: r ? starText(r.stars) : '' }),
      ]);
    });
    return this.panel(
      'Rekorde',
      [
        h('div', { class: 'stat-grid' }, [
          stat('Gespielte Läufe', String(st.plays)),
          stat('Treffer', String(st.notesHit)),
          stat('Perfekte Treffer', String(st.perfects)),
          stat('Orbs', String(st.orbs)),
          stat('Beste Combo', String(st.bestCombo)),
          stat('Spielzeit', formatTime(st.playSeconds)),
          ...endless,
          stat(
            `Tagesrhythmus (${DIFFICULTIES[diff].label})`,
            daily ? formatScore(daily.bestScore) : '–',
          ),
          stat(
            `Sprint 90 (${DIFFICULTIES[diff].label})`,
            sprint ? formatScore(sprint.bestScore) : '–',
          ),
          stat(`Remix (${DIFFICULTIES[diff].label})`, remix ? formatScore(remix.bestScore) : '–'),
        ]),
        this.difficultyPicker(),
        h('div', { class: 'table-wrap' }, [
          h('table', { class: 'records' }, [
            h('thead', {}, [
              h(
                'tr',
                {},
                ['#', 'Level', 'Highscore', 'Genauigkeit', 'Sterne'].map((t) =>
                  h('th', { text: t }),
                ),
              ),
            ]),
            h('tbody', {}, rows),
          ]),
        ]),
      ],
      { testId: 'records', wide: true },
    );
  }

  // --------------------------------------------------------- Einstellungen

  openSettings(fromPause: boolean): void {
    this.settingsFromPause = fromPause;
    this.push(() => this.settingsScreen());
  }

  private settingsScreen(): HTMLElement {
    const s = this.store.settings;
    const update = (patch: Partial<Settings>) => {
      this.store.updateSettings(patch);
      this.host.applySettings();
    };
    const slider = (label: string, key: 'master' | 'music' | 'sfx') => {
      const out = h('output', { text: `${Math.round(s[key] * 100)} %` });
      const input = h('input', {
        attrs: {
          type: 'range',
          min: 0,
          max: 100,
          step: 1,
          value: Math.round(s[key] * 100),
          'data-testid': `vol-${key}`,
          'aria-label': label,
        },
        on: {
          input: () => {
            const v = Number(input.value) / 100;
            out.textContent = `${input.value} %`;
            update({ [key]: v } as Partial<Settings>);
          },
          change: () => this.host.audio.sfx('ui'),
        },
      });
      return h('label', { class: 'field' }, [h('span', { text: label }), input, out]);
    };
    const latOut = h('output', { text: `${s.latencyMs} ms` });
    const latency = h('input', {
      attrs: {
        type: 'range',
        min: -200,
        max: 200,
        step: 5,
        value: s.latencyMs,
        'data-testid': 'latency',
        'aria-label': 'Audio-Latenz',
      },
      on: {
        input: () => {
          latOut.textContent = `${latency.value} ms`;
          update({ latencyMs: Number(latency.value) });
        },
      },
    });
    const select = <T extends string>(
      label: string,
      value: T,
      options: [T, string][],
      onChange: (v: T) => void,
      testId: string,
    ) => {
      const sel = h(
        'select',
        {
          attrs: { 'data-testid': testId, 'aria-label': label },
          on: { change: () => onChange(sel.value as T) },
        },
        options.map(([v, l]) =>
          h('option', { text: l, attrs: { value: v, ...(v === value ? { selected: true } : {}) } }),
        ),
      );
      return h('label', { class: 'field' }, [h('span', { text: label }), sel]);
    };
    const toggle = (label: string, key: 'shake' | 'haptics' | 'reducedMotion') => {
      const input = h('input', {
        attrs: {
          type: 'checkbox',
          'data-testid': `toggle-${key}`,
          ...(s[key] ? { checked: true } : {}),
        },
        on: { change: () => update({ [key]: input.checked } as Partial<Settings>) },
      });
      return h('label', { class: 'field toggle' }, [
        h('span', { text: label }),
        input,
        h('i', { class: 'switch' }),
      ]);
    };
    return this.panel(
      'Einstellungen',
      [
        h('h3', { text: 'Audio' }),
        slider('Gesamtlautstärke', 'master'),
        slider('Musik', 'music'),
        slider('Effekte', 'sfx'),
        h('label', { class: 'field' }, [h('span', { text: 'Audio-Latenz' }), latency, latOut]),
        button('Latenz kalibrieren', () => this.push(() => this.calibrateScreen()), {
          variant: 'ghost',
          testId: 'calibrate',
        }),
        h('h3', { text: 'Grafik & Bedienung' }),
        select<Quality>(
          'Grafikqualität',
          s.quality,
          [
            ['auto', 'Automatisch'],
            ['low', 'Niedrig (schnell)'],
            ['medium', 'Mittel'],
            ['high', 'Hoch (Bloom)'],
          ],
          (v) => update({ quality: v }),
          'quality',
        ),
        select<TouchPads>(
          'Touch-Spurtasten',
          s.touchPads,
          [
            ['auto', 'Automatisch'],
            ['on', 'Immer anzeigen'],
            ['off', 'Ausblenden'],
          ],
          (v) => update({ touchPads: v }),
          'touchpads',
        ),
        toggle('Kamerawackeln', 'shake'),
        toggle('Vibration', 'haptics'),
        toggle('Bewegung reduzieren', 'reducedMotion'),
        this.settingsFromPause
          ? null
          : h('div', { class: 'danger-zone' }, [
              button('Fortschritt zurücksetzen', () => this.push(() => this.confirmReset()), {
                variant: 'danger',
                testId: 'reset',
              }),
            ]),
      ],
      { testId: 'settings' },
    );
  }

  private confirmReset(): HTMLElement {
    return this.panel(
      'Wirklich zurücksetzen?',
      [
        h('p', {
          text: 'Alle Highscores, Sterne, Bestzeiten und freigeschalteten Effekte werden gelöscht. Einstellungen bleiben erhalten.',
        }),
        h('div', { class: 'row' }, [
          button('Abbrechen', () => this.back(), { testId: 'reset-cancel' }),
          button(
            'Zurücksetzen',
            () => {
              this.store.reset();
              this.host.applyCosmetics();
              this.showMain();
            },
            { variant: 'danger', testId: 'reset-confirm' },
          ),
        ]),
      ],
      { testId: 'confirm' },
    );
  }

  private calibrateScreen(): HTMLElement {
    const audio = this.host.audio;
    const status = h('p', {
      class: 'calib-status',
      text: 'Tippe im Takt der Klicks auf den großen Knopf (oder Leertaste).',
    });
    const clicks: number[] = [];
    const taps: number[] = [];
    let running = false;
    const pad = h('button', {
      class: 'calib-pad',
      text: 'TAP',
      attrs: { type: 'button', 'data-testid': 'calib-pad' },
      on: {
        pointerdown: (e) => {
          e.preventDefault();
          tap(e.timeStamp);
        },
        keydown: (e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            tap(e.timeStamp);
          }
        },
      },
    });
    const finish = () => {
      running = false;
      const offsets: number[] = [];
      for (const t of taps) {
        let best = Infinity;
        for (const c of clicks.slice(2)) if (Math.abs(t - c) < Math.abs(best)) best = t - c;
        if (Math.abs(best) < 0.3) offsets.push(best);
      }
      if (offsets.length < 4) {
        status.textContent = 'Zu wenige Taps erkannt. Bitte erneut versuchen.';
        startBtn.disabled = false;
        return;
      }
      offsets.sort((a, b) => a - b);
      const median = offsets[Math.floor(offsets.length / 2)];
      const hw = audio.latency() - audio.latencyOffsetMs / 1000;
      const ms = Math.max(-200, Math.min(200, Math.round(((median - hw) * 1000) / 5) * 5));
      this.store.updateSettings({ latencyMs: ms });
      this.host.applySettings();
      status.textContent = `Fertig! Neue Latenz: ${ms} ms.`;
      startBtn.disabled = false;
    };
    const tap = (perfMs: number) => {
      if (!running) return;
      taps.push(audio.contextTimeAt(perfMs));
      pad.classList.remove('flash');
      void pad.offsetWidth;
      pad.classList.add('flash');
    };
    const startBtn = button(
      'Kalibrierung starten',
      () => {
        this.host.unlockAudio();
        if (!audio.available) {
          status.textContent = 'Audio ist auf diesem Gerät nicht verfügbar.';
          return;
        }
        clicks.length = 0;
        taps.length = 0;
        const beat = 60 / 100;
        const t0 = audio.contextTime() + 0.6;
        for (let i = 0; i < 12; i++) {
          clicks.push(t0 + i * beat);
          audio.scheduleClick(t0 + i * beat);
        }
        running = true;
        startBtn.disabled = true;
        status.textContent = 'Hör zu … und tippe ab dem dritten Klick mit.';
        pad.focus();
        setTimeout(finish, (0.6 + 12 * beat + 0.4) * 1000);
      },
      { variant: 'primary', testId: 'calib-start' },
    );
    return this.panel('Latenz kalibrieren', [status, pad, startBtn], { testId: 'calibration' });
  }

  // ---------------------------------------------------------------- Pause

  showPause(level: LevelDef, mode: ModeId, progress: number): void {
    this.replace(() =>
      h('section', { class: 'panel overlay', attrs: { 'data-testid': 'pause' } }, [
        h('h2', { text: 'Pause' }),
        h('p', {
          class: 'muted',
          text: `${MODES[mode].label} · ${level.name}${progress > 0 ? ` · ${Math.round(progress * 100)} %` : ''}`,
        }),
        h('div', { class: 'menu-list' }, [
          button('Fortsetzen', () => this.host.resume(), { variant: 'primary', testId: 'resume' }),
          button('Neustart', () => this.host.restart(), { testId: 'restart' }),
          button('Einstellungen', () => this.openSettings(true), { testId: 'pause-settings' }),
          button('Hauptmenü', () => this.host.quitToMenu(), { variant: 'ghost', testId: 'quit' }),
        ]),
      ]),
    );
  }

  // ------------------------------------------------------------- Ergebnis

  showResults(r: ResultsView): void {
    const endless = r.mode === 'endless';
    const title = endless
      ? 'Lauf beendet'
      : r.cleared
        ? r.mode === 'tutorial'
          ? 'Tutorial geschafft!'
          : r.mode === 'sprint'
            ? 'Zeit um!'
            : 'Level geschafft!'
        : 'Gescheitert';
    const scoreEl = h('div', {
      class: 'result-score',
      attrs: { 'data-testid': 'result-score' },
      text: '0',
    });
    this.replace(() =>
      h(
        'section',
        {
          class: `panel results ${r.cleared ? 'win' : 'lose'}`,
          attrs: { 'data-testid': 'results' },
        },
        [
          h('h2', { text: title, attrs: { 'data-testid': 'result-title' } }),
          h('p', {
            class: 'muted',
            text: `${MODES[r.mode].label} · ${r.level.name} · ${DIFFICULTIES[r.difficulty].label}`,
          }),
          h('div', { class: 'result-head' }, [
            h('div', {
              class: `grade g-${r.grade}`,
              text: endless ? formatTime(r.seconds) : r.grade,
              attrs: { 'data-testid': 'result-grade' },
            }),
            h('div', {}, [
              scoreEl,
              endless ? null : h('div', { class: 'result-stars', text: starText(r.stars) }),
              r.newBestScore ? h('div', { class: 'badge', text: 'Neuer Highscore!' }) : null,
              r.newBestTime ? h('div', { class: 'badge', text: 'Neue Bestzeit!' }) : null,
            ]),
          ]),
          h('div', { class: 'stat-grid compact' }, [
            ...(['perfect', 'great', 'good', 'miss'] as Judgement[]).map((j) =>
              h('div', { class: `stat j-${j}` }, [
                h('span', {
                  text: { perfect: 'Perfekt', great: 'Super', good: 'Gut', miss: 'Verfehlt' }[j],
                }),
                h('strong', { text: String(r.counts[j]) }),
              ]),
            ),
            h('div', { class: 'stat' }, [
              h('span', { text: 'Genauigkeit' }),
              h('strong', { text: `${(r.accuracy * 100).toFixed(1)} %` }),
            ]),
            h('div', { class: 'stat' }, [
              h('span', { text: 'Max. Combo' }),
              h('strong', { text: String(r.maxCombo) }),
            ]),
            h('div', { class: 'stat' }, [
              h('span', { text: 'Orbs' }),
              h('strong', { text: `${r.orbs} / ${r.orbsTotal}` }),
            ]),
            h('div', { class: 'stat' }, [
              h('span', { text: 'Wandtreffer' }),
              h('strong', { text: String(r.wallHits) }),
            ]),
          ]),
          r.unlocked.length
            ? h('div', { class: 'unlocks' }, [
                h('h3', { text: 'Neu freigeschaltet' }),
                ...r.unlocked.map((u) =>
                  h('div', { class: 'unlock', text: `${SLOT_LABELS[u.slot]}: ${u.name}` }),
                ),
              ])
            : null,
          h('div', { class: 'menu-list row' }, [
            r.next
              ? button('Nächstes Level', () => this.host.startRun(r.mode, r.next!, r.difficulty), {
                  variant: 'primary',
                  testId: 'next-level',
                })
              : null,
            button('Nochmal', () => this.host.restart(), {
              variant: r.next ? undefined : 'primary',
              testId: 'retry',
            }),
            button(
              MODES[r.mode].needsLevel ? 'Levelauswahl' : 'Hauptmenü',
              () => {
                this.host.quitToMenu();
                if (MODES[r.mode].needsLevel) {
                  this.levelMode = r.mode;
                  this.world = r.level.world >= 0 ? r.level.world : 0;
                  this.stack.push(() => this.levelsScreen());
                  this.render(this.stack[this.stack.length - 1]);
                }
              },
              { variant: 'ghost', testId: 'to-menu' },
            ),
          ]),
        ],
      ),
    );
    // Punktestand hochzählen.
    const start = performance.now();
    const target = Math.round(r.score);
    const stepFn = (now: number) => {
      const k = Math.min(1, (now - start) / 900);
      scoreEl.textContent = formatScore(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1 && scoreEl.isConnected) requestAnimationFrame(stepFn);
    };
    requestAnimationFrame(stepFn);
  }
}
