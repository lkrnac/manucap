import "../styles.scss";
import React, { ReactElement, useState } from "react";
import { CueDto } from "./model";
import CueLine from "./cues/CueLine";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { useSelector } from "react-redux";

export interface Props {
    mp4: string;
    poster: string;
    onViewAllTracks: () => void;
    onSave: () => void;
    onComplete: () => void;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);

    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <SubtitleEditHeader />
            <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                    <EditingVideoPlayer mp4={props.mp4} poster={props.poster} onTimeChange={handleTimeChange} />
                    <Toolbox />
                </div>
                <div
                    style={{
                        flex: "1 1 60%",
                        height: "100%",
                        paddingLeft: "10px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ overflowY: "scroll", height: "100%" }}>
                        {
                            cues.map((cue: CueDto, idx: number): ReactElement =>
                                <CueLine key={idx} index={idx} cue={cue} playerTime={currentPlayerTime} />)
                        }
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-primary sbte-view-all-tracks-btn" type="button"
                            onClick={() => props.onViewAllTracks()}
                        >
                            View All Tracks
                        </button>
                        <span style={{flexGrow: 2}} />
                        <button className="btn btn-primary sbte-save-subtitle-btn" type="button"
                            onClick={() => props.onSave()} style={{ marginRight: "10px" }}
                        >
                            Save
                        </button>
                        <button className="btn btn-primary sbte-complete-subtitle-btn" type="button"
                            onClick={() => props.onComplete()}
                        >
                            Complete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubtitleEdit;
