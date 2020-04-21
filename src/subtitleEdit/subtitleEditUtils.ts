import { LoadingIndicator, Track } from "./model";

const isDirectTranslationTrack = (editingTrack: Track) => editingTrack.type === "TRANSLATION"
    && !editingTrack.sourceLanguage;

export const hasDataLoaded = (editingTrack: Track | null, loadingIndicator: LoadingIndicator): boolean | null =>
    editingTrack && loadingIndicator.cuesLoaded
    && (editingTrack.type === "CAPTION" || loadingIndicator.sourceCuesLoaded || isDirectTranslationTrack(editingTrack));
