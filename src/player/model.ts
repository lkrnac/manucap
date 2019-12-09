export interface Language {
    readonly id: string;
    readonly name: string;
}

export interface TrackVersion {
    readonly cues: VTTCue[];
}

export interface Track {
    readonly currentVersion?: TrackVersion;
    readonly sourceTrack?: Track;
    readonly type: "CAPTION" | "TRANSLATION";
    readonly language: Language;
    readonly default: boolean;
}
