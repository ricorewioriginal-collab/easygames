// Figurenerstellung: Haushalt mit 1–8 Personen (plus Haustiere) zusammenstellen, Aussehen und Persönlichkeit festlegen.
// Reine Helfer (validateHousehold, randomMember) sind ohne DOM/WebGL testbar; die Oberfläche (openCas) erzeugt
// erst beim Öffnen ein kleines WebGL-Vorschaufenster und gibt es beim Schließen vollständig wieder frei.
import * as THREE from 'three';
import type { CustomMember, NewGameOpts } from '../sim/setup';
import { AGE_STAGES, OUTFIT_KINDS, SKILL_IDS, type AgeStage, type Appearance, type Outfit, type OutfitKind, type SkillId, type TraitId } from '../data/types';
import { ASPIRATIONS, SKILLS, TRAITS } from '../data/traits';
import { RECIPES } from '../data/moodlets';
import { CAREERS } from '../data/careers';
import { Rng } from '../core/rng';
import { ACCESSORIES, AGE_NAMES, BEARDS, BOTTOMS, BROWS, CLOTH_COLORS, EYE_COLORS, EYE_SHAPES, GLASSES, HAIR_COLORS, HAIR_STYLES, HEAD_SHAPES, NOSES, OUTFIT_NAMES, SHOES, SKIN_TONES, TOPS, cloneLook, randomLook } from '../sim/look';
import { HumanModel } from '../render/human';
import { FUR_COLORS, furSwatch } from '../render/pet';
import { btn, clear, closeTopModal, confirmDlg, h, modalOpen, toast } from './dom';

type CustomHousehold = NonNullable<NewGameOpts['custom']>;
type PetEntry = NonNullable<CustomHousehold['pets']>[number];

export interface CasOpts {
  /** Mindestanzahl Erwachsener (Standard 1, nie weniger als 1) */
  minAdults?: number;
  title?: string;
  /** nur eine Person, keine Haustiere (z. B. Gastkarte im Mehrspieler) */
  single?: boolean;
  /** Startbesetzung (wird kopiert) */
  initial?: CustomMember[];
}

// ---------- Konstanten ----------
export const CAS_MAX_MEMBERS = 8;
export const CAS_MAX_TRAITS = 3;
export const CAS_MAX_HOBBIES = 3;
export const CAS_MAX_PETS = 3;
export const CAS_MAX_NAME = 20;
const MAX_HH_NAME = 30;

const ADULT_AGES: ReadonlySet<AgeStage> = new Set<AgeStage>(['youngadult', 'adult', 'senior']);
export const isAdultAge = (a: AgeStage): boolean => ADULT_AGES.has(a);
const ageIdx = (a: AgeStage): number => AGE_STAGES.indexOf(a);
const PRONOUNS: CustomMember['pronoun'][] = ['sie', 'er', 'they'];

const FIRST_SIE = ['Lena', 'Mia', 'Hanna', 'Emma', 'Lea', 'Sophie', 'Marie', 'Clara', 'Ida', 'Frieda', 'Aylin', 'Zeynep', 'Amara', 'Nora', 'Elif', 'Greta', 'Jana', 'Paula', 'Yuki', 'Ines', 'Malin', 'Svea'];
const FIRST_ER = ['Jonas', 'Felix', 'Paul', 'Lukas', 'Ben', 'Emil', 'Theo', 'Noah', 'Mats', 'Karim', 'Deniz', 'Tobias', 'Jakob', 'Malik', 'Arne', 'Ole', 'Kofi', 'Rafael', 'Henrik', 'Milan', 'Bastian', 'Levin'];
const FIRST_THEY = ['Kim', 'Alex', 'Robin', 'Sascha', 'Charlie', 'Mika', 'Luca', 'Noa', 'Kai', 'Toni', 'Sam', 'Jule', 'Eli', 'Ronja', 'Finn', 'Nika'];
const LAST_NAMES = ['Becker', 'Hoffmann', 'Wagner', 'Schulz', 'Krüger', 'Yilmaz', 'Nowak', 'Lindqvist', 'Okafor', 'Petersen', 'Brandt', 'Voss', 'Haas', 'Kaya', 'Lorenz', 'Sommer', 'Winter', 'Albrecht', 'Mendes', 'Fischer', 'Hartmann', 'Engel', 'Rossi', 'Nguyen'];
const PET_NAMES: Record<'dog' | 'cat', string[]> = {
  dog: ['Bello', 'Luna', 'Kalle', 'Frieda', 'Rudi', 'Maja', 'Pepper', 'Socke', 'Balu', 'Emma'],
  cat: ['Minka', 'Mohrle', 'Tiger', 'Lilli', 'Kasimir', 'Nala', 'Pünktchen', 'Gizmo', 'Mimi', 'Oskar'],
};
const ACC_COLORS = ['#d4af37', '#c0c0c0', '#c44536', '#33658a', '#f4f1ea', '#1b1b1e', '#3a7d44', '#f0a6ca'];
const AGE_ICONS: Record<AgeStage, string> = { baby: '👶', toddler: '🧸', child: '🧒', teen: '🎒', youngadult: '🧑', adult: '🧑', senior: '🧓' };

function traitsConflict(a: TraitId, b: TraitId): boolean {
  const da = TRAITS.find((t) => t.id === a);
  const db = TRAITS.find((t) => t.id === b);
  return !!(da?.conflicts?.includes(b) || db?.conflicts?.includes(a));
}
const traitName = (id: TraitId): string => TRAITS.find((t) => t.id === id)?.name ?? id;

/** Karrieren, die für diese Altersstufe in Frage kommen */
function careersFor(age: AgeStage): typeof CAREERS {
  return CAREERS.filter((c) => ageIdx(age) >= ageIdx(c.minAge));
}

