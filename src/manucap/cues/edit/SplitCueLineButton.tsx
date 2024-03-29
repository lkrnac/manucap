import { AppThunk, ManuCapState } from "../../manuCapReducers";
import { ReactElement } from "react";
import { splitCue } from "../cuesList/cuesListActions";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "primereact/tooltip";
import Icon from "@mdi/react";
import { mdiSetSplit } from "@mdi/js";

interface Props {
    cueIndex: number;
}

const SplitCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    const buttonId = `splitCueLineButton-${props.cueIndex}`;
    return (
        <div className="p-1.5">
            <button
                id={buttonId}
                style={{ maxHeight: "38px" }}
                className="mc-btn mc-btn-primary mc-split-cue-button w-full mc-btn-sm"
                disabled={!timecodesUnlocked}
                title="Unlock timecodes to enable"
                data-pr-tooltip="Split this caption"
                data-pr-position="left"
                data-pr-at="left center"
                onClick={(): AppThunk => dispatch(splitCue(props.cueIndex))}
            >
                <Icon path={mdiSetSplit} size={1} />
            </button>
            <Tooltip
                id={buttonId + "-Tooltip"}
                target={`#${buttonId}`}
            />
        </div>
    );
};

export default SplitCueLineButton;
