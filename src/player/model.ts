
export interface Language {
    readonly id: string;
    readonly name: string;
}

export interface TrackVersion {
    readonly cues: VTTCue[];
}

export interface Track {
    readonly currentVersion?: TrackVersion;
    readonly type: "CAPTION" | "TRANSLATION";
    readonly language: Language;
    readonly default: boolean;
    readonly videoTitle: string;
    readonly sourceTrack?: Track;
}

export interface Task {
    readonly type: "TASK_CAPTION" | "TASK_TRANSLATE" | "TASK_DIRECT_TRANSLATE" | "TASK_REVIEW";
    readonly projectName: string;
    readonly dueDate: string;
}