// ---------- reine Helfer ----------

/** Zufällige, gültige Person (deterministisch je Seed). Ohne Alter: meist erwachsen. */
export function randomMember(seed: number, age?: AgeStage): CustomMember {
  const rng = new Rng((seed ^ 0x5bd1e995) >>> 0);
  const a: AgeStage = age ?? rng.pick<AgeStage>(['youngadult', 'youngadult', 'adult', 'adult', 'adult', 'senior']);
  const pronoun = rng.pick<CustomMember['pronoun']>(['sie', 'er', 'sie', 'er', 'they']);
  const first = rng.pick(pronoun === 'sie' ? FIRST_SIE : pronoun === 'er' ? FIRST_ER : FIRST_THEY);
  const last = rng.pick(LAST_NAMES);
  const nTraits = a === 'baby' || a === 'toddler' ? 1 : a === 'child' ? 2 : 3;
  const m: CustomMember = {
    first,
    last,
    pronoun,
    age: a,
    traits: randomTraits(rng, nTraits),
    aspiration: rng.pick(ASPIRATIONS).id,
    look: randomLook(rng.int(1, 0x7ffffff0), a),
    favFood: rng.pick(RECIPES).name,
    hobbies: a === 'baby' || a === 'toddler' ? [] : randomHobbies(rng, rng.int(1, 2)),
  };
  return m;
}

