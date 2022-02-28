import { ReactElement } from "react";
import { AppThunk } from "../../subtitleEditReducers";
import { CueDto } from "../../model";
import { playVideoSection } from "../../player/playbackSlices";
import { useDispatch } from "react-redux";
import Tooltip from "../../common/Tooltip";
import { getShortcutAsText } from "../../utils/shortcutConstants";

interface Props {
    cue: CueDto;
}

const PlayCueButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const shortcutText = getShortcutAsText("k");
    return (
        <Tooltip
            tooltipId="playBtnTooltip"
            message={`Play this subtitle (${shortcutText})`}
            placement="left"
            toggleClassName="tw-p-1.5"
        >
            <button
                style={{ maxHeight: "38px" }}
                className="btn btn-outline-secondary tw-w-full"
                onClick={(): AppThunk =>
                    dispatch(playVideoSection(props.cue.vttCue.startTime, props.cue.vttCue.endTime))}
            >
                <i className="fa fa-play" />
            </button>
        </Tooltip>
    );
};

export default PlayCueButton;
