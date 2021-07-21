import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCues } from "../cues/cuesList/cuesListActions";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

const SyncCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    return (
        <button
            type="button"
            className="sbte-sync-cues-button btn btn-secondary"
            onClick={(): void => {
                dispatch(syncCues());
                // unset the track's id to force creating a new version
                const track = {
                    ...editingTrack,
                    id: undefined
                } as Track;
                dispatch(updateEditingTrack(track));
            }}
        >
            <i className="fas fa-sync" /> Sync Cues
        </button>
    );
};

export default SyncCuesButton;
