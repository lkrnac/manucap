import { updateCues } from "./subtitleEdit/cues/cuesList/cuesListActions";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import VideoPlayer from "./subtitleEdit/player/VideoPlayer";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
import { updateSourceCues } from "./subtitleEdit/cues/view/sourceCueSlices";
import { updateSubtitleUser } from "./subtitleEdit/userSlices";

const Actions = ({
    updateEditingTrack,
    updateTask,
    updateCues,
    updateSourceCues,
    setAutoSaveSuccess,
    updateSubtitleUser
});

export {
    VideoPlayer,
    Reducers,
    SubtitleEdit,
    Actions
};

