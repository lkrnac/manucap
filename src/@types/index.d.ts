declare module "@dotsub/manucap" {

    import SubtitleEdit from "../manucap/SubtitleEdit";
    import { AppThunk, Reducers } from "../manucap/subtitleEditReducers";
    import VideoPlayer, { Props as VideoPlayerProps } from "../manucap/player/VideoPlayer";
    import { CueDto, Track, User } from "../manucap/model";

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
    } from "../manucap/model";

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
