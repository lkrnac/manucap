import { CueCategory, CueDto, CueDtoWithIndex, CueLineDto } from "../../model";
import { copyNonConstructorProperties, Position, positionStyles } from "../cueUtils";
import { CSSProperties, Dispatch, ReactElement, useEffect } from "react";
import { addCue, updateCueCategory, updateVttCue } from "../cuesList/cuesListActions";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import CueCategoryButton from "./CueCategoryButton";
import CueTextEditor from "./CueTextEditor";
import { KeyCombination } from "../../utils/shortcutConstants";
import Mousetrap from "mousetrap";
import PositionButton from "./PositionButton";
import TimeEditor from "./TimeEditor";
import { useDispatch, useSelector } from "react-redux";
import { playVideoSection } from "../../player/playbackSlices";
import { updateEditingCueIndex } from "./cueEditorSlices";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import { getTimeString } from "../../utils/timeUtils";
import { TooltipWrapper } from "../../TooltipWrapper";

export interface CueEditProps {
    index: number;
    cue: CueDto;
    nextCueLine?: CueLineDto;
    glossaryTerm?: string;
    setGlossaryTerm: (glossaryTerm?: string) => void;
}

const updateCueAndCopyProperties = (dispatch:  Dispatch<AppThunk>, props: CueEditProps,
                                    startTime: number, endTime: number, editUuid?: string): void => {
    const newCue = new VTTCue(startTime, endTime, props.cue.vttCue.text);
    copyNonConstructorProperties(newCue, props.cue.vttCue);
    dispatch(updateVttCue(props.index, newCue, editUuid));
};

const getCueIndexes = (cues: CueDtoWithIndex[] | undefined): number[] => cues
    ? cues.map(sourceCue => sourceCue.index)
    : [];

const getLockedTimecodeStyle = (): CSSProperties => {
    return {
        border: "1px solid",
        borderRadius: "4px",
        width: "110px",
        textAlign: "center",
        padding: "5px",
        backgroundColor: "rgb(224,224,224)",
        marginTop: "5px",
        cursor: "not-allowed"
    };
};

