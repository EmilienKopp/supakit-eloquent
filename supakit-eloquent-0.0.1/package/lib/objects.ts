

/**
 * Traverse an object and return the value of a deeply nested key
 * @param obj The object to resolve the value from
 * @param key the key to resolve, can be nested with dot notation
 * @returns the value of the deeply nested key
 */
export function resolveNestedValue(obj: any, key: string) {
    if(key.includes(".")) {
        const [first, ...rest] = key.split(".");
        return resolveNestedValue(obj[first], rest.join("."));
    }
    return obj?.[key];
}

/**
 * Removes keys from an object
 * @param obj The object to remove keys from
 * @param keys keys to remove
 * @returns the object with the keys removed
 */
export function except(obj: any, keys: string[]) {
    return Object.keys(obj)
        .filter(k => !keys.includes(k))
        .reduce((acc: any, key: any) => {
            acc[key] = obj[key];
            return acc;
        }, {});
}

/**
 * Check whether an array has no elements or an object has no keys
 * @param arrOrObj the array or object to check
 * @returns a boolean indicating emptiness. Always returns false on other types.
 */
export function isEmpty(arrOrObj: Array<any> | object): boolean {
    if (Array.isArray(arrOrObj)) {
        return arrOrObj.length === 0;
    } else if (typeof arrOrObj === "object" && arrOrObj !== null) {
        if (Object.keys(arrOrObj).length === 0) {
            return true;
        }
        return Object.values(arrOrObj).every(obj => isEmpty(obj));
    }
    // Handle non-object, non-array types
    return false;
}

