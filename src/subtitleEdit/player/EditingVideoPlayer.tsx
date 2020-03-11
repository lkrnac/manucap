import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import { changePlayerTime } from "./playbackSlices";

interface Props {
    mp4: string;
    poster: string;
    onTimeChange?: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingCues = useSelector((state: SubtitleEditState) => state.cues);
    const newTime = useSelector((state: SubtitleEditState) => state.changePlayerTime);
    const languageCuesArray = editingTrack ? [{ languageId: editingTrack.language.id, cues: editingCues }] : [];
    const tracks = editingTrack ? [editingTrack] : [];
    return editingTrack
        ? (
            <VideoPlayer
                mp4={props.mp4}
                poster={props.poster}
                tracks={tracks}
                onTimeChange={props.onTimeChange}
                languageCuesArray={languageCuesArray}
                changePlayerTime={newTime}
                resetPlayerTimeChange={(): AppThunk => dispatch(changePlayerTime(-1))}
            />
        )
        : <p>Editing track not available!</p>;
};

export default EditingVideoPlayer;
