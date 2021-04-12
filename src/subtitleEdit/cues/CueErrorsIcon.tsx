import React, { ReactElement } from "react";
import { CueError } from "../model";
import { TooltipWrapper } from "../TooltipWrapper";

interface Props {
    cueIndex: number;
    cuesErrors: CueError[];
}

const CueErrorsIcon = (props: Props): ReactElement => {
    const tooltipId = `cueErrorTooltip-${props.cueIndex}`;
    const cuesErrors = props.cuesErrors?.map((cueError: CueError, index: number): ReactElement =>
        <div key={`cueError-${props.cueIndex}-${index}`}>&#8226; {cueError}<br /></div>);
    return (
        <TooltipWrapper
            tooltipId={tooltipId}
            text={
                <div className="sbte-cues-errors">
                    <strong>Cue(s) errors</strong>
                    <br />
                    <div>{cuesErrors}</div>
                </div>
            }
            placement="right"
            popover
        >
            <i className="fas fa-exclamation-triangle" />
        </TooltipWrapper>
    );
};

export default CueErrorsIcon;
