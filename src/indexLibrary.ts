import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import VideoPlayer from "./subtitleEdit/player/VideoPlayer";
import { updateCues } from "./subtitleEdit/cues/cueSlices";

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

