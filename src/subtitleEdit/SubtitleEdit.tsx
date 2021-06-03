import "../styles.scss";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { enableMapSet } from "immer";
import { hasDataLoaded } from "./subtitleEditUtils";
import CuesList from "./cues/CuesList";
import { TooltipWrapper } from "./TooltipWrapper";
import { setSaveTrack } from "./cues/saveSlices";
import { resetEditingTrack } from "./trackSlices";
import { changeScrollPosition } from "./cues/cuesListScrollSlice";
import { ScrollPosition } from "./model";
import CompleteButton from "./CompleteButton";
import SearchReplaceEditor from "./cues/searchReplace/SearchReplaceEditor";
import { setSpellCheckDomain } from "./spellcheckerSettingsSlice";
import CueErrorAlert from "./cues/CueErrorAlert";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();

export interface SubtitleEditProps {
    mp4: string;
    poster: string;
    onViewAllTracks: () => void;
    onSave: () => void;
    onComplete: () => void;
    onExportFile: () => void;
    onExportSourceFile: () => void;
    onImportFile: () => void;
    spellCheckerDomain?: string;
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);
    const cuesLoadingCounter = useSelector((state: SubtitleEditState) => state.cuesLoadingCounter);

    useEffect(
        () => (): void => { // nested arrow function is needed, because React will call it as callback when unmounted
            dispatch(resetEditingTrack());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    useEffect(
        () => {
            dispatch(setSaveTrack(props.onSave));
        }, [ dispatch, props.onSave ]
    );

    useEffect(
        () => {
            dispatch(setSpellCheckDomain(props.spellCheckerDomain));
        }, [ dispatch, props.spellCheckerDomain ]
    );

    useEffect(
        (): void => {
            dispatch(changeScrollPosition(ScrollPosition.FIRST));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <CueErrorAlert />
            <SubtitleEditHeader />
            {
                !hasDataLoaded(editingTrack, loadingIndicator) ?
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
                        backgroundColor: "white" }}
                    >
                        <div style={{ width: "350px", height: "25px", display: "flex", alignItems: "center" }}>
                            <i className="fas fa-sync fa-spin" style={{ fontSize: "3em", fontWeight: 900 }} />
                            <span style={{ marginLeft: "15px" }}>Hang in there, we&apos;re loading the track...</span>
                        </div>
                    </div>
                    :
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper" key={cuesLoadingCounter}>
                                <EditingVideoPlayer
                                    mp4={props.mp4}
                                    poster={props.poster}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                            <Toolbox
                                handleExportSourceFile={props.onExportSourceFile}
                                handleExportFile={props.onExportFile}
                                handleImportFile={props.onImportFile}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                height: "100%",
                                paddingLeft: "10px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <SearchReplaceEditor />
                            <CuesList editingTrack={editingTrack} currentPlayerTime={currentPlayerTime} />
                            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    className="btn btn-primary sbte-view-all-tracks-btn"
                                    type="button"
                                    onClick={(): void => props.onViewAllTracks()}
                                >
                                    View All Tracks
                                </button>
                                <TooltipWrapper
                                    tooltipId="scrollToTopBtnTooltip"
                                    text="Scroll to top"
                                    placement="top"
                                >
                                    <button
                                        className="btn btn-secondary sbte-jump-to-first-button"
                                        type="button"
                                        style={{ marginLeft: "10px" }}
                                        onClick={(): void => {
                                            dispatch(changeScrollPosition(ScrollPosition.FIRST));
                                        }}
                                    >
                                        <i className="fa fa-angle-double-up" />
                                    </button>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    tooltipId="scrollToBottomTooltip"
                                    text="Scroll to bottom"
                                    placement="top"
                                >
                                    <button
                                        className="btn btn-secondary sbte-jump-to-last-button"
                                        type="button"
                                        style={{ marginLeft: "10px" }}
                                        onClick={(): void => {
                                            dispatch(changeScrollPosition(ScrollPosition.LAST));
                                        }}
                                    >
                                        <i className="fa fa-angle-double-down" />
                                    </button>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    tooltipId="scrollToEditCueToolTip"
                                    text="Jump to edit cue"
                                    placement="top">
                                        <button 
                                            className="btn btn-secondary"
                                            type="button"
                                            style={{ marginLeft: "10px"}}
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.CURRENT))
                                            }}>
                                                <i className="fa fa-edit"/>
                                        </button>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    tooltipId="scrollToPlaybackCueToolTip"
                                    text="Jump to playback position cue"
                                    placement="top">
                                        <button 
                                            className="btn btn-secondary"
                                            type="button"
                                            style={{ marginLeft: "10px"}}
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.CURRENT))
                                            }}>
                                                <i className="fa fa-play"/>
                                        </button>
                                </TooltipWrapper>
                                <TooltipWrapper
                                    tooltipId="scrollToLastTranslatedToolTip"
                                    text="Jump to last translated cue"
                                    placement="top">
                                        <button 
                                            className="btn btn-secondary"
                                            type="button"
                                            style={{ marginLeft: "10px"}}
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.CURRENT))
                                            }}>
                                                <i className="far fa-language"></i>
                                        </button>
                                </TooltipWrapper>
                                <span style={{ flexGrow: 2 }} />
                                <CompleteButton onComplete={props.onComplete} disabled={editingTask?.editDisabled} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
};

export default SubtitleEdit;
