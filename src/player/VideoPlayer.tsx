import Mousetrap from "mousetrap";
import * as React from "react";
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from "video.js";
import {ReactElement} from "react";
import "../../node_modules/video.js/dist/video-js.css";
import {Track} from "./model";
import {convertToTextTrackOptions} from "./textTrackOptionsConversion";

const SECOND = 1000;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25];

const registerPlayerShortcuts = (videoPlayer: VideoPlayer): void => {
    Mousetrap.bind(["mod+shift+o", "alt+shift+o"], () => {
        videoPlayer.playPause();
        return false;
    });
    Mousetrap.bind(["mod+shift+left", "alt+shift+left"], () => {
        videoPlayer.shiftTime(-SECOND);
        return false;
    });
    Mousetrap.bind(["mod+shift+right", "alt+shift+right"], () => {
        videoPlayer.shiftTime(SECOND);
        return false;
    });
};

export interface Props {
    mp4: string;
    poster: string;
    tracks: Track[];
}

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
        this.player.textTracks().addEventListener("addtrack", (event: Event) => {
            // TODO: Figure out how to test this code
            // @ts-ignore Typescript doesn't know about track field on event
            const videoJsTrack = event.track as TextTrack;
            const vtmsTrack =
                this.props.tracks.filter(track => track.language.id === videoJsTrack.language)[0] as Track;
            if (vtmsTrack.currentVersion) {
                vtmsTrack.currentVersion.cues.forEach(((cue: VTTCue) => videoJsTrack.addCue(cue)));
            }
        });

        registerPlayerShortcuts(this);
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
                style={{margin: "auto"}}
                className="video-js vjs-default-skin vjs-big-play-centered"
                poster={this.props.poster}
                controls={true}
                preload="none"
                data-setup="{}"
            />
        );
    }
}
