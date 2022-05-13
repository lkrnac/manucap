import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { ContentState, EditorState, convertFromHTML } from "draft-js";
import CueLineCounts from "./CueLineCounts";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

const testContentRendered = (
    text: string,
    startTime: number,
    endTime: number,
    duration: number,
    characters: number,
    words: number,
    cps: number
): void => {
    // GIVEN
    const processedHTML = convertFromHTML(text);
    const contentState = ContentState.createFromBlockArray(processedHTML.contentBlocks);
    const editorState = EditorState.createWithContent(contentState);

    const vttCue = new VTTCue(startTime, endTime, text);
    const expectedNode = mount(
        <div className="tw-text-sm" style={{ paddingLeft: "5px", paddingTop: "10px" }}>
            <span>DURATION: <span className="tw-text-green-light">{duration}s</span>, </span>
            <span>CHARACTERS: <span className="tw-text-green-light">{characters}</span>, </span>
            <span>WORDS: <span className="tw-text-green-light">{words}</span>, </span>
            <span>CPS: <span className="tw-text-green-light">{cps.toFixed(1)}</span></span>
        </div>
    );

    // WHEN
    const actualNode = mount(
        <Provider store={testingStore}>
            <CueLineCounts cueIndex={0} vttCue={vttCue} editorState={editorState} />
        </Provider>
    );

    // THEN
    expect(actualNode.html()).toEqual(expectedNode.html());
};

describe("CueLineCounts", () => {
    it("renders", () => {
        testContentRendered("", 0, 1,1, 0, 0, 0);
    });

    it("renders with text", () => {
        testContentRendered("i am a subtitle line", 0, 1, 1, 20, 5, 20);
    });

    it("renders with text and line breaks, spaces and tabs ", () => {
        testContentRendered("    this is      sample <br>" +
            "     text with      multiple        blanks", 0, 1, 1, 62, 7, 62);
    });

    it("renders with html", () => {
        testContentRendered("i <i>am</i> <b>a subtitle</b> line", 0, 1, 1, 20, 5, 20);
    });

    it("renders with long text and duration", () => {
        testContentRendered("" +
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum vestibulum ligula in fermen tum.<br>" +
            "Etiam semper tristique sapien, ac viverra sem sodales eget. Quisque rutrum ipsum eu justo semper,<br>" +
            "mattis bibendum sapien tincidunt. Nullam quis metus ut arcu pulvinar eleifend.",
            15,
            3898.45,
            3883.45,
            275,
            40,
            .1);
    });
});
