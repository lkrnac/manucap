import { MouseEvent, ReactElement } from "react";
import { showMerge } from "../cues/merge/mergeSlices";
import { useDispatch, useSelector } from "react-redux";
import { showSearchReplace } from "../cues/searchReplace/searchReplaceSlices";
import { ManuCapState } from "../manuCapReducers";
import Icon from "@mdi/react";
import { mdiSetMerge } from "@mdi/js";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

const MergeCuesButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="mc-merge-cues-button flex items-center"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
            onClick={(event): void => {
                dispatch(showSearchReplace(false));
                dispatch(showMerge(true));
                props.onClick(event);
            }}
        >
            <Icon path={mdiSetMerge} size={1.25} />
            <span className="pl-4">Merge Cues</span>
        </button>
    );
};

export default MergeCuesButton;
