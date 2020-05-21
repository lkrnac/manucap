import React, { ReactElement } from "react";
import { useSelector } from "react-redux";
import { SubtitleEditState } from "./subtitleEditReducers";
import { CueDto, Track } from "./model";

interface CompleteAction {
    editingTrack: Track | null;
    cues: CueDto[];
}

interface Props {
    onComplete: (completeAction: CompleteAction) => void;
}

const CompleteButton = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const cues = useSelector((state: SubtitleEditState) => state.cues);
    return (
        <button
            type="button"
            className="btn btn-primary sbte-complete-subtitle-btn"
            onClick={(): void => props.onComplete({ editingTrack, cues })}
        >
            Complete
        </button>
    );
};

export default CompleteButton;
