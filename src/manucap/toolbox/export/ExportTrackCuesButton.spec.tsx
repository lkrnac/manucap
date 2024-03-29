import "../../../testUtils/initBrowserEnvironment";
import ExportTrackCuesButton from "./ExportTrackCuesButton";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "../../trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { Track } from "../../model";
import { fireEvent, render } from "@testing-library/react";
import { mdiDownload } from "@mdi/js";
import Icon from "@mdi/react";

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
           <button
               id="exportFileBtn"
               className="mc-export-button mc-btn mc-btn-light"
               data-pr-tooltip="Export File"
               data-pr-position="top"
               data-pr-at="center+2 top-2"
           >
               <Icon path={mdiDownload} size={1.25} />
           </button>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ExportTrackCuesButton handleExport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
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
        fireEvent.click(actualNode.container.querySelector(".mc-export-button") as Element);

        // THEN
        expect(mockHandleExport).toHaveBeenCalledWith(testingTrack);
    });
});
