
const equalOperators = ['=', '==', '===', 'eq', 'equals', 'equal'];
const includeOperators = ['in', 'include', 'includes', 'within','contain','contains'];
const notEqualOperators = ['not', '!=','!==', '<>','is not', 'not eq', '! eq'];

type ResolvedOperator = {
    operator: string,
    negated: boolean
}

export const resolveOperator = (operator: string): ResolvedOperator => {
    if(equalOperators.includes(operator))
        return { operator: 'eq', negated: false };
    
    if(includeOperators.includes(operator))
        return { operator: 'in', negated: false };

    if(notEqualOperators.includes(operator))
        return { operator: 'eq', negated: true };

    return {operator, negated: false};
}