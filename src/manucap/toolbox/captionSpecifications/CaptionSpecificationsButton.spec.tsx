import "../../../testUtils/initBrowserEnvironment";

import { ReactElement } from "react";
import { AnyAction } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { CaptionSpecification } from "../model";
import CaptionSpecificationsButton from "./CaptionSpecificationsButton";
import CaptionSpecificationsModal from "./CaptionSpecificationsModal";
import { mount, ReactWrapper } from "enzyme";
import { readCaptionSpecification } from "./captionSpecificationSlice";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { CueDto } from "../../model";
import "video.js";
import { act } from "react-dom/test-utils";

jest.mock("./CaptionSpecificationsModal");

// @ts-ignore We are mocking module
CaptionSpecificationsModal.mockImplementation(({ show }): ReactElement => show ? <div>shown</div> : <div />);

const cues = [
    { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
] as CueDto[];
let testingStore = createTestingStore();

describe("CaptionSpecificationsButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders with shown modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    id="captionSpecsBtn"
                    className="mc-caption-specifications-button mc-btn mc-btn-light"
                    data-pr-tooltip="Caption Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <i className="fa-duotone fa-clipboard-list fa-lg" />
                </button>
                <div>shown</div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        actualNode.find("button.mc-caption-specifications-button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with hidden modal", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <button
                    id="captionSpecsBtn"
                    className="mc-caption-specifications-button mc-btn mc-btn-light"
                    data-pr-tooltip="Caption Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <i className="fa-duotone fa-clipboard-list fa-lg" />
                </button>
                <div />
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("opens caption specifications modal when button is clicked", () => {
        // GIVEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // WHEN
        actualNode.find("button.mc-caption-specifications-button")
            .simulate("click");

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(true);
    });

    it("closes caption specifications modal when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        let actualNode = {} as ReactWrapper;
        act(() => {
            actualNode = mount(
                <Provider store={testingStore}>
                    <CaptionSpecificationsButton />
                </Provider>
            );
        });

        // WHEN
        act(() => {
            actualNode.find("button.mc-caption-specifications-button").simulate("click");
            actualNode.find(CaptionSpecificationsModal).props().onClose();
        });

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(false);
    });

    it("Hides caption button if caption specification is null", () => {
         // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find("button[hidden]").length).toEqual(1);
    });

    it("Auto shows caption specification if cues are empty", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(true);
    });

    it("Does auto show caption specification if cues are not empty", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(true);
    });

    it("Does not auto show caption specification if caption specification is null", () => {
        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(false);
    });

    it("Does not auto show caption specification if enabled is false", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(false);
    });

    it("Auto shows caption specification only once even with cues change", () => {
        // GIVEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        let actualNode = {} as ReactWrapper;
        act(() => {
             actualNode = mount(
                 <Provider store={testingStore}>
                     <CaptionSpecificationsButton />
                 </Provider>
            );
            actualNode.find(CaptionSpecificationsModal).props().onClose();
        });

        //WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        // THEN
        expect(actualNode.find(CaptionSpecificationsModal).props().show).toEqual(false);
    });
});
