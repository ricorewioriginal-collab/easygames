import { describe, expect, it } from 'vitest';
import { validateLayout } from '../levels/validate';
import { makeTestLayout } from './testLayouts';

describe('Test-Brett', () => {
  it('ist ein gültiges Layout', () => {
    expect(validateLayout(makeTestLayout())).toEqual([]);
  });
});
