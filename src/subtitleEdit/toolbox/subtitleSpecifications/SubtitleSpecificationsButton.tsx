import { ReactElement, useEffect, useState } from "react";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import Tooltip from "../../common/Tooltip";

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
            <Tooltip
                tooltipId="subtitleSpecsBtnTooltip"
                message="Subtitle Specifications"
            >
                <button
                    className="dotsub-subtitle-specifications-button btn btn-secondary"
                    onClick={handleShow}
                    hidden={subtitleSpecifications == null}
                >
                    <i className="fas fa-clipboard-list fa-lg" />
                </button>
            </Tooltip>
            <SubtitleSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default SubtitleSpecificationsButton;
