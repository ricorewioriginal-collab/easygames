/* Liebesszene (nur mit „Inhalte ab 18“): gefilmt wie im Kino in der eigenen Wohnung.
   Annäherung, Umarmung, Kuss, Ausziehen bis zur Unterwäsche, zusammen aufs Bett – dann Schwenk zum Fenster und Abblende.
   Nichts Explizites: keine Nacktheit, kein Geschlechtsverkehr im Bild. Zustimmung und Kondom sind vorher geklärt (Game.runDate).
   Die Figuren sind Rocketbox-Menschen; Umarmen, Kuss und geschlossene Augen sind Knochen-Posen über der Animation. */
import { Quaternion, Vector3, Matrix, PointLight, Color3, TransformNode, type Scene, type FreeCamera, type Light } from '../engine/bjs';
import { Actor, type Look } from './Actor';
import { music, sfx } from '../engine/Audio';

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
/** Umarmen bzw. Arm um die Schulter (w 0..1), Kuss (k 0..1: vorbeugen, Kopf zum anderen, Augen zu) */
export function embrace(a: Actor, o: Actor, w: number, k: number, sitting = false) {
  const me = a.root.position, you = o.root.position;
  const f = you.subtract(me); f.y = 0; const dist = f.length() || 1; f.scaleInPlace(1 / dist);
  const head = B(a, 'Head'), oh = B(o, 'Head');
  const lip = W(oh).add(f.scale(-.06)); lip.y -= .04;
  // erst vorbeugen (Wirbelsäule, Hals), dann die Arme, zuletzt der Kopf – Schlüsselbeine hängen am Hals
  if (k > 0) {
    aim(B(a, 'Spine2'), B(a, 'Neck'), lip.add(new Vector3(0, -.25, 0)), .12 * k);
    aim(B(a, 'Neck'), head, lip.add(new Vector3(0, .12, 0)), .25 * k);
  }
  if (w > 0) {
    // feste Seiten: links/rechts aus den Schultern nur fürs Vorzeichen (Tanz-Animation verdreht den Oberkörper)
    const r = new Vector3(f.z, 0, -f.x), sgn = Vector3.Dot(W(B(a, 'L UpperArm')).subtract(W(B(a, 'R UpperArm'))), r) >= 0 ? 1 : -1;
    for (const side of ['L', 'R']) {
      const sh = B(a, `${side} UpperArm`), el = B(a, `${side} Forearm`), ha = B(a, `${side} Hand`); if (!sh || !el || !ha) continue;
      const sp = W(sh), lat = r.scale(side === 'L' ? sgn : -sgn);
      const other = W(B(a, side === 'L' ? 'R UpperArm' : 'L UpperArm')), inner = Vector3.DistanceSquared(sp, you) < Vector3.DistanceSquared(other, you);
      let elbow: Vector3, hand: Vector3;
      if (sitting) {
        // nebeneinander auf der Bettkante: innerer Arm hinter dem Rücken um die ferne Schulter
        if (!inner) continue;
        const ry = o.root.rotation.y, back = new Vector3(-Math.sin(ry), 0, -Math.cos(ry));
        elbow = you.subtract(f.scale(.12)).add(back.scale(.14)); elbow.y = sp.y - .04;
        hand = you.add(f.scale(.16)).add(back.scale(.02)); hand.y = sp.y - .03;
      } else {
        const low = side === 'L' ? .22 : .02;   // ein Arm tiefer (Taille), einer höher (Schulterblatt)
        elbow = you.add(lat.scale(.24)).subtract(f.scale(.02)); elbow.y = sp.y - .1 - low * .5;
        hand = you.add(f.scale(.14)).subtract(lat.scale(.04)); hand.y = sp.y - .14 - low;
      }
      aim(sh, el, elbow, w); aim(el, ha, hand, w);
    }
  }
  if (k > 0) aim(head, B(a, 'MNose'), lip, .7 * k);
  // Augen schließen: Lider sind nicht animiert, daher feste Grundstellung merken und absolut setzen
  let base = lids.get(a);
  if (!base) { base = ['LEyeBlinkTop', 'REyeBlinkTop'].map((e) => B(a, e)).filter((n): n is TransformNode => !!n).map((n) => [n, n.position.clone()] as const); lids.set(a, base); }
  for (const [n, p] of base) n.position.set(p.x, p.y - .006 * k, p.z);
}
const lids = new WeakMap<Actor, Array<readonly [TransformNode, Vector3]>>();

