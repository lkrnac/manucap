
export type SearchDirection = "NEXT" | "PREVIOUS";

export interface SearchReplace {
    find: string;
    replacement: string;
    matchCase: boolean;
    direction: SearchDirection;
    indices: SearchReplaceIndices;
    matches?: SearchReplaceMatches;
}

export interface SearchReplaceMatches {
    offsets: number[];
    matchLength: number;
    offsetIndex: number;
}

export interface SearchReplaceIndices {
    matchedCueIndex: number;
    sourceCueIndex: number;
    targetCueIndex: number;
}
