import { Constants } from "../../constants";
import _ from "lodash";
import { SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};


export const generateSpellcheckHash = (cueId: string, keyword: string, ruleId: string): string => {
    const hashObject: SpellCheckHash = { cueId, keyword: keyword, ruleId};
    return CryptoJS.MD5(JSON.stringify(hashObject)).toString();
};

export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string, ruleId: string): void => {
    const spellcheckIgnores = getSpellcheckIgnores();
    const cue = _.get(spellcheckIgnores, `${trackId}`);
    const hash = generateSpellcheckHash(cueId, keyword, ruleId);

    if (cue == null) {
        _.set(spellcheckIgnores, `${trackId}`, [hash]);
    } else {
        spellcheckIgnores[trackId].push(hash);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, keyword: string, ruleId: string): boolean => {
    const cue = _.get(getSpellcheckIgnores(), `${trackId}`);
    return cue != null && cue.includes(generateSpellcheckHash(cueId, keyword, ruleId));
};

export const getCueIgnoredKeywords = (trackId?: string, cueId?: string): string[] => {
    if (trackId && cueId) {
        return _.get(getSpellcheckIgnores(), `${trackId}`);
    }
    return [];
};



