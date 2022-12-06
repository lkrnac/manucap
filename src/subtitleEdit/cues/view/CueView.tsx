import { ReactElement, useEffect } from "react";
import { CueDto, GlossaryMatchDto, LanguageDirection } from "../../model";
import { convertVttToHtml } from "../edit/cueTextConverter";
import { cueCategoryToPrettyName, findPositionIcon } from "../cueUtils";
import { getTimeString } from "../../utils/timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch, useSelector } from "react-redux";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import ClickCueWrapper from "./ClickCueWrapper";
import { validateVttCue } from "../cuesList/cuesListActions";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { SearchReplaceMatch } from "../searchReplace/SearchReplaceMatch";
import { renderToString } from "react-dom/server";

export interface CueViewProps {
    cue: CueDto;
    isTargetCue: boolean;
    targetCuesLength: number;
    showGlossaryTerms: boolean;
    sourceCuesIndexes: number[];
    nextTargetCueIndex: number;
    targetCueIndex?: number;
    languageDirection?: LanguageDirection;
    className?: string;
    hideText?: boolean;
    glossaryTerm?: string;
    setGlossaryTerm?: (glossaryTerm?: string) => void;
    editDisabled?: boolean;
}

const replaceForInsensitiveMatches = (
    caseInsensitiveMatches: RegExpMatchArray | null,
    plainText: string,
    match: GlossaryMatchDto,
    sanitizedHtml: string
): string => {
    caseInsensitiveMatches?.forEach(
        (caseInsensitiveMatch: string) => {
            if (plainText.includes(caseInsensitiveMatch)) {
                const compositeValue =
                    match.replacements.reduce((left, right) => `${left}/${right}`);
                sanitizedHtml = sanitizedHtml.replace(
                    caseInsensitiveMatch,
                    `<span onClick="pickSetGlossaryTerm('${compositeValue}')" ` +
                    `class="sbte-glossary-match">${caseInsensitiveMatch}</span>`
                );
            }
        }
    );
    return sanitizedHtml;
};

const injectGlossaryTerms = (props: CueViewProps, plainText: string, sanitizedHtml: string): string => {
    if (props.cue.glossaryMatches) {
        const deduplicatedMatches = [ ...props.cue.glossaryMatches ].sort(
            (first, second) => second.source.length - first.source.length
        ).reduce((result: GlossaryMatchDto[], match: GlossaryMatchDto) => {
            return result.findIndex(ele => ele.source.includes(match.source)) !== -1 ? result : [...result, match];
        }, []);
        deduplicatedMatches.forEach(
            (match) => {
                const caseInsensitiveMatches = plainText.match(new RegExp("\\b" + match.source + "\\b","gi"));
                sanitizedHtml = replaceForInsensitiveMatches(caseInsensitiveMatches, plainText, match, sanitizedHtml);
            }
        );
    }
    return sanitizedHtml;
};

const getWordOccurrenceIndex = (text: string, word: string, occurrence: number) => {
    return text.split(word, occurrence).join(word).length;
};

const injectCurrentSearchMatch = (props: CueViewProps, plainText: string, sanitizedHtml: string): string => {
    const matchLength = props.cue.searchReplaceMatches?.matchLength;
    const offsetIndex = props.cue.searchReplaceMatches?.offsetIndex;
    const offset = offsetIndex !== undefined ? props.cue.searchReplaceMatches?.offsets[offsetIndex] : undefined;
    if (matchLength && offsetIndex !== undefined && offset !== undefined) {
        const match = plainText.substring(offset, offset + matchLength);
        const htmlOffset = getWordOccurrenceIndex(sanitizedHtml, match, offsetIndex + 1);
        const partialHtml = sanitizedHtml.substring(htmlOffset);
        const replacement = renderToString(<SearchReplaceMatch><>{match}</></SearchReplaceMatch>);
        sanitizedHtml = sanitizedHtml.substring(0, htmlOffset) + partialHtml.replace(match, replacement);
    }
    return sanitizedHtml;
};

const buildContent = (props: CueViewProps, editingCueIndex: number): string => {
    const plainText = sanitizeHtml(props.cue.vttCue.text, { allowedTags: []});
    let sanitizedHtml = convertVttToHtml(sanitizeHtml(props.cue.vttCue.text, { allowedTags: ["b", "i", "u"]}));

    if (props.showGlossaryTerms) {
        // @ts-ignore We need to define function as global, because it will be used
        // in glossary decorator onClick event injected into HTML via string manipulation + dangerouslySetInnerHTML
        global.pickSetGlossaryTerm = (term: string): void => props?.setGlossaryTerm(term);
        sanitizedHtml = injectGlossaryTerms(props, plainText, sanitizedHtml);
    }
    if (props.targetCueIndex === editingCueIndex) {
        sanitizedHtml = injectCurrentSearchMatch(props, plainText, sanitizedHtml);
    }
    return sanitizedHtml;
};

const CueView = (props: CueViewProps): ReactElement => {
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    const dispatch = useDispatch();

    const html = props.hideText
        ? ""
        : buildContent(props, editingCueIndex);

    useEffect(() => {
        if (props.isTargetCue
            && (props.cue.errors === undefined || props.cue.errors === null)
            && props.targetCueIndex !== undefined) {
            dispatch(validateVttCue(props.targetCueIndex));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // need to run only once on mount

    return (
        <ClickCueWrapper
            targetCueIndex={props.targetCueIndex}
            targetCuesLength={props.targetCuesLength}
            sourceCuesIndexes={props.sourceCuesIndexes}
            nextTargetCueIndex={props.nextTargetCueIndex}
            className={props.className}
            editDisabled={props.editDisabled}
        >
            <>
                <div
                    className="sbte-cue-line-left-section"
                    style={{
                        flex: "1 1 300px",
                        display: "flex",
                        flexDirection: "column",
                        paddingLeft: "10px",
                        paddingTop: "5px",
                        justifyContent: "space-between"
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div>{getTimeString(props.cue.vttCue.startTime)}</div>
                        <div>{getTimeString(props.cue.vttCue.endTime)}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "5px" }}>
                        <div className="text-sm">{cueCategoryToPrettyName[props.cue.cueCategory]}</div>
                        <div className="text-sm" style={{ paddingRight: "10px" }}>
                            {findPositionIcon(props.cue.vttCue).iconText}
                        </div>
                    </div>
                </div>
                <div
                    className="border-l border-blue-light/20 flex items-stretch"
                    style={{ flex: "1 1 70%" }}
                >
                    <div
                        className="sbte-cue-editor"
                        style={{
                            flexBasis: "auto",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            minHeight: "54px",
                            height: "100%",
                            width: "100%"
                        }}
                        dir={props.languageDirection}
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                    {
                        props.targetCueIndex !== undefined && props.isTargetCue
                            ? (
                                <CueActionsPanel
                                    index={props.targetCueIndex}
                                    cue={props.cue}
                                    isEdit={false}
                                    sourceCueIndexes={props.sourceCuesIndexes}
                                />
                            )
                            : null
                    }
                </div>
            </>
        </ClickCueWrapper>
    );
};

export default CueView;
