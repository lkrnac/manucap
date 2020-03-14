import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import React, { ReactElement, useEffect } from "react";
import { createAndAddCue, updateEditingCueIndex } from "../cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "../../model";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";

interface Props {
    cueIndex: number;
    cue: CueDto;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);
    const currentEditingIdx = useSelector((state: SubtitleEditState) => state.editingCueIndex);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
            Mousetrap.bind([KeyCombination.ENTER], () => props.cueIndex === cuesCount - 1
                ? dispatch(createAndAddCue(props.cue, props.cueIndex + 1))
                : dispatch(updateEditingCueIndex(-1)));
        };
        document.querySelectorAll(`.sbte-cue-line:nth-child(${currentEditingIdx})`)[0]?.scrollIntoView();
        registerShortcuts();
    }, [dispatch, props, cuesCount]);
    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary sbte-add-cue-button"
            onClick={(): AppThunk => dispatch(createAndAddCue(props.cue, props.cueIndex + 1))}
        >
            <b>+</b>
        </button>
    );
};

export default AddCueLineButton;
