import { AppThunk } from "../../subtitleEditReducers";
import React, { ReactElement } from "react";
import { splitCue } from "../cuesListActions";
import { useDispatch } from "react-redux";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    cueIndex: number;
}

const SplitCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <TooltipWrapper
            tooltipId="splitCueBtnTooltip"
            text="Split this subtitle"
            placement="left"
        >
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-split-cue-button"
                onClick={(): AppThunk => dispatch(splitCue(props.cueIndex))}
            >
                <i className="fas fa-cut" />
            </button>
        </TooltipWrapper>
    );
};

export default SplitCueLineButton;
