import React, { ReactElement } from "react";
import { getCharacterCount, getDuration, getWordCount } from "./edit/cueUtils";
import { EditorState } from "draft-js";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
}

const CueLineCounts = (props: Props): ReactElement => {
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(props.cueIndex)) as EditorState;
    const currentContent = editorState && editorState.getCurrentContent();
    const text = !currentContent || !currentContent.hasText() ? "" : currentContent.getPlainText();

    return (
        <div className="sbte-cue-line-counts" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
            <span>DURATION: <span className="sbte-green-text">{getDuration(props.vttCue)}s</span>, </span>
            <span>CHARACTERS: <span className="sbte-green-text">{getCharacterCount(text)}</span>, </span>
            <span>WORDS: <span className="sbte-green-text">{getWordCount(text)}</span></span>
        </div>
    );
};

export default CueLineCounts;
