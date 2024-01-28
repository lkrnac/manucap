import "../../testUtils/initBrowserEnvironment";
import { Provider } from "react-redux";
import { fireEvent, render } from "@testing-library/react";
import { createTestingStore } from "../../testUtils/testingStore";
import WaveformToggle from "./WaveformToggle";
import Icon from "@mdi/react";
import { mdiWaveform } from "@mdi/js";

let testingStore = createTestingStore();

describe("WaveformToggle", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <button type="button" className="flex items-center justify-between outline-0 active">
                <span className="flex items-center">
                    <Icon path={mdiWaveform} size={1.25} />
                    <span className="pl-4">Waveform</span>
                </span>
                <span className="mc-badge font-medium mc-badge-sm mc-badge-success">SHOWN</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle onClick={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("changes icon/text on toggle", () => {
        // GIVEN
        const expectedNode = render(
            <button
                type="button"
                className="flex items-center justify-between"
            >
                <span className="flex items-center">
                    <Icon path={mdiWaveform} size={1.25} />
                    <span className="pl-4">Waveform</span>
                </span>
                <span className="mc-badge font-medium mc-badge-sm mc-badge-secondary">HIDDEN</span>
            </button>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle onClick={jest.fn()} />
            </Provider>
        );

        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("toggles waveform in store on toggle", () => {
        // GIVEN
        const actualNode = render(
            <Provider store={testingStore}>
                <WaveformToggle onClick={jest.fn()} />
            </Provider>
        );

        // WHEN
        fireEvent.click(actualNode.container.querySelector("button") as Element);

        // THEN
        expect(testingStore.getState().waveformVisible).toEqual(false);
    });
});
