import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCues } from "../cues/cuesList/cuesListActions";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

const SyncCuesButton = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="sbte-sync-cues-button tw-dropdown-item"
            disabled={!timecodesUnlocked}
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
            Sync Cues
        </button>
    );
};

export default SyncCuesButton;
