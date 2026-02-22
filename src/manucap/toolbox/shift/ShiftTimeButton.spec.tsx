import "../../../testUtils/initBrowserEnvironment";

import { AnyAction } from "redux";
import { Provider } from "react-redux";
import Icon from "@mdi/react";
import { mdiArrowLeftRight } from "@mdi/js";
import { fireEvent, render } from "@testing-library/react";

import ShiftTimeButton from "./ShiftTimeButton";
import testingStore from "../../../testUtils/testingStore";
import { updateEditingTrack } from "../../trackSlices";
import { Language, Track } from "../../model";

const testTrack = {
    type: "CAPTION",
    mediaTitle: "testingTrack",
    language: { id: "en-US", name: "English", direction: "LTR" },
    timecodesUnlocked: true
};

const testTranslationTrack = {
    type: "TRANSLATION",
    language: { id: "fr-FR", name: "French (France)" } as Language,
    sourceLanguage: { id: "en-US", name: "English (US)" } as Language,
    default: true,
    mediaTitle: "This is the video title",
    mediaLength: 4000,
} as Track;

describe("ShiftTimeButton", () => {
    beforeEach(() => {
        testingStore.dispatch(updateEditingTrack(testTrack as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    title="Unlock timecodes to enable"
                >
                    <Icon path={mdiArrowLeftRight} size={1.25} />
                    <span className="pl-4">Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );
        const button = actualNode.container.querySelector("button.mc-shift-time-button")!;
        fireEvent.click(button);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders enabled if timecodes are locked but track is caption", () => {
        // GIVEN
        const expectedNode = render(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    title="Unlock timecodes to enable"
                >
                    <Icon path={mdiArrowLeftRight} size={1.25} />
                    <span className="pl-4">Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("renders disabled if timecodes are locked and track is translation", () => {
        // GIVEN
        testingStore.dispatch(
            updateEditingTrack( { ...testTranslationTrack, timecodesUnlocked: false } as Track) as {} as AnyAction);
        const expectedNode = render(
            <Provider store={testingStore}>
                <button
                    className="mc-shift-time-button flex items-center"
                    disabled
                    title="Unlock timecodes to enable"
                >
                    <Icon path={mdiArrowLeftRight} size={1.25} />
                    <span className="pl-4">Shift Track Time</span>
                </button>
            </Provider>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <ShiftTimeButton onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
});
