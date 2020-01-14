import React, { ReactElement } from "react";
import CueTextEditor from "./CueTextEditor";
import TimeEditor from "./TimeEditor";

interface Props {
    index: number;
    cue: VTTCue;
}

const CueLine = (props: Props): ReactElement => {
    return (
        <div className="sbte-cue-line" style={{ display: "flex" }}>
            <div style={{
                flex: "1 1 25%", display: "flex", flexDirection: "column",
                paddingLeft: "20px", paddingTop: "15px"
            }}
            >
                <TimeEditor id={`${props.index}-time-start`} time={props.cue.startTime} />
                <TimeEditor id={`${props.index}-time-end`} time={props.cue.endTime} />
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                <CueTextEditor key={props.index} index={props.index} cue={props.cue} />
            </div>
        </div>
    );
};

export default CueLine;
