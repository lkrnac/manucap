import React, { Dispatch, ReactElement } from "react";
import { CueDto, GlossaryMatchDto, LanguageDirection } from "../../model";
import { convertVttToHtml } from "../cueTextConverter";
import { cueCategoryToPrettyName, findPositionIcon } from "../cueUtils";
import { getTimeString } from "../timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch, useSelector } from "react-redux";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { setGlossaryTerm, updateEditingCueIndex } from "../edit/cueEditorSlices";
import { addCue } from "../cuesListActions";
import { CueActionsPanel } from "../CueActionsPanel";

export interface CueViewProps {
    targetCueIndex?: number;
    cue: CueDto;
    targetCuesLength: number;
    playerTime: number;
    showGlossaryTerms: boolean;
    sourceCuesIndexes: number[];
    nextTargetCueIndex: number;
    showActionsPanel?: boolean;
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
                    `style="background-color: #D9E9FF;">${caseInsensitiveMatch}</span>`
                );
            }
        }
    );
    return sanitizedHtml;
};

const injectGlossaryTerms = (plainText: string, props: CueViewProps, sanitizedHtml: string): string => {
    props.cue.glossaryMatches?.forEach(
        (match) => {
            const caseInsensitiveMatches = plainText.match(new RegExp("\\b" + match.source + "\\b","gi"));
            sanitizedHtml = replaceForInsensitiveMatches(caseInsensitiveMatches, plainText, match, sanitizedHtml);
        }
    );
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
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);

    const html = props.hideText
        ? ""
        : buildContent(dispatch, props);
    const undefinedSafeClassName = props.className ? `${props.className} ` : "";
    return (
        <div
            style={{ display: "flex" }}
            className={`${undefinedSafeClassName}sbte-bottom-border`}
            onClick={(): void => {
                if (props.targetCueIndex !== undefined) {
                    if (props.targetCueIndex >= props.targetCuesLength) {
                        dispatch(addCue(props.targetCuesLength, props.sourceCuesIndexes));
                    } else if (editingTask && !editingTask.editDisabled) {
                        dispatch(updateEditingCueIndex(props.targetCueIndex));
                    }
                } else {
                    const finalTargetIndex = props.nextTargetCueIndex >= 0
                        ? props.nextTargetCueIndex
                        : props.targetCuesLength;
                    dispatch(addCue(finalTargetIndex, props.sourceCuesIndexes));
                }
            }}
        >
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
                props.targetCueIndex !== undefined && props.showActionsPanel
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
        </div>
    );
};

export default CueView;
