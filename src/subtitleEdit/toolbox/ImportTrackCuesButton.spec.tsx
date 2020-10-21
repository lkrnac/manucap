import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import ImportTrackCuesButton from "./ImportTrackCuesButton";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";

let testingStore = createTestingStore();

describe("ImportTrackCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="sbte-import-button btn btn-secondary">
               <i className="fas fa-file-import" /> Import File
           </button>
       );

       // WHEN
       const actualNode = mount(
           <Provider store={testingStore}>
               <ImportTrackCuesButton handleImport={jest.fn()} />
           </Provider>
       );

       // THEN
       expect(actualNode.html()).toEqual(expectedNode.html());
   });

    it("renders disabled", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" disabled className="sbte-import-button btn btn-secondary">
                <i className="fas fa-file-import" /> Import File
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={jest.fn()} disabled />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls handleImport when clicked", () => {
        // GIVEN
        const mockHandleImport = jest.fn();
        const actualNode = mount(
            <Provider store={testingStore}>
                <ImportTrackCuesButton handleImport={mockHandleImport} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-import-button").simulate("click");

        // THEN
        expect(mockHandleImport).toHaveBeenCalled();
    });
});
