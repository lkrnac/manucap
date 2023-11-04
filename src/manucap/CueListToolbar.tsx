import { ReactElement } from "react";
import CompleteButton from "./CompleteButton";
import { Tooltip } from "primereact/tooltip";
import { useDispatch } from "react-redux";
import { changeScrollPosition } from "./cues/cuesList/cuesListScrollSlice";
import { TrackCues, ScrollPosition, SaveState } from "./model";
import { Track } from "./model";

export interface Props {
    onViewTrackHistory: () => void;
    editingTrack: Track | null;
    onComplete: (completeAction: TrackCues) => void;
    editDisabled?: boolean;
    saveState: SaveState;
}

const CueListToolbar = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <div className="space-x-2 flex items-center mt-1.5">
            <button
                className="mc-btn mc-btn-primary mc-view-all-tracks-mc-btn"
                type="button"
                onClick={(): void => props.onViewTrackHistory()}
            >
                View Track History
            </button>
            <button
                id="jumpToFirstButton"
                className="mc-btn mc-btn-light mc-jump-to-first-button"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.FIRST));
            }}
                data-pr-tooltip="Scroll to top"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-angle-double-up" />
            </button>
            <Tooltip
                id="jumpToFirstButtonTooltip"
                target="#jumpToFirstButton"
            />
            <button
                id="jumpToLastButton"
                className="mc-btn mc-btn-light mc-jump-to-last-button"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.LAST));
            }}
                data-pr-tooltip="Scroll to bottom"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-angle-double-down" />
            </button>
            <Tooltip
                id="jumpToLastButtonTooltip"
                target="#jumpToLastButton"
            />
            <button
                id="editCueButton"
                data-testid="mc-jump-to-edit-cue-button"
                className="mc-btn mc-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.CURRENT));
            }}
                data-pr-tooltip="Scroll to currently editing caption"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-edit" />
            </button>
            <Tooltip
                id="editCueButtonTooltip"
                target="#editCueButton"
            />
            <button
                id="playbackCueButton"
                data-testid="mc-jump-to-playback-cue-button"
                className="mc-btn mc-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.PLAYBACK));
            }}
                data-pr-tooltip="Scroll to caption in playback position"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-video" />
            </button>
            <Tooltip
                id="playbackCueButtonTooltip"
                target="#playbackCueButton"
            />
            <button
                hidden={props.editingTrack?.type !== "TRANSLATION"}
                id="translatedCueButton"
                data-testid="mc-jump-to-last-translated-cue-button"
                className="mc-btn mc-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.LAST_TRANSLATED));
            }}
                data-pr-tooltip="Scroll to last translated caption"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-language" />
            </button>
            <Tooltip
                id="translatedCueButtonTooltip"
                target="#translatedCueButton"
            />
            <button
                id="cueErrorButton"
                data-testid="mc-jump-error-cue-button"
                className="mc-btn mc-btn-light"
                type="button"
                onClick={(): void => {
                dispatch(changeScrollPosition(ScrollPosition.ERROR));
            }}
                data-pr-tooltip="Scroll to next caption error"
                data-pr-position="top"
                data-pr-at="center top-2"
            >
                <i className="fa-duotone fa-bug" />
            </button>
            <Tooltip
                id="cueErrorButtonTooltip"
                target="#cueErrorButton"
            />
            <span style={{ flexGrow: 2 }} />
            <CompleteButton
                onComplete={props.onComplete}
                disabled={props.editDisabled}
                saveState={props.saveState}
            />
        </div>
    );
};

export default CueListToolbar;
