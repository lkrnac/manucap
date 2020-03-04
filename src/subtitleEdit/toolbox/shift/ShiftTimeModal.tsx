import React, { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import ShiftTimeForm from "./ShiftTimeForm";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTime } from "../../cues/cueSlices";

interface Props {
    show: boolean;
    onClose: () => void;
}

// TODO: This component seems to be very overcomplicated. Why not use redux-form to store the state instead of such
// ugly state handling.
const ShiftTimeModal = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const [shift, setShift] = useState(0);
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);

    // TODO: Such local variable is totally not legal in React components.
    let isValid = true;

    const clearState = (): void => {
        setShift(0);
        isValid = true;
    };

    const handleApplyShift = (): void => {
        dispatch(applyShiftTime(shift));
        clearState();
        props.onClose();
    };

    const handleCancelShift = (): void => {
        clearState();
        props.onClose();
    };

    if ((shift + firstTrackTime) < 0) {
        isValid = false;
    }

    return (
        <Modal show={props.show} onHide={handleCancelShift} centered dialogClassName="sbte-medium-modal">
            <Modal.Header closeButton>
                <Modal.Title>Shift All Track Lines Time</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ShiftTimeForm  onChange={(shiftedTime: number): void =>
                    setShift(shiftedTime)}
                />
                <span className="alert alert-danger" style={{ display: isValid? "none" : "block" }}>
                    Shift value is not valid (first track line time + shift) must be greater or equals 0.
                </span>
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
