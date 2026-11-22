/* Liebesszene (nur mit „Inhalte ab 18“): gefilmt wie im Kino in der eigenen Wohnung.
   Annäherung, Umarmung, Kuss, Ausziehen bis zur Unterwäsche, zusammen aufs Bett – dann Schwenk zum Fenster und Abblende.
   Nichts Explizites: keine Nacktheit, kein Geschlechtsverkehr im Bild. Zustimmung und Kondom sind vorher geklärt (Game.runDate).
   Die Figuren sind Rocketbox-Menschen; Umarmen, Kuss und geschlossene Augen sind Knochen-Posen über der Animation. */
import { Quaternion, Vector3, Matrix, PointLight, Color3, TransformNode, StandardMaterial, CreateBox, CreateCylinder, CreatePlane, CreateGround, type Scene, type FreeCamera, type Light } from '../engine/bjs';
import { Actor, playerLook, type Look } from './Actor';
import { avatarFor } from './avatars';
import { music, sfx, moan as moanAt, breath as breathAt, now } from '../engine/Audio';

const moan = (f: number, d: number, g: number, v: 'a' | 'o' | 'm') => moanAt(now() + .02, f, d, g, v);
const breath = (d: number, g: number) => breathAt(now() + .02, d, g);

export interface CineHost { scene: Scene; camera: FreeCamera; player: Actor; cine: ((dt: number) => void) | null; portrait(): boolean }

/* Posen über der Animation: Knochen werden im Raum auf Ziele ausgerichtet (kleine IK), damit Arme wirklich um
   den anderen Körper greifen und Köpfe sich zum Kuss zueinander neigen – unabhängig von den Knochenachsen. */
const tq = new Quaternion(), inv = new Matrix(), a0 = new Vector3(), a1 = new Vector3(), a2 = new Vector3(), id = Quaternion.Identity();
const B = (a: Actor, n: string) => a.bones.get('Bip01 ' + n);
/** node so drehen, dass child Richtung target (Welt) zeigt; w = Anteil 0..1 */
export function aim(node: TransformNode | undefined, child: TransformNode | undefined, target: Vector3, w: number) {
  if (!node || !child || w <= 0) return;
  const par = node.parent as TransformNode | null; if (!par) return;
  fresh(child);
  par.getWorldMatrix().invertToRef(inv);
  Vector3.TransformCoordinatesToRef(child.getAbsolutePosition(), inv, a1);
  Vector3.TransformCoordinatesToRef(target, inv, a2);
  a0.copyFrom(node.position);
  a1.subtractInPlace(a0).normalize(); a2.subtractInPlace(a0).normalize();
  Quaternion.FromUnitVectorsToRef(a1, a2, tq);
  if (w < 1) Quaternion.SlerpToRef(id, tq, w, tq);
  if (!node.rotationQuaternion) node.rotationQuaternion = Quaternion.FromEulerVector(node.rotation);
  tq.multiplyToRef(node.rotationQuaternion, node.rotationQuaternion);
}
/** Weltmatrizen der ganzen Kette von oben nach unten neu rechnen (Animation hat gerade die lokalen Werte gesetzt) */
function fresh(n: TransformNode) { const chain: TransformNode[] = []; for (let x: TransformNode | null = n; x; x = x.parent as TransformNode | null) chain.push(x); for (let i = chain.length - 1; i >= 0; i--) chain[i].computeWorldMatrix(true); }
const W = (n: TransformNode | undefined) => { if (n) fresh(n); return n ? n.getAbsolutePosition().clone() : new Vector3(); };
/** Zwei-Knochen-IK (Oberarm, Unterarm): Ellbogen so legen, dass die Hand genau am Ziel liegt; pole = Richtung, in die
    der Ellbogen ausweicht (nach außen und unten). Vorher lief der Arm nur grob Richtung Ziel und ging durch den Körper. */
