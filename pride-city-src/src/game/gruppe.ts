/* Gruppenszene (nur mit „Inhalte ab 18“): Afterparty zu viert in der eigenen Wohnung, gefilmt wie die Liebesszene
   (liebe.ts). Zwei Paare kommen sich näher, Küsse, Ausziehen bis zur Unterwäsche, Partnertausch, alle zusammen aufs Bett
   unter eine große Decke – dann Schwenk zum Fenster und Abblende. Nichts Explizites: keine Nacktheit, kein Sex im Bild.
   Zustimmung aller und Kondome bzw. die Absprache ohne sind vorher geklärt (flirtui.ts). */
import { Quaternion, Vector3, PointLight, Color3, type Light } from '../engine/bjs';
import { Actor, type Look } from './Actor';
import { music, sfx, moan as moanAt, breath as breathAt, now } from '../engine/Audio';
import { embrace, unpose, civilFor, blanket, type CineHost, type Hold } from './liebe';

const moan = (f: number, d: number, g: number, v: 'a' | 'o' | 'm') => moanAt(now() + .02, f, d, g, v);
const breath = (d: number, g: number) => breathAt(now() + .02, d, g);
const ease = (t: number) => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
interface Shot { t: number; d: number; from: Vector3; to: Vector3; look: Vector3; look2?: Vector3; orbit?: boolean }

export interface GroupGuest { look: Look; name: string }
/** Länge der Gruppenszene in Sekunden */
export const GROUP_END = 26;

