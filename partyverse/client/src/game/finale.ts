import * as THREE from 'three';
import type { GameState, PlayerSetup } from '@shared/core/types';
import type { WorldId } from '@shared/levels/types';
import type { Screen } from '../render/engine';
import type { QualitySettings } from '../render/quality';
import { createCharacter, type CharacterRig } from '../render/characters';
import { disposeTree, glow, toon } from '../render/materials';
import { ParticlePool } from '../render/particles';
import { THEMES, skyDome } from '../render/worlds/common';
import { PLAYER_SYMBOLS, playerColorHex } from '../app/theme';
import { t } from '../i18n';
import { btn, h } from '../ui/dom';

/** Siegerehrung: Podest mit den Figuren, Konfetti und Scheinwerfern */
export class FinaleStage implements Screen {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 900);
  private rigs: CharacterRig[] = [];
  private particles: ParticlePool;
  private beams: THREE.Mesh[] = [];
  private sky: THREE.Mesh;
  private t = 0;
  private confetti = 0;
  private reveal = 0;

  constructor(
    ranking: string[],
    players: PlayerSetup[],
    world: WorldId,
    quality: QualitySettings,
    private readonly calm: boolean,
  ) {
    const th = THEMES[world];
    this.sky = skyDome(th.skyTop, th.skyBottom);
    this.scene.add(this.sky, new THREE.HemisphereLight(th.ambient, th.island, 1.5));
    this.scene.fog = new THREE.Fog(th.fog, 25, 90);
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(4, 12, 10);
    this.scene.add(sun);
    this.particles = new ParticlePool(this.scene, 260, quality.particles);
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 0.6, 40), toon(th.island));
    floor.position.y = -0.3;
    this.scene.add(floor);
    const heights = [1.6, 1.1, 0.8, 0.5];
    const xs = [0, -2.6, 2.6, 5.2];
    ranking.forEach((id, i) => {
      const p = players.find((x) => x.id === id);
      if (!p) return;
      const idx = players.findIndex((x) => x.id === id);
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, heights[i] ?? 0.5, 2.2),
        toon(playerColorHex(idx)),
      );
      block.position.set(xs[i] ?? 0, (heights[i] ?? 0.5) / 2, 0);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 2.3), toon(0xffffff));
      plate.position.set(xs[i] ?? 0, (heights[i] ?? 0.5) + 0.04, 0);
      this.scene.add(block, plate);
      const rig = createCharacter(p.character);
      rig.root.position.set(xs[i] ?? 0, (heights[i] ?? 0.5) + 0.08, 0);
      rig.root.visible = false;
      this.scene.add(rig.root);
      this.rigs[i] = rig;
    });
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(
        new THREE.ConeGeometry(2.2, 14, 16, 1, true),
        glow([0xff3e9d, 0x2de2e6, 0xffd23f][i] as number, 0.14),
      );
      b.position.set(-6 + i * 6, 7, -3);
      b.userData.ph = i * 2;
      this.beams.push(b);
      this.scene.add(b);
    }
    this.camera.position.set(0, 4.6, 12.5);
    this.camera.lookAt(0, 1.8, 0);
    // Zentrierung bei 2–3 Spielern
    this.rigs.forEach((r) => r.root.rotation.set(0, 0, 0));
  }

  /** Zeigt die Figur auf Rang `i` (0 = Sieger) */
  show(i: number, first: boolean): void {
    const rig = this.rigs[i];
    if (!rig) return;
    rig.root.visible = true;
    rig.play(first ? 'win' : i === this.rigs.length - 1 ? 'lose' : 'cheer');
    this.particles.burst(
      rig.root.position.clone().setY(rig.root.position.y + 1.5),
      first ? 0xffd23f : 0xffffff,
      first ? 40 : 14,
    );
    this.reveal++;
    if (first) this.confetti = 8;
  }

  update(dt: number): void {
    this.t += dt;
    this.rigs.forEach((r) => r.update(dt));
    this.particles.update(dt);
    if (this.confetti > 0 && !this.calm) {
      this.confetti -= dt;
      const cols = [0xff3e9d, 0x2de2e6, 0xffd23f, 0x6bff8f, 0x7c5cff];
      for (let k = 0; k < 2; k++)
        this.particles.burst(
          new THREE.Vector3((Math.random() - 0.5) * 12, 9, (Math.random() - 0.5) * 4),
          cols[(Math.random() * cols.length) | 0] as number,
          3,
          { speed: 1.5, life: 2.2, gravity: 2.5, size: 0.3 },
        );
    }
    this.beams.forEach((b) => (b.rotation.z = Math.sin(this.t * 0.8 + (b.userData.ph as number)) * 0.5));
    const shift = this.camera.aspect > 1.3 ? -3.2 : 0;
    this.camera.position.x = Math.sin(this.t * 0.25) * (this.calm ? 0 : 2) + shift;
    this.camera.lookAt(shift, 1.8, 0);
    this.sky.position.copy(this.camera.position);
  }

  dispose(): void {
    this.rigs.forEach((r) => r.dispose());
    this.particles.dispose();
    disposeTree(this.scene);
    this.sky.geometry.dispose();
    (this.sky.material as THREE.Material).dispose();
  }
}

