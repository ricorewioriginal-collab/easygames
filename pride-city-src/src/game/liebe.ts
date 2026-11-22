/* Liebesszene (nur mit „Inhalte ab 18“): gefilmt wie im Kino in der eigenen Wohnung.
   Annäherung, Umarmung, Kuss, Ausziehen bis zur Unterwäsche, zusammen unter die Decke – dann Schwenk zum Fenster und Abblende.
   Nichts Explizites: keine Nacktheit, kein Geschlechtsverkehr im Bild. Zustimmung und Kondom sind vorher geklärt (Game.runDate).
   Die Figuren sind Rocketbox-Menschen; Umarmen, Kuss und geschlossene Augen sind Knochen-Posen über der Animation. */
import { Quaternion, Vector3, Matrix, PointLight, Color3, TransformNode, CreateGround, VertexData, type Scene, type FreeCamera, type Light } from '../engine/bjs';
import { pbr } from '../engine/geo';
import { Actor, type Look } from './Actor';
import { avatarFor } from './avatars';
import { music, sfx } from '../engine/Audio';

export interface CineHost { scene: Scene; camera: FreeCamera; player: Actor; cine: ((dt: number) => void) | null; portrait(): boolean; bedB?: { x0: number; x1: number; z0: number; z1: number; top: number } }

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
/** Wie umarmt wird: Arme um die Taille, Arme um den Nacken, oder im Liegen der obere Arm über die Seite auf den Rücken */
export type Hold = 'waist' | 'neck' | 'lie';
/** Umarmen (w 0..1) und Kuss (k 0..1: vorbeugen, Kopf zum anderen, Augen zu). t = Zeit für langsames Streicheln.
    Die Ziele liegen außerhalb des anderen Körpers: Ellbogen seitlich neben den Rippen, Hand flach auf dem Rücken.
    Vorher lag die Hand 11 cm hinter der Wirbelsäule, also noch im Körper, und der Unterarm lief quer durch den Rücken. */
export function embrace(a: Actor, o: Actor, w: number, k: number, hold: Hold = 'waist', t = 0) {
  const me = a.root.position, you = o.root.position;
  const f = you.subtract(me); f.y = 0; const dist = f.length() || 1; f.scaleInPlace(1 / dist);
  const head = B(a, 'Head'), oh = B(o, 'Head');
  // Kuss-Punkt in der Mitte zwischen beiden Köpfen: so treffen sich die Lippen, statt dass ein Kopf in den anderen taucht
  const lip = Vector3.Center(W(head), W(oh)); lip.y -= .03;
  // erst vorbeugen (Wirbelsäule, Hals), dann die Arme, zuletzt der Kopf – Schlüsselbeine hängen am Hals
  if (k > 0) {
    aim(B(a, 'Spine2'), B(a, 'Neck'), lip.add(new Vector3(0, -.25, 0)), (hold === 'lie' ? .05 : .08) * k);
    aim(B(a, 'Neck'), head, lip.add(new Vector3(0, .12, 0)), .2 * k);
  }
  if (w > 0) {
    // feste Seiten: links/rechts aus den Schultern nur fürs Vorzeichen (Animation verdreht den Oberkörper)
    const r = new Vector3(f.z, 0, -f.x), sgn = Vector3.Dot(W(B(a, 'L UpperArm')).subtract(W(B(a, 'R UpperArm'))), r) >= 0 ? 1 : -1;
    // Rückenfläche: angezogen etwas weiter von der Wirbelsäule weg als auf nackter Haut
    const back = o.look.outfit === 'clothed' ? .2 : .165;
    for (const side of ['L', 'R']) {
      const sh = B(a, `${side} UpperArm`), el = B(a, `${side} Forearm`), ha = B(a, `${side} Hand`); if (!sh || !el || !ha) continue;
      const sp = W(sh), lat = r.scale(side === 'L' ? sgn : -sgn), stroke = Math.sin(t * 1.3 + (side === 'L' ? 0 : 1.9));
      let elbow: Vector3, hand: Vector3;
      if (hold === 'lie') {
        // auf der Seite liegend: nur der obere Arm, über die Flanke, Hand streicht langsam den Rücken entlang
        if (sp.y < W(B(a, side === 'L' ? 'R UpperArm' : 'L UpperArm')).y) continue;
        const c = W(B(o, 'Spine2') || B(o, 'Spine')), axis = W(B(o, 'Neck')).subtract(W(B(o, 'Pelvis'))).normalize();
        elbow = c.add(new Vector3(0, .21, 0)).subtract(f.scale(.03)).add(axis.scale(-.06));
        hand = c.add(f.scale(back - .01)).add(new Vector3(0, .05, 0)).add(axis.scale(stroke * .07 - .04));
      } else if (hold === 'neck') {
        // Arme um den Nacken: Ellbogen auf Schulterhöhe neben dem Hals, Hände im Nacken
        const c = W(B(o, 'Neck'));
        elbow = c.add(lat.scale(.25)).subtract(f.scale(.03)); elbow.y = c.y - .06;
        hand = c.add(f.scale(.1)).add(lat.scale(.035)); hand.y = c.y - .03 + stroke * .015;
      } else {
        // Arme um die Taille bzw. ans Schulterblatt
        const tgt = W(B(o, side === 'L' ? 'Spine1' : 'Spine2') || B(o, 'Spine'));
        elbow = tgt.add(lat.scale(.25)).subtract(f.scale(.02)); elbow.y = Math.min(elbow.y, sp.y - .1);
        hand = tgt.add(f.scale(back)).add(lat.scale(.03)); hand.y += stroke * .04;
      }
      aim(sh, el, elbow, w); aim(el, ha, hand, w);
    }
  }
  if (k > 0) aim(head, B(a, 'MNose'), lip, .5 * k);
  // Augen schließen: Lider sind nicht animiert, daher feste Grundstellung merken und absolut setzen
  let base = lids.get(a);
  if (!base) { base = ['LEyeBlinkTop', 'REyeBlinkTop'].map((e) => B(a, e)).filter((n): n is TransformNode => !!n).map((n) => [n, n.position.clone()] as const); lids.set(a, base); }
  for (const [n, p] of base) n.position.set(p.x, p.y - .006 * k, p.z);
}
const lids = new WeakMap<Actor, Array<readonly [TransformNode, Vector3]>>();

