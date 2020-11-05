import { updateCues } from "./subtitleEdit/cues/cuesListActions";
import { updateEditingTrack, updateTask } from "./subtitleEdit/trackSlices";
import { Reducers } from "./subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import VideoPlayer from "./subtitleEdit/player/VideoPlayer";
import { setAutoSaveSuccess } from "./subtitleEdit/cues/saveSlices";
import { updateSourceCues } from "./subtitleEdit/cues/view/sourceCueSlices";
import { CueDto, GlossaryMatchDto, CueCategory } from "./subtitleEdit/model";

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

export type {
    CueDto,
    CueCategory,
    GlossaryMatchDto
};

