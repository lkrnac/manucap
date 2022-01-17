import { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTimeByPosition } from "../../cues/cuesList/cuesListActions";
import { Field, Form } from "react-final-form";
const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeValid = (value: string, firstTrackTime: number, isMediaChunk: boolean): boolean =>
    !isMediaChunk && (parseFloat(value) + firstTrackTime) < 0;

const normalizeValue = (value: string): string => {
    const parsedValue = parseFloat(value);
    if (parsedValue === 0 || isNaN(parsedValue)) {
        return value;
    }
    return parsedValue.toFixed(3);
};

interface Props {
    show: boolean;
    onClose: () => void;
}

const ShiftTimeModal = (props: Props): ReactElement => {
    const [errorMessage, setErrorMessage] = useState();
    const dispatch = useDispatch();
    const firstTrackTime = useSelector((state: SubtitleEditState) => state.cues[0]?.vttCue.startTime);
    const mediaChunkStart = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaChunkStart);
    const editCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const isMediaChunk = !!mediaChunkStart || mediaChunkStart === 0;

    const handleApplyShift = (shiftPosition: string, shiftTime: string): void => {
        const shiftValue = parseFloat(shiftTime);
        try {
            dispatch(applyShiftTimeByPosition(shiftPosition, editCueIndex, shiftValue));
        } catch (e) {
            // @ts-ignore
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
                <Modal.Title>Shift Track Lines Time</Modal.Title>
            </Modal.Header>
            <Form
                onSubmit={(values): void => handleApplyShift(values.shiftPosition, values.shiftTime)}
                render={({ handleSubmit, values }): ReactElement => (
                    <form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <div className="form-group">
                                <label>Time Shift in Seconds.Milliseconds</label>
                                <Field
                                    name="shiftTime"
                                    component="input"
                                    parse={normalizeValue}
                                    className="form-control dotsub-track-line-shift margin-right-10"
                                    style={{ width: "120px" }}
                                    type="number"
                                    placeholder="0.000"
                                    step={"0.100"}
                                />
                            </div>
                            <div className="form-check">
                                <label>
                                    <Field
                                        name="shiftPosition"
                                        component="input"
                                        type="radio"
                                        value="all"
                                        className="form-check-input"
                                    /> Shift all
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <Field
                                        component="input"
                                        type="radio"
                                        name="shiftPosition"
                                        value="before"
                                        className="form-check-input"
                                    /> Shift all before editing cue
                                </label>
                            </div>
                            <div className="form-check">
                                <label>
                                    <Field
                                        component="input"
                                        type="radio"
                                        name="shiftPosition"
                                        value="after"
                                        className="form-check-input"
                                    /> Shift all after editing cue
                                </label>
                            </div>
                            {
                                errorMessage || isShiftTimeValid(values.shiftTime, firstTrackTime, isMediaChunk) ? (
                                    <span className="alert alert-danger" style={{ display: "block" }}>
                                        {errorMessage || INVALID_SHIFT_MSG}
                                    </span>
                                ): null
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="submit"
                                disabled={
                                    isShiftTimeValid(values.shiftTime, firstTrackTime, isMediaChunk) ||
                                    values.shiftPosition === undefined
                                }
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
