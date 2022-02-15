import { EditorState, RichUtils } from "draft-js";
import { ReactElement } from "react";
import * as React from "react";
import { TooltipWrapper } from "../../TooltipWrapper";

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

    return (
        <TooltipWrapper
            text={props.inlineStyle}
            placement="bottom"
            tooltipId={`${props.inlineStyle}${props.editorIndex}`}
        >
            <button
                style={{ marginRight: "5px" }}
                className={buttonStyle}
                // Following prevents taking focus from editor, so that we can toggle inline style for current
                // cursor position. If editor would loose focus, inline style toggle is lost.
                onMouseDown={(event: React.MouseEvent<HTMLElement>): void => event.preventDefault()}
                onClick={(): void => {
                    const newState = RichUtils.toggleInlineStyle(props.editorState, props.inlineStyle);
                    props.setEditorState(newState);
                }}
            >
                {props.label}
            </button>
        </TooltipWrapper>

    );
};

export default InlineStyleButton;
