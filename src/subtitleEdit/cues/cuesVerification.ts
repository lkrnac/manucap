import { CueDto, TimeGapLimit } from "../model";
import { SubtitleSpecification } from "../toolbox/model";
import { checkCharacterLimitation, getTimeGapLimits } from "./cueUtils";

const minRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) >= timeGapLimit.minGap;

const maxRangeOk = (vttCue: VTTCue, timeGapLimit: TimeGapLimit): boolean =>
    (vttCue.endTime - vttCue.startTime) <= timeGapLimit.maxGap;

const rangeOk = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null): boolean => {
    const timeGapLimit = getTimeGapLimits(subtitleSpecification);
    return minRangeOk(vttCue, timeGapLimit) && maxRangeOk(vttCue, timeGapLimit);
};

const startOverlapOk = (vttCue: VTTCue, previousCue: CueDto): boolean =>
    !previousCue || vttCue.startTime >= previousCue.vttCue.endTime;

const endOverlapOk = (vttCue: VTTCue, followingCue: CueDto): boolean =>
    !followingCue || vttCue.endTime <= followingCue.vttCue.startTime;

const overlapOk = (vttCue: VTTCue, previousCue: CueDto, followingCue: CueDto): boolean =>
    startOverlapOk(vttCue, previousCue) && endOverlapOk(vttCue, followingCue);

const conformToRules = (vttCue: VTTCue, subtitleSpecification: SubtitleSpecification | null,
                        previousCue: CueDto, followingCue: CueDto): boolean =>
    checkCharacterLimitation(vttCue.text, subtitleSpecification)
    && rangeOk(vttCue, subtitleSpecification)
    && overlapOk(vttCue, previousCue, followingCue);

export const markCuesBreakingRules =
    (cues: CueDto[], subtitleSpecifications: SubtitleSpecification | null): CueDto [] =>
        cues.map((cue, index) => {
            const previousCue = cues[index - 1];
            const followingCue = cues[index + 1];
            return {
                ...cue,
                corrupted: !conformToRules(cue.vttCue, subtitleSpecifications, previousCue, followingCue)
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
    if (!checkCharacterLimitation(vttCue.text, subtitleSpecifications)
        && checkCharacterLimitation(originalCue.vttCue.text, subtitleSpecifications)) {
        vttCue.text = originalCue.vttCue.text;
    }
    return vttCue;
};
