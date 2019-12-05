import Mousetrap from "mousetrap";
import * as React from "react";
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from "video.js";
// import "videojs-dotsub-captions";
// import "videojs-dotsub-selector";
import { getParentOffsetWidth } from "../htmlUtils";
import {ReactElement} from "react";
import "../../node_modules/video.js/dist/video-js.css";

const SECOND = 1000;
const WIDTH = 16;
const HEIGHT = 9;
const VIEWPORT_HEIGHT_PERC = 1;
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
    mediaId?: string;
    captions?: object[];
    language?: object;
    viewportHeightPerc?: number;
}

interface DotsubPlayer extends VideoJsPlayer {
    dotsubCaptions(options?: VideoJsPlayerOptions): void;
    dotsubSelector(options?: VideoJsPlayerOptions): void;
}

export default class VideoPlayer extends React.Component<Props> {
    public readonly player: DotsubPlayer;
    private readonly viewportHeightPerc: number;
    private videoNode?: Node;
    private readonly resizeVideoPlayer: () => void;

    constructor(props: Props) {
        super(props);

        this.resizeVideoPlayer = (): void => this._resizeVideoPlayer();
        this.viewportHeightPerc = props.viewportHeightPerc
            ? props.viewportHeightPerc
            : VIEWPORT_HEIGHT_PERC;

        this.player = {} as DotsubPlayer; // Keeps Typescript compiler quiet. Feel free to remove if you know how.
    }

    public componentDidMount(): void {
        const options = {
            playbackRates: PLAYBACK_RATES,
            sources: [{ src: this.props.mp4, type: "video/mp4" }],
            poster: this.props.poster,
            tracks: [{
                kind: "captions",
                srclang: "en",
                mode: "showing",
                default: true,
            }],
            html5: {
                nativeTextTracks: false
            }
        } as VideoJsPlayerOptions;

        // @ts-ignore I couldn't come up with import syntax that would be without problems.
        // I suspect that type definitions for video.js need to be backward compatible, therefore are exporting
        // "videojs" as namespace as well as function.
        this.player = videojs(this.videoNode, options) as DotsubPlayer;

        // this.player.addTextTrack("captions", "English", "en");
        // this.player.textTracks().addEventListener("addtrack", () => {
        //     this.player.textTracks()[0].addCue(new VTTCue(0, 1, ""));
        //     this.player.textTracks()[0].addCue(new VTTCue(1.5, 3, ""));
        // });

        // this.player.dotsubCaptions();
        //
        // this.player.on("captionsready", () => {
        //     this.player.trigger("captions", this.props.captions);
        //     if (this.props.language) {
        //         this.player.trigger("language", this.props.language);
        //     }
        // });

        // if (this.props.mediaId) {
        //     // only load selector if a media id is sent.
        //     this.player.dotsubSelector();
        //     this.player.on("selectorready", () => {
        //         this.player.trigger("loadtracks", this.props.mediaId);
        //     });
        // }

        // this line is causing issues in FF (not dev edition)
        this._resizeVideoPlayer();

        window.addEventListener("resize", this.resizeVideoPlayer);
        registerPlayerShortcuts(this);
    }

    public shouldComponentUpdate(): boolean {
        return false;
    }

    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.resizeVideoPlayer);
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

    private _resizeVideoPlayer(): void {
        const aspectRatio = WIDTH / HEIGHT;
        const width = getParentOffsetWidth(this.player.el());
        const height = width / aspectRatio;
        const vpHeight = (window.innerHeight || 0) * this.viewportHeightPerc;
        if (height < vpHeight) {
            this.player.width(width);
            this.player.height(height);
        } else if (vpHeight !== 0) {
            this.player.width((vpHeight * aspectRatio));
            this.player.height(vpHeight);
        }
    }
}
