import "../styles.scss";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import React, { MutableRefObject, ReactElement, useEffect, useRef, useState } from "react";
import { createAndAddCue, updateEditingCueIndex } from "./cues/cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "./model";
import CueLine from "./cues/CueLine";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { scrollToElement } from "./cues/cueUtils";
import { Toast } from "react-bootstrap";
import { setAutoSaveSuccess } from "./cues/edit/editorStatesSlice";
import { enableMapSet } from "immer";
import AddCueLineButton from "./cues/edit/AddCueLineButton";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();

const autoSaveTimeout = 10000;

export interface SubtitleEditProps {
    mp4: string;
    poster: string;
    onViewAllTracks: () => void;
    onSave: () => void;
    onComplete: () => void;
    autoSaveTimeout?: number;
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);

    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;
    const cuesRef = useRef() as MutableRefObject<HTMLDivElement>;

    const pendingCueChanges = useSelector((state: SubtitleEditState) => state.pendingCueChanges);
    const [showAutoSaveAlert, setShowAutoSaveAlert] = useState(false);

    const autoSaveSuccess = useSelector((state: SubtitleEditState) => state.autoSaveSuccess);

    useEffect(
        () => {
            setShowAutoSaveAlert(autoSaveSuccess);
        }, [ autoSaveSuccess ]
    );

    useEffect(
        () => {
            const autoSaveInterval = setInterval(
                () => {
                    if (pendingCueChanges) {
                        props.onSave();
                    }
                },
                props.autoSaveTimeout || autoSaveTimeout
            );
            return (): void => clearInterval(autoSaveInterval);
        }, [ pendingCueChanges, props ]
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <SubtitleEditHeader />
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
                    {
                        drivingCues.length === 0 ? (
                            <AddCueLineButton
                                text="Start Captioning"
                                cueIndex={-1}
                                cue={{ vttCue: new VTTCue(-3, 0, ""), cueCategory: "DIALOGUE" }}
                            />
                        ) : null
                    }
                    <div
                        ref={cuesRef}
                        style={{ overflowY: "scroll", height: "100%" }}
                        className="sbte-cues-array-container"
                    >
                        {
                            drivingCues.map((cue: CueDto, idx: number): ReactElement => {
                                const sourceCue = sourceCues[idx];
                                const editingCue = cues[idx] === cue ? cue : cues[idx];
                                return (
                                    <CueLine
                                        key={idx}
                                        index={idx}
                                        sourceCue={sourceCue}
                                        cue={editingCue}
                                        playerTime={currentPlayerTime}
                                        lastCue={idx === cues.length - 1}
                                        onClickHandler={(): void => {
                                            const previousCue = cues[cues.length - 1];
                                            idx >= cues.length
                                                ? dispatch(createAndAddCue(previousCue, cues.length, sourceCue))
                                                : dispatch(updateEditingCueIndex(idx));
                                        }}
                                    />);
                            })
                        }
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                            className="btn btn-primary sbte-view-all-tracks-btn"
                            type="button"
                            onClick={(): void => props.onViewAllTracks()}
                        >
                            View All Tracks
                        </button>
                        <button
                            className="btn btn-secondary sbte-jump-to-first-button"
                            type="button"
                            style={{ marginLeft: "10px" }}
                            onClick={(): void => scrollToElement(cuesRef.current.children[0])}
                        >
                            <i className="fa fa-angle-double-up" />
                        </button>
                        <button
                            className="btn btn-secondary sbte-jump-to-last-button"
                            type="button"
                            style={{ marginLeft: "10px" }}
                            onClick={(): void => scrollToElement(cuesRef.current.children[cues.length - 1])}
                        >
                            <i className="fa fa-angle-double-down" />
                        </button>

                        <span style={{ flexGrow: 2 }} />
                        <button
                            className="btn btn-primary sbte-save-subtitle-btn"
                            type="button"
                            onClick={(): void => props.onSave()}
                            style={{ marginRight: "10px" }}
                        >
                            Save
                        </button>
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

            <div style={{ position: "absolute", left: "45%", top: "1%" }}>
                <Toast
                    onClose={(): void => {
                        setShowAutoSaveAlert(false);
                        dispatch(setAutoSaveSuccess(false));
                    }}
                    show={showAutoSaveAlert}
                    delay={2000}
                    autohide
                    className="sbte-alert"
                >
                    <i className="fa fa-thumbs-up" /> Saved
                </Toast>
            </div>
        </div>
    );
};

export default SubtitleEdit;
