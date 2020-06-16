import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Track } from "../model";
import { callSaveTrack, setAutoSaveSuccess, setSaveTrack } from "../cues/saveSlices";
import _ from "lodash";

let testingStore = createTestingStore();

describe("CaptionOverlapToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    const saveTrack = jest.fn();
    beforeAll(() => {
        // @ts-ignore
        jest.spyOn(_, "debounce").mockReturnValue((cues) => { saveTrack(cues); });
    });
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="btn btn-secondary">
               <i className="fas fa-lock-open" /> Enable Overlapping
           </button>
       );

       // WHEN
       const actualNode = mount(
           <Provider store={testingStore}>
               <CaptionOverlapToggle />
           </Provider>
       );

       // THEN
       expect(actualNode.html()).toEqual(expectedNode.html());
   });

    it("changes icon on toggle", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="btn btn-secondary sbte-toggled-btn">
                <i className="fas fa-lock" /> Disable Overlapping
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("changes icon back on double toggle", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="btn btn-secondary">
                <i className="fas fa-lock-open" /> Enable Overlapping
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );
        actualNode.find("ToggleButton").simulate("click");
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("toggles overlap caption flag in store on toggle", () => {
        // GIVEN
        const testingTrack = {
            type: "CAPTION",
            language: { id: "en-US" },
            default: true,
            overlapEnabled: false
        } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(testingStore.getState().editingTrack.overlapEnabled).toEqual(true);
    });

    it("disables button while saving", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find("button").props().disabled).toBeTruthy();
    });

    it("enables button after successful save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);
        testingStore.dispatch(setAutoSaveSuccess(true) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find("button").props().disabled).toBeFalsy();
    });

    it("enables button after failed save", () => {
        // GIVEN
        const testingTrack = { type: "CAPTION", language: { id: "en-US" }, default: true } as Track;
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(callSaveTrack() as {} as AnyAction);
        testingStore.dispatch(setAutoSaveSuccess(false) as {} as AnyAction);
        actualNode.update();

        // THEN
        expect(actualNode.find("button").props().disabled).toBeFalsy();
    });
});
