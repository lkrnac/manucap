import React, { ReactElement } from "react";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import DeleteCueLineButton from "./edit/DeleteCueLineButton";
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

const CueLine = (props: Props): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const translationCueClassName = props.cue ? "sbte-gray-100-background" : "bg-light";
    return (
        <div onClick={props.onClickHandler} style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
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
            <div
                style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
                className="sbte-gray-100-background sbte-left-border"
            >
                {
                    editingCueIndex === props.index && props.sourceCue === undefined
                        ? <DeleteCueLineButton cueIndex={props.index} />
                        : <div />
                }
                {
                    editingCueIndex === props.index && (props.sourceCue === undefined || props.lastCue)
                        // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                        ? <AddCueLineButton cueIndex={props.index} cue={props.cue} />
                        : <div />

                }
            </div>
        </div>
    );
};

export default CueLine;
