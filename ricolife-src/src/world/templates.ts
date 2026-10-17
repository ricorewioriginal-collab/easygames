// Bau-Vorlagen für alle Grundstücke: eine kleine Bau-DSL (lokale Koordinaten, Straße immer „unten“) plus möblierte Vorlagen.
// Lokales System: x nach rechts, z nach unten; die Straßenseite liegt bei z = Tiefe (Süden). Die Vorlage wird je nach
// Straßenseite des Lots (front) um 0/90/180/270° gedreht in die Welt gesetzt. Objektdrehung lokal: r0 = Vorderseite zur
// Straße (+z), r1 = nach rechts (+x), r2 = nach hinten (-z), r3 = nach links (-x). Kanten: dir 0 = waagerechte Kante an der
// Oberseite der Zelle (x,z), dir 1 = senkrechte Kante an der linken Seite der Zelle (x,z).
import { LOTS, lotById, type LotDef } from '../data/lots';
import { getDef, hasDef } from './defs';
import { cellKey, dimsOf, edgeKey, rotLocal, Ter, MAP_W, LEVELS, type ObjInst, type Rot, type World } from './world';

export interface TemplateResult {
  errors: string[];
}

/** Wandfarben/Tapeten (Index = Wert in Wall.a/Wall.b) */
export const WALL_PAINTS: { name: string; color: string }[] = [
  { name: 'Weiß', color: '#f3efe6' },
  { name: 'Creme', color: '#efe2c4' },
  { name: 'Salbei', color: '#b8c9a3' },
  { name: 'Himmelblau', color: '#a8c5dd' },
  { name: 'Rosé', color: '#e8c3bd' },
  { name: 'Terrakotta', color: '#c98260' },
  { name: 'Senfgelb', color: '#dcb45c' },
  { name: 'Mint', color: '#bfe2d2' },
  { name: 'Lavendel', color: '#c8bde2' },
  { name: 'Fliesen weiß', color: '#e6ecee' },
  { name: 'Fliesen blau', color: '#9fc0cf' },
  { name: 'Holzvertäfelung', color: '#a5794f' },
  { name: 'Anthrazit', color: '#4a4e54' },
  { name: 'Putz hell', color: '#e9ddc6' },
  { name: 'Klinker', color: '#a4513b' },
  { name: 'Putz gelb', color: '#e7cf8f' },
  { name: 'Beton', color: '#b5b4ae' },
  { name: 'Holz dunkel', color: '#6e4a33' },
  { name: 'Putz graublau', color: '#9aa9b5' },
  { name: 'Verblasstes Altrosa', color: '#cdb2a6' },
];
/** Bodenbeläge (Index = Wert in World.floors; 0 = keiner) */
export const FLOOR_TYPES: { name: string; color: string }[] = [
  { name: 'Kein Belag', color: '#000000' },
  { name: 'Eichenparkett', color: '#b98a58' },
  { name: 'Fliesen hell', color: '#d9dcd6' },
  { name: 'Teppich', color: '#8f9fb8' },
  { name: 'Pflaster', color: '#a8a294' },
  { name: 'Holzdielen', color: '#9a6d44' },
  { name: 'Beton', color: '#a3a39e' },
  { name: 'Terrakotta', color: '#c0764f' },
  { name: 'Marmor', color: '#e4e0d8' },
  { name: 'Linoleum', color: '#9fb59a' },
  { name: 'Holzdeck', color: '#8b6440' },
  { name: 'Kies', color: '#c9bb9b' },
  { name: 'Schachbrett', color: '#d8d0c0' },
  { name: 'Gummimatten', color: '#4f5358' },
  { name: 'Abgenutzte Dielen', color: '#8a6a4c' },
];

// Kurznamen für Farben und Böden
const P = { weiss: 0, creme: 1, salbei: 2, himmel: 3, rose: 4, terra: 5, senf: 6, mint: 7, lavendel: 8, fliesen: 9, fliesenBlau: 10, holz: 11, anthrazit: 12, putz: 13, klinker: 14, putzGelb: 15, beton: 16, holzDunkel: 17, graublau: 18, altrosa: 19 } as const;
const F = { eiche: 1, fliesen: 2, teppich: 3, pflaster: 4, dielen: 5, beton: 6, terra: 7, marmor: 8, lino: 9, deck: 10, kies: 11, schach: 12, gummi: 13, alt: 14 } as const;

type Item = [def: string, x: number, z: number, r?: Rot];
type Edge = [x: number, z: number, dir: 0 | 1];

/** Bau-Werkzeug: setzt lokale Angaben gedreht/versetzt in die Welt und sammelt Fehler */
class Builder {
  readonly errors: string[] = [];
  /** Zellen in Innenräumen (für automatische Fenster) */
  private indoor = new Set<number>();
  /** Obergeschoss-Zellen über Treppen (Treppenauge) */
  private stairwell = new Set<number>();
  private q: Rot;
  private LW: number;
  private LD: number;
  private ox: number;
  private oz: number;
  /** Außenfarbe neuer Wände */
  ext: number = P.putz;

  constructor(
    readonly w: World,
    readonly lot: LotDef,
    size: [number, number],
  ) {
    // Straßenseite → Drehung: Süden 0, Osten 1, Norden 2, Westen 3 (wie rotLocal)
    this.q = ([2, 1, 0, 3] as const)[lot.front];
    const odd = this.q % 2 === 1;
    this.LW = odd ? lot.d : lot.w;
    this.LD = odd ? lot.w : lot.d;
    this.ox = Math.floor((this.LW - size[0]) / 2);
    this.oz = this.LD - size[1];
    if (this.ox < 0 || this.oz < 0) this.err(`Vorlage (${size[0]}×${size[1]}) passt nicht auf das Grundstück`);
  }

  /** lokale Breite/Tiefe des Grundstücks */
  get width(): number {
    return this.LW;
  }
  get depth(): number {
    return this.LD;
  }

  private err(msg: string): void {
    this.errors.push(`${this.lot.id}: ${msg}`);
  }
  /** lokaler Punkt → Weltpunkt */
  private pt(lx: number, lz: number): [number, number] {
    const [dx, dz] = rotLocal(lx + this.ox - this.LW / 2, lz + this.oz - this.LD / 2, this.q);
    return [Math.round(this.lot.x + this.lot.w / 2 + dx), Math.round(this.lot.z + this.lot.d / 2 + dz)];
  }
  /** lokales Rechteck → Weltrechteck */
  rect(lx: number, lz: number, w: number, d: number): { x: number; z: number; w: number; d: number } {
    const [ax, az] = this.pt(lx, lz),
      [bx, bz] = this.pt(lx + w, lz + d);
    return { x: Math.min(ax, bx), z: Math.min(az, bz), w: Math.abs(bx - ax), d: Math.abs(bz - az) };
  }
  /** lokale Kante → Weltkante */
  private edge(lx: number, lz: number, dir: 0 | 1): Edge {
    const [ax, az] = this.pt(lx, lz);
    const [bx, bz] = dir === 0 ? this.pt(lx + 1, lz) : this.pt(lx, lz + 1);
    return az === bz ? [Math.min(ax, bx), az, 0] : [ax, Math.min(az, bz), 1];
  }

  /** Bodenfläche ohne Wände (Wege, Terrassen) */
  floor(lx: number, lz: number, w: number, d: number, f: number, l = 0): void {
    const r = this.rect(lx, lz, w, d);
    for (let z = r.z; z < r.z + r.d; z++)
      for (let x = r.x; x < r.x + r.w; x++) {
        if (l > 0) {
          const c = this.w.canFloor(l, x, z);
          if (!c.ok) {
            this.err(`Boden ${x},${z},${l}: ${c.reason}`);
            continue;
          }
        }
        this.w.floors.set(cellKey(l, x, z), f);
      }
  }

  /** Raum: Boden + Wände ringsum (vorhandene Wände bekommen innen die Raumfarbe) */
  room(lx: number, lz: number, w: number, d: number, f: number, paint: number, l = 0): void {
    this.floor(lx, lz, w, d, f, l);
    const r = this.rect(lx, lz, w, d);
    for (let z = r.z; z < r.z + r.d; z++) for (let x = r.x; x < r.x + r.w; x++) this.indoor.add(cellKey(l, x, z));
    for (let i = 0; i < r.w; i++) {
      this.wall(l, r.x + i, r.z, 0, 'b', paint);
      this.wall(l, r.x + i, r.z + r.d, 0, 'a', paint);
    }
    for (let j = 0; j < r.d; j++) {
      this.wall(l, r.x, r.z + j, 1, 'b', paint);
      this.wall(l, r.x + r.w, r.z + j, 1, 'a', paint);
    }
  }
  private wall(l: number, x: number, z: number, dir: 0 | 1, side: 'a' | 'b', paint: number, k: 0 | 1 | 2 = 0): void {
    const ex = this.w.getWall(l, x, z, dir);
    if (ex) {
      if (k === 0) ex[side] = paint;
      return;
    }
    const c = this.w.canWall(l, x, z, dir, this.lot);
    if (!c.ok) return this.err(`Wand ${x},${z},${l}/${dir}: ${c.reason}`);
    this.w.addWall(l, x, z, dir, { k, a: side === 'a' ? paint : this.ext, b: side === 'b' ? paint : this.ext });
  }
  /** Geländer (halbe Wand) um ein Rechteck, nur wo noch keine Wand steht */
  rail(lx: number, lz: number, w: number, d: number, l: number): void {
    const r = this.rect(lx, lz, w, d);
    for (let i = 0; i < r.w; i++) {
      this.wall(l, r.x + i, r.z, 0, 'b', this.ext, 2);
      this.wall(l, r.x + i, r.z + r.d, 0, 'a', this.ext, 2);
    }
    for (let j = 0; j < r.d; j++) {
      this.wall(l, r.x, r.z + j, 1, 'b', this.ext, 2);
      this.wall(l, r.x + r.w, r.z + j, 1, 'a', this.ext, 2);
    }
  }
  /** Wasserfläche (Teich) im Gelände */
  water(lx: number, lz: number, w: number, d: number): void {
    const r = this.rect(lx, lz, w, d);
    for (let z = r.z; z < r.z + r.d; z++) for (let x = r.x; x < r.x + r.w; x++) this.w.terrain[z * MAP_W + x] = Ter.Water;
  }

  /** Tür oder Fenster an einer lokalen Kante (breite Fenster laufen entlang der Kante) */
  open(def: string, lx: number, lz: number, dir: 0 | 1, l = 0): void {
    if (!hasDef(def)) return this.err(`Unbekanntes Objekt ${def}`);
    const n = getDef(def).w;
    const es: Edge[] = [];
    for (let i = 0; i < n; i++) es.push(this.edge(dir === 0 ? lx + i : lx, dir === 0 ? lz : lz + i, dir));
    const x = Math.min(...es.map((e) => e[0])),
      z = Math.min(...es.map((e) => e[1])),
      wd = es[0]![2];
    this.addOpening(def, x, z, wd, l);
  }
  private addOpening(def: string, x: number, z: number, dir: 0 | 1, l: number): boolean {
    const c = this.w.canOpening(def, x, z, l, dir);
    if (!c.ok) {
      this.err(`${def} @${x},${z},${l}/${dir}: ${c.reason}`);
      return false;
    }
    this.w.addObj({ id: this.w.newId(), def, x, z, l, r: 0, lot: this.lot.id, dir });
    return true;
  }
  doors(list: Edge[], def = 'tuer-schlicht', l = 0): void {
    for (const [x, z, d] of list) this.open(def, x, z, d, l);
  }

