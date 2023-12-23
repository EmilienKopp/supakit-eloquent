import { expect, test } from 'vitest';

import { percent } from '../lib/numbers';

test('percent() should return a percentage from a numerator and denominator', () => {
    expect(percent(1, 2)).toBe('50');
    expect(percent(1, 2, 2)).toBe('50.00');
    expect(percent(1, 3)).toBe('33');
    expect(percent(1, 3, 2)).toBe('33.33');
    expect(percent(1, 4)).toBe('25');
    expect(percent(1, 4, 2)).toBe('25.00');
    expect(percent(1, 5)).toBe('20');
    expect(percent(1, 5, 1)).toBe('20.0');
});