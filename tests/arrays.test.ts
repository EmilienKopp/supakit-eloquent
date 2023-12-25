import { Assess, Policies } from './../lib/arrays';
import * as pluralizer from 'pluralize';

import { deleteColumn, mapHeaders, random, toSelectOptions, type SelectOption, vertical, uniquify} from '../lib/arrays';
import { describe, expect, expectTypeOf, test } from 'vitest';

describe.concurrent('Array utilities', () => {
    test(' random() should return a random element from an array', () => {
        const arr = ['a', 'b', 'c'];
        const randomElement = random(arr);
        expect(arr).toContain(randomElement);
    });

    test(' deleteColumn() should delete a column from a 2D array', () => {
        const arr = [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
        ];
        const expected = [
            ['a', 'b'],
            ['d', 'e'],
            ['g', 'h']
        ];
        expect(deleteColumn(arr, 2)).toEqual(expected);
    });

    test(' deleteColumn() should throw an error if the column index is out of bounds', () => {
        const arr = [
            ['a', 'b', 'c'],
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
        ];
        expect(() => deleteColumn(arr, 3)).toThrow();
    });

    test(' deleteColumn() should throw an error if the array is empty', () => {
        const arr = [];
        expect(() => deleteColumn(arr, 0)).toThrow();
    });

    test('mapHeaders() should map an array of headers to an array of arrays', () => {
        const headers = ['a', 'b', 'c'];
        const arr = [
            ['d', 'e', 'f'],
            ['g', 'h', 'i']
        ];
        const expected = [
            { a: 'd', b: 'e', c: 'f' },
            { a: 'g', b: 'h', c: 'i' }
        ];
        expect(mapHeaders(headers, arr)).toEqual(expected);
    });

    test('mapHeaders() should throw an error if headers or array is empty', () => {
        const headers = [];
        const arr = [];
        expect(() => mapHeaders(headers, arr)).toThrow();
    });

    test('mapHeaders() should throw an error if headers and array have different lengths', () => {
        const headers = ['a', 'b', 'c'];
        const arr = [
            ['d', 'e', 'f'],
            ['g', 'h']
        ];
        expect(() => mapHeaders(headers, arr)).toThrow();
    });

    test('toSelectOptions() should convert an array of objects to an array of SelectOption objects', () => {
        const arr = [
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' }
        ];
        const expected: SelectOption[] = [
            { value: 1, label: 'foo' },
            { value: 2, label: 'bar' }
        ];
        const result = toSelectOptions(arr, 'id', 'name');
        expect(result).toEqual(expected);
        // Check the items are of type SelectOption
        expectTypeOf(result[0]).toEqualTypeOf<SelectOption>();
    });

    test(' vertical() should convert an object array to an array of the values of selected keys.', () => {
        const arr = [
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' }
        ];
        const expected = ['foo','bar'];
        expect(vertical(arr, 'name')).toEqual(expected);
    });

    test('vertical() should be able to serialize the array to a supabase query language array', () => {
        const arr = [
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' }
        ];
        const expected = '(foo,bar)';
        expect(vertical(arr, 'name', { serialize_supabase: true })).toEqual(expected);
    });

    test('vertical() should be able to serialize the array to a postgres query language array', () => {
        const arr = [
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' }
        ];
        const expected = '{foo,bar}';
        expect(vertical(arr, 'name', { serialize_postgres: true })).toEqual(expected);
    });


}); 