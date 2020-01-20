import React, { ReactElement } from "react";
import { AppThunk } from "../reducers/subtitleEditReducers";
import CueTextEditor from "./CueTextEditor";
import TimeEditor from "./TimeEditor";
import { updateCue } from "../player/trackSlices";
import { useDispatch } from "react-redux";

interface Props {
    index: number;
    cue: VTTCue;
}

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div className="sbte-cue-line" style={{ display: "flex" }}>
            <div style={{
                flex: "1 1 25%", display: "flex", flexDirection: "column",
                paddingLeft: "20px", paddingTop: "15px"
            }}
            >
                <TimeEditor
                    id={`time-start-${props.index}`}
                    time={props.cue.startTime}
                    onChange={(starTime: number): AppThunk =>
                        dispatch(updateCue(props.index,
                            new VTTCue(starTime, props.cue.endTime, props.cue.text)))}
                />
                <TimeEditor
                    id={`time-end-${props.index}`}
                    time={props.cue.endTime}
                    onChange={(endTime: number): AppThunk =>
                        dispatch(updateCue(props.index,
                            new VTTCue(props.cue.startTime, endTime, props.cue.text)))}
                />
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                <CueTextEditor key={props.index} index={props.index} cue={props.cue} />
            </div>
        </div>
    );
};

export default CueLine;