function ik2(sh: TransformNode, el: TransformNode, ha: TransformNode, target: Vector3, pole: Vector3, w: number) {
  const S = W(sh), E = W(el), H = W(ha), l1 = Vector3.Distance(S, E), l2 = Vector3.Distance(E, H);
  const d = target.subtract(S), dist = Math.min(Math.max(d.length(), .05), (l1 + l2) * .995), dir = d.normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const p = pole.subtract(dir.scale(Vector3.Dot(pole, dir))); if (p.lengthSquared() < 1e-6) p.copyFromFloats(0, -1, 0); p.normalize();
  aim(sh, el, S.add(dir.scale(a)).add(p.scale(h)), w);
  aim(el, ha, S.add(dir.scale(dist)), w);
}
/** Griff: 'waist' Hände auf dem unteren Rücken, 'neck' Arme über die Schultern um den Nacken, 'side' nebeneinander sitzend
    (innerer Arm um die ferne Schulter), 'none' nur Kuss */
export type Hold = 'waist' | 'neck' | 'side' | 'none';
const UP = new Vector3(0, 1, 0);
/** Umarmen (w 0..1), Kuss auf den Mund (k 0..1) oder in die Halsbeuge (nk 0..1); slide 0..1 lässt die Hände über den Rücken wandern */
export function embrace(a: Actor, o: Actor, w: number, k: number, hold: Hold | boolean = 'waist', slide = .5, nk = 0) {
  if (hold === true) hold = 'side'; else if (hold === false) hold = 'waist';
  const ry = o.root.rotation.y, fo = new Vector3(Math.sin(ry), 0, Math.cos(ry)), ro = new Vector3(Math.cos(ry), 0, -Math.sin(ry));
  const head = B(a, 'Head'), oh = B(o, 'Head'), oNeck = W(B(o, 'Neck'));
  // Kuss-Punkt in der Mitte zwischen beiden Köpfen: so treffen sich die Lippen, statt dass ein Kopf in den anderen taucht
  const lip = Vector3.Center(W(head), W(oh)); lip.y -= .03;
  // Halsbeuge: seitlich vorne am Hals der anderen Person (auf der Seite, auf der man selbst steht)
  const mySide = Vector3.Dot(W(head).subtract(oNeck), ro) >= 0 ? 1 : -1;
  const neckSpot = oNeck.add(ro.scale(.07 * mySide)).add(fo.scale(.09)).add(UP.scale(.06));
  const kiss = Math.max(k, nk), spot = nk > k ? Vector3.Lerp(lip, neckSpot, Math.min(1, nk)) : lip;
  // erst vorbeugen (Wirbelsäule, Hals), dann die Arme, zuletzt der Kopf – Schlüsselbeine hängen am Hals
  if (kiss > 0) {
    aim(B(a, 'Spine2'), B(a, 'Neck'), spot.add(new Vector3(0, -.25, 0)), (.1 + nk * .03) * kiss);
    aim(B(a, 'Neck'), head, spot.add(new Vector3(0, .12, 0)), (.2 + nk * .06) * kiss);
  }
  if (w > 0 && hold !== 'none') {
    for (const side of ['L', 'R']) {
      const sh = B(a, `${side} UpperArm`), el = B(a, `${side} Forearm`), ha = B(a, `${side} Hand`); if (!sh || !el || !ha) continue;
      const sp = W(sh), sgn = Vector3.Dot(sp.subtract(o.root.position), ro) >= 0 ? 1 : -1;
      let hand: Vector3, pole: Vector3;
      if (hold === 'side') {
        // nebeneinander auf der Bettkante: nur der innere Arm, hinter dem Rücken um die ferne Schulter
        const other = W(B(a, side === 'L' ? 'R UpperArm' : 'L UpperArm'));
        if (Vector3.DistanceSquared(sp, o.root.position) > Vector3.DistanceSquared(other, o.root.position)) continue;
        const far = W(B(o, sgn > 0 ? 'L UpperArm' : 'R UpperArm'));
        const farSide = Vector3.Dot(far.subtract(o.root.position), ro) * sgn > 0 ? W(B(o, sgn > 0 ? 'R UpperArm' : 'L UpperArm')) : far;
        hand = farSide.subtract(fo.scale(.05)).add(UP.scale(.03));
        pole = fo.scale(-1).add(UP.scale(-.4));
      } else if (hold === 'neck') {
        // Unterarme liegen auf den Schultern, Hände treffen sich im Nacken
        hand = oNeck.subtract(fo.scale(.08)).add(ro.scale(.05 * sgn)).add(UP.scale(.01));
        pole = ro.scale(sgn).add(UP.scale(-.9)).add(fo.scale(.35));
      } else {
        // Hände auf dem Rücken (Taille bis Schulterblatt), Ellbogen außen an der Flanke vorbei
        const lo = W(B(o, 'Spine')), hi = W(B(o, 'Spine2')), base = Vector3.Lerp(lo, hi, .15 + .55 * slide + (side === 'L' ? .12 : -.08));
        hand = base.subtract(fo.scale(.125)).add(ro.scale(.07 * sgn));
        pole = ro.scale(sgn).add(UP.scale(-.45)).add(fo.scale(.15));
      }
      ik2(sh, el, ha, hand, pole, w);
    }
  }
  if (kiss > 0) aim(head, B(a, 'MNose'), spot, (.5 - .15 * nk) * kiss);
  // Augen schließen: Lider sind nicht animiert, daher feste Grundstellung merken und absolut setzen
  let base = lids.get(a);
  if (!base) { base = ['LEyeBlinkTop', 'REyeBlinkTop'].map((e) => B(a, e)).filter((n): n is TransformNode => !!n).map((n) => [n, n.position.clone()] as const); lids.set(a, base); }
  for (const [n, p] of base) n.position.set(p.x, p.y - .006 * kiss, p.z);
}
const lids = new WeakMap<Actor, Array<readonly [TransformNode, Vector3]>>();

