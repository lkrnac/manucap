import { CueCategory, CueDto } from "../../model";
import { copyNonConstructorProperties, Position, positionStyles } from "../cueUtils";
import React, { Dispatch, ReactElement, useEffect } from "react";
import { addCue, setValidationError, updateCueCategory, updateEditingCueIndex, updateVttCue } from "../cueSlices";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import CueCategoryButton from "./CueCategoryButton";
import CueTextEditor from "./CueTextEditor";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { useDispatch, useSelector } from "react-redux";
import { setPendingCueChanges } from "./editorStatesSlice";
import { changePlayerTime } from "../../player/playbackSlices";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: Props,
                                    startTime: number, endTime: number): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateVttCue(props.index, newCue));
    dispatch(setPendingCueChanges(true));
};

const handleEnterForLastCue = (sourceCues: CueDto[], index: number): AppThunk => {
    return sourceCues.length === 0 || sourceCues.length > index + 1
        ? addCue(index + 1)
        : updateEditingCueIndex(-1);
};

const CueEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const validationError = useSelector((state: SubtitleEditState) => state.validationError);

    useEffect(
        () => {
            if (validationError) {
                setTimeout(() => {
                    dispatch(setValidationError(false));
                }, 1000);
            }
        }, [ dispatch, validationError ]
    );

    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    useEffect(() => {
        Mousetrap.bind([KeyCombination.MOD_SHIFT_UP, KeyCombination.ALT_SHIFT_UP], () => {
            updateCueAndCopyProperties(dispatch, props, props.playerTime, props.cue.vttCue.endTime);
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_DOWN, KeyCombination.ALT_SHIFT_DOWN], () => {
            updateCueAndCopyProperties(dispatch, props, props.cue.vttCue.startTime, props.playerTime);
        });
        Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
        Mousetrap.bind([KeyCombination.ENTER], () => {
            return props.index === cuesCount - 1
                ? dispatch(handleEnterForLastCue(sourceCues, props.index))
                : dispatch(updateEditingCueIndex(props.index + 1));
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_ESCAPE, KeyCombination.ALT_SHIFT_ESCAPE],
            () => dispatch(updateEditingCueIndex(props.index - 1))
        );
    }, [ dispatch, props, cuesCount, sourceCues ]);

    useEffect(() => {
        Mousetrap.bind([ KeyCombination.MOD_SHIFT_K, KeyCombination.ALT_SHIFT_K ], () => {
            dispatch(changePlayerTime(props.cue.vttCue.startTime));
        });
    }, [ dispatch, props.cue.vttCue.startTime ]);

    const staticBackground = props.cue.corrupted ? "sbte-background-error-lighter" : "bg-white";
    const className = validationError ? "blink-error-bg" : staticBackground;

    return (
        <div style={{ display: "flex" }} className={className}>
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
                        onChange={(startTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, startTime, props.cue.vttCue.endTime)}
                    />
                    <TimeEditor
                        time={props.cue.vttCue.endTime}
                        onChange={(endTime: number): void =>
                            updateCueAndCopyProperties(dispatch, props, props.cue.vttCue.startTime, endTime)}
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
                            dispatch(setPendingCueChanges(true));
                        }}
                    />
                </div>
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                <CueTextEditor
                    key={props.index}
                    index={props.index}
                    vttCue={props.cue.vttCue}
                />
            </div>
        </div>
    );
};

export default CueEdit;
