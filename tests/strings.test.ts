import * as pluralizer from 'pluralize';

import { boldify, computeDifference, cosineSimilarity, dashToSlash, isJSONString, linkify, nospace, singularPascalToPluralSnake, toRoman, toSnakeCase, tokenize } from '../lib/strings';
import { describe, expect, test } from 'vitest';

describe.concurrent('Strings', () => {

    test('pluralizing a word', () => {
        const test = pluralizer.plural('word');
        expect(test).toBe('words');
    });

    test('snake case from PascalCase', () => {
        const test = toSnakeCase('EmployeeRecord');
        expect(test).toBe('employee_record');
    });

    test('snake case from camelCase', () => {
        const test = toSnakeCase('employeeRecord');
        expect(test).toBe('employee_record');
    });

    test('snake case from kebab-case', () => {
        const test = toSnakeCase('employee-record');
        expect(test).toBe('employee_record');
    });

    test('Singular PascalCase to plural snake_case', () => {
        let test = singularPascalToPluralSnake('EmployeeRecord');
        expect(test).toBe('employee_records');
        test = singularPascalToPluralSnake('Employee');
        expect(test).toBe('employees');
        test = singularPascalToPluralSnake('Person');
        expect(test).toBe('people');
        test = singularPascalToPluralSnake('TrainingSession');
        expect(test).toBe('training_sessions');
        test = singularPascalToPluralSnake('TrainingSessionTemplate');
        expect(test).toBe('training_session_templates');
        test = singularPascalToPluralSnake('ActionCard');
        expect(test).toBe('action_cards');
        test = singularPascalToPluralSnake('ReflectionMemo');
        expect(test).toBe('reflection_memos');
        test = singularPascalToPluralSnake('Reflection_Question');
        expect(test).toBe('reflection_questions');

    });

    test('tokenize() can tokenize regular alphanumeric strings', () => {
        const test = tokenize('hello world, I am a 900 year-old time lord, and I hate Daleks!');
        expect(test).toEqual({
            "900": 1,
            "a": 1,
            "am": 1,
            "and": 1,
            "daleks": 1,
            "hate": 1,
            "hello": 1,
            "i": 2,
            "lord": 1,
            "old": 1,
            "time": 1,
            "world": 1,
            "year": 1,
        });
    });

    test(' singularPascalCaseToPluralSnake() returns the input as is if it is not in PascalCase', () => {
        expect(singularPascalToPluralSnake('employeeRecord')).toBe('employeeRecord');
        expect(singularPascalToPluralSnake('employee_record')).toBe('employee_record');
        expect(singularPascalToPluralSnake('employee-record')).toBe('employee-record');
        expect(singularPascalToPluralSnake('employee record')).toBe('employee record');
    });


    test('cosineSimilarity() can calculate the cosine similarity of two strings', () => {
        const test = cosineSimilarity(
            'hello world, I am a 900 year-old time lord, and I hate Daleks!', 
            'hello world, I am a 900 year-old time lord, and I hate Daleks!');
        expect(test).toBe(1);

        const test2 = cosineSimilarity(
            'hello world, I am a 900 year-old time lord, and I hate Daleks!', 
            'hello world, I am a 900 year-old time lord, and I hate Cybermen!');
        expect(test2).toBeGreaterThan(0.5);
        expect(test2).toBeLessThan(1);

        const test3 = cosineSimilarity( '', 'test');
        expect(test3).toBe(0);

        const test4 = cosineSimilarity( 'test', '');
        expect(test4).toBe(0);

        const test5 = cosineSimilarity( '', '');
        expect(test5).toBe(0);

        const test6 = cosineSimilarity( '田中タロウ', 'どらえもん');
        expect(test6).toBe(0);
    });

    test('computeDifference can give the difference between two strings', () => {
        const test = computeDifference(
            'hello world, I am a 900 year-old time lord, and I hate Daleks!', 
            'hello world, I am a 900 year-old time lord, and I hate Daleks!');
        expect(test).toBe(0);

        const test2 = computeDifference(
            'hello world, I am a 900 year-old time lord, and I hate Daleks!', 
            'hello world, I am a 900 year-old time lord, and I hate Cybermen!');
        expect(test2).toBeGreaterThan(0);
        expect(test2).toBeLessThan(100);

        const test3 = computeDifference(
            'abcd efghi ?', 
            'jkl monp !');
        expect(test3).toBe(100)
    });

    test('linkify() returns the same string if there are no URLs or email addresses', () => {
        const str = 'This is a string with no URLs or email addresses';
        const test = linkify(str);
        expect(test).toBe(str);

        const str2 = '';
        const test2 = linkify(str2);
        expect(test2).toBe(str2);
    });

    test('linkify() can linkify a string containing a http URL', () => {
        const str = 'This is a string containing a URL: http://www.google.com';
        const test = linkify(str);
        expect(test).toBe('This is a string containing a URL: <a class="text-blue-500 hover:text-lime-600 underline cursor-pointer" href="http://www.google.com" target="_blank">http://www.google.com</a>');
    });

    test('linkify() can linkify a string containing a https URL', () => {
        const str = 'This is a string containing a URL: https://google.com';
        const test = linkify(str);
        expect(test).toBe('This is a string containing a URL: <a class="text-blue-500 hover:text-lime-600 underline cursor-pointer" href="https://google.com" target="_blank">https://google.com</a>');
    });

    test('linkify() can linkify a string containing a URL with a path', () => {
        const str = 'This is a string containing a URL: https://www.google.com/search?q=hello+world';
        const test = linkify(str);
        expect(test).toBe('This is a string containing a URL: <a class="text-blue-500 hover:text-lime-600 underline cursor-pointer" href="https://www.google.com/search?q=hello+world" target="_blank">https://www.google.com/search?q=hello+world</a>');
    });

    test('linkify() can linkify a string with an email address', () => {
        const str = 'This is a string containing an email address: test@example.com';
        const test = linkify(str);
        expect(test).toBe('This is a string containing an email address: <a class="text-blue-500 hover:text-lime-600 underline cursor-pointer" href="mailto:test@example.com">test@example.com</a>');
    });

    test ('toRoman() can convert a number to a roman numeral', () => {
        expect(toRoman(1)).toBe('I');
        expect(toRoman(2)).toBe('II');
        expect(toRoman(3)).toBe('III');
        expect(toRoman(4)).toBe('IV');
        expect(toRoman(5)).toBe('V');
        expect(toRoman(6)).toBe('VI');
        expect(toRoman(7)).toBe('VII');
        expect(toRoman(8)).toBe('VIII');
        expect(toRoman(9)).toBe('IX');
        expect(toRoman(10)).toBe('X');
        expect(toRoman(22)).toBe('XXII');
        expect(toRoman(33)).toBe('XXXIII');
        expect(toRoman(44)).toBe('XLIV');
        expect(toRoman(55)).toBe('LV');
        expect(toRoman(66)).toBe('LXVI');
        expect(toRoman(77)).toBe('LXXVII');
        expect(toRoman(88)).toBe('LXXXVIII');
        expect(toRoman(99)).toBe('XCIX');
        expect(toRoman(100)).toBe('C');
        expect(toRoman(222)).toBe('CCXXII');
        expect(toRoman(333)).toBe('CCCXXXIII');
        expect(toRoman(444)).toBe('CDXLIV');
        expect(toRoman(555)).toBe('DLV');
        expect(toRoman(999)).toBe('CMXCIX');
        expect(toRoman(1000)).toBe('M');
        expect(toRoman('1999')).toBe('MCMXCIX');
        expect(toRoman(3999)).toBe('MMMCMXCIX');
        expect(toRoman(4000)).toBe(4000);
        expect(toRoman(0)).toBe(0);
        expect(toRoman(-1)).toBe(-1);
        expect(toRoman('50')).toBe('L');
        expect(toRoman('Hello World')).toBe('Hello World');
        expect(toRoman(true)).toBe(true);
        expect(toRoman(false)).toBe(false);
        expect(toRoman(null)).toBe(null);
        expect(toRoman(undefined)).toBe(undefined);
        expect(toRoman('')).toBe('');
        expect(toRoman([])).toEqual([]);
        expect(toRoman({})).toEqual({});
    });

    test('boldify can wrap lookup values in <strong></strong>', () => {
        const test = boldify('hello world', ['hello']);
        expect(test).toBe('<strong>hello</strong> world');

        const test2 = boldify('hello world', ['world']);
        expect(test2).toBe('hello <strong>world</strong>');

        const test3 = boldify('hello world, I am the Doctor .',
            ['hello', 'Doctor']);
        expect(test3).toBe('<strong>hello</strong> world, I am the <strong>Doctor</strong> .');
    })

    test('nospace can remove spaces from a string', () => {
        const test = nospace('hello world');
        expect(test).toBe('helloworld');

        const test2 = nospace('hello world, I am the Doctor .');
        expect(test2).toBe('helloworld,IamtheDoctor.');
    })

    test('dashToSlash can convert a string with dashes to a string with slashes', () => {
        const test = dashToSlash('hello-world');
        expect(test).toBe('hello/world');

        const test2 = dashToSlash('hello-world-I-am-the-Doctor');
        expect(test2).toBe('hello/world/I/am/the/Doctor');
    })

    test('isJSON() can check if a string is valid JSON', () => {
        const validJSON = JSON.stringify({ name: 'John', age: 30, city: 'New York', tags: ['a', 'b', 'c'] });
        const invalidJSON = 'Hello World';
        const invalidJSON2 = '{Hello: "world",}';
        const invalidJSON3 = '{Hello: "world"}';
        const invalidJSON4 = '{Hello: "world", }';
        const invalidJSON5 = '{Hello: "world", "name": "John", }';
        expect(isJSONString(validJSON)).toBe(true);
        expect(isJSONString(invalidJSON)).toBe(false);
        expect(isJSONString(invalidJSON2)).toBe(false);
        expect(isJSONString(invalidJSON3)).toBe(false);
        expect(isJSONString(invalidJSON4)).toBe(false);
        expect(isJSONString(invalidJSON5)).toBe(false);
        expect(isJSONString('')).toBe(false);
        expect(isJSONString(null)).toBe(true);
        expect(isJSONString(undefined)).toBe(false);
    });
});