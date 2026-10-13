// Server-Konfiguration aus Umgebungsvariablen (alle optional).
export interface ServerConfig {
  port: number;
  host: string;
  allowedOrigins: string[];
  dataDir: string;
  publicSize: number;
  queueWait: number;
  maxMatches: number;
  snapshotEvery: number;
  botSkill: number;
  minHumans: number;
  staticDir: string;
}

const num = (v: string | undefined, d: number, lo: number, hi: number): number => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    port: num(env.PORT, 2610, 1, 65535),
    host: env.HOST ?? '0.0.0.0',
    allowedOrigins: (env.ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    dataDir: env.DATA_DIR ?? './data',
    publicSize: num(env.PUBLIC_MATCH_SIZE, 100, 2, 100),
    queueWait: num(env.QUEUE_WAIT, 25, 0, 600),
    maxMatches: num(env.MAX_MATCHES, 8, 1, 64),
    snapshotEvery: num(env.SNAPSHOT_EVERY, 2, 1, 4),
    botSkill: num(env.BOT_SKILL, 1, 0, 2),
    minHumans: num(env.MIN_HUMANS, 1, 1, 100),
    staticDir: env.STATIC_DIR ?? '',
  };
}
