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

const getMiddleTime = (cue: CueDto): number =>
    cue.vttCue.startTime + (cue.vttCue.endTime - cue.vttCue.startTime) / 2;

const matchCuesByTime = (
    targetCuesArray: CueDto[],
    sourceCuesArray: CueDto[],
    editingCueIndex: number
): MatchedCuesWithEditingFocus => {
    const cuesMap = new Map<number, CueLineDto>();
    let cuesMapIdx = 0;
    let sourceCuesIdx = 0; // will not be used for captions only
    let targetCuesIdx = 0;
    let editingFocusIdx = 0;
    while (targetCuesIdx < targetCuesArray.length || sourceCuesIdx < sourceCuesArray.length) {
        if (!cuesMap.get(cuesMapIdx)) {
            cuesMap.set(cuesMapIdx, { targetCues: [], sourceCues: []});
        }
        const cuesMapValue = cuesMap.get(cuesMapIdx);
        const cue = targetCuesArray[targetCuesIdx];
        if (sourceCuesArray.length === 0 || sourceCuesIdx === sourceCuesArray.length) {
            cuesMapValue?.targetCues?.push({ index: targetCuesIdx, cue });
            if (targetCuesIdx === editingCueIndex) {
                editingFocusIdx = cuesMapIdx;
            }
            targetCuesIdx++;
            cuesMapIdx++;
            continue;
        }
        const sourceCue = sourceCuesArray[sourceCuesIdx];
        if (!cue) {
            cuesMapValue?.sourceCues?.push({ index: sourceCuesIdx, cue: sourceCue });
            sourceCuesIdx++;
            cuesMapIdx++;
            continue;
        }
        const cueMiddleTime = getMiddleTime(cue);
        const sourceCueMiddleTime = getMiddleTime(sourceCue);
        const sourceCueStartTime = sourceCue.vttCue.startTime;
        const sourceCueEndTime = sourceCue.vttCue.endTime;
        const targetCueStartTime = cue.vttCue.startTime;
        const targetCueEndTime = cue.vttCue.endTime;
        if (targetCueStartTime === sourceCueStartTime && targetCueEndTime === sourceCueEndTime) {
            cuesMapValue?.targetCues?.push({ index: targetCuesIdx, cue });
            cuesMapValue?.sourceCues?.push({ index: sourceCuesIdx, cue: sourceCue });
            if (targetCuesIdx === editingCueIndex) {
                editingFocusIdx = cuesMapIdx;
            }
            targetCuesIdx++;
            sourceCuesIdx++;
            cuesMapIdx++;
            continue;
        }
        if (targetCueEndTime < sourceCueEndTime
            || (targetCueEndTime === sourceCueEndTime && targetCueStartTime > sourceCueStartTime)
        ) {
            cuesMapValue?.targetCues?.push({ index: targetCuesIdx, cue });
            if (targetCuesIdx === editingCueIndex) {
                editingFocusIdx = cuesMapIdx;
            }
            if (cueMiddleTime <= sourceCueStartTime) {
                cuesMapIdx++;
            }
            targetCuesIdx++;
        } else if (targetCueEndTime > sourceCueEndTime
            || (targetCueEndTime === sourceCueEndTime && targetCueStartTime < sourceCueStartTime)
        ) {
            cuesMapValue?.sourceCues?.push({ index: sourceCuesIdx, cue: sourceCue });
            if (sourceCueMiddleTime <= targetCueStartTime) {
                cuesMapIdx++;
            }
            sourceCuesIdx++;
        }
    }
    const matchedCues = Array.from(cuesMap.values());
    return { matchedCues, editingFocusIndex: editingFocusIdx };
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
                    cuesLength: targetCuesArray.length,
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
