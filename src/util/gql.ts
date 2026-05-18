/** 
 * Builds a GQL filter string, ie '(type: "foo", id: 1234) from an arbitrary map
 * @param filterParams A string:string | number map to convert into a filter string.
 */
export function buildFilterString(filterParams?: {[key: string]: string | number}) {
    if(!filterParams) {
        return '';
    }
    const filters = []; 
    for(const key of Object.keys(filterParams)) {
        if(typeof filterParams[key] === 'number') {
            filters.push(`${key}: ${filterParams[key]}`);
        }
        else {
            filters.push(`${key}: "${filterParams[key]}"`);
        }
    }
    return `(${filters.join(', ')})`;
}
