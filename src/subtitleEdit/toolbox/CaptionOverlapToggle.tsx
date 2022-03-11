import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";
import { updateCues } from "../cues/cuesList/cuesListActions";
import { isPendingSaveState } from "../cues/saveSlices";

export const CaptionOverlapToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    const saveState = useSelector((state: SubtitleEditState) => state.saveAction.saveState);
    return (
        <ToggleButton
            className="tw-dropdown-item tw-flex tw-items-center tw-justify-between"
            disabled={isPendingSaveState(saveState)}
            toggled={overlapEnabled}
            onClick={(): void => {
                const track = {
                    ...editingTrack,
                    overlapEnabled: !overlapEnabled
                } as Track;
                dispatch(updateEditingTrack(track));
                dispatch(updateCues(cues));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            Overlapping{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-success">ALLOWED</span>
                        </>
                    ) : (
                        <>
                            Overlapping{" "}
                            <span className="tw-badge tw-font-bold tw-badge-sm tw-badge-secondary">NOT ALLOWED</span>
                        </>
                    )
            )}
        />
    );
};

export default CaptionOverlapToggle;
