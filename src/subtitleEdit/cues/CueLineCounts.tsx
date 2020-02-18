import React, { ReactElement } from "react";
import { getCharacterCount, getWordCount } from "./edit/cueUtils";
import { EditorState } from "draft-js";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
}

const NUM_DECIMAL = 3;

const getDuration = (vttCue: VTTCue): number => {
    const duration = (vttCue.endTime - vttCue.startTime);
    return +duration.toFixed(NUM_DECIMAL);
};

const CueLineCounts = (props: Props): ReactElement => {
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(props.cueIndex)) as EditorState;
    const currentContent = editorState && editorState.getCurrentContent();
    const text = !currentContent || !currentContent.hasText() ? "" : currentContent.getPlainText();

    return (
        <div style={{
            paddingLeft: "5px",
            paddingTop: "5px",
        }}
        >
            <span>Duration: {getDuration(props.vttCue)}s, </span>
            <span>Characters: {getCharacterCount(text)}, </span>
            <span>Words: {getWordCount(text)}</span>
        </div>
    );
};

export default CueLineCounts;
