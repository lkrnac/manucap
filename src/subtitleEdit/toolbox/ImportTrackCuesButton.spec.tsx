import "../../testUtils/initBrowserEnvironment";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { removeHeadlessAttributes } from "../../testUtils/testUtils";

let testingStore = createTestingStore();

describe("ImportTrackCuesButton", () => {
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
               <button type="button" className="sbte-import-button btn btn-secondary">
                   <i className="fas fa-file-import fa-lg" />
               </button>
           </div>
       );

       // WHEN
       const actualNode = render(
           <Provider store={testingStore}>
               <ImportTrackCuesButton handleImport={jest.fn()} />
           </Provider>
       );

       // THEN
       const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
       const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
       expect(actual).toEqual(expected);
   });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = render(
            <div
                id=""
                aria-expanded={false}
            >
                <button type="button" disabled className="sbte-import-button btn btn-secondary">
                    <i className="fas fa-file-import fa-lg" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={jest.fn()} disabled />
            </Provider>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.container.outerHTML);
        const expected = removeHeadlessAttributes(expectedNode.container.outerHTML);
        expect(actual).toEqual(expected);
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