/** Szene spielen: drei Gäste und du; skip() bricht ab. Am Ende done() – danach blendet das Spiel ab. */
export async function groupScene(h: CineHost, guests: GroupGuest[], done: () => void, title?: string) {
  const sc = h.scene, me = h.player, pr = h.portrait();
  // Uniformen gleich gegen zivile Figuren tauschen (Helm, Weste, Gürtel lassen sich nicht ausziehen)
  const looks = guests.slice(0, 3).map((g) => ({ ...(civilFor(g.look, g.name) || g.look), outfit: 'clothed' as const, style: undefined }));
  const [A, Bq, C] = await Promise.all(looks.map((l) => Actor.create(sc, l)));
  const all = [me, A, Bq, C];
  const cast = all.flatMap((a) => a.root.getChildMeshes());
  const sel = cast.map((m) => m.alwaysSelectAsActiveMesh);
  cast.forEach((m) => { m.alwaysSelectAsActiveMesh = true; });
  const myLook = { ...me.look };
  // zwei Paare nebeneinander vor dem Bett (Bett links hinten: x −4.4…−2, z −3.4…−1)
  const place = (a: Actor, p: Vector3, yaw: number) => { a.root.rotationQuaternion = null; a.root.position.copyFrom(p); a.root.rotation.set(0, yaw, 0); };
  const L0 = [V(-3.85, 0, -.15), V(-3.1, 0, -.15), V(-2.45, 0, .15), V(-1.7, 0, .15)], L1 = [V(-3.65, 0, -.15), V(-3.31, 0, -.15), V(-2.25, 0, .15), V(-1.91, 0, .15)];
  const yaws = [Math.PI / 2, -Math.PI / 2, Math.PI / 2, -Math.PI / 2];
  // Reihenfolge der Stellplätze: [du, A, B, C]; nach dem Tausch steht C bei dir und A bei B
  let slot = [0, 1, 2, 3];
  all.forEach((a, i) => place(a, L0[slot[i]], yaws[slot[i]]));
  me.play('talk', .3); A.play('laugh', .3); Bq.play('talk', .3); C.play('drink', .3);
  // Licht: gedämmt, Kerzen, violettes und pinkes Streiflicht
  const saved = sc.lights.map((l: Light) => [l, l.intensity] as const);
  for (const [l] of saved) l.intensity *= .14;
  const env = sc.environmentIntensity; sc.environmentIntensity = env * .25;
  const candle = new PointLight('kerze', V(-1.45, .95, -2.9), sc); candle.diffuse = new Color3(1, .55, .25); candle.intensity = 6; candle.range = 7;
  const rim = new PointLight('rim', V(-2.4, 2.2, 1.1), sc); rim.diffuse = new Color3(.75, .35, 1); rim.intensity = 4.5; rim.range = 6.5;
  const pink = new PointLight('rim2', V(-4.2, 2.1, .8), sc); pink.diffuse = new Color3(1, .3, .65); pink.intensity = 3; pink.range = 5;
  const bedX = [-4.1, -3.55, -2.85, -2.3], cx = -3.2;
  const sheet = blanket(sc, 2.5, bedX.map((x) => x - cx), cx); sheet.setEnabled(false);
  const props: Array<{ dispose(): void }> = [candle, rim, pink, sheet];
  music('lounge');
  const bars = document.createElement('div'); bars.className = 'cine';
  bars.innerHTML = `<i></i><i></i><p>${(title || `🔥 ${guests.slice(0, 3).map((g) => g.name).join(', ')} und du`).replace(/</g, '')}</p><button type="button">Überspringen ›</button>`;
  document.body.appendChild(bars);
  const far = pr ? 1.45 : 1;
  const shots: Shot[] = [
    { t: 0, d: 4.2, from: V(-2.78, 1.75, 2.2 + .9 * far), to: V(-2.78, 1.65, 1.9 + .8 * far), look: V(-2.78, 1.3, 0) },
    { t: 4.2, d: 4.6, from: V(-3.5, 1.6, .95 + .55 * far), to: V(-3.45, 1.58, .75 + .45 * far), look: V(-3.48, 1.45, -.15) },   // nah: du und A
    { t: 8.8, d: 4.6, from: V(0, 0, 0), to: V(0, 0, 0), look: V(-2.78, 1.35, 0), orbit: true },     // Kreisfahrt um alle vier
    { t: 13.4, d: 3.8, from: V(-2.05, 1.55, 1.25 + .45 * far), to: V(-2.1, 1.5, 1.05 + .4 * far), look: V(-2.08, 1.45, .15) },   // nah: das andere Paar
    { t: 17.2, d: 3.4, from: V(-3.6, 1.55, .95 + .5 * far), to: V(-3.5, 1.5, .8 + .45 * far), look: V(-3.48, 1.4, -.15) },   // Tausch: du mit C
    { t: 20.6, d: 3.2, from: V(-1.1, 2.3, -.4 + .35 * far), to: V(-1.35, 2.1, -.75 + .3 * far), look: V(-3.2, .75, -2.3) },   // Bett von oben
    { t: 23.8, d: 2.2, from: V(-1.35, 2.1, -.75 + .3 * far), to: V(-1.6, 2.2, -.8 + .3 * far), look: V(-3.2, .75, -2.3), look2: V(-1.4, 1.6, -3.4) },
  ];
  let T = 0, fired = 0, ended = false, ew = 0, kw = 0, nk = 0, lying = false;
  const cue = (at: number, fn: () => void) => { if (T >= at && fired < at) fn(); };
  const blink = document.createElement('div'); blink.className = 'cineBlack';
  const voice = (a: Actor, i: number) => (a.avatar.g === 'f' ? 215 : 120) * (1 + i * .06);
  const pairs = (): Array<[Actor, Actor]> => { const at = (s: number) => all[slot.indexOf(s)]; return [[at(0), at(1)], [at(2), at(3)]]; };
  const finish = () => {
    if (ended) return; ended = true;
    sc.onAfterAnimationsObservable.remove(obs); unpose();
    for (const [x, y] of pairs()) { embrace(x, y, 0, 0); embrace(y, x, 0, 0); }
    unpose();
    h.cine = null; bars.remove(); blink.remove();
    for (const [l, i] of saved) l.intensity = i; sc.environmentIntensity = env;
    props.forEach((p) => p.dispose());
    cast.forEach((m, i) => { if (!m.isDisposed()) m.alwaysSelectAsActiveMesh = sel[i]; });
    place(me, me.root.position, 0); me.root.position.y = 0;
    me.setLook({ outfit: myLook.outfit || 'clothed' }); me.play('idle');
    [A, Bq, C].forEach((a) => a.dispose());
    done();
  };
  (bars.querySelector('button') as HTMLButtonElement).onclick = finish;
  const obs = sc.onAfterAnimationsObservable.add(() => {
    unpose();
    if (ew <= 0 && kw <= 0 && nk <= 0) return;
    const slide = .5 + .5 * Math.sin(T * 1.3);
    pairs().forEach(([x, y], i) => {
      const k = i ? Math.max(0, kw - .1) : kw, hold: Hold = lying ? 'none' : 'waist';
      embrace(x, y, lying ? 0 : ew, k, hold, slide, i ? nk * .6 : nk); embrace(y, x, lying ? 0 : ew, k * .9, lying ? 'none' : 'neck', slide, nk * .4);
    });
  });
  const tmp = V(0, 0, 0);
  const lie = (a: Actor, x: number, roll: number) => {
    a.root.position.set(x, .7, -.9);
    a.root.rotationQuaternion = Quaternion.RotationAxis(new Vector3(0, 0, 1), roll).multiply(Quaternion.RotationAxis(new Vector3(1, 0, 0), -Math.PI / 2 + .2));
  };
  h.cine = (dt: number) => {
    if (ended) return;
    const last = T; T += dt; fired = last;
    A.update(dt); Bq.update(dt); C.update(dt); me.update(dt);
    // Ablauf
    cue(1.2, () => { Bq.play('laugh'); sfx('giggle'); });
    cue(2.4, () => { C.play('cheer'); sfx('glass'); });
    cue(3.6, () => all.forEach((a) => a.play('idle', .4)));
    cue(4.2, () => all.forEach((a, i) => a.play('dance2', .8, .2 + i * .01)));
    cue(5.8, () => sfx('kiss'));
    cue(6.9, () => { sfx('kiss'); breath(.6, .05); });
    cue(8.4, () => { document.body.appendChild(blink); });
    cue(8.9, () => { all.forEach((a) => a.setLook({ outfit: 'underwear' })); });
    cue(9.5, () => { blink.remove(); });
    cue(10.2, () => { sfx('kiss'); moan(voice(A, 1), .6, .05, 'm'); });
    cue(11.4, () => { breath(.7, .06); sfx('kiss'); });
    cue(12.5, () => moan(voice(Bq, 2), .7, .05, 'm'));
    cue(13.2, () => moan(voice(C, 3), .6, .05, 'a'));
    cue(14.6, () => sfx('kiss'));
    cue(15.8, () => { moan(voice(me, 0), .6, .05, 'm'); sfx('giggle'); });
    // Partnertausch: C kommt zu dir, A geht zu B
    cue(16.7, () => { document.body.appendChild(blink); });
    cue(17.1, () => { unpose(); slot = [0, 2, 3, 1]; all.forEach((a, i) => { place(a, L1[slot[i]], yaws[slot[i]]); a.play('dance2', 0, .2); }); blink.remove(); });
    cue(18, () => { sfx('kiss'); breath(.7, .06); });
    cue(19.2, () => moan(voice(C, 3), .7, .06, 'o'));
    cue(20.1, () => { document.body.appendChild(blink); sfx('sheets'); });
    cue(20.6, () => {
      lying = true; unpose();
      // auf dem Bett: du neben C, B neben A, je zwei einander zugewandt
      const order = [me, C, Bq, A];
      order.forEach((a, i) => { a.play('idle', 0, .5); lie(a, bedX[i], i % 2 ? .55 : -.55); });
      slot = [0, 3, 2, 1]; sheet.setEnabled(true); blink.remove();
    });
    cue(21.4, () => sfx('sheets'));
    cue(22, () => moan(voice(A, 1), .8, .07, 'a'));
    cue(22.8, () => { sfx('kiss'); breath(.8, .07); });
    cue(23.6, () => moan(voice(me, 0), .8, .07, 'o'));
    cue(24.2, () => moan(voice(Bq, 2), .7, .06, 'a'));
    cue(24.8, () => sfx('heart'));
    // Annäherung, Umarmen, Küsse
    const near = ease((T - 4.2) / 1.4);
    if (T < 17.1) all.forEach((a, i) => Vector3.LerpToRef(L0[slot[i]], L1[slot[i]], near, a.root.position));
    ew = T < 4.6 ? 0 : T < 20.6 ? (T < 17.1 ? ease((T - 4.6) / 1.3) : ease((T - 17.2) / .8)) : 0;
    kw = T < 5.4 ? 0 : T < 8.4 ? ease((T - 5.4) / .9) : T < 9.8 ? .3 : T < 16.7 ? ease((T - 9.8) / .6) : T < 17.5 ? 0 : T < 20.6 ? ease((T - 17.5) / .6) : ease((T - 21) / 1);
    nk = T >= 11 && T < 13 ? Math.min(ease((T - 11) / .5), 1 - ease((T - 12.6) / .4)) : T >= 18.6 && T < 19.9 ? Math.min(ease((T - 18.6) / .4), 1 - ease((T - 19.5) / .4)) : 0;
    candle.intensity = 5.5 + Math.sin(T * 9) * .5 + Math.sin(T * 23) * .3;
    pink.intensity = 3 + Math.sin(T * 1.7) * .8;
    if (T > 23.8) { const f = ease((T - 23.8) / 2.2); candle.intensity *= 1 - f * .8; rim.intensity = 4.5 * (1 - f); pink.intensity *= 1 - f; }
    // Kamera
    const s = shots.filter((x) => T >= x.t).pop()!, u = ease((T - s.t) / s.d);
    if (s.orbit) {
      const a = .85 - u * 1.4, r = 2.1 * far;
      h.camera.position.set(-2.78 + Math.sin(a) * r, 1.55 + u * .1, Math.cos(a) * r);
      h.camera.setTarget(s.look);
    } else {
      Vector3.LerpToRef(s.from, s.to, u, h.camera.position);
      if (s.look2) { Vector3.LerpToRef(s.look, s.look2, u, tmp); h.camera.setTarget(tmp); } else h.camera.setTarget(s.look);
    }
    if (T >= GROUP_END) finish();
  };
  return finish;
}

