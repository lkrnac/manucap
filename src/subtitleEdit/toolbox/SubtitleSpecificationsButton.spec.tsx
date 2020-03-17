import "../../testUtils/initBrowserEnvironment";

import React, { ReactElement } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import { mount } from "enzyme";
import { readSubtitleSpecification } from "./subtitleSpecificationSlice";
import testingStore from "../../testUtils/testingStore";

jest.mock("./SubtitleSpecificationsModal");

// @ts-ignore We are mocking module
SubtitleSpecificationsModal.mockImplementation(({ show }): ReactElement => show ? <div>shown</div> : <div />);

describe("SubtitleSpecificationsButton", () => {
    it("renders with shown modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <>
                    <button
                        style={{ marginLeft: "10px" }}
                        type="button"
                        className="dotsub-subtitle-specifications-button btn btn-secondary"
                    >
                        Subtitle Specifications
                    </button>

                    <div>shown</div>
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");

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
                        className="dotsub-subtitle-specifications-button btn btn-secondary"
                    >
                        Subtitle Specifications
                    </button>

                    <div />
                </>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );
        testingStore.dispatch(
            readSubtitleSpecification({ enabled: false } as SubtitleSpecification) as {} as AnyAction
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("opens subtitle specifications modal when button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(true);
    });

    it("closes subtitle specifications modal when close button is clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");
        actualNode.find(SubtitleSpecificationsModal).props().onClose();
        actualNode.update();

        // THEN
        expect(actualNode.find(SubtitleSpecificationsModal).props().show).toEqual(false);
    });
});
