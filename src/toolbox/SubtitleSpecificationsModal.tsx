import React, {
    ReactElement, useState
} from "react";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../styles.css";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import {SubtitleSpecification} from "./model";

const SubtitleSpecificationsModal = (): ReactElement => {
    const stateSubtitleSpecifications = useSelector((state: SubtitleEditState) => state.subtitleSpecficiations);
    const subtitleSpecifications = stateSubtitleSpecifications ? stateSubtitleSpecifications :
        {} as SubtitleSpecification;
    const [show, setShow] = useState(false);
    const handleClose = (): void => setShow(false);
    const handleShow = (): void => setShow(true);
    return (
        <div>
            <Button variant="primary" onClick={handleShow} className="dotsub-subtitle-specifications-button"
                    style={{marginLeft: "10px"}}>
                Subtitle Specifications
            </Button>

            <Modal show={show} onHide={handleClose} centered dialogClassName="sbte-medium-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Subtitle Specifications</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SubtitleSpecificationsForm subTitleSpecifications={subtitleSpecifications}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SubtitleSpecificationsModal;
