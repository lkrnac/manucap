import React, {
    ReactElement
} from "react";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";
import {Task, Track} from "../player/model";

const getTrackType = (track: Track): string => {
    return track.type === "CAPTION" ? "Caption" : "Translation";
};

const getLanguageDescription = (track: Track): ReactElement => {
    if (track.type === "TRANSLATION") {
        const sourceLanguage = track.sourceTrack ? <b>{track.sourceTrack.language.name}</b> : null;
        return <span>{sourceLanguage} to <b>{track.language.name}</b></span>;
    }
    return <b>{track.language.name}</b>;
};

const getTrackDescription = (task: Task, track: Track): ReactElement => {
    if (!task || !task.type || !track) {
        return <div/>;
    }
    const trackDescriptions = {
        TASK_TRANSLATE: <div>Translation from {getLanguageDescription(track)}</div>,
        TASK_DIRECT_TRANSLATE: <div>Direct Translation {getLanguageDescription(track)}</div>,
        TASK_REVIEW: <div>Review of {getLanguageDescription(track)} {getTrackType(track)}</div>,
        TASK_CAPTION: <div>Caption in: {getLanguageDescription(track)}</div>
    };
    return trackDescriptions[task.type] ? trackDescriptions[task.type] : <div/>;
};

const getDueDate = (task: Task): ReactElement => {
    if (!task || !task.type) {
        return <div/>;
    }
    return <div>Due Date: <b>{task.dueDate}</b></div>;
};

const SubtitleEditHeader = (): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const stateTask = useSelector((state: SubtitleEditState) => state.task);
    const track = editingTrack ? editingTrack : {} as Track;
    const task = stateTask ? stateTask : {} as Task;
    return (
        <header style={{display: "flex", paddingBottom: "10px" }}>
            <div style={{display: "flex", flexFlow: "column"}}>
                <div><b>{track.videoTitle}</b> <i>{task.projectName}</i></div>
                {getTrackDescription(task, track)}
            </div>
            <div style={{flex: "2"}}/>
            <div style={{display: "flex", flexFlow: "column"}}>
                {getDueDate(task)}
            </div>
        </header>
    );
};

export default SubtitleEditHeader;
