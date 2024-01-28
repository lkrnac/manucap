import { ReactElement, useEffect, useState } from "react";
import CaptionSpecificationsModal from "./CaptionSpecificationsModal";
import { useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { Tooltip } from "primereact/tooltip";
import Icon from "@mdi/react";
import { mdiClipboardText } from "@mdi/js";

const CaptionSpecificationsButton = (): ReactElement => {
    const captionSpecifications = useSelector((state: ManuCapState) => state.captionSpecifications);
    const [show, setShow] = useState(false);
    useEffect(
        () => {
            setShow(captionSpecifications != null &&
                (captionSpecifications.enabled || !!captionSpecifications.mediaNotes));
        }, [captionSpecifications]
    );

    const handleClose = (): void => setShow(false);
    const handleShow  = (): void => setShow(true);
    return (
        <>
            <button
                id="captionSpecsBtn"
                className="mc-caption-specifications-button mc-btn mc-btn-light"
                onClick={handleShow}
                hidden={captionSpecifications == null}
                data-pr-tooltip="Caption Specifications"
                data-pr-position="top"
                data-pr-at="center+2 top-2"
            >
                <Icon path={mdiClipboardText} size={1.25} />
            </button>
            <Tooltip
                id="captionSpecsBtnTooltip"
                target="#captionSpecsBtn"
            />
            <CaptionSpecificationsModal show={show} onClose={handleClose} />
        </>
    );
};

export default CaptionSpecificationsButton;
