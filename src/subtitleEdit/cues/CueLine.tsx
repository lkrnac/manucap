import React, { ReactElement } from "react";
import { CUE_LINE_STATE_CLASSES, CueDtoWithIndex, CueError, CueLineDto, CueLineState } from "../model";
import CueEdit from "./edit/CueEdit";
import CueView from "./view/CueView";
import { SubtitleEditState } from "../subtitleEditReducers";
import { useSelector } from "react-redux";
import CueLineFlap from "./CueLineFlap";
import _ from "lodash";
import InsertCueButton from "./view/InsertCueButton";
import ClickCueWrapper from "./view/ClickCueWrapper";

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

const hasTargetText = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => !_.isEmpty(cueWithIndex?.cue.vttCue.text))
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};

const hasCorruptedTargetCue = (cueLine?: CueLineDto): boolean => {
    if (cueLine && cueLine.targetCues && cueLine.targetCues.length > 0) {
        return cueLine.targetCues
            .map((cueWithIndex: CueDtoWithIndex): boolean => cueWithIndex?.cue.errors
                ? cueWithIndex?.cue.errors?.length > 0
                : false
            )
            .reduce((hasText1: boolean, hasText2: boolean): boolean => hasText1 || hasText2);
    }
    return false;
};

const findCueLineState = (props: CueLineProps): CueLineState => {
    const cueLine = props.rowProps.matchedCues[props.rowIndex];
    const someCueHasText = hasTargetText(cueLine);
    const someCueCorrupted = hasCorruptedTargetCue(cueLine);
    return someCueHasText
        ? someCueCorrupted ? CueLineState.ERROR : CueLineState.GOOD
        : CueLineState.NONE;
};

const hasCuesWithEditDisabled = (cueDtos?: CueDtoWithIndex[]): boolean => {
    if (cueDtos && cueDtos.length > 0) {
        return cueDtos
            .map((cueWithIndex: CueDtoWithIndex): boolean => cueWithIndex?.cue.editDisabled === true)
            .reduce((editDisabled1: boolean, editDisabled2: boolean): boolean => editDisabled1 || editDisabled2);
    }
    return false;
};

const shouldDisableCueLine = (props: CueLineProps): boolean | undefined => {
    const cueLine = props.rowProps.matchedCues[props.rowIndex];
    return hasCuesWithEditDisabled(cueLine.sourceCues) || hasCuesWithEditDisabled(cueLine.targetCues);
};

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

    const cueLineState = findCueLineState(props);
    const dividerClass = CUE_LINE_STATE_CLASSES.get(cueLineState)?.dividerClass;

    const firstTargetCueIndex = props.data.targetCues?.length ? props.data.targetCues[0].index : undefined;
    const sourceCuesIndexes = getCueIndexes(props.data.sourceCues);
    const nextTargetCueIndex = findNextTargetCueIndex(props);
    const cueLineEditDisabled = shouldDisableCueLine(props);

    const showGlossaryTermsAndErrors = props.data.targetCues !== undefined &&
        props.data.targetCues.some(cueWithIndex => cueWithIndex.index === editingCueIndex);

    const cuesErrors = [] as CueError[];
    props.data.targetCues?.forEach((targetCue: CueDtoWithIndex) => {
        if (targetCue.cue.errors && targetCue.cue.errors.length > 0) {
            cuesErrors.push(...targetCue.cue.errors);
        }
    });

    return (
        <div
            ref={props.rowRef}
            style={{ display: "flex", paddingBottom: "5px", width: "100%" }}
        >
            <CueLineFlap
                rowIndex={props.rowIndex}
                cueLineState={cueLineState}
                cuesErrors={cuesErrors}
                showErrors={showGlossaryTermsAndErrors}
                editDisabled={cueLineEditDisabled}
                cues={props.data.targetCues}
            />
            <div
                className={cueLineEditDisabled ? "sbte-edit-disabled" : ""}
                style={{ display: "flex", flexDirection:"column", width: "100%" }}
            >
                {
                    props.data.sourceCues && props.data.sourceCues.length > 0
                        ? props.data.sourceCues.map(sourceCue => {
                            return (
                                <CueView
                                    key={sourceCue.index}
                                    isTargetCue={false}
                                    targetCueIndex={firstTargetCueIndex}
                                    cue={sourceCue.cue}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    playerTime={props.rowProps.playerTime}
                                    className={`${captionClassName} sbte-source-cue`}
                                    showGlossaryTerms={showGlossaryTermsAndErrors}
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
                                <ClickCueWrapper
                                    targetCueIndex={firstTargetCueIndex}
                                    targetCuesLength={props.rowProps.targetCuesLength}
                                    className={translationCueClassName}
                                    sourceCuesIndexes={sourceCuesIndexes}
                                    nextTargetCueIndex={nextTargetCueIndex}
                                >
                                    <div style={{ width: "100%", minHeight: "78px" }} />
                                </ClickCueWrapper>
                            )
                        )
                }
                {
                    (props.data.targetCues?.length && props.data.targetCues?.length > 1)
                    || (props.data.sourceCues?.length && props.data.sourceCues?.length > 1)
                        ? <div className={dividerClass} />
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
                                        isTargetCue
                                        targetCueIndex={targetCue.index}
                                        cue={targetCue.cue}
                                        targetCuesLength={props.rowProps.targetCuesLength}
                                        playerTime={props.rowProps.playerTime}
                                        className={`${captionClassName} sbte-target-cue`}
                                        showGlossaryTerms={false}
                                        languageDirection={editingTrack?.language.direction}
                                        sourceCuesIndexes={sourceCuesIndexes}
                                        nextTargetCueIndex={nextTargetCueIndex}
                                    />
                                );
                        })
                        : (

                            <ClickCueWrapper
                                targetCueIndex={firstTargetCueIndex}
                                targetCuesLength={props.rowProps.targetCuesLength}
                                className={"sbte-gray-200-background"}
                                sourceCuesIndexes={sourceCuesIndexes}
                                nextTargetCueIndex={nextTargetCueIndex}
                            >
                                <InsertCueButton />
                            </ClickCueWrapper>
                        )

                }
            </div>
        </div>
    );
};

export default CueLine;
