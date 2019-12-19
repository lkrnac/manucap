import React, {ReactElement} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import CueTextEditor from "./CueTextEditor";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    return (
        <div style={{display: "flex", height: "100%"}}>
            <div style={{flex: "1 1 0", padding: "10px"}}>
                <EditingVideoPlayer mp4={props.mp4} poster={props.poster}/>
            </div>
            <div style={{flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px"}}>
                {
                    cues.map((cue: VTTCue, idx: number): ReactElement => <CueTextEditor key={idx} index={idx} cue={cue}/>)
                }
            </div>
        </div>
    );
};

export default SubtitleEdit;
