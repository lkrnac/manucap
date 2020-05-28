import { Task, Track } from "./model";
import React, { ReactElement } from "react";
import { SubtitleEditState } from "./subtitleEditReducers";
import { humanizer } from "humanize-duration";
import { useSelector } from "react-redux";
import { hasDataLoaded } from "./subtitleEditUtils";

const getTrackType = (track: Track): string => {
    return track.type === "CAPTION" ? "Caption" : "Translation";
};

const getLanguageDescription = (track: Track): ReactElement => {
    const languageNameNullSafe = track.language ? track.language.name : "";
    if (track.type === "TRANSLATION") {
        const sourceLanguage = track.sourceLanguage ? <b>{track.sourceLanguage.name}</b> : null;
        return <span>{sourceLanguage} to <b>{languageNameNullSafe}</b></span>;
    }
    return <b>{languageNameNullSafe}</b>;
};

const getTrackLength = (track: Track): ReactElement => {
    if (!track || !track.mediaLength || track.mediaLength <= 0) {
        return <i />;
    }
    return <i>{humanizer({ delimiter: " ", round: true })(track.mediaLength)}</i>;
};

const getTrackDescription = (task: Task, track: Track): ReactElement => {
    if (!task || !task.type || !track) {
        return <div />;
    }
    const trackDescriptions = {
        TASK_TRANSLATE: <div>Translation from {getLanguageDescription(track)} {getTrackLength(track)}</div>,
        TASK_DIRECT_TRANSLATE: <div>Direct Translation {getLanguageDescription(track)} {getTrackLength(track)}</div>,
        TASK_REVIEW: <div>Review of {getLanguageDescription(track)} {getTrackType(track)} {getTrackLength(track)}</div>,
        TASK_CAPTION: <div>Caption in: {getLanguageDescription(track)} {getTrackLength(track)}</div>
    };
    return trackDescriptions[task.type] ? trackDescriptions[task.type] : <div />;
};

const getDueDate = (task: Task): ReactElement => {
    if (!task || !task.type) {
        return <div />;
    }
    return <div>Due Date: <b>{task.dueDate}</b></div>;
};

const getProgress = (track: Track, cuesDataLoaded: boolean | null): ReactElement =>
    cuesDataLoaded ? (<div>Completed: <b>{track.progress}%</b></div>) : <div />;


const SubtitleEditHeader = (): ReactElement => {
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const stateTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const track = editingTrack ? editingTrack : {} as Track;
    const task = stateTask ? stateTask : {} as Task;
    return (
        <header style={{ display: "flex", paddingBottom: "10px" }}>
            <div style={{ display: "flex", flexFlow: "column" }}>
                <div><b>{track.mediaTitle}</b> <i>{task.projectName}</i></div>
                {getTrackDescription(task, track)}
            </div>
            <div style={{ display: "flex", flexFlow: "column" }}>
                {getDueDate(task)}
                {getProgress(track, hasDataLoaded(editingTrack, loadingIndicator))}
            </div>
        </header>
    );
};

export default SubtitleEditHeader;
