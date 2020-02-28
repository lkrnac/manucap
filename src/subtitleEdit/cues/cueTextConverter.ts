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
    { from: "<br/>\n", to: "\n" },
    { from: "<br>\n", to: "\n" },
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

