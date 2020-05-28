import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { CueDto, Track } from "./model";

interface CompleteAction {
    editingTrack: Track | null;
    cues: CueDto[];
}

interface Props {
    onComplete: (completeAction: CompleteAction) => void;
}

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const saveStatus = useSelector((state: SubtitleEditState) => state.saveStatus);
    return (
        <>
            <div
                style={{ textAlign: "center", margin: "8px 10px 0px 0px" }}
                className="sbte-light-gray-text"
            >
                <span>
                    {saveStatus.message} &nbsp;
                    <i hidden={!saveStatus.pendingChanges} className="fas fa-sync fa-spin" />
                </span>
            </div>

            <button
                type="button"
                disabled={saveStatus.pendingChanges}
                className="btn btn-primary sbte-complete-subtitle-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}

            >
                Complete

            </button>
        </>
    );
};

export default CompleteButton;
