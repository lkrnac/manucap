import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import ToggleButton from "./ToggleButton";
import { updateEditingTrack } from "../trackSlices";
import { Track } from "../model";
import { updateCues } from "../cues/cuesList/cuesListActions";
import { isPendingSaveState } from "../cues/saveSlices";
import { TooltipWrapper } from "../TooltipWrapper";

export const CaptionOverlapToggle = (): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const overlapEnabled = editingTrack?.overlapEnabled;
    const saveState = useSelector((state: SubtitleEditState) => state.saveAction.saveState);
    return (
        <ToggleButton
            className="btn"
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
            render={(toggle): ReactElement => (toggle
                    ?
                        <TooltipWrapper
                            tooltipId="disableOverlapToolboxBtnTooltip"
                            text="Disable Overlapping"
                            placement="right"
                        >
                            <i className="fa-duotone fa-diagram-venn fa-2x" />
                        </TooltipWrapper>
                    :
                        <TooltipWrapper
                            tooltipId="disableOverlapToolboxBtnTooltip"
                            text="Enable Overlapping"
                            placement="right"
                        >
                            <i className="fa-duotone fa-diagram-venn fa-2x" />
                        </TooltipWrapper>

            )}
        />
    );
};

export default CaptionOverlapToggle;
