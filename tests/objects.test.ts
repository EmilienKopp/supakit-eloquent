import { describe, expect, test } from "vitest";
import { except, isEmpty, resolveNestedValue } from "../lib/Objects";

describe.concurrent('Object methods', () => {
    test('resolveNestedValue() can resolve a deeply nested value', () => {
        const obj = {
            a: {
                b: {
                    c: "hello"
                }
            }
        }
        expect(resolveNestedValue(obj, "a.b.c")).toBe("hello");

        const obj2 = {
            a: {
                i: {
                    c: {
                        d: "hello"
                    }
                },
                b: {
                    c: {
                        d: "hello"
                    }
                }
            }
        }

        expect(resolveNestedValue(obj2, "a.b.c.d")).toBe("hello");
    });

    test('except() can remove keys from an object', () => {
        const obj = {
            a: "hello",
            b: "world",
            c: "!"
        }

        expect(except(obj, ["a", "b"])).toEqual({
            c: "!"
        })
    });

    test('isEmpty() can check whether an array is empty', () => {
        expect(isEmpty([])).toBe(true);
        expect(isEmpty([1, 2, 3])).toBe(false);
    });

    test('isEmpty() can check whether an object is empty', () => {
        expect(isEmpty({})).toBe(true);
        expect(isEmpty({ a: "hello" })).toBe(false);
    });

});