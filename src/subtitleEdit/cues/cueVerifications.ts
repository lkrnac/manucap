import sanitizeHtml from "sanitize-html";

import { CueDto, CueError, TimeGapLimit, Track } from "../model";
import { SubtitleSpecification } from "../toolbox/model";
import { Constants } from "../constants";

const removeHtmlTags = (html: string): string => sanitizeHtml(html, { allowedTags: []});

export const checkLineLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const lines = text.split("\n");
        return !subtitleSpecification.maxLinesPerCaption
            || lines.length <= subtitleSpecification.maxLinesPerCaption;
    }
    return true;
};

export const checkCharacterLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const lines = text.split("\n");
        return lines
            .map(
                line => !subtitleSpecification.maxCharactersPerLine
                    || removeHtmlTags(line).length <= subtitleSpecification.maxCharactersPerLine
            )
            .reduce((accumulator, lineOk) => accumulator && lineOk);
    }
    return true;
};

export const checkCharacterAndLineLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): CueError[] => {
    const cueErrors = [];
    const charactersPerLineLimitOk = checkCharacterLimitation(text, subtitleSpecification);
    const linesCountLimitOk = checkLineLimitation(text, subtitleSpecification);
    if (!charactersPerLineLimitOk) {
        cueErrors.push(CueError.LINE_CHAR_LIMIT_EXCEEDED);
    }
    if (!linesCountLimitOk) {
        cueErrors.push(CueError.LINE_COUNT_EXCEEDED);
    }
    return cueErrors;
};

export const getTimeGapLimits = (subtitleSpecs: SubtitleSpecification | null): TimeGapLimit => {
    let minGap: number = Constants.DEFAULT_MIN_GAP;
    let maxGap: number = Constants.DEFAULT_MAX_GAP;

    if (subtitleSpecs?.enabled) {
        if (subtitleSpecs.minCaptionDurationInMillis)
            minGap = subtitleSpecs.minCaptionDurationInMillis / 1000;
        if (subtitleSpecs.maxCaptionDurationInMillis)
            maxGap = subtitleSpecs.maxCaptionDurationInMillis / 1000;
    }

    return { minGap, maxGap };
};

const minRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) >= timeGapLimit.minGap;

const maxRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) <= timeGapLimit.maxGap;

const rangeOk = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): boolean => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    return minRangeOk(vttCue, timeGapLimit) && maxRangeOk(vttCue, timeGapLimit);
};

const startOverlapOk = (vttCue: VTTCue, previousCue?: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue?: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const overlapOk = (vttCue: VTTCue, previousCue?: CueDto, followingCue?: CueDto): boolean =>
    startOverlapOk(vttCue, previousCue) && endOverlapOk(vttCue, followingCue);

const isSpelledCorrectly = (cue: CueDto): boolean =>
    cue.spellCheck?.matches === undefined || cue.spellCheck.matches.length === 0;

export const conformToRules = (
    cue: CueDto,
    subtitleSpecification: SubtitleSpecification | null,
    previousCue?: CueDto,
    followingCue?: CueDto,
    overlapCaptions?: boolean
): CueError[] => {
        const cueErrors = [];
        cueErrors.push(...checkCharacterAndLineLimitation(cue.vttCue.text, subtitleSpecification));
        if (!rangeOk(cue.vttCue, subtitleSpecification)) {
            cueErrors.push(CueError.TIME_GAP_LIMIT_EXCEEDED);
        }
        if (!overlapCaptions && !overlapOk(cue.vttCue, previousCue, followingCue)) {
            cueErrors.push(CueError.TIME_GAP_OVERLAP);
        }
        if (!isSpelledCorrectly(cue)) {
            cueErrors.push(CueError.SPELLCHECK_ERROR);
        }
        return cueErrors;
    }
;

export const applyInvalidRangePreventionStart = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    let applied = false;
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3));
        applied = true;
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.maxGap).toFixed(3));
        applied = true;
    }
    return applied;
};

export const applyInvalidRangePreventionEnd = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    let applied = false;
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3));
        applied = true;
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.maxGap).toFixed(3));
        applied = true;
    }
    return applied;
};

export const applyOverlapPreventionStart = (vttCue: VTTCue, previousCue: CueDto): boolean => {
    if (!startOverlapOk(vttCue, previousCue)) {
        vttCue.startTime = previousCue.vttCue.endTime;
        return true;
    }
    return false;
};

export const applyOverlapPreventionEnd = (vttCue: VTTCue, followingCue: CueDto): boolean => {
    if (!endOverlapOk(vttCue, followingCue)) {
        vttCue.endTime = followingCue.vttCue.startTime;
        return true;
    }
    return false;
};

const withinChunkRange = (time: number, chunkStart: number, chunkEnd: number): boolean =>
    time >= (chunkStart / 1000) && time <= (chunkEnd / 1000);

export const applyInvalidChunkRangePreventionStart = (
    vttCue: VTTCue,
    originalVttCueStart: number,
    editingTrack: Track
): void => {

    if ((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd
        && !withinChunkRange(vttCue.startTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)) {
        vttCue.startTime = originalVttCueStart;
    }
};

export const applyInvalidChunkRangePreventionEnd = (
    vttCue: VTTCue,
    originalVttCueEnd: number,
    editingTrack: Track
): void => {

    if ((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd
        && !withinChunkRange(vttCue.endTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)) {
        vttCue.endTime = originalVttCueEnd;
    }
};

export const verifyCueDuration = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean => {
    const cueDuration = Number((vttCue.endTime - vttCue.startTime).toFixed(3));
    return cueDuration >= timeGapLimit.minGap;
};

export const verifyCueChunkRange = (vttCue: VTTCue, editingTrack: Track): boolean => {
    return !((editingTrack.mediaChunkStart || editingTrack.mediaChunkStart === 0) && editingTrack.mediaChunkEnd)
        || (withinChunkRange(vttCue.startTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd)
        && withinChunkRange(vttCue.endTime, editingTrack.mediaChunkStart, editingTrack.mediaChunkEnd));
};

export const applyLineLimitation = (
    vttCue: VTTCue,
    originalCue: CueDto,
    subtitleSpecifications: SubtitleSpecification | null
): boolean => {
    if (!checkLineLimitation(vttCue.text, subtitleSpecifications)
        && checkLineLimitation(originalCue.vttCue.text, subtitleSpecifications)) {
        vttCue.text = originalCue.vttCue.text;
        return true;
    }
    return false;
};
