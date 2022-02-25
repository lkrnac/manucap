import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { ReactElement } from "react";
import { splitCue } from "../cuesList/cuesListActions";
import { useDispatch, useSelector } from "react-redux";
import Tooltip from "../../common/Tooltip";

interface Props {
    cueIndex: number;
}

const SplitCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <Tooltip
            tooltipId="splitCueBtnTooltip"
            message="Split this subtitle"
            placement="left"
            disabled={!timecodesUnlocked}
        >
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-split-cue-button"
                disabled={!timecodesUnlocked}
                title="Unlock timecodes to enable"
                onClick={(): AppThunk => dispatch(splitCue(props.cueIndex))}
            >
                <i className="fas fa-cut" />
            </button>
        </Tooltip>
    );
};

export default SplitCueLineButton;
