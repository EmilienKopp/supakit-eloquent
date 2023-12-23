import { expect, test } from 'vitest';
import { isClientSide, wait } from '../lib/tools';

test('wait() should wait for a specified amount of time', async () => {
    const start = Date.now();
    await wait(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(100);

    const start2 = Date.now();
    await wait(200);
    const end2 = Date.now();
    expect(end2 - start2).toBeGreaterThanOrEqual(200);
    
});

test('isClientSide() should return false if window is undefined', () => {
    expect(isClientSide()).toBe(false);
});