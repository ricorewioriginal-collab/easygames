// Zentrale Spielkonstanten. Änderungen hier wirken auf Client-Vorhersage UND Server gleichermaßen.

export const PROTOCOL_VERSION = 3;

export const TICK_RATE = 30;
export const DT = 1 / TICK_RATE;

/** Kantenlänge der Karte in Metern (Koordinaten 0 … MAP_SIZE auf x und z). */
export const MAP_SIZE = 1536;
export const MAP_CENTER = MAP_SIZE / 2;
/** Auflösung der Höhenkarte in Metern. */
export const HEIGHT_RES = 2;
export const WATER_LEVEL = 3;
export const SEA_FLOOR = -10;

// Spielfigur
export const PLAYER_RADIUS = 0.42;
export const PLAYER_HEIGHT = 1.8;
export const CROUCH_HEIGHT = 1.15;
export const DOWNED_HEIGHT = 0.7;
export const STEP_HEIGHT = 0.55;
export const EYE_HEIGHT = 1.6;

export const WALK_SPEED = 5.2;
export const SPRINT_SPEED = 7.4;
export const CROUCH_SPEED = 2.7;
export const AIM_SPEED_MUL = 0.62;
export const SWIM_SPEED = 3.6;
export const DOWNED_SPEED = 1.4;
export const SLIDE_START_SPEED = 10.5;
export const SLIDE_MIN_SPEED = 3.2;
export const JUMP_VELOCITY = 7.4;
export const GRAVITY = 22;
export const MAX_FALL_SPEED = 48;
/** Fallschaden ab dieser Aufprallgeschwindigkeit (m/s). */
export const FALL_DAMAGE_SPEED = 16;
export const CLIMB_MAX = 2.4;
export const CLIMB_TIME = 0.42;

// Absprung und Gleiter
export const BUS_HEIGHT = 300;
export const BUS_SPEED = 42;
export const FREEFALL_SPEED = 29;
export const FREEFALL_DIVE_SPEED = 52;
export const FREEFALL_HSPEED = 22;
export const GLIDE_FALL_SPEED = 7;
export const GLIDE_HSPEED = 17;
export const GLIDER_AUTO_HEIGHT = 70;

// Leben
export const MAX_HP = 100;
export const MAX_SHIELD = 100;
export const DOWNED_HP = 100;
export const DOWNED_BLEED = 2.5;
export const REVIVE_TIME = 5;
export const REVIVE_RANGE = 2.4;
export const INTERACT_RANGE = 2.6;

// Bauen
export const GRID = 4;
export const WALL_H = 4;
export const MAX_MATERIAL = 999;
export const BUILD_COST = 10;
export const BUILD_RANGE = 7;

// Netzwerk
export const SNAPSHOT_EVERY = 2; // Server: alle 2 Ticks (15 Hz), lokal: jeden Tick
export const INTEREST_RADIUS = 360;
export const MAX_REWIND = 0.35; // Sekunden Lag-Kompensation

// Inventar
export const HOTBAR_SLOTS = 5;
