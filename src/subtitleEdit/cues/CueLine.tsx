import React, { ReactElement } from "react";
import { CueActionsPanel } from "./CueActionsPanel";
import { CueWithSource } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";
import CueLineFlap from "./CueLineFlap";

export interface CueLineRowProps {
    playerTime: number;
    cuesLength: number;
}

interface Props {
    rowIndex: number;
    data: CueWithSource;
    rowProps: CueLineRowProps;
    rowRef: React.RefObject<HTMLDivElement>;
    onClick: (idx: number) => void;
}

const CueLine = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const captionClassName = "sbte-gray-100-background";
    const translationCueClassName = props.data.cue ? captionClassName : "sbte-gray-200-background";
    const lastCue = props.rowIndex === props.rowProps.cuesLength - 1;

    return (
        <div
            ref={props.rowRef}
            onClick={(): void => props.onClick(props.rowIndex)}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineFlap rowIndex={props.rowIndex} cue={props.data.cue} />
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.data.sourceCue
                        ? <CueView
                            index={props.rowIndex}
                            cue={props.data.sourceCue}
                            playerTime={props.rowProps.playerTime}
                            className={"sbte-bottom-border " + captionClassName}
                            showGlossaryTerms={editingCueIndex === props.rowIndex}
                            languageDirection={editingTrack?.sourceLanguage?.direction}
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
                              />
                            : <CueView
                                index={props.rowIndex}
                                cue={props.data.cue}
                                playerTime={props.rowProps.playerTime}
                                className={captionClassName}
                                showGlossaryTerms={false}
                                languageDirection={editingTrack?.language.direction}
                              />
                        : <CueView
                            index={props.rowIndex}
                            // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                            cue={props.data.sourceCue}
                            playerTime={props.rowProps.playerTime}
                            hideText
                            className={translationCueClassName}
                            showGlossaryTerms={false}
                            languageDirection={editingTrack?.language.direction}
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
