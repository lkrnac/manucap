import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import React, { ReactElement } from "react";
import { splitCue } from "../cuesList/cuesListActions";
import { useDispatch, useSelector } from "react-redux";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    cueIndex: number;
}

const SplitCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;
    return (
        <TooltipWrapper
            tooltipId="splitCueBtnTooltip"
            text="Split this subtitle"
            placement="left"
        >
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-split-cue-button"
                disabled={isTranslation && !timecodesUnlocked}
                title="Unlock timecodes to enable"
                onClick={(): AppThunk => dispatch(splitCue(props.cueIndex))}
            >
                <i className="fas fa-cut" />
            </button>
        </TooltipWrapper>
    );
};

export default SplitCueLineButton;
