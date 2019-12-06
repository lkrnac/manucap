import Mousetrap from "mousetrap";
import * as React from "react";
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from "video.js";
import {ReactElement} from "react";
import "../../node_modules/video.js/dist/video-js.css";

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
}

interface DotsubPlayer extends VideoJsPlayer {
    dotsubCaptions(options?: VideoJsPlayerOptions): void;
    dotsubSelector(options?: VideoJsPlayerOptions): void;
}

export default class VideoPlayer extends React.Component<Props> {
    public readonly player: DotsubPlayer;
    private videoNode?: Node;

    constructor(props: Props) {
        super(props);

        this.player = {} as DotsubPlayer; // Keeps Typescript compiler quiet. Feel free to remove if you know how.
    }

    public componentDidMount(): void {
        const options = {
            playbackRates: PLAYBACK_RATES,
            sources: [{ src: this.props.mp4, type: "video/mp4" }],
            poster: this.props.poster,
            // tracks: [{
            //     kind: "captions",
            //     srclang: "en",
            //     mode: "showing",
            //     default: true,
            // }],
            fluid: true,
        } as VideoJsPlayerOptions;

        // @ts-ignore I couldn't come up with import syntax that would be without problems.
        // I suspect that type definitions for video.js need to be backward compatible, therefore are exporting
        // "videojs" as namespace as well as function.
        this.player = videojs(this.videoNode, options) as DotsubPlayer;

        // this.player.textTracks().addEventListener("addtrack", () => {
        //     this.player.textTracks()[0].addCue(new VTTCue(0, 1, ""));
        //     this.player.textTracks()[0].addCue(new VTTCue(1.5, 3, ""));
        // });

        registerPlayerShortcuts(this);
    }

    public componentWillUnmount(): void {
        this.player.dispose();
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
