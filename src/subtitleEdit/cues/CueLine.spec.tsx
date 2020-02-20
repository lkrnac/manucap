import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../model";
import CueEditLine from "./edit/CueEditLine";
import CueLine from "./CueLine";
import CueViewLine from "./view/CueViewLine";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import testingStore from "../../testUtils/testingStore";
import { updateEditingCueIndex } from "./cueSlices";

const cues = [
    { vttCue: new VTTCue(0, 0, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

describe("CueLine", () => {
    it("renders edit line", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            flex: "1 1 20px",
                            paddingLeft: "8px",
                            paddingTop: "10px",
                        }}
                    >
                        2
                    </div>
                    <CueEditLine index={1} cue={cues[1]} playerTime={0} />
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders view line", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px" }}>
                    <div
                        className="sbte-cue-line-flap"
                        style={{
                            flex: "1 1 20px",
                            paddingLeft: "8px",
                            paddingTop: "10px",
                        }}
                    >
                        2
                    </div>
                    <CueViewLine index={1} cue={cues[1]} playerTime={0} />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("passes down properties", () => {
        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={1} />
            </Provider>
        );

        // THEN
        const actualProps = actualNode.find(CueViewLine).props();
        expect(actualProps.index).toEqual(1);
        expect(actualProps.cue).toEqual(cues[1]);
        expect(actualProps.playerTime).toEqual(1);
    });
});
