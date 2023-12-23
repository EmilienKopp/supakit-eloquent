


export function parseTableDescription (description: Array<object>): {[key: string]: {nullable: boolean, type: string, name: string}}
{
    if(!description?.length) throw new Error('parseTableDescription requires a non-empty array argument');
    const parsed: any = {};
    description.forEach((column: any) => {
        parsed[column.column_name] = {}
        parsed[column.column_name].nullable = stringToBoolean(column.is_nullable);
        parsed[column.column_name].type = column.data_type.replace(/\(.+\)/g, '');
        parsed[column.column_name].name = column.column_name;
    });
    return parsed;
}

/**
 * 
 * @param str 
 * @returns 
 */
export function stringToBoolean(str: string) {
    const trueStrings = ['true', 't', 'yes', 'y', '1', 'Y', 'YES', 'T', 'True'];
    const falseStrings = ['false', 'f', 'no', 'n', '0', 'N', 'NO', 'F', 'False'];
    if (trueStrings.includes(str)) {
        return true;
    } else if (falseStrings.includes(str)) {
        return false;
    } else {
        return undefined;
    }
}