import { Constants } from "../../constants";
import * as _ from "lodash";
import { SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage.getItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY);
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};

export const generateSpellcheckHash = (cueId: string, keyword: string, ruleId: string): string => {
    const hashObject: SpellCheckHash = { cueId, keyword: keyword, ruleId };
    return CryptoJS.MD5(JSON.stringify(hashObject)).toString();
};

export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string, ruleId: string): void => {
    const spellcheckIgnores = getSpellcheckIgnores();
    const hashes = _.get(spellcheckIgnores, `${trackId}.hashes`);
    const hash = generateSpellcheckHash(cueId, keyword, ruleId);

    if (hashes == null) {
        _.set(spellcheckIgnores, `${trackId}`, { hashes: [hash], creationDate: new Date() });
    } else {
        hashes.push(hash);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, keyword: string, ruleId: string): boolean => {
    const hashes = _.get(getSpellcheckIgnores(), `${trackId}.hashes`);
    return hashes != null && hashes.includes(generateSpellcheckHash(cueId, keyword, ruleId));
};


