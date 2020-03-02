import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CueCategory } from "../../model";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { updateEditingCueIndex, createAndAddCue } from "../cueSlices";


interface Props {
    cueIndex: number;
    vttCue: VTTCue;
    cueCategory: CueCategory;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);
    const mediaLengthInSeconds = useSelector((state: SubtitleEditState) => state.editingTrack?.mediaLength || 0) / 1000;
    useEffect(() => {
        const registerShortcuts = (): void => {
            const oldCue = { vttCue: props.vttCue, cueCategory: props.cueCategory };
            Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
            Mousetrap.bind([KeyCombination.ENTER], () => props.cueIndex === cuesCount - 1
                ? dispatch(createAndAddCue(oldCue, props.cueIndex + 1))
                : dispatch(updateEditingCueIndex(-1)));
        };
        registerShortcuts();
    }, [dispatch, props, cuesCount]);
    return (
        <>
            <button
                className="btn btn-outline-secondary sbte-add-cue-button"
                disabled={props.vttCue.endTime == mediaLengthInSeconds}
                onClick={(event: React.MouseEvent<HTMLElement>): void => {
                    // TODO: Move this stop propagation to right side action buttons ares,
                    // so that it applies also for play/delete buttons: https://dotsub.atlassian.net/browse/VTMS-2279
                    // NOTE: This is tested by test in CueLine."opens next cue line for editing ..."
                    event.stopPropagation();
                    const oldCue = { vttCue: props.vttCue, cueCategory: props.cueCategory };
                    dispatch(createAndAddCue(oldCue, props.cueIndex + 1));
                }}
            >
                <b>+</b>
            </button>
        </>
    );
};

export default AddCueLineButton;
