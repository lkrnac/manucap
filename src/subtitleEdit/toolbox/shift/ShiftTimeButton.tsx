import { ReactElement, useState } from "react";
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
                tooltipId="keyboardShortcutsToolboxBtnTooltip"
                text="Shift Track Time"
                placement="right"
            >
                <button
                    onClick={handleShow}
                    type="button"
                    className="btn dotsub-shift-time-button"
                    disabled={!timecodesUnlocked}
                >
                    <i className="fa-duotone fa-clock-rotate-left fa-2x fa-flip-horizontal" />
                </button>
            </TooltipWrapper>

            <ShiftTimeModal show={show} onClose={handleClose} />
        </>
    );
};

export default ShiftTimeButton;
