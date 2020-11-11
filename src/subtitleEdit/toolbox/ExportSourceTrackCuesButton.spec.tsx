import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import ExportSourceTrackCuesButton from "./ExportSourceTrackCuesButton";

let testingStore = createTestingStore();

describe("ExportSourceTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="sbte-export-source-button btn btn-secondary">
               <i className="fas fa-file-export" /> Export Source File
           </button>
       );

       // WHEN
       const actualNode = mount(
           <Provider store={testingStore}>
               <ExportSourceTrackCuesButton handleExport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.html()).toEqual(expectedNode.html());
   });

    it("calls handleExport when clicked", () => {
        // GIVEN
        const mockHandleExport = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <ExportSourceTrackCuesButton handleExport={mockHandleExport} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-export-source-button").simulate("click");

        // THEN
        expect(mockHandleExport).toHaveBeenCalled();
    });
});
