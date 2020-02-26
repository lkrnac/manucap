import VideoPlayer from "./subtitleEdit/player/VideoPlayer";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { updateCues } from "./subtitleEdit/cues/cueSlices";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";

const Actions = ({
    updateEditingTrack,
    updateTask,
    updateCues
});

export {
    VideoPlayer,
    Reducers,
    SubtitleEdit,
    Actions
};

