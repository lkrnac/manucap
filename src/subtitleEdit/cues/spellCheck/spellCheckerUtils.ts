import { Constants } from "../../constants";
import _ from "lodash";
import { SpellCheckContext, SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    return localStorageIgnoredSpellchecks == null ? {} : JSON.parse(localStorageIgnoredSpellchecks);
};


export const generateSpellcheckHash = (cueId: string, spellCheckContext: SpellCheckContext): string => {
    const hashObject: SpellCheckHash = { cueId, context: spellCheckContext };
    return CryptoJS.MD5(JSON.stringify(hashObject)).toString();
};

export const addIgnoredKeyword = (trackId: string, cueId: string, spellCheckContext: SpellCheckContext): void => {

    const spellcheckIgnores = getSpellcheckIgnores();
    const cue = _.get(spellcheckIgnores, `${trackId}.${cueId}`);
    const hash = generateSpellcheckHash(cueId, spellCheckContext);
    if (cue == null) {
        _.set(spellcheckIgnores, `${trackId}.${cueId}`, hash);
    } else {
        spellcheckIgnores[trackId][cueId].push(hash);
    }
    localStorage.setItem(Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, context: SpellCheckContext): boolean => {
    const cue = _.get(getSpellcheckIgnores(), `${trackId}.${cueId}`);

    console.log(_.get(trackId,generateSpellcheckHash(cueId, context)));
    console.log(_.get(trackId,generateSpellcheckHash(cueId, context)));
    return cue != null && cue.includes(generateSpellcheckHash(cueId, context));
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