function randomTraits(rng: Rng, n: number): TraitId[] {
  const pool = TRAITS.map((t) => t.id);
  const out: TraitId[] = [];
  for (let guard = 0; out.length < n && guard < 200; guard++) {
    const t = rng.pick(pool);
    if (!out.includes(t) && !out.some((o) => traitsConflict(o, t))) out.push(t);
  }
  return out;
}
function randomHobbies(rng: Rng, n: number): SkillId[] {
  const out: SkillId[] = [];
  for (let guard = 0; out.length < n && guard < 100; guard++) {
    const s = rng.pick(SKILL_IDS);
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/** Prüft einen eigenen Haushalt. Liefert einen deutschen Fehlertext oder null, wenn alles passt. */
export function validateHousehold(c: CustomHousehold, minAdults = 1): string | null {
  const mem = c?.members;
  if (!Array.isArray(mem) || mem.length === 0) return 'Der Haushalt braucht mindestens eine Person.';
  if (mem.length > CAS_MAX_MEMBERS) return `Ein Haushalt hat höchstens ${CAS_MAX_MEMBERS} Personen.`;
  const hn = (c.name ?? '').trim();
  if (!hn) return 'Bitte gib dem Haushalt einen Namen.';
  if (hn.length > MAX_HH_NAME) return `Der Haushaltsname darf höchstens ${MAX_HH_NAME} Zeichen lang sein.`;
  for (const [i, m] of mem.entries()) {
    const first = (m.first ?? '').trim();
    const last = (m.last ?? '').trim();
    if (!first) return `Person ${i + 1} braucht einen Vornamen.`;
    const who = first;
    if (!last) return `${who} braucht einen Nachnamen.`;
    if (first.length > CAS_MAX_NAME || last.length > CAS_MAX_NAME) return `Namen dürfen höchstens ${CAS_MAX_NAME} Zeichen lang sein (${who}).`;
    if (!AGE_STAGES.includes(m.age)) return `${who}: unbekannte Altersstufe.`;
    if (!PRONOUNS.includes(m.pronoun)) return `${who}: bitte ein Pronomen wählen.`;
    const traits = m.traits ?? [];
    if (traits.length > CAS_MAX_TRAITS) return `${who} darf höchstens ${CAS_MAX_TRAITS} Eigenschaften haben.`;
    if (new Set(traits).size !== traits.length) return `${who} hat eine Eigenschaft doppelt.`;
    for (const t of traits) if (!TRAITS.some((d) => d.id === t)) return `${who}: unbekannte Eigenschaft „${t}“.`;
    for (let a = 0; a < traits.length; a++)
      for (let b = a + 1; b < traits.length; b++)
        if (traitsConflict(traits[a]!, traits[b]!)) return `${who}: „${traitName(traits[a]!)}“ und „${traitName(traits[b]!)}“ schließen sich aus.`;
    if (!ASPIRATIONS.some((x) => x.id === m.aspiration)) return `${who} braucht ein Lebensziel.`;
    const hob = m.hobbies ?? [];
    if (hob.length > CAS_MAX_HOBBIES) return `${who} darf höchstens ${CAS_MAX_HOBBIES} Hobbys haben.`;
    if (new Set(hob).size !== hob.length || hob.some((s) => !SKILL_IDS.includes(s))) return `${who}: ungültige Hobbys.`;
    if (m.career) {
      const cd = CAREERS.find((x) => x.id === m.career);
      if (!cd) return `${who}: unbekannter Beruf.`;
      if (ageIdx(m.age) < ageIdx(cd.minAge)) return `${who} ist für den Beruf „${cd.name}“ noch zu jung.`;
    }
    if (!m.look || typeof m.look !== 'object' || !m.look.outfits) return `${who}: Aussehen fehlt.`;
  }
  const adults = mem.filter((m) => isAdultAge(m.age)).length;
  const need = Math.max(1, Math.floor(minAdults));
  if (adults === 0 && mem.some((m) => m.age === 'baby' || m.age === 'toddler')) return 'Babys und Kleinkinder brauchen eine erwachsene Person im Haushalt.';
  if (adults < need) return need === 1 ? 'Mindestens eine erwachsene Person wird gebraucht – Kinder und Jugendliche können nicht allein wohnen.' : `Dieser Haushalt braucht mindestens ${need} Erwachsene.`;
  const pets = c.pets ?? [];
  if (pets.length > CAS_MAX_PETS) return `Höchstens ${CAS_MAX_PETS} Haustiere pro Haushalt.`;
  for (const p of pets) {
    const pn = (p.name ?? '').trim();
    if (!pn) return 'Jedes Haustier braucht einen Namen.';
    if (pn.length > CAS_MAX_NAME) return `Tiernamen dürfen höchstens ${CAS_MAX_NAME} Zeichen lang sein.`;
    if (p.kind !== 'dog' && p.kind !== 'cat') return `${pn}: unbekannte Tierart.`;
    if (!Number.isInteger(p.fur) || p.fur < 0 || p.fur >= FUR_COLORS.length) return `${pn}: ungültige Fellfarbe.`;
  }
  return null;
}

function cloneMember(m: CustomMember): CustomMember {
  return { ...m, traits: [...m.traits], hobbies: [...(m.hobbies ?? [])], look: cloneLook(m.look) };
}
const newSeed = (): number => (Math.random() * 0x7ffffff0) | 0 || 1;

// ---------- 3D-Vorschau ----------
type Pose = 'idle' | 'wave' | 'cheer';
const POSES: Pose[] = ['idle', 'wave', 'cheer'];

class CasPreview {
  readonly el: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private readonly scene = new THREE.Scene();
  private readonly cam = new THREE.PerspectiveCamera(30, 260 / 340, 0.05, 40);
  private readonly models = new Map<CustomMember, HumanModel>();
  private readonly extras: { dispose(): void }[] = [];
  private cur: HumanModel | null = null;
  private raf = 0;
  private last = 0;
  private rotY = 0.5;
  private dragging = false;
  private dragX = 0;
  private resumeAt = 0;
  private pose: Pose = 'idle';
  private poseT = 0;
  private camY = 1;
  private camD = 4;
  private ro: ResizeObserver | null = null;
  private readonly reduced: boolean;
  private disposed = false;

  constructor() {
    this.canvas = h('canvas', { 'aria-label': '3D-Vorschau der Figur (ziehen zum Drehen)', role: 'img' });
    this.el = h('div', { class: 'cas-view' }, this.canvas);
    this.reduced = (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.body.classList.contains('reduce');
    try {
      const r = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      r.setClearColor(0x000000, 0);
      this.renderer = r;
    } catch {
      this.el.appendChild(h('div', { class: 'cas-noview' }, '3D-Vorschau nicht verfügbar'));
    }
    const hemi = new THREE.HemisphereLight(0xfff3e2, 0x41606b, 2.2);
    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(1.5, 3, 2.5);
    const fill = new THREE.DirectionalLight(0xbfdfff, 0.6);
    fill.position.set(-2, 1.5, -1.5);
    const shadowGeo = new THREE.CircleGeometry(0.42, 28);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.002;
    this.scene.add(hemi, sun, fill, shadow);
    this.extras.push(hemi, sun, fill, shadowGeo, shadowMat);

    // Ziehen zum Drehen
    this.canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.dragX = e.clientX;
      this.canvas.setPointerCapture?.(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.rotY += (e.clientX - this.dragX) * 0.012;
      this.dragX = e.clientX;
    });
    const up = (): void => {
      this.dragging = false;
      this.resumeAt = performance.now() + 2500;
    };
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointercancel', up);
  }

  start(): void {
    if (!this.renderer || this.disposed) return;
    if (typeof ResizeObserver === 'function') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.el);
    }
    this.resize();
    this.last = performance.now();
    const loop = (t: number): void => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      this.frame(t);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private resize(): void {
    if (!this.renderer) return;
    const w = Math.max(1, Math.round(this.el.clientWidth));
    const hh = Math.max(1, Math.round(this.el.clientHeight));
    this.renderer.setSize(w, hh, false);
    this.cam.aspect = w / hh;
    this.cam.updateProjectionMatrix();
  }

  rotate(delta: number): void {
    this.rotY += delta;
    this.resumeAt = performance.now() + 2500;
  }

  nextPose(): Pose {
    this.pose = POSES[(POSES.indexOf(this.pose) + 1) % POSES.length]!;
    this.poseT = 0;
    return this.pose;
  }

  show(m: CustomMember, outfit: OutfitKind): void {
    if (this.disposed) return;
    let model = this.models.get(m);
    if (!model) {
      model = new HumanModel(m.look, m.age, outfit);
      this.models.set(m, model);
    } else model.setLook(m.look, m.age, outfit); // baut nur neu, wenn sich etwas geändert hat
    if (this.cur !== model) {
      if (this.cur) this.scene.remove(this.cur.object);
      this.scene.add(model.object);
      this.cur = model;
    }
  }

  /** Modell einer entfernten Person freigeben */
  forget(m: CustomMember): void {
    const model = this.models.get(m);
    if (!model) return;
    if (this.cur === model) {
      this.scene.remove(model.object);
      this.cur = null;
    }
    model.dispose();
    this.models.delete(m);
  }

  private frame(t: number): void {
    const dt = Math.min(0.05, Math.max(0, (t - this.last) / 1000));
    this.last = t;
    const m = this.cur;
    if (!m || !this.renderer) return;
    if (!this.reduced && !this.dragging && t > this.resumeAt) this.rotY += dt * 0.45;
    m.object.rotation.y = this.rotY;
    this.poseT += dt;
    m.update({ anim: this.pose, t: this.poseT, emo: this.pose === 'idle' ? 'fine' : 'happy', emoPower: 2 }, dt);
    // Kamera auf die Körpergröße einstellen (weich nachführen)
    const H = m.height;
    const tgtY = H * 0.55;
    const tgtD = (H * 1.18) / 2 / Math.tan(THREE.MathUtils.degToRad(this.cam.fov / 2)) + 0.25;
    const k = this.reduced ? 1 : Math.min(1, dt * 6);
    this.camY += (tgtY - this.camY) * k;
    this.camD += (tgtD - this.camD) * k;
    this.cam.position.set(0, this.camY + H * 0.08, this.camD);
    this.cam.lookAt(0, this.camY, 0);
    this.renderer.render(this.scene, this.cam);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.ro = null;
    for (const m of this.models.values()) {
      this.scene.remove(m.object);
      m.dispose();
    }
    this.models.clear();
    this.cur = null;
    for (const x of this.extras) x.dispose();
    this.scene.clear();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.el.remove();
  }
}

// ---------- Oberfläche ----------
type Cat = 'person' | 'body' | 'face' | 'hair' | 'clothes' | 'mind' | 'pets';
const CATS: { id: Cat; label: string }[] = [
  { id: 'person', label: 'Person' },
  { id: 'body', label: 'Körper' },
  { id: 'face', label: 'Gesicht' },
  { id: 'hair', label: 'Haare' },
  { id: 'clothes', label: 'Kleidung' },
  { id: 'mind', label: 'Persönlichkeit' },
  { id: 'pets', label: 'Haustiere' },
];

let closeActive: (() => void) | null = null;

export function openCas(onDone: (custom: CustomHousehold) => void, opts: CasOpts = {}, onCancel?: () => void): void {
  closeActive?.();
  const single = !!opts.single;
  const minAdults = Math.max(1, opts.minAdults ?? 1);
  const title = opts.title ?? (single ? 'Figur erstellen' : 'Haushalt erstellen');

  // Startbesetzung
  let members: CustomMember[] = (opts.initial ?? []).map(cloneMember);
  if (single) members = members.slice(0, 1);
  members = members.slice(0, CAS_MAX_MEMBERS);
  if (!members.length) {
    const first = randomMember(newSeed(), 'youngadult');
    members.push(first);
    if (!single) for (let i = 1; i < minAdults && i < CAS_MAX_MEMBERS; i++) members.push({ ...randomMember(newSeed(), 'adult'), last: first.last });
  }
  const st = {
    name: `Familie ${members[0]!.last}`,
    pets: [] as PetEntry[],
    sel: 0,
    cat: 'person' as Cat,
    outfit: 'everyday' as OutfitKind,
    sameLast: true,
    dirty: false,
  };
  const cur = (): CustomMember => members[st.sel]!;
  const lk = (): Appearance => cur().look;

  // ----- Grundgerüst -----
  const preview = new CasPreview();
  const hhInput = h('input', { type: 'text', value: st.name, maxlength: MAX_HH_NAME, 'aria-label': 'Haushaltsname', placeholder: 'Haushaltsname' });
  hhInput.addEventListener('input', () => {
    st.name = hhInput.value;
    st.dirty = true;
  });
  const membersRow = h('div', { class: 'cas-members', role: 'tablist', 'aria-label': 'Personen im Haushalt' });
  const catsRow = h('div', { class: 'cas-cats', role: 'tablist', 'aria-label': 'Bereiche' });
  const body = h('div', { class: 'cas-body', role: 'tabpanel' });
  const poseBtn = btn(h('span', null, '🙋 Posen'), () => {
    const p = preview.nextPose();
    poseBtn.setAttribute('aria-label', `Pose wechseln (jetzt: ${p === 'idle' ? 'stehen' : p === 'wave' ? 'winken' : 'jubeln'})`);
  }, 'small', { 'aria-label': 'Pose wechseln' });
  const stage = h(
    'div',
    { class: 'cas-stage' },
    preview.el,
    h(
      'div',
      { class: 'cas-stagebtns' },
      btn('↺', () => preview.rotate(-0.6), 'small', { 'aria-label': 'Nach links drehen' }),
      poseBtn,
      btn('↻', () => preview.rotate(0.6), 'small', { 'aria-label': 'Nach rechts drehen' }),
      btn('🎲 Person', () => randomizePerson(), 'small', { 'aria-label': 'Ganze Person zufällig' }),
    ),
  );
  const root = h(
    'div',
    { id: 'cas', class: 'cas-root', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
    h('div', { class: 'cas-head' }, h('h2', null, title), single ? null : h('label', { class: 'cas-hhname' }, h('span', null, 'Haushalt'), hhInput)),
    h('div', { class: 'cas-main' }, stage, h('div', { class: 'cas-panel' }, membersRow, catsRow, body)),
    h('div', { class: 'cas-foot' }, btn('Abbrechen', () => cancel(), 'ghost'), h('span', { class: 'grow' }), btn('✔ Fertig', () => finish(), 'primary')),
  );

  // ----- Aktualisieren -----
  const outfitShown = (): OutfitKind => (st.cat === 'clothes' ? st.outfit : 'everyday');
  const refreshPreview = (): void => preview.show(cur(), outfitShown());
  const touch = (rerender = true): void => {
    st.dirty = true;
    refreshPreview();
    renderMembers();
    if (rerender) renderBody();
  };

  function renderMembers(): void {
    clear(membersRow);
    members.forEach((m, i) => {
      const on = i === st.sel;
      membersRow.appendChild(
        h(
          'button',
          {
            type: 'button',
            class: `cas-mtab${on ? ' on' : ''}`,
            role: 'tab',
            'aria-selected': String(on),
            title: `${m.first || 'Person ' + (i + 1)} – ${AGE_NAMES[m.age]}`,
            onclick: () => {
              st.sel = i;
              refreshPreview();
              renderMembers();
              renderBody();
            },
          },
          h('span', { class: 'cas-mico', 'aria-hidden': 'true' }, AGE_ICONS[m.age]),
          h('span', null, m.first.trim() || `Person ${i + 1}`),
        ),
      );
    });
    if (!single) {
      membersRow.appendChild(btn('＋ Person', () => addMember(), 'small cas-add', { disabled: members.length >= CAS_MAX_MEMBERS, 'aria-label': 'Person hinzufügen' }));
      if (members.length > 1) membersRow.appendChild(btn('✕', () => removeMember(), 'small ghost cas-del', { 'aria-label': `${cur().first || 'Person'} entfernen`, title: 'Ausgewählte Person entfernen' }));
    }
  }

  function renderCats(): void {
    clear(catsRow);
    for (const c of CATS) {
      if (c.id === 'pets' && single) continue;
      const on = c.id === st.cat;
      catsRow.appendChild(
        h('button', {
          type: 'button',
          class: `cas-cat${on ? ' on' : ''}`,
          role: 'tab',
          'aria-selected': String(on),
          onclick: () => {
            st.cat = c.id;
            body.scrollTop = 0;
            renderCats();
            refreshPreview();
            renderBody();
          },
        }, c.label),
      );
    }
  }

  function renderBody(): void {
    const top = body.scrollTop;
    const act = document.activeElement as HTMLElement | null;
    const key = act && body.contains(act) ? act.dataset.k : undefined;
    clear(body);
    body.appendChild(
      st.cat === 'person' ? personTab()
      : st.cat === 'body' ? bodyTab()
      : st.cat === 'face' ? faceTab()
      : st.cat === 'hair' ? hairTab()
      : st.cat === 'clothes' ? clothesTab()
      : st.cat === 'mind' ? mindTab()
      : petsTab(),
    );
    body.scrollTop = top;
    if (key) body.querySelector<HTMLElement>(`[data-k="${key.replace(/"/g, '')}"]`)?.focus();
  }

  // ----- Bausteine -----
  const section = (title2: string, onRandom: (() => void) | null, ...kids: (Node | null)[]): HTMLElement =>
    h(
      'section',
      { class: 'cas-sec' },
      h('div', { class: 'cas-sechead' }, h('h3', null, title2), onRandom ? btn('🎲 Zufällig', onRandom, 'small ghost', { 'aria-label': `${title2}: zufällig` }) : null),
      ...kids,
    );

  function chips<T extends string | number>(label: string, key: string, items: { v: T; label: string; title?: string; disabled?: boolean }[], isOn: (v: T) => boolean, onPick: (v: T) => void): HTMLElement {
    return h(
      'div',
      { class: 'cas-field', role: 'group', 'aria-label': label },
      label ? h('span', { class: 'cas-label' }, label) : null,
      h(
        'div',
        { class: 'cas-chips' },
        items.map((it) => {
          const on = isOn(it.v);
          return h('button', { type: 'button', class: `cas-chip${on ? ' on' : ''}`, 'aria-pressed': String(on), disabled: !!it.disabled && !on, title: it.title, 'data-k': `${key}:${it.v}`, onclick: () => onPick(it.v) }, it.label);
        }),
      ),
    );
  }

  function swatches(label: string, key: string, colors: readonly string[], value: string, onPick: (c: string) => void, names?: readonly string[]): HTMLElement {
    const custom = h('input', { type: 'color', class: 'cas-color', value: /^#[0-9a-f]{6}$/i.test(value) ? value : '#888888', 'aria-label': `${label}: eigene Farbe`, title: 'Eigene Farbe', 'data-k': `${key}:custom` });
    custom.addEventListener('input', () => {
      onPick(custom.value);
      touch(false);
    });
    custom.addEventListener('change', () => touch());
    return h(
      'div',
      { class: 'cas-field', role: 'group', 'aria-label': label },
      h('span', { class: 'cas-label' }, label),
      h(
        'div',
        { class: 'cas-sws' },
        colors.map((c, i) => {
          const on = c.toLowerCase() === value.toLowerCase();
          return h('button', {
            type: 'button',
            class: `cas-sw${on ? ' on' : ''}`,
            style: `background:${c}`,
            'aria-pressed': String(on),
            'aria-label': `${label}: ${names?.[i] ?? `Farbe ${i + 1}`}`,
            title: names?.[i],
            'data-k': `${key}:${i}`,
            onclick: () => {
              onPick(c);
              touch();
            },
          });
        }),
        names ? null : custom,
      ),
    );
  }

  function slider(label: string, key: string, value: number, onInput: (v: number) => void, lo = 'wenig', hi = 'viel'): HTMLElement {
    const inp = h('input', { type: 'range', min: -1, max: 1, step: 0.05, value: String(value), 'data-k': key, 'aria-label': label, 'aria-valuetext': `${Math.round((value + 1) * 50)} %` });
    inp.addEventListener('input', () => {
      const v = Number(inp.value);
      onInput(v);
      inp.setAttribute('aria-valuetext', `${Math.round((v + 1) * 50)} %`);
      touch(false);
    });
    return h('label', { class: 'cas-slider' }, h('span', { class: 'cas-label' }, label), inp, h('span', { class: 'cas-range' }, h('small', null, lo), h('small', null, hi)));
  }

  const opt = (names: readonly string[]): { v: number; label: string }[] => names.map((n, i) => ({ v: i, label: n }));
  const pick = <T extends string | number>(label: string, key: string, names: { v: T; label: string; title?: string; disabled?: boolean }[], get: () => T, set: (v: T) => void): HTMLElement =>
    chips(label, key, names, (v) => v === get(), (v) => {
      set(v);
      touch();
    });

  function textField(label: string, key: string, value: string, onInput: (v: string) => void, max = CAS_MAX_NAME): HTMLElement {
    const inp = h('input', { type: 'text', value, maxlength: max, 'data-k': key, autocomplete: 'off', spellcheck: 'false' });
    inp.addEventListener('input', () => {
      onInput(inp.value);
      st.dirty = true;
      renderMembers();
    });
    return h('label', { class: 'cas-text' }, h('span', { class: 'cas-label' }, label), inp);
  }

  // ----- Zufall -----
  const fresh = (age: AgeStage, frame?: 0 | 1): Appearance => randomLook(newSeed(), age, frame === undefined ? {} : { frame });
  function randomizePerson(): void {
    const m = cur();
    const r = randomMember(newSeed(), m.age);
    Object.assign(m, { ...r, last: members.length > 1 ? m.last : r.last, career: undefined });
    if (members.length === 1 && !single && st.name.startsWith('Familie ')) {
      st.name = `Familie ${m.last}`;
      hhInput.value = st.name;
    }
    touch();
  }
  function randBody(): void {
    const r = fresh(cur().age);
    Object.assign(lk(), { frame: r.frame, height: r.height, weight: r.weight, muscle: r.muscle, skin: r.skin });
    touch();
  }
  function randFace(): void {
    const r = fresh(cur().age);
    Object.assign(lk(), { headShape: r.headShape, jaw: r.jaw, nose: r.nose, noseSize: r.noseSize, eyes: r.eyes, eyeColor: r.eyeColor, brows: r.brows });
    touch();
  }
  function randHair(): void {
    const r = fresh(cur().age, lk().frame);
    Object.assign(lk(), { hair: r.hair, hairColor: r.hairColor, beard: r.beard });
    touch();
  }
  function randAcc(): void {
    const r = fresh(cur().age);
    Object.assign(lk(), { glasses: r.glasses, accessory: r.accessory, accessoryColor: r.accessoryColor });
    touch();
  }
  function randOutfit(all: boolean): void {
    const r = fresh(cur().age, lk().frame);
    if (all) lk().outfits = r.outfits;
    else lk().outfits[st.outfit] = r.outfits[st.outfit];
    touch();
  }
  function randMind(): void {
    const r = randomMember(newSeed(), cur().age);
    Object.assign(cur(), { traits: r.traits, aspiration: r.aspiration, favFood: r.favFood, hobbies: r.hobbies });
    touch();
  }

  // ----- Reiter -----
  function personTab(): HTMLElement {
    const m = cur();
    const kid = !isAdultAge(m.age) && m.age !== 'teen';
    const careers = kid ? [] : careersFor(m.age);
    return h(
      'div',
      null,
      section(
        'Name',
        null,
        h(
          'div',
          { class: 'cas-names' },
          textField('Vorname', 'first', m.first, (v) => (m.first = v)),
          textField('Nachname', 'last', m.last, (v) => {
            const old = m.last;
            m.last = v;
            if (st.sameLast) for (const o of members) if (o !== m && o.last === old) o.last = v;
            if (st.sameLast && st.name === `Familie ${old}`) {
              st.name = `Familie ${v}`;
              hhInput.value = st.name;
            }
          }),
        ),
        members.length > 1 && !single
          ? h(
              'label',
              { class: 'cas-check' },
              h('input', {
                type: 'checkbox',
                checked: st.sameLast,
                onchange: (e: Event) => (st.sameLast = (e.target as HTMLInputElement).checked),
              }),
              h('span', null, 'Nachname für die ganze Familie ändern'),
            )
          : null,
      ),
      section(
        'Pronomen',
        null,
        pick('', 'pron', [{ v: 'sie', label: 'sie' }, { v: 'er', label: 'er' }, { v: 'they', label: 'they' }] as { v: CustomMember['pronoun']; label: string }[], () => m.pronoun, (v) => (m.pronoun = v)),
        h('p', { class: 'cas-hint' }, 'Das Pronomen ist unabhängig vom Körperbau.'),
      ),
      section(
        'Altersstufe',
        null,
        pick('', 'age', AGE_STAGES.map((a) => ({ v: a, label: `${AGE_ICONS[a]} ${AGE_NAMES[a]}` })), () => m.age, (a) => {
          m.age = a;
          if (!isAdultAge(a)) m.look.beard = 0;
          if (m.career && !careersFor(a).some((c) => c.id === m.career)) m.career = undefined;
          if (a === 'baby' || a === 'toddler') m.hobbies = [];
        }),
        h('p', { class: 'cas-hint' }, single ? 'Jugendliche und Kinder können nicht allein wohnen.' : `Mindestens ${minAdults === 1 ? 'eine erwachsene Person' : `${minAdults} Erwachsene`} – Babys und Kinder brauchen jemanden, der sich kümmert.`),
      ),
      careers.length
        ? section(
            'Beruf (optional)',
            null,
            pick('', 'career', [{ v: '', label: 'Keiner' }, ...careers.map((c) => ({ v: c.id, label: `${c.icon} ${c.name}`, title: c.desc }))], () => m.career ?? '', (v) => (m.career = v || undefined)),
          )
        : null,
    );
  }

  function bodyTab(): HTMLElement {
    const l = lk();
    return h(
      'div',
      null,
      section(
        'Körperbau',
        randBody,
        pick('Grundform', 'frame', [{ v: 0, label: 'Schmal gebaut' }, { v: 1, label: 'Breit gebaut' }], () => l.frame, (v) => (l.frame = v as 0 | 1)),
        slider('Größe', 'height', l.height, (v) => (l.height = v), 'klein', 'groß'),
        slider('Gewicht', 'weight', l.weight, (v) => (l.weight = v), 'schlank', 'kräftig'),
        slider('Muskeln', 'muscle', l.muscle, (v) => (l.muscle = v)),
      ),
      section('Haut', null, swatches('Hautton', 'skin', SKIN_TONES, l.skin, (c) => (l.skin = c))),
    );
  }

  function faceTab(): HTMLElement {
    const l = lk();
    return h(
      'div',
      null,
      section(
        'Gesicht',
        randFace,
        pick('Kopfform', 'head', opt(HEAD_SHAPES), () => l.headShape, (v) => (l.headShape = v)),
        slider('Kinnpartie', 'jaw', l.jaw, (v) => (l.jaw = v), 'weich', 'markant'),
        pick('Nase', 'nose', opt(NOSES), () => l.nose, (v) => (l.nose = v)),
        slider('Nasengröße', 'noseSize', l.noseSize, (v) => (l.noseSize = v), 'klein', 'groß'),
        pick('Augenform', 'eyes', opt(EYE_SHAPES), () => l.eyes, (v) => (l.eyes = v)),
        swatches('Augenfarbe', 'eyeColor', EYE_COLORS, l.eyeColor, (c) => (l.eyeColor = c)),
        pick('Augenbrauen', 'brows', opt(BROWS), () => l.brows, (v) => (l.brows = v)),
      ),
    );
  }

  function hairTab(): HTMLElement {
    const l = lk();
    const m = cur();
    return h(
      'div',
      null,
      section(
        'Haare',
        randHair,
        pick('Frisur', 'hair', opt(HAIR_STYLES), () => l.hair, (v) => (l.hair = v)),
        swatches('Haarfarbe', 'hairColor', HAIR_COLORS, l.hairColor, (c) => (l.hairColor = c)),
        isAdultAge(m.age) ? pick('Bart', 'beard', opt(BEARDS), () => l.beard, (v) => (l.beard = v)) : null,
      ),
      section(
        'Accessoires',
        randAcc,
        pick('Brille', 'glasses', opt(GLASSES), () => l.glasses, (v) => (l.glasses = v)),
        pick('Accessoire', 'acc', opt(ACCESSORIES), () => l.accessory, (v) => (l.accessory = v)),
        l.accessory ? swatches('Accessoire-Farbe', 'accColor', ACC_COLORS, l.accessoryColor, (c) => (l.accessoryColor = c)) : null,
      ),
    );
  }

  function clothesTab(): HTMLElement {
    const l = lk();
    const o: Outfit = l.outfits[st.outfit];
    return h(
      'div',
      null,
      chips('Anlass', 'okind', OUTFIT_KINDS.map((k) => ({ v: k, label: OUTFIT_NAMES[k] })), (k) => k === st.outfit, (k) => {
        st.outfit = k;
        refreshPreview();
        renderBody();
      }),
      h(
        'div',
        { class: 'cas-row' },
        btn('🎲 Dieses Outfit', () => randOutfit(false), 'small'),
        btn('🎲 Alle Outfits', () => randOutfit(true), 'small'),
        btn('Alltag für alle übernehmen', () => {
          for (const k of OUTFIT_KINDS) if (k !== 'everyday') l.outfits[k] = { ...l.outfits.everyday };
          touch();
          toast('Alltagskleidung für alle Anlässe übernommen', '👕', 'good', 2200);
        }, 'small', { title: 'Kopiert die Alltagskleidung in alle anderen Outfits' }),
      ),
      section(
        `Oberteil (${OUTFIT_NAMES[st.outfit]})`,
        null,
        pick('', 'top', opt(TOPS), () => o.top, (v) => (o.top = v)),
        swatches('Farbe Oberteil', 'topColor', CLOTH_COLORS, o.topColor, (c) => (o.topColor = c)),
      ),
      section(
        'Unterteil',
        null,
        pick('', 'bottom', opt(BOTTOMS), () => o.bottom, (v) => (o.bottom = v)),
        swatches('Farbe Unterteil', 'bottomColor', CLOTH_COLORS, o.bottomColor, (c) => (o.bottomColor = c)),
      ),
      section(
        'Schuhe',
        null,
        pick('', 'shoes', opt(SHOES), () => o.shoes, (v) => (o.shoes = v)),
        swatches('Farbe Schuhe', 'shoeColor', CLOTH_COLORS, o.shoeColor, (c) => (o.shoeColor = c)),
      ),
    );
  }

  function mindTab(): HTMLElement {
    const m = cur();
    const asp = ASPIRATIONS.find((a) => a.id === m.aspiration);
    const full = m.traits.length >= CAS_MAX_TRAITS;
    const hob = m.hobbies ?? [];
    const toddlerish = m.age === 'baby' || m.age === 'toddler';
    return h(
      'div',
      null,
      section(
        `Eigenschaften (${m.traits.length}/${CAS_MAX_TRAITS})`,
        randMind,
        chips(
          '',
          'trait',
          TRAITS.map((t) => {
            const clash = m.traits.find((x) => traitsConflict(x, t.id));
            return { v: t.id, label: `${t.icon} ${t.name}`, title: clash ? `Passt nicht zu „${traitName(clash)}“` : t.desc, disabled: full || !!clash };
          }),
          (v) => m.traits.includes(v),
          (v) => {
            m.traits = m.traits.includes(v) ? m.traits.filter((x) => x !== v) : [...m.traits, v].slice(0, CAS_MAX_TRAITS);
            touch();
          },
        ),
      ),
      section(
        'Lebensziel',
        null,
        pick('', 'asp', ASPIRATIONS.map((a) => ({ v: a.id, label: `${a.icon} ${a.name}`, title: a.desc })), () => m.aspiration, (v) => (m.aspiration = v)),
        asp ? h('p', { class: 'cas-hint' }, asp.desc) : null,
      ),
      section(
        'Lieblingsessen',
        null,
        pick('', 'food', RECIPES.map((r) => ({ v: r.name, label: `${r.icon} ${r.name}` })), () => m.favFood ?? '', (v) => (m.favFood = v)),
      ),
      toddlerish
        ? null
        : section(
            `Hobbys (${hob.length}/${CAS_MAX_HOBBIES})`,
            null,
            chips(
              '',
              'hobby',
              SKILL_IDS.map((s) => ({ v: s, label: `${SKILLS[s].icon} ${SKILLS[s].name}`, disabled: hob.length >= CAS_MAX_HOBBIES })),
              (v) => hob.includes(v),
              (v) => {
                m.hobbies = hob.includes(v) ? hob.filter((x) => x !== v) : [...hob, v].slice(0, CAS_MAX_HOBBIES);
                touch();
              },
            ),
          ),
    );
  }

  function petsTab(): HTMLElement {
    const furNames = FUR_COLORS.map((f) => f.name);
    const furCols = FUR_COLORS.map((_, i) => furSwatch(i));
    return h(
      'div',
      null,
      st.pets.length ? null : h('p', { class: 'cas-hint' }, 'Noch keine Haustiere. Hunde und Katzen bringen Leben ins Haus.'),
      st.pets.map((p, i) =>
        h(
          'section',
          { class: 'cas-sec cas-pet' },
          h(
            'div',
            { class: 'cas-sechead' },
            h('h3', null, `${p.kind === 'dog' ? '🐕' : '🐈'} ${p.name.trim() || 'Haustier'}`),
            btn('✕ Entfernen', () => {
              st.pets.splice(i, 1);
              touch();
            }, 'small ghost', { 'aria-label': `${p.name || 'Haustier'} entfernen` }),
          ),
          (() => {
            const inp = h('input', { type: 'text', value: p.name, maxlength: CAS_MAX_NAME, 'data-k': `pet${i}name`, autocomplete: 'off' });
            inp.addEventListener('input', () => {
              p.name = inp.value;
              st.dirty = true;
            });
            inp.addEventListener('change', () => renderBody());
            return h('label', { class: 'cas-text' }, h('span', { class: 'cas-label' }, 'Name'), inp);
          })(),
          pick('Tierart', `pet${i}kind`, [{ v: 'dog', label: '🐕 Hund' }, { v: 'cat', label: '🐈 Katze' }] as { v: 'dog' | 'cat'; label: string }[], () => p.kind, (v) => (p.kind = v)),
          swatches('Fellfarbe', `pet${i}fur`, furCols, furCols[p.fur] ?? '', (c) => (p.fur = Math.max(0, furCols.indexOf(c))), furNames),
        ),
      ),
      st.pets.length < CAS_MAX_PETS
        ? h(
            'div',
            { class: 'cas-row' },
            btn('＋ 🐕 Hund', () => addPet('dog'), 'small'),
            btn('＋ 🐈 Katze', () => addPet('cat'), 'small'),
          )
        : h('p', { class: 'cas-hint' }, `Höchstens ${CAS_MAX_PETS} Haustiere.`),
    );
  }

  // ----- Aktionen -----
  function addPet(kind: 'dog' | 'cat'): void {
    if (st.pets.length >= CAS_MAX_PETS) return;
    const rng = new Rng(newSeed());
    const used = new Set(st.pets.map((p) => p.name));
    const name = PET_NAMES[kind].filter((n) => !used.has(n));
    st.pets.push({ name: rng.pick(name.length ? name : PET_NAMES[kind]), kind, fur: rng.int(0, FUR_COLORS.length - 1) });
    touch();
  }

  function addMember(): void {
    if (single || members.length >= CAS_MAX_MEMBERS) return;
    const adults = members.filter((m) => isAdultAge(m.age)).length;
    const m = randomMember(newSeed(), adults < Math.max(2, minAdults) ? 'adult' : 'child');
    m.last = members[0]?.last || m.last;
    members.push(m);
    st.sel = members.length - 1;
    st.cat = 'person';
    renderCats();
    touch();
    body.querySelector<HTMLInputElement>('[data-k="first"]')?.focus();
  }

  function removeMember(): void {
    if (members.length <= 1) return;
    const m = cur();
    const go = (): void => {
      const i = members.indexOf(m);
      if (i < 0) return;
      members.splice(i, 1);
      preview.forget(m);
      st.sel = Math.min(st.sel, members.length - 1);
      touch();
    };
    confirmDlg('Person entfernen?', `${m.first.trim() || 'Diese Person'} wird aus dem Haushalt entfernt.`, 'Entfernen', go);
  }

  function result(): CustomHousehold {
    const mem = members.map((m) => {
      const c = cloneMember(m);
      c.first = c.first.trim();
      c.last = c.last.trim();
      if (!c.career) delete c.career;
      return c;
    });
    if (single) return { name: `${mem[0]!.first} ${mem[0]!.last}`.trim(), members: mem, pets: [] };
    return { name: st.name.trim(), members: mem, pets: st.pets.map((p) => ({ ...p, name: p.name.trim() })) };
  }

  function finish(): void {
    const r = result();
    const err = validateHousehold(r, minAdults);
    if (err) {
      toast(err, '⚠️', 'bad');
      return;
    }
    close();
    onDone(r);
  }

  function cancel(): void {
    if (!st.dirty) {
      close();
      onCancel?.();
      return;
    }
    confirmDlg('Erstellung abbrechen?', 'Deine Änderungen gehen verloren.', 'Verwerfen', () => {
      close();
      onCancel?.();
    }, 'Weiter bearbeiten');
  }

  const onKey = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (modalOpen()) closeTopModal();
    else cancel();
  };

  let closed = false;
  function close(): void {
    if (closed) return;
    closed = true;
    window.removeEventListener('keydown', onKey, true);
    preview.dispose();
    root.remove();
    if (closeActive === close) closeActive = null;
  }
  closeActive = close;

  // ----- Start -----
  window.addEventListener('keydown', onKey, true);
  document.body.appendChild(root);
  renderMembers();
  renderCats();
  renderBody();
  refreshPreview();
  preview.start();
  requestAnimationFrame(() => body.querySelector<HTMLElement>('[data-k="first"]')?.focus());
}
