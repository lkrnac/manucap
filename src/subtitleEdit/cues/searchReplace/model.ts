export interface SearchReplace {
    find: string;
    replacement: string;
    replaceMatchCounter: number;
}

export interface SearchReplaceMatches {
    offsets: number[];
    matchLength: number;
    offsetIndex: number;
}
