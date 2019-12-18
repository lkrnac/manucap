import React, {ChangeEvent, ReactElement} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import {useDispatch} from "react-redux";
import {updateCue} from "../player/trackSlices";
import {AppThunk} from "../reducers/subtitleEditReducers";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();
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
