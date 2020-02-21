import "../../../testUtils/initBrowserEnvironment";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import ShiftTimeButton from "./ShiftTimeButton";
import ShiftTimeModal from "./ShiftTimeModal";
import { mount } from "enzyme";
import testingStore from "../../../testUtils/testingStore";

jest.mock("./ShiftTimeModal");

// @ts-ignore We are mocking module
ShiftTimeModal.mockImplementation(({ show }): ReactElement => show ? <div>shown</div> : <div />);

describe("ShiftTimeButton", () => {
    it("renders with shown modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <button
                        style={{ marginLeft: "10px" }}
                        type="button"
                        className="dotsub-shift-time-button btn btn-light"
                    >
                        Shift All Tracks Time
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
                        style={{ marginLeft: "10px" }}
                        type="button"
                        className="dotsub-shift-time-button btn btn-light"
                    >
                        Shift All Tracks Time
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

    it("opens subtitle specifications modal when button is clicked", () => {
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

    it("closes subtitle specifications modal when close button is clicked", () => {
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
});