const ease = (t: number) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

interface Shot { t: number; d: number; from: Vector3; to: Vector3; look: Vector3; look2?: Vector3 }

/** Länge der Abblende nach der Szene (Sekunden): Stöhnen, Bett, Herzschlag (Audio.nightSounds) */
export const NIGHT_S = 6.5;
/** Grundtöne der beiden Stimmen für nightSounds: [du, Partner*in] */
export function pairVoices(s: { body: string; palette: string; skin: number; pronouns: string; flags: Record<string, unknown>; settings: { adult: boolean } }, pron: string): [number, number] {
  const me: number = avatarFor(playerLook(s)).g === 'f' ? 210 : 118, you: number = pron === 'sie' ? 225 : pron === 'they' ? 165 : 128;
  return [me, you === me ? you * 1.12 : you];
}
/** Figuren in Dienstkleidung (Helm, Weste, Gürtel sind eigene Teile): fürs Ausziehen eine zivile Figur gleichen Geschlechts */
const UNIFORM = new Set(['police', 'fire', 'security', 'medical', 'chef', 'delivery', 'business']);
export function civilFor(look: Look, name: string): Look | null {
  const av = avatarFor(look); if (!av.job || !UNIFORM.has(av.job)) return null;
  const h = [...name].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7), n = String(1 + h % 10).padStart(2, '0');
  const rb = (av.g === 'f' ? 'Female_Adult_' : 'Male_Adult_') + n;
  return { ...look, body: rb, rb, top: av.g === 'f', style: undefined };
}

/** 'love' = Kinoszene, 'tape' = Sextape mit dem Handy (beide einverstanden), 'set' = Dreh im Studio mit Regie */
export type LoveMode = 'love' | 'tape' | 'set';
export interface LoveOpts { mode?: LoveMode; /** Regie-Zeilen [Sekunde, Text] */ lines?: Array<[number, string]>; title?: string }

