
export interface Language {
    readonly id: string;
    readonly name: string;
}

export interface TrackVersion {
    readonly cues: VTTCue[];
}

export interface TrackDescription {
    readonly action: string;
    readonly subject: string;
}

export interface TrackProgress {
    unit: string;
    percentage: string;
}

export interface Track {
    readonly currentVersion?: TrackVersion;
    readonly type: "CAPTION" | "TRANSLATION";
    readonly language: Language;
    readonly default: boolean;
    readonly videoTitle: string;
    readonly projectName: string;
    readonly dueDate: string;
    readonly description: TrackDescription;
    readonly progress: TrackProgress;
}
