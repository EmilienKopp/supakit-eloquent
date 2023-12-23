import { expect, test } from "vitest";

import { resolveOperator } from "../lib/resolvers";

test("resolveOperator to resolve equal operators", () => {
    const equalOperators = ['=', '==', '===', 'eq', 'equals', 'equal'];
    equalOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'eq', negated: false});
    });
});

test("resolveOperator to resolve include operators", () => {
    const includeOperators = ['in', 'include', 'includes', 'within','contain','contains'];
    includeOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'in', negated: false});
    });
});

test("resolveOperator to resolve not equal operators", () => {
    const notEqualOperators = ['not', '!=','!==', '<>','is not', 'not eq'];
    notEqualOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'eq', negated: true});
    });
});

test("resolveOperator to resolve custom operators", () => {
    const customOperators = ['custom', 'operators'];
    customOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator, negated: false});
    });
});

test("resolveOperator to resolve greater than operators", () => {
    const greaterThanOperators = ['>', 'gt', 'greater than'];
    greaterThanOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'gt', negated: false});
    });
});

test("resolveOperator to resolve lesser than operators", () => {
    const lesserThanOperators = ['<', 'lt', 'less than'];
    lesserThanOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'lt', negated: false});
    });
});

test("resolveOperator to resolve greater than or equal to operators", () => {
    const gteOperators = ['>=', 'gte', 'greater than or equal to'];
    gteOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'gte', negated: false});
    });
});

test("resolveOperator to resolve lesser than or equal to operators", () => {
    const lteOperators = ['<=', 'lte', 'less than or equal to'];
    lteOperators.forEach(operator => {
        expect(resolveOperator(operator)).toEqual({operator: 'lte', negated: false});
    });
});