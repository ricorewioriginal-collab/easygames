import { describe, it, expect } from 'vitest';
import { ROUTES, routeNet } from '../src/data/routes';
import { validate } from '../src/railway/validate';

describe('Streckenpakete', () => {
  for (const r of ROUTES) it(r.id + ' baut fehlerfrei', () => {
    const def = routeNet(r.id);
    const res = validate(def);
    const errs = res.issues.filter((i) => i.sev === 'error');
    if (errs.length) console.log(r.id, errs.slice(0, 8));
    const warns = res.issues.filter((i) => i.sev === 'warn');
    if (warns.length) console.log(r.id, 'warn', warns.length, warns.slice(0, 6).map((w) => w.msg));
    expect(errs).toEqual([]);
    expect(res.il!.routes.length).toBeGreaterThan(10);
    console.log(r.id, 'km', r.km.toFixed(1), 'tracks', def.tracks.length, 'signals', def.signals.length, 'routes', res.il!.routes.length, 'stations', def.stations.length);
  });
});
