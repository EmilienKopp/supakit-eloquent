import { toSelectOptions } from "./arrays";

export const Collect: Function = function <T>(data: any[] | { [x: string]: any; }[] | null = [], model?: new (...args: any[]) => T) {
    return new Collection(data, model);
}
export class Collection<T>  {

    private _originalResponseObject: any;
    private items: T[];

    constructor(
        data: any[] | { [x: string]: any; }[] | null = [],
        model?: new (...args: any[]) => T,
    ) {
        data = data ?? [];
        if (model) {
            data = data.map(el => new model(el));
        }


        // super(...data);
        this.items = [...data];
        // this._originalResponseObject = undefined;
        Object.defineProperty(this, 'items', {
            enumerable: true,
            writable: false,
            value: [...data]
        });
        Object.defineProperty(this, '_originalResponseObject', {
            enumerable: false,
            writable: true,
            value: undefined
        });

        return new Proxy(this, {
            get(target, prop, receiver) {
                if (typeof prop === 'symbol') {
                    if (prop === Symbol.iterator) {
                        return function* () {
                            yield* target.items;
                        };
                    }
                } else if (!isNaN(prop as any)) {
                    return target.items[prop as any];
                } else {
                    return Reflect.get(target, prop, receiver);
                }
            },
            set(target, prop, value) {
                if (!isNaN(prop as any)) {
                    target.items[prop as any] = value;
                    return true;
                } else {
                    return Reflect.set(target, prop, value);
                }
            }
        });
    }

    public select(...keys: string[]): Collection<T> {
        if(!keys.length) return new Collection(this.items);
        if(!this.items.every(el => typeof el == 'object')) {
            console.warn(`Calling Collection.select() is only available for collections of objects.`)
            return new Collection(this.items);
        }
        let result: any[] = [];
        this.forEach((el: any) => {
            let obj: any = {};
            keys.forEach(key => {
                obj[key] = el[key];
            });
            result.push(obj);
        });
        return new Collection(result);
    }

    public vertical(key: string): Collection<T> {
        let result: any[] = [];
        this.forEach((el:any) => {
            result.push(el[key])
        });
        return new Collection(result);
    }

    public toArray(): T[] {
        return this.items;
    }

    public first(): T {
        return this.items[0] ?? null;
    }

    public last() {
        return this.items[this.items.length - 1] ?? null;
    }

    /**
     * Improvement on 'splice' to allow for removing an element by value instead of index (deep comparison)
     * @param elementOrIndex If an index, perform a regular Array.splice. If an element, remove the first match (deep comparison).
     * @param options.noIndex If true, remove the element by value instead of index (user if looking for a match on a numerical value instead of an index)
     * @param options.all If true, remove all matches instead of just the first
     * @returns Collection<T>
     */
    public remove(elementOrIndex: any, options: { noIndex?: boolean, all?: boolean, depth?: number } | null = null): Collection<T> {
        if (elementOrIndex == undefined || elementOrIndex == null) return this;

        if (typeof elementOrIndex === 'number' && !options?.noIndex) {
            this.splice(elementOrIndex, 1);
        } if (typeof elementOrIndex === 'object') {
            if (Object.keys(this).includes('id'))
                elementOrIndex = this.items.find((el: any) => el.id === (elementOrIndex as any).id);

            // Make one level deep comparison of objects and remove the first match, working with native types as well
            let index;
            do {
                index = this.findIndex(el => JSON.stringify(el) === JSON.stringify(elementOrIndex));
                if (index === -1) break;
                this.splice(index, 1);
            } while (options?.all && index > -1)

        } else {
            while (this.includes(elementOrIndex)) {
                this.splice(this.indexOf(elementOrIndex), 1);
            }
        }
        return this;
    }

    public distinct(key?: string, formatter?: Function) {
        if(!key) {
            return new Collection(this.items.filter((el, i, arr) => arr.indexOf(el) === i));
        }
        if(!this.items.every(el => typeof el == 'object')) {
            console.warn(`Calling Collection.distinct() with a key parameter is only available for collections of objects.
             Use distinct() with no parameter, or Collection.unique() for collections of primitives.`);
            return new Collection(this.items);
        }
        let result: any[] = [];
        this.forEach((item: any) => {
            if(formatter) item[key] = formatter(item[key]);
            if (!result.find((el:any) => el[key] === item[key])) {
                result.push(item);
            }
        });
        return new Collection(result);
    }

    public unique() {
        if(this.items.every(el => typeof el == 'object')) {
            console.warn(`Calling Collection.unique() is only available for collections of primitives.`);
            return this;
        }
        let result: any[] = [];
        this.forEach(item => {
            if (!result.includes(item)) {
                result.push(item);
            }
        });
        return new Collection(result);
    }

