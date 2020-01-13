import React, { ReactElement, useState } from "react";
import Button from "react-bootstrap/Button";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";

const SubtitleSpecificationsButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <div>
            <Button
                variant="light"
                onClick={handleShow}
                className="dotsub-subtitle-specifications-button"
                style={{ marginLeft: "10px" }}
            >
                Subtitle Specifications
            </Button>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </div>
    );
};

export default SubtitleSpecificationsButton;