/* Zeit für dich (Solo, 18+): ausziehen bis zur Unterwäsche, allein unter die Decke, Atem, Kamera schwenkt zum Fenster,
   Abblende. Mit tape läuft die Handy-Kamera mit (Rahmen, REC) – das Video gehört nur dir. Nichts Explizites im Bild. */
export const SOLO_END = 15;
export function soloScene(h: CineHost, done: () => void, tape = false) {
  const sc = h.scene, me = h.player, pr = h.portrait(), far = pr ? 1.4 : 1;
  const myLook = { ...me.look };
  const place = (p: Vector3, yaw: number) => { me.root.rotationQuaternion = null; me.root.position.copyFrom(p); me.root.rotation.set(0, yaw, 0); };
  place(V(-2.6, 0, -.15), Math.PI); me.play('idle', .3);
  const saved = sc.lights.map((l: Light) => [l, l.intensity] as const);
  for (const [l] of saved) l.intensity *= .15;
  const env = sc.environmentIntensity; sc.environmentIntensity = env * .25;
  const candle = new PointLight('kerze', V(-1.45, .95, -2.9), sc); candle.diffuse = new Color3(1, .55, .25); candle.intensity = 6; candle.range = 7;
  const rim = new PointLight('rim', V(-2.4, 2.2, .9), sc); rim.diffuse = new Color3(.75, .35, 1); rim.intensity = 3.5; rim.range = 6;
  const sheet = blanket(sc, 1.4, [0], -3.14); sheet.setEnabled(false);
  const props: Array<{ dispose(): void }> = [candle, rim, sheet];
  music('lounge');
  const bars = document.createElement('div'); bars.className = 'cine' + (tape ? ' tape' : '');
  bars.innerHTML = `<i></i><i></i><p>${tape ? '📹 Nur du' : '🫦 Zeit für dich'}</p>${tape ? '<b class="rec">● REC <span>00:00</span></b>' : ''}<button type="button">Überspringen ›</button>`;
  document.body.appendChild(bars);
  const recT = bars.querySelector('.rec span') as HTMLElement | null;
  const shots: Shot[] = [
    { t: 0, d: 4, from: V(-.9, 1.6, 1.3 * far), to: V(-1.2, 1.55, 1.1 * far), look: V(-2.6, 1.2, -.3) },
    { t: 4, d: 5, from: V(-1.6, 1.9, -.6 + .3 * far), to: V(-1.9, 1.7, -.95 + .25 * far), look: V(-3.14, .8, -2.2) },
    { t: 9, d: 6, from: V(-1.9, 1.7, -.95 + .25 * far), to: V(-2.05, 1.9, -1 + .25 * far), look: V(-3.14, .8, -2.2), look2: V(-1.4, 1.6, -3.4) },
  ];
  let T = 0, fired = 0, ended = false;
  const cue = (at: number, fn: () => void) => { if (T >= at && fired < at) fn(); };
  const blink = document.createElement('div'); blink.className = 'cineBlack';
  const v = me.avatar.g === 'f' ? 215 : 120, tmp = V(0, 0, 0);
  const finish = () => {
    if (ended) return; ended = true;
    h.cine = null; bars.remove(); blink.remove();
    for (const [l, i] of saved) l.intensity = i; sc.environmentIntensity = env;
    props.forEach((p) => p.dispose());
    place(me.root.position, 0); me.root.position.set(-2.4, 0, .6);
    me.setLook({ outfit: myLook.outfit || 'clothed' }); me.play('idle');
    done();
  };
  (bars.querySelector('button') as HTMLButtonElement).onclick = finish;
  h.cine = (dt: number) => {
    if (ended) return;
    const last = T; T += dt; fired = last;
    me.update(dt);
    if (recT) recT.textContent = `00:${String(Math.floor(T)).padStart(2, '0')}`;
    cue(1.2, () => { me.play('laugh'); });
    cue(3.4, () => document.body.appendChild(blink));
    cue(4, () => {
      me.setLook({ outfit: 'underwear' }); me.play('idle', 0, .5);
      me.root.position.set(-3.14, .7, -.9);
      me.root.rotationQuaternion = Quaternion.RotationAxis(new Vector3(1, 0, 0), -Math.PI / 2 + .2);
      sheet.setEnabled(true); blink.remove(); sfx('sheets');
    });
    cue(5.5, () => breath(.8, .05));
    cue(7, () => breath(.9, .06));
    cue(8.2, () => moan(v, .7, .05, 'm'));
    cue(9.6, () => { sfx('sheets'); breath(.8, .07); });
    cue(10.8, () => moan(v, .9, .07, 'a'));
    cue(12.2, () => moan(v * 1.05, 1, .08, 'o'));
    cue(13.2, () => sfx('heart'));
    candle.intensity = 5.5 + Math.sin(T * 9) * .5;
    if (T > 9) { const f = ease((T - 9) / 6); candle.intensity *= 1 - f * .8; rim.intensity = 3.5 * (1 - f); }
    const s = shots.filter((x) => T >= x.t).pop()!, u = ease((T - s.t) / s.d);
    Vector3.LerpToRef(s.from, s.to, u, h.camera.position);
    if (s.look2) { Vector3.LerpToRef(s.look, s.look2, u, tmp); h.camera.setTarget(tmp); } else h.camera.setTarget(s.look);
    if (tape) { h.camera.position.x += Math.sin(T * 2.3) * .02; h.camera.position.y += Math.sin(T * 3.1) * .015; }
    if (T >= SOLO_END) finish();
  };
  return finish;
}
