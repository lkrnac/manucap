import React, { ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";

const MergeCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            type="button"
            className="btn btn-secondary sbte-merge-cues-button"
            onClick={(): void => {
                dispatch(showSearchReplace(false));
                dispatch(showMerge(true));
            }}
        >
            <i className="fas fa-compress-alt" /> Merge Cues
        </button>
    );
};

export default MergeCuesButton;
