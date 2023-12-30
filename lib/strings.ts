import pluralize from "pluralize";

/**
 * Converts a string to snake_case, replacing dashes and non-starting capital letters with underscores
 * @param str the string to convert
 * @returns a string in snake_case
 */
export function toSnakeCase(str: string) {
    
    if(str.includes("_")) return str.toLowerCase();
    if(str.includes("-")) return str.replace(/-/g, "_").toLowerCase();

    const result = str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    if(result.startsWith("_")) return result.slice(1);
    return result;
}

/**
 * Converts a PascalCase string to snake_case
 * @param str the string to convert
 * @returns a snake_case string
 */
export function singularPascalToPluralSnake(str: string) {
    // Regex to check whether a string is PascalCase (The first letter is capitalized)
    if(! /^[A-Z]/.test(str)) return str;
    
    return pluralize.plural(toSnakeCase(str));
}

export function singular(str: string) {
    return pluralize.singular(str);
}

/**
 * 
 * @param paragraph the paragraph to tokenize
 * @returns an array of tokens and their frequency
 */
export function tokenize(paragraph: string) {
    let tokens = paragraph.toLowerCase().split(/\W+/);
    let tokenFrequency: any = {};

    tokens.forEach(token => {
        if (token) {
            if (tokenFrequency[token]) {
                tokenFrequency[token]++;
            } else {
                tokenFrequency[token] = 1;
            }
        }
    });

    return tokenFrequency;
}

/**
 * Returns the cosine similarity between two paragraphs of alphanumeric text
 * @param paragraph1 First paragraph to compare
 * @param paragraph2 Second paragraph to compare
 * @returns a number between 0 and 1 representing the cosine similarity between the two paragraphs
 */
export function cosineSimilarity(paragraph1: string, paragraph2: string) {
    // Check that the paragraphs are not empty and of alphanumeric characters
    if (!paragraph1 || !paragraph2) return 0;
    if (!paragraph1.match(/[a-zA-Z0-9]/g) || !paragraph2.match(/[a-zA-Z0-9]/g)) return 0;

    let tokens1 = tokenize(paragraph1);
    let tokens2 = tokenize(paragraph2);

    let allTokens = new Set([...Object.keys(tokens1), ...Object.keys(tokens2)]);

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTokens.forEach(token => {
        let val1 = tokens1[token] || 0;
        let val2 = tokens2[token] || 0;

        dotProduct += val1 * val2;
        magnitude1 += val1 * val1;
        magnitude2 += val2 * val2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 && magnitude2) {
        return dotProduct / (magnitude1 * magnitude2);
    }
}

/**
 * Compute a percentage difference between two paragraphs of alphanumeric text
 * @param paragraph1 First paragraph to compare
 * @param paragraph2 Second paragraph to compare
 * @returns the percentage difference between the two paragraphs
 */
export function computeDifference(paragraph1: string, paragraph2: string) {
    let similarity = cosineSimilarity(paragraph1, paragraph2);
    
    if(!similarity) return 100;
    
    return (1 - similarity) * 100;
}


/**
 * Surrounds URLs, emails, and www. with <a> tags
 * @param inputText the text to add <a> tags to
 * @returns an html string with <a> tags around links
 */
export function linkify(inputText: string, linkCSS: string = "text-blue-500 hover:text-lime-600 underline cursor-pointer") {
    if (!inputText) return inputText;
    let replacedText, replacePattern1;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 =
        /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(
        replacePattern1,
        '<a class="' + linkCSS + '" href="$1" target="_blank">$1</a>'
    );

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    let replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(
        replacePattern2,
        '$1<a class="' +
        linkCSS +
        '" href="http://$2" target="_blank">$2</a>'
    );

    //Change email addresses to mailto:: links.
    let replacePattern3 =
        /(([a-zA-Z0-9\-.]+\@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+))/gim;
    replacedText = replacedText.replace(
        replacePattern3,
        '<a class="' + linkCSS + '" href="mailto:$1">$1</a>'
    );

    return replacedText;
}

/**
 * Represents a number in roman numerals
 * @param num an integer between 1 and 3999
 * @returns the roman numeral representation of the number or the number itself if it is out of bounds.
 */
export function toRoman(num: number | string) {
    if(isNaN(num as number) || !/^\d+$/.test(num as string)) 
    {
        return num;
    }
    else 
        num = Number(num);

    if (num < 1 || num > 3999) return num;
    
    const romanNumerals: any = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
    };

    let result = '';
    for (let key in romanNumerals) {
        while (num >= romanNumerals[key]) {
            result += key;
            num -= romanNumerals[key];
        }
    }
    return result;
}

/**
 * Wraps a string from `text` in <strong> tags if it is contained in `lookupValues`
 * @param text Text that contains the words to boldify
 * @param lookupValues strings that should be wrapped in <strong> tags
 * @returns a string with the lookupValues wrapped in <strong> tags
 */
export function boldify(text: string, lookupValues: string[]) {
    const regex = new RegExp(lookupValues.join("|"), "gi");
    return text.replace(regex, (match) => {
        return `<strong>${match}</strong>`
    });
}

/**
 * Removes all white space from a string
 * @param str the string to remove spaces from
 * @returns the string with spaces removed
 */
export function nospace(str: string) {
    return str?.replace(/\s/g, "");
}

/**
 * Converts all dashes in a string to slashes
 * @param str the string to convert
 * @returns A string with dashes converted to slashes
 */
export function dashToSlash(str: string) {
    return str?.replace(/-/g, "/");
}

/**
 * Checks whether a string is a valid JSON string
 * @param str the string to check
 * @returns a boolean indicating whether the string is a valid JSON string
 */
export function isJSONString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}