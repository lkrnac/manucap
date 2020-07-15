import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { Track } from "../model";

interface Props {
    mp4: string;
    poster: string;
    onTimeChange?: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack,
        (oldTrack: Track | null, newTrack: Track | null) => {
            return oldTrack?.id === newTrack?.id;
        });
    const lastCueChange = useSelector((state: SubtitleEditState) => state.lastCueChange);

    const reloadCuesFromStore = !lastCueChange || lastCueChange.changeType != "IMPORT";
    /**
     * This expects that EditingVideoPlayer would be rendered with cues initialized in Redux.
     * It is not updated (hence () => true) when cues are updated,
     * because replacing all the cues was not performant.
     * We instead use lastCueUpdate property to change cues in already rendered player.
     */
    const editingCues = useSelector((state: SubtitleEditState) => state.cues,
        () => reloadCuesFromStore);


    const videoSectionToPlay = useSelector((state: SubtitleEditState) => state.videoSectionToPlay);
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
                playSection={videoSectionToPlay}
                lastCueChange={lastCueChange}
                resetPlayerTimeChange={(): AppThunk => dispatch(playVideoSection(-1))}
                trackFontSizePercent={1.25}
            />
        )
        : <p>Editing track not available!</p>;
};

export default EditingVideoPlayer;
