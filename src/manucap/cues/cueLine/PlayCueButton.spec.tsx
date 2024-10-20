import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../../model";
import PlayCueButton from "./PlayCueButton";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { mdiPlay } from "@mdi/js";
import Icon from "@mdi/react";

const testCue = { vttCue: new VTTCue(2, 3, "some text"), cueCategory: "DIALOGUE" } as CueDto;

describe("PlayCueButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="p-1.5">
                <button
                    id="playCueButton-1"
                    style={{ maxHeight: "38px" }}
                    className="mc-btn mc-btn-primary w-full mc-btn-sm"
                    data-pr-tooltip="Play this caption (Ctrl/Alt + Shift + k)"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <Icon path={mdiPlay} size={1} />
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
