import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "../../common/ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";
import { updateCues } from "../cues/cueSlices";

export const CaptionOverlapToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    return (
        <ToggleButton
            className="btn btn-secondary"
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
                toggle ?
                    <><i className="fas fa-lock" /> Disable Overlapping</> :
                    <><i className="fas fa-lock-open" /> Enable Overlapping</>
            )}
        />
    );
};

export default CaptionOverlapToggle;
