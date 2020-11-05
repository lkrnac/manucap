import React, { Dispatch, ReactElement } from "react";
import { CueDto, GlossaryMatchDto } from "../../model";
import { convertVttToHtml } from "../cueTextConverter";
import { cueCategoryToPrettyName, findPositionIcon } from "../cueUtils";
import { getTimeString } from "../timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch, useSelector } from "react-redux";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { setGlossaryTerm } from "../edit/cueEditorSlices";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
    showGlossaryTerms: boolean;
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

const injectGlossaryTerms = (plainText: string, props: Props, sanitizedHtml: string): string => {
    props.cue.glossaryMatches?.forEach(
        (match) => {
            const caseInsensitiveMatches = plainText.match(new RegExp(match.source,"gi"));
            sanitizedHtml = replaceForInsensitiveMatches(caseInsensitiveMatches, plainText, match, sanitizedHtml);
        }
    );
    return sanitizedHtml;
};

const buildContent = (dispatch: Dispatch<AppThunk>, props: Props): string => {
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

const CueView = (props: Props): ReactElement => {
    const editingTrack = useSelector((state: SubtitleEditState) => state.editingTrack);
    const dispatch = useDispatch();
    const html = props.hideText
        ? ""
        : buildContent(dispatch, props);
    return (
        <div style={{ display: "flex" }} className={props.className}>
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
                        width: "100%",
                        direction: editingTrack?.language.direction
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>
        </div>
    );
};

export default CueView;
