/* Aufträge wie im Open-World-Krimi, nur freundlich: Leute aus der Stadt rufen an, du nimmst an,
   fährst oder läufst die Stationen in der Zeit ab (Lichtsäule und Radar zeigen den Weg) und kassierst.
   Eigene Figuren und Orte von Pride City. Nachtaufträge gibt es nur zwischen 21 und 5 Uhr. */
import type { SaveData } from '../engine/Save';

export interface GigStep { x: number; z: number; label: string; icon: string }
export interface Gig {
  id: string; who: string; color: string; title: string;
  /** was die Person am Telefon sagt */ call: string;
  steps: GigStep[]; time: number; pay: number; rep: number;
  night?: boolean; /** Tipp: mit dem Auto schneller */ car?: boolean;
  done: string;
}

const S = (x: number, z: number, label: string, icon = '📦'): GigStep => ({ x, z, label, icon });

export const GIGS: Gig[] = [
  { id: 'hafer', who: 'Mo', color: '#ff7a3d', title: 'Hafermilch-Notfall', time: 75, pay: 35, rep: 1,
    call: 'Hilfe! Mir ist die Hafermilch ausgegangen und das Café ist voll. Holst du mir zwei Kisten beim Späti?',
    steps: [S(-4, 40, 'Kisten beim Späti abholen'), S(4, 10, 'Zum Café Kaffeeklatsch', '☕')], done: 'Die Schlange ist gerettet. Cappuccino geht aufs Haus!' },
  { id: 'hafen', who: 'Bruno', color: '#d56300', title: 'Lieferung zum Hafen', time: 110, pay: 60, rep: 1, car: true,
    call: 'Die Strandbar Sandbank braucht Eis und Limetten, sofort. Zu Fuß schaffst du das kaum – nimm ein Auto.',
    steps: [S(-4, 40, 'Ware beim Späti laden'), S(-80, 30, 'Zur Strandbar Sandbank', '🏖️')], done: 'Eis da, Limetten da, Party gerettet.' },
  { id: 'flyer', who: 'Rex', color: '#3b4cff', title: 'Flyer für die Clubnacht', time: 150, pay: 50, rep: 2,
    call: 'Freitag ist Clubnacht im Prisma. Verteil die Flyer an den Hotspots, bevor die Konkurrenz es tut.',
    steps: [S(-15, 24, 'Flyer am Pride Plaza', '🎟️'), S(34, 10, 'Flyer vor der Boutique', '🎟️'), S(34, -20, 'Flyer vor der Muckibude', '🎟️'), S(-34, 20, 'Flyer am Studio', '🎟️')], done: 'Die ganze Stadt redet über Freitag. Gute Arbeit!' },
  { id: 'platten', who: 'Nova', color: '#ff2fd2', title: 'Der Plattenkoffer', time: 100, pay: 55, rep: 1, car: true,
    call: 'Meine Plattentasche liegt noch im Prisma, und mein Set im Club Leuchtturm fängt gleich an!',
    steps: [S(4, -10, 'Plattentasche im Club Prisma holen', '💿'), S(-71, -12, 'Zum Club Leuchtturm am Hafen', '🗼')], done: 'Nova legt pünktlich auf. Der erste Track ist für dich.' },
  { id: 'test', who: 'Kim', color: '#3da542', title: 'Testwoche', time: 140, pay: 40, rep: 2,
    call: 'Diese Woche gibt es Gratis-Tests im Checkpoint. Hilfst du, die Plakate aufzuhängen?',
    steps: [S(-34, -10, 'Plakate im Checkpoint abholen', '🩺'), S(-4, -10, 'Plakat am Regenbogenhaus', '🌈'), S(40, 40, 'Plakat am Regenbogenpark', '🌳')], done: 'Mehr Leute wissen jetzt Bescheid. Wissen schützt.' },
  { id: 'vip', who: 'Velvet', color: '#ff3fb0', title: 'VIP-Shuttle', time: 120, pay: 90, rep: 3, night: true, car: true,
    call: 'Ein Star der Drag-Szene ist in der One Love Bar und will heute Nacht ins Prisma und danach an den Hafen. Diskret, schnell, stilvoll.',
    steps: [S(34, 20, 'Gast an der One Love Bar abholen', '💗'), S(4, -10, 'Zwischenstopp Club Prisma', '🪩'), S(-71, -12, 'Absetzen am Club Leuchtturm', '🗼')], done: 'Der Star hat dir ein Autogramm auf die Sonnenblende geschrieben.' },
  { id: 'nacht', who: 'Tariq', color: '#ffd23b', title: 'Späti-Nachtschicht', time: 90, pay: 45, rep: 1, night: true,
    call: 'Die Leute im Park haben Durst und der Späti hat zu wenig Hände. Bringst du die Kühlbox rüber?',
    steps: [S(-4, 40, 'Kühlbox beim Späti', '🧊'), S(40, 40, 'Zum Regenbogenpark', '🌳')], done: 'Kalte Getränke, warme Nacht. Danke!' },
];

const isNight = (s: SaveData) => { const h = (6 + s.time * 24) % 24; return h >= 21 || h < 5; };

/** Aufträge, die gerade gehen (nachts zusätzlich die Nachtaufträge) */
export function openGigs(s: SaveData) { return GIGS.filter((g) => !g.night || isNight(s)); }

/** Zufälliger Anruf: am liebsten ein Auftrag, der heute noch nicht erledigt ist */
export function pickCall(s: SaveData, r: number) {
  const list = openGigs(s), fresh = list.filter((g) => s.flags['gig_' + g.id] !== s.day);
  const pool = fresh.length ? fresh : list;
  return pool[Math.floor(r * pool.length) % pool.length];
}

export const fmtTime = (t: number) => `${Math.floor(Math.max(0, t) / 60)}:${String(Math.floor(Math.max(0, t) % 60)).padStart(2, '0')}`;