  /** Objekt setzen: (lx,lz) = obere linke Ecke der gedrehten Grundfläche */
  put(def: string, lx: number, lz: number, r: Rot = 0, l = 0): ObjInst | null {
    if (!hasDef(def)) {
      this.err(`Unbekanntes Objekt ${def}`);
      return null;
    }
    const d = getDef(def);
    const [ww, dd] = dimsOf(d, r);
    const R = this.rect(lx, lz, ww, dd);
    const wr = ((r + this.q) % 4) as Rot;
    if (l > 0 && d.mount !== 'wall')
      for (let j = 0; j < R.d; j++) for (let i = 0; i < R.w; i++) if (this.stairwell.has(cellKey(l, R.x + i, R.z + j))) {
        this.err(`${def} @${R.x},${R.z},${l}: steht im Treppenauge`);
        return null;
      }
    const c = this.w.canPlace(def, R.x, R.z, l, wr, this.lot);
    if (!c.ok) {
      this.err(`${def} @${R.x},${R.z},${l} (lokal ${lx},${lz}): ${c.reason}`);
      return null;
    }
    return this.w.addObj({ id: this.w.newId(), def, x: R.x, z: R.z, l, r: wr, lot: this.lot.id });
  }
  /** mehrere Objekte auf einer Ebene */
  ps(items: Item[], l = 0): void {
    for (const [def, x, z, r] of items) this.put(def, x, z, r ?? 0, l);
  }
  /** Treppe (lokal r0: Einstieg vorn bei +z, oben hinten bei -z) – Obergeschoss muss schon Boden haben */
  stairs(def: string, lx: number, lz: number, r: Rot = 0, l = 0): void {
    const o = this.put(def, lx, lz, r, l);
    if (o) for (const [x, z] of this.w.cellsOf(o)) this.stairwell.add(cellKey(l + 1, x, z));
  }

  /** Fenster automatisch in gerade Außenwände setzen (nicht an Ecken, Türen oder Wandobjekten) */
  windows(def = 'fenster-klarblick', step = 3): void {
    const n = getDef(def).w;
    const L = this.lot;
    const W = this.w;
    const wallAt = (l: number, x: number, z: number, dir: 0 | 1): boolean => W.walls.has(edgeKey(l, x, z, dir));
    const ok = (l: number, x: number, z: number, dir: 0 | 1): boolean => {
      const k = edgeKey(l, x, z, dir);
      const wl = W.walls.get(k);
      if (!wl || wl.k !== 0 || W.openings.has(k) || W.wallObj.has(k * 2) || W.wallObj.has(k * 2 + 1)) return false;
      const [a, b] = dir === 0 ? [[x, z - 1], [x, z]] : [[x - 1, z], [x, z]];
      const ia = this.indoor.has(cellKey(l, a![0]!, a![1]!)),
        ib = this.indoor.has(cellKey(l, b![0]!, b![1]!));
      if (ia === ib) return false; // nur Außenwände
      // keine Wandanschlüsse an den Endpunkten, Nachbarkanten sind geschlossene Wand
      if (dir === 0) {
        if (wallAt(l, x, z - 1, 1) || wallAt(l, x, z, 1) || wallAt(l, x + 1, z - 1, 1) || wallAt(l, x + 1, z, 1)) return false;
        return [x - 1, x + 1].every((xx) => wallAt(l, xx, z, 0) && !W.openings.has(edgeKey(l, xx, z, 0)));
      }
      if (wallAt(l, x - 1, z, 0) || wallAt(l, x, z, 0) || wallAt(l, x - 1, z + 1, 0) || wallAt(l, x, z + 1, 0)) return false;
      return [z - 1, z + 1].every((zz) => wallAt(l, x, zz, 1) && !W.openings.has(edgeKey(l, x, zz, 1)));
    };
    for (let l = 0; l < LEVELS; l++)
      for (let z = L.z; z <= L.z + L.d; z++)
        for (let x = L.x; x <= L.x + L.w; x++)
          for (const dir of [0, 1] as const) {
            if ((dir === 0 ? x : z) % step !== 1) continue;
            let fits = true;
            for (let i = 0; i < n && fits; i++) fits = ok(l, dir === 0 ? x + i : x, dir === 0 ? z : z + i, dir);
            if (fits && W.canOpening(def, x, z, l, dir).ok) this.addOpening(def, x, z, dir, l);
          }
  }
}

// ======================= Vorlagen =======================
interface Tpl {
  /** benötigte Fläche [Breite, Tiefe] (lokal); fehlt = ganzes Grundstück */
  size?: [number, number];
  ext: number;
  build: (b: Builder) => void;
}

const HAUSTUER = 'tuer-haustuer-eiche';

