import { MouseEvent, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../manuCapReducers";
import ToggleButton from "./ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { SaveState, Track } from "../model";
import { saveTrack, updateCues } from "../cues/cuesList/cuesListActions";
import Icon from "@mdi/react";
import { mdiSetCenter } from "@mdi/js";

interface Props {
    onClick: (event: MouseEvent<HTMLElement>) => void
    saveState: SaveState;
}

export const CaptionOverlapToggle = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: ManuCapState) => state.editingTrack);
    const cues = useSelector((state: ManuCapState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    return (
        <ToggleButton
            className="flex items-center justify-between"
            disabled={props.saveState === "TRIGGERED"}
            toggled={overlapEnabled}
            onClick={(event): void => {
                const track = {
                    ...editingTrack,
                    overlapEnabled: !overlapEnabled
                } as Track;
                dispatch(updateEditingTrack(track));
                dispatch(updateCues(cues));
                dispatch(saveTrack());
                props.onClick(event);
            }}
            render={(toggle): ReactElement => (
                toggle
                    ? (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiSetCenter} size={1.25} />
                                <span className="pl-4">Overlapping</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-success">ALLOWED</span>
                        </>
                    ) : (
                        <>
                            <span className="flex items-center">
                                <Icon path={mdiSetCenter} size={1.25} />
                                <span className="pl-4">Overlapping</span>
                            </span>
                            <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">
                                NOT ALLOWED
                            </span>
                        </>
                    )
            )}
        />
    );
};

export default CaptionOverlapToggle;
