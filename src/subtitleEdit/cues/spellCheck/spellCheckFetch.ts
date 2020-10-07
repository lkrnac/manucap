import { Dispatch } from "react";
import { AnyAction, PayloadAction } from "@reduxjs/toolkit";
import sanitizeHtml from "sanitize-html";
import { SpellCheck } from "./model";
import { cuesSlice } from "../cueSlices";
import { SubtitleEditAction } from "../../model";
import { hasIgnoredKeyword, languageToolLanguageMapping } from "./spellCheckerUtils";
import { Constants } from "../../constants";
import { disableSpellchecker } from "../../trackSlices";

const addSpellCheck = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    trackId: string,
    index: number,
    spellCheck: SpellCheck,
): void => {
    if (spellCheck.matches != null) {
        spellCheck = {
            matches: spellCheck.matches.filter(match => !hasIgnoredKeyword(trackId, match))
        };
    }
    dispatch(cuesSlice.actions.addSpellCheck({ idx: index, spellCheck }));

    const subtitleSpecification = getState().subtitleSpecifications;
    const overlapEnabled = getState().editingTrack?.overlapEnabled;
    dispatch(cuesSlice.actions.checkErrors({ subtitleSpecification, overlapEnabled, index }));
};

export const fetchSpellCheck = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    trackId: string,
    cueIndex: number,
    text: string,
    language?: string,
    spellCheckDomain?: string,
): void => {
    if (spellCheckDomain && language) {
        const languageToolMatchedLanguageCode = languageToolLanguageMapping.get(language);
        const submittedLanguageCode = languageToolMatchedLanguageCode == null ? language :
            languageToolMatchedLanguageCode;
        const plainText = sanitizeHtml(text, { allowedTags: []});
        const requestBody = {
            method: "POST",
            body: `language=${submittedLanguageCode}&text=${plainText}&disabledRules=${
                Constants.SPELLCHECKER_EXCLUDED_RULES}`
        };
        fetch(`https://${spellCheckDomain}/v2/check`, requestBody)
            .then((response: void | any)  => {
                if (response.ok) {
                    return response.json();
                } else {
                    dispatch(disableSpellchecker());
                }
            })
            .then(data => addSpellCheck(dispatch, getState, trackId, cueIndex, data as SpellCheck));
    }
};

