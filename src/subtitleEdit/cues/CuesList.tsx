import React, {ReactElement, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
// @ts-ignore It doesn't have TS type module
import ReactSmartScroll from "@dotsub/react-smart-scroll";

import {isDirectTranslationTrack} from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import {ScrollPosition, Track} from "../model";
import CueLine from "./CueLine";
import {addCue} from "./cuesListActions";
import {SubtitleEditState} from "../subtitleEditReducers";
import Mousetrap from "mousetrap";
import {KeyCombination} from "../shortcutConstants";
import {changeScrollPosition} from "./cuesListScrollSlice";
import {matchCuesByTime, matchCueTimeIndex} from "./cuesListTimeMatching";

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
}
const getScrollCueIndex = (
    matchedCuesSize: number,
    editingFocusInMap: number,
    currentPlayerCueIndex: number,
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
    if(scrollPosition === ScrollPosition.PLAYBACK) {
        return currentPlayerCueIndex;
    }
    return undefined; // out of range value, because need to trigger change of ReactSmartScroll.startAt
};

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const targetCuesArray = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCuesArray = useSelector((state: SubtitleEditState) => state.sourceCues);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const { editingFocusIndex, matchedCues } = matchCuesByTime(targetCuesArray, sourceCuesArray, editingCueIndex);
    const currentPlayerCueIndex = matchCueTimeIndex(targetCuesArray, props.currentPlayerTime);
    const scrollPosition = useSelector((state: SubtitleEditState) => state.scrollPosition);
    const startAt = getScrollCueIndex(matchedCues.length, editingFocusIndex, currentPlayerCueIndex, scrollPosition);
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
