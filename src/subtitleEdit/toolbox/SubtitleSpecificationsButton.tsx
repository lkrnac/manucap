import React, { ReactElement, useEffect, useRef, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const [show, setShow] = useState(false);
    const showOnlyOnceRef = useRef(true);

    useEffect(
        () => {
            const shouldAutoShow = subtitleSpecifications != null
                && (cues.length === 0 || (cues.length === 1 && cues[0]?.vttCue.text === ""));
            if (showOnlyOnceRef.current && shouldAutoShow) {
                setShow(true);
                showOnlyOnceRef.current = false;
            }
        }, [subtitleSpecifications, cues]
    );

    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <>
            <button
                className="dotsub-subtitle-specifications-button btn btn-secondary"
                onClick={handleShow}
                type="button"
                hidden={subtitleSpecifications == null}
            >
                <i className="far fa-flag" /> Subtitle Specifications
            </button>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
