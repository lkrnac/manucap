import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { SaveState, SaveStateValue, TrackCues } from "./model";
import { isPendingSaveState } from "./cues/saveSlices";


interface Props {
    onComplete: (trackCues: TrackCues) => void;
    disabled?: boolean;
    saveState: SaveStateValue;
}

const AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
const TASK_COMPLETE_MSG = "Edits are disabled, task is already completed";

const stateMessages = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ SaveState.SAVED, "All changes saved to server" ],
    [ SaveState.ERROR, "Error saving latest changes" ],
]);

const stateIconCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "fa-duotone fa-sync fa-spin" ],
    [ SaveState.SAVED, "fa-duotone fa-check-circle" ],
    [ SaveState.ERROR, "fa-duotone fa-exclamation-triangle" ],
]);

const stateCssClasses = new Map([
    [ SaveState.NONE, "" ],
    [ SaveState.TRIGGERED, "" ],
    [ SaveState.SAVED, "text-green-light" ],
    [ SaveState.ERROR, "text-danger" ],
]);

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const stateIconClass = stateIconCssClasses.get(props.saveState);
    return (
        <div className="space-x-4 flex items-center">
            <div className="font-medium">
                {
                    props.disabled ?
                        <span className="text-green-primary">{TASK_COMPLETE_MSG}</span> :
                        <span
                            hidden={props.saveState === SaveState.NONE}
                            className={`flex items-center ${stateCssClasses.get(props.saveState)}`}
                        >
                            <span className="leading-none">{stateMessages.get(props.saveState)}</span>
                            <i className={`ml-2${stateIconClass ? ` ${stateIconClass}` : ""}`} />
                        </span>
                }
            </div>
            <button
                type="button"
                className="sbte-btn sbte-btn-primary sbte-complete-subtitle-sbte-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}
                disabled={props.disabled || isPendingSaveState(props.saveState)}
            >
                Complete
            </button>
        </div>
    );
};

export default CompleteButton;
