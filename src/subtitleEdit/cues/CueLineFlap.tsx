import React, { ReactElement } from "react";
import { CUE_LINE_STATE_CLASSES, CueError, CueLineState } from "../model";
import CueErrorsIcon from "./CueErrorsIcon";

interface Props {
    rowIndex: number;
    cueLineState: CueLineState;
    cuesErrors?: CueError[];
    showErrors?: boolean;
    editDisabled?: boolean;
}

const CueLineFlap = (props: Props): ReactElement => (
    <div
        className={CUE_LINE_STATE_CLASSES.get(props.cueLineState)?.flapClass}
        style={{ textAlign: "center", width: "30px", color: "white", position: "relative" }}
    >
        <div style={{ paddingTop: "10px", fontSize: "11px", fontWeight: "bold" }}>
            {props.rowIndex + 1}
        </div>
        <div
            style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: "0",
                right: "0",
                bottom: "30px",
                fontSize: "14px"
            }}
        >
            {
                props.editDisabled
                    ? <i className="fa fa-lock" />
                    : null
            }
        </div>
        <div
            style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: "0",
                right: "0",
                bottom: "10px",
                fontSize: "14px"
            }}
        >
            {
                props.cueLineState === CueLineState.ERROR
                    ? (
                        <CueErrorsIcon
                            cueIndex={props.rowIndex}
                            cuesErrors={props.cuesErrors || []}
                            showErrors={props.showErrors || false}
                        />
                    )
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

export default CueLineFlap;

