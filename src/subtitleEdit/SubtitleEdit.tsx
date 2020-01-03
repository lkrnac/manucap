import React, {ReactElement} from "react";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import Toolbox from "../toolbox/Toolbox";
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
        <div className="sbte-subtitle-edit"  style={{display: "flex", flexFlow: "column", padding: "10px"}}>
            <SubtitleEditHeader />
            <div style={{display: "flex", height: "100%"}}>
                <div style={{flex: "1 1 0", display: "flex", flexFlow: "column", paddingRight: "10px"}}>
                    <EditingVideoPlayer mp4={props.mp4} poster={props.poster}/>
                    <Toolbox />
                </div>
                <div style={{flex: "1 1 0", display: "flex", flexDirection: "column", paddingLeft: "10px"}}>
                    {
                        cues.map((cue: VTTCue, idx: number): ReactElement => <CueTextEditor key={idx} index={idx} cue={cue}/>)
                    }
                </div>
            </div>
        </div>
    );
};

export default SubtitleEdit;
