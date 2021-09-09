import React, { ReactElement, useState } from "react";
import ShiftTimeModal from "./ShiftTimeModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { TooltipWrapper } from "../../TooltipWrapper";

const ShiftTimeButton = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <>
            <TooltipWrapper
                text="This is a tooltip"
                tooltipId="testId"
                placement="left"
                trigger={timecodesUnlocked ? [] : ["hover", "focus"]}
            >
                <button
                    onClick={handleShow}
                    type="button"
                    className="btn btn-secondary dotsub-shift-time-button"
                    disabled={!timecodesUnlocked}
                >
                    <i className="fas fa-angle-double-right" /> Shift All Tracks Time
                </button>
            </TooltipWrapper>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
