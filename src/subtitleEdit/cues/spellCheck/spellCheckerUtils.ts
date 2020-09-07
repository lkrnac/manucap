import { Constants } from "../../constants";

class IgnoredKeyword {
    constructor(cueId: string, keyword: string, trackId: string) {
        this.cueId = cueId;
        this.keyword = keyword;
        this.trackId = trackId;
    }
    trackId: string;
    cueId: string;
    keyword: string;
}

const getMap = (): Map<string, Set<IgnoredKeyword>> => {
    const localStorageIgnoredSpellchecks = localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY];
    const isEmptyOrNull = localStorageIgnoredSpellchecks == null || localStorageIgnoredSpellchecks === "{}";
    return new Map<string, Set<IgnoredKeyword>>(isEmptyOrNull ? null: localStorageIgnoredSpellchecks);
};

export const addIgnoredKeyword = (trackId: string, cueId: string, keyword: string): void => {
    const ignoredKeyword = new IgnoredKeyword(trackId, cueId, keyword);
    const map: Map<string, Set<IgnoredKeyword>> = getMap();
    const mapIgnoredKeywordSet: Set<IgnoredKeyword> | undefined = map.get(trackId);
    const ignoredKeywordSet: Set<IgnoredKeyword> = mapIgnoredKeywordSet != null ? mapIgnoredKeywordSet :
        new Set<IgnoredKeyword>();
    ignoredKeywordSet.add(ignoredKeyword);
    map.set(trackId, ignoredKeywordSet);
    console.log("JSON.stringify(map)");
    console.log(map);
    console.log(JSON.stringify(map));
    localStorage[Constants.SPELLCHECKER_IGNORED_LOCAL_STORAGE_KEY] = JSON.stringify(map);
};

export const hasIgnoredKeyword = (trackId: string, cueId: string, keyword: string): boolean => {
    const ignoredKeyword = new IgnoredKeyword(trackId, cueId, keyword);
    const trackIgnoredKeywords = getMap().get(trackId);
    return trackIgnoredKeywords != null && trackIgnoredKeywords.has(ignoredKeyword);
};



