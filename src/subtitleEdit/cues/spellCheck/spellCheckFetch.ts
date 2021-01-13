import { Dispatch } from "react";
import sanitizeHtml from "sanitize-html";
import { SpellCheck } from "./model";
import { cuesSlice } from "../cuesListSlices";
import { SpellcheckerSettings, SubtitleEditAction } from "../../model";
import { hasIgnoredKeyword, languageToolLanguageMapping } from "./spellCheckerUtils";
import { Constants } from "../../constants";
import { spellcheckerSettingsSlice } from "../../spellcheckerSettingsSlice";
import { checkErrors } from "../cuesListActions";

const addSpellCheck = (
    dispatch: Dispatch<SubtitleEditAction | void>,
    index: number,
    spellCheck: SpellCheck,
    trackId?: string
): void => {
    if (spellCheck.matches != null) {
        spellCheck = {
            matches: spellCheck.matches.filter(match => !hasIgnoredKeyword(match, trackId))
        };
    }
    dispatch(cuesSlice.actions.addSpellCheck({ idx: index, spellCheck }));
    dispatch(checkErrors({ index }));
};

export const fetchSpellCheck = (
    dispatch: Dispatch<SubtitleEditAction | void>,
    cueIndex: number,
    text: string,
    spellCheckerSettings: SpellcheckerSettings,
    language: string,
    trackId?: string
): void => {
    const languageToolMatchedLanguageCode = languageToolLanguageMapping.get(language);
    const submittedLanguageCode = languageToolMatchedLanguageCode == null ? language :
        languageToolMatchedLanguageCode;
    const plainText = sanitizeHtml(text, { allowedTags: []});
    const requestBody = {
        method: "POST",
        body: `language=${submittedLanguageCode}&text=${plainText}&disabledRules=${
            Constants.SPELLCHECKER_EXCLUDED_RULES}`
    };
    fetch(`https://${spellCheckerSettings.domain}/v2/check`, requestBody)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw response;
            }
        })
        .then(data =>
            addSpellCheck(dispatch, cueIndex, data as SpellCheck, trackId)
        )
        .catch(error => {
            if (error.status === 400) {
                dispatch(spellcheckerSettingsSlice.actions.disableSpellchecker());
            }
        });
};

