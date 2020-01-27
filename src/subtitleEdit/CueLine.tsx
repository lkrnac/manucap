import { Position, copyNonConstructorProperties, positionStyles } from "./cueUtils";
import React, { Dispatch, ReactElement } from "react";
import { AppThunk } from "../reducers/subtitleEditReducers";
import { CueDto } from "../player/model";
import CueTextEditor from "./CueTextEditor";
import LineCategoryButton from "./LineCategoryButton";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { updateCue } from "../player/trackSlices";
import { useDispatch } from "react-redux";

interface Props {
    index: number;
    cue: CueDto;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: Props,
                                    startTime: number, endTime: number): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateCue(props.index, newCue));
};

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div className="sbte-cue-line" style={{ display: "flex" }}>
            <div style={{
                flex: "1 1 300px",
                display: "flex",
                flexDirection: "column",
                paddingLeft: "20px",
                paddingTop: "15px",
                justifyContent: "space-between"
            }}
            >
                <div style={{
                    display: "flex",
                    flexDirection:"column",
                    paddingBottom: "15px"
                }}
                >
                    <TimeEditor
                        time={props.cue.vttCue.startTime}
                        onChange={(starTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, starTime, props.cue.vttCue.endTime)}
                    />
                    <TimeEditor
                        time={props.cue.vttCue.endTime}
                        onChange={(endTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, props.cue.vttCue.startTime, endTime)}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    {/* TODO: pass category value and implement onchange */}
                    <LineCategoryButton onChange={(): void => {}} />
                    <PositionButton
                        vttCue={props.cue.vttCue}
                        changePosition={(position: Position): void => {
                            const newCue =
                                new VTTCue(props.cue.vttCue.startTime, props.cue.vttCue.endTime, props.cue.vttCue.text);
                            copyNonConstructorProperties(newCue, props.cue.vttCue);
                            const newPositionProperties = positionStyles.get(position);
                            for (const property in newPositionProperties) {
                                // noinspection JSUnfilteredForInLoop
                                newCue[property] = newPositionProperties[property];
                            }
                            dispatch(updateCue(props.index, newCue));
                        }}
                    />
                </div>
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 75%" }}>
                <CueTextEditor key={props.index} index={props.index} vttCue={props.cue.vttCue} />
            </div>
        </div>
    );
};

export default CueLine;
