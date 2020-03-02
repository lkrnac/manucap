import React, { ReactElement, useState } from "react";
import ShiftTimeModal from "./ShiftTimeModal";

const ShiftTimeButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <button
                style={{ marginLeft: "10px" }}
                onClick={handleShow}
                type="button"
                className="btn btn-light dotsub-shift-time-button"

            >
                Shift All Tracks Time
            </button>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
