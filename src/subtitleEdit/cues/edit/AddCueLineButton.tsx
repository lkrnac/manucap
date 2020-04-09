import { AppThunk } from "../../subtitleEditReducers";
import React, { ReactElement } from "react";
import { createAndAddCue } from "../cueSlices";
import { useDispatch } from "react-redux";
import { CueDto } from "../../model";

interface Props {
    cueIndex: number;
    cue: CueDto;
    text?: string;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary sbte-add-cue-button"
            onClick={(): AppThunk => dispatch(createAndAddCue(props.cue, props.cueIndex + 1))}
        >
            {
                props.text ? <span>{props.text}</span> : <b>+</b>
            }
        </button>
    );
};

export default AddCueLineButton;
