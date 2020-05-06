import React from "react";
import { ReactElement } from "react";
import { useSelector, useDispatch } from "react-redux";

import { isDirectTranslationTrack } from "../subtitleEditUtils";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto, Track } from "../model";
import CueLine from "./CueLine";
import { addCue, updateEditingCueIndex } from "./cueSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

interface Props {
    editingTrack: Track | null;
    currentPlayerTime: number;
}

const CuesList = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;

    return (
        <>
            {
                drivingCues.length === 0
                    && (props.editingTrack?.type === "CAPTION" || isDirectTranslationTrack(props.editingTrack))
                    ? <AddCueLineButton text="Start Captioning" cueIndex={-1} />
                    : null
            }
            <div
                style={{ overflowY: "scroll", height: "100%" }}
                className="sbte-cues-array-container"
            >
                {
                    drivingCues.map((cue: CueDto, idx: number): ReactElement => {
                        const sourceCue = sourceCues[idx];
                        const editingCue = cues[idx] === cue ? cue : cues[idx];
                        return (
                            <CueLine
                                key={idx}
                                index={idx}
                                sourceCue={sourceCue}
                                cue={editingCue}
                                playerTime={props.currentPlayerTime}
                                lastCue={idx === cues.length - 1}
                                onClickHandler={(): void => {
                                    idx >= cues.length
                                        ? dispatch(addCue(cues.length))
                                        : dispatch(updateEditingCueIndex(idx));
                                }}
                            />);
                    })
                }
            </div>
        </>
    );
};

export default CuesList;