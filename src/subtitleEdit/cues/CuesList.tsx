import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore It doesn't have TS type module
import ReactSmartScroll from "@dotsub/react-smart-scroll";

import { isDirectTranslationTrack } from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueLineDto, ScrollPosition, Track, CueDto } from "../model";
import CueLine from "./CueLine";
import { addCue } from "./cuesListActions";
import { SubtitleEditState } from "../subtitleEditReducers";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../shortcutConstants";
import { changeScrollPosition } from "./cuesListScrollSlice";

const OVERLAP_RATIO = 0.65;

interface MatchedCuesWithEditingFocus {
    matchedCues: CueLineDto[];
    editingFocusIndex: number;
}

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
}
const getScrollCueIndex = (
    matchedCuesSize: number,
    editingFocusInMap: number,
    scrollPosition?: ScrollPosition
): number | undefined => {
    if (scrollPosition === ScrollPosition.FIRST) {
        return 0;
    }
    if (scrollPosition === ScrollPosition.LAST) {
        return matchedCuesSize - 1;
    }
    if (scrollPosition === ScrollPosition.CURRENT) {
        return editingFocusInMap;
    }
    return undefined; // out of range value, because need to trigger change of ReactSmartScroll.startAt
};

interface Times {
    sourceEnd: number;
    targetStart: number;
    targetLength: number;
    targetEnd: number;
    sourceStart: number;
    sourceLength: number;
}

interface Indexes {
    cuesMap: number;
    editingFocus: number;
    source: number;
    target: number;
}

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
        indexes.editingFocus = indexes.cuesMap;
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
        indexes.cuesMap++;
        return;
    }
    const overlapLength = times.targetEnd - times.sourceStart;
    if (overlapLength / times.targetLength <= OVERLAP_RATIO) {
        indexes.cuesMap++;
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
        indexes.cuesMap++;
        return;
    }
    const overlapLength = times.sourceEnd - times.targetStart;
    if (overlapLength / times.sourceLength <= OVERLAP_RATIO) {
        indexes.cuesMap++;
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
    indexes.cuesMap++;
};

const matchCuesByTime = (
    targetCues: CueDto[],
    sourceCues: CueDto[],
    editingCueIndex: number
): MatchedCuesWithEditingFocus => {
    const cuesMap = new Map<number, CueLineDto>();
    const indexes = {
        cuesMap: 0,
        source: 0, // will not be used for captions only
        target: 0,
        editingFocus: 0,
    };
    while (indexes.target < targetCues.length || indexes.source < sourceCues.length) {
        if (!cuesMap.get(indexes.cuesMap)) {
            cuesMap.set(indexes.cuesMap, { targetCues: [], sourceCues: []});
        }
        const cuesMapValue = cuesMap.get(indexes.cuesMap);
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

        if (sourceCues.length === 0 || indexes.source === sourceCues.length) {
            pushTarget(indexes, times, cue, editingCueIndex, cuesMapValue);
            continue;
        }
        if (!cue) {
            pushSource(indexes, times, sourceCue, cuesMapValue);
            continue;
        }

        if (times.targetStart === times.sourceStart && times.targetEnd === times.sourceEnd) {
            pushBoth(indexes, sourceCue, cue, editingCueIndex, cuesMapValue);
            continue;
        }
        if (isTargetShorter(times)) {
            pushTarget(indexes, times, cue, editingCueIndex, cuesMapValue);
        } else if (isSourceShorter(times)) {
            pushSource(indexes, times, sourceCue, cuesMapValue);
        }
    }
    const matchedCues = Array.from(cuesMap.values());
    return { matchedCues, editingFocusIndex: indexes.editingFocus };
};

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const targetCuesArray = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCuesArray = useSelector((state: SubtitleEditState) => state.sourceCues);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const { editingFocusIndex, matchedCues } = matchCuesByTime(targetCuesArray, sourceCuesArray, editingCueIndex);

    const scrollPosition = useSelector((state: SubtitleEditState) => state.scrollPosition);
    const startAt = getScrollCueIndex(matchedCues.length, editingFocusIndex, scrollPosition);
    const rowHeight = sourceCuesArray.length > 0
        ? 180 // This is bigger than real translation view cue, because if there is at least one
              // editing cue, bigger rowHeight scrolls properly to bottom
        : 81; // Value is taken from Elements > Computed from browser DEV tools
              // yes, we don't use bigger value as in translation mode,
              // because we needed to properly scroll to added cue
              // -> yes, there is glitch where if there is some editing cue on top, jump to bottom
              // does not scroll so that last cue is in view port. I didn't figure out fix for this issue so far.
    useEffect(
        () => {
            dispatch(changeScrollPosition(ScrollPosition.NONE));
        }
    );
    const withoutSourceCues = props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack);
    const showStartCaptioning = matchedCues.length === 0;
    useEffect(
        () => {
            Mousetrap.bind([KeyCombination.ENTER], () => {
                if (showStartCaptioning) {
                    dispatch(addCue(0, []));
                }
                return false;
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> mount
    );
    return (
        <>
            {
                showStartCaptioning
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} sourceCueIndexes={[]} />
                    : null
            }
            <ReactSmartScroll
                className="sbte-smart-scroll"
                data={matchedCues}
                row={CueLine}
                rowProps={{
                    playerTime: props.currentPlayerTime,
                    targetCuesLength: targetCuesArray.length,
                    withoutSourceCues,
                    matchedCues
                }}
                rowHeight={rowHeight}
                startAt={startAt}
            />
        </>
    );
};

export default CuesList;
