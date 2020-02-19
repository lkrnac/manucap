import React, { ReactElement, useState } from "react";
import Button from "react-bootstrap/Button";
import ShiftTimeModal from "./ShiftTimeModal";

const ShiftTimeButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <Button
                variant="light"
                onClick={handleShow}
                className="dotsub-shift-time-button"
                style={{ marginLeft: "10px" }}
            >
                Shift All Tracks Time
            </Button>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
