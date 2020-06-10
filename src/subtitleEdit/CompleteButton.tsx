import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { CueDto, Track } from "./model";
import { Constants } from "./constants";

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
    const isPending = saveStatus === Constants.AUTO_SAVE_SAVING_CHANGES_MSG;
    const isSuccess = saveStatus === Constants.AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG;
    const isError = saveStatus === Constants.AUTO_SAVE_ERROR_SAVING_MSG;
    return (
        <>
            <div
                style={{ textAlign: "center", margin: "8px 10px 0px 0px", fontWeight: "bold" }}
            >
                <span hidden={!isPending}>
                    {Constants.AUTO_SAVE_SAVING_CHANGES_MSG} &nbsp;
                    <i className="fas fa-sync fa-spin" />
                </span>
                <span hidden={!isSuccess} className="text-success">
                    {Constants.AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG} &nbsp;
                    <i className="fa fa-check-circle" />
                </span>
                <span hidden={!isError} className="text-danger">
                    {Constants.AUTO_SAVE_ERROR_SAVING_MSG} &nbsp;
                    <i className="fa fa-exclamation-triangle" />
                </span>
            </div>

            <button
                type="button"
                disabled={isPending}
                className="btn btn-primary sbte-complete-subtitle-btn"
                onClick={(): void => props.onComplete({ editingTrack, cues })}

            >
                Complete

            </button>
        </>
    );
};

export default CompleteButton;
