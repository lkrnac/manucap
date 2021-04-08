import React, { ReactElement } from "react";
import { CueError } from "../model";
import { TooltipWrapper } from "../TooltipWrapper";

interface Props {
    cueIndex: number;
    sourceCuesErrors?: CueError[];
    targetCuesErrors?: CueError[];
}

const CueErrorsIcon = (props: Props): ReactElement => {
    const tooltipId = `cue${props.cueIndex}ErrorTooltip`;
    const sourceCuesErrors = props.sourceCuesErrors?.map((cueError: CueError, index: number): ReactElement =>
        <div key={`sourceCueError-${props.cueIndex}-${index}`}>&#8226; {cueError}<br /></div>);
    const targetCuesErrors = props.targetCuesErrors?.map((cueError: CueError, index: number): ReactElement =>
        <div key={`targetCueError-${props.cueIndex}-${index}`}>&#8226; {cueError}<br /></div>);
    return (
        <TooltipWrapper
            tooltipId={tooltipId}
            text={
                <>
                    {
                        (sourceCuesErrors && sourceCuesErrors.length > 0) ?
                            <div className="sbte-source-cues-errors">
                                <strong>Caption(s)</strong>
                                <br />
                                <div>{sourceCuesErrors}</div>
                            </div>
                            : null
                    }
                    {
                        (targetCuesErrors && targetCuesErrors.length > 0) ?
                            <div className="sbte-target-cues-errors">
                                <strong>Translation(s)</strong>
                                <br />
                                {targetCuesErrors}
                            </div>
                            : null
                    }
                </>
            }
            placement="right"
            popover
        >
            <i className="fas fa-exclamation-triangle" />
        </TooltipWrapper>
    );
};

export default CueErrorsIcon;
