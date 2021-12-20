import "video.js/dist/video-js.css";
import { CueChange, CueDto, LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import Mousetrap from "mousetrap";
import { KeyCombination, triggerMouseTrapAction } from "../utils/shortcutConstants";
import React, { ReactElement, useEffect, useRef } from "react";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import { copyNonConstructorProperties, isSafari } from "../cues/cueUtils";
import { getTimeString } from "../utils/timeUtils";
import { PlayVideoAction } from "./playbackSlices";

const SECOND = 1000;
const ONE_MILLISECOND = 0.001;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];

const customizeLinePosition = (vttCue: VTTCue, trackFontSizePercent?: number): void => {
    if (vttCue.line !== "auto" && trackFontSizePercent) {
        vttCue.line = Math.round(vttCue.line / trackFontSizePercent);
    }
};

export interface Props {
    mp4: string;
    poster: string;
    tracks: Track[];
    onTimeChange?: (time: number) => void;
    languageCuesArray: LanguageCues[];
    playSection?: PlayVideoAction;
    resetPlayerTimeChange?: () => void;
    lastCueChange: CueChange | null;
    trackFontSizePercent?: number;
}

const updateCueAndCopyStyles = (videoJsTrack: TextTrack) => (vttCue: VTTCue, index: number,
                                                             trackFontSizePercent?: number): void => {
    videoJsTrack.addCue(vttCue);
    if (videoJsTrack.cues) {
        const addedCue = videoJsTrack.cues[index] as VTTCue;
        copyNonConstructorProperties(addedCue, vttCue);
        customizeLinePosition(addedCue, trackFontSizePercent);
    }
};

const updateCuesForVideoJsTrack = (props: Props, videoJsTrack: TextTrack, trackFontSizePercent?: number): void => {
    const matchTracks = (track: Track): boolean => track.language.id === videoJsTrack.language;
    const vtmsTrack = props.tracks.filter(matchTracks)[0] as Track;
    props.languageCuesArray
        .filter((languageCues: LanguageCues) => languageCues.languageId === vtmsTrack.language.id)
        .forEach((languageCues: LanguageCues) => {
            languageCues.cues.map((cue: CueDto): VTTCue => cue.vttCue)
                .forEach((cue, index) =>
                    updateCueAndCopyStyles(videoJsTrack)(cue, index, trackFontSizePercent));
        });
};

// const handleCueEditIfNeeded = (lastCueChange: CueChange, vttCue: VTTCue, trackFontSizePercent?: number): void => {
//     if (lastCueChange.changeType === "EDIT" && vttCue) {
//         vttCue.text = lastCueChange.vttCue.text;
//         vttCue.startTime = lastCueChange.vttCue.startTime;
//         vttCue.endTime = lastCueChange.vttCue.endTime;
//         copyNonConstructorProperties(vttCue, lastCueChange.vttCue);
//         customizeLinePosition(vttCue, trackFontSizePercent);
//     }
// };

// const handleCueAddIfNeeded = (lastCueChange: CueChange, videoJsTrack: TextTrack,
//                               trackFontSizePercent?: number): void => {
//     if (lastCueChange.changeType === "ADD" && videoJsTrack.cues) {
//         const cuesTail = [];
//         for (let idx = videoJsTrack.cues.length - 1; idx >= lastCueChange.index; idx--) {
//             cuesTail[idx - lastCueChange.index] = videoJsTrack.cues[idx];
//             videoJsTrack.removeCue(videoJsTrack.cues[idx]);
//         }
//         videoJsTrack.addCue(lastCueChange.vttCue);
//         cuesTail.forEach(cue => videoJsTrack.addCue(cue));
//         customizeLinePosition(videoJsTrack.cues[lastCueChange.index] as VTTCue, trackFontSizePercent);
//     }
// };

