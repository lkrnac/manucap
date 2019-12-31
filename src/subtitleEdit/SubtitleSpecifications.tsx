import React, {
    ReactElement, useState
} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../styles.css";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";

const readSubtitleSpecification = (): any => {
    return {
        "subtitleSpecificationId": "3f458b11-2996-41f5-8f22-0114c7bc84db",
        "projectId": "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
        "enabled": true,
        "audioDescription": false,
        "onScreenText": true,
        "spokenAudio": false,
        "speakerIdentification": "NUMBERED",
        "dialogueStyle": "DOUBLE_CHEVRON",
        "maxLinesPerCaption": 4,
        "maxCharactersPerLine": 30,
        "minCaptionDurationInMillis": 2,
        "maxCaptionDurationInMillis": 6,
        "comments": "Note"
    };
}

const SubtitleSpecifications = (): ReactElement => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <div>
            <Button variant="primary" onClick={handleShow} className="dotsub-subtitle-specifications-button"
                    style={{marginLeft: "10px"}}>
                Subtitle Specifications
            </Button>

            <Modal show={show} onHide={handleClose} centered dialogClassName="medium-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Subtitle Specifications</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SubtitleSpecificationsForm subTitleSpecifications={readSubtitleSpecification()}/>
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

export default SubtitleSpecifications;
