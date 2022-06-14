import { Task, Track } from "./model";
import { ReactElement } from "react";
import { SubtitleEditState } from "./subtitleEditReducers";
import { humanizer } from "humanize-duration";
import { useSelector } from "react-redux";
import { hasDataLoaded } from "./utils/subtitleEditUtils";
import { getWordCount } from "./cues/cueUtils";

const REVIEW_LABEL_MAP = new Map([
    ["TASK_REVIEW", ""],
    ["TASK_POST_EDITING", "Post-Editing "],
    ["TASK_PROOF_READING", "Proofreading "],
    ["TASK_SIGN_OFF", "Sign-Off "],
]);

const getTrackType = (track: Track): string => {
    return track.type === "CAPTION" ? "Caption" : "Translation";
};

const getLanguageDescription = (track: Track): ReactElement => {
    const languageNameNullSafe = track.language ? track.language.name : "";
    if (track.type === "TRANSLATION") {
        const sourceLanguage = track.sourceLanguage ? <b>{track.sourceLanguage.name}</b> : null;
        return <span>{sourceLanguage} to <b>{languageNameNullSafe}</b></span>;
    }
    return <b>{languageNameNullSafe}</b>;
};

const getSecondsInHMS = (seconds: number): string =>
    new Date(seconds).toISOString().substr(11, 8);

const getMediaChunkRange = (track: Track): ReactElement | null => {
    if ((track.mediaChunkStart || track.mediaChunkStart === 0) && track.mediaChunkEnd) {
        return (
            <b>
                <span>{" "}(Media Chunk Range{" "}</span>
                <span>{getSecondsInHMS(track.mediaChunkStart)}</span>
                <span> to </span>
                <span>{getSecondsInHMS(track.mediaChunkEnd)})</span>
            </b>
        );
    }
    return null;
};

const getTrackLength = (track: Track, sourceCuesWordCount?: number): ReactElement => {
    if (!track || !track.mediaLength || track.mediaLength <= 0) {
        return <i />;
    }
    return (
        <span>
            <i>
                {humanizer({ delimiter: " ", round: true })(track.mediaLength)}
                {sourceCuesWordCount ? `, ${sourceCuesWordCount} words` : null}
            </i>
            {getMediaChunkRange(track)}
        </span>
    );
};

const getChunkReviewType = (task: Task): string => {
    return task.finalChunkReview ? "Final Chunk " : "";
};

const getReviewHeader = (task: Task, track: Track): ReactElement => (
    <div>
        {getChunkReviewType(task)}{REVIEW_LABEL_MAP.get(task.type)}Review of {getLanguageDescription(track)}{" "}
        {getTrackType(track)} {getTrackLength(track)}
    </div>
);

const getTrackDescription = (task: Task, track: Track, sourceWordCount: number): ReactElement => {
    if (!task || !task.type || !track) {
        return <div />;
    }
    const trackDescriptions = {
        TASK_TRANSLATE: (
            <div>Translation from {getLanguageDescription(track)} {getTrackLength(track, sourceWordCount)}</div>
        ),
        TASK_PIVOT_TRANSLATE:(
            <div>Translation from {getLanguageDescription(track)} {getTrackLength(track, sourceWordCount)}</div>
        ),
        TASK_DIRECT_TRANSLATE: <div>Direct Translation {getLanguageDescription(track)} {getTrackLength(track)}</div>,
        TASK_REVIEW: getReviewHeader(task, track),
        TASK_POST_EDITING: getReviewHeader(task, track),
        TASK_PROOF_READING: getReviewHeader(task, track),
        TASK_SIGN_OFF: getReviewHeader(task, track),
        TASK_CAPTION: <div>Caption in: {getLanguageDescription(track)} {getTrackLength(track)}</div>
    };
    return trackDescriptions[task.type] ? trackDescriptions[task.type] : <div />;
};

const getDueDate = (task: Task): ReactElement => {
    if (!task || !task.type) {
        return <div />;
    }
    return <div>Due Date: <b>{task.dueDate}</b></div>;
};

const getProgress = (track: Track, cuesDataLoaded: boolean | null): ReactElement =>
    cuesDataLoaded ? (<div>Completed: <b>{track.progress}%</b></div>) : <div />;


const SubtitleEditHeader = (): ReactElement => {
    const loadingIndicator = useSelector((state: SubtitleEditState) => state.loadingIndicator);
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const stateTask = useSelector((state: SubtitleEditState) => state.cuesTask);
    const sourceCues = useSelector((state: SubtitleEditState) => state.sourceCues);
    const sourCuesWordCount = sourceCues.map(cue => getWordCount(cue.vttCue.text))
        .reduce((total, count) => total + count, 0);
    const track = editingTrack ? editingTrack : {} as Track;
    const task = stateTask ? stateTask : {} as Task;
    return (
        <header style={{ display: "flex", paddingBottom: "10px" }}>
            <div style={{ display: "flex", flexFlow: "column", flex: 1 }}>
                <div><b>{track.mediaTitle}</b> <i>{task.projectName}</i></div>
                {getTrackDescription(task, track, sourCuesWordCount)}
            </div>
            <div style={{ display: "flex", flexFlow: "column" }}>
                {getDueDate(task)}
                {getProgress(track, hasDataLoaded(editingTrack, loadingIndicator))}
            </div>
        </header>
    );
};

export default SubtitleEditHeader;
