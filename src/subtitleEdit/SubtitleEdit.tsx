import "../styles.scss";
import React, { ReactElement, RefObject, useEffect, useState } from "react";
import { createAndAddCue, updateEditingCueIndex } from "./cues/cueSlices";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "./model";
import CueLine from "./cues/CueLine";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";

export interface Props {
    mp4: string;
    poster: string;
    onViewAllTracks: () => void;
    onSave: () => void;
    onComplete: () => void;
}

const SubtitleEdit = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const currentEditingIdx = useSelector((state: SubtitleEditState) => state.editingCueIndex);

    const [currentPlayerTime, setCurrentPlayerTime] = useState(0);
    const handleTimeChange = (time: number): void => setCurrentPlayerTime(time);
    const drivingCues = sourceCues.length > 0
        ? sourceCues
        : cues;
    const cuesCollectionRef: RefObject<HTMLDivElement> = React.createRef();

    useEffect(
        () => {
            if (cues.length === 0) {
                dispatch(createAndAddCue({ vttCue: new VTTCue(-3, 0, ""), cueCategory: "DIALOGUE" }, 0));
            }
            cuesCollectionRef.current?.children[currentEditingIdx]?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        },
        [ dispatch, cues, currentEditingIdx, cuesCollectionRef ]
    );
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
                    <div ref={cuesCollectionRef} style={{ overflowY: "scroll", height: "100%" }}>
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
                                            const previousCue = cues[cues.length - 1];
                                            idx >= cues.length
                                                ? dispatch(createAndAddCue(previousCue, cues.length, sourceCue))
                                                : dispatch(updateEditingCueIndex(idx));
                                        }}
                                    />
                                );
                            })

                        }
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", justifyContent: "flex-end" }}>
                        <button
                            className="btn btn-primary sbte-view-all-tracks-btn"
                            type="button"
                            onClick={(): void => props.onViewAllTracks()}
                        >
                            View All Tracks
                        </button>
                        <span style={{ flexGrow: 2 }} />
                        <button
                            className="btn btn-primary sbte-save-subtitle-btn"
                            type="button"
                            onClick={(): void => props.onSave()}
                            style={{ marginRight: "10px" }}
                        >
                            Save
                        </button>
                        <button
                            className="btn btn-primary sbte-complete-subtitle-btn"
                            type="button"
                            onClick={(): void => props.onComplete()}
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
