import React, { ReactElement, useState } from "react";
import { SubtitleEditState } from "../subtitleEditReducers";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";

export interface Props {
    show?: boolean;
}
const SubtitleSpecificationsButton = (props: Props): ReactElement => {
    const [show, setShow] = useState(props.show);
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <button
                onClick={handleShow}
                className="dotsub-subtitle-specifications-button btn btn-light"
                style={{ marginLeft: "10px" }}
                type="button"
                hidden={subtitleSpecifications == null}
            >
                Subtitle Specifications
            </button>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

SubtitleSpecificationsButton.defaultProps = {
    show: false
} as Partial<Props>;

export default SubtitleSpecificationsButton;
