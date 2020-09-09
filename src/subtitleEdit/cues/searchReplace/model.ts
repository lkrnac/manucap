export interface SearchReplace {
    find: string;
    replacement: string;
    replaceMatchCounter: number;
    matchCase: boolean;
}

export interface SearchReplaceMatches {
    offsets: number[];
    matchLength: number;
    offsetIndex: number;
}
