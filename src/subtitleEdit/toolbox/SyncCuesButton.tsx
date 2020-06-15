import React, { ReactElement } from "react";
import { useDispatch } from "react-redux";
import { syncCues } from "../cues/cueSlices";
import { callSaveTrack } from "../cues/saveSlices";

const SyncCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            type="button"
            className="sbte-sync-cues-button btn btn-secondary"
            onClick={(): void => {
                dispatch(syncCues());
                dispatch(callSaveTrack());
            }}
        >
            <i className="fas fa-sync" /> Sync Cues
        </button>
    );
};

export default SyncCuesButton;
