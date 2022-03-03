import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { AnyAction } from "redux";
import { CueDto, Track } from "../../model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("DeleteCueLineButton", () => {
    const saveTrack = jest.fn();

    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                className="tw-p-1.5"
                id=""
                aria-expanded="false"
            >
                <button
                    style={{ maxHeight: "38px" }}
                    className="btn btn-outline-secondary sbte-delete-cue-button tw-w-full"
                >
                    <i className="fa fa-trash" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("calls saveTrack in redux store when delete button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = mount(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );
        saveTrack.mockReset();

        // WHEN
        actualNode.find(".sbte-delete-cue-button").simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });
});
