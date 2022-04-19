import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../../model";
import PlayCueButton from "./PlayCueButton";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

const testCue = { vttCue: new VTTCue(2, 3, "some text"), cueCategory: "DIALOGUE" } as CueDto;

describe("PlayCueButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="tw-p-1.5">
                <button
                    id="playCueButton-1"
                    style={{ maxHeight: "38px" }}
                    className="tw-btn tw-btn-outline-secondary tw-w-full"
                    data-pr-tooltip="Play this subtitle (Ctrl/Alt + Shift + k)"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <i className="fa fa-play" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} cueIndex={1} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("plays cue when play cue button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <PlayCueButton cue={testCue} cueIndex={1} />
            </Provider>
        );

        // WHEN
        actualNode.find("button").simulate("click");

        // THEN
        expect(testingStore.getState().videoSectionToPlay).toEqual({ startTime: 2, endTime: 3 });
    });
});
