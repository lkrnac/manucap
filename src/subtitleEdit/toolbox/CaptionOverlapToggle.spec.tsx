import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import CaptionOverlapToggle from "./CaptionOverlapToggle";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";

let testingStore = createTestingStore();

describe("CaptionOverlapToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
   it("renders", () => {
       // GIVEN
       const expectedNode = shallow(
           <button type="button" className="btn btn-secondary">
               <i className="fas fa-lock-open" /> Allow Overlapping Captions
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
                <i className="fas fa-lock" /> Prevent Overlapping Captions
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
                <i className="fas fa-lock-open" /> Allow Overlapping Captions
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
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionOverlapToggle />
            </Provider>
        );

        // WHEN
        actualNode.find("ToggleButton").simulate("click");

        // THEN
        expect(testingStore.getState().overlapCaptions).toEqual(true);
    });
});
