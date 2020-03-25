import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import React, { ReactElement, useEffect, useState } from "react";
import { createAndAddCue, updateEditingCueIndex } from "../cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "../../model";
import { KeyCombination } from "../../shortcutConstants";
import Mousetrap from "mousetrap";
import { Constants } from "../../constants";

interface Props {
    cueIndex: number;
    cue: CueDto;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const nextCueIndex = props.cueIndex + 1;
    const [shouldAddCue, setShouldAddCue] = useState(true);

    useEffect(() => {
        const registerShortcuts = (): void => {
            Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
            Mousetrap.bind([KeyCombination.ENTER], () => props.cueIndex === cuesCount - 1
                ? dispatch(createAndAddCue(props.cue, props.cueIndex + 1))
                : dispatch(updateEditingCueIndex(-1)));
        };
        registerShortcuts();
    }, [dispatch, props, cuesCount]);

    useEffect(() => {
        setShouldAddCue(
            nextCueIndex === cues.length
            || (cues[nextCueIndex]?.vttCue?.startTime - props.cue.vttCue.endTime >= Constants.HALF_SECOND)
        );
    }, [nextCueIndex, cues, props.cue]);

    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary sbte-add-cue-button"
            onClick={(): (AppThunk | void) => {
                if (shouldAddCue) {
                    return dispatch(createAndAddCue(props.cue, props.cueIndex + 1));
                }
            }}
        >
            <b>+</b>
        </button>
    );
};

export default AddCueLineButton;
