import React, { ReactElement, useEffect, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const [show, setShow] = useState(false);

    useEffect(
        () => {
            setShow(subtitleSpecifications != null
                && (cues.length === 0 || (cues.length === 1 && cues[0]?.vttCue.text === "")));
        }, [subtitleSpecifications, cues]
    );

    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <button
                className="dotsub-subtitle-specifications-button btn btn-secondary"
                onClick={handleShow}
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

export default SubtitleSpecificationsButton;
