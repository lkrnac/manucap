import { MouseEvent, ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch, useSelector } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

const MergeCuesButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="sbte-merge-cues-button"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
            onClick={(event): void => {
                dispatch(showSearchReplace(false));
                dispatch(showMerge(true));
                props.onClick(event);
            }}
        >
            Merge Cues
        </button>
    );
};

export default MergeCuesButton;
