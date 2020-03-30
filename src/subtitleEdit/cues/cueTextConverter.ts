import { Options, stateToHTML } from "draft-js-export-html";
import { ContentState } from "draft-js";

const orderedVttToHtmlConversions = [
    { from: "\n", to: "<br>" }
];

export const convertVttToHtml = (vtt: string): string => {
    let html = vtt;
    orderedVttToHtmlConversions.forEach(
        vttToHtml => html = html.replace(new RegExp(vttToHtml.from, "g"), vttToHtml.to)
    );
    return html;
};

const orderedHtmlToVttConversions = [
    { from: "\n<br/>", to: "\n" },
    { from: "\n<br>", to: "\n" },
    { from: "<br>", to: "\n" },
    { from: "<br/>", to: "\n" }
];

export const convertHtmlToVtt = (html: string): string => {
    let vtt = html;
    orderedHtmlToVttConversions.forEach(
        htmlToVtt => vtt = vtt.replace(new RegExp(htmlToVtt.from, "g"), htmlToVtt.to)
    );
    return vtt;
};

// @ts-ignore Cast to Options is needed, because "@types/draft-js-export-html" library doesn't allow null
// defaultBlockTag, but it is allowed in their docs: https://www.npmjs.com/package/draft-js-export-html#defaultblocktag
// TODO: if this would be updated in types definition, we can remove this explicit cast + ts-ignore
const convertToHtmlOptions = {
    inlineStyles: {
        BOLD: { element: "b" },
        ITALIC: { element: "i" },
    },
    defaultBlockTag: null
} as Options;

export const getVttText = (currentContent: ContentState): string => {
    const htmlText = !currentContent.hasText() ? "" : stateToHTML(currentContent, convertToHtmlOptions);
    return convertHtmlToVtt(htmlText);
};
