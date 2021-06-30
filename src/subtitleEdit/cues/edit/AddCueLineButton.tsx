import { AppThunk } from "../../subtitleEditReducers";
import React, { ReactElement } from "react";
import { addCue } from "../cuesList/cuesListActions";
import { useDispatch } from "react-redux";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    cueIndex: number;
    sourceCueIndexes: number[];
    text?: string;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <TooltipWrapper
            tooltipId="addCueBtnTooltip"
            text="Insert new subtitle"
            placement="left"
        >
            <button
                style={{ maxHeight: "38px", margin: "5px" }}
                className="btn btn-outline-secondary sbte-add-cue-button"
                onClick={(): AppThunk => dispatch(addCue(props.cueIndex + 1, props.sourceCueIndexes))}
            >
                {
                    props.text ? <span>{props.text}</span> : <b>+</b>
                }
            </button>
        </TooltipWrapper>
    );
};

export default AddCueLineButton;
