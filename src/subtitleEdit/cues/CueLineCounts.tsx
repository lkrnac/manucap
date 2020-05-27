import React, { ReactElement } from "react";
import { EditorState } from "draft-js";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

interface Props {
    cueIndex: number;
    vttCue: VTTCue;
}

export const getCharacterCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.length);
};

export const getWordCountPerLine = (text: string): number[] => {
    const lines = text.match(/[^\r\n]+/g) || [text];
    return lines.map((line: string): number => line.match(/\S+/g)?.length || 0);
};

const getCharacterCount = (text: string): string => {
    const total = text ? text.replace(/(\r\n|\n|\r)/gm, "").length : 0;
    const countPerLine = getCharacterCountPerLine(text);
    return total + (countPerLine.length > 1 ? " (" + countPerLine.toString() + ")" : "");
};

const getWordCount = (text: string): string => {
    const matches = text ? text.match(/\S+/g) : [];
    const total = matches ? matches.length : 0;
    const countPerLine = getWordCountPerLine(text);
    return total + (countPerLine.length > 1 ? " (" + countPerLine.toString() + ")" : "");
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

    return (
        <div className="sbte-small-font" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
            <span>DURATION: <span className="sbte-green-text">{getDuration(props.vttCue)}s</span>, </span>
            <span>CHARACTERS: <span className="sbte-green-text">{getCharacterCount(text)}</span>, </span>
            <span>WORDS: <span className="sbte-green-text">{getWordCount(text)}</span></span>
        </div>
    );
};

export default CueLineCounts;
