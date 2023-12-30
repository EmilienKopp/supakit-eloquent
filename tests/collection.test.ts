import { Collect, Collection } from "../lib/Collection";
import { describe, expect, test } from "vitest";

import { Model } from './../lib/Model';

describe.concurrent("collection", () => {

    test('should be able to create a collection', () => {
        const collection = new Collection();
        expect(collection).toBeInstanceOf(Collection);
        expect(collection).toBeDefined();
    });

    test('prototype should have the array methods', () => {
        const collection = new Collection();
        expect(collection).toHaveProperty('push');
        expect(collection).toHaveProperty('pop');
        expect(collection).toHaveProperty('shift');
        expect(collection).toHaveProperty('unshift');
        expect(collection).toHaveProperty('splice');
        expect(collection).toHaveProperty('slice');
        expect(collection).toHaveProperty('forEach');
        expect(collection).toHaveProperty('map');
        expect(collection).toHaveProperty('filter');
        expect(collection).toHaveProperty('reduce');
        expect(collection).toHaveProperty('reduceRight');
        expect(collection).toHaveProperty('sort');
        expect(collection).toHaveProperty('reverse');
        expect(collection).toHaveProperty('indexOf');
        expect(collection).toHaveProperty('lastIndexOf');
        expect(collection).toHaveProperty('every');
        expect(collection).toHaveProperty('some');
        expect(collection).toHaveProperty('find');
        expect(collection).toHaveProperty('findIndex');
        expect(collection).toHaveProperty('includes');
        expect(collection).toHaveProperty('at');
        expect(collection).toHaveProperty('concat');
    });

    test('shold be able to create from the Collect function', () => {
        const collection = Collect(['foo', 'bar', 'baz']);
        expect(collection).toBeInstanceOf(Collection);
        expect(collection.length).toBe(3);
    });

    test('should be able to add items to the collection using array methods', () => {
        const collection = new Collection();
        collection.push('foo');
        expect(collection.length).toBe(1);
        expect(collection[0]).toBe('foo');
    });

    test('should be able to remove items from the collection using array methods', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.pop();
        expect(collection.length).toBe(0);
    });

    test('should be able to iterate over the collection using forEach', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        collection.forEach((item, index) => {
            expect(item).toBe(collection[index]);
        });
    });

    test('should be able to iterate over the collection using for...of', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        for (const item of collection) {
            const index = collection.indexOf(item);
            expect(item).toBe(collection[index]);
        }
    });

    test('should be able to iterate over the collection using for...in', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        for (const index in collection) {
            const item = collection[index];
            expect(item).toBe(collection[index]);
        }
    });

    test('should be able to iterate over the collection using for', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        for (let index = 0; index < collection.length; index++) {
            const item = collection[index];
            expect(item).toBe(collection[index]);
        }
    });

    test('.distinct() should return a new collection with distinct values', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const distinct = collection.distinct();
        expect(distinct).toBeInstanceOf(Collection);
        expect(distinct.length).toBe(3);
    });

    test(' count() should return the number of items in the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        expect(collection.count()).toBe(3);
    });

    test(' .distinct(key) should not do anything when called on Collection<object>', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const distinct = collection.distinct('someKey');
        expect(distinct).toBeInstanceOf(Collection);
        expect(distinct.length).toBe(6);
    });

    test(' .distinct(key, formatter) should return a new collection with distinct values formatted', () => {
        const collection = new Collection();
        collection.push({ foo: 'foo' });
        collection.push({ foo: 'bar' });
        collection.push({ foo: 'baz' });
        collection.push({ foo: 'foo' });
        collection.push({ foo: 'bar' });
        collection.push({ foo: 'baz' });
        const distinct = collection.distinct('foo', (value: string) => value.toUpperCase());
        expect(distinct).toBeInstanceOf(Collection);
        expect(distinct.length).toBe(3);
        expect(distinct[0].foo).toBe('FOO');
        expect(distinct[1].foo).toBe('BAR');
        expect(distinct[2].foo).toBe('BAZ');
    });

    test('.unique() should return a new collection with unique values', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const unique = collection.unique();
        expect(unique).toBeInstanceOf(Collection);
        expect(unique.length).toBe(3);
    });

    test(' .unique() should not do anything when called on Collection<object>', () => {
        const collection = new Collection();
        collection.push({foo: 'foo'});
        collection.push({foo: 'bar'});
        const unique = collection.unique();
        expect(unique).toBeInstanceOf(Collection);
        expect(unique.length).toBe(2);
        expect(unique).toEqual(collection);
    });

    test('concat() can concatenate arrays and collections', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        const otherCollection = new Collection(['foo', 'bar', 'baz']);
        const arr = ['foo', 'bar', 'baz'];
        const result = collection.concat(otherCollection, arr);
        expect(result).toBeInstanceOf(Collection);
        expect(result.length).toBe(9);
    });

    test('toSelectOptions() can return a collection of select options', () => {
        const collection = new Collection([
            { id: 1, name: 'foo', city: 'bar' },
            { id: 2, name: 'bar', city: 'baz' },
            { id: 3, name: 'baz', city: 'foo' },
        ])
        const options = collection.toSelectOptions('id', 'name');
        expect(options).toBeInstanceOf(Collection);
        expect(options.length).toBe(3);
        expect(options[0]).toEqual({ value: 1, label: 'foo' });
        expect(options[1]).toEqual({ value: 2, label: 'bar' });
        expect(options[2]).toEqual({ value: 3, label: 'baz' });
    });

    test('toSelectOptions will return the collection if called on a collection of primitives', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        const options = collection.toSelectOptions('id', 'name');
        expect(options).toBeInstanceOf(Collection);
        expect(options.length).toBe(3);
        expect(options).toEqual(collection);
    });

    test('toSelectOptions will apply the formatter if provided', () => {
        const collection = new Collection([
            { id: 1, name: 'foo', city: 'bar' },
            { id: 2, name: 'bar', city: 'baz' },
            { id: 3, name: 'baz', city: 'foo' },
        ])
        const options = collection.toSelectOptions('id', 'name', (name: string) => name.toUpperCase());
        expect(options).toBeInstanceOf(Collection);
        expect(options.length).toBe(3);
        expect(options[0]).toEqual({ value: 1, label: 'FOO' });
        expect(options[1]).toEqual({ value: 2, label: 'BAR' });
        expect(options[2]).toEqual({ value: 3, label: 'BAZ' });
    });

    test('toSelectOptions will concatenate the concatColumn if provided', () => {
        const collection = new Collection([
            { id: 1, name: 'foo', city: 'bar' },
            { id: 2, name: 'bar', city: 'baz' },
            { id: 3, name: 'baz', city: 'foo' },
        ])
        const options = collection.toSelectOptions('id', 'name', null, 'city', 'in');
        expect(options).toBeInstanceOf(Collection);
        expect(options.length).toBe(3);
        expect(options[0]).toEqual({ value: 1, label: 'foo (in bar)' });
        expect(options[1]).toEqual({ value: 2, label: 'bar (in baz)' });
        expect(options[2]).toEqual({ value: 3, label: 'baz (in foo)' });
    });

    test('the iterator should return the value and the "done" property', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        
        const first = collection[Symbol.iterator]().next();
        expect(first.value).toBe('foo');
        expect(first.done).toBe(false);
        const second = collection[Symbol.iterator]().next();
        expect(second.value).toBe('foo');
        expect(second.done).toBe(false);
        const third = collection[Symbol.iterator]().next();
        expect(third.value).toBe('foo');
        expect(third.done).toBe(false);

    });

    test(' first() should return the first item in the collection without mutating it', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        expect(collection.first()).toBe('foo');
        expect(collection.length).toBe(3);
        expect(collection[0]).toBe('foo');
    });

    test(' last() should return the last item in the collection without mutating it', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        expect(collection.last()).toBe('baz');
        expect(collection.length).toBe(3);
        expect(collection[2]).toBe('baz');
    });

    test(' .remove() can remove the primitive it encounters that is equal to the provided value', () => {
        const collection = new Collection(['foo', 'bar', 'baz']);
        collection.remove('foo');
        expect(collection.length).toBe(2);
        expect(collection[0]).toBe('bar');
    });

    test(' .remove() can remove the object it encounters that is deeply equal to the provided value', () => {
        const collection = new Collection([{ foo: 'foo' }, { bar: 'bar' }, { baz: 'baz' }]);
        collection.remove({ foo: 'foo' });
        expect(collection.length).toBe(2);
        expect(collection[0]).toEqual({ bar: 'bar' });
    });

    test(' .remove() can remove with an index', () => {
        const collection = new Collection([{ foo: 'foo' }, { bar: 'bar' }, { baz: 'baz' }]);
        collection.remove(0);
        collection.remove(1);
        expect(collection.length).toBe(1);
        expect(collection[0]).toEqual({ bar: 'bar' });
    });

    /**
     *  TESTS BELOW WERE MOSTLY AI GENERATED TO TEST THE REPLICATED ARRAY METHODS
    */
    test(' .push() should add an item to the end of the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        expect(collection.length).toBe(1);
        expect(collection[0]).toBe('foo');
    });

    test(' .pop() should remove an item from the end of the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.pop();
        expect(collection.length).toBe(0);
    });

    test(' .shift() should remove an item from the beginning of the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.shift();
        expect(collection.length).toBe(0);
    });

    test(' .unshift() should add an item to the beginning of the collection', () => {
        const collection = new Collection();
        collection.unshift('foo');
        expect(collection.length).toBe(1);
        expect(collection[0]).toBe('foo');
    });

    test(' .splice() should remove an item from the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.splice(0, 1);
        expect(collection.length).toBe(0);
    });

    test(' .splice() should add an item to the collection', () => {
        const collection = new Collection();
        collection.splice(0, 0, 'foo');
        expect(collection.length).toBe(1);
        expect(collection[0]).toBe('foo');
    });

    test(' .slice() should return a new collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const slice = collection.slice(0, 1);
        expect(slice).toBeInstanceOf(Collection);
        expect(slice.length).toBe(1);
        expect(slice[0]).toBe('foo');
    });

    test(' .forEach() should iterate over the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        collection.forEach((item, index) => {
            expect(item).toBe(collection[index]);
        });
    });

    test(' .map() should iterate over the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const map = collection.map((item, index) => {
            return item;
        });
        expect(map).toBeInstanceOf(Collection);
        expect(map.length).toBe(3);
        expect(map[0]).toBe('foo');
    });

    test(' .filter() should filter the collection', () => {
        const collection = new Collection();
        collection.push('foo');
        collection.push('bar');
        collection.push('baz');
        const filter = collection.filter((item, index) => {
            return item === 'foo';
        });
        expect(filter).toBeInstanceOf(Collection);
        expect(filter.length).toBe(1);
        expect(filter[0]).toBe('foo');
    });

    test(' .reduce() should reduce the collection', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const reduce = collection.reduce((accumulator: number, currentValue: number) => {
            return accumulator + currentValue;
        }, 0);
        expect(reduce).toBe(6);
    });

    test(' .reduceRight() should reduce the collection', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const reduceRight = collection.reduceRight((accumulator, currentValue) => {
            return accumulator + currentValue;
        },0);
        expect(reduceRight).toBe(6);
    });

    test(' .sort() should sort the collection', () => {
        const collection = new Collection();
        collection.push(3);
        collection.push(2);
        collection.push(1);
        collection.sort();
        expect(collection[0]).toBe(1);
        expect(collection[1]).toBe(2);
        expect(collection[2]).toBe(3);
    });

    test(' .reverse() should reverse the collection', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        collection.reverse();
        expect(collection[0]).toBe(3);
        expect(collection[1]).toBe(2);
        expect(collection[2]).toBe(1);
    });

    test(' .indexOf() should return the index of the item', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const indexOf = collection.indexOf(2);
        expect(indexOf).toBe(1);
    });

    test(' .lastIndexOf() should return the last index of the item', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        collection.push(2);
        const lastIndexOf = collection.lastIndexOf(2);
        expect(lastIndexOf).toBe(3);
    });

    test(' .every() should return true if all items pass the test', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const every = collection.every((item) => {
            return item > 0;
        });
        expect(every).toBe(true);
    });

    test(' .some() should return true if some items pass the test', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const some = collection.some((item) => {
            return item > 2;
        });
        expect(some).toBe(true);
    });

    test(' .find() should return the item if it passes the test', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const find = collection.find((item) => {
            return item > 2;
        });
        expect(find).toBe(3);
    });

    test(' .findIndex() should return the index of the item if it passes the test', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const findIndex = collection.findIndex((item) => {
            return item > 2;
        });
        expect(findIndex).toBe(2);
    });

    test(' .includes() should return true if the collection contains the item', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const includes = collection.includes(2);
        expect(includes).toBe(true);
    });

    test(' .at() should return the item at the index', () => {
        const collection = new Collection();
        collection.push(1);
        collection.push(2);
        collection.push(3);
        const at = collection.at(1);
        expect(at).toBe(2);
    });

    test(' constructor should cast to a Model object when provided', () => {
        class SimpleModel extends Model { }
        const collection = new Collection([{
            foo: 'foo',
            bar: 'bar',
            baz: 'baz',
        }], SimpleModel);
        console.log(collection);
        expect(collection.every((el: unknown) => el instanceof SimpleModel)).toBe(true);
    });

    test(' [] getter can access indices', () => {
        const collection = new Collection([1,2,3]);
        expect(collection[0]).toBe(1);
        expect(collection[1]).toBe(2);
        expect(collection[2]).toBe(3);
    });

    test(' [] setter can set values at indices', () => {
        const collection = new Collection([1,2,3]);
        collection[0] = 4;
        collection[1] = 5;
        collection[2] = 6;
        expect(collection[0]).toBe(4);
        expect(collection[1]).toBe(5);
        expect(collection[2]).toBe(6);
    });

    test(' select() should return a new collection with the selected keys', () => {
        const collection = new Collection([{
            foo: 'foo',
            bar: 'bar',
            baz: 'baz',
        }]);
        const select = collection.select('foo', 'bar');
        expect(select).toBeInstanceOf(Collection);
        expect(select[0]).toEqual({
            foo: 'foo',
            bar: 'bar',
        });
    });

    test(' select() should warn and return the collection as is if it is not made of objects.', () => {
        const collection = new Collection([1,2,3]);
        const select = collection.select('foo', 'bar');
        expect(select).toBeInstanceOf(Collection);
        expect(select).toEqual(collection);
    });

    test('vertical() should return a new collection with the values associated to the selected key', () => {
        const collection = new Collection([{
            foo: 'foo',
            bar: 'bar',
            baz: 'baz',
        },
        {
            foo: 'foo',
            bar: 'bar',
            baz: 'baz',
        }]);
        const select = collection.vertical('foo');
        expect(select).toBeInstanceOf(Collection);
        expect(select[0]).toEqual('foo');
        expect(select[1]).toEqual('foo');
    });
    
});