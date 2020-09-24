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
// languages that need conversion
languageToolLanguageMapping.set("ar-SA", "ar");
languageToolLanguageMapping.set("ca", "ca-ES");
languageToolLanguageMapping.set("nl-NL", "nl");
languageToolLanguageMapping.set("en-ZA", "en");
languageToolLanguageMapping.set("en-IE", "en");
languageToolLanguageMapping.set("fr-FR", "fr");
languageToolLanguageMapping.set("fr-CA", "fr");
languageToolLanguageMapping.set("it-IT", "it");
languageToolLanguageMapping.set("no-NO", "no");
languageToolLanguageMapping.set("fa-AF", "fa");
languageToolLanguageMapping.set("fa-IR", "fa");
languageToolLanguageMapping.set("fa-IR", "fa");
languageToolLanguageMapping.set("es-ES", "es");
languageToolLanguageMapping.set("es-MX", "es");
languageToolLanguageMapping.set("sv-SE", "sv");
languageToolLanguageMapping.set("ta-SG", "ta-IN");
languageToolLanguageMapping.set("zh-HK", "zh-CN");
languageToolLanguageMapping.set("zh-CN", "zh-CN");
languageToolLanguageMapping.set("zh-TW", "zh-CN");
languageToolLanguageMapping.set("zh-HK", "zh-CN");
languageToolLanguageMapping.set("zh-TW", "zh-CN");
// language that already exist in vtms
languageToolLanguageMapping.set("en-AU", "en-AU");
languageToolLanguageMapping.set("en-CA", "en-CA");
languageToolLanguageMapping.set("en-GB", "en-GB");
languageToolLanguageMapping.set("en-NZ", "en-NZ");
languageToolLanguageMapping.set("en-US", "en-US");
languageToolLanguageMapping.set("de-DE", "de-DE");
languageToolLanguageMapping.set("de-CH", "de-CH");
languageToolLanguageMapping.set("da-DK", "da-DK");
languageToolLanguageMapping.set("el-GR", "el-GR");
languageToolLanguageMapping.set("ga-IE", "ga-IE");
languageToolLanguageMapping.set("ja-JP", "ja-JP");
languageToolLanguageMapping.set("km-KH", "km-KH");
languageToolLanguageMapping.set("pl-PL", "pl-PL");
languageToolLanguageMapping.set("pt-BR", "pt-BR");
languageToolLanguageMapping.set("pt-PT", "pt-PT");
languageToolLanguageMapping.set("ro-RO", "ro-RO");
languageToolLanguageMapping.set("ru-RU", "ru-RU");
languageToolLanguageMapping.set("sk-SK", "sk-SK");
languageToolLanguageMapping.set("sl-SI", "sl-SI");
languageToolLanguageMapping.set("tl-PH", "tl-PH");
languageToolLanguageMapping.set("ta-IN", "ta-IN");
// non-supported in vtms
languageToolLanguageMapping.set("be-BY", "be-BY");
languageToolLanguageMapping.set("pt-MZ", "pt-MZ");
languageToolLanguageMapping.set("br-FR", "br-FR");
languageToolLanguageMapping.set("gl-ES", "gl-ES");
languageToolLanguageMapping.set("de-AT", "de-AT");
languageToolLanguageMapping.set("pt-AO", "pt-AO");











