import { ReactElement, useEffect, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { TooltipWrapper } from "../../TooltipWrapper";

const SubtitleSpecificationsButton = (): ReactElement => {
    const subtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const [show, setShow] = useState(false);
    useEffect(
        () => {
            setShow(subtitleSpecifications != null && subtitleSpecifications.enabled);
        }, [subtitleSpecifications]
    );

    const handleClose = (): void => setShow(false);
    const handleShow  = (): void => setShow(true);
    return (
        <>
            <TooltipWrapper
                tooltipId="keyboardShortcutsToolboxBtnTooltip"
                text="Subtitle Specifications"
                placement="right"
            >
                <button
                    className="dotsub-subtitle-specifications-button btn"
                    onClick={handleShow}
                    type="button"
                    hidden={subtitleSpecifications == null}
                >
                    <i className="fa-duotone fa-flag fa-2x" />
                </button>
            </TooltipWrapper>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
