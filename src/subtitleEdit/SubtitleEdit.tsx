import React, {ChangeEvent, ReactElement, useEffect} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import {Language, TrackVersion} from "../player/model";
import {useDispatch} from "react-redux";
import {updateEditingTrack, updateCue} from "../player/trackSlices";
import {AppThunk} from "../reducers/subtitleEditReducer";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    useEffect(() => {
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
        }));
    });
    return (
        <div style={{display: "flex", height: "100%"}}>
            <div style={{flex: "1 1 0", padding: "10px"}}>
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