const ease = (t: number) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** Einsatzfiguren ohne Gesicht (SWAT-Polizistin mit Sturmhaube): nach Feierabend als Mensch mit Gesicht weiterspielen */
const OFF_DUTY: Record<string, string> = { Police_Female_01: 'Female_Adult_07' };
export const offDuty = (look: Look): Look | null => { const id = OFF_DUTY[avatarFor(look).id]; return id ? { ...look, rb: id, body: id, outfit: 'clothed', style: undefined } : null; };

/** Kamera: von/bis um einen Blickpunkt (hochkant weiter weg), oder eine eigene Fahrt */
interface Shot { t: number; d: number; from: Vector3; to: Vector3; look: Vector3; look2?: Vector3; orbit?: { c: Vector3; r: number; a0: number; a1: number; y: number } }

/** Szene spielen: Partner*in (look) kommt dazu; skip() bricht ab. Am Ende done() – danach blendet das Spiel ab.
    Ablauf (etwa 25 s): Ankommen (Uniform fliegt in die Ecke), Umarmung und Kuss beim langsamen Tanz, Ausziehen bis zur
    Unterwäsche, langer Kuss in Zeitlupe, zusammen unter der Decke im Bett, Schwenk zum Fenster, Abblende. Nur 18+,
    keine Nacktheit, kein Sex im Bild. Geflüsterte Sätze als Untertitel. */
