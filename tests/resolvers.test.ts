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