import React, {ReactElement} from "react";
import {updateCue} from "../player/trackSlices";
import {connect} from "react-redux";
import {ContentState, Editor, EditorState, convertFromHTML, RichUtils} from "draft-js";
import {stateToHTML} from "draft-js-export-html";

import {Dispatch, bindActionCreators, AnyAction} from "redux";

interface Props{
    index: number;
    cue: VTTCue;
    updateCue: (idx: number, cue: VTTCue) => void;
}

interface State {
    editorState: EditorState;
}

const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: {element: "b"},
        ITALIC: {element: "i"},
    }
};

class CueTextEditor extends React.Component<Props, State> {
    private onChange: (editorState: EditorState) => void;

    constructor(props: Props) {
        super(props);
        const processedHTML = convertFromHTML(props.cue.text);
        const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
        this.state = { editorState: EditorState.createWithContent(contentState) };
        this.onChange = (editorState: EditorState): void => {
            this.setState({ editorState });
        }
    }

    componentDidUpdate(_prevProps: Readonly<Props>, prevState: Readonly<State>): void {
        if (prevState.editorState !== this.state.editorState) {
            const text = stateToHTML(this.state.editorState.getCurrentContent(), convertToHtmlOptions);
            console.log(text);
            this.props.updateCue(
                this.props.index,
                new VTTCue(this.props.cue.startTime, this.props.cue.endTime, text)
            );
        }
    }

    render(): ReactElement {
        return (
            <div>
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    spellCheck
                />
                {/*<button*/}
                {/*    onClick={(): void => {*/}
                {/*        setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));*/}
                {/*        // const text = stateToHTML(editorState.getCurrentContent());*/}
                {/*        // dispatch(updateCue(*/}
                {/*        //     props.index,*/}
                {/*        //     new VTTCue(props.cue.startTime, props.cue.endTime, text)*/}
                {/*        // ));*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <b>B</b>*/}
                {/*</button>*/}
                {/*<button*/}
                {/*    onClick={(): void => {*/}
                {/*        setEditorState(RichUtils.toggleInlineStyle(editorState, "ITALIC"))*/}
                {/*        // const text = stateToHTML(editorState.getCurrentContent());*/}
                {/*        // dispatch(updateCue(*/}
                {/*        //     props.index,*/}
                {/*        //     new VTTCue(props.cue.startTime, props.cue.endTime, text)*/}
                {/*        // ));*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <i>I</i>*/}
                {/*</button>*/}
                <button
                    onClick={(): void => {
                        this.setState({ editorState: RichUtils.toggleInlineStyle(this.state.editorState, "UNDERLINE") });
                    }}
                >
                    <u>U</u>
                </button>
            </div>
        );

    }
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => // : ActionCreatorsMapObject<SubtitleEditAction>
    bindActionCreators(
        {updateCue},
        dispatch
    );

//     ({
//     updateCue: (index: number, cue: VTTCue) => dispatch(updateCue(index, cue))
// });

export default connect(null, mapDispatchToProps)(CueTextEditor);