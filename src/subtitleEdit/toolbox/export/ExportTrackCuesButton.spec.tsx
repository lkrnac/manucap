import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Track } from "../../model";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
    timecodesUnlocked: true
} as Track;

let testingStore = createTestingStore();

describe("ExportTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="sbte-export-button btn btn-secondary">
               <i className="fas fa-file-export" /> Export File
           </button>
       );

       // WHEN
       const actualNode = mount(
           <Provider store={testingStore}>
               <ExportTrackCuesButton handleExport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.html()).toEqual(expectedNode.html());
   });

    it("calls handleExport when clicked", () => {
        // GIVEN
        const mockHandleExport = jest.fn();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <ExportTrackCuesButton handleExport={mockHandleExport} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-export-button").simulate("click");

        // THEN
        expect(mockHandleExport).toHaveBeenCalledWith(testingTrack);
    });
});
