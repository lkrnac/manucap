import { AppThunk, Reducers } from "../subtitleEdit/subtitleEditReducers";
import SubtitleEdit from "../subtitleEdit/SubtitleEdit";
import VideoPlayer from "../subtitleEdit/player/VideoPlayer";
import { CueDto, Track, User } from "../subtitleEdit/model";

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

    export { VideoPlayer, Reducers, SubtitleEdit, Actions, Hooks };
}
