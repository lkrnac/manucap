import React, {ChangeEvent, ReactElement, useEffect} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import {Language, TrackVersion} from "../player/model";
import {useDispatch} from "react-redux";
import {updateEditingTrack} from "../player/trackSlices";
import {updateCue} from "../player/cueSlices";
import {AppThunk} from "../reducers/subtitleEditReducer";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    // private videoPlayer: VideoPlayer;
    // private updateLine1 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine1(event);
    // private updateLine2 = (event: ChangeEvent<HTMLInputElement>): void => this._updateLine2(event);

    // constructor(props: Props) {
    //     super(props);
    //
    //     // this.videoPlayer = {} as VideoPlayer;
    // }

    // _updateLine1(event: ChangeEvent<HTMLInputElement>): void {
    //     this.videoPlayer.player.textTracks()[0].cues[0].text = event.target.value;
    //     this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));
    // }
    //
    // _updateLine2(event: ChangeEvent<HTMLInputElement>): void {
    //     this.videoPlayer.player.textTracks()[0].cues[1].text = event.target.value;
    //     this.videoPlayer.player.textTracks()[0].dispatchEvent(new Event("cuechange"));
    // }

    // const tracks = [
    //     {
    //         type: "CAPTION",
    //         language: { id: "en-US" },
    //         default: true,
    //         currentVersion: { cues: [
    //                 new VTTCue(0, 1, "Caption Line 1"),
    //                 new VTTCue(1, 2, "Caption Line 2"),
    //             ]} as TrackVersion
    //     } as Track,
    //     {
    //         type: "TRANSLATION",
    //         language: { id: "es-ES" },
    //         default: false,
    //         currentVersion: { cues: [
    //                 new VTTCue(0, 1, "Translation Line 1"),
    //                 new VTTCue(1, 2, "Translation Line 2"),
    //             ]} as TrackVersion
    //     } as Track
    // ];
    const dispatch = useDispatch();

    useEffect(() => {
        setInterval(
            dispatch(updateEditingTrack({
                type: "CAPTION",
                language: {id: "en-US"} as Language,
                default: true,
                currentVersion: {
                    cues: [
                        new VTTCue(0, 1, "Caption Line 1"),
                        new VTTCue(1, 2, "Caption Line 2"),
                    ]
                } as TrackVersion
            })),
            1000
        );
    });
    return (
        <div style={{display: "flex", height: "100%"}}>
            <div style={{flex: "1 1 0", padding: "10px"}}>
                {/*<VideoPlayer*/}
                {/*    mp4={this.props.mp4}*/}
                {/*    poster={this.props.poster}*/}
                {/*    ref={(node: VideoPlayer): VideoPlayer => this.videoPlayer = node}*/}
                {/*    tracks={tracks}*/}
                {/*/>*/}
                <EditingVideoPlayer mp4={props.mp4} poster={props.poster}/>
            </div>
            <div style={{flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px"}}>
                <input
                    onChange={
                        (event: ChangeEvent<HTMLInputElement>): AppThunk =>
                            dispatch(updateCue(0, new VTTCue(0, 1, event.target.value)))
                    }
                />
                <input
                    inputMode="text"
                    onChange={
                        (event: ChangeEvent<HTMLInputElement>): AppThunk =>
                            dispatch(updateCue(1, new VTTCue(1, 2, event.target.value)))
                    }

                />
            </div>
        </div>
    );
};

export default SubtitleEdit;
