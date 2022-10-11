import "../colors.css";
import "../global.css";

import { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import { AppThunk, SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { enableMapSet } from "immer";
import { hasDataLoaded } from "./utils/subtitleEditUtils";
import CuesList from "./cues/cuesList/CuesList";
import { Tooltip } from "primereact/tooltip";
import { setSaveTrack } from "./cues/saveSlices";
import { resetEditingTrack } from "./trackSlices";
import { changeScrollPosition, setCurrentPlayerTime } from "./cues/cuesList/cuesListScrollSlice";
import { ScrollPosition } from "./model";
import CompleteButton from "./CompleteButton";
import SearchReplaceEditor from "./cues/searchReplace/SearchReplaceEditor";
import { setSpellCheckDomain } from "./spellcheckerSettingsSlice";
import CueErrorAlert from "./cues/CueErrorAlert";
import MergeEditor from "./cues/merge/MergeEditor";

// TODO: enableMapSet is needed to workaround draft-js type issue.
//  https://github.com/DefinitelyTyped/DefinitelyTyped/issues/43426
//  Can be removed once fixed.
enableMapSet();

export interface SubtitleEditProps {
    mp4: string;
    poster: string;
    waveform?: string;
    onViewTrackHistory: () => void;
    onSave: () => void;
    onComplete: () => void;
    onExportFile: () => void;
    onExportSourceFile: () => void;
    onImportFile: () => void;
    spellCheckerDomain?: string;
    commentAuthor?: string;
    editDisabled?: boolean;
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const handleTimeChange = (time: number): AppThunk => dispatch(setCurrentPlayerTime(time));
    const cuesLoadingCounter = useSelector((state: SubtitleEditState) => state.cuesLoadingCounter);

    useEffect(
        () => (): void => { // nested arrow function is needed, because React will call it as callback when unmounted
            dispatch(resetEditingTrack());
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once -> unmount
    );

    useEffect(
        (): void => {
            dispatch(setSaveTrack(props.onSave));
            dispatch(setSpellCheckDomain(props.spellCheckerDomain));
            dispatch(changeScrollPosition(ScrollPosition.FIRST));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%" }}
        >
            <CueErrorAlert />
            {
                !hasDataLoaded(editingTrack, loadingIndicator) ?
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%"
                        }}
                    >
                        <div className="text-center space-y-4">
                            <div className="sbte-spinner-icon" />
                            <p className="font-medium text-blue-light m-0">
                                Hang in there, we&apos;re loading the track...
                            </p>
                        </div>
                    </div>
                    :
                    <div style={{ display: "flex", alignItems: "flex-start", height: "95%" }}>
                        <div
                            style={{
                                flex: "1 1 40%",
                                display: "flex",
                                flexFlow: "column",
                                paddingRight: "10px",
                                zIndex: "20"
                            }}
                        >
                            <div className="video-player-wrapper" key={cuesLoadingCounter}>
                                <EditingVideoPlayer
                                    mp4={props.mp4}
                                    poster={props.poster}
                                    waveform={props.waveform}
                                    mediaLength={editingTrack?.mediaLength}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                            <Toolbox
                                editDisabled={props.editDisabled}
                                handleExportSourceFile={props.onExportSourceFile}
                                handleExportFile={props.onExportFile}
                                handleImportFile={props.onImportFile}
                            />
                        </div>
                        <div
                            style={{
                                flex: "1 1 60%",
                                paddingLeft: "10px"
                            }}
                            className="space-y-2 h-full flex flex-col justify-between"
                        >
                            <div>
                                <SearchReplaceEditor />
                                <MergeEditor />
                                <CuesList
                                    editDisabled={props.editDisabled}
                                    editingTrack={editingTrack}
                                    commentAuthor={props.commentAuthor}
                                />
                            </div>
                            <div className="space-x-2 flex items-center">
                                <button
                                    className="sbte-btn sbte-btn-primary sbte-view-all-tracks-sbte-btn"
                                    type="button"
                                    onClick={(): void => props.onViewTrackHistory()}
                                >
                                    View Track History
                                </button>
                                <button
                                    id="jumpToFirstButton"
                                    className="sbte-btn sbte-btn-light sbte-jump-to-first-button"
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
                                    className="sbte-btn sbte-btn-light sbte-jump-to-last-button"
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
                                    data-testid="sbte-jump-to-edit-cue-button"
                                    className="sbte-btn sbte-btn-light"
                                    type="button"
                                    onClick={(): void => {
                                        dispatch(changeScrollPosition(ScrollPosition.CURRENT));
                                    }}
                                    data-pr-tooltip="Scroll to currently editing subtitle"
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
                                    data-testid="sbte-jump-to-playback-cue-button"
                                    className="sbte-btn sbte-btn-light"
                                    type="button"
                                    onClick={(): void => {
                                        dispatch(changeScrollPosition(ScrollPosition.PLAYBACK));
                                    }}
                                    data-pr-tooltip="Scroll to subtitle in playback position"
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
                                    hidden={editingTrack?.type !== "TRANSLATION"}
                                    id="translatedCueButton"
                                    data-testid="sbte-jump-to-last-translated-cue-button"
                                    className="sbte-btn sbte-btn-light"
                                    type="button"
                                    onClick={(): void => {
                                        dispatch(changeScrollPosition(ScrollPosition.LAST_TRANSLATED));
                                    }}
                                    data-pr-tooltip="Scroll to last translated subtitle"
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
                                    data-testid="sbte-jump-error-cue-button"
                                    className="sbte-btn sbte-btn-light"
                                    type="button"
                                    onClick={(): void => {
                                        dispatch(changeScrollPosition(ScrollPosition.ERROR));
                                    }}
                                    data-pr-tooltip="Scroll to next subtitle error"
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
                                />
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
};

export default SubtitleEdit;
