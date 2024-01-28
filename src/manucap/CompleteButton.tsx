import Icon from "@mdi/react";
import { ReactElement } from "react";
import { useSelector } from "react-redux";
import { ManuCapState } from "./manuCapReducers";
import { SaveState, TrackCues } from "./model";
import { mdiAlertOutline, mdiCheckCircleOutline, mdiLoading } from "@mdi/js";

interface Props {
    onComplete: (trackCues: TrackCues) => void;
    disabled?: boolean;
    saveState: SaveState;
}

const AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
const TASK_COMPLETE_MSG = "Edits are disabled, task is already completed";

const stateMessages = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", AUTO_SAVE_SAVING_CHANGES_MSG ],
    [ "SAVED", "All changes saved to server" ],
    [ "ERROR", "Error saving latest changes" ],
]);

const stateIcons = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", mdiLoading ],
    [ "SAVED", mdiCheckCircleOutline ],
    [ "ERROR", mdiAlertOutline ],
]);

const stateCssClasses = new Map<SaveState, string>([
    [ "NONE", "" ],
    [ "TRIGGERED", "" ],
    [ "SAVED", "text-green-light" ],
    [ "ERROR", "text-danger" ],
]);

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const cues = useSelector((state: ManuCapState) => state.cues);
    const stateIcon = stateIcons.get(props.saveState);
    return (
        <div className="space-x-4 flex items-center">
            <div className="font-medium">
                {
                    props.disabled && props.saveState !== "TRIGGERED"
                        ? <span className="text-green-primary">{TASK_COMPLETE_MSG}</span>
                        : (
                            <span
                                hidden={props.saveState === "NONE"}
                                className={`flex items-center ${stateCssClasses.get(props.saveState)}`}
                            >
                                <span className="leading-none pr-4">{stateMessages.get(props.saveState)}</span>
                                <Icon
                                    path={`${stateIcon}`}
                                    size={1.5}
                                    spin={stateIcon === mdiLoading}
                                />
                            </span>
                        )
                }
            </div>
            <button
                type="button"
                className="mc-btn mc-btn-primary mc-complete-caption-mc-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}
                disabled={props.disabled || props.saveState === "TRIGGERED"}
            >
                Complete
            </button>
        </div>
    );
};

export default CompleteButton;
