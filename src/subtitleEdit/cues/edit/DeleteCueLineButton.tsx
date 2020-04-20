import React, { ReactElement } from "react";
import { AppThunk } from "../../subtitleEditReducers";
import { deleteCue } from "../cueSlices";
import { useDispatch } from "react-redux";
import { callSaveTrack } from "../../trackSlices";

interface Props {
    cueIndex: number;
}

const DeleteCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary sbte-delete-cue-button"
            onClick={(): AppThunk => {
                dispatch(callSaveTrack());
                return dispatch(deleteCue(props.cueIndex));
            }}
        >
            <i className="fa fa-trash" />
        </button>
    );
};

export default DeleteCueLineButton;
