import * as THREE from 'three';
import type { CharacterRig } from '../../render/characters';
import type { Avatar, ViewContext } from '../viewTypes';

/** Spielerfigur mit farbigem Bodenring (eigene Figur oder Mitspieler) */
export interface Racer {
  readonly avatar: Avatar;
  readonly rig: CharacterRig;
  /** Bewegen: diese Gruppe verschieben/drehen (enthält Figur und Ring) */
  readonly group: THREE.Group;
  /** Ring am Boden in der Spielerfarbe */
  readonly ring: THREE.Mesh;
}

function makeRacer(ctx: ViewContext, avatar: Avatar, ghost: boolean, scale: number): Racer {
  const group = new THREE.Group();
  const rig = ctx.character(avatar.character, scale);
  group.add(rig.root);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55 * scale, 0.75 * scale, 28),
    new THREE.MeshBasicMaterial({
      color: avatar.color,
      transparent: true,
      opacity: ghost ? 0.55 : 0.9,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);
  if (ghost)
    // Mitspieler leicht durchsichtig, damit die eigene Figur immer klar vorne steht
    rig.root.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;
      const list = Array.isArray(m) ? m : [m];
      const cl = list.map((x) => {
        const c = x.clone();
        c.transparent = true;
        c.opacity = Math.min(c.opacity, 0.6);
        c.depthWrite = false;
        return c;
      });
      (o as THREE.Mesh).material = Array.isArray(m) ? cl : (cl[0] as THREE.Material);
    });
  rig.play('idle', { loop: true });
  ctx.root.add(group);
  return { avatar, rig, group, ring };
}

/** Eigene Figur (gewählter Charakter) */
export function makeMe(ctx: ViewContext, scale = 1): Racer {
  return makeRacer(ctx, ctx.me, false, scale);
}

/** Alle Mitspieler als halbdurchsichtige Figuren – gleiche Reihenfolge wie ctx.rivals und die Zustände in ghosts() */
export function makeRivals(ctx: ViewContext, scale = 1): Racer[] {
  return ctx.rivals.map((a) => makeRacer(ctx, a, true, scale));
}

/**
 * Hilfe für ghosts(): ruft place(racer, state, i) für jeden bekannten Mitspieler, blendet unbekannte aus
 * und aktualisiert die Animationen.
 */
export function updateRivals<S>(
  racers: Racer[],
  states: ReadonlyArray<S | null>,
  dt: number,
  place: (r: Racer, s: S, i: number) => void,
): void {
  racers.forEach((r, i) => {
    const s = states[i];
    r.group.visible = s != null;
    if (s != null) place(r, s, i);
    r.rig.update(dt);
  });
}
