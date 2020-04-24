import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import React, { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { resetEditingTrack } from "../trackSlices";

interface Props {
    mp4: string;
    poster: string;
    onTimeChange?: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingCues = useSelector((state: SubtitleEditState) => state.cues);
    const videoSectionToPlay = useSelector((state: SubtitleEditState) => state.videoSectionToPlay);
    const languageCuesArray = editingTrack ? [{ languageId: editingTrack.language.id, cues: editingCues }] : [];
    const tracks = editingTrack ? [editingTrack] : [];
    useEffect(
        () => {
            return (): void => { // return means it will be executed during unmount
                dispatch(resetEditingTrack());
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );
    return editingTrack
        ? (
            <VideoPlayer
                mp4={props.mp4}
                poster={props.poster}
                tracks={tracks}
                onTimeChange={props.onTimeChange}
                languageCuesArray={languageCuesArray}
                playSection={videoSectionToPlay}
                resetPlayerTimeChange={(): AppThunk => dispatch(playVideoSection(-1))}
            />
        )
        : <p>Editing track not available!</p>;
};

export default EditingVideoPlayer;
