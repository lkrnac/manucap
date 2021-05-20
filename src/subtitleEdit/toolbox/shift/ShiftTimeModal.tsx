import React, { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTime } from "../../cues/cuesListActions";
import { Field, Form } from "react-final-form";

const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeValid = (value: string, firstTrackTime: number, isMediaChunk: boolean): boolean =>
    !isMediaChunk && (parseFloat(value) + firstTrackTime) < 0;

const normalizeValue = (value: string): string => parseFloat(value).toFixed(3);

interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const [errorMessage, setErrorMessage] = useState();
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);
    const mediaChunkStart = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaChunkStart);
    const isMediaChunk = !!mediaChunkStart || mediaChunkStart === 0;

    const handleApplyShift = (shift: string): void => {
        const shiftValue = parseFloat(shift);
        try {
            dispatch(applyShiftTime(shiftValue));
        } catch (e) {
            setErrorMessage(e.message);
            return;
        }
        props.onClose();
    };

    const handleCancelShift = (): void => {
        setErrorMessage(undefined);
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
                                errorMessage || isShiftTimeValid(values.shift, firstTrackTime, isMediaChunk) ? (
                                    <span className="alert alert-danger" style={{ display: "block" }}>
                                        {errorMessage || INVALID_SHIFT_MSG}
                                    </span>
                                ): null
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="submit"
                                disabled={isShiftTimeValid(values.shift, firstTrackTime, isMediaChunk)}
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
