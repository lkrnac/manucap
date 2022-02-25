import { ReactElement } from "react";
import TransitionDialog from "../../common/TransitionDialog";
import { Dialog } from "@headlessui/react";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { SubtitleSpecification } from "../model";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import { useSelector } from "react-redux";

interface Props {
    show: boolean;
    onClose: () => void;
}

const SubtitleSpecificationsModal = (props: Props): ReactElement => {
    const stateSubtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecifications);
    const subtitleSpecifications = stateSubtitleSpecifications ? stateSubtitleSpecifications :
        {} as SubtitleSpecification;
    return (
        <TransitionDialog
            open={props.show}
            onClose={props.onClose}
            dialogClassName="sbte-medium-modal"
            contentClassname="tw-max-w-3xl"
        >
            <div className="tw-modal-header tw-modal-header-primary">
                <Dialog.Title as="h4">Subtitle Specifications</Dialog.Title>
            </div>
            <Dialog.Description as="div" className="tw-modal-description">
                <SubtitleSpecificationsForm subTitleSpecifications={subtitleSpecifications} />
                <div className="tw-modal-toolbar">
                    <button
                        onClick={props.onClose}
                        className="btn btn-primary dotsub-subtitle-specifications-modal-close-button"
                    >
                        Close
                    </button>
                </div>
            </Dialog.Description>
        </TransitionDialog>
    );
};

export default SubtitleSpecificationsModal;