/** Oberfläche der Siegerehrung: Rangliste mit Bonus-Auszeichnungen, Buttons */
export function finaleOverlay(
  state: GameState,
  players: PlayerSetup[],
  stage: FinaleStage,
  sfx: (n: string) => void,
  actions: { again: (() => void) | null; menu: () => void },
): { el: HTMLElement; dispose(): void } {
  const fin = state.finale;
  const ranking = fin?.ranking ?? state.order;
  const el = h('div', { class: 'cover finale' });
  el.style.pointerEvents = 'none';
  const list = h('div', { class: 'rank' });
  const title = h('h2', { class: 'ftitle' }, t('finale.title'));
  const bonusList = h('div', { class: 'chips' });
  const nameOf = (id: string): string => players.find((p) => p.id === id)?.name ?? id;
  for (const b of fin?.bonuses ?? [])
    bonusList.appendChild(
      h('span', { class: 'chip on' }, `${t('finale.bonus.' + b.id)}: ${b.players.map(nameOf).join(', ')}`),
    );
  const buttons = h('div', { class: 'chips', style: 'justify-content:flex-end;margin-top:10px' });
  el.appendChild(h('div', { class: 'panel', style: 'pointer-events:auto' }, title, list, bonusList, buttons));
  const timers: Array<ReturnType<typeof setTimeout>> = [];
  const n = ranking.length;
  const medal = ['🥇', '🥈', '🥉', '4.'];
  const addRow = (rank: number): void => {
    const id = ranking[rank] as string;
    const p = state.players[id];
    const idx = players.findIndex((x) => x.id === id);
    if (!p) return;
    list.prepend(
      h(
        'div',
        { class: `rrow pc${(idx % 4) + 1}${rank === 0 ? ' w' : ''}` },
        h('span', { class: 'pos' }, medal[rank] ?? ''),
        h('span', null, `${PLAYER_SYMBOLS[idx % 4]} ${nameOf(id)}`),
        h('span', null, `◈ ${p.shards}`),
        h('span', null, `✦ ${p.coins}`),
      ),
    );
    stage.show(rank, rank === 0);
    sfx(rank === 0 ? 'fanfare' : 'pop');
  };
  let k = n - 1;
  const step = (): void => {
    if (k < 0) {
      if (actions.again) buttons.appendChild(btn(t('finale.again'), actions.again, 'good big'));
      buttons.appendChild(btn(t('finale.menu'), actions.menu, 'hot'));
      return;
    }
    addRow(k--);
    timers.push(setTimeout(step, k < 0 ? 900 : 1100));
  };
  timers.push(setTimeout(step, 700));
  buttons.appendChild(
    btn(
      t('finale.skip'),
      () => {
        timers.forEach(clearTimeout);
        while (k >= 0) addRow(k--);
        buttons.textContent = '';
        if (actions.again) buttons.appendChild(btn(t('finale.again'), actions.again, 'good big'));
        buttons.appendChild(btn(t('finale.menu'), actions.menu, 'hot'));
      },
      'ghost',
    ),
  );
  return { el, dispose: () => timers.forEach(clearTimeout) };
}