const ease = (t: number) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

interface Shot { t: number; d: number; from: Vector3; to: Vector3; look: Vector3; look2?: Vector3 }

/** Szene spielen: Partner*in (look) kommt dazu; skip() bricht ab. Am Ende done() – danach blendet das Spiel ab. */
export async function loveScene(h: CineHost, look: Look, name: string, done: () => void, existing?: Actor) {
  const sc = h.scene, me = h.player, pr = h.portrait();
  const partner = existing || await Actor.create(sc, { ...look, outfit: 'clothed' });
  const myLook = { ...me.look };
  // Stellung vor dem Bett (Bett links hinten: x −4.4…−2, z −3.4…−1)
  const P0 = V(-3.45, 0, -.15), Q0 = V(-2.75, 0, -.15), P1 = V(-3.24, 0, -.15), Q1 = V(-2.96, 0, -.15);
  const SP = V(-3.36, .12, -.95), SQ = V(-2.84, .12, -.95);
  me.root.position.copyFrom(P0); me.root.rotation.y = Math.PI / 2;
  partner.root.position.copyFrom(Q0); partner.root.rotation.y = -Math.PI / 2;
  me.play('talk', .3); partner.play('idle', .3);
  // Licht: Raum dämmern, Kerzen und ein violettes Streiflicht
  const saved = sc.lights.map((l: Light) => [l, l.intensity] as const);
  for (const [l] of saved) l.intensity *= .12;
  const env = sc.environmentIntensity; sc.environmentIntensity = env * .25;
  const candle = new PointLight('kerze', V(-1.45, .95, -2.9), sc); candle.diffuse = new Color3(1, .55, .25); candle.intensity = 6; candle.range = 7;
  const rim = new PointLight('rim', V(-2.2, 2.2, .9), sc); rim.diffuse = new Color3(.75, .35, 1); rim.intensity = 4; rim.range = 6;
  music('lounge');
  // Breitbild-Balken und Untertitel
  const bars = document.createElement('div'); bars.className = 'cine';
  bars.innerHTML = `<i></i><i></i><p>💜 ${name.replace(/</g, '')} und du</p><button type="button">Überspringen ›</button>`;
  document.body.appendChild(bars);
  const far = pr ? 1.5 : 1;   // hochkant weiter weg, damit beide ins Bild passen
  const mid = V(-3.1, 1.45, -.15);
  const shots: Shot[] = [
    { t: 0, d: 4.2, from: V(.4, 1.75, 1.6 * far + .8), to: V(-.2, 1.65, 1.3 * far + .6), look: V(-3.1, 1.3, -.4) },
    { t: 4.2, d: 4.6, from: V(-3.0, 1.6, .95 + .6 * far), to: V(-3.05, 1.58, .7 + .5 * far), look: mid },
    { t: 8.8, d: 4.6, from: V(0, 0, 0), to: V(0, 0, 0), look: V(-3.1, 1.35, -.15) },     // Kreisfahrt um das Paar
    { t: 13.4, d: 3.4, from: V(-1.7, 1.45, .35 + .3 * far), to: V(-2.0, 1.4, .15 + .25 * far), look: V(-3.1, .9, -.95) },
    { t: 16.8, d: 2.6, from: V(-2.0, 1.4, .15 + .25 * far), to: V(-2.3, 1.55, .05 + .2 * far), look: V(-3.1, .95, -1.0), look2: V(-3.1, 1.95, -3.4) },
  ];
  const END = 19.4;
  let T = 0, fired = 0, ended = false, ew = 0, kw = 0;
  const cue = (at: number, fn: () => void) => { if (T >= at && fired < at) fn(); };
  const blink = document.createElement('div'); blink.className = 'cineBlack';
  const finish = () => {
    if (ended) return; ended = true;
    sc.onAfterAnimationsObservable.remove(obs); embrace(me, partner, 0, 0); embrace(partner, me, 0, 0);
    h.cine = null; bars.remove(); blink.remove();
    for (const [l, i] of saved) l.intensity = i; sc.environmentIntensity = env;
    candle.dispose(); rim.dispose();
    me.setLook({ outfit: myLook.outfit || 'clothed' }); me.play('idle');
    if (!existing) partner.dispose(); else { partner.setLook({ outfit: 'clothed' }); partner.play('idle'); }
    done();
  };
  (bars.querySelector('button') as HTMLButtonElement).onclick = finish;
  // Knochen-Posen nach der Animation, jedes Bild
  const obs = sc.onAfterAnimationsObservable.add(() => { if (ew > 0 || kw > 0) { const sit = T >= 13.4; embrace(me, partner, ew, kw, sit); embrace(partner, me, sit ? 0 : ew, kw * .9, sit); } });
  const tmp = V(0, 0, 0);
  h.cine = (dt: number) => {
    if (ended) return;
    const last = T; T += dt; fired = last;
    me.update(dt); if (!existing) partner.update(dt);
    // Ablauf
    cue(1.9, () => { partner.play('laugh'); sfx('giggle'); });
    cue(3.4, () => { me.play('idle', .4); partner.play('idle', .4); });
    cue(4.2, () => { me.play('dance2', .8, .28); partner.play('dance2', .8, .26); });
    cue(5.9, () => sfx('kiss'));
    cue(8.8, () => { document.body.appendChild(blink); });
    cue(9.35, () => { me.setLook({ outfit: 'underwear' }); partner.setLook({ outfit: 'underwear' }); });
    cue(9.9, () => { blink.remove(); });
    cue(10.8, () => sfx('kiss'));
    cue(13.4, () => { me.play('sit', .5); partner.play('sit', .5); me.root.position.copyFrom(SP); partner.root.position.copyFrom(SQ); me.root.rotation.y = .55; partner.root.rotation.y = -.55; });
    cue(14.6, () => sfx('kiss'));
    cue(15.8, () => sfx('sheets'));
    cue(17.6, () => sfx('heart'));
    // Annäherung und Posen
    const near = ease((T - 4.2) / 1.4);
    if (T < 13.4) { Vector3.LerpToRef(P0, P1, near, me.root.position); Vector3.LerpToRef(Q0, Q1, near, partner.root.position); }
    ew = T < 4.6 ? 0 : T < 13.4 ? ease((T - 4.6) / 1.3) : ease((T - 13.6) / 1);
    kw = T < 5.4 ? 0 : T < 8.6 ? ease((T - 5.4) / .9) : T < 10.2 ? .35 : T < 13.2 ? ease((T - 10.2) / .8) : T < 15 ? ease((T - 13.8) / 1) : 1;
    candle.intensity = 5.5 + Math.sin(T * 9) * .5 + Math.sin(T * 23) * .3;
    if (T > 17) { const f = ease((T - 17) / 2); candle.intensity *= 1 - f * .8; rim.intensity = 4 * (1 - f); }
    // Kamera
    const s = shots.filter((x) => T >= x.t).pop()!, u = ease((T - s.t) / s.d);
    if (s.t === 8.8) {
      const a = .75 - u * 1.25, r = 1.35 * far;
      h.camera.position.set(-3.1 + Math.sin(a) * r, 1.5 + u * .1, -.15 + Math.cos(a) * r);
      h.camera.setTarget(s.look);
    } else {
      Vector3.LerpToRef(s.from, s.to, u, h.camera.position);
      if (s.look2) { Vector3.LerpToRef(s.look, s.look2, u, tmp); h.camera.setTarget(tmp); } else h.camera.setTarget(s.look);
    }
    if (T >= END) finish();
  };
  return finish;
}

/** Morgen danach: Partner*in steht mit Kaffee in der Küche */
export async function morningAfter(sc: Scene, look: Look) {
  const a = await Actor.create(sc, { ...look, outfit: 'clothed' });
  a.root.position.set(1.2, 0, -.55); a.root.rotation.y = -Math.PI / 2 - .6; a.play('drink', 0);
  return a;
}
