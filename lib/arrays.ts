
export type SelectOption = {
  label: string,
  value: string | number,
}

export type DuplicateCheckOptions = {
  key?: string,
  comparator?: (a: any, b: any) => boolean,
}

export type VerticalOptions = {
  serialize_postgres?: boolean,
  serialize_supabase?: boolean,
}

export type Condition = {
  key: string,
  value: any,
  operation: '==' | '!=' | '>' | '<' | '>=' | '<=',
}

/**
 * Returns a random item from an array
 * @param arr The source array
 * @returns a random item from the array
 */
export function random(arr: Array<any>): any {
  if(!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Removes items from the same index in all arrays in a 2D array
 * @param arr An array of arrays
 * @param columnIndex the index of the column to delete in all arrays
 * @returns an array of the same arrays with the column removed
 */
export function deleteColumn(arr: Array<Array<any>>, columnIndex: number) {
  if (!arr || !arr.length) {
    return []
  }
  const minLength = Math.min(...arr.map(el => el.length));
  if (columnIndex >= minLength) {
    console.warn(`Column index ${columnIndex} is out of bounds for array of length ${minLength}`);
    return arr;
  }
  for (let i = 0; i < arr.length; i++) {
    arr[i].splice(columnIndex, 1);
  }
  return arr;
}


/**
 * Map headers to values in an array of arrays to return an array of objects
 * @param headers The headers to map to the array
 * @param arr The array to map the headers to
 * @returns An array of objects with the headers as keys and the array values as values
 */
export function mapHeaders(headers: Array<any>, arr: Array<any>) {
  if (!headers?.length || !arr?.length) throw new Error('mapHeaders requires both headers and array to be non-empty arrays');
  if(!arr.every(el => el.length === headers.length)) throw new Error('mapHeaders requires headers and array arguments to have the same length');
 
  return arr.map((row) => {
    let obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

/**
 * Selects to keys from objects in an array to build an iterable for a <select> element.
 * @param arr the array to process
 * @param valueKey the key to associate to the <option value> attribute
 * @param labelKey the key used to display the option. If a formatter is provided, this is the value passed to the formatter
 * @param formatter (optional) a function that takes the labelKey value and returns a formatted string (e.g. to capitalize the first letter
 * @param concatColumn (optional) a column to concatenate to the labelKey value for added information (e.g. a city name)
 * @param concatPrefix (optional) a prefix to add before the concatColumn value (e.g. 'in')
 * @returns an array of SelectOption {label,value} objects
 */
export function toSelectOptions(arr: Array<any>, valueKey: string, labelKey: string,
  formatter: Function | null = null,
  concatColumn: string | null = null,
  concatPrefix: string = ''): SelectOption[] | any[] {
  if (!arr) return [];

  return arr.map(el => {
    let name = formatter ? formatter(el[labelKey]) : el[labelKey];
    if (concatColumn) name += (concatColumn && el[concatColumn]) ? ` (${concatPrefix} ${el[concatColumn]})` : '';
    return {
      value: el[valueKey],
      label: name,
    };
  });
}


/**
 * Returns only the given key of all objects in an array
 * @param arr the array of objects to check for duplicates
 * @param key the keys to extract
 * @param options serialization options
 * @returns an array of values for the given key
 */
export function vertical(arr: Array<any>, key: string | number, options?: VerticalOptions): Array<any> | string {
  if (!arr) return [];

  const verticalized = arr.map(el => { return el[key] })
  
  if(options?.serialize_postgres)
    return '{' + verticalized.join(',') + '}';
  else if(options?.serialize_supabase)
    return '(' + verticalized.join(',') + ')';
  

  return verticalized;
}

/**
 * Removes objects from an array that have duplicate values for a given key
 * @param arr The array to process
 * @param key The key used to check for duplicates
 * @returns an array with duplicates removed
 */
export function removeObjectDuplicates<T>(arr: T[], key: keyof T) {
  return arr.filter(
      (obj, index, self) =>
          index === self.findIndex((t) => t[key] === obj[key])
  );
}