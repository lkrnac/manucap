import "../../../testUtils/initBrowserEnvironment";

import "video.js"; // VTTCue definition
import { AnyAction } from "redux";
import { Provider } from "react-redux";
import { mdiDelete } from "@mdi/js";
import Icon from "@mdi/react";
import { fireEvent, render } from "@testing-library/react";

import { CueDto, Track } from "../../model";
import DeleteCueLineButton from "./DeleteCueLineButton";
import { updateCues } from "../cuesList/cuesListActions";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import { createTestingStore } from "../../../testUtils/testingStore";
import { saveCueDeleteSlice } from "../saveCueDeleteSlices";

let testingStore = createTestingStore();

const deleteCueMock = jest.fn();

describe("DeleteCueLineButton", () => {

    beforeEach(() => {
        testingStore = createTestingStore();
        testingStore.dispatch(saveCueDeleteSlice.actions.setDeleteCueCallback(deleteCueMock));
    });

    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div className="p-1.5">
                <button
                    id="deleteCueLineButton0"
                    style={{ maxHeight: "38px" }}
                    className="mc-btn mc-btn-primary mc-btn-sm mc-delete-cue-button w-full"
                    data-pr-tooltip="Delete this caption"
                    data-pr-position="left"
                    data-pr-at="left center"
                >
                    <Icon path={mdiDelete} size={1} />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("deletes cue when delete cue button is clicked", () => {
        // GIVEN
        const cues = [
            { vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        const button = actualNode.container.querySelector(".mc-delete-cue-button");
        fireEvent.click(button!);

        // THEN
        expect(testingStore.getState().cues.length).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Cue 2");
        expect(testingStore.getState().cues[0].vttCue.startTime).toEqual(1);
        expect(testingStore.getState().cues[0].vttCue.endTime).toEqual(2);
    });

    it("calls deleteCueCallback in redux store when delete button is clicked", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        const cues = [
            { id: "test-cue-1", vttCue: new VTTCue(0, 1, "Cue 1"), cueCategory: "DIALOGUE" },
            { id: "test-cue-2", vttCue: new VTTCue(1, 2, "Cue 2"), cueCategory: "DIALOGUE" },
        ] as CueDto[];
        testingStore.dispatch(updateCues(cues) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <DeleteCueLineButton cueIndex={0} />
            </Provider>
        );

        // WHEN
        const button = actualNode.container.querySelector(".mc-delete-cue-button")!;
        fireEvent.click(button);

        // THEN
        expect(deleteCueMock).toHaveBeenCalledWith(
            { "cue": cues[0], "editingTrack": { "timecodesUnlocked": true }}
        );
        expect(saveTrack).not.toBeCalled();
    });
});
