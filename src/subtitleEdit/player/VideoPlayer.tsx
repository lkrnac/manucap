import "video.js/dist/video-js.css";
import { CueChange, CueDto, LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import Mousetrap from "mousetrap";
import { KeyCombination, triggerMouseTrapAction } from "../shortcutConstants";
import React, { ReactElement } from "react";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import { copyNonConstructorProperties } from "../cues/cueUtils";
import { getTimeString } from "../cues/timeUtils";
import { PlayVideoAction } from "./playbackSlices";
const SECOND = 1000;
const ONE_MILLISECOND = 0.001;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];

    const customizeLinePosition = (vttCue: VTTCue, trackFontSizePercent?: number): void => {
    if (vttCue.line !== "auto" && trackFontSizePercent) {
        vttCue.line = vttCue.line / trackFontSizePercent;
    }
};
const registerPlayerShortcuts = (videoPlayer: VideoPlayer): void => {
    Mousetrap.bind([KeyCombination.MOD_SHIFT_O, KeyCombination.ALT_SHIFT_O], () => {
        videoPlayer.playPause();
        return false;
    });
    Mousetrap.bind([KeyCombination.MOD_SHIFT_LEFT, KeyCombination.ALT_SHIFT_LEFT], () => {
        videoPlayer.shiftTime(-SECOND);
        return false;
    });
    Mousetrap.bind([KeyCombination.MOD_SHIFT_RIGHT, KeyCombination.ALT_SHIFT_RIGHT], () => {
        videoPlayer.shiftTime(SECOND);
        return false;
    });
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

const updateCueAndCopyStyles = (videoJsTrack: TextTrack) => (vttCue: VTTCue, index: number): void => {
    videoJsTrack.addCue(vttCue);
    if (videoJsTrack.cues) {
        const addedCue = videoJsTrack.cues[index] as VTTCue;
        copyNonConstructorProperties(addedCue, vttCue);
    }
};

const updateCuesForVideoJsTrack = (props: Props, videoJsTrack: TextTrack): void => {
    const matchTracks = (track: Track): boolean => track.language.id === videoJsTrack.language;
    const vtmsTrack = props.tracks.filter(matchTracks)[0] as Track;
    props.languageCuesArray
        .filter((languageCues: LanguageCues) => languageCues.languageId === vtmsTrack.language.id)
        .forEach((languageCues: LanguageCues) => {
            languageCues.cues.map((cue: CueDto): VTTCue => cue.vttCue).forEach(updateCueAndCopyStyles(videoJsTrack));
        });
};

const handleCueEditIfNeeded = (lastCueChange: CueChange, vttCue: VTTCue, trackFontSizePercent?: number): void => {
    if (lastCueChange.changeType === "EDIT" && vttCue) {
        vttCue.text = lastCueChange.vttCue.text;
        vttCue.startTime = lastCueChange.vttCue.startTime;
        vttCue.endTime = lastCueChange.vttCue.endTime;
        copyNonConstructorProperties(vttCue, lastCueChange.vttCue);
        customizeLinePosition(vttCue, trackFontSizePercent);
    }
};

const handleCueAddIfNeeded = (lastCueChange: CueChange, videoJsTrack: TextTrack,
                              trackFontSizePercent?: number): void => {
    if (lastCueChange.changeType === "ADD" && videoJsTrack.cues) {
        const cuesTail = [];
        for (let idx = videoJsTrack.cues.length - 1; idx >= lastCueChange.index; idx--) {
            cuesTail[idx - lastCueChange.index] = videoJsTrack.cues[idx];
            videoJsTrack.removeCue(videoJsTrack.cues[idx]);
        }
        videoJsTrack.addCue(lastCueChange.vttCue);
        cuesTail.forEach(cue => videoJsTrack.addCue(cue));
        customizeLinePosition(lastCueChange.vttCue, trackFontSizePercent);
    }
};

export default class VideoPlayer extends React.Component<Props> {
    public player: VideoJsPlayer;
    private videoNode?: Node;

    constructor(props: Props) {
        super(props);

        this.player = {} as VideoJsPlayer; // Keeps Typescript compiler quiet. Feel free to remove if you know how.
    }

    public componentDidMount(): void {
        const textTrackOptions = this.props.tracks.map(convertToTextTrackOptions);
        const options = {
            playbackRates: PLAYBACK_RATES,
            sources: [{ src: this.props.mp4, type: "video/mp4" }],
            poster: this.props.poster,
            tracks: textTrackOptions,
            fluid: true,
            userActions: {
                hotkeys: false
            },
            html5: {
                nativeTextTracks: false
            }
        } as VideoJsPlayerOptions;

        this.player = videojs(this.videoNode, options) as VideoJsPlayer;
        this.player.textTracks().addEventListener("addtrack", (event: TrackEvent) => {
            const videoJsTrack = event.track as TextTrack;
            updateCuesForVideoJsTrack(this.props, videoJsTrack);
        });
        this.player.on("timeupdate", (): void => {
            if (this.props.onTimeChange) {
                this.props.onTimeChange(this.player.currentTime());
            }
        });

        registerPlayerShortcuts(this);

        // @ts-ignore @types/video.js is missing this function rom video.js signature check
        // https://www.npmjs.com/package/@types/video.js for updates
        this.player.handleKeyDown = (event: React.KeyboardEvent<{}>): void => {
            triggerMouseTrapAction(event);
        };

        videojs.setFormatTime((x: number): string =>
            getTimeString(x, (hours: number): boolean => hours === 0)
        );

    }

    componentDidUpdate(prevProps: Props): void {
        const lastCueChange = this.props.lastCueChange;
        const videoJsTrack = (this.player.textTracks())[0];
        if (lastCueChange && videoJsTrack && videoJsTrack.cues) {
            handleCueEditIfNeeded(lastCueChange, videoJsTrack.cues[lastCueChange.index] as VTTCue,
                prevProps.trackFontSizePercent);
            handleCueAddIfNeeded(lastCueChange, videoJsTrack,
                prevProps.trackFontSizePercent);
            if (lastCueChange.changeType === "REMOVE") {
                videoJsTrack.removeCue(videoJsTrack.cues[lastCueChange.index]);
            }
            videoJsTrack.dispatchEvent(new Event("cuechange"));
        }

        if (this.props.playSection !== undefined
            && this.props.resetPlayerTimeChange
            && this.props.playSection.startTime >= 0
            && prevProps.playSection !== this.props.playSection) {
            // avoid showing 2 captions lines at the same time
            const startTime = this.props.playSection.startTime + ONE_MILLISECOND;
            const endTime = this.props.playSection.endTime;
            this.player.currentTime(startTime);
            this.player.play();
            if (endTime) {
                // for some reason it was stopping around 100ms short
                const waitTime = ((endTime - startTime) * 1000) + 100;
                setTimeout(() => {
                    this.player.pause();
                    // avoid showing 2 captions lines at the same time
                    this.player.currentTime(endTime - ONE_MILLISECOND);
                }, waitTime);
            }
            this.props.resetPlayerTimeChange();
        }
    }

    public getTime(): number {
        return this.player.currentTime() * SECOND;
    }

    public shiftTime(delta: number): void {
        const deltaInSeconds = delta / SECOND;
        this.player.currentTime(this.player.currentTime() + deltaInSeconds);
    }

    public playPause(): void {
        if (this.player.paused()) {
            this.player.play();
        } else {
            this.player.pause();
        }
    }

    public render(): ReactElement {
        return (
            <video
                id="video-player"
                ref={(node: HTMLVideoElement): HTMLVideoElement => this.videoNode = node}
                style={{ margin: "auto" }}
                className="video-js vjs-default-skin vjs-big-play-centered"
                poster={this.props.poster}
                controls
                preload="none"
                data-setup="{}"
            />
        );
    }
}
