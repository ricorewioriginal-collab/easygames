/* Charakter-Editor im Fotostudio: Figur, Farbwelt, Hautton, Extras, Name, Pronomen. Vorschau dreht sich auf einer Bühne. */
import * as THREE from 'three';
import type { GameScene } from '../engine/Engine';
import { Actor, playerLook, OUTFITS } from './Actor';
import { BODIES, PALETTES, PRONOUNS, SKINS, HAIRS } from './palettes';
import type { Game } from './Game';
import { Menu, el, hints, $ } from '../ui/ui';
import { music, sfx } from '../engine/Audio';

export class CreatorScene implements GameScene {
  root = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  bloom = .18;
  private actor: Actor | null = null;
  private actors = new Map<string, Actor>();
  private menu!: Menu;
  private screen!: HTMLElement;
  private spin = 0;
  private ring!: THREE.Mesh;
  private busy = false;

  constructor(private g: Game, private done: () => void, private cancel: () => void) {
    const r = this.root;
    r.background = new THREE.Color(0x120a26);
    r.fog = new THREE.Fog(0x120a26, 12, 30);
    r.add(new THREE.HemisphereLight(0xe6dcff, 0x40305a, 2.2));
    const key = new THREE.SpotLight(0xffffff, 140, 30, .5, .5, 1.2); key.position.set(3, 7, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); r.add(key, key.target);
    const rim = new THREE.PointLight(0xff4fa3, 30, 14); rim.position.set(-3, 3, -3); r.add(rim);
    const rim2 = new THREE.PointLight(0x4fb8ff, 25, 14); rim2.position.set(3, 2, -3); r.add(rim2);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshStandardMaterial({ color: 0x1c1236, roughness: .4, metalness: .2 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; r.add(floor);
    const podium = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, .3, 48), new THREE.MeshStandardMaterial({ color: 0x2c1f4f, roughness: .3, metalness: .4 }));
    podium.position.y = .15; podium.receiveShadow = true; podium.castShadow = true; r.add(podium);
    // Regenbogen-Ring hinter der Figur
    const c = document.createElement('canvas'); c.width = 256; c.height = 4;
    const x = c.getContext('2d')!, grd = x.createLinearGradient(0, 0, 256, 0);
    ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787', '#e40303'].forEach((col, i) => grd.addColorStop(i / 6, col));
    x.fillStyle = grd; x.fillRect(0, 0, 256, 4);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    this.ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, .07, 8, 96), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
    this.ring.position.set(0, 1.4, -1.4); r.add(this.ring);
    this.camera.position.set(0, 1.6, 6.2);
  }

  enter() {
    const s = this.g.save.data;
    this.screen = el(`<div class="screen"><div class="col"><div class="panel"><h3>Wer bist du?</h3><p>Alles lässt sich später im Kleiderschrank ändern.</p>
      <label style="display:block;margin:8px 0 10px"><small style="color:var(--mu)">Name</small><input type="text" id="cName" maxlength="16" value=""></label><div id="cMenu"></div></div></div></div>`);
    $('#ui').appendChild(this.screen);
    const inp = $<HTMLInputElement>('#cName', this.screen);
    inp.value = s.name;
    inp.addEventListener('input', () => { s.name = inp.value.replace(/[<>]/g, '').slice(0, 16); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { inp.blur(); e.preventDefault(); } });
    const cyc = <T,>(arr: T[], cur: number, d: number) => (cur + d + arr.length) % arr.length;
    const bi = () => Math.max(0, BODIES.findIndex((b) => b.id === s.body));
    const pi = () => Math.max(0, PALETTES.findIndex((p) => p.id === s.palette));
    const ni = () => Math.max(0, PRONOUNS.findIndex((p) => p.id === s.pronouns));
    const hairStep = (d: number) => { const h = typeof s.flags.hair === 'number' ? s.flags.hair as number : -1; const n = h + d; return n < 0 || n >= HAIRS.length ? (n < -1 ? HAIRS.length - 1 : -1) : n; };
    const outfits = () => OUTFITS.filter((o) => !o.adult || s.settings.adult);
    const oi = () => Math.max(0, outfits().findIndex((o) => o.id === (s.flags.outfit || 'clothed')));
    this.menu = new Menu([
      { icon: '🧍', label: 'Figur', value: () => BODIES[bi()].desc, left: () => this.setBody(BODIES[cyc(BODIES, bi(), -1)].id), right: () => this.setBody(BODIES[cyc(BODIES, bi(), 1)].id) },
      { icon: '🏳️‍🌈', label: 'Farbwelt', value: () => PALETTES[pi()].name, left: () => { s.palette = PALETTES[cyc(PALETTES, pi(), -1)].id; this.apply(); }, right: () => { s.palette = PALETTES[cyc(PALETTES, pi(), 1)].id; this.apply(); } },
      { icon: '✋', label: 'Hautton', value: () => `${s.skin + 1} / ${SKINS.length}`, left: () => { s.skin = cyc(SKINS, s.skin, -1); this.apply(); }, right: () => { s.skin = cyc(SKINS, s.skin, 1); this.apply(); } },
      { icon: '💇', label: 'Haare', value: () => (typeof s.flags.hair === 'number' && (s.flags.hair as number) >= 0 ? `${(s.flags.hair as number) + 1} / ${HAIRS.length}` : 'Natur'), left: () => { s.flags.hair = hairStep(-1); this.apply(); }, right: () => { s.flags.hair = hairStep(1); this.apply(); } },
      { icon: '💬', label: 'Pronomen', value: () => PRONOUNS[ni()].label, left: () => { s.pronouns = PRONOUNS[cyc(PRONOUNS, ni(), -1)].id; this.apply(); }, right: () => { s.pronouns = PRONOUNS[cyc(PRONOUNS, ni(), 1)].id; this.apply(); } },
      { icon: '👙', label: 'Outfit', value: () => outfits()[oi()].name, left: () => { s.flags.outfit = outfits()[cyc(outfits(), oi(), -1)].id; this.apply(); }, right: () => { s.flags.outfit = outfits()[cyc(outfits(), oi(), 1)].id; this.apply(); } },
      { icon: '✨', label: 'Los geht’s!', sub: 'Ab nach Rainbow City', big: true, fn: () => { if (!s.name.trim()) s.name = 'Alex'; this.done(); } },
    ]);
    this.menu.onBack = () => this.cancel();
    $('#cMenu', this.screen).appendChild(this.menu.el);
    hints([['dpad', 'Wählen'], ['lr', 'Ändern'], ['a', 'Bestätigen'], ['b', 'Zurück']]);
    music('title');
    this.setBody(s.body);
  }
  exit() { this.screen?.remove(); this.actors.forEach((a) => this.root.remove(a.root)); }

  private async setBody(id: string) {
    const s = this.g.save.data; s.body = id;
    if (this.busy) return; this.busy = true;
    let a = this.actors.get(id);
    if (!a) { a = await Actor.create(playerLook({ ...s, body: id })); a.root.position.y = .3; this.actors.set(id, a); }
    this.busy = false;
    if (this.actor) this.root.remove(this.actor.root);
    this.actor = a; this.root.add(a.root);
    this.apply(); a.play('cheer'); setTimeout(() => a!.play('idle'), 1400);
    if (s.body !== id) this.setBody(s.body);
  }
  private apply() {
    const s = this.g.save.data;
    this.actor?.setLook(playerLook(s));
    this.menu?.render(); sfx('move');
  }

  update(dt: number, t: number) {
    const inp = this.g.engine.input;
    this.menu.handle(inp);
    this.spin += dt * .5 + inp.look.x * .01;
    if (this.actor) { this.actor.root.rotation.y = this.spin; this.actor.update(dt); }
    this.ring.rotation.z = t * .3;
    // Hochformat: Figur oben, Menü unten – Kamera etwas höher und weiter weg
    const portrait = innerHeight > innerWidth;
    this.camera.position.set(portrait ? 0 : -1.2, portrait ? .4 : 1.5, portrait ? 8.6 : 6.2);
    this.camera.lookAt(portrait ? 0 : -1.2, portrait ? 0.1 : 1.2, 0);
  }
}
