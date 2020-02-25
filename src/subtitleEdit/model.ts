export interface Language {
    readonly id: string;
    readonly name: string;
}

export type CueCategory = "DIALOGUE" | "ONSCREEN_TEXT" | "AUDIO_DESCRIPTION" | "LYRICS";

export interface CueDto {
    readonly vttCue: VTTCue;
    readonly cueCategory: CueCategory;
}

export interface LanguageCues {
    readonly languageId: string;
    readonly cues: CueDto[];
}

export interface Track {
    readonly type: "CAPTION" | "TRANSLATION";
    readonly language: Language;
    readonly default: boolean;
    readonly mediaTitle: string;
    readonly mediaLength: number;
    readonly sourceTrack?: Track;
}

export interface Task {
    readonly type: "TASK_CAPTION" | "TASK_TRANSLATE" | "TASK_DIRECT_TRANSLATE" | "TASK_REVIEW";
    readonly projectName: string;
    readonly dueDate: string;
}
