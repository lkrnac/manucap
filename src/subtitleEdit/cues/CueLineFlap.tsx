import React, { ReactElement } from "react";
import { CueDto } from "../model";

interface Props {
    rowIndex: number;
    cue?: CueDto;
}

const CueLineFlap = (props: Props): ReactElement => {
    const cueHasText = props.cue && props.cue.vttCue.text.length;
    const cueIsCorrupted = cueHasText && props.cue?.corrupted;
    const flapClassName = cueHasText ? cueIsCorrupted
        ? "sbte-cue-line-flap-error" : "sbte-cue-line-flap-good"
        : "sbte-cue-line-flap";
    return (
        <div
            className={flapClassName}
            style={{
                textAlign: "center",
                width: "30px",
                color: "white",
                position: "relative"
            }}
        >
            <div
                style={{
                    paddingTop: "10px",
                    fontSize: "11px",
                    fontWeight: "bold"
                }}
            >
                {props.rowIndex + 1}
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
                    cueIsCorrupted ? (
                        <i className="fas fa-exclamation-triangle" />
                    ) : cueHasText ? (
                        <i className="fa fa-check" />
                    ) : null
                }
            </div>
        </div>
    );
};

export default CueLineFlap;

