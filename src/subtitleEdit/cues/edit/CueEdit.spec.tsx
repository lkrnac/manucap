/**  * @jest-environment jsdom-sixteen  */
// TODO Remove above when we update to react-scripts with Jest 26:
// https://github.com/facebook/create-react-app/pull/8362
// eslint-disable-next-line
// https://stackoverflow.com/questions/61036156/react-typescript-testing-typeerror-mutationobserver-is-not-a-constructor#comment110029314_61039444

import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";

import { CueDto } from "../../model";
import { removeDraftJsDynamicValues } from "../../../testUtils/testUtils";
import { createTestingStore } from "../../../testUtils/testingStore";
import CueEdit from "./CueEdit";
import CueCategoryButton from "./CueCategoryButton";
import PositionButton from "./PositionButton";
import CueTextEditor from "./CueTextEditor";
import { CueActionsPanel } from "../cueLine/CueActionsPanel";
import TimeEditor from "./TimeEditor";
import { timecodesLockSlice } from "../timecodesSlices";

let testingStore = createTestingStore();

describe("CueView", () => {
    beforeEach(()=> {
        testingStore = createTestingStore();
    });
    it("renders with timecodes locked", () => {
        // GIVEN
        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex" }} className="sbte-bottom-border bg-white">
                    <div
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column", paddingBottom: "15px" }}>
                            <>
                                <div>00:00:01.000</div>
                                <div>00:00:02.000</div>
                            </>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <CueCategoryButton onChange={jest.fn()} category="DIALOGUE" />
                            <PositionButton vttCue={cue.vttCue} changePosition={jest.fn()} />
                        </div>
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                        <CueTextEditor
                            key={0}
                            index={0}
                            vttCue={cue.vttCue}
                            editUuid={cue.editUuid}
                            bindCueViewModeKeyboardShortcut={jest.fn()}
                            unbindCueViewModeKeyboardShortcut={jest.fn()}
                        />
                    </div>
                    <CueActionsPanel
                        index={0}
                        cue={cue}
                        isEdit
                        sourceCueIndexes={[]}
                    />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });

    it("renders with timecodes unlocked", () => {
        // GIVEN
        testingStore.dispatch(timecodesLockSlice.actions.unlockTimecodes(true));

        const cue = { vttCue: new VTTCue(1, 2, "Caption Line 1"), cueCategory: "DIALOGUE" } as CueDto;

        const expectedNode = render(
            <Provider store={testingStore}>
                <div style={{ display: "flex" }} className="sbte-bottom-border bg-white">
                    <div
                        style={{
                            flex: "1 1 300px",
                            display: "flex",
                            flexDirection: "column",
                            paddingLeft: "10px",
                            paddingTop: "5px",
                            justifyContent: "space-between"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection:"column", paddingBottom: "15px" }}>
                            <>
                                <TimeEditor time={cue.vttCue.startTime} onChange={jest.fn()} />
                                <TimeEditor time={cue.vttCue.endTime} onChange={jest.fn()} />
                            </>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <CueCategoryButton onChange={jest.fn()} category="DIALOGUE" />
                            <PositionButton vttCue={cue.vttCue} changePosition={jest.fn()} />
                        </div>
                    </div>
                    <div className="sbte-left-border" style={{ flex: "1 1 70%" }}>
                        <CueTextEditor
                            key={0}
                            index={0}
                            vttCue={cue.vttCue}
                            editUuid={cue.editUuid}
                            bindCueViewModeKeyboardShortcut={jest.fn()}
                            unbindCueViewModeKeyboardShortcut={jest.fn()}
                        />
                    </div>
                    <CueActionsPanel
                        index={0}
                        cue={cue}
                        isEdit
                        sourceCueIndexes={[]}
                    />
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueEdit index={0} cue={cue} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.container.outerHTML))
            .toEqual(removeDraftJsDynamicValues(expectedNode.container.outerHTML));
    });
});
