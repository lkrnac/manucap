import { ReactElement } from "react";
import { Dialog } from "primereact/dialog";
import { ManuCapState } from "../../manuCapReducers";
import { CaptionSpecification } from "../model";
import CaptionSpecificationsForm from "./CaptionSpecificationsForm";
import { useSelector } from "react-redux";

interface Props {
    show: boolean;
    onClose: () => void;
}

const CaptionSpecificationsModal = (props: Props): ReactElement => {
    const stateCaptionSpecifications = useSelector((state: ManuCapState) => state.captionSpecifications);
    const captionSpecifications = stateCaptionSpecifications ? stateCaptionSpecifications :
        {} as CaptionSpecification;
    return (
        <Dialog
            className="max-w-3xl mc-caption-specifications-modal"
            visible={props.show}
            onHide={props.onClose}
            header="Caption Specifications"
            draggable={false}
            dismissableMask
            resizable={false}
            footer={() => (
                <button className="mc-btn mc-btn-primary mc-caption-specifications-close" onClick={props.onClose}>
                    Close
                </button>
            )}
        >
            <CaptionSpecificationsForm captionSpecifications={captionSpecifications} />
        </Dialog>
    );
};

export default CaptionSpecificationsModal;
