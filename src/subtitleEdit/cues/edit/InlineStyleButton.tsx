import { EditorState, RichUtils } from "draft-js";
import { ReactElement } from "react";
import * as React from "react";
import { Tooltip } from "primereact/tooltip";

interface Props {
    editorIndex: number;
    inlineStyle: string;
    label: ReactElement;
    editorState: EditorState,
    setEditorState: Function
}

const InlineStyleButton = (props: Props): ReactElement => {
    const buttonStyle = props.editorState && props.editorState.getCurrentInlineStyle().has(props.inlineStyle)
        ? "btn btn-secondary"
        : "btn btn-outline-secondary";
    const buttonId = `inlineStyle-${props.inlineStyle}${props.editorIndex}`;
    return (
        <>
            <button
                id={buttonId}
                style={{ marginRight: "5px" }}
                className={buttonStyle}
                // Following prevents taking focus from editor, so that we can toggle inline style for current
                // cursor position. If editor would loose focus, inline style toggle is lost.
                onMouseDown={(event: React.MouseEvent<HTMLElement>): void => event.preventDefault()}
                onClick={(): void => {
                    const newState = RichUtils.toggleInlineStyle(props.editorState, props.inlineStyle);
                    props.setEditorState(newState);
                }}
                data-pr-tooltip={props.inlineStyle}
                data-pr-position="top"
                data-pr-at="center top-4"
            >
                {props.label}
            </button>
            <Tooltip
                id={`${buttonId}-Tooltip`}
                target={`#${buttonId}`}
            />
        </>
    );
};

export default InlineStyleButton;
