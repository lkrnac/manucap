import React, { ReactElement } from "react";
// import { CueActionsPanel } from "./CueActionsPanel";
import { CueLineDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";
import CueLineFlap from "./CueLineFlap";

export interface CueLineRowProps {
    playerTime: number;
    cuesLength: number;
    // Following parameter is needed,
    // because empty/undefined props.data.sourceCues might indicate that there is no time match in translation mode
    withoutSourceCues: boolean;
}

export interface CueLineProps {
    rowIndex: number;
    data: CueLineDto;
    rowProps: CueLineRowProps;
    rowRef: React.RefObject<HTMLDivElement>;
    onClick: (idx: number) => void;
}

const CueLine = (props: CueLineProps): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const captionClassName = "sbte-gray-100-background";
    const translationCueClassName = props.data.targetCues?.length === 0 ? captionClassName : "sbte-gray-200-background";
    // const lastCue = props.rowIndex === props.rowProps.cuesLength - 1;

    // TODO: Pass down to cue flap all the target cues -> to claim error if any of them is errornous
    const cue = props.data.targetCues && props.data.targetCues.length > 0
        ? props.data.targetCues[0]
        : undefined;

    const cueHasText = cue && cue.cue.vttCue.text.length;
    const cueIsCorrupted = cueHasText && cue?.cue.corrupted;
    const sbteCueDivider = cueHasText
        ? cueIsCorrupted
            ? "sbte-cue-divider-error"
            : "sbte-cue-divider-good"
        : "sbte-cue-divider";

    const firstTargetCueIndex = props.data.targetCues?.length ? props.data.targetCues[0].index : undefined;
    return (
        <div
            ref={props.rowRef}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineFlap rowIndex={props.rowIndex} cue={cue} />
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.data.sourceCues && props.data.sourceCues.length > 0
                        ? props.data.sourceCues.map(sourceCue => {
                            return (
                                <CueView
                                    key={sourceCue.index}
                                    targetCueIndex={firstTargetCueIndex}
                                    cue={sourceCue.cue}
                                    targetCuesLength={props.rowProps.cuesLength}
                                    playerTime={props.rowProps.playerTime}
                                    className={"sbte-bottom-border " + captionClassName}
                                    showGlossaryTerms={editingCueIndex === sourceCue.index}
                                    languageDirection={editingTrack?.sourceLanguage?.direction}
                                />
                            );
                        })
                        : (
                            props.rowProps.withoutSourceCues
                            ? null
                            : (
                                <CueView
                                    targetCueIndex={firstTargetCueIndex}
                                    // @ts-ignore TODO comment
                                    cue={props.data.targetCues[0].cue}
                                    targetCuesLength={props.rowProps.cuesLength}
                                    playerTime={props.rowProps.playerTime}
                                    hideText
                                    className={"sbte-bottom-border " + translationCueClassName}
                                    showGlossaryTerms={false}
                                    languageDirection={editingTrack?.language.direction}
                                />
                            )
                        )
                }
                {
                    (props.data.targetCues?.length && props.data.targetCues?.length > 1)
                    || (props.data.sourceCues?.length && props.data.sourceCues?.length > 1)
                        ? <div className={sbteCueDivider} />
                        : null
                }
                {
                    props.data.targetCues && props.data.targetCues.length > 0
                        ? props.data.targetCues.map(targetCue => {
                            return editingCueIndex === targetCue.index
                                ? (
                                    <CueEdit
                                        index={targetCue.index}
                                        cue={targetCue.cue}
                                        playerTime={props.rowProps.playerTime}
                                    />
                                )
                                : (
                                    <CueView
                                        targetCueIndex={targetCue.index}
                                        cue={targetCue.cue}
                                        targetCuesLength={props.rowProps.cuesLength}
                                        playerTime={props.rowProps.playerTime}
                                        className={"sbte-bottom-border " + captionClassName}
                                        showGlossaryTerms={false}
                                        languageDirection={editingTrack?.language.direction}
                                    />
                                );
                        })
                        : (
                            <CueView
                                // @ts-ignore If cues is empty, sourceCue is passed in (ensured by SubtitleEdit tests)
                                cue={props.data.sourceCues[0].cue}
                                targetCuesLength={props.rowProps.cuesLength}
                                playerTime={props.rowProps.playerTime}
                                hideText
                                className={"sbte-bottom-border " + translationCueClassName}
                                showGlossaryTerms={false}
                                languageDirection={editingTrack?.language.direction}
                            />
                        )
                }
            </div>
            {/* TODO: Fix cue action panel */}
            {/*<CueActionsPanel*/}
            {/*    index={props.rowIndex}*/}
            {/*    editingCueIndex={editingCueIndex}*/}
            {/*    cue={props.data.cue}*/}
            {/*    sourceCue={props.data.sourceCue}*/}
            {/*    lastCue={lastCue}*/}
            {/*/>*/}
        </div>
    );
};

export default CueLine;
