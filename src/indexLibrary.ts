import { updateCues } from "./manucap/cues/cuesList/cuesListActions";
import { updateEditingTrack } from "./manucap/trackSlices";
import { Reducers } from "./manucap/manuCapReducers";
import ManuCap from "./manucap/ManuCap";
import VideoPlayer from "./manucap/player/VideoPlayer";
import useMatchedCuesAsCsv from "./manucap/cues/cuesList/useMatchedCuesAsCsv";
import { updateSourceCues } from "./manucap/cues/view/sourceCueSlices";
import { updateCaptionUser } from "./manucap/userSlices";
import { readCaptionSpecification } from "./manucap/toolbox/captionSpecifications/captionSpecificationSlice";

const Actions = ({
    updateEditingTrack,
    updateCues,
    updateSourceCues,
    updateCaptionUser,
    readCaptionSpecification,
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

