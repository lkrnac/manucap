import { Constants } from "../../constants";
import _ from "lodash";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};

export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string): void => {
    const spellcheckIgnores = getSpellcheckIgnores();
    const cue = _.get(spellcheckIgnores, `${trackId}.${cueId}`);
    if (cue == null) {
        _.set(spellcheckIgnores, `${trackId}.${cueId}`, [keyword]);
    } else {
        spellcheckIgnores[trackId][cueId].push(keyword);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, keyword: string): boolean => {
    const cue = _.get(getSpellcheckIgnores(), `${trackId}.${cueId}`);
    return cue != null && cue.includes(keyword);
};