/** Szene spielen: Partner*in (look) kommt dazu; skip() bricht ab. Am Ende done() – danach blendet das Spiel ab. */
export async function loveScene(h: CineHost, look: Look, name: string, done: () => void, existing?: Actor, opts: LoveOpts = {}) {
  const sc = h.scene, me = h.player, pr = h.portrait(), mode = opts.mode || 'love';
  const first = existing || await Actor.create(sc, { ...look, outfit: 'clothed' });
  // Uniform kann man nicht umfärben: beim Ausziehen übernimmt eine zivile Figur (Helm ab, Weste weg)
  const civ = !existing && civilFor(look, name);
  const second = civ ? await Actor.create(sc, { ...civ, outfit: 'underwear' }) : null;
  second?.root.setEnabled(false);
  let partner = first;
  const myLook = { ...me.look };
  // Stellung vor dem Bett (Bett links hinten: x −4.4…−2, z −3.4…−1, Matratze 0,6 m hoch)
  const P0 = V(-3.45, 0, -.15), Q0 = V(-2.75, 0, -.15), P1 = V(-3.27, 0, -.15), Q1 = V(-2.93, 0, -.15);   // 34 cm: Brust an Brust
  const SP = V(-3.36, .12, -.95), SQ = V(-2.84, .12, -.95);
  const place = (a: Actor, p: Vector3, yaw: number) => { a.root.rotationQuaternion = null; a.root.position.copyFrom(p); a.root.rotation.set(0, yaw, 0); };
  place(me, P0, Math.PI / 2); place(first, Q0, -Math.PI / 2);
  if (second) place(second, Q1, -Math.PI / 2);
  me.play('talk', .3); first.play('idle', .3); second?.play('idle', 0);
  // Licht: Raum dämmern, Kerzen und ein violettes Streiflicht (beim Dreh: zwei Softboxen)
  const saved = sc.lights.map((l: Light) => [l, l.intensity] as const);
  for (const [l] of saved) l.intensity *= mode === 'set' ? .3 : .12;
  const env = sc.environmentIntensity; sc.environmentIntensity = env * (mode === 'set' ? .5 : .25);
  const candle = new PointLight('kerze', V(-1.45, .95, -2.9), sc); candle.diffuse = new Color3(1, .55, .25); candle.intensity = 6; candle.range = 7;
  const rim = new PointLight('rim', V(-2.2, 2.2, .9), sc); rim.diffuse = new Color3(.75, .35, 1); rim.intensity = 4; rim.range = 6;
  const props: Array<{ dispose(): void }> = [candle, rim];
  if (mode === 'set') props.push(...setProps(sc));
  // Decke für die Bettszene (weich gewellt, liegt über beiden bis zur Brust)
  const sheet = blanket(sc); sheet.setEnabled(false); props.push(sheet);
  music('lounge');
  // Breitbild-Balken und Untertitel; Sextape: Handy-Rahmen mit REC; Dreh: REC, Klappe und Regie-Zeilen
  const bars = document.createElement('div'); bars.className = 'cine' + (mode === 'tape' ? ' tape' : mode === 'set' ? ' set' : '');
  const title = (opts.title || `💜 ${name} und du`).replace(/</g, '');
  bars.innerHTML = `<i></i><i></i><p>${title}</p>${mode !== 'love' ? '<b class="rec">● REC <span>00:00</span></b>' : ''}${mode === 'set' ? '<em class="dir"></em><div class="slate">🎬 SZENE 1 · TAKE 1</div>' : ''}<button type="button">Überspringen ›</button>`;
  document.body.appendChild(bars);
  const recT = bars.querySelector('.rec span') as HTMLElement | null, dirEl = bars.querySelector('.dir') as HTMLElement | null;
  const far = pr ? 1.5 : 1;   // hochkant weiter weg, damit beide ins Bild passen
  const mid = V(-3.1, 1.45, -.15);
  const shots: Shot[] = [
    { t: 0, d: 4.2, from: V(.4, 1.75, 1.6 * far + .8), to: V(-.2, 1.65, 1.3 * far + .6), look: V(-3.1, 1.3, -.4) },
    { t: 4.2, d: 4.6, from: V(-3.0, 1.6, .95 + .6 * far), to: V(-3.05, 1.58, .7 + .5 * far), look: mid },
    { t: 8.8, d: 5.2, from: V(0, 0, 0), to: V(0, 0, 0), look: V(-3.1, 1.4, -.15) },     // Kreisfahrt um das Paar
    { t: 14, d: 3.6, from: V(-1.7, 1.45, .35 + .3 * far), to: V(-2.0, 1.4, .15 + .25 * far), look: V(-3.1, .9, -.95) },
    { t: 17.6, d: 5, from: V(-1.5, 1.8, -.85 + .3 * far), to: V(-1.85, 1.65, -1.2 + .2 * far), look: V(-3.12, .8, -2.4) },   // Bett: schräg von oben
    { t: 22.6, d: 2.6, from: V(-1.85, 1.65, -1.2 + .2 * far), to: V(-2.0, 1.85, -1.2 + .2 * far), look: V(-3.1, .75, -2.4), look2: V(-1.4, 1.6, -3.4) },
  ];
  const END = 25.2;
  let T = 0, fired = 0, ended = false, ew = 0, kw = 0, nk = 0, hold: Hold = 'waist', lying = false;
  const cue = (at: number, fn: () => void) => { if (T >= at && fired < at) fn(); };
  const blink = document.createElement('div'); blink.className = 'cineBlack';
  const [vMe, vYou] = [me.avatar.g === 'f' ? 215 : 120, (second || first).avatar.g === 'f' ? 230 : 130];
  const finish = () => {
    if (ended) return; ended = true;
    sc.onAfterAnimationsObservable.remove(obs); embrace(me, partner, 0, 0); embrace(partner, me, 0, 0);
    h.cine = null; bars.remove(); blink.remove();
    for (const [l, i] of saved) l.intensity = i; sc.environmentIntensity = env;
    props.forEach((p) => p.dispose());
    place(me, me.root.position, 0); me.root.position.y = 0;
    me.setLook({ outfit: myLook.outfit || 'clothed' }); me.play('idle');
    second?.dispose();
    if (!existing) first.dispose(); else { place(first, V(-2.4, 0, -.2), -Math.PI / 2); first.root.setEnabled(true); first.setLook({ outfit: 'clothed' }); first.play('idle'); }
    done();
  };
  (bars.querySelector('button') as HTMLButtonElement).onclick = finish;
  // Knochen-Posen nach der Animation, jedes Bild
  const obs = sc.onAfterAnimationsObservable.add(() => {
    if (ew <= 0 && kw <= 0 && nk <= 0) return;
    const slide = .5 + .5 * Math.sin(T * 1.3);
    if (hold === 'side' || lying) { embrace(me, partner, lying ? 0 : ew, kw, lying ? 'none' : 'side'); embrace(partner, me, 0, kw * .9, 'none'); return; }
    embrace(me, partner, ew, kw, 'waist', slide, nk); embrace(partner, me, ew, kw * .9, 'neck', slide, nk * .4);
  });
  const tmp = V(0, 0, 0);
  // Liegen: Körperachse zeigt zum Kopfteil (−z), Gesicht nach oben, leicht zueinander gedreht
  const lie = (a: Actor, x: number, roll: number) => {
    a.root.position.set(x, .66, -1.12);
    a.root.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 0, 1), roll).multiply(Quaternion.RotationAxis(new Vector3(1, 0, 0), -Math.PI / 2 + .13));   // Kopf leicht erhöht aufs Kissen
  };
  const dir = (t: string) => { if (!dirEl) return; dirEl.textContent = t; dirEl.classList.remove('on'); void dirEl.offsetWidth; dirEl.classList.add('on'); };
  h.cine = (dt: number) => {
    if (ended) return;
    const last = T; T += dt; fired = last;
    me.update(dt); if (!existing) { first.update(dt); second?.update(dt); }
    if (recT) { const sec = Math.floor(T); recT.textContent = `00:${String(sec).padStart(2, '0')}`; }
    for (const [at, t] of opts.lines || []) cue(at, () => dir(t));
    // Ablauf
    cue(.6, () => { if (mode === 'set') { sfx('slap'); bars.querySelector('.slate')?.classList.add('off'); } });
    cue(1.9, () => { first.play('laugh'); sfx('giggle'); });
    cue(3.4, () => { me.play('idle', .4); first.play('idle', .4); });
    cue(4.2, () => { me.play('dance2', .8, .22); first.play('dance2', .8, .2); });
    cue(5.9, () => sfx('kiss'));
    cue(7.2, () => breath(.6, .05));
    cue(8.8, () => { document.body.appendChild(blink); });
    cue(9.35, () => {
      me.setLook({ outfit: 'underwear' });
      if (second) { first.root.setEnabled(false); second.root.setEnabled(true); second.play('dance2', 0, .2); partner = second; } else partner.setLook({ outfit: 'underwear' });
    });
    cue(9.9, () => { blink.remove(); });
    cue(10.6, () => sfx('kiss'));
    cue(11.4, () => { moan(vYou, .7, .05, 'm'); });
    cue(12.4, () => { breath(.7, .06); sfx('kiss'); });
    cue(13.1, () => moan(vMe, .6, .05, 'm'));
    cue(14, () => { hold = 'side'; me.play('sit', .5); partner.play('sit', .5); place(me, SP, .55); place(partner, SQ, -.55); });
    cue(15, () => sfx('kiss'));
    cue(16.2, () => { sfx('sheets'); breath(.8, .06); });
    cue(17.1, () => { document.body.appendChild(blink); });
    cue(17.6, () => { lying = true; me.play('idle', 0, .5); partner.play('idle', 0, .5); lie(me, -3.42, -.55); lie(partner, -2.86, .55); sheet.setEnabled(true); blink.remove(); });
    cue(18.4, () => sfx('sheets'));
    cue(19.2, () => moan(vYou, .8, .07, 'a'));
    cue(20.3, () => { sfx('kiss'); breath(.7, .07); });
    cue(21.2, () => moan(vMe, .8, .07, 'o'));
    cue(22.2, () => sfx('heart'));
    // Annäherung und Posen
    const near = ease((T - 4.2) / 1.4);
    if (T < 14) { Vector3.LerpToRef(P0, P1, near, me.root.position); Vector3.LerpToRef(Q0, Q1, near, partner.root.position); }
    ew = T < 4.6 ? 0 : T < 14 ? ease((T - 4.6) / 1.3) : T < 17.6 ? ease((T - 14.2) / 1) : 0;
    kw = T < 5.4 ? 0 : T < 8.6 ? ease((T - 5.4) / .9) : T < 10.2 ? .35 : T < 11.2 ? ease((T - 10.2) / .6) : T < 12.6 ? 1 - ease((T - 11.2) / .4) : T < 14 ? ease((T - 12.6) / .5) : T < 15.6 ? ease((T - 14.4) / 1) : T < 17.6 ? 1 : T < 22.4 ? ease((T - 18) / 1) : 1 - ease((T - 22.4) / 1);
    nk = T >= 11.2 && T < 12.8 ? Math.min(ease((T - 11.2) / .5), 1 - ease((T - 12.4) / .4)) : 0;
    candle.intensity = 5.5 + Math.sin(T * 9) * .5 + Math.sin(T * 23) * .3;
    if (T > 22.6) { const f = ease((T - 22.6) / 2.4); candle.intensity *= 1 - f * .8; rim.intensity = 4 * (1 - f); }
    // Kamera (Sextape: leicht wackelnd aus der Hand)
    const s = shots.filter((x) => T >= x.t).pop()!, u = ease((T - s.t) / s.d);
    if (s.t === 8.8) {
      const a = .75 - u * 1.25, r = 1.25 * far;
      h.camera.position.set(-3.1 + Math.sin(a) * r, 1.5 + u * .1, -.15 + Math.cos(a) * r);
      h.camera.setTarget(s.look);
    } else {
      Vector3.LerpToRef(s.from, s.to, u, h.camera.position);
      if (s.look2) { Vector3.LerpToRef(s.look, s.look2, u, tmp); h.camera.setTarget(tmp); } else h.camera.setTarget(s.look);
    }
    if (mode === 'tape') { h.camera.position.x += Math.sin(T * 2.3) * .025; h.camera.position.y += Math.sin(T * 3.1) * .018; }
    if (T >= END) finish();
  };
  return finish;
}

