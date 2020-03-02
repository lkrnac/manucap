import "../styles.scss";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "./model";
import CueLine from "./cues/CueLine";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { createAndAddCue } from "./cues/cueUtils";
import { updateEditingCueIndex } from "./cues/cueSlices";

export interface Props {
    mp4: string;
    poster: string;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);

    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;

    useEffect(
        () => {
            if (cues.length == 0) {
                createAndAddCue(dispatch, { vttCue: new VTTCue(-3, 0, ""), cueCategory: "DIALOGUE" }, 0);
            }
        },
        [ dispatch, cues ]
    );
    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <SubtitleEditHeader />
            <div style={{ display: "flex", alignItems: "flex-start", height: "90%" }}>
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
                            drivingCues.map((cue: CueDto, idx: number): ReactElement => {
                                const sourceCue = sourceCues[idx];
                                const editingCue = cues[idx] === cue ? cue : cues[idx];
                                return (
                                    <CueLine
                                        key={idx}
                                        index={idx}
                                        sourceCue={sourceCue}
                                        cue={editingCue}
                                        playerTime={currentPlayerTime}
                                        lastCue={idx === cues.length - 1}
                                        onClickHandler={(): void => {
                                            idx >= cues.length
                                                ? createAndAddCue(dispatch, cues[cues.length - 1], cues.length)
                                                : dispatch(updateEditingCueIndex(idx));
                                        }}
                                    />
                                );
                            })
                        }
                    </div>
                    <div style={{ marginTop: "10px" }}>
                        <button className="btn btn-primary" style={{ marginTop: "10px", marginBottom: "10px" }}>
                            View All Tracks
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubtitleEdit;
