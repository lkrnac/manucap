import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";

export const TimecodesLockToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <ToggleButton
            className="btn btn-secondary"
            toggled={timecodesUnlocked}
            onClick={(): void => {
                const track = {
                    ...editingTrack,
                    timecodesUnlocked: !timecodesUnlocked
                } as Track;
                dispatch(updateEditingTrack(track));
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? <><i className="far fa-clock" /> Lock Timecodes</>
                    : <><i className="fas fa-clock" /> Unlock Timecodes</>
            )}
        />
    );
};

export default TimecodesLockToggle;
