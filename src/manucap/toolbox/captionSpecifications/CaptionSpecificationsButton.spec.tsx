import "../../../testUtils/initBrowserEnvironment";

import "video.js";
import { Provider } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";
import { mdiClipboardText } from "@mdi/js";
import Icon from "@mdi/react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { CaptionSpecification } from "../model";
import CaptionSpecificationsButton from "./CaptionSpecificationsButton";
import { readCaptionSpecification } from "./captionSpecificationSlice";
import { createTestingStore } from "../../../testUtils/testingStore";
import { updateCues } from "../../cues/cuesList/cuesListActions";
import { CueDto } from "../../model";

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
        const expectedNode = render(
            <Provider store={testingStore}>
                <button
                    id="captionSpecsBtn"
                    className="mc-caption-specifications-button mc-btn mc-btn-light"
                    data-pr-tooltip="Caption Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <Icon path={mdiClipboardText} size={1.25} />
                </button>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        const button = actualNode.container.querySelector("button.mc-caption-specifications-button")!;
        fireEvent.click(button);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toBeVisible();
    });

    it("renders with hidden modal", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <button
                    id="captionSpecsBtn"
                    className="mc-caption-specifications-button mc-btn mc-btn-light"
                    data-pr-tooltip="Caption Specifications"
                    data-pr-position="top"
                    data-pr-at="center+2 top-2"
                >
                    <Icon path={mdiClipboardText} size={1.25} />
                </button>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toEqual(null);
    });

    it("opens caption specifications modal when button is clicked", () => {
        // GIVEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton/>
            </Provider>
        );

        // WHEN
        const button = actualNode!.container.querySelector("button.mc-caption-specifications-button")!;
        fireEvent.click(button);

        // THEN
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toBeVisible();
    });

    it("Hides caption button if caption specification is null", () => {
         // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(actualNode.container.querySelectorAll("button[hidden]").length).toEqual(1);
    });

    it("Auto shows caption specification if cues are empty", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toBeVisible();
    });

    it("Does auto show caption specification if cues are not empty", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toBeVisible();
    });

    it("Does not auto show caption specification if caption specification is null", () => {
        // WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toEqual(null);
    });

    it("Does not auto show caption specification if enabled is false", () => {
        // WHEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: false } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        render(
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );

        // THEN
        expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toEqual(null);
    });

    it("Auto shows caption specification only once even with cues change", async () => {
        // GIVEN
        testingStore.dispatch(
            readCaptionSpecification({ enabled: true } as CaptionSpecification) as {} as AnyAction
        );
        // @ts-ignore passing empty
        testingStore.dispatch(updateCues([]) as {} as AnyAction);

        const component = (
            <Provider store={testingStore}>
                <CaptionSpecificationsButton />
            </Provider>
        );
        const actualNode = render(component);
        const button = document.documentElement.querySelector(".mc-caption-specifications-close")!;
        fireEvent.click(button);

        //WHEN
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        actualNode.rerender(component);

        // THEN
        await waitFor(() => {
            expect(document.documentElement.querySelector(".mc-caption-specifications-modal")).toEqual(null);
        });
    });
});
