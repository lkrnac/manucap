import React, { ReactElement, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const [show, setShow] = useState(
        subtitleSpecifications !=null
                 && (!cues || cues.length <= 1 || cues[0].vttCue?.text === ""));
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <button
                className="dotsub-subtitle-specifications-button btn btn-light"
                onClick={handleShow}
                style={{ marginLeft: "10px" }}
            >
                Subtitle Specifications
            </button>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