const T: Record<string, Tpl> = {
  // ---------- Sonnenhain ----------
  'home-cottage': {
    size: [18, 14],
    ext: P.putz,
    build(b) {
      b.room(1, 1, 4, 5, F.fliesen, P.weiss); // Küche
      b.room(5, 1, 3, 5, F.fliesen, P.fliesenBlau); // Bad
      b.room(8, 1, 3, 5, F.teppich, P.mint); // Kinderzimmer
      b.room(11, 1, 3, 5, F.eiche, P.rose); // Eltern
      b.room(1, 6, 13, 4, F.eiche, P.creme); // Wohnen & Essen
      b.floor(8, 10, 2, 4, F.pflaster);
      b.doors([[3, 6, 0], [6, 6, 0], [9, 6, 0], [12, 6, 0]]);
      b.open('tuer-landhaus-kassette', 9, 10, 0);
      b.ps([
        ['kuehlschrank-frostbeule', 1, 1], ['herd-kochfix', 2, 1], ['spuele-plaetscher', 3, 1], ['kuechenzeile-schlicht', 4, 1], ['mikrowelle-turbowaermer', 4, 1],
        ['spuelmaschine-blitzblank', 1, 3, 1], ['muelleimer-schlucker', 1, 5, 1], ['kuechenzeile-schlicht', 4, 3, 3], ['kuechenzeile-schlicht', 4, 4, 3], ['kaffee-morgenmuffel', 4, 3, 3], ['wanduhr-tickende-taube', 2, 5, 2],
        // Bad
        ['toilette-thron', 5, 1], ['dusche-regentropfen', 7, 1], ['badewanne-badeschaum', 7, 2], ['waschbecken-klarspueler', 5, 3, 1], ['spiegel-rundblick', 5, 3, 1], ['pflanze-farnwedel', 5, 5],
        // Kinder (Emil + Ayla)
        ['kinderbett-raketenstart', 8, 1], ['babybett-sternschnuppe', 10, 1], ['spielkiste-baerenbox', 8, 4, 1], ['puppenhaus-lindenhof', 10, 4, 3], ['kleiderschrank-ordnungsliebe', 8, 5, 1], ['stehlampe-lichtsaeule', 10, 5], ['bild-abendrot', 9, 1],
        // Eltern
        ['doppelbett-traumhafen', 11, 1], ['nachttisch-nachtwache', 13, 1], ['kleiderschrank-raumwunder', 13, 3, 3], ['spiegel-ankleide', 11, 4, 1], ['stehlampe-bogenlicht', 11, 5],
        // Wohnen
        ['esstisch-tafelrunde', 2, 8], ['stuhl-kantholz', 2, 7], ['stuhl-kantholz', 3, 7], ['stuhl-kantholz', 2, 9, 2], ['stuhl-kantholz', 3, 9, 2], ['hochstuhl-mampfturm', 4, 8, 3],
        ['regal-buecherwurm', 5, 6], ['stereo-vinylglueck', 6, 9, 2], ['teppich-wolkenweich', 7, 7],
        ['tv-flimmerkiste', 10, 8, 1], ['couchtisch-eichenrund', 11, 8], ['sofa-fjordruhe', 13, 7, 3], ['sessel-ohrenkuss', 11, 7], ['stehlampe-lichtsaeule', 13, 6],
        ['bild-familiencollage', 5, 6], ['bild-geometrie-senf', 10, 6], ['wandleuchte-kerzenschein', 1, 6, 1],
        // Garten
        ['briefkasten-landhaus', 7, 13, 1], ['gemuesebeet-gruenzeug', 15, 1], ['hochbeet-kraeuterburg', 15, 4], ['schaukel-himmelsstuermer', 15, 8], ['grill-glutkugel', 14, 12, 1],
        ['gartenbank-parkruh', 15, 13, 2], ['muelltonne-trennkuenstler', 0, 11, 1], ['pflanze-zitronenbaum', 3, 12], ['gartenlaterne-gluehwuermchen', 10, 11], ['gartenlaterne-gluehwuermchen', 14, 10],
      ]);
      b.windows('fenster-sprosse', 3);
    },
  },

  // Familie Sonnberg: älteres Haus, etwas heruntergekommen, viel Platz zum Ausbauen (Story „Traumhaus“)
  'home-sonnberg': {
    size: [19, 14],
    ext: P.altrosa,
    build(b) {
      b.room(1, 2, 4, 4, F.alt, P.creme); // Küche
      b.room(1, 6, 4, 4, F.fliesen, P.fliesen); // Bad
      b.room(5, 2, 6, 8, F.alt, P.altrosa); // Wohnen mit Treppe
      b.room(5, 2, 2, 8, F.dielen, P.creme, 1); // Flur oben
      b.room(1, 2, 4, 4, F.teppich, P.salbei, 1); // Lena
      b.room(1, 6, 4, 4, F.dielen, P.himmel, 1); // Mats
      b.room(7, 2, 4, 4, F.teppich, P.rose, 1); // Pia
      b.room(7, 6, 4, 4, F.alt, P.altrosa, 1); // Abstellraum (leer)
      b.floor(8, 10, 2, 4, F.pflaster);
      b.doors([[5, 4, 1], [5, 8, 1]]);
      b.open('tuer-landhaus-kassette', 8, 10, 0);
      b.doors([[5, 3, 1], [5, 8, 1], [7, 2, 1], [7, 7, 1]], 'tuer-schlicht', 1);
      b.stairs('treppe-stufenweise', 6, 3);
      b.ps([
        ['kuehlschrank-vorratskammer', 1, 2], ['herd-omas-stolz', 2, 2], ['spuele-bauernglueck', 3, 2], ['kuechenzeile-schlicht', 4, 2], ['kaffee-morgenmuffel', 4, 2], ['muelleimer-schlucker', 1, 5, 1],
        ['toilette-thron', 1, 6], ['waschbecken-klarspueler', 2, 6], ['spiegel-rundblick', 2, 6], ['badewanne-badeschaum', 4, 6],
        ['sofa-wolkenbank', 10, 3, 3], ['tv-retroglotze', 7, 4, 1], ['esstisch-tafelrunde', 8, 7], ['stuhl-kantholz', 8, 6], ['stuhl-kantholz', 9, 6], ['stuhl-kantholz', 8, 8, 2],
        ['regal-wandleiter', 7, 2], ['bild-familiencollage', 9, 2], ['hundekorb-schnarchnase', 10, 2], ['napf-schlabberschale', 5, 9, 1], ['spielkorb-baellebande', 10, 9, 3],
        ['pflanze-farnwedel', 5, 2], ['stehlampe-lichtsaeule', 7, 9],
        ['gemuesebeet-gruenzeug', 13, 2], ['schaukel-himmelsstuermer', 15, 5], ['grill-glutkugel', 12, 10], ['gartenbank-parkruh', 15, 11], ['briefkasten-postfuchs', 7, 13, 1],
      ]);
      b.ps(
        [
          ['doppelbett-futonia', 1, 2], ['kleiderschrank-ordnungsliebe', 4, 2], ['nachttisch-nachtwache', 3, 2],
          ['bett-nordlicht', 1, 6], ['schreibtisch-hochkant', 3, 9, 2], ['computer-rechenknecht', 3, 9, 2], ['egitarre-donnerhall', 1, 9, 2],
          ['kinderbett-raketenstart', 10, 2], ['spielkiste-baerenbox', 8, 5, 2], ['staffelei-pinselstrich', 9, 5, 2],
        ],
        1,
      );
      b.windows('fenster-sprosse', 3);
    },
  },

  // Musterhaus „Lichtblick“: modernes Familienhaus mit zwei Etagen und Pool
  'home-modern': {
    size: [20, 16],
    ext: P.weiss,
    build(b) {
      b.room(2, 2, 6, 10, F.eiche, P.weiss); // Wohnküche
      b.room(8, 2, 3, 3, F.fliesen, P.fliesenBlau); // Gäste-WC
      b.room(8, 5, 3, 7, F.marmor, P.weiss); // Diele
      b.room(11, 2, 5, 10, F.eiche, P.himmel); // Wohnzimmer
      b.room(2, 2, 6, 5, F.teppich, P.lavendel, 1); // Eltern
      b.room(2, 7, 6, 5, F.eiche, P.mint, 1); // Kind 1
      b.room(8, 2, 3, 7, F.eiche, P.weiss, 1); // Flur oben
      b.room(8, 9, 3, 3, F.fliesen, P.fliesen, 1); // Bad
      b.room(11, 2, 5, 5, F.teppich, P.senf, 1); // Kind 2
      b.room(11, 7, 5, 5, F.eiche, P.salbei, 1); // Arbeitszimmer
      b.floor(9, 12, 2, 4, F.pflaster);
      b.doors([[9, 5, 0], [8, 8, 1], [11, 8, 1]]);
      b.open(HAUSTUER, 9, 12, 0);
      b.doors([[8, 4, 1], [8, 8, 1], [9, 9, 0], [11, 3, 1], [11, 8, 1]], 'tuer-glaslicht', 1);
      b.stairs('treppe-schwebend', 10, 5);
      b.ps([
        ['kuehlschrank-polarstern', 2, 2], ['kuechenzeile-marmor', 3, 2], ['herd-feuerwerk', 4, 2], ['kuechenzeile-marmor', 5, 2], ['spuele-plaetscher', 6, 2], ['spuelmaschine-glanzleistung', 7, 2],
        ['kaffee-bohnenglueck', 3, 2], ['mikrowelle-ofenfix', 5, 2], ['kuecheninsel-treffpunkt', 4, 4, 2], ['muelleimer-schlucker', 2, 5, 1],
        ['esstisch-familienrund', 4, 8], ['stuhl-muschel', 4, 7], ['stuhl-muschel', 5, 7], ['stuhl-muschel', 4, 10, 2], ['stuhl-muschel', 5, 10, 2], ['stuhl-muschel', 3, 8, 1], ['stuhl-muschel', 6, 9, 3],
        ['vase-tulpentraum', 4, 8], ['bild-abendrot', 2, 9, 1], ['pflanze-monstera-mia', 2, 11], ['deckenfluter-sonnenschale', 7, 11],
        ['toilette-schwebend', 8, 2], ['waschbecken-klarspueler', 10, 2], ['spiegel-rundblick', 10, 2],
        ['pflanze-farnwedel', 8, 11], ['wanduhr-tickende-taube', 8, 6, 1],
        ['klavier-tastenzauber', 14, 2], ['sessel-ohrenkuss', 12, 2], ['stehlampe-bogenlicht', 11, 2], ['sofa-samtsalon', 15, 4, 3], ['couchtisch-glasklar', 13, 4, 1], ['tv-kinowand', 11, 4, 1],
        ['teppich-berber-raute', 12, 6], ['kamin-glutnest', 13, 11, 2], ['stereo-klangturm', 15, 8, 3], ['regal-buecherwurm', 15, 9, 3], ['pflanze-gummibaum-gustav', 11, 11], ['bild-geometrie-senf', 12, 11, 2],
        ['briefkasten-postfuchs', 8, 14, 1], ['pool-lagune', 17, 2], ['liegestuhl-sonnenanbeter', 16, 8], ['grill-grillmeister', 16, 13, 2],
        ['gartenlaterne-gluehwuermchen', 11, 13], ['gartenlaterne-gluehwuermchen', 7, 13], ['pflanze-zitronenbaum', 3, 13], ['pflanze-zitronenbaum', 15, 14],
      ]);
      b.ps(
        [
          ['doppelbett-himmelreich', 3, 2], ['nachttisch-nachtwache', 2, 2], ['nachttisch-nachtwache', 5, 2], ['kleiderschrank-raumwunder', 2, 6, 2], ['spiegel-ankleide', 7, 2, 3], ['kommode-schubladenwunder', 6, 6, 2],
          ['bett-schlummerkiste', 2, 7], ['schreibtisch-fleissbiene', 5, 11, 2], ['laptop-klappflink', 5, 11, 2], ['spielkiste-schatzkiste', 2, 11, 2], ['bild-abendrot', 4, 7], ['teleskop-sternengucker', 7, 11],
          ['pflanze-farnwedel', 8, 2], ['bild-familiencollage', 9, 2],
          ['toilette-thron', 8, 9, 1], ['dusche-wasserfall', 10, 11], ['waschbecken-klarspueler', 8, 11, 1], ['spiegel-rundblick', 8, 11, 1],
          ['bett-nordlicht', 15, 2], ['schreibtisch-hochkant', 12, 6, 2], ['computer-rechenknecht', 12, 6, 2], ['kleiderschrank-ordnungsliebe', 11, 6, 2], ['sitzsack-plumps', 14, 2],
          ['arbeitsplatz-homeoffice', 13, 11, 2], ['regal-wandleiter', 15, 7, 3], ['staffelei-atelier', 12, 7], ['laufband-kilometerfresser', 11, 10],
        ],
        1,
      );
      b.windows('fenster-panorama', 4);
    },
  },

  // Musterhaus „Sonnendeck“: heller Bungalow mit Terrasse
  'home-bungalow': {
    size: [18, 14],
    ext: P.putzGelb,
    build(b) {
      b.room(1, 1, 4, 4, F.eiche, P.himmel); // Eltern
      b.room(5, 1, 3, 4, F.fliesen, P.fliesenBlau); // Bad
      b.room(8, 1, 4, 4, F.teppich, P.mint); // Kinder
      b.room(12, 1, 3, 4, F.fliesen, P.weiss); // Küche
      b.room(1, 5, 14, 4, F.eiche, P.creme); // Wohnen & Essen
      b.floor(8, 9, 2, 5, F.pflaster);
      b.floor(10, 9, 7, 3, F.deck);
      b.doors([[2, 5, 0], [6, 5, 0], [9, 5, 0], [13, 5, 0]]);
      b.open(HAUSTUER, 8, 9, 0);
      b.open('tuer-glaslicht', 12, 9, 0);
      b.ps([
        ['doppelbett-traumhafen', 1, 1], ['nachttisch-nachtwache', 3, 1], ['kleiderschrank-raumwunder', 4, 2, 3], ['spiegel-rundblick', 1, 4, 1], ['stehlampe-lichtsaeule', 4, 1],
        ['toilette-thron', 5, 1], ['dusche-regentropfen', 7, 1], ['waschbecken-klarspueler', 7, 3, 3], ['spiegel-rundblick', 7, 3, 3],
        ['bett-schlummerkiste', 8, 1], ['bett-nordlicht', 11, 1], ['spielkiste-schatzkiste', 10, 1], ['schreibtisch-fleissbiene', 10, 4, 2], ['laptop-klappflink', 11, 4, 2],
        ['kuehlschrank-frostbeule', 12, 1], ['herd-kochfix', 13, 1], ['spuele-plaetscher', 14, 1], ['kuechenzeile-schlicht', 14, 3, 3], ['kaffee-morgenmuffel', 14, 3, 3], ['muelleimer-schlucker', 12, 4, 1],
        ['esstisch-tafelrunde', 2, 7], ['stuhl-gutsherr', 2, 6], ['stuhl-gutsherr', 3, 6], ['stuhl-gutsherr', 2, 8, 2], ['stuhl-gutsherr', 3, 8, 2],
        ['sofa-fjordruhe', 10, 6, 1], ['tv-flimmerkiste', 13, 7, 3], ['sessel-korbwiege', 14, 6, 3], ['stehlampe-bogenlicht', 14, 8], ['regal-buecherwurm', 5, 8, 2], ['pflanze-monstera-mia', 7, 8],
        ['bild-abendrot', 4, 5], ['bild-geometrie-senf', 11, 5],
        ['gartentisch-terrassenrunde', 14, 10], ['liegestuhl-sonnenanbeter', 16, 9], ['grill-glutkugel', 11, 11], ['gartenbank-rosenbogen', 14, 12], ['briefkasten-landhaus', 7, 13, 1],
        ['pflanze-zitronenbaum', 1, 11], ['pflanze-zitronenbaum', 5, 11], ['hochbeet-kraeuterburg', 16, 2, 1],
      ]);
      b.windows('fenster-landhaus-doppel', 4);
    },
  },

  // Familie Okafor-Brandt: zwei Etagen
  'home-family2': {
    size: [18, 14],
    ext: P.klinker,
    build(b) {
      b.room(2, 1, 6, 9, F.eiche, P.creme); // Wohnküche
      b.room(8, 1, 2, 9, F.fliesen, P.weiss); // Diele
      b.room(10, 1, 4, 3, F.fliesen, P.fliesenBlau); // Duschbad
      b.room(10, 4, 4, 6, F.eiche, P.salbei); // Wohnzimmer
      b.room(2, 1, 6, 4, F.teppich, P.rose, 1); // Eltern
      b.room(2, 5, 6, 5, F.eiche, P.lavendel, 1); // Lea
      b.room(8, 1, 2, 9, F.eiche, P.weiss, 1); // Flur
      b.room(10, 1, 4, 4, F.fliesen, P.fliesen, 1); // Bad
      b.room(10, 5, 4, 5, F.teppich, P.himmel, 1); // Tobi
      b.floor(8, 10, 2, 4, F.pflaster);
      b.doors([[8, 6, 1], [10, 7, 1], [11, 4, 0]]);
      b.open(HAUSTUER, 8, 10, 0);
      b.doors([[8, 2, 1], [8, 7, 1], [10, 7, 1], [10, 1, 1]], 'tuer-schlicht', 1);
      b.stairs('treppe-stufenweise', 9, 2);
      b.ps([
        ['kuehlschrank-frostbeule', 2, 1], ['kuechenzeile-schlicht', 3, 1], ['herd-omas-stolz', 4, 1], ['spuele-bauernglueck', 5, 1], ['spuelmaschine-blitzblank', 6, 1], ['kuechenzeile-schlicht', 7, 1],
        ['kaffee-morgenmuffel', 3, 1], ['mikrowelle-turbowaermer', 7, 1], ['muelleimer-schlucker', 2, 3, 1],
        ['esstisch-familienrund', 4, 5], ['stuhl-kantholz', 4, 4], ['stuhl-kantholz', 5, 4], ['stuhl-kantholz', 4, 7, 2], ['stuhl-kantholz', 5, 7, 2], ['stuhl-kantholz', 3, 5, 1], ['stuhl-kantholz', 6, 6, 3],
        ['pflanze-gummibaum-gustav', 2, 9], ['bild-familiencollage', 2, 6, 1], ['stehlampe-lichtsaeule', 7, 9], ['wanduhr-tickende-taube', 8, 3, 1],
        ['toilette-thron', 10, 1], ['waschbecken-klarspueler', 12, 1], ['spiegel-rundblick', 12, 1], ['dusche-regentropfen', 13, 1],
        ['sofa-fjordruhe', 13, 6, 3], ['tv-kinowand', 10, 5, 1], ['sessel-ohrenkuss', 11, 9, 2], ['pflanze-gummibaum-gustav', 13, 9], ['stereo-klangturm', 13, 4, 3], ['regal-buecherwurm', 13, 5, 3],
        ['briefkasten-postfuchs', 7, 13, 1], ['hochbeet-kraeuterburg', 15, 1], ['schaukel-himmelsstuermer', 15, 5], ['grill-glutkugel', 15, 10], ['gartenbank-parkruh', 14, 12],
        ['gartenlaterne-gluehwuermchen', 11, 12], ['pflanze-zitronenbaum', 3, 12],
      ]);
      b.ps(
        [
          ['doppelbett-himmelreich', 2, 1], ['nachttisch-nachtwache', 4, 1], ['kleiderschrank-raumwunder', 5, 1], ['spiegel-ankleide', 2, 4, 1],
          ['bett-nordlicht', 2, 5], ['gaming-pixelpalast', 4, 9, 2], ['kleiderschrank-ordnungsliebe', 7, 9, 2], ['egitarre-donnerhall', 2, 9, 2], ['bild-geometrie-senf', 4, 5], ['sitzsack-plumps', 6, 5],
          ['badewanne-muschel', 13, 1], ['dusche-wasserfall', 12, 1], ['toilette-schwebend', 10, 4, 2], ['waschtisch-doppelglanz', 11, 4, 2], ['spiegel-rundblick', 11, 4, 2],
          ['kinderbett-raketenstart', 13, 5], ['spielmatte-strassenteppich', 11, 8], ['spielkiste-schatzkiste', 13, 9, 2], ['schreibtisch-fleissbiene', 11, 5], ['laptop-klappflink', 11, 5],
        ],
        1,
      );
      b.windows('fenster-klarblick', 3);
    },
  },

  'home-townhouse': { size: [10, 14], ext: P.graublau, build: (b) => townhouse(b, 0) },
  'home-townhouse2': { size: [10, 14], ext: P.terra, build: (b) => townhouse(b, 1) },

  // Loft-WG im Hafen: drei Zimmer, großer Wohnraum, Katze
  'home-wg': {
    size: [18, 16],
    ext: P.klinker,
    build(b) {
      b.room(1, 1, 4, 4, F.dielen, P.himmel); // Kofi
      b.room(5, 1, 4, 4, F.dielen, P.lavendel); // Yuki
      b.room(9, 1, 4, 4, F.dielen, P.senf); // Ana
      b.room(13, 1, 4, 4, F.fliesen, P.fliesen); // Bad
      b.room(1, 5, 16, 7, F.beton, P.weiss); // Wohnküche
      b.floor(8, 12, 2, 4, F.pflaster);
      b.doors([[2, 5, 0], [6, 5, 0], [10, 5, 0], [14, 5, 0]]);
      b.open('tuer-bullauge', 8, 12, 0);
      b.ps([
        ['kuehlschrank-vorratskammer', 1, 6, 1], ['herd-kochfix', 1, 7, 1], ['kuechenzeile-schlicht', 1, 8, 1], ['spuele-plaetscher', 1, 9, 1], ['spuelmaschine-blitzblank', 1, 10, 1], ['muelleimer-schlucker', 1, 11, 1],
        ['kaffee-morgenmuffel', 1, 8, 1], ['kuecheninsel-treffpunkt', 3, 7, 1],
        ['esstisch-tafelrunde', 6, 8], ['stuhl-muschel', 6, 7], ['stuhl-muschel', 7, 7], ['stuhl-muschel', 6, 9, 2], ['stuhl-muschel', 7, 9, 2],
        ['sofa-fjordruhe', 12, 7], ['tv-kinowand', 12, 10, 2], ['sessel-korbwiege', 11, 9, 1], ['sitzsack-plumps', 15, 9, 3], ['regal-wandleiter', 16, 6, 3], ['stereo-vinylglueck', 16, 10, 3],
        ['pflanze-monstera-mia', 16, 11], ['kratzbaum-krallenturm', 15, 11, 2], ['katzenhoehle-kuschel', 14, 11], ['napf-futterbar', 4, 11, 2], ['schachtisch-denkpause', 9, 10],
        ['bild-abendrot', 3, 5], ['bild-geometrie-senf', 11, 5], ['stehlampe-bogenlicht', 16, 8],
        ['bett-nordlicht', 1, 1], ['kleiderschrank-ordnungsliebe', 4, 1], ['schreibtisch-hochkant', 4, 3, 3], ['laptop-klappflink', 4, 3, 3], ['egitarre-donnerhall', 3, 1],
        ['doppelbett-futonia', 7, 1], ['regal-buecherwurm', 5, 1], ['arbeitsplatz-homeoffice', 5, 3, 1],
        ['bett-schlummerkiste', 12, 1], ['kommode-schubladenwunder', 9, 1], ['staffelei-atelier', 9, 4, 1], ['spiegel-ankleide', 9, 3, 1],
        ['toilette-thron', 13, 1], ['dusche-wasserfall', 16, 1], ['waschtisch-doppelglanz', 16, 3, 3], ['spiegel-rundblick', 16, 3, 3], ['toilette-schwebend', 13, 4, 1],
        ['briefkasten-postfuchs', 7, 14, 1], ['hochbeet-kraeuterburg', 11, 13], ['gartenbank-parkruh', 14, 13], ['gartenlaterne-gluehwuermchen', 5, 13],
      ]);
      b.windows('fenster-sprosse', 3);
    },
  },

  // Musterhaus „Hafenblick“: Loft mit Dachterrasse
  'home-loft': {
    size: [18, 16],
    ext: P.anthrazit,
    build(b) {
      b.room(2, 1, 12, 10, F.beton, P.weiss); // Loft
      b.room(2, 1, 4, 4, F.fliesen, P.fliesenBlau); // Bad
      b.room(8, 1, 6, 5, F.eiche, P.salbei, 1); // Schlafzimmer
      b.room(8, 6, 6, 5, F.eiche, P.himmel, 1); // Gäste/Arbeit
      b.floor(2, 1, 6, 10, F.deck, 1); // Dachterrasse
      b.rail(2, 1, 6, 10, 1);
      b.floor(8, 11, 2, 5, F.pflaster);
      b.open('tuer-glaslicht', 4, 5, 0);
      b.open(HAUSTUER, 8, 11, 0);
      b.doors([[8, 3, 1], [8, 8, 1]], 'tuer-glaslicht', 1);
      b.stairs('treppe-schwebend', 13, 2);
      b.ps([
        ['kuehlschrank-polarstern', 6, 1], ['kuechenzeile-marmor', 7, 1], ['herd-feuerwerk', 8, 1], ['kuechenzeile-marmor', 9, 1], ['spuele-plaetscher', 10, 1], ['spuelmaschine-glanzleistung', 11, 1],
        ['muelleimer-schlucker', 12, 1], ['kaffee-bohnenglueck', 7, 1], ['mikrowelle-ofenfix', 9, 1], ['kuecheninsel-treffpunkt', 8, 3],
        ['esstisch-tafelrunde', 5, 7], ['stuhl-gutsherr', 5, 6], ['stuhl-gutsherr', 6, 6], ['stuhl-gutsherr', 5, 8, 2], ['stuhl-gutsherr', 6, 8, 2],
        ['sofa-samtsalon', 13, 7, 3], ['tv-kinowand', 10, 7, 1], ['sessel-ohrenkuss', 11, 10, 2], ['stehlampe-bogenlicht', 13, 10], ['pflanze-monstera-mia', 2, 10], ['pflanze-gummibaum-gustav', 13, 6],
        ['jukebox-groschengrab', 2, 5, 1], ['regal-wandleiter', 2, 7, 1], ['bild-geometrie-senf', 2, 9, 1],
        ['toilette-schwebend', 2, 1], ['dusche-wasserfall', 5, 1], ['badewanne-muschel', 5, 2], ['waschtisch-doppelglanz', 2, 4, 2], ['spiegel-rundblick', 2, 4, 2],
        ['briefkasten-postfuchs', 7, 14, 1], ['gartenlaterne-gluehwuermchen', 11, 12], ['pflanze-zitronenbaum', 4, 13],
      ]);
      b.ps(
        [
          ['doppelbett-himmelreich', 9, 1], ['nachttisch-nachtwache', 11, 1], ['kleiderschrank-raumwunder', 9, 5, 2], ['spiegel-ankleide', 8, 5, 1], ['stehlampe-lichtsaeule', 12, 5],
          ['bett-nordlicht', 13, 6], ['arbeitsplatz-homeoffice', 10, 10, 2], ['regal-buecherwurm', 9, 6],
          ['teleskop-sternengucker', 3, 2], ['liegestuhl-sonnenanbeter', 2, 4, 1], ['gartentisch-terrassenrunde', 5, 6], ['gartenbank-parkruh', 4, 8, 2], ['grill-glutkugel', 6, 10, 2],
          ['pflanze-zitronenbaum', 2, 10], ['gartenlaterne-gluehwuermchen', 7, 1],
        ],
        1,
      );
      b.windows('fenster-panorama', 3);
    },
  },

  // Leeres Grundstück: nur ein Briefkasten an der Straße
  empty: {
    ext: P.putz,
    build(b) {
      b.put('briefkasten-postfuchs', Math.floor(b.width / 2) - 2, b.depth - 1, 1);
    },
  },

  // ---------- Gemeinschaft & Arbeit ----------
  park: {
    size: [22, 20],
    ext: P.putz,
    build(b) {
      b.floor(10, 0, 2, 20, F.kies);
      b.floor(0, 9, 22, 2, F.kies);
      b.water(3, 2, 5, 4);
      b.ps([
        ['work-marktbrunnen', 10, 9], ['work-parkbank-stadt', 3, 7, 2], ['work-parkbank-stadt', 6, 7, 2], ['work-angelsteg', 5, 6, 2],
        ['work-parkbank-stadt', 8, 12, 1], ['work-parkbank-stadt', 13, 12, 3], ['work-parkbank-stadt', 1, 11],
        ['schachtisch-denkpause', 14, 4], ['schachtisch-denkpause', 18, 4],
        ['grill-grillmeister', 15, 14], ['grill-glutkugel', 19, 14], ['gartentisch-terrassenrunde', 17, 17], ['gartenbank-parkruh', 14, 17], ['gartenbank-parkruh', 18, 17],
        ['schaukel-himmelsstuermer', 3, 14], ['rutsche-juchhu', 7, 13], ['spielkiste-schatzkiste', 1, 14, 1],
        ['pflanze-zitronenbaum', 1, 1], ['pflanze-zitronenbaum', 20, 1], ['pflanze-zitronenbaum', 13, 1], ['pflanze-zitronenbaum', 20, 8], ['pflanze-zitronenbaum', 1, 18], ['pflanze-zitronenbaum', 20, 18],
        ['pflanze-gummibaum-gustav', 16, 8], ['pflanze-gummibaum-gustav', 8, 1],
        ['work-strassenlaterne', 9, 3], ['work-strassenlaterne', 12, 3], ['work-strassenlaterne', 9, 16], ['work-strassenlaterne', 12, 16], ['work-strassenlaterne', 2, 8],
        ['muelltonne-trennkuenstler', 12, 18, 3],
      ]);
    },
  },

  school: {
    size: [15, 20],
    ext: P.klinker,
    build(b) {
      b.room(1, 1, 8, 9, F.lino, P.creme); // Klassenzimmer
      b.room(9, 1, 5, 5, F.teppich, P.salbei); // Lehrerzimmer
      b.room(9, 6, 5, 4, F.eiche, P.himmel); // Leseecke
      b.room(1, 10, 13, 6, F.lino, P.weiss); // Aula
      b.room(1, 10, 3, 3, F.fliesen, P.fliesen); // WC 1
      b.room(1, 13, 3, 3, F.fliesen, P.fliesen); // WC 2
      b.floor(6, 16, 2, 4, F.pflaster);
      b.doors([[6, 10, 0], [10, 6, 0], [11, 10, 0], [4, 11, 1], [4, 14, 1]]);
      b.open(HAUSTUER, 7, 16, 0);
      const desks: Item[] = [];
      for (const z of [3, 5, 7]) for (const x of [2, 3, 5, 6]) desks.push(['work-schulbank', x, z]);
      b.ps([
        ['work-schultafel', 4, 1], ...desks, ['schreibtisch-hochkant', 7, 1], ['laptop-klappflink', 8, 1], ['regal-buecherwurm', 8, 9, 2], ['globus-weltenbummler', 1, 9], ['pflanze-farnwedel', 1, 1], ['wanduhr-tickende-taube', 2, 9, 2],
        ['schreibtisch-fleissbiene', 9, 1], ['computer-rechenknecht', 9, 1], ['schreibtisch-hochkant', 12, 1], ['laptop-klappflink', 12, 1], ['kuechenzeile-schlicht', 13, 4, 3], ['kaffee-morgenmuffel', 13, 4, 3], ['sofa-wolkenbank', 9, 3, 1],
        ['regal-buecherwurm', 13, 6, 3], ['regal-buecherwurm', 13, 7, 3], ['regal-buecherwurm', 13, 8, 3], ['sitzsack-plumps', 9, 7, 1], ['sessel-ohrenkuss', 9, 9, 1], ['pflanze-monstera-mia', 9, 6],
        ['work-parkbank-stadt', 10, 15, 2], ['schachtisch-denkpause', 12, 12], ['muelltonne-trennkuenstler', 13, 15, 2], ['pflanze-gummibaum-gustav', 4, 15], ['regal-wandleiter', 8, 10],
        ['toilette-thron', 1, 10], ['toilette-thron', 2, 10], ['waschbecken-klarspueler', 1, 12, 1], ['spiegel-rundblick', 1, 12, 1],
        ['toilette-thron', 1, 13], ['toilette-thron', 2, 13], ['waschbecken-klarspueler', 1, 15, 1], ['spiegel-rundblick', 1, 15, 1],
        ['work-parkbank-stadt', 1, 18], ['work-parkbank-stadt', 11, 18], ['hochbeet-kraeuterburg', 9, 17], ['work-strassenlaterne', 5, 17], ['work-strassenlaterne', 8, 17], ['pflanze-zitronenbaum', 13, 17],
      ]);
      b.windows('fenster-sprosse', 2);
    },
  },

  playground: {
    size: [20, 6],
    ext: P.putz,
    build(b) {
      b.floor(9, 0, 2, 6, F.kies);
      b.ps([
        ['schaukel-himmelsstuermer', 1, 1], ['schaukel-himmelsstuermer', 4, 1], ['rutsche-juchhu', 7, 1], ['gartenbank-parkruh', 1, 5, 2], ['gartenbank-parkruh', 5, 5, 2], ['spielkiste-schatzkiste', 3, 4],
        ['gemuesebeet-gruenzeug', 12, 1], ['gemuesebeet-gruenzeug', 15, 1], ['hochbeet-kraeuterburg', 12, 3], ['hochbeet-kraeuterburg', 15, 3],
        ['gartenlaterne-gluehwuermchen', 11, 5], ['gartenlaterne-gluehwuermchen', 18, 5], ['muelltonne-trennkuenstler', 8, 0], ['pflanze-zitronenbaum', 19, 0], ['gartenbank-rosenbogen', 18, 2, 3],
      ]);
    },
  },

  townhall: {
    size: [22, 18],
    ext: P.putzGelb,
    build(b) {
      b.room(1, 1, 6, 11, F.eiche, P.creme); // Bürgerbüro
      b.room(15, 1, 6, 11, F.eiche, P.himmel); // Technikbüro
      b.room(7, 1, 4, 5, F.fliesen, P.fliesen); // WC
      b.room(11, 1, 4, 5, F.eiche, P.holz); // Ratssaal
      b.room(7, 6, 8, 6, F.marmor, P.weiss); // Foyer
      b.floor(1, 12, 20, 6, F.pflaster);
      b.doors([[7, 8, 1], [15, 8, 1], [8, 6, 0], [13, 6, 0]]);
      b.open(HAUSTUER, 10, 12, 0);
      b.ps([
        ['arbeitsplatz-homeoffice', 1, 1], ['arbeitsplatz-homeoffice', 4, 1], ['schreibtisch-fleissbiene', 1, 4], ['computer-rechenknecht', 1, 4], ['schreibtisch-fleissbiene', 4, 4], ['computer-rechenknecht', 4, 4],
        ['kuechenzeile-schlicht', 6, 6, 3], ['kaffee-morgenmuffel', 6, 6, 3], ['stuhl-kantholz', 1, 8, 1], ['stuhl-kantholz', 1, 9, 1], ['stuhl-kantholz', 1, 10, 1], ['regal-buecherwurm', 6, 2, 3],
        ['pflanze-gummibaum-gustav', 6, 11], ['bild-abendrot', 3, 11, 2],
        ['arbeitsplatz-homeoffice', 15, 1], ['arbeitsplatz-homeoffice', 18, 1], ['werkbank-tueftelecke', 19, 4], ['schreibtisch-hochkant', 15, 4], ['computer-rechenknecht', 15, 4], ['laptop-klappflink', 16, 4],
        ['regal-buecherwurm', 20, 8, 3], ['stuhl-kantholz', 20, 10, 3], ['pflanze-gummibaum-gustav', 15, 11],
        ['toilette-thron', 7, 1], ['toilette-thron', 8, 1], ['toilette-thron', 10, 1], ['waschbecken-klarspueler', 7, 4, 1], ['spiegel-rundblick', 7, 4, 1], ['waschbecken-klarspueler', 10, 4, 3], ['spiegel-rundblick', 10, 4, 3],
        ['esstisch-tafelrunde', 12, 3], ['stuhl-gutsherr', 12, 2], ['stuhl-gutsherr', 13, 2], ['stuhl-gutsherr', 12, 4, 2], ['stuhl-gutsherr', 13, 4, 2], ['bild-abendrot', 12, 1],
        ['standuhr-grossvater', 7, 6], ['bild-familiencollage', 9, 6], ['work-parkbank-stadt', 12, 9], ['pflanze-gummibaum-gustav', 7, 11], ['pflanze-gummibaum-gustav', 14, 11],
        ['work-marktbrunnen', 10, 14], ['work-parkbank-stadt', 7, 14, 1], ['work-parkbank-stadt', 14, 14, 3],
        ['work-strassenlaterne', 5, 12], ['work-strassenlaterne', 16, 12], ['work-strassenlaterne', 5, 17], ['work-strassenlaterne', 16, 17],
        ['pflanze-zitronenbaum', 2, 13], ['pflanze-zitronenbaum', 19, 13], ['pflanze-zitronenbaum', 2, 16], ['pflanze-zitronenbaum', 19, 16],
      ]);
      b.windows('fenster-rundbogen', 2);
    },
  },

  library: {
    size: [15, 18],
    ext: P.klinker,
    build(b) {
      b.room(1, 1, 13, 9, F.eiche, P.creme); // Lesesaal
      b.room(4, 10, 10, 4, F.marmor, P.weiss); // Foyer mit Computern
      b.room(1, 10, 3, 4, F.fliesen, P.fliesen); // WC
      b.floor(6, 14, 2, 4, F.pflaster);
      b.doors([[6, 10, 0], [11, 10, 0], [4, 12, 1]]);
      b.open(HAUSTUER, 7, 14, 0);
      b.ps([
        ['regal-wandleiter', 1, 1], ['regal-wandleiter', 3, 1], ['regal-wandleiter', 5, 1], ['regal-wandleiter', 8, 1], ['regal-wandleiter', 10, 1], ['regal-wandleiter', 12, 1],
        ['regal-buecherwurm', 1, 4, 1], ['regal-buecherwurm', 1, 5, 1], ['regal-buecherwurm', 1, 6, 1], ['regal-buecherwurm', 13, 4, 3], ['regal-buecherwurm', 13, 5, 3], ['regal-buecherwurm', 13, 6, 3],
        ['esstisch-tafelrunde', 4, 5], ['stuhl-kantholz', 4, 4], ['stuhl-kantholz', 5, 4], ['stuhl-kantholz', 4, 6, 2], ['stuhl-kantholz', 5, 6, 2],
        ['esstisch-tafelrunde', 8, 5], ['stuhl-kantholz', 8, 4], ['stuhl-kantholz', 9, 4], ['stuhl-kantholz', 8, 6, 2], ['stuhl-kantholz', 9, 6, 2],
        ['tischlampe-leselicht', 5, 5], ['tischlampe-leselicht', 9, 5], ['sessel-ohrenkuss', 3, 8, 2], ['sessel-ohrenkuss', 11, 8, 2], ['schachtisch-denkpause', 7, 8], ['globus-weltenbummler', 13, 9], ['pflanze-farnwedel', 1, 9],
        ['arbeitsplatz-homeoffice', 13, 10, 3], ['arbeitsplatz-homeoffice', 13, 12, 3], ['schreibtisch-hochkant', 9, 13, 2], ['computer-rechenknecht', 9, 13, 2], ['laptop-klappflink', 10, 13, 2], ['pflanze-monstera-mia', 4, 13],
        ['toilette-thron', 1, 10], ['toilette-thron', 3, 10], ['waschbecken-klarspueler', 1, 13, 1], ['spiegel-rundblick', 1, 13, 1],
        ['work-parkbank-stadt', 2, 15], ['work-parkbank-stadt', 10, 15], ['work-strassenlaterne', 5, 15], ['work-strassenlaterne', 9, 16], ['pflanze-zitronenbaum', 1, 17], ['pflanze-zitronenbaum', 13, 17],
      ]);
      b.windows('fenster-rundbogen', 2);
    },
  },

  clinic: {
    size: [18, 17],
    ext: P.weiss,
    build(b) {
      for (const x0 of [1, 5, 9]) b.room(x0, 1, 4, 6, F.lino, P.mint); // Behandlungsräume
      b.room(13, 1, 4, 6, F.lino, P.himmel); // Apotheke
      b.room(1, 7, 16, 2, F.lino, P.weiss); // Flur
      b.room(1, 9, 4, 4, F.fliesen, P.fliesen); // WC
      b.room(5, 9, 8, 4, F.lino, P.creme); // Empfang & Warten
      b.room(13, 9, 4, 4, F.eiche, P.salbei); // Personalraum
      b.floor(8, 13, 2, 4, F.pflaster);
      b.doors([[2, 7, 0], [6, 7, 0], [10, 7, 0], [14, 7, 0], [2, 9, 0], [6, 9, 0], [11, 9, 0], [14, 9, 0]]);
      b.open('tuer-glaslicht', 9, 13, 0);
      for (const x0 of [1, 5, 9])
        b.ps([
          ['work-untersuchungsliege', x0, 1], ['work-medikamentenschrank', x0 + 3, 1], ['waschbecken-klarspueler', x0 + 3, 3, 3], ['schreibtisch-hochkant', x0 + 2, 6, 2], ['computer-rechenknecht', x0 + 3, 6, 2], ['stuhl-kantholz', x0, 5, 1],
        ]);
      b.ps([
        ['work-medikamentenschrank', 13, 1], ['work-medikamentenschrank', 14, 1], ['work-medikamentenschrank', 15, 1], ['work-kassentresen', 14, 4], ['pflanze-farnwedel', 16, 6],
        ['pflanze-farnwedel', 1, 8], ['pflanze-gummibaum-gustav', 16, 7], ['wanduhr-tickende-taube', 8, 7],
        ['toilette-thron', 1, 12, 2], ['toilette-thron', 4, 12, 2], ['waschbecken-klarspueler', 4, 9, 3], ['spiegel-rundblick', 4, 9, 3],
        ['work-kassentresen', 7, 10], ['computer-rechenknecht', 7, 10, 2], ['stuhl-muschel', 5, 10, 1], ['stuhl-muschel', 5, 11, 1], ['stuhl-muschel', 5, 12, 1],
        ['stuhl-muschel', 12, 10, 3], ['stuhl-muschel', 12, 11, 3], ['stuhl-muschel', 12, 12, 3], ['pflanze-gummibaum-gustav', 10, 12], ['aquarium-korallengarten', 9, 9],
        ['sofa-wolkenbank', 15, 12, 2], ['kuechenzeile-schlicht', 13, 12, 1], ['kaffee-morgenmuffel', 13, 12, 1],
        ['work-parkbank-stadt', 3, 14], ['work-parkbank-stadt', 13, 14], ['work-strassenlaterne', 6, 14], ['work-strassenlaterne', 11, 14], ['pflanze-zitronenbaum', 1, 15], ['pflanze-zitronenbaum', 16, 15],
      ]);
      b.windows('fenster-klarblick', 2);
    },
  },

  gallery: {
    size: [19, 17],
    ext: P.terra,
    build(b) {
      b.room(1, 5, 17, 8, F.eiche, P.weiss); // Ausstellung
      b.room(1, 1, 9, 4, F.beton, P.creme); // Atelier
      b.room(10, 1, 4, 4, F.eiche, P.salbei); // Büro
      b.room(14, 1, 4, 4, F.fliesen, P.fliesen); // WC
      b.floor(8, 13, 2, 4, F.pflaster);
      b.doors([[5, 5, 0], [11, 5, 0], [15, 5, 0]]);
      b.open('tuer-glaslicht', 9, 13, 0);
      const art = ['bild-abendrot', 'bild-geometrie-senf', 'bild-familiencollage'];
      const walls: Item[] = [
        ...[2, 4, 6, 12, 14, 16].map((x, i): Item => [art[i % 3]!, x, 12, 2]),
        ...[3, 7, 13, 17].map((x, i): Item => [art[(i + 1) % 3]!, x, 5, 0]),
        [art[0]!, 1, 7, 1], [art[1]!, 1, 9, 1], [art[2]!, 17, 7, 3], [art[0]!, 17, 9, 3],
      ];
      b.ps([
        ...walls, ['skulptur-gedankenknoten', 4, 8], ['skulptur-gedankenknoten', 9, 8], ['skulptur-gedankenknoten', 12, 7], ['fluegel-mondschein', 14, 9],
        ['work-parkbank-stadt', 3, 11, 2], ['work-parkbank-stadt', 11, 11, 2], ['pflanze-monstera-mia', 1, 12], ['pflanze-gummibaum-gustav', 17, 12],
        ['staffelei-atelier', 1, 1], ['staffelei-pinselstrich', 3, 1], ['staffelei-atelier', 7, 1], ['staffelei-pinselstrich', 9, 1], ['regal-wandleiter', 2, 4, 2], ['waschbecken-klarspueler', 8, 4, 2], ['kamera-augenblick', 5, 1],
        ['schreibtisch-fleissbiene', 12, 1], ['computer-rechenknecht', 12, 1], ['regal-buecherwurm', 10, 1],
        ['toilette-thron', 14, 1], ['toilette-thron', 17, 1], ['waschbecken-klarspueler', 17, 4, 3], ['spiegel-rundblick', 17, 4, 3],
        ['skulptur-gedankenknoten', 4, 14], ['skulptur-gedankenknoten', 14, 14], ['work-parkbank-stadt', 1, 15], ['work-strassenlaterne', 6, 14], ['work-strassenlaterne', 11, 14], ['pflanze-zitronenbaum', 17, 15],
      ]);
      b.windows('fenster-panorama', 4);
    },
  },

  restaurant: {
    size: [16, 15],
    ext: P.terra,
    build(b) {
      b.room(1, 5, 14, 6, F.terra, P.creme); // Gastraum
      b.room(1, 1, 8, 4, F.fliesen, P.weiss); // Küche
      b.room(9, 1, 3, 4, F.fliesen, P.fliesen); // WC 1
      b.room(12, 1, 3, 4, F.fliesen, P.fliesen); // WC 2
      b.floor(1, 11, 14, 4, F.terra);
      b.doors([[5, 5, 0], [10, 5, 0], [13, 5, 0]]);
      b.open('tuer-landhaus-kassette', 7, 11, 0);
      b.ps([
        ['kuehlschrank-vorratskammer', 1, 1], ['kuehlschrank-frostbeule', 2, 1], ['herd-feuerwerk', 3, 1], ['herd-feuerwerk', 4, 1], ['kuechenzeile-marmor', 5, 1], ['spuele-bauernglueck', 6, 1],
        ['spuelmaschine-glanzleistung', 7, 1], ['kuechenzeile-marmor', 8, 1], ['mikrowelle-ofenfix', 5, 1], ['kaffee-bohnenglueck', 8, 1], ['kuecheninsel-treffpunkt', 3, 3], ['muelltonne-trennkuenstler', 8, 4, 3],
        ['work-kassentresen', 11, 7], ['kaffee-bohnenglueck', 11, 7],
        ['esstisch-tafelrunde', 2, 7], ['stuhl-gutsherr', 2, 6], ['stuhl-gutsherr', 3, 6], ['stuhl-gutsherr', 2, 8, 2], ['stuhl-gutsherr', 3, 8, 2],
        ['esstisch-tafelrunde', 6, 7], ['stuhl-gutsherr', 6, 6], ['stuhl-gutsherr', 7, 6], ['stuhl-gutsherr', 6, 8, 2], ['stuhl-gutsherr', 7, 8, 2],
        ['esstisch-bistro', 2, 10], ['stuhl-gutsherr', 1, 10, 1], ['stuhl-gutsherr', 3, 10, 3], ['esstisch-bistro', 12, 10], ['stuhl-gutsherr', 11, 10, 1], ['stuhl-gutsherr', 13, 10, 3],
        ['vase-tulpentraum', 2, 7], ['kerzen-abendstimmung', 6, 7], ['vase-tulpentraum', 2, 10], ['kerzen-abendstimmung', 12, 10],
        ['pflanze-zitronenbaum', 1, 5], ['pflanze-zitronenbaum', 14, 5], ['wandleuchte-kerzenschein', 14, 8, 3], ['bild-abendrot', 4, 10, 2],
        ['toilette-thron', 9, 1], ['waschbecken-klarspueler', 11, 1], ['spiegel-rundblick', 11, 1],
        ['toilette-thron', 12, 1], ['waschbecken-klarspueler', 14, 1], ['spiegel-rundblick', 14, 1],
        ['gartentisch-terrassenrunde', 3, 12], ['stuhl-gutsherr', 2, 12, 1], ['stuhl-gutsherr', 4, 12, 3], ['gartentisch-terrassenrunde', 11, 12], ['stuhl-gutsherr', 10, 12, 1], ['stuhl-gutsherr', 12, 12, 3],
        ['pflanze-zitronenbaum', 1, 14], ['pflanze-zitronenbaum', 14, 14], ['gartenlaterne-gluehwuermchen', 5, 14], ['gartenlaterne-gluehwuermchen', 10, 14],
      ]);
      b.windows('fenster-sprosse', 2);
    },
  },

  gym: {
    size: [21, 15],
    ext: P.anthrazit,
    build(b) {
      b.room(1, 1, 13, 11, F.gummi, P.weiss); // Trainingshalle
      b.room(14, 1, 6, 5, F.eiche, P.lavendel); // Yogaraum
      b.room(14, 6, 6, 6, F.fliesen, P.fliesenBlau); // Umkleide & Duschen
      b.floor(9, 12, 2, 3, F.pflaster);
      b.doors([[14, 3, 1], [14, 8, 1]]);
      b.open('tuer-glaslicht', 10, 12, 0);
      b.ps([
        ['laufband-kilometerfresser', 1, 1], ['laufband-marathon', 2, 1], ['laufband-kilometerfresser', 3, 1], ['laufband-marathon', 4, 1],
        ['hantelbank-eisenwille', 7, 1], ['hantelbank-eisenwille', 9, 1], ['hantelturm-kurzhantel', 11, 1], ['hantelturm-kurzhantel', 12, 1],
        ['boxsack-prellbock', 1, 6, 1], ['boxsack-galgen', 1, 9, 1], ['gartenbank-parkruh', 6, 11, 2], ['stereo-klangturm', 13, 6, 3], ['pflanze-gummibaum-gustav', 13, 11],
        ['spiegel-ankleide', 3, 11, 2], ['spiegel-ankleide', 5, 11, 2],
        ['yogamatte-sonnengruss', 16, 1], ['yogamatte-sonnengruss', 18, 1], ['yogamatte-lotusinsel', 16, 4], ['yogamatte-lotusinsel', 18, 4], ['stereo-vinylglueck', 14, 5, 1], ['pflanze-farnwedel', 14, 1],
        ['dusche-regentropfen', 17, 6], ['dusche-wasserfall', 18, 6], ['dusche-regentropfen', 19, 6], ['toilette-thron', 19, 9, 3], ['toilette-thron', 19, 10, 3],
        ['waschtisch-doppelglanz', 15, 11, 2], ['spiegel-rundblick', 15, 11, 2], ['kleiderschrank-raumwunder', 14, 6],
        ['work-strassenlaterne', 7, 13], ['work-strassenlaterne', 12, 13], ['pflanze-zitronenbaum', 1, 13], ['pflanze-zitronenbaum', 19, 13],
      ]);
      b.windows('fenster-panorama', 3);
    },
  },

  shop: {
    size: [16, 14],
    ext: P.putzGelb,
    build(b) {
      b.room(1, 4, 14, 6, F.eiche, P.weiss); // Verkaufsraum
      b.room(1, 1, 6, 3, F.beton, P.beton); // Lager
      b.room(7, 1, 3, 3, F.fliesen, P.fliesen); // WC
      b.room(10, 1, 5, 3, F.beton, P.holz); // Werkstatt
      b.floor(7, 10, 2, 4, F.pflaster);
      b.doors([[3, 4, 0], [8, 4, 0], [12, 4, 0]]);
      b.open('tuer-glaslicht', 7, 10, 0);
      b.ps([
        ['work-ladenregal', 5, 4], ['work-ladenregal', 9, 4], ['work-ladenregal', 13, 4], ['work-ladenregal', 9, 7], ['work-ladenregal', 12, 7], ['work-kassentresen', 3, 7],
        ['spiegel-ankleide', 1, 6, 1], ['regal-buecherwurm', 1, 8, 1], ['pflanze-monstera-mia', 14, 9],
        ['regal-wandleiter', 1, 1], ['regal-wandleiter', 5, 1],
        ['toilette-thron', 7, 1], ['waschbecken-klarspueler', 9, 1], ['spiegel-rundblick', 9, 1],
        ['werkbank-tueftelecke', 10, 1], ['werkbank-tueftelecke', 13, 1],
        ['work-parkbank-stadt', 2, 11], ['work-strassenlaterne', 5, 11], ['work-strassenlaterne', 10, 11], ['pflanze-zitronenbaum', 13, 12],
      ]);
      b.windows('fenster-panorama', 3);
    },
  },

  cafe: {
    size: [14, 14],
    ext: P.mint,
    build(b) {
      b.room(1, 4, 12, 6, F.schach, P.creme); // Gastraum
      b.room(1, 1, 6, 3, F.fliesen, P.weiss); // Küche
      b.room(7, 1, 3, 3, F.eiche, P.salbei); // Personal
      b.room(10, 1, 3, 3, F.fliesen, P.fliesen); // WC
      b.floor(1, 10, 12, 4, F.deck);
      b.doors([[4, 4, 0], [8, 4, 0], [11, 4, 0]]);
      b.open('tuer-glaslicht', 7, 10, 0);
      b.ps([
        ['kuehlschrank-polarstern', 1, 1], ['herd-kochfix', 2, 1], ['spuele-plaetscher', 3, 1], ['kuechenzeile-schlicht', 4, 1], ['mikrowelle-turbowaermer', 4, 1], ['kuechenzeile-schlicht', 6, 1],
        ['kuechenzeile-marmor', 1, 4], ['work-siebtraeger', 1, 4], ['kuechenzeile-marmor', 2, 4], ['kaffee-bohnenglueck', 2, 4], ['kuehlschrank-polarstern', 3, 4], ['work-kassentresen', 2, 6],
        ['esstisch-bistro', 7, 6], ['stuhl-muschel', 6, 6, 1], ['stuhl-muschel', 8, 6, 3], ['esstisch-bistro', 10, 6], ['stuhl-muschel', 9, 6, 1], ['stuhl-muschel', 11, 6, 3],
        ['esstisch-tafelrunde', 9, 8], ['stuhl-muschel', 9, 7], ['stuhl-muschel', 10, 7], ['stuhl-muschel', 9, 9, 2], ['stuhl-muschel', 10, 9, 2],
        ['sofa-wolkenbank', 9, 4], ['vase-tulpentraum', 7, 6], ['vase-tulpentraum', 10, 6], ['pflanze-zitronenbaum', 12, 9], ['pflanze-monstera-mia', 1, 9], ['bild-abendrot', 5, 9, 2],
        ['kleiderschrank-raumwunder', 7, 1], ['stuhl-kantholz', 9, 3, 2],
        ['toilette-thron', 10, 1], ['waschbecken-klarspueler', 12, 1], ['spiegel-rundblick', 12, 1],
        ['gartentisch-terrassenrunde', 3, 11], ['stuhl-muschel', 2, 11, 1], ['stuhl-muschel', 4, 11, 3], ['gartentisch-terrassenrunde', 10, 11], ['stuhl-muschel', 9, 11, 1], ['stuhl-muschel', 11, 11, 3],
        ['gartenlaterne-gluehwuermchen', 1, 13], ['gartenlaterne-gluehwuermchen', 12, 13],
      ]);
      b.windows('fenster-panorama', 3);
    },
  },

  bar: {
    size: [14, 14],
    ext: P.anthrazit,
    build(b) {
      b.room(1, 4, 12, 7, F.dielen, P.holz); // Bar
      b.room(1, 1, 6, 3, F.beton, P.beton); // Lager
      b.room(7, 1, 3, 3, F.fliesen, P.fliesen); // WC 1
      b.room(10, 1, 3, 3, F.fliesen, P.fliesen); // WC 2
      b.floor(6, 11, 2, 3, F.pflaster);
      b.doors([[3, 4, 0], [8, 4, 0], [11, 4, 0]]);
      b.open('tuer-bullauge', 7, 11, 0);
      b.ps([
        ['work-bartheke', 2, 6], ['kuechenzeile-schlicht', 1, 4], ['kuehlschrank-frostbeule', 2, 4], ['spuele-plaetscher', 4, 4], ['kuechenzeile-schlicht', 5, 4],
        ['work-tanzflaeche', 8, 6], ['jukebox-groschengrab', 12, 7, 3],
        ['esstisch-bistro', 2, 9], ['barhocker-tresenhuepfer', 1, 9, 1], ['barhocker-tresenhuepfer', 3, 9, 3], ['esstisch-bistro', 5, 9], ['barhocker-tresenhuepfer', 4, 9, 1], ['barhocker-tresenhuepfer', 6, 9, 3],
        ['sofa-samtsalon', 9, 10, 2], ['pflanze-monstera-mia', 12, 5], ['wandleuchte-lichtband', 1, 7, 1], ['wandleuchte-lichtband', 12, 9, 3], ['kerzen-abendstimmung', 2, 9],
        ['regal-wandleiter', 1, 1], ['kuehlschrank-vorratskammer', 5, 1], ['muelltonne-trennkuenstler', 6, 1],
        ['toilette-thron', 7, 1], ['waschbecken-klarspueler', 9, 1], ['spiegel-rundblick', 9, 1],
        ['toilette-thron', 10, 1], ['waschbecken-klarspueler', 12, 1], ['spiegel-rundblick', 12, 1],
        ['work-strassenlaterne', 4, 12], ['work-strassenlaterne', 9, 12], ['gartenbank-parkruh', 1, 12], ['pflanze-zitronenbaum', 12, 12],
      ]);
      b.windows('fenster-bullauge', 3);
    },
  },

  market: {
    size: [18, 20],
    ext: P.mint,
    build(b) {
      b.room(1, 3, 16, 7, F.fliesen, P.weiss); // Verkaufsraum
      b.room(1, 1, 12, 2, F.beton, P.beton); // Lager
      b.room(13, 1, 4, 2, F.fliesen, P.fliesen); // WC
      b.floor(0, 10, 18, 10, F.pflaster);
      b.doors([[6, 3, 0], [14, 3, 0]]);
      b.doors([[8, 10, 0], [13, 10, 0]], 'tuer-glaslicht');
      b.ps([
        ['work-ladenregal', 1, 3], ['work-ladenregal', 3, 3], ['work-ladenregal', 8, 3], ['work-ladenregal', 10, 3], ['work-ladenregal', 12, 3], ['work-ladenregal', 15, 3],
        ['work-ladenregal', 6, 5], ['work-ladenregal', 13, 5], ['work-kassentresen', 3, 7], ['work-kassentresen', 10, 7], ['pflanze-zitronenbaum', 1, 9], ['pflanze-zitronenbaum', 16, 9],
        ['regal-wandleiter', 1, 1], ['regal-wandleiter', 3, 1], ['regal-wandleiter', 10, 1],
        ['toilette-thron', 13, 1], ['waschbecken-klarspueler', 16, 1], ['spiegel-rundblick', 16, 1],
        ['work-marktbrunnen', 8, 14], ['work-ladenregal', 2, 12], ['work-ladenregal', 2, 16], ['work-ladenregal', 13, 12], ['work-ladenregal', 13, 16], ['work-kassentresen', 5, 12],
        ['work-parkbank-stadt', 11, 14, 3], ['work-parkbank-stadt', 6, 14, 1],
        ['work-strassenlaterne', 0, 10], ['work-strassenlaterne', 17, 10], ['work-strassenlaterne', 0, 19], ['work-strassenlaterne', 17, 19], ['pflanze-zitronenbaum', 5, 18], ['pflanze-zitronenbaum', 12, 18],
      ]);
      b.windows('fenster-panorama', 3);
    },
  },

  radio: {
    size: [18, 20],
    ext: P.graublau,
    build(b) {
      b.room(1, 1, 6, 6, F.teppich, P.anthrazit); // Studio
      b.room(7, 1, 4, 6, F.beton, P.beton); // Technik
      b.room(11, 1, 6, 6, F.eiche, P.weiss); // Redaktion
      b.room(1, 7, 4, 7, F.fliesen, P.fliesen); // WC
      b.room(5, 7, 12, 7, F.eiche, P.creme); // Foyer & Teeküche
      b.floor(8, 14, 2, 6, F.pflaster);
      b.doors([[6, 7, 0], [8, 7, 0], [13, 7, 0], [5, 10, 1]]);
      b.open('tuer-glaslicht', 8, 14, 0);
      b.ps([
        ['work-moderationspult', 2, 3], ['work-mischpult', 5, 3, 2], ['stereo-klangturm', 1, 1], ['sofa-wolkenbank', 1, 6, 2], ['pflanze-monstera-mia', 6, 1], ['wandleuchte-lichtband', 1, 4, 1],
        ['werkbank-tueftelecke', 7, 1], ['stereo-vinylglueck', 10, 1], ['gaming-pixelpalast', 10, 3, 3], ['regal-buecherwurm', 7, 4, 1],
        ['schreibtisch-fleissbiene', 11, 1], ['computer-rechenknecht', 11, 1], ['laptop-klappflink', 12, 1], ['schreibtisch-hochkant', 15, 1], ['computer-rechenknecht', 15, 1], ['laptop-klappflink', 16, 1],
        ['arbeitsplatz-homeoffice', 11, 4], ['arbeitsplatz-homeoffice', 15, 4], ['wanduhr-tickende-taube', 14, 6, 2],
        ['kuechenzeile-schlicht', 16, 7, 3], ['kaffee-morgenmuffel', 16, 7, 3], ['spuele-plaetscher', 16, 8, 3], ['sofa-fjordruhe', 5, 11, 1], ['esstisch-bistro', 12, 11], ['stuhl-kantholz', 11, 11, 1], ['stuhl-kantholz', 13, 11, 3],
        ['schreibtisch-hochkant', 10, 9], ['laptop-klappflink', 10, 9], ['pflanze-gummibaum-gustav', 16, 13], ['bild-geometrie-senf', 9, 13, 2], ['pflanze-farnwedel', 7, 7],
        ['toilette-thron', 1, 7], ['toilette-thron', 3, 7], ['waschbecken-klarspueler', 1, 13, 2], ['spiegel-rundblick', 1, 13, 2], ['waschbecken-klarspueler', 3, 13, 2],
        ['work-parkbank-stadt', 3, 16], ['work-parkbank-stadt', 12, 16], ['work-strassenlaterne', 6, 15], ['work-strassenlaterne', 11, 15], ['pflanze-zitronenbaum', 1, 18], ['pflanze-zitronenbaum', 16, 18],
      ]);
      b.windows('fenster-klarblick', 2);
    },
  },

  // Pier: lokal x = 0 liegt am Wasser (Promenade), die Straße unten
  pier: {
    size: [44, 14],
    ext: P.holzDunkel,
    build(b) {
      b.floor(0, 0, 4, 14, F.deck);
      b.floor(20, 0, 2, 14, F.pflaster);
      b.floor(4, 6, 16, 2, F.pflaster);
      b.room(28, 2, 10, 7, F.beton, P.holz); // Hafenwerkstatt
      b.open('tuer-schlicht', 32, 9, 0);
      b.ps([
        ['work-angelsteg', 0, 1, 3], ['work-angelsteg', 0, 3, 3], ['work-angelsteg', 0, 5, 3], ['work-angelsteg', 0, 9, 3], ['work-angelsteg', 0, 11, 3],
        ['gartenbank-parkruh', 4, 1, 3], ['gartenbank-parkruh', 4, 9, 3], ['work-strassenlaterne', 3, 4], ['work-strassenlaterne', 3, 8], ['work-strassenlaterne', 3, 13],
        ['grill-grillmeister', 10, 2], ['gartentisch-terrassenrunde', 14, 2], ['gartenbank-parkruh', 13, 4, 2], ['schachtisch-denkpause', 16, 10], ['gartenbank-parkruh', 24, 11],
        ['werkbank-tueftelecke', 28, 2], ['werkbank-tueftelecke', 31, 2], ['regal-wandleiter', 36, 2], ['kuechenzeile-schlicht', 37, 5, 3], ['kaffee-morgenmuffel', 37, 5, 3],
        ['stuhl-kantholz', 28, 7, 1], ['muelltonne-trennkuenstler', 37, 8, 3],
        ['muelltonne-trennkuenstler', 19, 12, 1], ['pflanze-zitronenbaum', 8, 12], ['pflanze-zitronenbaum', 40, 12], ['pflanze-zitronenbaum', 25, 1],
        ['work-strassenlaterne', 19, 5], ['work-strassenlaterne', 22, 8], ['work-strassenlaterne', 40, 5],
      ]);
      b.windows('fenster-bullauge', 3);
    },
  },
};

