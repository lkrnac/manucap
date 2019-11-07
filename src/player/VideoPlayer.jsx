import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";
import videojs from "video.js";
import "videojs-watermark";
import "videojs-dotsub-captions";
import "videojs-dotsub-selector";
import Mousetrap from "mousetrap";
// noinspection JSFileReferences

const SECOND = 1000;
const WIDTH = 16;
const HEIGHT = 9;
const VIEWPORT_HEIGHT_PERC = 1;
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25]; //eslint-disable-line no-magic-numbers

const registerPlayerShortcuts = (videoPlayer) => {
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

export default class VideoPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.resizeVideoPlayer = dynVpHeight => this._resizeVideoPlayer(dynVpHeight);
        this.getVideoPlayerEl = () => this._getVideoPlayerEl();
        this.getVideoViewportHeight = () => this._getVideoViewportHeight();

        if (props.viewportHeightPerc) {
            this.viewportHeightPerc = props.viewportHeightPerc;
        } else {
            this.viewportHeightPerc = VIEWPORT_HEIGHT_PERC;
        }
    }

    componentDidMount() {
        const options = {playbackRates: PLAYBACK_RATES};

        const playerEl = this.getVideoPlayerEl();
        playerEl.removeAttribute("data-reactid");

        this._player = videojs(playerEl, options);
        this._player.watermark({
            image: "/images/player-logo.png"
        });

        this._player.dotsubCaptions();

        this._player.on("captionsready", () => {
            this._player.trigger("captions", this.props.captions);
            if (this.props.language) {
                this._player.trigger("language", this.props.language);
            }
        });

        if (this.props.mediaId) {
            // only load selector if a media id is sent.
            this._player.dotsubSelector();
            this._player.on("selectorready", () => {
                this._player.trigger("loadtracks", this.props.mediaId);
            });
        }

        // this line is causing issues in FF (not dev edition)
        this.resizeVideoPlayer();

        window.addEventListener("resize", this.resizeVideoPlayer);
        registerPlayerShortcuts(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const newMp4Src = nextProps.mp4;
        // set the new source if none is set or it's a different value.
        // allowing this to set the same value multiple times causes playback issues in Firefox
        if (!this._player.currentSrc() || (newMp4Src !== undefined && newMp4Src !== this.props.mp4)) {
            this._player.src([
                { src: newMp4Src, type: "video/mp4" }
            ]);
            this._player.poster(nextProps.poster);
        }

        if (!this.props.mediaId) {
            this._player.trigger("captions", nextProps.captions);
        }
    }

    // ESLint rule is suppressed because it is React hook and doesn't need to use this
    shouldComponentUpdate() { // eslint-disable-line class-methods-use-this
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resizeVideoPlayer);
        this._player.dispose();
    }

    getTime() {
        return this._player.currentTime() * SECOND;
    }

    shiftTime(delta) {
        const deltaInSeconds = delta / SECOND;
        this._player.currentTime(this._player.currentTime() + deltaInSeconds);
    }

    moveTime(newTime) {
        this._player.currentTime(newTime / SECOND);
    }

    playPause() {
        if (this._player.paused()) {
            this._player.play();
        } else {
            this._player.pause();
        }
    }

    _getVideoPlayerEl() {
        return ReactDOM.findDOMNode(this.refs.videoPlayer);
    }

    _getVideoViewportHeight() {
        return (Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * this.viewportHeightPerc);
    }

    _resizeVideoPlayer(dynVpHeight) {
        const aspectRatio = WIDTH / HEIGHT;
        const width = this._player.el().parentElement.offsetWidth;
        const height = width / aspectRatio;
        const vpHeight = (typeof dynVpHeight === "number" ? dynVpHeight : this.getVideoViewportHeight());
        if (height < vpHeight) {
            this._player.width(width).height(height);
        } else if (vpHeight !== 0) {
            this._player.width((vpHeight * aspectRatio)).height(vpHeight);
        }
    }

    render() {
        return (
            <video ref="videoPlayer" style={{margin: "auto"}}
                className="video-js vjs-default-skin vjs-big-play-centered" id={this.props.id}
                poster={this.props.poster} controls preload="none" data-setup="{}"
            />
        );
    }
}

VideoPlayer.propTypes = {
    id: PropTypes.string,
    mediaId: PropTypes.string,
    mp4: PropTypes.string,
    poster: PropTypes.string,
    captions: PropTypes.array,
    language: PropTypes.object,
    viewportHeightPerc: PropTypes.number
};

VideoPlayer.defaultProps = {
    captions: []
};

module.exports = VideoPlayer;
