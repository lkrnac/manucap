import React, { ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch } from "react-redux";

const MergeCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            type="button"
            className="btn btn-secondary sbte-merge-cues-button"
            onClick={(): void => {
                dispatch(showMerge(true));
            }}
        >
            <i className="fas fa-cut" /> Merge Cues
        </button>
    );
};

export default MergeCuesButton;
