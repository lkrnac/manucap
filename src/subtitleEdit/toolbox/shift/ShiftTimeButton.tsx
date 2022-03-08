import { ReactElement, useState } from "react";
import ShiftTimeModal from "./ShiftTimeModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

const ShiftTimeButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <>
            <button
                onClick={handleShow}
                className="dotsub-shift-time-button btn"
                disabled={!timecodesUnlocked}
                title="Unlock timecodes to enable"
            >
                Shift Track Time
            </button>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
