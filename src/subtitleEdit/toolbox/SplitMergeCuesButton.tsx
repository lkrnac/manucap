import React, { ReactElement } from "react";
import { showSplitMerge } from "../cues/splitMerge/splitMergeSlices";
import { useDispatch } from "react-redux";

const SplitMergeCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            type="button"
            className="btn btn-secondary sbte-split-merge-cues-button"
            onClick={(): void => {
                dispatch(showSplitMerge(true));
            }}
        >
            <i className="fas fa-cut" /> Split/Merge Cues
        </button>
    );
};

export default SplitMergeCuesButton;
