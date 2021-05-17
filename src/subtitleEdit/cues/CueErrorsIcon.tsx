import React, { ReactElement } from "react";
import { CueError } from "../model";
import { TooltipWrapper } from "../TooltipWrapper";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import CueErrorLine from "./CueErrorLine";

interface Props {
    cueIndex: number;
    cuesErrors: CueError[];
}

const CueErrorsIcon = (props: Props): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const tooltipId = `cueErrorTooltip-${props.cueIndex}`;
    const cuesErrors = props.cuesErrors?.map((cueError: CueError, index: number): ReactElement =>
        <CueErrorLine key={`cueError-${props.cueIndex}-${props.cueIndex}`} cueIndex={index} cueError={cueError} />);
    return (
        <TooltipWrapper
            show={props.cueIndex===editingCueIndex}
            tooltipId={tooltipId}
            bsPrefix="sbte-cues-errors-popover popover"
            text={
                <div className="sbte-cues-errors">
                    <strong>Cue errors</strong>
                    <br />
                    <div>{cuesErrors}</div>
                </div>
            }
            placement="left"
            popover
        >
            <i className="fas fa-exclamation-triangle" />
        </TooltipWrapper>
    );
};

export default CueErrorsIcon;