/** Stadthaus (as-1 Hedwig & Jonas, as-2 Musterhaus „Altstadtperle“) */
function townhouse(b: Builder, v: 0 | 1): void {
  const m = v === 1;
  b.room(1, 1, 8, 4, F.fliesen, m ? P.weiss : P.creme); // Küche & Essen
  b.room(1, 5, 2, 6, F.marmor, P.weiss); // Diele mit Treppe
  b.room(3, 5, 6, 6, m ? F.eiche : F.dielen, m ? P.salbei : P.rose); // Wohnen
  b.room(1, 1, 8, 4, F.teppich, m ? P.himmel : P.lavendel, 1); // Schlafzimmer
  b.room(1, 5, 2, 6, F.dielen, P.weiss, 1); // Flur
  b.room(3, 5, 6, 3, F.eiche, m ? P.mint : P.himmel, 1); // Jugend-/Kinderzimmer
  b.room(3, 8, 6, 3, F.fliesen, P.fliesen, 1); // Bad
  b.floor(2, 11, 4, 1, F.pflaster);
  b.floor(4, 12, 2, 2, F.pflaster);
  b.doors([[2, 5, 0], [3, 8, 1]]);
  b.open(m ? 'tuer-glaslicht' : HAUSTUER, 2, 11, 0);
  b.doors([[2, 5, 0], [3, 6, 1], [3, 9, 1]], 'tuer-schlicht', 1);
  b.stairs('treppe-stufenweise', 1, 6);
  b.ps([
    [m ? 'kuehlschrank-polarstern' : 'kuehlschrank-frostbeule', 1, 1], [m ? 'herd-feuerwerk' : 'herd-omas-stolz', 2, 1], ['kuechenzeile-schlicht', 3, 1], [m ? 'spuele-plaetscher' : 'spuele-bauernglueck', 4, 1],
    ['kuechenzeile-schlicht', 5, 1], ['kaffee-morgenmuffel', 3, 1], ['mikrowelle-turbowaermer', 5, 1],
    ['esstisch-tafelrunde', 6, 3], ['stuhl-gutsherr', 6, 4, 2], ['stuhl-gutsherr', 7, 4, 2], ['muelleimer-schlucker', 1, 4, 1],
    ['standuhr-grossvater', 1, 10],
    [m ? 'sofa-fjordruhe' : 'sofa-samtsalon', 5, 5], [m ? 'tv-kinowand' : 'tv-retroglotze', m ? 5 : 6, 8, 2], ['couchtisch-eichenrund', 6, 7], ['sessel-ohrenkuss', 4, 7, 1], ['kaminofen-gusseisen', 3, 10, 1],
    ['regal-buecherwurm', 8, 7, 3], ['pflanze-gummibaum-gustav', 8, 5], ['bild-abendrot', 5, 10, 2], ['bild-familiencollage', 3, 5, 1], ['stehlampe-bogenlicht', 8, 9],
    ['briefkasten-postfuchs', 6, 12, 3], ['pflanze-zitronenbaum', 1, 12], ['pflanze-zitronenbaum', 8, 12], ['gartenlaterne-gluehwuermchen', 7, 13],
  ]);
  if (m) b.ps([['spuelmaschine-glanzleistung', 6, 1], ['tischlampe-pilzglueck', 6, 3]]);
  b.ps(
    [
      [m ? 'doppelbett-traumhafen' : 'doppelbett-himmelreich', 6, 1], ['nachttisch-nachtwache', 5, 1], ['nachttisch-nachtwache', 8, 1], ['kleiderschrank-raumwunder', 1, 1], ['sessel-korbwiege', 4, 4, 2],
      [m ? 'regal-buecherwurm' : 'staffelei-pinselstrich', 3, 1], ['spiegel-ankleide', 1, 4, 1],
      [m ? 'bett-nordlicht' : 'bett-schlummerkiste', 8, 5], ['schreibtisch-hochkant', 5, 7, 2], ['computer-rechenknecht', 5, 7, 2], [m ? 'spielkiste-schatzkiste' : 'gitarre-lagerfeuer', 7, 7, 2], ['kleiderschrank-ordnungsliebe', 4, 5],
      ['toilette-thron', 4, 8], ['waschbecken-klarspueler', 6, 8], ['spiegel-rundblick', 6, 8], ['dusche-regentropfen', 8, 8], [m ? 'badewanne-muschel' : 'badewanne-badeschaum', 4, 10, 1], ['pflanze-farnwedel', 8, 10],
    ],
    1,
  );
  b.windows(m ? 'fenster-landhaus-doppel' : 'fenster-sprosse', 2);
}

