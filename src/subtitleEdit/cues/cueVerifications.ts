import sanitizeHtml from "sanitize-html";
import { v4 as uuidv4 } from "uuid";

import { CueDto, CueError, TimeGapLimit } from "../model";
import { SubtitleSpecification } from "../toolbox/model";
import { Constants } from "../constants";

const removeHtmlTags = (html: string): string => sanitizeHtml(html, { allowedTags: []});

export const checkCharacterLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): CueError[] => {
    const cueErrors = [] as CueError[];
    const lines = text.split("\n");
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const charactersPerLineLimitOk = lines
            .map(
                line => subtitleSpecification.maxCharactersPerLine === null
                    || removeHtmlTags(line).length <= subtitleSpecification.maxCharactersPerLine
            )
            .reduce((accumulator, lineOk) => accumulator && lineOk);

        const linesCountLimitOk = subtitleSpecification.maxLinesPerCaption === null
            || lines.length <= subtitleSpecification.maxLinesPerCaption;

        if (!charactersPerLineLimitOk) {
            cueErrors.push(CueError.CHARS_PER_LINE);
        }
        if (!linesCountLimitOk) {
            cueErrors.push(CueError.LINE_COUNT);
        }
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

const rangeOk = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): CueError[] => {
    const cueErrors = [] as CueError[];
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    if (!minRangeOk(vttCue, timeGapLimit)) {
        cueErrors.push(CueError.MIN_RANGE);
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        cueErrors.push(CueError.MAX_RANGE);
    }
    return cueErrors;
};

const startOverlapOk = (vttCue: VTTCue, previousCue?: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue?: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const overlapOk = (enabled: boolean, vttCue: VTTCue, previousCue?: CueDto, followingCue?: CueDto): CueError[] => {
    const cueErrors = [] as CueError[];
    if (!enabled) {
        if (!startOverlapOk(vttCue, previousCue)) {
            cueErrors.push(CueError.START_OVERLAP);
        }
        if (!endOverlapOk(vttCue, followingCue)) {
            cueErrors.push(CueError.END_OVERLAP);
        }
    }
    return cueErrors;
};

const isSpelledCorrectly = (cue: CueDto): boolean =>
    cue.spellCheck?.matches === undefined || cue.spellCheck.matches.length === 0;

export const validateCue = (
    cue: CueDto,
    subtitleSpecification: SubtitleSpecification | null,
    previousCue?: CueDto,
    followingCue?: CueDto,
    overlapCaptions?: boolean,
): CueError[] =>
    checkCharacterLimitation(cue.vttCue.text, subtitleSpecification)
        .concat(rangeOk(cue.vttCue, subtitleSpecification))
        .concat(overlapOk(overlapCaptions || false, cue.vttCue, previousCue, followingCue))
        .concat(!isSpelledCorrectly(cue) ? CueError.SPELL_CHECK : []);

export const markCues = (
    cues: CueDto[],
    subtitleSpecifications: SubtitleSpecification | null,
    overlapCaptions: boolean | undefined
): CueDto [] =>
    cues.map((cue, index) => {
        const previousCue = cues[index - 1];
        const followingCue = cues[index + 1];

        return {
            ...cue,
            errors: validateCue(
                cue,
                subtitleSpecifications,
                previousCue,
                followingCue,
                overlapCaptions || false
            ),
            editUuid: uuidv4()
        };
    });

export const applyInvalidRangePreventionStart = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): void => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.minGap).toFixed(3));
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.startTime = Number((vttCue.endTime - timeGapLimit.maxGap).toFixed(3));
    }
};

export const applyInvalidRangePreventionEnd = (
    vttCue: VTTCue,
    subtitleSpecification: SubtitleSpecification | null
): void => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);

    if (!minRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.minGap).toFixed(3));
    }
    if (!maxRangeOk(vttCue, timeGapLimit)) {
        vttCue.endTime = Number((vttCue.startTime + timeGapLimit.maxGap).toFixed(3));
    }
};

export const applyOverlapPreventionStart = (vttCue: VTTCue, previousCue: CueDto): void => {
    if (!startOverlapOk(vttCue, previousCue)) {
        vttCue.startTime = previousCue.vttCue.endTime;
    }
};

export const applyOverlapPreventionEnd = (vttCue: VTTCue, followingCue: CueDto): void => {
    if (!endOverlapOk(vttCue, followingCue)) {
        vttCue.endTime = followingCue.vttCue.startTime;
    }
};

export const verifyCueDuration = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean => {
    const cueDuration = Number((vttCue.endTime - vttCue.startTime).toFixed(3));
    return cueDuration >= timeGapLimit.minGap;
};

export const applyCharacterLimitation = (
    vttCue: VTTCue,
    originalCue: CueDto,
    subtitleSpecifications: SubtitleSpecification | null
): VTTCue => {
    if (checkCharacterLimitation(vttCue.text, subtitleSpecifications).length > 0
        && checkCharacterLimitation(originalCue.vttCue.text, subtitleSpecifications).length === 0) {
        vttCue.text = originalCue.vttCue.text;
    }
    return vttCue;
};