const CueEdit = (props: CueEditProps): ReactElement => {
    const dispatch = useDispatch();
    const currentPlayerTime = useSelector((state: SubtitleEditState) => state.currentPlayerTime);
    const nextSourceCuesIndexes = props.nextCueLine
        ? getCueIndexes(props.nextCueLine.sourceCues)
        : [];

    const cuesCount = useSelector((state: SubtitleEditState) => state.cues.length);

    const unbindCueViewModeKeyboardShortcut =(): void => {
        Mousetrap.unbind([KeyCombination.ESCAPE, KeyCombination.ENTER]);
    };

    const bindCueViewModeKeyboardShortcut =(): void => {
        Mousetrap.bind([KeyCombination.ESCAPE], () => dispatch(updateEditingCueIndex(-1)));
        Mousetrap.bind([KeyCombination.ENTER], () => {
            return props.index === cuesCount - 1
                || !props.nextCueLine
                || !props.nextCueLine.targetCues
                || props.nextCueLine.targetCues.length === 0
                || props.nextCueLine.targetCues[0].cue.editDisabled
                    ? dispatch(addCue(props.index + 1, nextSourceCuesIndexes))
                    : dispatch(updateEditingCueIndex(props.index + 1));
        });
    };

    useEffect(() => {
        bindCueViewModeKeyboardShortcut();
        Mousetrap.bind([KeyCombination.MOD_SHIFT_ESCAPE, KeyCombination.ALT_SHIFT_ESCAPE],
            () => dispatch(updateEditingCueIndex(props.index - 1))
        );

        // no need for dependencies here since binding kb shortcuts should be done once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        Mousetrap.bind([KeyCombination.MOD_SHIFT_UP, KeyCombination.ALT_SHIFT_UP], () => {
            const endTime = props.index === (cuesCount - 1)
                ? currentPlayerTime + 3
                : props.cue.vttCue.endTime;
            updateCueAndCopyProperties(
                dispatch,
                props,
                currentPlayerTime,
                endTime,
                props.cue.editUuid
            );
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_DOWN, KeyCombination.ALT_SHIFT_DOWN], () => {
            updateCueAndCopyProperties(
                dispatch, props, props.cue.vttCue.startTime, currentPlayerTime, props.cue.editUuid
            );
        });

    }, [ dispatch, props, currentPlayerTime, cuesCount ]);

    useEffect(() => {
        Mousetrap.bind([ KeyCombination.MOD_SHIFT_K, KeyCombination.ALT_SHIFT_K ], () => {
            dispatch(playVideoSection(props.cue.vttCue.startTime, props.cue.vttCue.endTime));
        });
    }, [ dispatch, props.cue.vttCue.startTime, props.cue.vttCue.endTime ]);

    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const isTranslation = editingTrack?.type === "TRANSLATION";
    const timecodesUnlocked = editingTrack?.timecodesUnlocked;

    return (
        <div style={{ display: "flex" }} className={"sbte-bottom-border bg-white"}>
            <div
                style={{
                    flex: "1 1 300px",
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: "10px",
                    paddingTop: "5px",
                    justifyContent: "space-between"
                }}
            >
                <div style={{ display: "flex", flexDirection:"column", paddingBottom: "15px" }}>
                    {
                        isTranslation && !timecodesUnlocked
                        ? (
                            <>
                                <TooltipWrapper
                                    tooltipId="disabledTimecodeTooltip"
                                    text="Timecodes are locked"
                                    placement="right"
                                >
                                    <div style={getLockedTimecodeStyle()}>
                                        {getTimeString(props.cue.vttCue.startTime)}
                                    </div>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    tooltipId="disabledTimecodeTooltip"
                                    text="Timecodes are locked"
                                    placement="right"
                                >
                                    <div style={getLockedTimecodeStyle()}>
                                        {getTimeString(props.cue.vttCue.endTime)}
                                    </div>
                                </TooltipWrapper>
                            </>
                        )
                        : (
                            <>
                                <TimeEditor
                                    time={props.cue.vttCue.startTime}
                                    onChange={(startTime: number): void =>
                                        updateCueAndCopyProperties(
                                            dispatch, props, startTime, props.cue.vttCue.endTime, props.cue.editUuid
                                        )}
                                />
                                <TimeEditor
                                    time={props.cue.vttCue.endTime}
                                    onChange={(endTime: number): void =>
                                        updateCueAndCopyProperties(
                                            dispatch, props, props.cue.vttCue.startTime, endTime, props.cue.editUuid
                                        )}
                                />
                            </>
                        )
                    }
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <CueCategoryButton
                        onChange={(cueCategory: CueCategory): AppThunk =>
                            dispatch(updateCueCategory(props.index, cueCategory))}
                        category={props.cue.cueCategory}
                    />
                    <PositionButton
                        vttCue={props.cue.vttCue}
                        changePosition={(position: Position): void => {
                            const newCue =
                                new VTTCue(props.cue.vttCue.startTime, props.cue.vttCue.endTime, props.cue.vttCue.text);
                            copyNonConstructorProperties(newCue, props.cue.vttCue);
                            const newPositionProperties = positionStyles.get(position);
                            for (const property in newPositionProperties) {
                                // noinspection JSUnfilteredForInLoop
                                newCue[property] = newPositionProperties[property];
                            }
                            dispatch(updateVttCue(props.index, newCue, props.cue.editUuid));
                        }}
                    />
                </div>
            </div>
            <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                <CueTextEditor
                    key={props.index}
                    index={props.index}
                    vttCue={props.cue.vttCue}
                    editUuid={props.cue.editUuid}
                    spellCheck={props.cue.spellCheck}
                    searchReplaceMatches={props.cue.searchReplaceMatches}
                    bindCueViewModeKeyboardShortcut={bindCueViewModeKeyboardShortcut}
                    unbindCueViewModeKeyboardShortcut={unbindCueViewModeKeyboardShortcut}
                    glossaryTerm={props.glossaryTerm}
                    setGlossaryTerm={props.setGlossaryTerm}
                />
            </div>
            <CueActionsPanel
                index={props.index}
                cue={props.cue}
                isEdit
                sourceCueIndexes={nextSourceCuesIndexes}
            />
        </div>
    );
};

export default CueEdit;
