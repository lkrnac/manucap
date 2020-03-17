import React, { ReactElement, useState } from "react";
import Button from "react-bootstrap/Button";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";

const SubtitleSpecificationsButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <Button
                variant="secondary"
                onClick={handleShow}
                className="dotsub-subtitle-specifications-button"
                style={{ marginLeft: "10px" }}
            >
                Subtitle Specifications
            </Button>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
