import { CueDto } from "./model";
import "video.js";

export class Constants {
    static readonly DEFAULT_MIN_GAP: number = 0.1;
    static readonly DEFAULT_MAX_GAP: number = Number.MAX_SAFE_INTEGER;
    static readonly NEW_ADDED_CUE_DEFAULT_STEP: number = 3;
    static readonly DEFAULT_CUE: CueDto = { vttCue: new VTTCue(0, 0, ""), cueCategory: "DIALOGUE" };

    static readonly AUTO_SAVE_SAVING_CHANGES_MSG = "Saving changes";
    static readonly AUTO_SAVE_SUCCESS_CHANGES_SAVED_MSG = "All changes saved to server";
    static readonly AUTO_SAVE_ERROR_SAVING_MSG = "Error saving latest changes";

}

