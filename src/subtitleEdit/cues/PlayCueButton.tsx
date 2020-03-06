import React, { ReactElement } from "react";
import { CueDto } from "../model";
import { changePlayerTime } from "../player/playbackSlices";
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
            onClick={(event: React.MouseEvent<HTMLElement>): void => {
                event.stopPropagation();
                dispatch(changePlayerTime(props.cue.vttCue.startTime));
            }}
        >
            <i className="fa fa-play" />
        </button>
    );
};

export default PlayCueButton;
