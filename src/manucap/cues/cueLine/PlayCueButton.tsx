import { ReactElement } from "react";
import { AppThunk } from "../../manuCapReducers";
import { CueDto } from "../../model";
import { playVideoSection } from "../../player/playbackSlices";
import { useDispatch } from "react-redux";
import { getShortcutAsText } from "../../utils/shortcutConstants";
import { Tooltip } from "primereact/tooltip";
import { mdiPlay } from "@mdi/js";
import Icon from "@mdi/react";

interface Props {
    cue: CueDto;
    cueIndex: number;
}

const PlayCueButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const shortcutText = getShortcutAsText("k");
    const buttonId = `playCueButton-${props.cueIndex}`;
    return (
        <div className="p-1.5">
            <button
                id={buttonId}
                style={{ maxHeight: "38px" }}
                className="mc-btn mc-btn-primary w-full mc-btn-sm"
                data-pr-tooltip={`Play this caption (${shortcutText})`}
                data-pr-position="left"
                data-pr-at="left center"
                onClick={(): AppThunk =>
                    dispatch(playVideoSection(props.cue.vttCue.startTime, props.cue.vttCue.endTime))}
            >
                <Icon path={mdiPlay} size={1} />
            </button>
            <Tooltip
                id={buttonId + "-Tooltip"}
                target={`#${buttonId}`}
            />
        </div>
    );
};

export default PlayCueButton;
