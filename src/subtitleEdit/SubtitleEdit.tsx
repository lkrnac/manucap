import React, {ChangeEvent, ReactElement} from "react";
import VideoPlayer from "../player/VideoPlayer";

export interface Props {
    mp4: string;
    poster: string;
}

// const SubtitleEdit = (props: Props): ReactElement => (
//     <div>
//         <VideoPlayer mp4={props.mp4} poster={props.poster} />
//
//     </div>
// );

// interface State {
//     line1: string;
//     line2: string;
// }
//
// const constructVtt = (state: Readonly<State>): string => {
//     return state.line1.concat("\n").concat(state.line2);
// };

export default class SubtitleEdit extends React.Component<Props> {
    private videoPlayer: VideoPlayer;
    private updateLine1 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine1(event);
    private updateLine2 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine2(event);

    constructor(props: Props) {
        super(props);
        // this.state = { line1: "", line2: "" } as Readonly<State>;

        this.videoPlayer = {} as VideoPlayer;
    }

    _updateLine1(event: ChangeEvent<HTMLInputElement>): void {
        this.videoPlayer.player.textTracks()[0].cues[0].text = event.target.value;
        this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));

        // Attempt to style subtitles: Notice there are two modes of text tracks - NOT WORKING so far.
        // One is handled by VideoJS, other one is native HTML.
        // This github issue might help: https://github.com/videojs/video.js/issues/4852
        const htmlNodes = document.getElementsByClassName("vjs-text-track-cue");
        const htmlNode = htmlNodes[0] as HTMLElement;
        htmlNode.style.setProperty("font", "caption");
    }

    _updateLine2(event: ChangeEvent<HTMLInputElement>): void {
        this.videoPlayer.player.textTracks()[0].cues[1].text = event.target.value;
        this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));
    }

    render(): ReactElement {
        return (
            <div style={{ display: "flex", flexDirection: "row" }}>
                <VideoPlayer
                    mp4={this.props.mp4}
                    poster={this.props.poster}
                    ref={(node: VideoPlayer): VideoPlayer => this.videoPlayer = node}
                />
                <div>
                    <input
                        inputMode="text"
                        onChange={this.updateLine1}
                    />
                    <input
                        inputMode="text"
                        onChange={this.updateLine2}
                    />
                </div>
            </div>
        );
    }
};
