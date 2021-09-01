import React, { ReactElement, useState } from "react";
import ShiftTimeModal from "./ShiftTimeModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

const ShiftTimeButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    const timecodesUnlocked = useSelector((state: SubtitleEditState) => state.timecodesUnlocked);
    return (
        <>
            <button
                onClick={handleShow}
                type="button"
                className="btn btn-secondary dotsub-shift-time-button"
                disabled={!timecodesUnlocked}
            >
                <i className="fas fa-angle-double-right" /> Shift All Tracks Time
            </button>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
