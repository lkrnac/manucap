import React, {ReactElement, useState} from "react";
import {updateCue} from "../player/trackSlices";
import {useDispatch} from "react-redux";
import {ContentState, Editor, EditorState, convertFromHTML} from "draft-js";

interface Props{
    index: number;
    cue: VTTCue;
}

const CueTextEditor = (props: Props): ReactElement => {
    const processedHTML = convertFromHTML(props.cue.text);
    const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
    const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));
    const dispatch = useDispatch();
    return (
        <Editor
           editorState={editorState}
           onChange={(editorState: EditorState): void => {
               setEditorState(editorState);
               dispatch(updateCue(
                   props.index,
                   new VTTCue(props.cue.startTime, props.cue.endTime, editorState.getCurrentContent().getPlainText())
               ));
           }}
           // spellCheck
           // placeholder="Caption text..."
        />
    )
};

export default CueTextEditor;