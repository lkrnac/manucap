import React, { CSSProperties, ReactElement } from "react";
import { CUE_LINE_STATE_CLASSES, CueError, CueLineState } from "../../model";
import { TooltipWrapper } from "../../TooltipWrapper";

interface Props {
    rowIndex: number;
    cueLineState: CueLineState;
    cuesErrors?: CueError[];
    showErrors?: boolean;
    editDisabled?: boolean;
    cueCommentsCount?: number;
}

const getCommentIcon = (index: number): ReactElement => (
    <TooltipWrapper
        tooltipId={`cueCommentTooltip-${index}`}
        text="Subtitle(s) has comments"
        placement="right"
    >
        <i className="fa fa-comments" />
    </TooltipWrapper>
);

const getIconStyle = (bottom: string): CSSProperties => {
    return {
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: "0",
        right: "0",
        bottom: bottom,
        fontSize: "14px"
    };
};

const CueLineFlap = (props: Props): ReactElement => {
    const showCommentsIcon = props.cueCommentsCount && props.cueCommentsCount > 0;
    return (
        <div
            className={CUE_LINE_STATE_CLASSES.get(props.cueLineState)?.flapClass}
            style={{
                textAlign: "center",
                width: "30px",
                color: "white",
                position: "relative",
                minHeight: props.editDisabled && showCommentsIcon ? "100px" : "80px"
            }}
        >
            <div style={{ paddingTop: "10px", fontSize: "11px", fontWeight: "bold" }}>
                {props.rowIndex + 1}
            </div>
            <div
                style={getIconStyle(showCommentsIcon ? "50px" : "30px")}
            >
                {
                    props.editDisabled
                        ? <i className="fa fa-lock" />
                        : null
                }
            </div>
            <div
                style={getIconStyle("30px")}
            >
                {
                    showCommentsIcon
                        ? getCommentIcon(props.rowIndex)
                        : null
                }
            </div>
            <div
                style={getIconStyle("10px")}
            >
                {
                    props.cueLineState === CueLineState.ERROR
                        ? <i className="fas fa-exclamation-triangle" />
                        : null
                }
                {
                    props.cueLineState === CueLineState.GOOD
                        ? <i className="fa fa-check" />
                        : null
                }
            </div>
        </div>
    );
};

export default CueLineFlap;

