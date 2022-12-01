import { ReactElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { applyShiftTimeByPosition } from "../../cues/cuesList/cuesListActions";
import { useForm } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ShiftPosition } from "../../cues/cuesList/cuesListSlices";

const INVALID_SHIFT_MSG = "The start time of the first cue plus the shift value must be greater or equal to 0";

const isShiftTimeInvalid = (value: string, position: ShiftPosition, firstCueTime: number, isMediaChunk: boolean)
    : boolean =>
    !isMediaChunk && position !== ShiftPosition.AFTER ? (parseFloat(value) + firstCueTime) < 0 : false;

interface ShiftTimeValues {
    shiftTime: string;
    shiftPosition: string;
}

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
    const { handleSubmit, register, watch } = useForm();
    const shiftPositionWatch = watch("shiftPosition");
    const shiftTimeWatch = watch("shiftTime");

    const onSubmit = (values: ShiftTimeValues): void => {
        handleApplyShift(values.shiftPosition, values.shiftTime);
    };

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
        <Dialog
            visible={props.show}
            onHide={handleCancelShift}
            className="max-w-3xl"
            appendTo={document.body.querySelector("#prime-react-dialogs") as HTMLDivElement}
            header="Shift Track Lines Time"
            draggable={false}
            dismissableMask
            resizable={false}
            footer={() => (
                <>
                    <button
                        type="submit"
                        disabled={
                            isShiftTimeInvalid(shiftTimeWatch, shiftPositionWatch, firstTrackTime, isMediaChunk) ||
                            shiftPositionWatch === undefined || !shiftTimeWatch
                        }
                        className="dotsub-shift-modal-apply-button sbte-btn sbte-btn-primary"
                        onClick={handleSubmit(onSubmit)}
                    >
                        Apply
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelShift}
                        className="dotsub-shift-modal-close-button sbte-btn sbte-btn-light"
                    >
                        Close
                    </button>
                </>
            )}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label>Time Shift in Seconds.Milliseconds</label>
                    <input
                        name="shiftTime"
                        className="sbte-form-control dotsub-track-line-shift mt-2"
                        style={{ width: "120px" }}
                        type="number"
                        placeholder="0.000"
                        step={"0.100"}
                        ref={register}
                    />
                </div>
                <fieldset className="space-y-2">
                    <div className="form-check">
                        <label>
                            <input
                                name="shiftPosition"
                                type="radio"
                                value={ShiftPosition.ALL}
                                ref={register}
                            /> Shift all
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input
                                type="radio"
                                name="shiftPosition"
                                value={ShiftPosition.BEFORE}
                                ref={register}
                            /> Shift all before editing cue
                        </label>
                    </div>
                    <div className="form-check">
                        <label>
                            <input
                                type="radio"
                                name="shiftPosition"
                                value={ShiftPosition.AFTER}
                                ref={register}
                            /> Shift all after editing cue
                        </label>
                    </div>
                </fieldset>
                {
                    errorMessage || isShiftTimeInvalid(shiftTimeWatch, shiftPositionWatch, firstTrackTime, isMediaChunk)
                        ? (
                            <div>
                                <Message
                                    severity="error"
                                    className="w-full justify-start"
                                    text={errorMessage || INVALID_SHIFT_MSG}
                                />
                            </div>
                        )
                        : null
                }
            </form>
        </Dialog>
    );
};

export default ShiftTimeModal;
