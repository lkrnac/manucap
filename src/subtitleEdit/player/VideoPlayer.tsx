import "video.js/dist/video-js.css";
import * as shortcuts from "../shortcutConstants";
import { CueDto, LanguageCues, Track } from "../model";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import Mousetrap from "mousetrap";
import React from "react";
import { ReactElement } from "react";
import { convertToTextTrackOptions } from "./textTrackOptionsConversion";
import { copyNonConstructorProperties } from "../cues/edit/cueUtils";

const SECOND = 1000;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];

const registerPlayerShortcuts = (videoPlayer: VideoPlayer): void => {
    Mousetrap.bind([shortcuts.MOD_SHIFT_O, shortcuts.ALT_SHIFT_O], () => {
        videoPlayer.playPause();
        return false;
    });
    Mousetrap.bind([shortcuts.MOD_SHIFT_LEFT, shortcuts.ALT_SHIFT_LEFT], () => {
        videoPlayer.shiftTime(-SECOND);
        return false;
    });
    Mousetrap.bind([shortcuts.MOD_SHIFT_RIGHT, shortcuts.ALT_SHIFT_RIGHT], () => {
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
    }

    componentDidUpdate(): void {
        for (let trackIdx = 0; trackIdx < this.player.textTracks().length; trackIdx++) {
            const videoJsTrack = (this.player.textTracks())[trackIdx];
            for (let cueIdx = videoJsTrack.cues.length - 1; cueIdx >= 0; cueIdx--) {
                videoJsTrack.removeCue(videoJsTrack.cues[cueIdx]);
            }
            updateCuesForVideoJsTrack(this.props, videoJsTrack);
            videoJsTrack.dispatchEvent(new Event("cuechange"));
        }
    }

    public getTime(): number {
        return this.player.currentTime() * SECOND;
    }

    public shiftTime(delta: number): void {
        const deltaInSeconds = delta / SECOND;
        this.player.currentTime(this.player.currentTime() + deltaInSeconds);
    }

    public moveTime(newTime: number): void {
        this.player.currentTime(newTime / SECOND);
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
