import React, { ReactElement } from "react";
import { AppThunk } from "../subtitleEditReducers";
import { CueDto } from "../model";
import { playVideoSection } from "../player/playbackSlices";
import { useDispatch } from "react-redux";

interface Props {
    cue: CueDto;
}

const PlayCueButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <button
            style={{ maxHeight: "38px", margin: "5px" }}
            className="btn btn-outline-secondary"
            onClick={(): AppThunk => dispatch(playVideoSection(props.cue.vttCue.startTime, props.cue.vttCue.endTime))}
        >
            <i className="fa fa-play" />
        </button>
    );
};

export default PlayCueButton;
