import "../styles.scss";
import "../global.css";
import "../../node_modules/@fortawesome/fontawesome-free/css/all.css";
import { ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditingVideoPlayer from "./player/EditingVideoPlayer";
import SubtitleEditHeader from "./SubtitleEditHeader";
import { AppThunk, SubtitleEditState } from "./subtitleEditReducers";
import Toolbox from "./toolbox/Toolbox";
import { enableMapSet } from "immer";
import { hasDataLoaded } from "./utils/subtitleEditUtils";
import CuesList from "./cues/cuesList/CuesList";
import Tooltip from "./common/Tooltip";
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
    duration?: number;
    onViewAllTracks: () => void;
    onSave: () => void;
    onComplete: () => void;
    onExportFile: () => void;
    onExportSourceFile: () => void;
    onImportFile: () => void;
    spellCheckerDomain?: string;
    commentAuthor?: string;
}

const SubtitleEdit = (props: SubtitleEditProps): ReactElement => {
    const dispatch = useDispatch();
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);
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
        () => {
            dispatch(setSaveTrack(props.onSave));
        }, [ dispatch, props.onSave ]
    );

    useEffect(
        () => {
            dispatch(setSpellCheckDomain(props.spellCheckerDomain));
        }, [ dispatch, props.spellCheckerDomain ]
    );

    useEffect(
        (): void => {
            dispatch(changeScrollPosition(ScrollPosition.FIRST));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [] // Run only once
    );

    return (
        <div
            className="sbte-subtitle-edit"
            style={{ display: "flex", flexFlow: "column", padding: "10px", height: "100%", overflow: "hidden" }}
        >
            <CueErrorAlert />
            <SubtitleEditHeader />
            {
                !hasDataLoaded(editingTrack, loadingIndicator) ?
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%",
                        backgroundColor: "white" }}
                    >
                        <div style={{ width: "350px", height: "25px", display: "flex", alignItems: "center" }}>
                            <i className="fas fa-sync fa-spin" style={{ fontSize: "3em", fontWeight: 900 }} />
                            <span style={{ marginLeft: "15px" }}>Hang in there, we&apos;re loading the track...</span>
                        </div>
                    </div>
                    :
                    <div style={{ display: "flex", alignItems: "flex-start", height: "93%" }}>
                        <div style={{ flex: "1 1 40%", display: "flex", flexFlow: "column", paddingRight: "10px" }}>
                            <div className="video-player-wrapper" key={cuesLoadingCounter}>
                                <EditingVideoPlayer
                                    mp4={props.mp4}
                                    poster={props.poster}
                                    waveform={props.waveform}
                                    duration={props.duration}
                                    onTimeChange={handleTimeChange}
                                />
                            </div>
                            <Toolbox
                                handleExportSourceFile={props.onExportSourceFile}
                                handleExportFile={props.onExportFile}
                                handleImportFile={props.onImportFile}
                            />
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
                            <SearchReplaceEditor />
                            <MergeEditor />
                            <CuesList editingTrack={editingTrack} commentAuthor={props.commentAuthor} />
                            <div className="tw-space-x-2 tw-flex tw-items-center">
                                <button
                                    className="btn btn-primary sbte-view-all-tracks-btn"
                                    type="button"
                                    onClick={(): void => props.onViewAllTracks()}
                                >
                                    View All Tracks
                                </button>
                                <div>
                                    <Tooltip
                                        message="Scroll to top"
                                        placement="top"
                                    >
                                        <button
                                            className="btn btn-secondary sbte-jump-to-first-button"
                                            type="button"
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.FIRST));
                                            }}
                                        >
                                            <i className="fa fa-angle-double-up" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip
                                        message="Scroll to bottom"
                                        placement="top"
                                    >
                                        <button
                                            className="btn btn-secondary sbte-jump-to-last-button"
                                            type="button"
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.LAST));
                                            }}
                                        >
                                            <i className="fa fa-angle-double-down" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip
                                        message="Scroll to currently editing subtitle"
                                        placement="top"
                                    >
                                        <button
                                            data-testid="sbte-jump-to-edit-cue-button"
                                            className="btn btn-secondary"
                                            type="button"
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.CURRENT));
                                            }}
                                        >
                                            <i className="fa fa-edit" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip
                                        message="Scroll to subtitle in playback position"
                                        placement="top"
                                    >
                                        <button
                                            data-testid="sbte-jump-to-playback-cue-button"
                                            className="btn btn-secondary"
                                            type="button"
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.PLAYBACK));
                                            }}
                                        >
                                            <i className="fa fa-video" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip
                                        message="Scroll to last translated subtitle"
                                        placement="top"
                                    >
                                        <button
                                            data-testid="sbte-jump-to-last-translated-cue-button"
                                            className="btn btn-secondary"
                                            type="button"
                                            hidden={editingTrack?.type !== "TRANSLATION"}
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.LAST_TRANSLATED));
                                            }}
                                        >
                                            <i className="fa fa-language" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <div>
                                    <Tooltip
                                        message="Scroll to next subtitle error"
                                        placement="top"
                                    >
                                        <button
                                            data-testid="sbte-jump-error-cue-button"
                                            className="btn btn-secondary"
                                            type="button"
                                            onClick={(): void => {
                                                dispatch(changeScrollPosition(ScrollPosition.ERROR));
                                            }}
                                        >
                                            <i className="fa fa-bug" />
                                        </button>
                                    </Tooltip>
                                </div>
                                <span style={{ flexGrow: 2 }} />
                                <CompleteButton onComplete={props.onComplete} disabled={editingTask?.editDisabled} />
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
};

export default SubtitleEdit;
