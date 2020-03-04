import React, { ReactElement, useEffect } from "react";
import { createAndAddCue, updateEditingCueIndex } from "../cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "../../model";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import { SubtitleEditState } from "../../subtitleEditReducers";

interface Props {
    cueIndex: number;
    cue: CueDto;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
            Mousetrap.bind([KeyCombination.ENTER], () => props.cueIndex === cuesCount - 1
                ? dispatch(createAndAddCue(props.cue, props.cueIndex + 1))
                : dispatch(updateEditingCueIndex(-1)));
        };
        registerShortcuts();
    }, [dispatch, props, cuesCount]);
    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary sbte-add-cue-button"
            onClick={(event: React.MouseEvent<HTMLElement>): void => {
                // TODO: Move this stop propagation to right side action buttons ares,
                // so that it applies also for play/delete buttons: https://dotsub.atlassian.net/browse/VTMS-2279
                // NOTE: This is tested by test in CueLine."opens next cue line for editing ..."
                event.stopPropagation();
                dispatch(createAndAddCue(props.cue, props.cueIndex + 1));
            }}
        >
            <b>+</b>
        </button>
    );
};

export default AddCueLineButton;
