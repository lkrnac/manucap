import Icon from "@mdi/react";
import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { mdiArrowLeftRight } from "@mdi/js";

interface Props {
    onClick: () => void
}

const ShiftTimeButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            onClick={props.onClick}
            className="mc-shift-time-button flex items-center"
            disabled={!timecodesUnlocked}
            title="Unlock timecodes to enable"
        >
            <Icon path={mdiArrowLeftRight} size={1.25} />
            <span className="pl-4">Shift Track Time</span>
        </button>
    );
};

export default ShiftTimeButton;
