import { updateCues } from "./manucap/cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./manucap/trackSlices";
import { Reducers } from "./manucap/subtitleEditReducers";
import ManuCap from "./manucap/ManuCap";
import VideoPlayer from "./manucap/player/VideoPlayer";
import useMatchedCuesAsCsv from "./manucap/cues/cuesList/useMatchedCuesAsCsv";
import { updateSourceCues } from "./manucap/cues/view/sourceCueSlices";
import { updateSubtitleUser } from "./manucap/userSlices";

const Actions = ({
    updateEditingTrack,
    updateCues,
    updateSourceCues,
    updateSubtitleUser,
});

const Hooks = ({
    useMatchedCuesAsCsv
});

export {
    VideoPlayer,
    Reducers,
    ManuCap,
    Actions,
    Hooks
};

