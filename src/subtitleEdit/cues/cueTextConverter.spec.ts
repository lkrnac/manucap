import { convertHtmlToVtt, convertVttToHtml } from "./cueTextConverter";
import each from "jest-each";

describe("cueTextConverter", () => {
    describe("convertVttToHtml", () => {
        each([
            ["text", "text"],
            ["\ntext", "<br>text"],
            ["text\n", "text<br>"],
            ["text\n\n", "text<br><br>"],
            ["t\next\n", "t<br>ext<br>"],
            ["<i>te\nxt</i>", "<i>te<br>xt</i>"],
            ["<i><b>te\n</b>xt</i>", "<i><b>te<br></b>xt</i>"],
        ]).it("converts vtt '%s' to html", (vtt: string, expectedHtml: string) => {
            // WHEN
            const actualHtml = convertVttToHtml(vtt);

            // THEN
            expect(actualHtml).toEqual(expectedHtml);
        });
    });

    describe("convertHtmlToVtt", () => {
        each([
            ["text", "text"],
            ["<br>text", "\ntext"],
            ["text<br>", "text\n"],
            ["text<br/>", "text\n"],
            ["text\n<br>", "text\n"],
            ["text\n<br/>", "text\n"],
            ["text<br><br>", "text\n\n"],
            ["text\n<br>\n<br>", "text\n\n"],
            ["text<br>\n\n<br>", "text\n\n\n"],
            ["text\n<br/>\n<br/>", "text\n\n"],
            ["text<br/>\n\n<br/>", "text\n\n\n"],
            ["text<br/><br/>", "text\n\n"],
            ["text<br><br>", "text\n\n"],
            ["text<br>\n<br><br/>\n<br/>", "text\n\n\n\n"],
            ["text\n<br>\n<br><br/>\n<br/>", "text\n\n\n\n"],
            ["t<br>ext<br>", "t\next\n"],
            ["<i>te<br>xt</i>", "<i>te\nxt</i>"],
            ["<i><b>te<br></b>xt</i>", "<i><b>te\n</b>xt</i>"],
        ]).it("converts html '%s' to vtt", (vtt: string, expectedHtml: string) => {
            // WHEN
            const actualHtml = convertHtmlToVtt(vtt);

            // THEN
            expect(actualHtml).toEqual(expectedHtml);
        });
    });
});
