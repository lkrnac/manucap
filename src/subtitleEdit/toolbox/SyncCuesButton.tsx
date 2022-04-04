import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncCues } from "../cues/cuesList/cuesListActions";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import { SubtitleEditState } from "../subtitleEditReducers";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

const SyncCuesButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <button
            className="sbte-sync-cues-button"
            disabled={!timecodesUnlocked}
            onClick={(event): void => {
                dispatch(syncCues());
                // unset the track's id to force creating a new version
                const track = {
                    ...editingTrack,
                    id: undefined
                } as Track;
                dispatch(updateEditingTrack(track));
                props.onClick(event);
            }}
        >
            Sync Cues
        </button>
    );
};

export default SyncCuesButton;
