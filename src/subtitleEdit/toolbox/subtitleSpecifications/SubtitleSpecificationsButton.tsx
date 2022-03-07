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
                tooltipId="subtitleSpecsBtnTooltip"
                text="Subtitle Specifications"
                placement="auto"
            >
                <button
                    className="dotsub-subtitle-specifications-button btn btn-secondary"
                    onClick={handleShow}
                    hidden={subtitleSpecifications == null}
                >
                    <i className="fas fa-clipboard-list fa-lg" />
                </button>
            </TooltipWrapper>

            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
