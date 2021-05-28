
export type SplitMergeType = "SPLIT" | "MERGE";

export interface SplitMerge {
    type: SplitMergeType;
    startCueIndex: number;
    endCueIndex: number;
}

export const splitMergeTypeToPrettyName = {
    SPLIT: "Split",
    MERGE_UP: "Merge with previous",
    MERGE_DOWN: "Merge with next",
};
