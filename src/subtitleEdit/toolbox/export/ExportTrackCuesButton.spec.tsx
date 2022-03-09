import "../../../testUtils/initBrowserEnvironment";
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Track } from "../../model";
import { fireEvent, render } from "@testing-library/react";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

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
       const expectedNode = render(
           <div
               id=""
               aria-expanded={false}
           >
               <button type="button" className="sbte-export-button btn btn-secondary">
                   <i className="fas fa-file-download fa-lg" />
               </button>
           </div>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ExportTrackCuesButton handleExport={jest.fn()} />
           </Provider>
       );

       // THEN
       const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
       const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
       expect(actual).toEqual(expected);
   });

    it("calls handleExport when clicked", () => {
        // GIVEN
        const mockHandleExport = jest.fn();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <ExportTrackCuesButton handleExport={mockHandleExport} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-export-button") as Element);

        // THEN
        expect(mockHandleExport).toHaveBeenCalledWith(testingTrack);
    });
});
