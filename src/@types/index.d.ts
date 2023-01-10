import { AppThunk, Reducers } from "../subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "../subtitleEdit/SubtitleEdit";
import VideoPlayer, { Props as VideoPlayerProps } from "../subtitleEdit/player/VideoPlayer";
import { CueDto, Track, User, SaveActionParameters, CompleteActionParameters } from "../subtitleEdit/model";

declare module "@dotsub/vtms-subtitle-edit-ui" {
    const Actions: {
        updateEditingTrack: (track: Track) => AppThunk;
        updateCues: (cues: CueDto[]) => AppThunk;
        updateSourceCues: (cues: CueDto[]) => AppThunk;
        setAutoSaveSuccess: (success: boolean) => AppThunk;
        updateSubtitleUser: (user: User) => AppThunk;
    };

    const Hooks: {
        useMatchedCuesAsCsv: () => Function;
    };

    export {
        VideoPlayer,
        VideoPlayerProps,
        SubtitleEdit,
        SaveActionParameters,
        CompleteActionParameters,
        Reducers,
        Actions,
        Hooks
    };
}
