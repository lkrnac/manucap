export interface SubtitleSpecification {
    subtitleSpecificationId: string;
    projectId: string;
    enabled: boolean;
    audioDescription: boolean;
    onScreenText: boolean;
    spokenAudio: boolean;
    speakerIdentification: string;
    dialogueStyle: string;
    maxLinesPerCaption: number;
    maxCharactersPerLine: number;
    minCaptionDurationInMillis: number;
    maxCaptionDurationInMillis: number;
    comments: string;
    mediaNotes?: string;
}
