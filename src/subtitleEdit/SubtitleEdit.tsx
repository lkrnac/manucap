import "../styles.scss";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import React, { ReactElement, useEffect, useState } from "react";
import { setSaveTrack } from "./cues/cueSlices";
import { useDispatch, useSelector } from "react-redux";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { enableMapSet } from "immer";
import { hasDataLoaded } from "./subtitleEditUtils";
import CuesList from "./cues/CuesList";

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
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);

    // const cuesRef = useRef() as MutableRefObject<HTMLDivElement>;

    useEffect(
        () => {
            dispatch(setSaveTrack(props.onSave));
        }, [ dispatch, props.onSave ]
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
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
                            <Toolbox />
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
                            <CuesList editingTrack={editingTrack} currentPlayerTime={currentPlayerTime} />
                            <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                                <button
                                    className="btn btn-primary sbte-view-all-tracks-btn"
                                    type="button"
                                    onClick={(): void => props.onViewAllTracks()}
                                >
                                    View All Tracks
                                </button>
                                { /*
                                TODO: figure out how to re-enable these buttons
                                <TooltipWrapper
                                    tooltipId="scrollToTopBtnTooltip"
                                    text="Scroll to top"
                                    placement="top"
                                >
                                    <button
                                        className="btn btn-secondary sbte-jump-to-first-button"
                                        type="button"
                                        style={{ marginLeft: "10px" }}
                                        onClick={(): void => scrollToElement(cuesRef.current.children[0])}
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
                                        onClick={(): void => scrollToElement(cuesRef.current.children[cues.length - 1])}
                                    >
                                        <i className="fa fa-angle-double-down" />
                                    </button>
                                </TooltipWrapper>
                                */}
                                <span style={{ flexGrow: 2 }} />
                                <button
                                    className="btn btn-primary sbte-complete-subtitle-btn"
                                    type="button"
                                    onClick={(): void => props.onComplete()}
                                >
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
};

export default SubtitleEdit;
