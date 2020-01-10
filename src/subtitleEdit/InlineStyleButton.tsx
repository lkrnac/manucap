import React, {ReactElement} from "react";
import {useDispatch, useSelector} from "react-redux";
import {EditorState, RichUtils} from "draft-js";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";
import {updateEditorState} from "./editorStatesSlice";

interface Props{
    editorIndex: number;
    inlineStyle: string;
    label: ReactElement;
}

const InlineStyleButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editorState = useSelector((state: SubtitleEditState) =>
        state.editorStates.get(props.editorIndex)) as EditorState;
    const buttonStyle = editorState && editorState.getCurrentInlineStyle().has(props.inlineStyle)
        ? "btn btn-secondary"
        : "btn btn-outline-secondary";

    return (
        <button
            style={{ marginRight: "5px"}}
            className={buttonStyle}
            onClick={(): void => {
                const newState = RichUtils.toggleInlineStyle(editorState, props.inlineStyle);
                dispatch(updateEditorState(props.editorIndex, newState));
            }}
        >
            {props.label}
        </button>
    );
};

export default InlineStyleButton;