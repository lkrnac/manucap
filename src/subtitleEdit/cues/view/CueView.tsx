import React, { Dispatch, ReactElement, useEffect } from "react";
import { CueDto, GlossaryMatchDto, LanguageDirection } from "../../model";
import { convertVttToHtml } from "../edit/cueTextConverter";
import { cueCategoryToPrettyName, findPositionIcon } from "../cueUtils";
import { getTimeString } from "../../utils/timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch } from "react-redux";
import { AppThunk } from "../../subtitleEditReducers";
import { setGlossaryTerm } from "../edit/cueEditorSlices";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import ClickCueWrapper from "./ClickCueWrapper";
import { validateVttCue } from "../cuesList/cuesListActions";

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

const injectGlossaryTerms = (plainText: string, props: CueViewProps, sanitizedHtml: string): string => {
    if (props.cue.glossaryMatches) {
        const sortedMatches = [ ...props.cue.glossaryMatches ].sort(
            (first, second) => first.source.length - second.source.length
        );
        sortedMatches.forEach(
            (match) => {
                const caseInsensitiveMatches = plainText.match(new RegExp("\\b" + match.source + "\\b","gi"));
                sanitizedHtml = replaceForInsensitiveMatches(caseInsensitiveMatches, plainText, match, sanitizedHtml);
            }
        );
    }
    return sanitizedHtml;
};

const buildContent = (dispatch: Dispatch<AppThunk>, props: CueViewProps): string => {
    const plainText = sanitizeHtml(props.cue.vttCue.text, { allowedTags: []});
    let sanitizedHtml = convertVttToHtml(sanitizeHtml(props.cue.vttCue.text, { allowedTags: ["b", "i", "u"]}));

    if (props.showGlossaryTerms) {
        // @ts-ignore We need to define function as global, because it will be used
        // in glossary decorator onClick event injected into HTML via string manipulation + dangerouslySetInnerHTML
        global.pickSetGlossaryTerm = (term: string): void => dispatch(setGlossaryTerm(term));
        sanitizedHtml = injectGlossaryTerms(plainText, props, sanitizedHtml);
    }
    return sanitizedHtml;
};

const CueView = (props: CueViewProps): ReactElement => {
    const dispatch = useDispatch();

    const html = props.hideText
        ? ""
        : buildContent(dispatch, props);
    const undefinedSafeClassName = props.className ? `${props.className} ` : "";

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
                        <div className="sbte-small-font">{cueCategoryToPrettyName[props.cue.cueCategory]}</div>
                        <div className="sbte-small-font" style={{ paddingRight: "10px" }}>
                            {findPositionIcon(props.cue.vttCue).iconText}
                        </div>
                    </div>
                </div>
                <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                    <div
                        className="sbte-cue-editor"
                        style={{
                            flexBasis: "50%",
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
                </div>
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
                        : (
                            <div
                                className={`${undefinedSafeClassName}sbte-left-border`}
                                style={{ minWidth: "52px" }}
                            />
                        )
                }
            </>
        </ClickCueWrapper>
    );
};

export default CueView;
