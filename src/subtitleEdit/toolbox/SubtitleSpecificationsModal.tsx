import React, { ReactElement } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { SubtitleEditState } from "../../reducers/subtitleEditReducers";
import { SubtitleSpecification } from "./model";
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
        <Modal show={props.show} onHide={props.onClose} centered dialogClassName="sbte-medium-modal">
            <Modal.Header closeButton>
                <Modal.Title>Subtitle Specifications</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <SubtitleSpecificationsForm subTitleSpecifications={subtitleSpecifications} />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={props.onClose}
                    className="dotsub-subtitle-specifications-modal-close-button"
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SubtitleSpecificationsModal;
