import React, { ReactElement } from "react";
import { EditorState } from "draft-js";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
}

const getCharacterCount = (text: string): number =>
    text ? text.replace(/(\r\n|\n|\r)/gm, "").length : 0;

const getWordCount = (text: string): number => {
    const matches = text ? text.match(/\S+/g) : [];
    return matches ? matches.length : 0;
};

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
    const cps = (getCharacterCount(text)/getDuration(props.vttCue)).toFixed(1);

    return (
        <div className="sbte-small-font" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
            <span>DURATION: <span className="sbte-green-text">{getDuration(props.vttCue)}s</span>, </span>
            <span>CHARACTERS: <span className="sbte-green-text">{getCharacterCount(text)}</span>, </span>
            <span>WORDS: <span className="sbte-green-text">{getWordCount(text)}</span>, </span>
            <span>CPS: <span className="sbte-green-text">{cps}</span></span>
        </div>
    );
};

export default CueLineCounts;
