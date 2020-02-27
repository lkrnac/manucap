import "../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue definition
import { CueDto } from "../model";
import CueEdit from "./edit/CueEdit";
import CueLine from "./CueLine";
import CueView from "./view/CueView";
import { Provider } from "react-redux";
import React from "react";
import { mount } from "enzyme";
import { removeDraftJsDynamicValues } from "../../testUtils/testUtils";
import testingStore from "../../testUtils/testingStore";
import { updateEditingCueIndex } from "./cueSlices";

const cues = [
    { vttCue: new VTTCue(0, 0, "Editing Line 1"), cueCategory: "DIALOGUE" } as CueDto,
    { vttCue: new VTTCue(1, 2, "Editing Line 2"), cueCategory: "DIALOGUE" } as CueDto
];

const sourceCue = { vttCue: new VTTCue(0, 0, "Source Line 1"), cueCategory: "DIALOGUE" } as CueDto;

describe("CueLine", () => {
    it("renders edit line in captioning mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueEdit
                            index={1}
                            cue={cues[1]}
                            playerTime={0}
                            hideAddButton={false}
                            hideDeleteButton={false}
                        />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders view line in captioning mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <div />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders edit line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueEdit index={1} cue={cues[1]} playerTime={0} hideAddButton hideDeleteButton />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} sourceCue={sourceCue} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders view line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView index={1} cue={cues[1]} playerTime={0} className="sbte-gray-100-background" />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} sourceCue={sourceCue} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("renders empty line in translation mode", () => {
        // GIVEN
        const expectedNode = mount(
            <Provider store={testingStore}>
                <div style={{ display: "flex", paddingBottom: "5px", width: "100%" }}>
                    <div className="sbte-cue-line-flap" style={{ paddingLeft: "8px", paddingTop: "10px" }}>2</div>
                    <div style={{ display: "flex", flexDirection:"column", width: "100%" }}>
                        <CueView
                            index={1}
                            cue={sourceCue}
                            playerTime={0}
                            className="sbte-bottom-border sbte-gray-100-background"
                        />
                        <CueView index={1} cue={sourceCue} playerTime={0} hideText className="bg-light" />
                    </div>
                </div>
            </Provider>
        );

        // WHEN
        testingStore.dispatch(updateEditingCueIndex(2));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={undefined} playerTime={0} sourceCue={sourceCue} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(removeDraftJsDynamicValues(actualNode.html()))
            .toEqual(removeDraftJsDynamicValues(expectedNode.html()));
    });

    it("passes down properties", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(-1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={1} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        const actualProps = actualNode.find(CueView).props();
        expect(actualProps.index).toEqual(1);
        expect(actualProps.cue).toEqual(cues[1]);
        expect(actualProps.playerTime).toEqual(1);
    });

    it("opens cue line for editing when clicked", () => {
        // GIVEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={3} />
            </Provider>
        );

        // WHEN
        actualNode.simulate("click");

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(1);
    });

    it("opens next cue line for editing when add button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={3} />
            </Provider>
        );

        // WHEN
        actualNode.find(".sbte-add-cue-button").simulate("click");

        // THEN
        expect(testingStore.getState().editingCueIndex).toEqual(2);
    });

    it("does not hide add button in captioning mode", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueEdit).props().hideAddButton).toBeFalsy();
    });

    it("hides add button in translation mode when cue is not the last one", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} sourceCue={sourceCue} editingCuesSize={3} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueEdit).props().hideAddButton).toBeTruthy();
    });

    it("does not hide add button in translation mode when cue is last one", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} sourceCue={sourceCue} editingCuesSize={2}  />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueEdit).props().hideAddButton).toBeFalsy();
    });

    it("does not hide delete button in captioning mode", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} editingCuesSize={2} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueEdit).props().hideDeleteButton).toBeFalsy();
    });

    it("hides delete button in translation mode", () => {
        // WHEN
        testingStore.dispatch(updateEditingCueIndex(1));
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLine index={1} cue={cues[1]} playerTime={0} sourceCue={sourceCue} editingCuesSize={2} />
            </Provider>
        );

        // THEN
        expect(actualNode.find(CueEdit).props().hideDeleteButton).toBeTruthy();
    });
});
