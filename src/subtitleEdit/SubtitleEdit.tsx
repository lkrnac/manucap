import React, {ReactElement} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import Toolbox from "./Toolbox";
import CueTextEditor from "./CueTextEditor";
import {useSelector} from "react-redux";
import {SubtitleEditState} from "../reducers/subtitleEditReducers";
import "../styles.scss";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    return (
        <div className="sbte-subtitle-edit"  style={{display: "flex", flexFlow: "column"}}>
            <SubtitleEditHeader />
            <div style={{display: "flex", height: "100%"}}>
                <div style={{flex: "1 1 0", padding: "10px", display: "flex", flexFlow: "column"}}>
                    <EditingVideoPlayer mp4={props.mp4} poster={props.poster}/>
                    <Toolbox />
                </div>
                <div style={{flex: "1 1 0", display: "flex", flexDirection: "column", padding: "10px"}}>
                    {
                        cues.map((cue: VTTCue, idx: number): ReactElement => <CueTextEditor key={idx} index={idx} cue={cue}/>)
                    }
                </div>
            </div>
        </div>
    );
};

export default SubtitleEdit;
