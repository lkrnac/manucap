import { EditorState, RichUtils } from "draft-js";
import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { updateEditorState } from "./editorStatesSlice";
import { callSaveTrack } from "../cueSlices";

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
            {...props}
            style={{ marginRight: "5px" }}
            className={buttonStyle}
            // Following prevents taking focus from editor, so that we can toggle inline style for current
            // cursor position. If editor would loose focus, inline style toggle is lost.
            onMouseDown={(event: React.MouseEvent<HTMLElement>): void => event.preventDefault()}
            onClick={(): void => {
                const newState = RichUtils.toggleInlineStyle(editorState, props.inlineStyle);
                dispatch(updateEditorState(props.editorIndex, newState));
                dispatch(callSaveTrack());
            }}
        >
            {props.label}
        </button>
    );
};

export default InlineStyleButton;
