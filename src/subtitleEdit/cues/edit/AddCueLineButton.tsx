import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import React, { Dispatch, ReactElement, useEffect } from "react";
import { addCue, updateEditingCueIndex } from "../cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueCategory } from "../../model";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import { copyNonConstructorProperties } from "../cueUtils";

const ADD_END_TIME_INTERVAL_SECS = 3;

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
    cueCategory?: CueCategory;
}

const createAndAddCue = (dispatch: Dispatch<AppThunk>, props: Props): void => {
    const newCue =
        new VTTCue(props.vttCue.endTime, props.vttCue.endTime + ADD_END_TIME_INTERVAL_SECS, "");
    copyNonConstructorProperties(newCue, props.vttCue);
    const cue = { vttCue: newCue, cueCategory: props.cueCategory || "DIALOGUE" };
    dispatch(addCue(props.cueIndex + 1, cue));
};

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
            Mousetrap.bind([KeyCombination.ENTER], () => props.cueIndex === cuesCount - 1
                ? createAndAddCue(dispatch, props)
                : dispatch(updateEditingCueIndex(-1)));
        };
        registerShortcuts();
    }, [dispatch, props, cuesCount]);
    return (
        <>
            <button
                className="btn btn-outline-secondary sbte-add-cue-button"
                onClick={(event: React.MouseEvent<HTMLElement>): void => {
                    // TODO: Move this stop propagation to right side action buttons ares,
                    // so that it applies also for play/delete buttons: https://dotsub.atlassian.net/browse/VTMS-2279
                    // NOTE: This is tested by test in CueLine."opens next cue line for editing ..."
                    event.stopPropagation();
                    createAndAddCue(dispatch, props);
                }}
            >
                <b>+</b>
            </button>
        </>
    );
};

export default AddCueLineButton;
