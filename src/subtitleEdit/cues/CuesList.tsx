import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import ReactSmartScroll from "@dotsub/react-smart-scroll";

import { isDirectTranslationTrack } from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto, CueWithSource, ScrollPosition, Track } from "../model";
import CueLine from "./CueLine";
import { addCue, updateEditingCueIndex } from "./cueSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
    scrollPosition?: ScrollPosition;
}

const getScrollCueIndex = (cues: CueWithSource[], scrollPosition?: ScrollPosition): number => {
    if (scrollPosition === ScrollPosition.FIRST) {
        return 0;
    }
    if (scrollPosition === ScrollPosition.LAST) {
        return cues.length - 1;
    }
    return cues.length;
};

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const editingCueIndex= useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;
    const cuesWithSource = drivingCues.map((cue: CueDto, idx: number): CueWithSource =>
        ({ cue: (cues[idx] === cue ? cue : cues[idx]), sourceCue: sourceCues[idx] }));


    const startAt = cuesWithSource.length - 1 === editingCueIndex
        ? editingCueIndex
        : getScrollCueIndex(cuesWithSource, props.scrollPosition);
    const rowHeight = sourceCues.length > 0 ? 161 : 81; // Values are from Elements > Computed from browser DEV tools
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
