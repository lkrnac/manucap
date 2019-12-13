import React, {ReactElement} from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "../reducers/subtitleEditReducer";
import VideoPlayer from "../player/VideoPlayer";

interface Props {
    mp4: string;
    poster: string;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const tracks = editingTrack ? [editingTrack] : [];
    return editingTrack
        ? <VideoPlayer mp4={props.mp4} poster={props.poster} tracks={tracks} />
        : <label>No Data</label>;
};

export default EditingVideoPlayer;
