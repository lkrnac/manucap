import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import ReactSmartScroll from "@dotsub/react-smart-scroll";

import { isDirectTranslationTrack } from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto, CueWithSource, ScrollPosition, Track } from "../model";
import CueLine from "./CueLine";
import { addCue, updateEditingCueIndex } from "./cueSlices";
import { SubtitleEditState } from "../subtitleEditReducers";
import Mousetrap from "mousetrap";
import { KeyCombination } from "../shortcutConstants";
import { changeScrollPosition } from "./cuesListScrollSlice";

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
}

const getScrollCueIndex = (
    cues: CueWithSource[],
    editingCueIndex: number,
    scrollPosition?: ScrollPosition
): number | undefined => {
    if (scrollPosition === ScrollPosition.FIRST) {
        return 0;
    }
    if (scrollPosition === ScrollPosition.LAST) {
        return cues.length - 1;
    }
    if (scrollPosition === ScrollPosition.CURRENT) {
        return editingCueIndex;
    }
    return undefined; // out of range value, because need to trigger change of ReactSmartScroll.startAt
};

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;
    const cuesWithSource = drivingCues.map((cue: CueDto, idx: number): CueWithSource =>
        ({ cue: (cues[idx] === cue ? cue : cues[idx]), sourceCue: sourceCues[idx] }));

    const scrollPosition = useSelector((state: SubtitleEditState) => state.scrollPosition);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const startAt = getScrollCueIndex(cuesWithSource, editingCueIndex, scrollPosition);
    const rowHeight = sourceCues.length > 0 ? 161 : 81; // Values are from Elements > Computed from browser DEV tools
    useEffect(
        () => {
            dispatch(changeScrollPosition(ScrollPosition.NONE));
        }
    );
    const showStartCaptioning = drivingCues.length === 0
        && (props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack));
    useEffect(
        () => {
            Mousetrap.bind([KeyCombination.ENTER], () => {
                if (showStartCaptioning) {
                    dispatch(addCue(0));
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
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} />
                    : null
            }
            <ReactSmartScroll
                className="sbte-smart-scroll"
                data={cuesWithSource}
                row={CueLine}
                rowProps={{ playerTime: props.currentPlayerTime, cuesLength: cues.length }}
                rowHeight={rowHeight}
                startAt={startAt}
                onClick={(idx: number): void => {
                    idx >= cues.length
                        ? dispatch(addCue(cues.length))
                        : dispatch(updateEditingCueIndex(idx));
                }}
            />
        </>
    );
};

export default CuesList;
