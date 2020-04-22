import React, { MutableRefObject, ReactElement, useEffect, useRef } from "react";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";
import { scrollToElement } from "./cueUtils";

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
    const captionClassName =  props.cue && props.cue.corrupted
        ? "sbte-background-error-darker"
        : "sbte-gray-100-background";
    const translationCueClassName = props.cue ? captionClassName : "sbte-gray-200-background";

    const ref = useRef() as MutableRefObject<HTMLDivElement>;
    useEffect(
        () => {
            if (editingCueIndex === props.index && props.lastCue) {
                scrollToElement(ref.current);
            }
        },
        [ editingCueIndex, props.index, props.lastCue, ref ]
    );
    return (
        <div
            ref={ref}
            onClick={props.onClickHandler}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <div
                className="sbte-cue-line-flap"
                style={{
                    paddingTop: "10px",
                    width: "30px",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center"
                }}
            >
                {props.index + 1}
            </div>
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.sourceCue
                        ? <CueView
                            index={props.index}
                            cue={props.sourceCue}
                            playerTime={props.playerTime}
                            className={"sbte-bottom-border " + captionClassName}
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
                                className={captionClassName}
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
