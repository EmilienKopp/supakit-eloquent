
const equalOperators = ['=', '==', '===', 'eq', 'equals', 'equal'];
const includeOperators = ['in', 'include', 'includes', 'within','contain','contains'];
const notEqualOperators = ['not', '!=','!==', '<>','is not', 'not eq', '! eq'];
const greaterThanOperators = ['>', 'gt', 'greater than'];
const lesserThanOperators = ['<', 'lt', 'less than'];
const gteOperators = ['>=', 'gte', 'greater than or equal to'];
const lteOperators = ['<=', 'lte', 'less than or equal to'];

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

    if(greaterThanOperators.includes(operator))
        return { operator: 'gt', negated: false };

    if(lesserThanOperators.includes(operator))
        return { operator: 'lt', negated: false };

    if(gteOperators.includes(operator))
        return { operator: 'gte', negated: false };

    if(lteOperators.includes(operator))
        return { operator: 'lte', negated: false };


    return {operator, negated: false};
}