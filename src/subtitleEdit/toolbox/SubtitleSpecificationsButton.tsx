import React, { ReactElement, useState } from "react";
import Button from "react-bootstrap/Button";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";

export interface Props {
    show?: boolean;
}
const SubtitleSpecificationsButton = (props: Props): ReactElement => {
    const [show, setShow] = useState(props.show);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <Button
                variant="light"
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

SubtitleSpecificationsButton.defaultProps = {
    show: false
} as Partial<Props>;

export default SubtitleSpecificationsButton;
