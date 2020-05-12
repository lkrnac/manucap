import React from "react";
import { ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";
// @ts-ignore
import ReactSmartScroll from "@dotsub/react-smart-scroll";

import { isDirectTranslationTrack } from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto, Track, CueWithSource } from "../model";
import CueLine from "./CueLine";
import { addCue, updateEditingCueIndex } from "./cueSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
    scrollCue?: "first" | "last";
}

const getScrollCueIndex = (cues: CueWithSource[], scrollCue: "first" | "last" | undefined): number | undefined => {
    if (scrollCue === "first") {
        return 0;
    }
    if (scrollCue === "last") {
        return cues.length - 1;
    }
    return undefined;
};

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues, (left, right) => left.length === right.length);
    const sourceCues = useSelector(
        (state: SubtitleEditState) => state.sourceCues,
        (left, right) => left.length === right.length
    );
    const editingCueIndex= useSelector(
        (state: SubtitleEditState) => state.editingCueIndex,
        () => true
    );
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;
    const cuesWithSource = drivingCues.map((cue: CueDto, idx: number): CueWithSource =>
        ({ cue: (cues[idx] === cue ? cue : cues[idx]), sourceCue: sourceCues[idx] }));


    const startAt = cuesWithSource.length - 1 === editingCueIndex
        ? editingCueIndex
        : getScrollCueIndex(cuesWithSource, props.scrollCue);
    return (
        <>
            {
                drivingCues.length === 0
                    && (props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack))
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} />
                    : null
            }
            <ReactSmartScroll
                className="sbte-smart-scroll"
                data={cuesWithSource}
                row={CueLine}
                rowProps={{ playerTime: props.currentPlayerTime, cuesLength: cues.length }}
                rowHeight={81} // This was calculated in browser
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
