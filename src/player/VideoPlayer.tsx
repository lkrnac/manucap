import * as Mousetrap from "mousetrap";
import * as React from "react";
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from "video.js";
// import "videojs-dotsub-captions";
// import "videojs-dotsub-selector";
import { getParentOffsetWidth } from "../htmlUtils";

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
    id: string;
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
    public readonly player: any;
    private readonly viewportHeightPerc: number;
    private videoNode?: Node;
    private readonly resizeVideoPlayer: () => void;

    constructor(props: Props) {
        super(props);

        this.resizeVideoPlayer = (): void => this._resizeVideoPlayer();
        this.viewportHeightPerc = props.viewportHeightPerc
            ? props.viewportHeightPerc
            : VIEWPORT_HEIGHT_PERC;
    }

    public componentDidMount(): void {
        const options = { playbackRates: PLAYBACK_RATES } as any as VideoJsPlayerOptions;

        // @ts-ignore I couldn't come up with import syntax that would be without problems.
        // I suspect that type definitions for video.js need to be backward compatible, therefore are exporting
        // "videojs" as namespace as well as function.
        this.player = videojs(this.videoNode, options) as DotsubPlayer;
        // this.player.watermark({
        //     image: "/images/player-logo.png"
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

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>): void {
        const newMp4Src = nextProps.mp4;
        // set the new source if none is set or it's a different value.
        // allowing this to set the same value multiple times causes playback issues in Firefox
        if (!this.player.currentSrc() || (newMp4Src !== undefined && newMp4Src !== this.props.mp4)) {
            this.player.src([
                { src: newMp4Src, type: "video/mp4" }
            ]);
            this.player.poster(nextProps.poster);
        }

        // if (!this.props.mediaId) {
        //     this.player.trigger("captions", nextProps.captions);
        // }
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

    public render(): object {
        return (
            <video
                ref={(node: HTMLVideoElement): HTMLVideoElement => this.videoNode = node}
                style={{margin: "auto"}}
                className="video-js vjs-default-skin vjs-big-play-centered"
                id={this.props.id}
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
