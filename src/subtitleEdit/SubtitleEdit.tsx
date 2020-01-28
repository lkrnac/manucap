import "../styles.scss";
import React, { ReactElement } from "react";
import CueLine from "./CueLine";
import EditingVideoPlayer from "../player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "../reducers/subtitleEditReducers";
import Toolbox from "../toolbox/Toolbox";
import { useSelector } from "react-redux";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <SubtitleEditHeader />
            <div style={{ display: "flex", alignItems: "flex-start", height: "90%" }}>
                <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                    <EditingVideoPlayer mp4={props.mp4} poster={props.poster} />
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
                            cues.map((cue: VTTCue, idx: number): ReactElement =>
                                <CueLine key={idx} index={idx} cue={cue} />)
                        }
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <button className="footer-btn">
                            View All Tracks
                        </button>
                        <button className="footer-btn float-right">
                            Complete
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SubtitleEdit;
