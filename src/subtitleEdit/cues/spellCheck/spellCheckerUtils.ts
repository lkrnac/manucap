import { Constants } from "../../constants";
import _ from "lodash";
import { SpellCheck } from "./model";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};

//@ts-ignore
export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string, offset: number, spellCheck: SpellCheck): void => {
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

export const getCueIgnoredKeywords = (trackId?: string, cueId?: string): string[] => {
    if (trackId && cueId) {
        console.log("trackId " + trackId);
        console.log("cueId " + cueId);
        console.log("json ");
        console.log(getSpellcheckIgnores());
        return _.get(getSpellcheckIgnores(), `${trackId}.${cueId}`);
    }
    return [];
};



