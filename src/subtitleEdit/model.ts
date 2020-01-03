export interface SubtitleSpecification {
    maxCharactersPerLine: number;
    comments: string;
    onScreenText: boolean;
    speakerIdentification: string;
    spokenAudio: boolean;
    subtitleSpecificationId: string;
    enabled: boolean;
    maxLinesPerCaption: number;
    audioDescription: boolean;
    dialogueStyle: string;
    maxCaptionDurationInMillis: number;
    minCaptionDurationInMillis: number;
    projectId: string;
}
