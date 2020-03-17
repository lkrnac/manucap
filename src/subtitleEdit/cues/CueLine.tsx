import React, { MutableRefObject, ReactElement, useEffect, useRef } from "react";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { scrollToElement } from "./cueUtils";
import { useSelector } from "react-redux";

interface Props {
    index: number;
    cue?: CueDto;
    playerTime: number;
    sourceCue?: CueDto;
    lastCue?: boolean;
    onClickHandler: () => void;
}

const CueLine = (props: Props): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const translationCueClassName = props.cue ? "sbte-gray-100-background" : "sbte-gray-200-background";
    const ref = useRef() as MutableRefObject<HTMLDivElement>;
    useEffect(
        () => {
            if (editingCueIndex === props.index) {
                scrollToElement(ref.current);
            }
        },
        [ editingCueIndex, props.index, ref ]
    );
    return (
        <div
            ref={ref}
            onClick={props.onClickHandler}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <div className="sbte-cue-line-flap" style={{ paddingTop: "10px" }} >
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
        </div>
    );
};

export default CueLine;
