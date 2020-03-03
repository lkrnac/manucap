import React, {ReactElement, useState} from "react";
import Modal from "react-bootstrap/Modal";
import ShiftTimeForm from "./ShiftTimeForm";
import {useDispatch, useSelector} from "react-redux";
import { applyShiftTime } from "../../cues/cueSlices";

import { SubtitleEditState } from "../../subtitleEditReducers";


interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    const clearState = ():void => {
        setShift(0);
        isValid = true;
    }

    const handleApplyShift = (): void => {
        dispatch(applyShiftTime(shift));
        clearState();
        props.onClose()
    };

    const handleCancelShift = (): void => {
        clearState();
        props.onClose()
    };

    const mediaLengthInSeconds = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaLength || 0) / 1000;
    const firstTrackLineStartTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);
    const lastTrackLineEndTime = useSelector((state: SubtitleEditState) => state.cues[state.cues.length-1]?.vttCue.endTime);
    const [shift, setShift] = useState(0);

    let isValid: boolean = true;

    isValid = (shift + firstTrackLineStartTime) >= 0 && (shift + lastTrackLineEndTime) <= mediaLengthInSeconds;

    return (
        <Modal show={props.show} onHide={handleCancelShift} centered dialogClassName="sbte-medium-modal">
            <Modal.Header closeButton>
                <Modal.Title>Shift All Track Lines Time</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ShiftTimeForm  onChange={(shiftedTime: number): void =>
                    setShift(shiftedTime)}/>
                <span className="alert alert-danger" style={{display: isValid? "none" : "block"}}>Shift value is out of bounds [All track lines + shift value must be whitin video bounds].</span>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    disabled={!isValid}
                    onClick={handleApplyShift}
                    className="dotsub-shift-modal-apply-button btn btn-primary"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={handleCancelShift}
                    className="dotsub-shift-modal-close-button btn btn-secondary"
                >
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShiftTimeModal;
