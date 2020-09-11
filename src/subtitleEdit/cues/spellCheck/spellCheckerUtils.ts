import { Constants } from "../../constants";
import _ from "lodash";
import { SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};


export const generateSpellcheckHash = (cueId: string, keyword: string): string => {
    const hashObject: SpellCheckHash = { cueId, keyword: keyword };
    return CryptoJS.MD5(JSON.stringify(hashObject)).toString();
};

export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string): void => {
    console.log("addIgnoredKeyword " + trackId+ " ====== "+ cueId + " ======= "+ keyword);

    const spellcheckIgnores = getSpellcheckIgnores();
    const cue = _.get(spellcheckIgnores, `${trackId}.${cueId}`);
    const hash = generateSpellcheckHash(cueId, keyword);
    console.log("hash " + hash);

    if (cue == null) {
        _.set(spellcheckIgnores, `${trackId}.${cueId}`, [hash]);
    } else {
        spellcheckIgnores[trackId][cueId].push(hash);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, keyword: string): boolean => {
    console.log("hasIgnoredKeyword " + trackId+ " ====== "+ cueId + " ======= "+ keyword);
    const cue = _.get(getSpellcheckIgnores(), `${trackId}.${cueId}`);

    console.log("hash " + generateSpellcheckHash(cueId, keyword));
    console.log(_.get(trackId,generateSpellcheckHash(cueId, keyword)));
    return cue != null && cue.includes(generateSpellcheckHash(cueId, keyword));
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



