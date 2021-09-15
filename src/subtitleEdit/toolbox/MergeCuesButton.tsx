import React, { ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch, useSelector } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

const MergeCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            type="button"
            className="btn btn-secondary sbte-merge-cues-button"
            disabled={isTranslation && !timecodesUnlocked}
            title="Unlock timecodes to enable"
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
