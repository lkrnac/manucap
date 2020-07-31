import React, { ReactElement } from "react";
import { CueDto } from "../model";

interface Props {
    rowIndex: number;
    cue?: CueDto;
}

const CueLineFlap = (props: Props): ReactElement => {
    const flapClassName = props.cue && (props.cue.errors && props.cue.errors.length > 0)
        ? `sbte-cue-line-flap-error-${props.cue.errors.length}`
        : "sbte-cue-line-flap";
    return (
        <div
            className={flapClassName}
            style={{
                paddingTop: "10px",
                width: "30px",
                color: "white",
                fontSize: "11px",
                fontWeight: "bold",
                textAlign: "center"
            }}
        >
            {props.rowIndex + 1}
        </div>
    );
};

export default CueLineFlap;
