import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { Track } from "../model";
import { updateEditingTrack } from "../trackSlices";
import Icon from "@mdi/react";
import { mdiClockOutline } from "@mdi/js";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
}

export const TimecodesLockToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <ToggleButton
            className="flex items-center justify-between"
            toggled={timecodesUnlocked}
            onClick={(event): void => {
                const track = {
                    ...editingTrack,
                    timecodesUnlocked: !timecodesUnlocked
                } as Track;
                dispatch(updateEditingTrack(track));
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiClockOutline} size={1.25} />
                                <span className="pl-4">Timecodes</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-success">UNLOCKED</span>
                        </>
                    )
                    : (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiClockOutline} size={1.25} />
                                <span className="pl-4">Timecodes</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">LOCKED</span>
                        </>
                    )
            )}
        />
    );
};

export default TimecodesLockToggle;
