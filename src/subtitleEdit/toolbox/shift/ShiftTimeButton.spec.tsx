import "../../../testUtils/initBrowserEnvironment";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import ShiftTimeButton from "./ShiftTimeButton";
import ShiftTimeModal from "./ShiftTimeModal";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { Track } from "../../model";
import { AnyAction } from "redux";

jest.mock("./ShiftTimeModal");

// @ts-ignore We are mocking module
ShiftTimeModal.mockImplementation(({ show }): ReactElement => show ? <div>shown</div> : <div />);

const testTrack = {
    mediaTitle: "testingTrack",
    language: { id: "en-US", name: "English", direction: "LTR" },
    timecodesUnlocked: true
};

describe("ShiftTimeButton", () => {
    beforeEach(() => {
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });
    it("renders with shown modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <button
                        type="button"
                        className="btn btn-secondary dotsub-shift-time-button"
                    >
                        <i className="fas fa-angle-double-right" /> Shift All Tracks Time
                    </button>

                    <div>shown</div>
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton />
            </Provider>
        );
        actualNode.find("button.dotsub-shift-time-button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with hidden modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <button
                        type="button"
                        className="btn btn-secondary dotsub-shift-time-button"
                    >
                        <i className="fas fa-angle-double-right" /> Shift All Tracks Time
                    </button>

                    <div />
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("opens shift time modal when button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-shift-time-button").simulate("click");

        // THEN
        expect(actualNode.find(ShiftTimeModal).props().show).toEqual(true);
    });

    it("closes shift time modal when close button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-shift-time-button").simulate("click");
        actualNode.find(ShiftTimeModal).props().onClose();
        actualNode.update();

        // THEN
        expect(actualNode.find(ShiftTimeModal).props().show).toEqual(false);
    });

    it("renders disabled if timecodes are locked", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack( { ...testTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <button
                        type="button"
                        className="btn btn-secondary dotsub-shift-time-button"
                        disabled
                    >
                        <i className="fas fa-angle-double-right" /> Shift All Tracks Time
                    </button>

                    <div />
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <ShiftTimeButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
