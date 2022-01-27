import { CueDto, CueLineDto } from "../../model";

const OVERLAP_RATIO = 0.65;

export interface MatchedCuesWithEditingFocus {
    matchedCues: CueLineDto[];
    editingFocusIndex: number;
}

interface Times {
    sourceEnd: number;
    targetStart: number;
    targetLength: number;
    targetEnd: number;
    sourceStart: number;
    sourceLength: number;
}

interface Indexes {
    matchedCues: number;
    editingFocus: number;
    source: number;
    target: number;
}

const isExactMatch = (times: Times): boolean =>
times.targetStart === times.sourceStart && times.targetEnd === times.sourceEnd;

const isTargetShorter = (times: Times): boolean =>
    times.targetEnd < times.sourceEnd
    || (times.targetEnd === times.sourceEnd && times.targetStart > times.sourceStart);

const isSourceShorter = (times: Times): boolean =>
    times.targetEnd > times.sourceEnd
    || (times.targetEnd === times.sourceEnd && times.targetStart < times.sourceStart);

const pushTargetWithoutMatchedIndex = (
    indexes: Indexes,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    cuesMapValue?.targetCues?.push({ index: indexes.target, cue });
    if (indexes.target === editingCueIndex) {
        indexes.editingFocus = indexes.matchedCues;
    }
    indexes.target++;
};

const pushSourceWithoutMatchedIndex = (
    indexes: Indexes,
    sourceCue: CueDto,
    cuesMapValue?: CueLineDto
): void => {
    cuesMapValue?.sourceCues?.push({ index: indexes.source, cue: sourceCue });
    indexes.source++;
};

const pushTarget = (
    indexes: Indexes,
    times: Times,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    pushTargetWithoutMatchedIndex(indexes, cue, editingCueIndex, cuesMapValue);
    if (times.targetEnd === undefined || times.sourceStart === undefined) {
        indexes.matchedCues++;
        return;
    }
    const overlapLength = times.targetEnd - times.sourceStart;
    if (overlapLength / times.targetLength <= OVERLAP_RATIO) {
        indexes.matchedCues++;
    }
};

const pushSource = (
    indexes: Indexes,
    times: Times,
    sourceCue: CueDto,
    cuesMapValue?: CueLineDto
): void => {
    pushSourceWithoutMatchedIndex(indexes, sourceCue, cuesMapValue);
    if (times.sourceEnd === undefined || times.targetStart === undefined) {
        indexes.matchedCues++;
        return;
    }
    const overlapLength = times.sourceEnd - times.targetStart;
    if (overlapLength / times.sourceLength <= OVERLAP_RATIO) {
        indexes.matchedCues++;
    }
};

const pushBoth = (
    indexes: Indexes,
    sourceCue: CueDto,
    cue: CueDto,
    editingCueIndex: number,
    cuesMapValue?: CueLineDto,
): void => {
    pushTargetWithoutMatchedIndex(indexes, cue, editingCueIndex, cuesMapValue);
    pushSourceWithoutMatchedIndex(indexes, sourceCue, cuesMapValue);
    indexes.matchedCues++;
};

export const matchCuesByTime = (
    targetCues: CueDto[],
    sourceCues: CueDto[],
    editingCueIndex: number
): MatchedCuesWithEditingFocus => {
    return matchCuesByTimePartially(targetCues, sourceCues, editingCueIndex, 0);
};

export const matchCuesByTimePartially = (
    targetCues: CueDto[],
    sourceCues: CueDto[],
    editingCueIndex: number,
    fromIndex: number,
    originalMatchedCues?: MatchedCuesWithEditingFocus,
): MatchedCuesWithEditingFocus => {
    // TODO: do we need new array?
    const matchedCues = originalMatchedCues?.matchedCues ? originalMatchedCues?.matchedCues : [];
    const indexes = {
        matchedCues: fromIndex,
        source: 0, // will not be used for captions only
        target: 0,
        editingFocus: 0,
    };
    while (indexes.target < targetCues.length || indexes.source < sourceCues.length) {
        if (!matchedCues[indexes.matchedCues]) {
            matchedCues[indexes.matchedCues] = { targetCues: [], sourceCues: []};
        }
        const cueLine = matchedCues[indexes.matchedCues];
        const cue = targetCues[indexes.target];
        const sourceCue = sourceCues[indexes.source];
        const times = {
            sourceStart: sourceCue?.vttCue.startTime,
            sourceEnd: sourceCue?.vttCue.endTime,
            sourceLength: sourceCue?.vttCue.endTime - sourceCue?.vttCue.startTime,
            targetStart: cue?.vttCue.startTime,
            targetEnd: cue?.vttCue.endTime,
            targetLength: cue?.vttCue.endTime - cue?.vttCue.startTime,
        };

        if (!sourceCue) {
            pushTarget(indexes, times, cue, editingCueIndex, cueLine);
            continue;
        }
        if (!cue) {
            pushSource(indexes, times, sourceCue, cueLine);
            continue;
        }
        if (isExactMatch(times)) {
            pushBoth(indexes, sourceCue, cue, editingCueIndex, cueLine);
            continue;
        }
        if (isTargetShorter(times)) {
            pushTarget(indexes, times, cue, editingCueIndex, cueLine);
        } else if (isSourceShorter(times)) {
            pushSource(indexes, times, sourceCue, cueLine);
        }
    }
    return { matchedCues, editingFocusIndex: indexes.editingFocus };
};
