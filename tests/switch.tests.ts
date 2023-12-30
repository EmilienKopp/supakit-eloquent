import { Matcher, Switch } from './../lib/Switch';
import {describe, expect, test} from 'vitest';

describe.concurrent('switch', () => {

    test('can construct with new', () => {
        const Switch = new Matcher(1);
        expect(Switch).toBeInstanceOf(Matcher);
    });

    test('can construct without new', () => {
        const sw = Switch(1);
        expect(sw).toBeInstanceOf(Matcher);
    });

    test('can match', () => {
        const result = Switch(1)
            .match('ONE', (value: any) => value === 1)
            .match('TWO', (value: any) => value === 2)
            .default('DEFAULT')
            .end();
        expect(result).toBe('ONE');
    });

    test('can default', () => {
        const result = Switch(3)
            .match('ONE', (value: any) => value === 1)
            .match('TWO', (value: any) => value === 2)
            .default('DEFAULT')
            .end();
        expect(result).toBe('DEFAULT');
    });

    test('can match with no default', () => {
        const result = Switch(3)
            .match('ONE', (value: any) => value === 1)
            .match('TWO', (value: any) => value === 2)
            .end();
        expect(result).toBe(null);
    });

    test('returns null if no match and no default', () => {
        const result = Switch(3)
            .match('ONE', (value: any) => value === 1)
            .match('TWO', (value: any) => value === 2)
            .end();
        expect(result).toBe(null);
    });



});