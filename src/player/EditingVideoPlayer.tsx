import React, { ReactElement } from "react";
import { SubtitleEditState } from "../reducers/subtitleEditReducers";
import VideoPlayer from "../player/VideoPlayer";
import { useSelector } from "react-redux";

interface Props {
    mp4: string;
    poster: string;
    onTimeChange: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const tracks = editingTrack ? [editingTrack] : [];
    return editingTrack
        ? <VideoPlayer mp4={props.mp4} poster={props.poster} tracks={tracks} onTimeChange={props.onTimeChange} />
        : <p>Editing track not available!</p>;
};

export default EditingVideoPlayer;
