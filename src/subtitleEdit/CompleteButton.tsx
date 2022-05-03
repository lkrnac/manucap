import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { CueDto, Track } from "./model";
import { isPendingSaveState, SaveState } from "./cues/saveSlices";

interface CompleteAction {
    editingTrack: Track | null;
    cues: CueDto[];
}

interface Props {
    onComplete: (completeAction: CompleteAction) => void;
    disabled?: boolean;
}

const AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
const TASK_COMPLETE_MSG = "Edits are disabled, task is already completed";

const stateMessages = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.REQUEST_SENT, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.RETRY, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.SAVED, "All changes saved to server" ],
    [ SaveState.ERROR, "Error saving latest changes" ],
]);

const stateIconCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "fas fa-sync fa-spin" ],
    [ SaveState.REQUEST_SENT, "fas fa-sync fa-spin" ],
    [ SaveState.RETRY, "fas fa-sync fa-spin" ],
    [ SaveState.SAVED, "fa fa-check-circle" ],
    [ SaveState.ERROR, "fa fa-exclamation-triangle" ],
]);

const stateCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "" ],
    [ SaveState.REQUEST_SENT, "" ],
    [ SaveState.RETRY, "" ],
    [ SaveState.SAVED, "tw-text-green-light" ],
    [ SaveState.ERROR, "text-danger" ],
]);

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const saveState = useSelector((state: SubtitleEditState) => state.saveAction.saveState);
    const stateIconClass = stateIconCssClasses.get(saveState);
    return (
        <div className="tw-space-x-4 tw-flex tw-items-center">
            <div className="tw-font-medium">
                {
                    props.disabled ?
                        <span className="tw-text-green-light">{TASK_COMPLETE_MSG}</span> :
                        <span
                            hidden={saveState === SaveState.NONE}
                            className={`tw-flex tw-items-center ${stateCssClasses.get(saveState)}`}
                        >
                            <span className="tw-leading-none">{stateMessages.get(saveState)}</span>
                            <i className={`tw-ml-1${stateIconClass ? ` ${stateIconClass}` : ""}`} />
                        </span>
                }
            </div>
            <button
                type="button"
                disabled={props.disabled || isPendingSaveState(saveState)}
                className="tw-btn tw-btn-primary sbte-complete-subtitle-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}
            >
                Complete
            </button>
        </div>
    );
};

export default CompleteButton;
