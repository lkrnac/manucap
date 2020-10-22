import React, { Dispatch, ReactElement } from "react";
import { CueDto } from "../../model";
import { convertVttToHtml } from "../cueTextConverter";
import { cueCategoryToPrettyName } from "../cueUtils";
import { findPositionIcon } from "../cueUtils";
import { getTimeString } from "../timeUtils";
import sanitizeHtml from "sanitize-html";
import { useDispatch } from "react-redux";
import { AppThunk } from "../../subtitleEditReducers";
import { setGlossaryTerm } from "../edit/cueEditorSlices";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
    className?: string;
    hideText?: boolean;
}

const buildContent = (dispatch: Dispatch<AppThunk>, props: Props): string => {
    const plainText = sanitizeHtml(props.cue.vttCue.text, { allowedTags: []});
    const plainWords = plainText.replace("\n", " ").split(" ");
    let sanitizedHtml = convertVttToHtml(sanitizeHtml(props.cue.vttCue.text, { allowedTags: ["b", "i", "u"]}));
    // @ts-ignore We need to define function as global, because it will be used
    // in glossary decorator onClick event injected into HTML via string manipulation + dangerouslySetInnerHTML
    global.pickSetGlossaryTerm = (term: string): void => dispatch(setGlossaryTerm(term));

    plainWords.forEach((value) => {
        const glossaryMatches = props.cue.glossaryMatches;
        if (glossaryMatches && glossaryMatches[value]) {
            const compositeValue = glossaryMatches[value].reduce((left, right) => `${left}/${right}`);
            sanitizedHtml = sanitizedHtml.replace(
                value,
                `<span onClick="pickSetGlossaryTerm('${compositeValue}')" ` +
                `style="background-color: #D9E9FF;">${value}</span>`
            );
        }
    });
    return sanitizedHtml;
};

const CueView = (props: Props): ReactElement => {
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
                        width: "100%"
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>
        </div>
    );
};

export default CueView;
