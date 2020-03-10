import "video.js/dist/video-js.css";
import { CueDto, LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { KeyCombination } from "../shortcutConstants";
import Mousetrap from "mousetrap";
import React from "react";
import { ReactElement } from "react";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import { copyNonConstructorProperties } from "../cues/cueUtils";
import { getTimeString } from "../cues/timeUtils";

const SECOND = 1000;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];
const hideIfTimeUnitIsZero = (timeUnit: number): boolean => timeUnit == 0;

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
    changePlayerTime?: number;
    resetPlayerTimeChange?: () => void;
}

const updateCue = (videoJsTrack: TextTrack) => (vttCue: VTTCue, index: number): void => {
    videoJsTrack.addCue(vttCue);
    const addedCue = videoJsTrack.cues[index] as VTTCue;
    copyNonConstructorProperties(addedCue, vttCue);
};

const updateCuesForVideoJsTrack = (props: Props, videoJsTrack: TextTrack): void => {
    const matchTracks = (track: Track): boolean => track.language.id === videoJsTrack.language;
    const vtmsTrack = props.tracks.filter(matchTracks)[0] as Track;
    props.languageCuesArray
        .filter((languageCues: LanguageCues) => languageCues.languageId === vtmsTrack.language.id)
        .forEach((languageCues: LanguageCues) => {
            languageCues.cues.map((cue: CueDto): VTTCue => cue.vttCue).forEach(updateCue(videoJsTrack));
        });
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

        videojs.setFormatTime((x: number): string =>
            getTimeString(x, hideIfTimeUnitIsZero, hideIfTimeUnitIsZero)
        );

    }

    componentDidUpdate(prevProps: Props): void {
        for (let trackIdx = 0; trackIdx < this.player.textTracks().length; trackIdx++) {
            const videoJsTrack = (this.player.textTracks())[trackIdx];
            for (let cueIdx = videoJsTrack.cues.length - 1; cueIdx >= 0; cueIdx--) {
                videoJsTrack.removeCue(videoJsTrack.cues[cueIdx]);
            }
            updateCuesForVideoJsTrack(this.props, videoJsTrack);
            videoJsTrack.dispatchEvent(new Event("cuechange"));
        }

        if (this.props.changePlayerTime !== undefined
            && this.props.resetPlayerTimeChange
            && this.props.changePlayerTime >= 0
            && prevProps.changePlayerTime !== this.props.changePlayerTime) {
            this.player.currentTime(this.props.changePlayerTime);
            this.player.play();
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
