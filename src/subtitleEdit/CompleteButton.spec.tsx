import "../testUtils/initBrowserEnvironment";
import { mount } from "enzyme";
import CompleteButton from "./CompleteButton";
import { createTestingStore } from "../testUtils/testingStore";
import { Provider } from "react-redux";
import { updateEditingTrack } from "./trackSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { CueDto, Track } from "./model";
import { updateCues } from "./cues/cuesList/cuesListActions";
import { SaveState, saveActionSlice, setSaveTrack } from "./cues/saveSlices";
import each from "jest-each";

const testingTrack = {
    type: "CAPTION",
    language: { id: "en-US" },
    default: true,
} as Track;

const cues = [
    { vttCue: new VTTCue(0, 1, "Caption Line 1"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(1, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
] as CueDto[];

let testingStore = createTestingStore();

describe("CompleteButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    const saveTrack = jest.fn();
    beforeEach(() => {
        // GIVEN
        saveTrack.mockReset();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
    });

    it("renders for save state NONE", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="tw-space-x-4 tw-flex tw-items-center">
                    <div className="tw-font-bold">
                        <span hidden className="tw-flex tw-items-center ">
                            <span className="tw-leading-none"> &nbsp;</span>
                            <i className="" />
                        </span>
                    </div>
                    <button type="button" className="tw-btn tw-btn-primary sbte-complete-subtitle-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with disabled property and save state NONE", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="tw-space-x-4 tw-flex tw-items-center">
                    <div className="tw-font-bold">
                        <span className="text-success">
                            Edits are disabled, task is already completed
                        </span>
                    </div>
                    <button type="button" disabled className="tw-btn tw-btn-primary sbte-complete-subtitle-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} disabled />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    each([
        [ SaveState.TRIGGERED ],
        [ SaveState.REQUEST_SENT ],
        [ SaveState.RETRY ],
    ])
        .it("renders save pending for save state '%s'", (testingState: SaveState) => {
            // GIVEN
            testingStore.dispatch(saveActionSlice.actions.setState(
                { saveState: testingState, multiCuesEdit: false }
            ) as {} as AnyAction);
            const expectedNode = mount(
                <Provider store={testingStore}>
                    <div className="tw-space-x-4 tw-flex tw-items-center">
                        <div className="tw-font-bold">
                            <span className="tw-flex tw-items-center ">
                                <span className="tw-leading-none">Saving changes &nbsp;</span>
                                <i className="fas fa-sync fa-spin" />
                            </span>
                        </div>
                        <button type="button" disabled className="tw-btn tw-btn-primary sbte-complete-subtitle-btn">
                            Complete
                        </button>
                    </div>
                </Provider>
            );

            // WHEN
            const actualNode = mount(
                <Provider store={testingStore}>
                    <CompleteButton onComplete={jest.fn()} />
                </Provider>
            );

            // THEN
            expect(actualNode.html()).toEqual(expectedNode.html());
        });

    it("renders save succeeded for save state SAVED", () => {
        // GIVEN
        testingStore.dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.SAVED, multiCuesEdit: false }
        ) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="tw-space-x-4 tw-flex tw-items-center">
                    <div className="tw-font-bold">
                        <span className="tw-flex tw-items-center text-success">
                            <span className="tw-leading-none">All changes saved to server &nbsp;</span>
                            <i className="fa fa-check-circle" />
                        </span>
                    </div>
                    <button type="button" className="tw-btn tw-btn-primary sbte-complete-subtitle-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders save succeeded for save state ERROR", () => {
        // GIVEN
        testingStore.dispatch(saveActionSlice.actions.setState(
            { saveState: SaveState.ERROR, multiCuesEdit: false }
        ) as {} as AnyAction);
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div className="tw-space-x-4 tw-flex tw-items-center">
                    <div className="tw-font-bold">
                        <span className="tw-flex tw-items-center text-danger">
                            <span className="tw-leading-none">Error saving latest changes &nbsp;</span>
                            <i className="fa fa-exclamation-triangle" />
                        </span>
                    </div>
                    <button type="button" className="tw-btn tw-btn-primary sbte-complete-subtitle-btn">
                        Complete
                    </button>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={jest.fn()} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls onComplete when clicked", () => {
        // GIVEN
        const mockOnComplete = jest.fn();
        testingStore.dispatch(updateEditingTrack(testingTrack) as {} as AnyAction);
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <CompleteButton onComplete={mockOnComplete} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-complete-subtitle-btn").simulate("click");

        // THEN
        expect(mockOnComplete).toHaveBeenCalledWith(
            { editingTrack: testingStore.getState().editingTrack, cues: testingStore.getState().cues });
    });
});
