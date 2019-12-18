import React, {
    ReactElement
} from "react";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";
import {Track} from "../player/model";

const SubtitleEditHeader = (): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const track = editingTrack ? editingTrack : {description: {}, progress: {}} as Track;
    return (
        <header style={{display: "flex"}}>
            <div style={{display: "flex", flexFlow: "column"}}>
                <div><b>{track.videoTitle}</b> <i>{track.projectName}</i></div>
                <div>{track.description.action} <b>{track.description.subject}</b></div>
            </div>
            <div style={{flex: "2"}}/>
            <div style={{display: "flex", flexFlow: "column"}}>
                <div>Due Date: <b>{track.dueDate}</b></div>
                <div>Completed: {track.progress.unit} <b>[{track.progress.percentage}%]</b></div>
            </div>
        </header>
    );
};

export default SubtitleEditHeader;
