import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

interface Props {
    onClick: () => void
}

const ShiftTimeButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            onClick={props.onClick}
            className="dotsub-shift-time-button"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
        >
            Shift Track Time
        </button>
    );
};

export default ShiftTimeButton;
