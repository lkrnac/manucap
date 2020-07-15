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
import { resetEditingTrack, updateEditingTrack } from "./trackSlices";
import { changeScrollPosition } from "./cues/cuesListScrollSlice";
import { CueDto, Language, ScrollPosition } from "./model";
import CompleteButton from "./CompleteButton";
import { updateCues } from "./cues/cueSlices";

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
    onImportFile: () => void;
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);

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
            <button
                className="btn btn-danger"
                onClick={(): void => {
                    dispatch(updateEditingTrack({
                        type: "TRANSLATION",
                        // type: "CAPTION", // ** Change track type to CAPTION
                        language: { id: "en-US", name: "English (US)" } as Language,
                        default: true,
                        mediaTitle: "This is the video title",
                        mediaLength: 4250,
                        progress: 50,
                        id: ""+Math.random()
                    }));
                    const cues = [] as CueDto[];
                    for(let idx = 0; idx < 3; idx++) {
                        cues.push({
                            vttCue: new VTTCue(idx * 3, (idx + 1) * 3,
                                `<i>XXXXXXX/i> ${idx + 1}`),
                            cueCategory: "DIALOGUE"
                        });
                    }
                    dispatch(updateCues(cues));
                }}
            >
                Change Track x1
            </button>
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
                            <EditingVideoPlayer mp4={props.mp4} poster={props.poster} onTimeChange={handleTimeChange} />
                            <Toolbox handleExportFile={props.onExportFile} handleImportFile={props.onImportFile} />
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
                            <CuesList
                                editingTrack={editingTrack}
                                currentPlayerTime={currentPlayerTime}
                            />
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
                                <span style={{ flexGrow: 2 }} />
                                <CompleteButton onComplete={props.onComplete} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
};

export default SubtitleEdit;
