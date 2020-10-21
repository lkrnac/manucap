import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTime } from "../../cues/cuesListSlices";
import { Field, Form } from "react-final-form";
import { callSaveTrack } from "../../cues/saveSlices";

const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeValid = (value: string, firstTrackTime: number): boolean => (parseFloat(value) + firstTrackTime) < 0;

const normalizeValue = (value: string): string => parseFloat(value).toFixed(3);

interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);

    const handleApplyShift = (shift: string): void => {
        const shiftValue = parseFloat(shift);
        dispatch(applyShiftTime(shiftValue));
        dispatch(callSaveTrack());
        props.onClose();
    };

    const handleCancelShift = (): void => {
        props.onClose();
    };

    return (
        <Modal show={props.show} onHide={handleCancelShift} centered dialogClassName="sbte-medium-modal">
            <Modal.Header closeButton>
                <Modal.Title>Shift All Track Lines Time</Modal.Title>
            </Modal.Header>
            <Form
                onSubmit={(values): void => handleApplyShift(values.shift)}
                render={({ handleSubmit, values }): ReactElement => (
                    <form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <div className="form-group">
                                <label>Time Shift in Seconds.Milliseconds</label>
                                <Field
                                    name="shift"
                                    component="input"
                                    parse={normalizeValue}
                                    className="form-control dotsub-track-line-shift margin-right-10"
                                    style={{ width: "120px" }}
                                    type="number"
                                    placeholder="0.000"
                                    step={"0.100"}
                                />
                            </div>
                            {
                                isShiftTimeValid(values.shift, firstTrackTime) ? (
                                    <span className="alert alert-danger" style={{ display: "block" }}>
                                        {INVALID_SHIFT_MSG}
                                    </span>
                                ): null
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="submit"
                                disabled={isShiftTimeValid(values.shift, firstTrackTime)}
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
                    </form>
                )}
            />
        </Modal>
    );
};

export default ShiftTimeModal;
