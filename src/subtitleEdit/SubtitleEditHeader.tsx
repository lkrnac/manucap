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
        return <span>{sourceLanguage} to <b>{track.language.name}</b></span>
    }
    return <b>{track.language.name}</b>;
};

const getTrackDescription = (task: Task, track: Track): ReactElement => {
    if (!task || !task.type || !track) {
        return <div/>;
    }
    if (task.type === "TASK_TRANSLATE") {
        return <div>Translation from {getLanguageDescription(track)}</div>
    }
    if (task.type === "TASK_DIRECT_TRANSLATE") {
        return <div>Direct Translation {getLanguageDescription(track)}</div>
    }
    if (task.type === "TASK_REVIEW") {
        return <div>Review of {getLanguageDescription(track)} {getTrackType(track)}</div>
    }
    return <div>Caption in: {getLanguageDescription(track)}</div>
};

const getDueDate = (task: Task): ReactElement => {
    if (!task || !task.type) {
        return <div/>;
    }
    return <div>Due Date: <b>{task.dueDate}</b></div>
};

const SubtitleEditHeader = (): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const stateTask = useSelector((state: SubtitleEditState) => state.task);
    const track = editingTrack ? editingTrack : {} as Track;
    const task = stateTask ? stateTask : {} as Task;
    return (
        <header style={{display: "flex"}}>
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
