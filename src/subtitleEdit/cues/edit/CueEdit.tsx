import { CueCategory, CueDto } from "../../model";
import { Position, copyNonConstructorProperties, positionStyles } from "../cueUtils";
import React, { Dispatch, ReactElement, useEffect } from "react";
import { updateCueCategory, updateVttCue } from "../cueSlices";
import { AppThunk } from "../../subtitleEditReducers";
import CueCategoryButton from "./CueCategoryButton";
import CueTextEditor from "./CueTextEditor";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { useDispatch } from "react-redux";

const HALF_SECOND = 0.5;

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
    hideAddButton: boolean;
    hideDeleteButton: boolean;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: Props,
                                    startTime: number, endTime: number): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateVttCue(props.index, newCue));
};

const CueEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.MOD_SHIFT_UP, KeyCombination.ALT_SHIFT_UP], () => {
                updateCueAndCopyProperties(dispatch, props, props.playerTime, props.cue.vttCue.endTime);
            });
            Mousetrap.bind([KeyCombination.MOD_SHIFT_DOWN, KeyCombination.ALT_SHIFT_DOWN], () => {
                updateCueAndCopyProperties(dispatch, props, props.cue.vttCue.startTime, props.playerTime);
            });
        };
        registerShortcuts();
    }, [dispatch, props]);

    return (
        <div style={{ display: "flex" }} className="bg-white">
            <div
                style={{
                    flex: "1 1 300px",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", flexDirection:"column", paddingBottom: "15px" }}>
                    <TimeEditor
                        time={props.cue.vttCue.startTime}
                        onChange={(starTime: number): void => {
                            let endTime = props.cue.vttCue.endTime;
                            if (starTime >= props.cue.vttCue.endTime) {
                                endTime = starTime + HALF_SECOND;
                            }
                            updateCueAndCopyProperties(dispatch, props, starTime, endTime);
                        }}
                    />
                    <TimeEditor
                        time={props.cue.vttCue.endTime}
                        onChange={(endTime: number): void => {
                            let newEndTime = endTime;
                            if (props.cue.vttCue.startTime >= endTime) {
                                newEndTime = props.cue.vttCue.startTime + HALF_SECOND;
                            }
                            updateCueAndCopyProperties(dispatch, props, props.cue.vttCue.startTime, newEndTime);
                        }}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <CueCategoryButton
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
                    hideAddButton={props.hideAddButton}
                    hideDeleteButton={props.hideDeleteButton}
                />
            </div>
        </div>
    );
};

export default CueEdit;
