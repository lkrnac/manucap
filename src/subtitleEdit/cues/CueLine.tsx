import React, { ReactElement } from "react";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueWithSource } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";

export interface CueLineRowProps {
    playerTime: number;
    cuesLength: number;
    spellCheckerDomain?: string;
    language?: string;
}

interface Props {
    rowIndex: number;
    data: CueWithSource;
    rowProps: CueLineRowProps;
    rowRef: React.RefObject<HTMLDivElement>;
    onClick: (idx: number) => void;
}

const CueLine = (props: Props): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const captionClassName = props.data.cue && (props.data.cue.errors && props.data.cue.errors.length > 0)
        ? "sbte-background-error-darker"
        : "sbte-gray-100-background";
    const translationCueClassName = props.data.cue ? captionClassName : "sbte-gray-200-background";
    const lastCue = props.rowIndex === props.rowProps.cuesLength - 1;

    return (
        <div
            ref={props.rowRef}
            onClick={(): void => props.onClick(props.rowIndex)}
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
                {props.rowIndex + 1}
            </div>
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.data.sourceCue
                        ? <CueView
                            index={props.rowIndex}
                            cue={props.data.sourceCue}
                            playerTime={props.rowProps.playerTime}
                            className={"sbte-bottom-border " + captionClassName}
                          />
                        : <div />
                }
                {
                    props.data.cue
                        ? editingCueIndex === props.rowIndex
                            ? <CueEdit
                                index={props.rowIndex}
                                cue={props.data.cue}
                                playerTime={props.rowProps.playerTime}
                                spellCheckerDomain={props.rowProps.spellCheckerDomain}
                                language={props.rowProps.language}
                              />
                            : <CueView
                                index={props.rowIndex}
                                cue={props.data.cue}
                                playerTime={props.rowProps.playerTime}
                                className={captionClassName}
                              />
                        : <CueView
                            index={props.rowIndex}
                            // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                            cue={props.data.sourceCue}
                            playerTime={props.rowProps.playerTime}
                            hideText
                            className={translationCueClassName}
                          />

                }
            </div>
            <CueActionsPanel
                index={props.rowIndex}
                editingCueIndex={editingCueIndex}
                cue={props.data.cue}
                sourceCue={props.data.sourceCue}
                lastCue={lastCue}
            />
        </div>
    );
};

export default CueLine;
