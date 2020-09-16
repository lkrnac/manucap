
export type SearchDirection = "NEXT" | "PREVIOUS";

export interface SearchReplace {
    find: string;
    replacement: string;
    replaceMatchCounter: number;
    matchCase: boolean;
    direction: SearchDirection;
}

export interface SearchReplaceMatches {
    offsets: number[];
    matchLength: number;
    offsetIndex: number;
}
