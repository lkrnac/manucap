declare module "@dotsub/manucap" {

    import SubtitleEdit from "../subtitleEdit/SubtitleEdit";
    import { AppThunk, Reducers } from "../subtitleEdit/subtitleEditReducers";
    import VideoPlayer, { Props as VideoPlayerProps } from "../subtitleEdit/player/VideoPlayer";
    import { CueDto, Track, User } from "../subtitleEdit/model";

    const Actions: {
        updateEditingTrack: (track: Track) => AppThunk;
        updateCues: (cues: CueDto[]) => AppThunk;
        updateSourceCues: (cues: CueDto[]) => AppThunk;
        updateSubtitleUser: (user: User) => AppThunk;
    };

    const Hooks: {
        useMatchedCuesAsCsv: () => Function;
    };

    export {
        VideoPlayer,
        VideoPlayerProps,
        SubtitleEdit,
        Reducers,
        Actions,
        Hooks
    };
}

declare module "@dotsub/manucap/models" {

    import {
        CueDto,
        Track,
        Language,
        CueCategory,
        LanguageCues,
        TrackVersionDto,
        CueError,
        User,
        SaveActionParameters,
        TrackCues,
        TrackType,
        SaveTrackCue,
        SaveState
    } from "../subtitleEdit/model";

    export {
        CueDto,
        Track,
        TrackType,
        Language,
        CueCategory,
        LanguageCues,
        TrackVersionDto,
        CueError,
        User,
        SaveActionParameters,
        TrackCues,
        SaveTrackCue,
        SaveState
    };
}
