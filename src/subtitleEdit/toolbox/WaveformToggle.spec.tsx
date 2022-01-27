import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import WaveformToggle from "./WaveformToggle";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("WaveformToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary sbte-toggled-btn">
                <i className="fas fa-wave-square" /> Show Waveform
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon/text on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="btn btn-secondary">
                <i className="fas fa-wave-square" /> Hide Waveform
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle />
            </Provider>
        );
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles waveform in store on toggle", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector(".btn") as Element);

        // THEN
        expect(testingStore.getState().waveformVisible).toEqual(true);
    });
});