// ======================= Öffentliche Schnittstelle =======================
export const TEMPLATE_IDS: string[] = Object.keys(T);

/** Fertighäuser für den Baumodus (4 Musterhäuser + leeres Grundstück); size = benötigte Grundstücksfläche */
export const MODEL_HOMES: { id: string; name: string; desc: string; size: [number, number] }[] = [
  { id: 'home-modern', name: 'Lichtblick', desc: 'Modernes Familienhaus mit zwei Etagen, vier Schlafplätzen, Arbeitszimmer und Pool.', size: [20, 16] },
  { id: 'home-bungalow', name: 'Sonnendeck', desc: 'Heller Bungalow auf einer Ebene mit Terrasse, zwei Schlafzimmern und Garten.', size: [18, 14] },
  { id: 'home-townhouse2', name: 'Altstadtperle', desc: 'Renoviertes, schmales Stadthaus mit zwei Etagen – klein, aber komplett.', size: [10, 14] },
  { id: 'home-loft', name: 'Hafenblick', desc: 'Offenes Loft mit Kochinsel, Schlafgalerie und Dachterrasse.', size: [18, 16] },
  { id: 'empty', name: 'Leeres Grundstück', desc: 'Alles abreißen und neu anfangen – nur der Briefkasten bleibt.', size: [1, 1] },
];

