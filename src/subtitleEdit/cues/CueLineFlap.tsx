import React, { ReactElement } from "react";
import { CueDtoWithIndex, CueLineDto } from "../model";
import _ from "lodash";


interface Props {
    rowIndex: number;
    cueLine?: CueLineDto;
}

const hasTargetText = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => !_.isEmpty(cueWithIndex?.cue.vttCue.text))
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};

const hasCorruptedTargetCue = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => cueWithIndex?.cue.corrupted === true)
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};


const CueLineFlap = (props: Props): ReactElement => {
    const someCueHasText = hasTargetText(props.cueLine);
    const someCueCorrupted = someCueHasText && hasCorruptedTargetCue(props.cueLine);
    const flapClassName = someCueHasText
            ? someCueCorrupted ? "sbte-cue-line-flap-error" : "sbte-cue-line-flap-good"
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
                    someCueCorrupted
                        ? <i className="fas fa-exclamation-triangle" />
                        : someCueHasText
                            ? <i className="fa fa-check" />
                            : null
                }
            </div>
        </div>
    );
};

export default CueLineFlap;

