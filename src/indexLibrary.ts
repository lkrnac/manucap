import { setAutoSaveSuccess, updateCues, updateSourceCues } from "./subtitleEdit/cues/cueSlices";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import VideoPlayer from "./subtitleEdit/player/VideoPlayer";

const Actions = ({
    updateEditingTrack,
    updateTask,
    updateCues,
    updateSourceCues,
    setAutoSaveSuccess
});

export {
    VideoPlayer,
    Reducers,
    SubtitleEdit,
    Actions
};

