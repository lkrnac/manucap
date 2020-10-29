import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount, shallow } from "enzyme";
import { createTestingStore } from "../../testUtils/testingStore";
import { Provider } from "react-redux";
import SyncCuesButton from "./SyncCuesButton";
import { setSaveTrack } from "../cues/saveSlices";
import { AnyAction } from "redux";
import { updateEditingTrack } from "../trackSlices";
import { CueDto, Track } from "../model";
import { updateSourceCues } from "../cues/view/sourceCueSlices";

jest.mock("lodash", () => ({
    debounce: (callback: Function): Function => callback
}));

let testingStore = createTestingStore();

describe("SyncCuesButton", () => {
    beforeEach(() => {
        testingStore = createTestingStore();
    });
    it("renders", () => {
        // GIVEN
        const expectedNode = shallow(
            <button type="button" className="sbte-sync-cues-button btn btn-secondary">
                <i className="fas fa-sync" /> Sync Cues
            </button>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("syncs ues when button is clicked", () => {
        // GIVEN
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({} as Track) as {} as AnyAction);
        const testingCues = [{ vttCue: new VTTCue(0, 2, "Caption Line 1"), cueCategory: "DIALOGUE" }] as CueDto[];
        testingStore.dispatch(updateSourceCues(testingCues) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-sync-cues-button").simulate("click");

        // THEN
        expect(saveTrack).toHaveBeenCalledTimes(1);
    });

    it("unsets the track id on button click", () => {
        // GIVEN
        testingStore.dispatch(updateEditingTrack({ id: "123456" } as Track) as {} as AnyAction);

        const actualNode = mount(
            <Provider store={testingStore}>
                <SyncCuesButton />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-sync-cues-button").simulate("click");

        // THEN
        expect(testingStore.getState().editingTrack.id).not.toBeDefined();
    });
});
