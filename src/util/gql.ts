import { EventDataType } from "../fflogs/event";

/** Acceptable value types for GQL filters */
export type FilterParams = {[key: string]: string | number | string[] | number[]};

/** 
 * Builds a GQL filter string, ie '(type: "foo", id: 1234) from an arbitrary map
 * @param filterParams A string:string | number map to convert into a filter string
 * @param enumKeys A list of enum keys, if any - enum values are not quoted
 */
export function buildFilterString(filterParams?: FilterParams, enumKeys?: string[]) {
    if(!filterParams) {
        return '';
    }
    const filters = []; 
    for(const key of Object.keys(filterParams)) {
        const isEnumKey = enumKeys?.includes(key);
        if(Array.isArray(filterParams[key])) {
            let arrVals = [];
            for(const val of filterParams[key]) {
                arrVals.push(isEnumKey ? val : quoteString(val));
            }
            filters.push(`${key}: [${arrVals.join(', ')}]`)
        }
        else {
            filters.push(`${key}: ${isEnumKey ? filterParams[key] : quoteString(filterParams[key])}`);
        }
    }
    return `(${filters.join(', ')})`;
}

/**
 * If the input is a string, returns the inputs in "quotes"
 * @param input The input
 */
function quoteString(input: string | number): string {
    if(typeof input === 'number') {
        return input.toString();
    }
    return `"${input}"`;
}
