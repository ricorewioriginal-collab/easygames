import { MeshBuilder, hex, type V3 } from './common';
import type { CarBody } from './types';

/**
 * Die fünf Karosserien als Low-Poly-Entwürfe. Koordinaten relativ zur Hitbox-Mitte,
 * Nase +z, Dach +y. Alle Teile sind facettiert (flache Normalen).
 */
export interface BodyParts {
  /** Lackierte Hülle (bekommt den Aufkleber) */
  body: MeshBuilder;
  /** Dunkles Metall: Spoiler, Schweller, Streben */
  trim: MeshBuilder;
  /** Kanzel */
  glass: MeshBuilder;
  /** Neon-Leuchtlinien in der Akzentfarbe */
  neon: MeshBuilder;
  /** Halbtransparente Flügel (nur Libelle) */
  fin: MeshBuilder;
  head: MeshBuilder;
  tail: MeshBuilder;
}

export interface BodySpec {
  wheel: { r: number; w: number; x: number; zf: number; zr: number };
  /** Auspuff: Ansatz der Nitro-Flamme */
  exhaust: V3;
  /** Scheinwerfer-Lichtpunkte (Sprites) */
  headSpots: V3[];
  /** Größe des Unterboden-Leuchtens [Breite, Länge, z-Mitte] */
  glow: [number, number, number];
  /** Flammenlänge in m bei vollem Boost */
  flame: number;
  /** Flammenradius */
  flameR: number;
  build(): BodyParts;
}

function newParts(): BodyParts {
  return {
    body: new MeshBuilder(),
    trim: new MeshBuilder(),
    glass: new MeshBuilder(),
    neon: new MeshBuilder(),
    fin: new MeshBuilder(),
    head: new MeshBuilder(),
    tail: new MeshBuilder(),
  };
}

/** Seitenpaar: ruft f für die rechte Seite auf und spiegelt es nach links. */
function pair(b: MeshBuilder, f: () => void): void {
  const m = b.mark();
  f();
  b.mirrorX(m);
}

/** Flügelplatte entlang x (rechts): Wurzel- und Spitzenquerschnitt in (y, z) */
function wing(b: MeshBuilder, x0: number, x1: number, root: { y: number; z0: number; z1: number }, tip: { y: number; z0: number; z1: number }, th: number): void {
  const ring = (x: number, s: { y: number; z0: number; z1: number }): V3[] => [
    [x, s.y - th, s.z0],
    [x, s.y + th, s.z0],
    [x, s.y + th, s.z1],
    [x, s.y - th, s.z1],
  ];
  b.loft([ring(x0, root), ring(x1, tip)]);
}

const BT = 0.011; // Dicke der Neon-Linien

