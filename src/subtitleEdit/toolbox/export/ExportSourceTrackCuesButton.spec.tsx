import "../../../testUtils/initBrowserEnvironment";
import { createTestingStore } from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import ExportSourceTrackCuesButton from "./ExportSourceTrackCuesButton";
import { fireEvent, render } from "@testing-library/react";

let testingStore = createTestingStore();

describe("ExportSourceTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = render(
           <button type="button" className="sbte-export-source-button btn btn-secondary">
               <i className="fas fa-file-export fa-lg" />
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
        fireEvent.click(actualNode.container.querySelector(".sbte-export-source-button") as Element);

        // THEN
        expect(mockHandleExport).toHaveBeenCalled();
    });
});
