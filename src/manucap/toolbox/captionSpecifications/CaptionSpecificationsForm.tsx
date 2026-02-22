import { PropsWithChildren, ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CaptionSpecification } from "../model";

export interface Props {
    captionSpecifications: CaptionSpecification;
}

const speakerIdentificationValues = {
    NONE: "None",
    FIRST_NAME: "First Name",
    FULLNAME: "Full Name",
    NUMBERED: "Numbered",
    GENDER: "Gender",
    GENRE: "Genre",
    SEE_COMMENTS: "See Comments"
};
const dialogueStyleValues = {
    LINE_BREAKS: "Line Breaks",
    DOUBLE_CHEVRON: "Double Chevron",
    NO_DASHES: "No Dashes",
    SEE_COMMENTS: "See Comments"
};

const millisToSeconds = (millis: number | null): string => millis ? "" + (millis / 1000) : "n/a";

// Disable following rule because if returned HtmlAnchorElement it requires to initialize all element props
/* eslint-disable @typescript-eslint/no-explicit-any */
const LinkNewTabRenderer = ({ href, children }: PropsWithChildren<{ href: string }>): any =>
    <a href={href} rel="noopener noreferrer" target="_blank">{children}</a>;

const CaptionSpecificationsForm = (props: Props): ReactElement => (
    <>
        <label><strong>Enabled:&nbsp;</strong></label>
        <label>{props.captionSpecifications.enabled ? "Yes" : "No"}</label>
        <hr className="my-4" />
        {props.captionSpecifications.enabled ? (
            <>
                <div style={{ display: "flex", marginRight: "20px" }}>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong> Audio Tags:&nbsp;</strong></label>
                            <label>{props.captionSpecifications.audioDescription ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>On-Screen Text:&nbsp;</strong></label>
                            <label>{props.captionSpecifications.onScreenText ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>Spoken Audio:&nbsp;</strong></label>
                            <label>{props.captionSpecifications.spokenAudio ? "Yes" : "No"}</label>
                        </div>
                        <div>
                            <label><strong>Speaker Identification:&nbsp;</strong></label>
                            <label>
                                {speakerIdentificationValues[props.captionSpecifications.speakerIdentification]}
                            </label>
                        </div>
                        <div>
                            <label><strong>Dialogue Style:&nbsp;</strong></label>
                            <label>
                                {dialogueStyleValues[props.captionSpecifications.dialogueStyle]}
                            </label>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div>
                            <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                            <label>
                                {
                                    props.captionSpecifications.maxLinesPerCaption
                                        ? props.captionSpecifications.maxLinesPerCaption
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Caption Line:&nbsp;</strong></label>
                            <label>
                                {
                                    props.captionSpecifications.maxCharactersPerLine
                                        ? props.captionSpecifications.maxCharactersPerLine
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Characters Per Second Per Caption:&nbsp;</strong></label>
                            <label>
                                {
                                    props.captionSpecifications.maxCharactersPerSecondPerCaption
                                        ? props.captionSpecifications.maxCharactersPerSecondPerCaption
                                        : "n/a"
                                }
                            </label>
                        </div>
                        <div>
                            <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>
                                {millisToSeconds(props.captionSpecifications.minCaptionDurationInMillis)}
                            </label>
                        </div>
                        <div>
                            <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                            <label>
                                {millisToSeconds(props.captionSpecifications.maxCaptionDurationInMillis)}
                            </label>
                        </div>
                    </div>
                </div>
                <hr className="my-4" />
                <label><strong>Comments:&nbsp;</strong></label>
                <ReactMarkdown
                    renderers={{ link: LinkNewTabRenderer, linkReference: LinkNewTabRenderer }}
                    source={props.captionSpecifications.comments}
                    disallowedTypes={["html"]}
                    plugins={[remarkGfm]}
                    className="mc-subspec-freeform-text mc-subspec-comments"
                />
            </>
        ) : null}
        <div style={{ marginTop: "10px" }}>
            <label><strong>Media Notes:&nbsp;</strong></label>
            <ReactMarkdown
                renderers={{ link: LinkNewTabRenderer, linkReference: LinkNewTabRenderer }}
                source={props.captionSpecifications.mediaNotes ? props.captionSpecifications.mediaNotes : ""}
                disallowedTypes={["html"]}
                plugins={[remarkGfm]}
                className="mc-subspec-freeform-text mc-media-notes"
            />
        </div>
    </>
);

export default CaptionSpecificationsForm;