export const BODY_SPECS: Record<CarBody, BodySpec> = {
  /* ------------------------------------------------------------ flacher Keil */
  flitzer: {
    wheel: { r: 0.15, w: 0.12, x: 0.41, zf: 0.38, zr: -0.36 },
    exhaust: [0, -0.03, -0.62],
    headSpots: [
      [-0.12, -0.065, 0.63],
      [0.12, -0.065, 0.63],
    ],
    glow: [0.9, 1.5, 0],
    flame: 1.7,
    flameR: 0.1,
    build() {
      const p = newParts();
      p.body.loftZ([
        hex(-0.6, 0.25, 0.3, -0.1, -0.02, 0.07, 0.22),
        hex(-0.3, 0.32, 0.36, -0.11, -0.01, 0.1, 0.27),
        hex(0.15, 0.32, 0.36, -0.11, -0.01, 0.07, 0.25),
        hex(0.45, 0.25, 0.3, -0.11, -0.04, -0.01, 0.2),
        hex(0.62, 0.13, 0.2, -0.1, -0.06, -0.04, 0.11),
      ]);
      p.glass.loftZ([hex(-0.34, 0.2, 0.22, 0.05, 0.09, 0.16, 0.15), hex(-0.1, 0.19, 0.21, 0.05, 0.09, 0.2, 0.12), hex(0.16, 0.22, 0.24, 0.04, 0.06, 0.06, 0.2)]);
      // Heckflügel mit Streben, Frontsplitter, Schweller, Diffusor
      p.trim.box(0, 0.165, -0.57, 0.38, 0.011, 0.075);
      pair(p.trim, () => {
        p.trim.box(0.17, 0.115, -0.56, 0.014, 0.055, 0.03);
        p.trim.box(0.38, 0.185, -0.57, 0.012, 0.035, 0.08);
        p.trim.box(0.37, -0.115, 0.0, 0.012, 0.03, 0.42);
      });
      p.trim.box(0, -0.125, 0.62, 0.26, 0.01, 0.07);
      p.trim.box(0, -0.12, -0.6, 0.2, 0.02, 0.04);
      pair(p.neon, () => {
        p.neon.bar([0.372, -0.025, -0.52], [0.372, -0.03, 0.36], BT);
        p.neon.bar([0.0, 0.1, 0.12], [0.18, 0.075, 0.46], BT * 0.8);
      });
      p.neon.bar([-0.3, 0.025, -0.612], [0.3, 0.025, -0.612], BT);
      pair(p.head, () => p.head.box(0.12, -0.065, 0.62, 0.06, 0.013, 0.014));
      p.tail.box(0, 0.045, -0.607, 0.2, 0.013, 0.008);
      return p;
    },
  },

  /* ----------------------------------------------------------- Block-Bolide */
  brocken: {
    wheel: { r: 0.17, w: 0.15, x: 0.395, zf: 0.38, zr: -0.37 },
    exhaust: [0, 0.0, -0.64],
    headSpots: [
      [-0.2, 0.0, 0.64],
      [0.2, 0.0, 0.64],
    ],
    glow: [0.95, 1.5, 0],
    flame: 1.9,
    flameR: 0.13,
    build() {
      const p = newParts();
      p.body.loftZ([
        hex(-0.6, 0.3, 0.34, -0.12, 0.03, 0.13, 0.3),
        hex(-0.5, 0.34, 0.38, -0.12, 0.03, 0.14, 0.32),
        hex(0.4, 0.34, 0.38, -0.12, 0.03, 0.12, 0.32),
        hex(0.52, 0.3, 0.34, -0.12, 0.0, 0.09, 0.28),
        hex(0.62, 0.28, 0.32, -0.11, -0.02, 0.05, 0.25),
      ]);
      p.glass.loftZ([hex(-0.34, 0.27, 0.29, 0.1, 0.14, 0.27, 0.24), hex(-0.02, 0.27, 0.29, 0.1, 0.14, 0.28, 0.24), hex(0.2, 0.28, 0.3, 0.09, 0.12, 0.17, 0.26), hex(0.3, 0.28, 0.3, 0.08, 0.1, 0.12, 0.26)]);
      // Rammbügel, Seitenstufen, Dachbalken, Auspuffrohre
      p.trim.box(0, -0.06, 0.655, 0.33, 0.045, 0.025);
      p.trim.box(0, 0.04, 0.66, 0.2, 0.012, 0.018);
      pair(p.trim, () => {
        p.trim.box(0.345, 0.0, 0.64, 0.012, 0.12, 0.016);
        p.trim.box(0.405, -0.1, 0.0, 0.02, 0.022, 0.38);
        p.trim.box(0.22, 0.0, -0.655, 0.035, 0.05, 0.035);
        p.trim.box(0.2, 0.285, -0.02, 0.012, 0.016, 0.22);
      });
      p.trim.box(0, 0.285, -0.02, 0.2, 0.012, 0.02);
      pair(p.neon, () => {
        p.neon.bar([0.384, 0.04, -0.5], [0.384, 0.04, 0.42], BT);
        p.neon.bar([0.27, 0.29, -0.18], [0.27, 0.29, 0.12], BT * 0.8);
      });
      p.neon.bar([-0.28, 0.285, -0.02], [0.28, 0.285, -0.02], BT);
      pair(p.head, () => p.head.box(0.2, 0.0, 0.66, 0.07, 0.04, 0.014));
      p.tail.box(0, 0.075, -0.607, 0.26, 0.016, 0.008);
      return p;
    },
  },

  /* ------------------------------------------------- schmal mit Flügeln */
  libelle: {
    wheel: { r: 0.14, w: 0.1, x: 0.37, zf: 0.38, zr: -0.38 },
    exhaust: [0, 0.0, -0.66],
    headSpots: [
      [-0.07, -0.05, 0.62],
      [0.07, -0.05, 0.62],
    ],
    glow: [0.8, 1.55, 0],
    flame: 1.6,
    flameR: 0.085,
    build() {
      const p = newParts();
      p.body.loftZ([
        hex(-0.64, 0.07, 0.1, -0.08, -0.01, 0.05, 0.06),
        hex(-0.4, 0.14, 0.18, -0.1, 0.0, 0.07, 0.11),
        hex(0.0, 0.16, 0.2, -0.11, 0.0, 0.09, 0.12),
        hex(0.35, 0.12, 0.16, -0.11, -0.02, 0.04, 0.08),
        hex(0.68, 0.03, 0.05, -0.08, -0.04, -0.01, 0.02),
      ]);
      p.glass.loftZ([hex(-0.22, 0.1, 0.13, 0.04, 0.08, 0.14, 0.06), hex(0.0, 0.13, 0.15, 0.04, 0.09, 0.2, 0.07), hex(0.24, 0.09, 0.12, 0.03, 0.05, 0.06, 0.06)]);
      // Achsstreben, Heckspoiler mit Doppelfinnen
      pair(p.trim, () => {
        p.trim.bar([0.14, -0.05, 0.38], [0.33, -0.03, 0.38], 0.012);
        p.trim.bar([0.14, -0.05, -0.38], [0.33, -0.03, -0.38], 0.012);
        p.trim.box(0.1, 0.17, -0.6, 0.012, 0.11, 0.08);
      });
      p.trim.box(0, 0.285, -0.6, 0.2, 0.01, 0.075);
      // Flügel (halbtransparent) mit Neon-Vorderkante
      pair(p.fin, () => {
        wing(p.fin, 0.12, 0.62, { y: 0.06, z0: -0.46, z1: -0.14 }, { y: 0.1, z0: -0.56, z1: -0.4 }, 0.006);
        wing(p.fin, 0.12, 0.6, { y: 0.07, z0: 0.0, z1: 0.3 }, { y: 0.11, z0: -0.08, z1: 0.08 }, 0.006);
      });
      pair(p.neon, () => {
        p.neon.bar([0.12, 0.06, -0.14], [0.62, 0.1, -0.4], BT);
        p.neon.bar([0.12, 0.07, 0.3], [0.6, 0.11, 0.08], BT);
        p.neon.bar([0.1, 0.17, -0.6], [0.1, 0.285, -0.6], BT);
      });
      p.neon.bar([-0.2, 0.298, -0.52], [0.2, 0.298, -0.52], BT);
      pair(p.head, () => p.head.box(0.07, -0.05, 0.61, 0.04, 0.012, 0.014));
      p.tail.box(0, 0.03, -0.652, 0.07, 0.012, 0.008);
      return p;
    },
  },

  /* ------------------------------------------------------------ Pfeil-Racer */
  pfeil: {
    wheel: { r: 0.14, w: 0.1, x: 0.4, zf: 0.3, zr: -0.4 },
    exhaust: [0, 0.01, -0.62],
    headSpots: [
      [-0.07, -0.07, 0.5],
      [0.07, -0.07, 0.5],
    ],
    glow: [0.9, 1.6, 0.02],
    flame: 1.8,
    flameR: 0.09,
    build() {
      const p = newParts();
      p.body.loftZ([
        hex(-0.6, 0.3, 0.34, -0.1, -0.02, 0.07, 0.26),
        hex(-0.3, 0.34, 0.38, -0.11, -0.01, 0.09, 0.28),
        hex(0.05, 0.22, 0.26, -0.11, -0.02, 0.06, 0.16),
        hex(0.4, 0.1, 0.13, -0.1, -0.04, 0.0, 0.07),
        hex(0.78, 0.012, 0.02, -0.09, -0.07, -0.05, 0.01),
      ]);
      p.glass.loftZ([hex(-0.34, 0.15, 0.17, 0.04, 0.08, 0.14, 0.1), hex(-0.12, 0.12, 0.15, 0.03, 0.07, 0.17, 0.06), hex(0.12, 0.08, 0.1, 0.02, 0.04, 0.06, 0.04)]);
      // Heckfinnen, Mittelfinne, Canards
      pair(p.trim, () => {
        p.trim.prism(-0.62, -0.42, 0.34, 0.15, 0.011, 0.1, 0.011, 0.04);
        p.trim.box(0.19, -0.085, 0.3, 0.14, 0.008, 0.05);
        p.trim.box(0.37, -0.115, -0.1, 0.012, 0.03, 0.34);
      });
      p.trim.prism(-0.62, -0.36, 0.0, 0.17, 0.011, 0.1, 0.011, 0.02);
      pair(p.neon, () => {
        p.neon.bar([0.375, -0.02, -0.34], [0.016, -0.075, 0.74], BT);
        p.neon.bar([0.34, 0.1, -0.62], [0.34, 0.2, -0.54], BT);
      });
      p.neon.bar([-0.3, 0.02, -0.612], [0.3, 0.02, -0.612], BT);
      pair(p.head, () => p.head.box(0.05, -0.065, 0.52, 0.03, 0.01, 0.02));
      p.tail.box(0, 0.05, -0.607, 0.18, 0.012, 0.008);
      return p;
    },
  },

  /* ------------------------------------------------------ rund-kompakt */
  kaefer: {
    wheel: { r: 0.15, w: 0.12, x: 0.41, zf: 0.36, zr: -0.36 },
    exhaust: [0, -0.03, -0.6],
    headSpots: [
      [-0.2, 0.0, 0.58],
      [0.2, 0.0, 0.58],
    ],
    glow: [0.9, 1.4, 0],
    flame: 1.6,
    flameR: 0.1,
    build() {
      const p = newParts();
      p.body.loftZ([
        hex(-0.58, 0.16, 0.22, -0.1, -0.01, 0.06, 0.14),
        hex(-0.44, 0.28, 0.35, -0.12, 0.02, 0.13, 0.25),
        hex(-0.2, 0.34, 0.4, -0.12, 0.04, 0.17, 0.3),
        hex(0.15, 0.34, 0.4, -0.12, 0.04, 0.17, 0.3),
        hex(0.4, 0.28, 0.35, -0.12, 0.02, 0.13, 0.25),
        hex(0.58, 0.17, 0.23, -0.1, -0.01, 0.06, 0.14),
      ]);
      p.glass.loftZ([hex(-0.34, 0.2, 0.26, 0.08, 0.13, 0.2, 0.15), hex(-0.14, 0.26, 0.3, 0.08, 0.15, 0.28, 0.17), hex(0.1, 0.27, 0.3, 0.08, 0.15, 0.27, 0.17), hex(0.3, 0.2, 0.26, 0.08, 0.12, 0.16, 0.14)]);
      // Stoßfänger, Kotflügel-Leisten
      p.trim.box(0, -0.075, 0.6, 0.18, 0.03, 0.02);
      p.trim.box(0, -0.065, -0.6, 0.16, 0.03, 0.02);
      pair(p.trim, () => {
        p.trim.box(0.385, -0.095, 0.0, 0.016, 0.02, 0.4);
        p.trim.box(0.28, 0.115, 0.4, 0.05, 0.01, 0.05);
      });
      pair(p.neon, () => {
        p.neon.bar([0.408, 0.0, -0.4], [0.408, 0.0, 0.4], BT);
        p.neon.bar([0.2, 0.3, -0.2], [0.2, 0.3, 0.14], BT * 0.8);
      });
      p.neon.bar([-0.1, 0.205, 0.1], [0.1, 0.205, 0.1], BT);
      pair(p.head, () => p.head.box(0.2, 0.0, 0.592, 0.065, 0.05, 0.012));
      p.tail.box(0, 0.05, -0.598, 0.17, 0.014, 0.008);
      return p;
    },
  },
};