/** Passt die Vorlage auf das Grundstück? */
export function templateFits(templateId: string, lotId: string): boolean {
  const t = T[templateId],
    lot = lotById(lotId);
  if (!t || !lot) return false;
  if (!t.size) return true;
  const odd = lot.front === 1 || lot.front === 3;
  return t.size[0] <= (odd ? lot.d : lot.w) && t.size[1] <= (odd ? lot.w : lot.d);
}

function build(w: World, lot: LotDef, id: string): string[] {
  const t = T[id];
  if (!t) return [`${lot.id}: Unbekannte Vorlage ${id}`];
  w.clearLot(lot);
  w.rebuildFlags(lot); // alte Treppen-/Blockier-Flags des Lots löschen
  const b = new Builder(w, lot, t.size ?? (lot.front % 2 ? [lot.d, lot.w] : [lot.w, lot.d]));
  b.ext = t.ext;
  if (!b.errors.length) t.build(b);
  w.touch(lot.id);
  return b.errors;
}

/** Baut die Vorlage eines Lots (Wände, Böden, Farben, Öffnungen, Objekte). Deterministisch; Rückgabe = Platzierungsfehler. */
export function applyTemplate(w: World, lotId: string, templateId?: string): TemplateResult {
  const lot = lotById(lotId);
  if (!lot) return { errors: [`Unbekanntes Grundstück ${lotId}`] };
  const errors = build(w, lot, templateId ?? lot.template);
  w.rebuildFlags(lot); // ruft rebuildLinks() mit auf
  return { errors };
}

/** Alle Lots bauen (neues Spiel); Navigation wird einmal am Ende komplett neu berechnet */
export function buildAllLots(w: World): string[] {
  const errors: string[] = [];
  for (const lot of LOTS) errors.push(...build(w, lot, lot.template));
  w.rebuildFlags();
  return errors;
}
