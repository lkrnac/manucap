import { Constants } from "../../constants";
import _ from "lodash";
import { Match, SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage.getItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY);
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};

export const generateSpellcheckHash = (keyword: string, ruleId: string): string => {
    const hashObject: SpellCheckHash = { keyword: keyword, ruleId };
    return CryptoJS.MD5(JSON.stringify(hashObject)).toString();
};

export const addIgnoredKeyword = (trackId: string, keyword: string, ruleId: string): void => {
    const spellcheckIgnores = getSpellcheckIgnores();
    const hashes = _.get(spellcheckIgnores, `${trackId}.hashes`, []);
    const hash = generateSpellcheckHash(keyword, ruleId);
    if (hashes.length === 0) {
        spellcheckIgnores[trackId] = { hashes: [hash], creationDate: new Date() };
    } else {
        hashes.push(hash);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, match: Match): boolean => {
    const hashes = _.get(getSpellcheckIgnores(), `${trackId}.hashes`, []);
    const endOffset = match.offset + match.length;
    const keyword = match.context.text.slice(match.offset, endOffset);
    return hashes.includes(generateSpellcheckHash(keyword, match.rule.id));
};


