import sanitizeHtml from "sanitize-html";
import { SpellCheck } from "./model";
import { SpellcheckerSettings, SubtitleEditAction } from "../../model";
import { hasIgnoredKeyword, languageToolLanguageMapping } from "./spellCheckerUtils";
import { Constants } from "../../constants";
import { cuesSlice } from "../cuesListSlices";
import { checkErrors } from "../cuesListActions";
import { Dispatch } from "react";

export const addSpellCheck = (
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
    text: string,
    spellCheckerSettings: SpellcheckerSettings,
    language: string
): Promise<SpellCheck> => {
    const languageToolMatchedLanguageCode = languageToolLanguageMapping.get(language);
    const submittedLanguageCode = languageToolMatchedLanguageCode == null ? language :
        languageToolMatchedLanguageCode;
    const plainText = sanitizeHtml(text, { allowedTags: []});
    const requestBody = {
        method: "POST",
        body: `language=${submittedLanguageCode}&text=${plainText}&disabledRules=${
            Constants.SPELLCHECKER_EXCLUDED_RULES}`
    };

    return fetch(`https://${spellCheckerSettings.domain}/v2/check`, requestBody)
        .then((response: Response) => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 400) {
                throw response.status;
            }
            return;
        });
};

