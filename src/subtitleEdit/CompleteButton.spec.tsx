import "../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import CompleteButton from "./CompleteButton";
import { createTestingStore } from "../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Track } from "./model";
import { updateCues } from "./cues/cueSlices";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();

describe("CompleteButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="btn btn-primary sbte-complete-subtitle-btn">
               Complete
           </button>
       );

       // WHEN
       const actualNode = mount(
           <Provider store={testingStore}>
               <CompleteButton onComplete={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.html()).toEqual(expectedNode.html());
   });

    it("calls handleExport when clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={mockOnComplete} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-complete-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });
});
