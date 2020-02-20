import React, {ReactElement, useState} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
// import { useSelector } from "react-redux";
import ShiftTimeForm from "./ShiftTimeForm";
import {useDispatch, useSelector} from "react-redux";
import { applyShiftTime } from "../../trackSlices";

import { SubtitleEditState } from "../../subtitleEditReducers";


interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);
    const [shift, setShift] = useState(0);


    let isValid: boolean = true;
    if ((shift + firstTrackTime) < 0) {
        isValid = false;
    }

    return (
        <Modal show={props.show} onHide={props.onClose} centered dialogClassName="sbte-medium-modal">
            <Modal.Header closeButton>
                <Modal.Title>Subtitle Specifications</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ShiftTimeForm  onChange={(shiftedTime: number): void =>
                    setShift(shiftedTime)}/>
                <span className="alert alert-danger" style={{display: isValid? "none" : "block"}}>Shift value is not valid (first track line time + shift) must be greater or equals 0.</span>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    onClick={(): void => {
                          dispatch(applyShiftTime(shift));
                          props.onClose()
                    }}
                    className="dotsub-shift-modal-apply-button"
                >
                    Apply
                </Button>
                <Button
                    variant="primary"
                    onClick={props.onClose}
                    className="dotsub-shift-modal-close-button"
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShiftTimeModal;
