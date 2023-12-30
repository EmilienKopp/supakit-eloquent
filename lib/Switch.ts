
export const Switch: Function = (value: any) => new Matcher(value);

export class Matcher {
    private value: any;
    private index: number = 0;
    private cases: { [key: string]: {
        match: Function,
        to: any
    } } = {};
    
    constructor(value: any) {
        this.value = value;
        return this
    }

    match(onMatch: any, predicate: Function) {
        this.cases[this.index] = {
            match: predicate,
            to: onMatch
        }
        this.index++;
        return this;
    }

    default(onDefault: any) {
        this.cases[this.index] = {
            match: () => true,
            to: onDefault
        }
        this.index++;
        return this;
    }

    end(): any {
        for (const key in this.cases) {
            if (this.cases.hasOwnProperty(key)) {
                const { match, to } = this.cases[key];
                if (match(this.value)) {
                    return to;
                }
            }
        }
        return null;
    }

}