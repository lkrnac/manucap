import React, { ReactElement } from "react";
import { CueError } from "../model";
import { TooltipWrapper } from "../TooltipWrapper";
import CueErrorLine from "./CueErrorLine";

interface Props {
    cueIndex: number;
    cuesErrors: CueError[];
    showErrors: boolean;
}

const CueErrorsIcon = (props: Props): ReactElement => {
    const tooltipId = `cueErrorTooltip-${props.cueIndex}`;
    const cuesErrors = props.cuesErrors?.map((cueError: CueError, index: number): ReactElement =>
        <CueErrorLine key={`cueError-${props.cueIndex}-${index}`} cueIndex={index} cueError={cueError} />);
    return (
        <TooltipWrapper
            show={props.showErrors}
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
