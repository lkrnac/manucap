import React, {ReactElement} from "react";
import TimeEditor from "./TimeEditor";
import CueTextEditor from "./CueTextEditor";

interface Props {
    index: number;
    cue: VTTCue;
}

const CueLine = (props: Props): ReactElement => {
    return (
        <div className="sbte-cue-line" style={{display: "flex"}}>
            <div style={{
                flex: "1 1 25%", display: "flex", flexDirection: "column",
                paddingLeft: "20px", paddingTop: "15px"
            }}>
                <TimeEditor id={`${props.index}-time-start`}/>
                <TimeEditor id={`${props.index}-time-end`}/>
            </div>
            <div className="sbte-left-border" style={{flex: "1 1 75%"}}>
                <CueTextEditor key={props.index} index={props.index} cue={props.cue}/>
            </div>
        </div>
    )
};

export default CueLine;
