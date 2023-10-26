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
            className="dotsub-shift-time-button flex items-center"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
        >
            <i className="w-7 fa-duotone fa-arrow-right-arrow-left text-blue-primary" />
            <span>Shift Track Time</span>
        </button>
    );
};

export default ShiftTimeButton;
