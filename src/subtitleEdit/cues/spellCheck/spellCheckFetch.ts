import sanitizeHtml from "sanitize-html";
import { SpellCheck } from "./model";
import { SpellcheckerSettings, SubtitleEditAction } from "../../model";
import { hasIgnoredKeyword, languageToolLanguageMapping } from "./spellCheckerUtils";
import { cuesSlice } from "../cuesList/cuesListSlices";
import { checkErrors } from "../cuesList/cuesListActions";
import { Dispatch } from "react";

const SPELLCHECKER_EXCLUDED_RULES = "UPPERCASE_SENTENCE_START,PUNCTUATION_PARAGRAPH_END";

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
    dispatch(checkErrors({ index, shouldSpellCheck: false }));
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
        body: `language=${submittedLanguageCode}&text=${plainText}&disabledRules=${SPELLCHECKER_EXCLUDED_RULES}`
    };
    return fetch(`https://${spellCheckerSettings.domain}/v2/check`, requestBody)
        .then((response: Response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw response.status;
            }
        });
};

