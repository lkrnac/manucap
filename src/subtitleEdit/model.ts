import { SpellCheck } from "./cues/spellCheck/model";
import { SearchReplaceMatches } from "./cues/searchReplace/model";

export type LanguageDirection = "RTL" | "LTR";

export interface Language {
    readonly id: string;
    readonly name: string;
    readonly direction: LanguageDirection;
}

export type CueCategory = "DIALOGUE" | "ONSCREEN_TEXT" | "AUDIO_DESCRIPTION" | "LYRICS";

export interface GlossaryMatchDto {
    source: string;
    replacements: string[];
}

export interface CueDto {
    readonly vttCue: VTTCue;
    readonly cueCategory: CueCategory;
    corrupted?: boolean;
    editUuid?: string;
    spellCheck?: SpellCheck;
    searchReplaceMatches?: SearchReplaceMatches;
    glossaryMatches?: GlossaryMatchDto[];
}

export interface CueDtoWithIndex {
    index: number;
    cue: CueDto;
}

export interface CueLineDto {
    sourceCues?: CueDtoWithIndex[];
    targetCues?: CueDtoWithIndex[];
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
    readonly sourceLanguage?: Language;
    readonly progress: number;
    overlapEnabled?: boolean;
    id?: string;
}

export interface SpellcheckerSettings {
    enabled: boolean;
    domain: string | null | undefined;
}

export interface Task {
    readonly type: "TASK_CAPTION" | "TASK_TRANSLATE" | "TASK_DIRECT_TRANSLATE" | "TASK_REVIEW";
    readonly projectName: string;
    readonly dueDate: string;
    readonly editDisabled: boolean;
}

/**
 * This is marker interface for all the actions that can be dispatched
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SubtitleEditAction {
}

export interface TimeGapLimit {
    minGap: number;
    maxGap: number;
}

export interface LoadingIndicator {
    cuesLoaded: boolean;
    sourceCuesLoaded: boolean;
}

export interface CueChange {
    changeType: "ADD" | "EDIT" | "REMOVE";
    index: number;
    vttCue: VTTCue;
}

export enum ScrollPosition {
    NONE,
    FIRST,
    LAST,
    CURRENT
}
