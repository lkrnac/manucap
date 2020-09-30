import { Constants } from "../../constants";
import _ from "lodash";
import { Match, SpellCheckHash } from "./model";
import CryptoJS from "crypto-js";

const getSpellcheckIgnores = (): {} => {
    const localStorageIgnoredSpellchecks = localStorage.getItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY);
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
    localStorage.setItem(Constants.SPELLCHECKER_IGNORES_LOCAL_STORAGE_KEY, JSON.stringify(spellcheckIgnores));
};

export const hasIgnoredKeyword = (trackId: string, match: Match): boolean => {
    const hashes = _.get(getSpellcheckIgnores(), `${trackId}.hashes`, []);
    const context = match.context;
    const endOffset = context.offset + context.length;
    const keyword = context.text.slice(context.offset, endOffset);
    return hashes.includes(generateSpellcheckHash(keyword, match.rule.id));
};

export const languageToolLanguageMapping = new Map<string, string>();
languageToolLanguageMapping.set("ar-SA", "ar");
languageToolLanguageMapping.set("ca", "ca-ES");
languageToolLanguageMapping.set("nl-NL", "nl");
languageToolLanguageMapping.set("en-IE", "en");
languageToolLanguageMapping.set("fr-FR", "fr");
languageToolLanguageMapping.set("fr-CA", "fr");
languageToolLanguageMapping.set("it-IT", "it");
languageToolLanguageMapping.set("no-NO", "no");
languageToolLanguageMapping.set("fa-AF", "fa");
languageToolLanguageMapping.set("fa-IR", "fa");
languageToolLanguageMapping.set("es-ES", "es");
languageToolLanguageMapping.set("es-MX", "es");
languageToolLanguageMapping.set("sv-SE", "sv");











