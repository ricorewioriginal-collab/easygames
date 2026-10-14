/* Charaktereditor mit 3D-Vorschau: drehbare Figur, Reiter für Körper, Gesicht, Haare, Kleidung, Zubehör, Vorlagen. */
import type { Game } from '../game.ts';
import { Avatar, type Emote } from '../characters/avatar.ts';
import { ACCS, type Appearance, BEARD, BOTTOMS, CLOTH_COLORS, EYE_COLORS, GLASSES, HAIR, HAIR_COLORS, HATS, type OptionDef, PATTERNS, PRESETS, randomAppearance, sanitizeAppearance, SHOES, SKIN, SKIN_NAMES, TOPS } from '../characters/appearance.ts';
import { GeoBuilder } from '../engine/geo.ts';
import { mats } from '../engine/materials.ts';
import { btn, clear, h, uiRoot } from './dom.ts';

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

export interface EditorOpts { look: Appearance; name: string; owned: string[]; askName: boolean; title: string; done: (look: Appearance, name: string) => void; cancel?: () => void }

export function openEditor(g: Game, o: EditorOpts): void {
  let look = sanitizeAppearance(o.look);
  let name = o.name;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xbfe6ff);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa08a6a, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(3, 6, 4); scene.add(sun);
  const back = new THREE.DirectionalLight(0xffd6f0, 0.5); back.position.set(-4, 3, -3); scene.add(back);
  const pb = new GeoBuilder();
  pb.cyl(0, -0.25, 0, 1.25, 1.35, 0.25, 0xffd23f, 32); pb.cyl(0, -0.02, 0, 1.12, 1.12, 0.03, 0xfff6c0, 32);
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; pb.sph(Math.cos(a) * 1.3, -0.12, Math.sin(a) * 1.3, 0.06, [0xff6fb5, 0x7fd8ff, 0x4cd07d][i % 3]); }
  const ped = pb.mesh(mats().vc, false); scene.add(ped);
  const av = new Avatar(look, false);
  scene.add(av.root);
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  let rotY = 0.4, autoRot = true, zoom = 1, emoteT = 4;
  const landscape = () => window.innerWidth > window.innerHeight && window.innerHeight < 520;
  const narrow = () => window.innerWidth <= 760 || landscape();

  const stage = h('div', { class: 'stage' });
  const side = h('div', { class: 'side panel' });
  const root = h('div', { class: 'editor' + (landscape() ? ' landscape' : '') }, stage, side);
  let dragX: number | null = null;
  stage.addEventListener('pointerdown', e => { dragX = e.clientX; autoRot = false; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (dragX === null) return; rotY += (e.clientX - dragX) * 0.012; dragX = e.clientX; });
  stage.addEventListener('pointerup', () => { dragX = null; });
  stage.addEventListener('wheel', e => { zoom = Math.max(0.6, Math.min(1.5, zoom + Math.sign(e.deltaY) * 0.08)); });
  stage.append(h('div', { class: 'rot' },
    btn('⟲', () => { rotY -= 0.6; autoRot = false; }, 'ghost small', { 'aria-label': 'Nach links drehen' }),
    btn('👋', () => av.play((['wave', 'dance', 'cheer', 'laugh', 'spin'] as Emote[])[Math.floor(Math.random() * 5)], 2.2), 'ghost small', { 'aria-label': 'Geste' }),
    btn('🔍', () => { zoom = zoom > 1 ? 0.7 : zoom + 0.3; }, 'ghost small', { 'aria-label': 'Zoom' }),
    btn('⟳', () => { rotY += 0.6; autoRot = false; }, 'ghost small', { 'aria-label': 'Nach rechts drehen' })));

  const tabsDef = [{ id: 'vorlagen', l: '⭐ Vorlagen' }, { id: 'koerper', l: '🧍 Körper' }, { id: 'gesicht', l: '🙂 Gesicht' }, { id: 'haare', l: '💇 Haare' }, { id: 'kleidung', l: '👕 Kleidung' }, { id: 'zubehoer', l: '🎩 Zubehör' }];
  let tab = o.askName ? 'vorlagen' : 'kleidung';
  const tabs = h('div', { class: 'tabs' });
  const body = h('div', { class: 'body' });
  const nameInput = h('input', { type: 'text', maxlength: 16, value: name, placeholder: 'Wie heißt du?', 'aria-label': 'Name' });
  nameInput.addEventListener('input', () => { name = nameInput.value; });
  side.append(h('header', { style: 'padding:12px 14px 4px' }, h('h2', null, o.title)), tabs, body,
    h('footer', null, o.cancel ? btn('Zurück', () => { close(); o.cancel!(); }, 'ghost') : null, btn('🎲 Zufall', () => { look = randomAppearance(Math.random); apply(); }, 'ghost'), h('span', { class: 'spacer' }), btn('✔ Fertig', () => { close(); o.done(look, (name || 'Held').trim().slice(0, 16)); }, 'green')));

  const unlocked = (opt: OptionDef) => !opt.unlock || o.owned.includes(opt.unlock) || o.owned.includes('all');
  const apply = () => { av.setLook(look); av.play('wave', 1.2); renderTab(); };
  const set = <K extends keyof Appearance>(k: K, v: Appearance[K]) => { look = { ...look, [k]: v }; av.setLook(look); renderTab(); };
  const opts = (label: string, list: OptionDef[], key: 'hair' | 'beard' | 'top' | 'pattern' | 'bottom' | 'shoes' | 'hat' | 'acc' | 'glasses') => [
    h('div', { class: 'edlabel' }, label),
    h('div', { class: 'opts' }, list.map(op => h('button', {
      type: 'button', class: 'opt' + (look[key] === op.id ? ' on' : '') + (unlocked(op) ? '' : ' locked'), title: op.name + (unlocked(op) ? '' : ' (noch nicht freigeschaltet)'),
      onclick: () => { if (unlocked(op)) set(key, op.id); }
    }, unlocked(op) ? op.icon : '🔒', h('small', null, op.name))))
  ];
  const colors = (label: string, list: number[], key: 'skin' | 'hairColor' | 'eyes' | 'topColor' | 'bottomColor' | 'shoeColor' | 'hatColor' | 'accColor', names?: string[]) => [
    h('div', { class: 'edlabel' }, label),
    h('div', { class: 'swatches' }, list.map((c, i) => h('button', { type: 'button', class: 'sw' + (look[key] === i ? ' on' : ''), style: 'background:' + hex(c), title: names?.[i] ?? '', 'aria-label': (names?.[i] ?? label) + ' ' + (i + 1), onclick: () => set(key, i) })))
  ];
  const stepper = (label: string, key: 'height' | 'build' | 'face' | 'brows' | 'mouth' | 'age', n: number, names: string[]) => [
    h('div', { class: 'edlabel' }, label),
    h('div', { class: 'seg', style: 'margin:6px 0 14px' }, names.slice(0, n).map((nm, i) => h('button', { type: 'button', class: look[key] === i ? 'on' : '', onclick: () => set(key, i as never) }, nm)))
  ];
  const toggle = (label: string, key: 'cheeks' | 'freckles') => h('label', { class: 'toggle' }, label, h('input', { type: 'checkbox', checked: look[key], onchange: (e: Event) => set(key, (e.target as HTMLInputElement).checked) }));

  function renderTab(): void {
    clear(tabs);
    for (const t of tabsDef) tabs.append(h('button', { type: 'button', class: 'tab' + (t.id === tab ? ' on' : ''), onclick: () => { tab = t.id; renderTab(); } }, t.l));
    clear(body);
    switch (tab) {
      case 'vorlagen':
        if (o.askName) body.append(h('label', { class: 'field' }, 'Name deiner Figur', nameInput), h('div', { style: 'height:12px' }));
        body.append(h('div', { class: 'edlabel' }, 'Bekannte Gesichter aus Bunte Insel'), h('div', { class: 'grid', style: 'grid-template-columns:repeat(auto-fill,minmax(130px,1fr));margin-top:6px' },
          PRESETS.map(p => btn(p.name, () => { look = sanitizeAppearance({ ...look, ...p.look }); if (o.askName && !nameInput.value) { name = p.name.split(' ').pop()!; nameInput.value = name; } apply(); }, 'ghost'))));
        body.append(h('p', { class: 'muted' }, 'Tipp: Wähle eine Vorlage und ändere dann alles, was du magst. Alles lässt sich später im Kleiderschrank zu Hause wieder ändern.'));
        break;
      case 'koerper':
        body.append(...stepper('Alter', 'age', 3, ['Kind', 'Jugendlich', 'Erwachsen']), ...stepper('Größe', 'height', 5, ['XS', 'S', 'M', 'L', 'XL']), ...stepper('Statur', 'build', 3, ['Schmal', 'Normal', 'Kräftig']), ...colors('Hautfarbe', SKIN, 'skin', SKIN_NAMES));
        break;
      case 'gesicht':
        body.append(...stepper('Gesichtsform', 'face', 3, ['Rund', 'Breit', 'Schmal']), ...colors('Augenfarbe', EYE_COLORS, 'eyes'), ...stepper('Augenbrauen', 'brows', 3, ['Sanft', 'Normal', 'Keck']),
          ...stepper('Mund', 'mouth', 4, ['Lächeln', 'Staunen', 'Strahlen', 'Ruhig']), toggle('Rote Bäckchen', 'cheeks'), toggle('Sommersprossen', 'freckles'), ...opts('Bart', BEARD, 'beard'), ...opts('Brille', GLASSES, 'glasses'));
        break;
      case 'haare': body.append(...opts('Frisur', HAIR, 'hair'), ...colors('Haarfarbe', HAIR_COLORS, 'hairColor')); break;
      case 'kleidung':
        body.append(...opts('Oberteil', TOPS, 'top'), ...colors('Farbe Oberteil', CLOTH_COLORS, 'topColor'), ...opts('Aufdruck', PATTERNS, 'pattern'),
          ...opts('Unten', BOTTOMS, 'bottom'), ...colors('Farbe unten', CLOTH_COLORS, 'bottomColor'), ...opts('Schuhe', SHOES, 'shoes'), ...colors('Schuhfarbe', CLOTH_COLORS, 'shoeColor'));
        break;
      case 'zubehoer':
        body.append(...opts('Kopf', HATS, 'hat'), ...colors('Farbe Kopf', CLOTH_COLORS, 'hatColor'), ...opts('Rücken & Hals', ACCS, 'acc'), ...colors('Farbe Zubehör', CLOTH_COLORS, 'accColor'));
        break;
    }
  }
  renderTab();
  uiRoot().append(root);
  const prevPhase = g.phase;
  g.phase = 'editor';
  g.input.enabled = false;
  const v = new THREE.Vector3();
  g.renderOverride = dt => {
    emoteT -= dt;
    if (emoteT < 0) { emoteT = 5 + Math.random() * 4; av.play((['wave', 'think', 'cheer', 'dance'] as Emote[])[Math.floor(Math.random() * 4)], 2); }
    if (autoRot) rotY += dt * 0.35;
    av.root.rotation.y = rotY;
    av.pose = 'idle';
    av.update(dt);
    const r = stage.getBoundingClientRect();
    const W = window.innerWidth, H = window.innerHeight;
    const gl = g.renderer.gl;
    const hgt = av.height;
    cam.aspect = Math.max(0.3, r.width / Math.max(1, r.height));
    const dist = (hgt * 2.3 + 1.2) / zoom * (cam.aspect < 0.8 ? 1.35 : 1);
    cam.position.set(0, hgt * 0.62, dist);
    cam.lookAt(v.set(0, hgt * 0.52, 0));
    cam.updateProjectionMatrix();
    gl.setScissorTest(false);
    gl.setViewport(0, 0, W, H);
    gl.setClearColor(0xbfe6ff, 1);
    gl.clear();
    gl.setViewport(r.left, H - r.bottom, r.width, r.height);
    gl.setScissor(r.left, H - r.bottom, r.width, r.height);
    gl.setScissorTest(true);
    gl.render(scene, cam);
    gl.setScissorTest(false);
    gl.setViewport(0, 0, W, H);
    root.classList.toggle('landscape', landscape());
    void narrow;
    return true;
  };
  function close(): void {
    g.renderOverride = null;
    g.input.enabled = true;
    g.phase = prevPhase === 'editor' ? 'play' : prevPhase;
    root.remove();
    av.dispose();
    ped.geometry.dispose();
  }
}