/** Studio-Set: zwei Softboxen auf Stativen, Kamera, Tonangel – einfache Formen, nur für die Dauer der Szene */
function setProps(sc: Scene) {
  const out: Array<{ dispose(): void }> = [];
  const dark = new StandardMaterial('setdark', sc); dark.diffuseColor = new Color3(.08, .08, .1); dark.specularColor = new Color3(.2, .2, .2);
  const glow = new StandardMaterial('setglow', sc); glow.emissiveColor = new Color3(1, .97, .9); glow.disableLighting = true;
  for (const [x, z, ry] of [[-1.3, -.2, -.9], [-4.7, .6, .7]] as Array<[number, number, number]>) {
    const pole = CreateCylinder('stativ', { height: 1.9, diameter: .04 }, sc); pole.position.set(x, .95, z); pole.material = dark;
    const box = CreateBox('softbox', { width: .7, height: .5, depth: .25 }, sc); box.position.set(x, 1.95, z); box.rotation.y = ry; box.material = dark;
    const face = CreatePlane('softface', { width: .64, height: .44 }, sc); face.parent = box; face.position.z = -.13; face.rotation.y = Math.PI; face.material = glow;
    const l = new PointLight('soft', new Vector3(x, 1.9, z), sc); l.diffuse = new Color3(1, .95, .9); l.intensity = 5; l.range = 7;
    out.push(pole, box, face, l);
  }
  const cam = CreateBox('kamera', { width: .18, height: .16, depth: .3 }, sc); cam.position.set(-2.1, 1.45, 1.1); cam.rotation.y = -2.6; cam.material = dark;
  const lens = CreateCylinder('objektiv', { height: .14, diameter: .1 }, sc); lens.parent = cam; lens.rotation.x = Math.PI / 2; lens.position.z = -.2; lens.material = dark;
  const tri = CreateCylinder('kstativ', { height: 1.4, diameter: .035 }, sc); tri.position.set(-2.1, .7, 1.1); tri.material = dark;
  const boom = CreateCylinder('angel', { height: 2.2, diameter: .025 }, sc); boom.position.set(-3.1, 2.35, .4); boom.rotation.z = Math.PI / 2; boom.rotation.y = .3; boom.material = dark;
  out.push(cam, lens, tri, boom, dark, glow);
  return out;
}
/** Bettdecke als weich gewelltes Tuch über beiden (Kopf und Schultern bleiben frei) */
function blanket(sc: Scene) {
  const g = CreateGround('decke', { width: 1.75, height: 1.2, subdivisions: 18, updatable: true }, sc);
  const pos = g.getVerticesData('position')!;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], z = pos[i + 2];
    const bodies = Math.exp(-((x + .28) ** 2) / .03) + Math.exp(-((x - .28) ** 2) / .03);
    const edge = Math.max(0, Math.abs(x) - .62) * 2.2;
    pos[i + 1] = .09 * bodies + .03 * Math.sin(x * 9 + z * 5) + .015 * Math.sin(z * 13) - edge * edge * .9;
  }
  g.updateVerticesData('position', pos); g.createNormals(true);
  g.position.set(-3.14, .76, -1.58);
  const m = new StandardMaterial('deckeMat', sc); m.diffuseColor = new Color3(.82, .7, .95); m.specularColor = new Color3(.05, .05, .05); m.emissiveColor = new Color3(.1, .07, .13); m.backFaceCulling = false; m.twoSidedLighting = true;
  g.material = m;
  g.onDisposeObservable.addOnce(() => m.dispose());
  return g;
}

/** Morgen danach: Partner*in steht mit Kaffee in der Küche */
export async function morningAfter(sc: Scene, look: Look) {
  const a = await Actor.create(sc, { ...look, outfit: 'clothed' });
  a.root.position.set(1.2, 0, -.55); a.root.rotation.y = -Math.PI / 2 - .6; a.play('drink', 0);
  return a;
}
