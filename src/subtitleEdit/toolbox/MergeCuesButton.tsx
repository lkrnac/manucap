import { ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch, useSelector } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

const MergeCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="tw-dropdown-item sbte-merge-cues-button"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
            onClick={(): void => {
                dispatch(showSearchReplace(false));
                dispatch(showMerge(true));
            }}
        >
            Merge Cues
        </button>
    );
};

export default MergeCuesButton;
