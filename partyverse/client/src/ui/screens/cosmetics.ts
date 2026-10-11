import * as THREE from 'three';
import { CHARACTERS, getCharacter, type CharacterId } from '@shared/characters';
import { cleanName } from '@shared/net/protocol';
import { h } from '../dom';
import type { App, RouteParams, ScreenView } from '../../app/app';
import { DICE_SKINS, HAT_COSMETICS, TRAILS, isUnlocked, unlockingAchievement, type CosmeticKind } from '../../app/achievements';
import { createCharacter, HAT_IDS, type CharacterRig, type HatId } from '../../render/characters';
import type { Screen } from '../../render/engine';
import { header, section } from './common';

interface Option {
  id: string | null;
  label: string;
  kind: CosmeticKind;
  swatch?: number;
  /** nie gesperrt (z. B. „Keiner“, Figuren) */
  open?: boolean;
}

export function create(app: App, params?: RouteParams): ScreenView {
  const store = app.store;
  const engine = app.engine;
  const prevScreen = engine.screen;

  // Gespeicherte Auswahl darf nichts Gesperrtes enthalten (z. B. nach einem Import)
  store.update((d) => {
    const c = d.cosmetics;
    if (c.hat && (!(HAT_IDS as readonly string[]).includes(c.hat) || !isUnlocked(d, 'hat', c.hat))) c.hat = null;
    if (c.trail && !isUnlocked(d, 'trail', c.trail)) c.trail = null;
    if (!isUnlocked(d, 'dice', c.dice)) c.dice = 'klassisch';
  });

  // ---------------------------------------------------------------- 3D-Vorschau
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#17143a');
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 1.7, 5.2);
  camera.lookAt(0, 0.95, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x4a3b88, 1.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(3, 5, 4);
  scene.add(sun);
  const floorGeo = new THREE.CircleGeometry(2.6, 48);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b2570, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  let rig: CharacterRig | null = null;
  let t = 0;
  const trailColor = (): number | null => TRAILS.find((x) => x.id === store.data.cosmetics.trail)?.color ?? null;
  const buildRig = (): void => {
    rig?.root.removeFromParent();
    rig?.dispose();
    rig = createCharacter(store.data.profile.character);
    scene.add(rig.root);
    applyCosmetics();
    rig.play('walk', { loop: true });
  };
  const applyCosmetics = (): void => {
    const c = store.data.cosmetics;
    rig?.setHat(c.hat && (HAT_IDS as readonly string[]).includes(c.hat) ? (c.hat as HatId) : null);
    rig?.setTrail(trailColor());
  };

  // Figur läuft im Kreis, damit die Spur sichtbar wird
  const R = 1.1;
  const screen: Screen = {
    scene,
    camera,
    update(dt: number) {
      if (!rig) return;
      t += dt * 0.9;
      rig.root.position.set(Math.cos(t) * R, 0, Math.sin(t) * R);
      rig.faceTowards(Math.atan2(-Math.sin(t), Math.cos(t))); // Laufrichtung (Tangente)
      rig.update(dt);
    },
    onResize(w: number, hh: number) {
      // Figur in den vom Panel freien Bereich schieben
      if (w >= 860) camera.setViewOffset(w, hh, 290, 0, w, hh);
      else camera.setViewOffset(w, hh, 0, hh * 0.3, w, hh);
    },
  };
  buildRig();
  engine.setScreen(screen);

  // ---------------------------------------------------------------- Auswahl-Gruppen
  type Group = { el: HTMLElement; refresh(): void };
  function group(options: Option[], current: () => string | null, pick: (id: string | null) => void): Group {
    const wrap = h('div', { class: 'cols' });
    const buttons: Array<{ b: HTMLButtonElement; o: Option }> = [];
    for (const o of options) {
      const ok = o.open === true || o.id === null || isUnlocked(store.data, o.kind, o.id);
      const ach = o.id !== null && !ok ? unlockingAchievement(o.kind, o.id) : undefined;
      const b = h(
        'button',
        { type: 'button', class: 'card pick', disabled: !ok, onclick: () => { pick(o.id); refresh(); } },
        h('h4', null, o.swatch !== undefined ? h('span', { class: 'swatch', style: `background:#${o.swatch.toString(16).padStart(6, '0')}` }) : null, o.label),
        !ok ? h('span', { class: 'lock' }, '🔒 Erfolg: ' + (ach ? ach.name : 'noch nicht verfügbar')) : null,
      );
      buttons.push({ b, o });
      wrap.appendChild(b);
    }
    function refresh(): void {
      const cur = current();
      for (const { b, o } of buttons) {
        const on = o.id === cur;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', String(on));
      }
    }
    refresh();
    return { el: wrap, refresh };
  }

  // Name
  const nameInput = h('input', { class: 'field', type: 'text', value: store.data.profile.name, maxlength: 14, 'aria-label': 'Spielername' });
  nameInput.addEventListener('change', () => {
    const n = cleanName(nameInput.value);
    if (n) store.update((d) => void (d.profile.name = n));
    nameInput.value = store.data.profile.name;
  });

  const charGroup = group(
    CHARACTERS.map((c) => ({ id: c.id, label: `${c.name} – ${c.species}`, kind: 'hat' as CosmeticKind, open: true })),
    () => store.data.profile.character,
    (id) => {
      if (!id) return;
      store.update((d) => void (d.profile.character = id as CharacterId));
      buildRig();
    },
  );
  // Figuren sind nie gesperrt, deshalb Kurzbeschreibung ergänzen
  charGroup.el.querySelectorAll('button').forEach((b, i) => {
    const c = CHARACTERS[i];
    if (c) b.append(h('small', null, c.tagline), h('small', { class: 'lock' }, getCharacter(c.id).personality));
  });

  const hatOpts: Option[] = [{ id: null, label: 'Keiner', kind: 'hat' }, ...HAT_IDS.map((id) => ({ id, label: HAT_COSMETICS.find((x) => x.id === id)?.name ?? id, kind: 'hat' as CosmeticKind }))];
  const hatGroup = group(hatOpts, () => store.data.cosmetics.hat, (id) => { store.update((d) => void (d.cosmetics.hat = id)); applyCosmetics(); });
  const trailOpts: Option[] = [{ id: null, label: 'Keine', kind: 'trail' }, ...TRAILS.map((x) => ({ id: x.id, label: x.name, kind: 'trail' as CosmeticKind, swatch: x.color }))];
  const trailGroup = group(trailOpts, () => store.data.cosmetics.trail, (id) => { store.update((d) => void (d.cosmetics.trail = id)); applyCosmetics(); });
  const diceOpts: Option[] = DICE_SKINS.map((x) => ({ id: x.id, label: x.name, kind: 'dice' as CosmeticKind }));
  const diceGroup = group(diceOpts, () => store.data.cosmetics.dice, (id) => { if (id) store.update((d) => void (d.cosmetics.dice = id)); });

  const el = h(
    'div',
    { class: 'screen sc side' },
    h(
      'div',
      { class: 'panel' },
      header(app, params, 'Kosmetik & Figur'),
      h('p', { class: 'hint' }, 'Gesperrte Stücke schaltest du durch Erfolge frei.'),
      section('Spielername', nameInput),
      section('Figur', charGroup.el),
      section('Hut', hatGroup.el),
      section('Spur', trailGroup.el),
      section('Würfel-Skin', diceGroup.el),
    ),
  );

  return {
    el,
    dispose() {
      // Vorherigen Bildschirm nur zurückgeben, wenn niemand sonst inzwischen einen eigenen gesetzt hat
      if (engine.screen === screen) engine.setScreen(prevScreen);
      camera.clearViewOffset();
      rig?.dispose();
      rig = null;
      floorGeo.dispose();
      floorMat.dispose();
      scene.clear();
    },
  };
}
