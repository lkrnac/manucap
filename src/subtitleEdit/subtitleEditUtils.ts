import { LoadingIndicator, Track } from "./model";

export const hasDataLoaded = (editingTrack: Track | null, loadingIndicator: LoadingIndicator): boolean | null =>
    editingTrack && loadingIndicator.cuesLoaded
    && (editingTrack.type === "CAPTION" || loadingIndicator.sourceCuesLoaded);
