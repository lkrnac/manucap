import "../../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import ExportSourceTrackCuesButton from "./ExportSourceTrackCuesButton";
import { fireEvent, render } from "@testing-library/react";
import { mdiExport } from "@mdi/js";
import Icon from "@mdi/react";

let testingStore = createTestingStore();

describe("ExportSourceTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

   it("renders", () => {
       // GIVEN
       const expectedNode = render(
           <button
               id="exportSourceFileBtn"
               type="button"
               className="mc-export-source-button mc-btn mc-btn-light"
               data-pr-tooltip="Export Source File"
               data-pr-position="top"
               data-pr-at="center+2 top-2"
           >
               <Icon path={mdiExport} size={1.25} />
           </button>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ExportSourceTrackCuesButton handleExport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
   });

    it("calls handleExport when clicked", () => {
        // GIVEN
        const mockHandleExport = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <ExportSourceTrackCuesButton handleExport={mockHandleExport} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".mc-export-source-button") as Element);

        // THEN
        expect(mockHandleExport).toHaveBeenCalled();
    });
});
