import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "../model";
import CueEditLine from "./edit/CueEditLine";
import CueViewLine from "./view/CueViewLine";
import { updateEditingCueIndex } from "./cueSlices";

interface Props {
    index: number;
    cue?: CueDto;
    playerTime: number;
    sourceCue?: CueDto;
}

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const translationCueClassName = props.cue ? "sbte-gray-100-background" : "bg-light";
    return (
        <div
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
            onClick={(): AppThunk => dispatch(updateEditingCueIndex(props.index))}
        >
            <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }} >
                {props.index + 1}
            </div>
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.sourceCue
                        ? <CueViewLine
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
                            ? <CueEditLine index={props.index} cue={props.cue} playerTime={props.playerTime} />
                            : <CueViewLine
                                index={props.index}
                                cue={props.cue}
                                playerTime={props.playerTime}
                                className="sbte-gray-100-background"
                              />
                        : <CueViewLine
                            index={props.index}
                            // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                            cue={props.sourceCue}
                            playerTime={props.playerTime}
                            hideText
                            className={translationCueClassName}
                          />

                }
            </div>
        </div>
    );
};

export default CueLine;
