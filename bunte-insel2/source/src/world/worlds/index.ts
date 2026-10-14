/* Alle Welten von Bunte Insel 2 (alle 20 Welten des Originals, neu gebaut). */
import type { WorldDef } from '../registry.ts';
import { hub } from './hub.ts';
import { stadt, fellretter, drachen, dampfer } from './group1.ts';
import { regenbogen, park, fussball, maerchen, schluessel, wunsch } from './group2.ts';
import { schwamm, atlantis, funkwelle, lunaris, taschi, huepf, bauland, raetsel } from './group3.ts';
import { prisma } from './prisma.ts';

export const ALL_WORLDS: WorldDef[] = [hub, stadt, fellretter, drachen, dampfer, regenbogen, park, fussball, maerchen, schluessel, wunsch, schwamm, atlantis, funkwelle, lunaris, taschi, huepf, bauland, raetsel, prisma];
