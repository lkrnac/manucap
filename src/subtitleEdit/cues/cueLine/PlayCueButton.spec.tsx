import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../../model";
import PlayCueButton from "./PlayCueButton";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

const testCue = { vttCue: new VTTCue(2, 3, "some text"), cueCategory: "DIALOGUE" } as CueDto;

describe("PlayCueButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                className="tw-p-1.5"
                id=""
                aria-expanded="false"
            >
                <button
                    style={{ maxHeight: "38px" }}
                    className="btn btn-outline-secondary tw-w-full"
                >
                    <i className="fa fa-play" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} />
            </Provider>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("plays cue when play cue button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} />
            </Provider>
        );

        // WHEN
        actualNode.find("button").simulate("click");

        // THEN
        expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 2, endTime: 3 });
    });
});
