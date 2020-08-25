import sanitizeHtml from "sanitize-html";
import { v4 as uuidv4 } from "uuid";

import { CueDto, TimeGapLimit } from "../model";
import { SubtitleSpecification } from "../toolbox/model";
import { Constants } from "../constants";

const removeHtmlTags = (html: string): string => sanitizeHtml(html, { allowedTags: []});

export const checkLineLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    if (subtitleSpecification && subtitleSpecification.enabled) {
        const lines = text.split("\n");
        return subtitleSpecification.maxLinesPerCaption === null
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
                line => subtitleSpecification.maxCharactersPerLine === null
                    || removeHtmlTags(line).length <= subtitleSpecification.maxCharactersPerLine
            )
            .reduce((accumulator, lineOk) => accumulator && lineOk);
    }
    return true;
};

export const checkCharacterAndLineLimitation = (
    text: string,
    subtitleSpecification: SubtitleSpecification | null
): boolean => {
    const charactersPerLineLimitOk = checkCharacterLimitation(text, subtitleSpecification);
    const linesCountLimitOk = checkLineLimitation(text, subtitleSpecification);
    return charactersPerLineLimitOk && linesCountLimitOk;
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
): boolean =>
    checkCharacterAndLineLimitation(cue.vttCue.text, subtitleSpecification)
        && rangeOk(cue.vttCue, subtitleSpecification)
        && (overlapCaptions || overlapOk(cue.vttCue, previousCue, followingCue))
        && isSpelledCorrectly(cue)
;


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
            corrupted: !conformToRules(
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

export const applyLineLimitation = (
    vttCue: VTTCue,
    originalCue: CueDto,
    subtitleSpecifications: SubtitleSpecification | null
): VTTCue => {
    if (!checkLineLimitation(vttCue.text, subtitleSpecifications)
        && checkLineLimitation(originalCue.vttCue.text, subtitleSpecifications)) {
        vttCue.text = originalCue.vttCue.text;
    }
    return vttCue;
};
