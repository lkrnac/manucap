import React, { ReactElement, useEffect, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    // const editingTask = useSelector((state: SubtitleEditState) => state.editingTrack);
    // const currentUser = useSelector((state: SubtitleEditState) => state.subtitleUser);
    const [show, setShow] = useState(false);

    const cues = useSelector((state: SubtitleEditState) => state.cues);
    useEffect(
        () => {
            setShow(subtitleSpecifications != null
                && subtitleSpecifications.enabled
                && (cues.length === 0 /*|| editingTask?.createdBy.userId !== currentUser?.userId*/));
            // ESLint suppress: because we want to show modal only for first render
            // and subtitle specs is loaded
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [subtitleSpecifications]
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
