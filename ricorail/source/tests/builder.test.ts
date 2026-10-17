import { describe, it, expect } from 'vitest';
import { sampleNet } from './helpers/sample';
import { validate } from '../src/railway/validate';

describe('Netzbaukasten', () => {
  it('erzeugt ein gültiges Netz ohne Fehler', () => {
    const def = sampleNet();
    const { issues, il } = validate(def);
    const errs = issues.filter((i) => i.sev === 'error');
    if (errs.length) console.log(errs);
    console.log(issues.filter((i) => i.sev === 'warn').map((i) => i.msg).slice(0, 20));
    expect(errs).toEqual([]);
    expect(il!.routes.length).toBeGreaterThan(10);
  });
});
