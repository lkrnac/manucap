import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import { ReactElement, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import VideoPlayer from "./VideoPlayer";
import { playVideoSection } from "./playbackSlices";
import { clearLastCueChange } from "../cues/edit/cueEditorSlices";
import { waveformVisibleSlice } from "./waveformSlices";

interface Props {
    mp4: string;
    poster: string;
    waveform?: string;
    duration?: number;
    onTimeChange?: (time: number) => void;
}

const EditingVideoPlayer = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);

    /**
     * This expects that EditingVideoPlayer would be rendered with cues initialized in Redux.
     * It uses shallowEqual as the equalityFn because replacing all the cues was not performant.
     */
    const editingCues = useSelector((state: SubtitleEditState) => state.cues, shallowEqual);
    const lastCueChange = useSelector((state: SubtitleEditState) => state.lastCueChange);
    const videoSectionToPlay = useSelector((state: SubtitleEditState) => state.videoSectionToPlay);
    const waveformVisible = useSelector((state: SubtitleEditState) => state.waveformVisible);
    const languageCuesArray = editingTrack ? [{ languageId: editingTrack.language.id, cues: editingCues }] : [];
    const tracks = editingTrack ? [editingTrack] : [];

    useEffect(() => {
        dispatch(clearLastCueChange());
    }, [dispatch, lastCueChange]);

    useEffect(() => {
        if (props.duration && props.duration <= 1800) {
            dispatch(waveformVisibleSlice.actions.setWaveformVisible(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once

    return editingTrack
        ? (
            <VideoPlayer
                mp4={props.mp4}
                poster={props.poster}
                waveform={props.waveform}
                duration={props.duration}
                waveformVisible={waveformVisible}
                cues={editingCues}
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
