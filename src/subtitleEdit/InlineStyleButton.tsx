import React, {ReactElement} from "react";
import {useDispatch, useSelector} from "react-redux";
import {EditorState, RichUtils} from "draft-js";
import {AppThunk, SubtitleEditState} from "../reducers/subtitleEditReducers";
import {updateEditorState} from "./editorStatesSlice";

interface Props{
    editorIndex: number;
    inlineStyle: string;
    label: ReactElement;
}

const InlineStyleButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editorState = useSelector((state: SubtitleEditState) => state.editorStates.get(props.editorIndex)) as EditorState;
    return (
        <button
            style={{ marginRight: "5px"}}
            className="btn btn-outline-secondary"
            onClick={(): AppThunk => dispatch(updateEditorState(props.editorIndex, RichUtils.toggleInlineStyle(editorState, props.inlineStyle)))}
        >
            {props.label}
        </button>
    );
};

export default InlineStyleButton;