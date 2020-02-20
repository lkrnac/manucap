import React, { ReactElement } from "react";
import { CueCategory } from "../../model";
import { addCue } from "../cueSlices";
import { copyNonConstructorProperties } from "../cueUtils";
import { useDispatch } from "react-redux";

const ADD_END_TIME_INTERVAL_SECS = 3;

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
    cueCategory?: CueCategory;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <>
            <button
                className="btn btn-outline-secondary sbte-add-cue-button"
                onClick={(event: React.MouseEvent<HTMLElement>): void => {
                    // TODO: Move this stop propagation to right side action buttons ares,
                    // so that it applies also for play/delete buttons: https://dotsub.atlassian.net/browse/VTMS-2279
                    // NOTE: This is tested by test in CueLine."opens next cue line for editing ..."
                    event.stopPropagation();
                    const newCue =
                        new VTTCue(props.vttCue.endTime, props.vttCue.endTime + ADD_END_TIME_INTERVAL_SECS, "");
                    copyNonConstructorProperties(newCue, props.vttCue);
                    dispatch(addCue(props.cueIndex + 1, newCue, props.cueCategory || "DIALOGUE"));
                }}
            >
                <b>+</b>
            </button>
        </>
    );
};

export default AddCueLineButton;