    //TODO: deprecate - This is totally useless
    public plain(): Collection<T> {
        if (!this || !this.items.length) return new Collection([]);

        return this.map(el => JSON.parse(JSON.stringify(el)));
    }

    public toSelectOptions(valueKey: string, labelKey: string, formatter: Function | null = null,
        concatColumn: string | null = null,
        concatPrefix: string = ''): Collection<any> {
        if(!this.items.every(el => typeof el == 'object')) {
            console.warn(`Calling Collection.toSelectOptions() is only available for collections of objects.`);
            return new Collection(this.items);
        }
        const options = toSelectOptions(this.items, valueKey, labelKey, formatter, concatColumn, concatPrefix);
        return new Collection(options);
    }

    public count() {
        return this.items.length ?? 0;
    }
    
    public set response(response: any) {
        this._originalResponseObject = response;
    }

    public get response() {
        return this._originalResponseObject;
    }

    [Symbol.iterator](): IterableIterator<T> {
        let index = 0;
        return {
            next: (): IteratorResult<T> => {
                if (index < this.items.length) {
                    const value = this.items[index];
                    index++;
                    return { value, done: false };
                } else {
                    return { done: true, value: undefined };
                }
            },
            [Symbol.iterator]() {
                return this;
            }
        };
    }

    /** OVERRIDES **/
    // map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): Collection<U> {
    //     const mapped = super.map(callbackfn, thisArg);
    //     return new Collection(mapped);
    // }

    // filter<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): Collection<U> {
    //     const filtered = super.filter(callbackfn, thisArg);
    //     return new Collection(filtered);
    // }

    // Overriding the default behavior of methods like `map` by returning the built-in Array class as the constructor.
    // static get [Symbol.species]() { return Array; }

    public push(...items: T[]): number {
        return this.items.push(...items);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public shift(): T | undefined {
        return this.items.shift();
    }

    public unshift(...items: T[]): number {
        return this.items.unshift(...items);
    }

    public splice(start: number, deleteCount?: number, ...items: any): Collection<T> {
        if(!deleteCount) deleteCount = this.items.length - start;
        const arr = this.items.splice(start, deleteCount, ...items);
        return new Collection(arr);
    }

    public slice(start?: number, end?: number): Collection<T> {
        const arr = this.items.slice(start, end);
        return new Collection(arr);
    }

    public reverse(): Collection<T> {
        return new Collection(this.items.reverse());
    }

    public concat(...items: (T | ConcatArray<T> | Collection<T>)[]): Collection<T> {
        for(let i = 0; i < items.length; i++) {
            if(items[i] instanceof Collection) {
                items[i] = (items[i] as Collection<T>).toArray();
            }
        }
        const result = this.items.concat(...items as any[]);
        return new Collection(result);
    }

    public sort(compareFn?: (a: T, b: T) => number): this {
        this.items.sort(compareFn);
        return this;
    }

    public indexOf(searchElement: T, fromIndex?: number): number {
        return this.items.indexOf(searchElement, fromIndex);
    }

    public lastIndexOf(searchElement: T, fromIndex?: number): number {
        if(fromIndex == undefined || fromIndex == null) {
            return this.items.lastIndexOf(searchElement);
        }
        return this.items.lastIndexOf(searchElement, fromIndex ?? 0);
    }

    public every(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
        return this.items.every(callbackfn, thisArg);
    }

    public some(callbackfn: (value: T, index: number, array: T[]) => unknown, thisArg?: any): boolean {
        return this.items.some(callbackfn, thisArg);
    }

    public forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
        this.items.forEach(callbackfn, thisArg);
    }

    public find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined {
        return this.items.find(predicate, thisArg);
    }

    public map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): Collection<U> {
        const mapped = this.items.map(callbackfn, thisArg);
        return new Collection(mapped);
    }

    public includes(searchElement: T, fromIndex?: number): boolean {
        return this.items.includes(searchElement, fromIndex);
    }

    public filter<S extends T>(predicate: (this: void, value: T, index: number, array: T[]) => value is S, thisArg?: any): Collection<S> {
        const filtered = this.items.filter(predicate, thisArg);
        return new Collection(filtered);
    }

    public reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initial: any): T {
        return this.items.reduce(callbackfn, initial);
    }

    public reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initial: any): T {
        return this.items.reduceRight(callbackfn, initial);
    }

    public at(index: number): T {
        return this.items[index];
    }

    public findIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number {
        return this.items.findIndex(predicate, thisArg);
    }

    public get length(): number {
        return this.items.length;
    }


}