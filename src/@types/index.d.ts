declare module "manucap" {

    import ManuCap from "../manucap/ManuCap";
    import { AppThunk, Reducers } from "../manucap/manuCapReducers";
    import VideoPlayer, { Props as VideoPlayerProps } from "../manucap/player/VideoPlayer";
    import { CueDto, Track, User } from "../manucap/model";

    const Actions: {
        updateEditingTrack: (track: Track) => AppThunk;
        updateCues: (cues: CueDto[]) => AppThunk;
        updateSourceCues: (cues: CueDto[]) => AppThunk;
        updateCaptionUser: (user: User) => AppThunk;
    };

    const Hooks: {
        useMatchedCuesAsCsv: () => Function;
    };

    export {
        VideoPlayer,
        VideoPlayerProps,
        ManuCap,
        Reducers,
        Actions,
        Hooks
    };
}

declare module "manucap/models" {

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
