import "../../testUtils/initBrowserEnvironment";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";

let testingStore = createTestingStore();

describe("ImportTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = render(
           <button type="button" className="sbte-import-button btn btn-secondary">
               <i className="fas fa-file-import fa-lg" />
           </button>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ImportTrackCuesButton handleImport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
   });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" disabled className="sbte-import-button btn btn-secondary">
                <i className="fas fa-file-import fa-lg" />
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={jest.fn()} disabled />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("calls handleImport when clicked", () => {
        // GIVEN
        const mockHandleImport = jest.fn();
        const actualNode = render(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={mockHandleImport} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".sbte-import-button") as Element);

        // THEN
        expect(mockHandleImport).toHaveBeenCalled();
    });
});