export async function loveScene(h: CineHost, look: Look, name: string, done: () => void, existing?: Actor) {
  const sc = h.scene, me = h.player, pr = h.portrait();
  const off = offDuty(look);
  const uniform = existing || await Actor.create(sc, { ...look, outfit: 'clothed', style: undefined });
  const civil = off ? await Actor.create(sc, off) : null;
  // aktiv lassen (eine ausgeschaltete neue Figur bekam ihr Kopf-Skelett nie aktualisiert), nur weit unter den Boden stellen
  if (civil) civil.root.position.set(0, -60, 0);
  let partner = uniform;
  // Nahaufnahmen: Manche Rocketbox-Köpfe haben einen falschen Begrenzungsrahmen (liegt am Boden) und würden dicht vor der
  // Kamera weggeschnitten. Für die Dauer der Szene immer zeichnen (nur zwei, drei Figuren).
  const always = [me, uniform, civil].flatMap((a) => a ? a.model.getChildMeshes() : []).filter((m) => !m.alwaysSelectAsActiveMesh);
  always.forEach((m) => { m.alwaysSelectAsActiveMesh = true; });
  const myLook = { ...me.look };
  // Szene-Look (Drag, Glitzer, Flaggen-Shirt) würde über die Unterwäsche gemalt: für die Szene weglassen
  const myStyle = me.look.style; if (myStyle) me.setLook({ style: undefined });
  const bed = h.bedB || { x0: -4.4, x1: -2, z0: -3.4, z1: -1, top: .6 };
  const bx = (bed.x0 + bed.x1) / 2;
  // Stellung vor dem Bett; 30 cm zwischen den Füßen: Brust an Brust, Arme reichen um den Körper
  const C0 = V(bx, 0, -.15), P0 = C0.add(V(-.36, 0, 0)), Q0 = C0.add(V(.36, 0, 0));
  me.root.position.copyFrom(P0); me.root.rotation.y = Math.PI / 2;
  partner.root.position.copyFrom(Q0); partner.root.rotation.y = -Math.PI / 2;
  me.play('talk', .3); partner.play('idle', .3);
  // im Bett (Kopfende an der linken Wand): auf der Seite, einander zugewandt, die Decke bis zur Taille
  const mat = bed.top * .62, bz = (bed.z0 + bed.z1) / 2, footX = bed.x0 + 2.12;
  const LA = V(footX, mat + .19, bz - .17), LB = V(footX, mat + .19, bz + .17);
  const lieQ = (yaw: number) => Quaternion.RotationAxis(Vector3.Forward(), Math.PI / 2).multiply(Quaternion.RotationAxis(Vector3.Up(), yaw));
  // Bettdecke: gewölbte Fläche mit weichen Falten, bis zur Taille, Ränder fallen über die Matratze
  const duvet = CreateGround('decke', { width: 1.3, height: 1.04, subdivisionsX: 26, subdivisionsY: 18, updatable: true }, sc);
  { const pos = duvet.getVerticesData('position')!, nrm: number[] = [];
    for (let i = 0; i < pos.length; i += 3) {
      // über beiden Körpern (je 40 cm hoch auf der Seite liegend) gewölbt, zur Taille hin flacher auslaufend
      const x = pos[i] / .65, z = pos[i + 2] / .52, dome = Math.cos(Math.min(1, Math.abs(z)) * Math.PI / 2), end = Math.cos(Math.min(1, Math.max(0, -x - .7) / .3) * Math.PI / 2);
      pos[i + 1] = (.47 * Math.pow(dome, .38) + .018 * Math.sin(x * 9 + z * 5) * dome) * (.55 + .45 * end) - .06;
    }
    duvet.setVerticesData('position', pos); VertexData.ComputeNormals(pos, duvet.getIndices()!, nrm); duvet.setVerticesData('normal', nrm); }
  duvet.material = pbr(sc, 0x6a2c7a, .6, 0, { double: true });
  duvet.position.set(bed.x0 + 1.68, mat, bz);
  duvet.setEnabled(false);
  // Licht: Raum dämmern, Kerzen und ein violettes Streiflicht
  const saved = sc.lights.map((l: Light) => [l, l.intensity] as const);
  for (const [l] of saved) l.intensity *= .12;
  const env = sc.environmentIntensity; sc.environmentIntensity = env * .25;
  const candle = new PointLight('kerze', V(bed.x1 + .7, .95, bed.z0 + .5), sc); candle.diffuse = new Color3(1, .55, .25); candle.intensity = 6; candle.range = 7;
  const rim = new PointLight('rim', V(bx + 1, 2.2, .9), sc); rim.diffuse = new Color3(.75, .35, 1); rim.intensity = 4; rim.range = 6;
  music('lounge');
  // Breitbild-Balken, Untertitel und geflüsterte Sätze
  const bars = document.createElement('div'); bars.className = 'cine';
  bars.innerHTML = `<i></i><i></i><em></em><p>💜 ${name.replace(/</g, '')} und du</p><button type="button">Überspringen ›</button>`;
  document.body.appendChild(bars);
  const em = bars.querySelector('em') as HTMLElement;
  const say = (text: string) => { em.textContent = text; em.classList.add('on'); setTimeout(() => { if (em.textContent === text) em.classList.remove('on'); }, 2300); };
  const far = pr ? 1.55 : 1;   // hochkant weiter weg, damit beide ins Bild passen
  const S = (t: number, d: number, look: Vector3, from: Vector3, to: Vector3, look2?: Vector3): Shot => ({ t, d, look, look2, from: look.add(from.scale(far)), to: look.add(to.scale(far)) });
  const pair = V(bx, 1.45, -.15), heads = V(bed.x0 + .48, mat + .36, bz);
  const shots: Shot[] = [
    S(0, 4.2, V(bx, 1.3, -.4), V(3.5, .45, 2.4), V(2.9, .35, 1.9)),
    S(4.2, 4.6, pair, V(.1, .15, 1.15), V(.05, .1, .85)),
    { t: 8.8, d: 1.6, from: V(0, 0, 0), to: V(0, 0, 0), look: V(bx, 1.35, -.15), orbit: { c: V(bx, 1.5, -.15), r: 1.35 * far, a0: .75, a1: -.5, y: .1 } },
    S(10.4, 3.4, V(bx, 1.55, -.15), V(.45, .02, .75), V(.3, -.02, .5)),          // nah an den Gesichtern, Zeitlupe
    S(13.8, .6, V(bx, 1.4, -.15), V(.3, -.02, .5), V(.3, -.02, .5)),
    S(14.4, 3.6, heads, V(.55, .5, 1.25), V(.4, .38, .95)),                      // im Bett, über die Schulter
    { t: 18, d: 3.2, from: V(0, 0, 0), to: V(0, 0, 0), look: heads, orbit: { c: heads.add(V(.2, 0, 0)), r: .8 * far, a0: .5, a1: 2.0, y: 1.3 } },  // von oben
    S(21.2, 3.4, heads, V(1.3, .8, 1.15), V(1.0, 1.2, .95), V(bed.x0 + 1.1, 1.95, bed.z0 + .05)),  // Schwenk zum Fenster
  ];
  const END = 24.6;
  let T = 0, fired = 0, ended = false, ew = 0, kw = 0, hold: Hold = 'waist', lying = false;
  const cue = (at: number, fn: () => void) => { if (T >= at && fired < at) fn(); };
  const black = () => { const b = document.createElement('div'); b.className = 'cineBlack'; document.body.appendChild(b); setTimeout(() => b.remove(), 1150); blinks.push(b); };
  const blinks: HTMLElement[] = [];
  const stand = (a: Actor) => { a.root.rotationQuaternion = null; };
  const finish = () => {
    if (ended) return; ended = true;
    sc.onAfterAnimationsObservable.remove(obs); embrace(me, partner, 0, 0); embrace(partner, me, 0, 0);
    h.cine = null; bars.remove(); blinks.forEach((b) => b.remove());
    for (const [l, i] of saved) l.intensity = i; sc.environmentIntensity = env;
    candle.dispose(); rim.dispose(); duvet.dispose();
    always.forEach((m) => { if (!m.isDisposed()) m.alwaysSelectAsActiveMesh = false; });
    stand(me); stand(partner); me.model.rotation.set(0, 0, 0);
    me.setLook({ outfit: myLook.outfit || 'clothed', style: myStyle }); me.play('idle');
    civil?.dispose();
    if (!existing) uniform.dispose(); else { stand(uniform); uniform.root.setEnabled(true); uniform.setLook({ outfit: 'clothed' }); uniform.play('idle'); }
    done();
  };
  (bars.querySelector('button') as HTMLButtonElement).onclick = finish;
  // Knochen-Posen nach der Animation, jedes Bild; die Person mit den Armen um den Nacken ist die kleinere
  const neckIsPartner = () => W(B(partner, 'Head')).y <= W(B(me, 'Head')).y + .02;
  const obs = sc.onAfterAnimationsObservable.add(() => {
    if (ew <= 0 && kw <= 0) return;
    if (lying) { embrace(me, partner, ew, kw, 'lie', T); embrace(partner, me, ew, kw * .9, 'lie', T + 1.1); return; }
    const np = neckIsPartner();
    embrace(me, partner, ew, kw, np ? hold : 'neck', T); embrace(partner, me, ew, kw * .9, np ? 'neck' : hold, T + 1.1);
  });
  const tmp = V(0, 0, 0);
  h.cine = (dt: number) => {
    if (ended) return;
    const last = T; T += dt; fired = last;
    me.update(dt); if (!existing || partner !== uniform) partner.update(dt);
    // Ablauf
    cue(1.9, () => { partner.play('laugh'); sfx('giggle'); });
    cue(3.0, () => { if (civil) { black(); say(`${name.replace(/<[^>]*>/g, '')}: „Endlich Feierabend.“ Helm, Weste und Holster landen in der Ecke.`); } });
    cue(3.4, () => {
      me.play('idle', .4);
      if (civil) { uniform.root.setEnabled(false); civil.root.position.copyFrom(partner.root.position); civil.root.rotation.y = partner.root.rotation.y; partner = civil; }
      partner.play('idle', .4);
    });
    cue(4.6, () => say('„Komm her …“'));
    cue(5.9, () => sfx('kiss'));
    cue(7.4, () => sfx('kiss'));
    cue(8.8, () => black());
    cue(9.35, () => { me.setLook({ outfit: 'underwear' }); partner.setLook({ outfit: 'underwear', style: undefined }); sfx('sheets'); });
    cue(10.6, () => { sfx('kiss'); me.play('idle', .6, .45); partner.play('idle', .6, .45); });
    cue(11.4, () => say('„Du hast mir so gefehlt.“'));
    cue(12.2, () => sfx('heart'));
    cue(12.9, () => sfx('kiss'));
    cue(13.8, () => black());
    cue(14.3, () => {
      // zusammen ins Bett, unter die Decke
      lying = true; duvet.setEnabled(true);
      me.root.position.copyFrom(LA); partner.root.position.copyFrom(LB);
      me.root.rotationQuaternion = lieQ(0); partner.root.rotationQuaternion = lieQ(Math.PI);
      me.play('idle', 0, .4); partner.play('idle', 0, .4); sfx('sheets');
    });
    cue(15.4, () => sfx('kiss'));
    cue(16.6, () => say('„Bleib heute Nacht.“'));
    cue(17.6, () => sfx('sheets'));
    cue(18.6, () => sfx('kiss'));
    cue(19.8, () => sfx('heart'));
    cue(21.6, () => say('„Für immer, wenn du willst.“'));
    cue(22.4, () => sfx('heart'));
    // Annäherung und langsames Wiegen als Paar (beide drehen um die gemeinsame Mitte)
    if (!lying) {
      const near = ease((T - 3.6) / 1.6), d = .36 - near * .21, sway = T > 4.2 ? Math.sin((T - 4.2) * .85) * .16 * ease((T - 4.2) / 1.5) : 0;
      me.root.position.set(C0.x - Math.cos(sway) * d, 0, C0.z + Math.sin(sway) * d);
      partner.root.position.set(C0.x + Math.cos(sway) * d, 0, C0.z - Math.sin(sway) * d);
      me.root.rotation.y = Math.PI / 2 + sway; partner.root.rotation.y = -Math.PI / 2 + sway;
    }
    hold = 'waist';
    ew = T < 4.4 ? 0 : T < 14.3 ? ease((T - 4.4) / 1.4) : ease((T - 14.6) / 1.2);
    kw = T < 5.4 ? 0 : T < 8.6 ? ease((T - 5.4) / .9) : T < 10.2 ? .4 : T < 13.6 ? ease((T - 10.2) / .7) : T < 14.3 ? .4 : T < 15 ? .2 : ease((T - 15) / 1);
    candle.intensity = 5.5 + Math.sin(T * 9) * .5 + Math.sin(T * 23) * .3;
    if (T > 21) { const f = ease((T - 21) / 3.2); candle.intensity *= 1 - f * .85; rim.intensity = 4 * (1 - f); }
    // Kamera
    const s = shots.filter((x) => T >= x.t).pop()!, u = ease((T - s.t) / s.d);
    if (s.orbit) {
      const o = s.orbit, a = o.a0 + (o.a1 - o.a0) * u;
      h.camera.position.set(o.c.x + Math.sin(a) * o.r, o.c.y + o.y + u * .08, o.c.z + Math.cos(a) * o.r);
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
