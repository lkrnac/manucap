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
    const sourceCuesErrors = props.sourceCuesErrors?.map(cueError => <><span>&#8226; {cueError}</span><br /></>);
    const targetCuesErrors = props.targetCuesErrors?.map(cueError => <><span>&#8226; {cueError}</span><br /></>);
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
