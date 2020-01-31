import { CueCategory, CueDto } from "../player/model";
import { Position, copyNonConstructorProperties, positionStyles } from "./cueUtils";
import React, { Dispatch, ReactElement } from "react";
import { updateCueCategory, updateVttCue } from "../player/trackSlices";
import { AppThunk } from "../reducers/subtitleEditReducers";
import CueTextEditor from "./CueTextEditor";
import LineCategoryButton from "./LineCategoryButton";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { useDispatch } from "react-redux";

interface Props {
    index: number;
    cue: CueDto;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: Props,
                                    startTime: number, endTime: number): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateVttCue(props.index, newCue));
};

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div style={{ display: "flex", paddingBottom: "5px" }}>
            <div
                className="sbte-cue-line-flap"
                style={{
                    flex: "1 1 20px",
                    paddingLeft: "8px",
                    paddingTop: "10px",
                }}
            >
                {props.index + 1}
            </div>
            <div
                className="sbte-cue-line-left-section"
                style={{
                    flex: "1 1 300px",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "10px",
                    paddingTop: "5px",
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
                    <LineCategoryButton
                        onChange={(cueCategory: CueCategory): AppThunk =>
                            dispatch(updateCueCategory(props.index, cueCategory))}
                        category={props.cue.cueCategory}
                    />
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
                            dispatch(updateVttCue(props.index, newCue));
                        }}
                    />
                </div>
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                <CueTextEditor
                    key={props.index}
                    index={props.index}
                    vttCue={props.cue.vttCue}
                    cueCategory={props.cue.cueCategory}
                />
            </div>
        </div>
    );
};

export default CueLine;