const VideoPlayer = (props: Props): ReactElement => {
    let player = {} as VideoJsPlayer; // Keeps Typescript compiler quiet. Feel free to remove if you know how.
    const videoNode = useRef(null as HTMLVideoElement | null);
    let playSegmentPauseTimeout: number;
    let playPromise: Promise<void> | undefined;

    // const getTime = (): number => player.currentTime() * SECOND;

    const shiftTime = (delta: number): void => {
        const deltaInSeconds = delta / SECOND;
        player.currentTime(player.currentTime() + deltaInSeconds);
    };

    const pauseVideo = (): void => {
        if (playPromise !== undefined) {
            playPromise.then(() => {
                player.pause();
            });
        } else {
            player.pause();
        }
    };

    const playPause = (): void => {
        if (player.paused()) {
            playPromise = player.play();
        } else {
            pauseVideo();
        }
    };

    useEffect(() => {
        const textTrackOptions = props.tracks.map(convertToTextTrackOptions);
        const options = {
            playbackRates: PLAYBACK_RATES,
            sources: [{ src: props.mp4, type: "video/mp4" }],
            poster: props.poster,
            tracks: textTrackOptions,
            fluid: true,
            aspectRatio: "16:9",
            userActions: {
                hotkeys: false
            }
        } as VideoJsPlayerOptions;

        if(isSafari()){
            options.html5 = {
                nativeTextTracks: false
            };
        }

        player = videojs(videoNode.current as Element, options) as VideoJsPlayer;
        player.textTracks().addEventListener("addtrack", (event: TrackEvent) => {
            const videoJsTrack = event.track as TextTrack;
            updateCuesForVideoJsTrack(props, videoJsTrack, props.trackFontSizePercent);
        });
        player.on("timeupdate", (): void => {
            if (props.onTimeChange) {
                props.onTimeChange(player.currentTime());
            }
        });

        Mousetrap.bind([KeyCombination.MOD_SHIFT_O, KeyCombination.ALT_SHIFT_O], () => {
            clearTimeout(playSegmentPauseTimeout);
            playPause();
            return false;
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_LEFT, KeyCombination.ALT_SHIFT_LEFT], () => {
            clearTimeout(playSegmentPauseTimeout);
            shiftTime(-SECOND);
            return false;
        });
        Mousetrap.bind([KeyCombination.MOD_SHIFT_RIGHT, KeyCombination.ALT_SHIFT_RIGHT], () => {
            clearTimeout(playSegmentPauseTimeout);
            shiftTime(SECOND);
            return false;
        });

        // @ts-ignore @types/video.js is missing this function rom video.js signature check
        // https://www.npmjs.com/package/@types/video.js for updates
        player.handleKeyDown = (event: React.KeyboardEvent<{}>): void => {
            triggerMouseTrapAction(event);
        };

        videojs.setFormatTime((x: number): string =>
            getTimeString(x, (hours: number): boolean => hours === 0)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // need to run only once on mount

    useEffect(() => {
        const lastCueChange = props.lastCueChange;
        const videoJsTrack = (player.textTracks())[0];
        if (lastCueChange && videoJsTrack && videoJsTrack.cues) {
            // TODO: uncomment
            // handleCueEditIfNeeded(lastCueChange, videoJsTrack.cues[lastCueChange.index] as VTTCue,
            //     prevProps.trackFontSizePercent);
            // handleCueAddIfNeeded(lastCueChange, videoJsTrack, prevProps.trackFontSizePercent);
            if (lastCueChange.changeType === "REMOVE") {
                videoJsTrack.removeCue(videoJsTrack.cues[lastCueChange.index]);
            }
            videoJsTrack.dispatchEvent(new Event("cuechange"));
        }

        if (props.playSection !== undefined
            && props.resetPlayerTimeChange
            && props.playSection.startTime >= 0) {
            // avoid showing 2 captions lines at the same time
            const startTime = props.playSection.startTime + ONE_MILLISECOND;
            const endTime = props.playSection.endTime;
            player.currentTime(startTime);
            playPromise = player.play();
            if (endTime) {
                // for some reason it was stopping around 100ms short
                const waitTime = ((endTime - startTime) * 1000) + 100;
                playSegmentPauseTimeout = window.setTimeout(() => {
                    pauseVideo();
                    // avoid showing 2 captions lines at the same time
                    player.currentTime(endTime - ONE_MILLISECOND);
                }, waitTime);
            }
            props.resetPlayerTimeChange();
        }
    }, [props.lastCueChange, props.playSection]);

    return (
        <video
            id="video-player"
            ref={videoNode}
            style={{ margin: "auto" }}
            className="video-js vjs-default-skin vjs-big-play-centered"
            poster={props.poster}
            controls
            preload="none"
            data-setup="{}"
        />
    );
};

export default VideoPlayer;
