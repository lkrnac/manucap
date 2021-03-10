import React, { ReactElement } from "react";
import { CueDtoWithIndex, CueLineDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";
import CueLineFlap from "./CueLineFlap";

export interface CueLineRowProps {
    playerTime: number;
    targetCuesLength: number;
    // Following parameter is needed,
    // because empty/undefined props.data.sourceCues might indicate that there is no time match in translation mode
    withoutSourceCues: boolean;
    matchedCues: CueLineDto[];
}

export interface CueLineProps {
    rowIndex: number;
    data: CueLineDto;
    rowProps: CueLineRowProps;
    rowRef: React.RefObject<HTMLDivElement>;
    onClick: (idx: number) => void;
}

const findNextTargetCueIndex = (props: CueLineProps): number => {
    let nextIndex = 0;
    let nextTargetCueIndex = -1;
    let targetCues;
    do {
        targetCues = props.rowProps.matchedCues[props.rowIndex + nextIndex].targetCues;
        nextTargetCueIndex = targetCues && targetCues.length > 0 ? targetCues[0].index : -1;
        nextIndex++;
    } while ((targetCues === undefined || targetCues.length === 0)
    && nextTargetCueIndex === -1
    && props.rowIndex + nextIndex < props.rowProps.matchedCues.length);
    return nextTargetCueIndex;
};

const getCueIndexes = (cues: CueDtoWithIndex[] | undefined): number[] => cues
    ? cues.map(sourceCue => sourceCue.index)
    : [];

const CueLine = (props: CueLineProps): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const captionClassName = "sbte-gray-100-background";
    const translationCueClassName = props.data.targetCues?.length === 0 ? captionClassName : "sbte-gray-200-background";

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
    const sourceCuesIndexes = getCueIndexes(props.data.sourceCues);
    const nextTargetCueIndex = findNextTargetCueIndex(props);

    const showGlossaryTerms = props.data.targetCues !== undefined &&
        props.data.targetCues.some(cueWithIndex => cueWithIndex.index === editingCueIndex);

    return (
        <div
            ref={props.rowRef}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineFlap rowIndex={props.rowIndex} cueLine={props.rowProps.matchedCues[props.rowIndex]} />
            <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                {
                    props.data.sourceCues && props.data.sourceCues.length > 0
                        ? props.data.sourceCues.map(sourceCue => {
                            return (
                                <CueView
                                    key={sourceCue.index}
                                    targetCueIndex={firstTargetCueIndex}
                                    cue={sourceCue.cue}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    playerTime={props.rowProps.playerTime}
                                    className={captionClassName}
                                    showGlossaryTerms={showGlossaryTerms}
                                    languageDirection={editingTrack?.sourceLanguage?.direction}
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
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
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    playerTime={props.rowProps.playerTime}
                                    hideText
                                    className={translationCueClassName}
                                    showGlossaryTerms={false}
                                    languageDirection={editingTrack?.language.direction}
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
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
                                        key={targetCue.index}
                                        index={targetCue.index}
                                        cue={targetCue.cue}
                                        playerTime={props.rowProps.playerTime}
                                        nextCueLine={props.rowProps.matchedCues[props.rowIndex + 1]}
                                    />
                                )
                                : (
                                    <CueView
                                        key={targetCue.index}
                                        targetCueIndex={targetCue.index}
                                        cue={targetCue.cue}
                                        targetCuesLength={props.rowProps.targetCuesLength}
                                        playerTime={props.rowProps.playerTime}
                                        className={captionClassName}
                                        showGlossaryTerms={false}
                                        showActionsPanel
                                        languageDirection={editingTrack?.language.direction}
                                        sourceCuesIndexes={sourceCuesIndexes}
                                        nextTargetCueIndex={nextTargetCueIndex}
                                    />
                                );
                        })
                        : (
                            <CueView
                                // @ts-ignore If cues is empty, sourceCue is passed in (ensured by SubtitleEdit tests)
                                cue={props.data.sourceCues[0].cue}
                                targetCuesLength={props.rowProps.targetCuesLength}
                                playerTime={props.rowProps.playerTime}
                                hideText
                                className={"sbte-gray-200-background"}
                                showGlossaryTerms={false}
                                showActionsPanel
                                languageDirection={editingTrack?.language.direction}
                                sourceCuesIndexes={sourceCuesIndexes}
                                nextTargetCueIndex={nextTargetCueIndex}
                            />
                        )
                }
            </div>
        </div>
    );
};

export default CueLine;
