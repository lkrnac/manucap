import React, { ReactElement, Ref } from "react";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

interface Props {
    index: number;
    cue?: CueDto;
    playerTime: number;
    sourceCue?: CueDto;
    lastCue?: boolean;
    onClickHandler: () => void;
}

const CueLineInternal = (props: Props): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const translationCueClassName = props.cue ? "sbte-gray-100-background" : "sbte-gray-200-background";
    return (
        <>
            <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }} >
                {props.index + 1}
            </div>
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.sourceCue
                        ? <CueView
                            index={props.index}
                            cue={props.sourceCue}
                            playerTime={props.playerTime}
                            className="sbte-bottom-border sbte-gray-100-background"
                          />
                        : <div />
                }
                {
                    props.cue
                        ? editingCueIndex === props.index
                            ? <CueEdit
                                index={props.index}
                                cue={props.cue}
                                playerTime={props.playerTime}
                              />
                            : <CueView
                                index={props.index}
                                cue={props.cue}
                                playerTime={props.playerTime}
                                className="sbte-gray-100-background"
                              />
                        : <CueView
                            index={props.index}
                            // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                            cue={props.sourceCue}
                            playerTime={props.playerTime}
                            hideText
                            className={translationCueClassName}
                          />

                }
            </div>
            <CueActionsPanel
                index={props.index}
                editingCueIndex={editingCueIndex}
                cue={props.cue}
                sourceCue={props.sourceCue}
                lastCue={props.lastCue}
            />
        </>
    );
};


// eslint-disable-next-line react/display-name
const CueLine = React.forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
    return (
        <div
            ref={ref}
            onClick={props.onClickHandler}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineInternal {...props} />
        </div>
    );
});

export default CueLine;
