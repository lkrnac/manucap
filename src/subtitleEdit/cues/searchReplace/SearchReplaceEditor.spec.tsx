import "../../../testUtils/initBrowserEnvironment";
import React, { ReactElement } from "react";
import SearchReplaceEditor from "./SearchReplaceEditor";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { setFind, setReplacement, showSearchReplace } from "./searchReplaceSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { fireEvent, render } from "@testing-library/react";
import { CueDto, ScrollPosition, Track } from "../../model";
import { updateCues, updateEditingCueIndex } from "../cueSlices";
import { setSaveTrack } from "../saveSlices";
import { updateEditingTrack } from "../../trackSlices";
import ToggleButton from "../../../common/ToggleButton";

const testingCues = [
    { vttCue: new VTTCue(0, 2, "Caption Line 2"), cueCategory: "DIALOGUE" },
    { vttCue: new VTTCue(2, 4, "Caption Line 2"), cueCategory: "ONSCREEN_TEXT" },
    {
        vttCue: new VTTCue(4, 6, "Caption Line 3"),
        cueCategory: "ONSCREEN_TEXT",
        spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
    },
    {
        vttCue: new VTTCue(6, 8, "Caption Line 2"),
        cueCategory: "ONSCREEN_TEXT"
    },
] as CueDto[];

describe("SearchReplaceEditor", () => {
    it("renders", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const expectedNode = render(
            <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
                <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                    <input type="text" value="" placeholder="Find" className="form-control" />
                    <input
                        type="text"
                        value=""
                        placeholder="Replace"
                        className="form-control"
                        style={{ marginLeft: "5px" }}
                    />
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-next"
                >
                    <i className="fa fa-arrow-down" />
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-search-prev"
                >
                    <i className="fa fa-arrow-up" />
                </button>
                <button className="btn btn-secondary btn-sm" type="button" style={{ marginLeft: "5px" }}>
                    Replace
                </button>
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px", marginRight: "5px" }}
                >
                    Replace All
                </button>
                <ToggleButton
                    className="btn btn-secondary"
                    toggled={false}
                    onClick={jest.fn()}
                    render={(): ReactElement => (<span>Aa</span>)}
                    title="Case insensitive"
                />
                <span style={{ flex: 1 }} />
                <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    style={{ marginLeft: "5px" }}
                    data-testid="sbte-close-search-replace-btn"
                >
                    <i className="far fa-times-circle" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });

    it("does not render of show is false", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(false) as {} as AnyAction);

        // WHEN
        const { container } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );

        // THEN
        expect(container.outerHTML).toEqual("<div></div>");
    });

    it("sets find in redux when changed", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const findInput = getByPlaceholderText("Find");

        // WHEN
        fireEvent.change(findInput, { target: { value: "testing" }});

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("testing");
    });

    it("sets replacement in redux when changed", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceInput = getByPlaceholderText("Replace");

        // WHEN
        fireEvent.change(replaceInput, { target: { value: "testing-repl" }});

        // THEN
        expect(testingStore.getState().searchReplace.replacement).toEqual("testing-repl");
    });

    it("sets show search replace to false when close button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const closeButton = getByTestId("sbte-close-search-replace-btn");

        // WHEN
        fireEvent.click(closeButton);

        // THEN
        expect(testingStore.getState().searchReplaceVisible).toBeFalsy();
    });

    it("sets matchCase to true when match case button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const matchCaseButton = getByText("Aa");

        // WHEN
        fireEvent.click(matchCaseButton);

        // THEN
        expect(testingStore.getState().searchReplace.matchCase).toBeTruthy();
    });

    it("searches for next match when Next button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const nextButton = getByTestId("sbte-search-next");

        // WHEN
        fireEvent.click(nextButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });

    it("searches for previous match when Previous button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(3) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const prevButton = getByTestId("sbte-search-prev");

        // WHEN
        fireEvent.click(prevButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(1);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });

    it("invokes replace current match when Replace button is clicked", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(updateEditingCueIndex(0) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 2") as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceButton = getByText("Replace");

        // WHEN
        fireEvent.click(replaceButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 2");
        expect(testingStore.getState().searchReplace.replaceMatchCounter).toEqual(1);
        expect(testingStore.getState().editingCueIndex).toEqual(0);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });

    it("replaces all matches and save when Replace All button is clicked", (done) => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        const saveTrack = jest.fn();
        testingStore.dispatch(setSaveTrack(saveTrack) as {} as AnyAction);
        testingStore.dispatch(updateEditingTrack({ mediaTitle: "testingTrack" } as Track) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 5") as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");

        // WHEN
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 5");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 5");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
        setTimeout(
            () => {
                expect(saveTrack).toHaveBeenCalledTimes(1);
                done();
            },
            3000
        );
    });

    it("replaces all matches replace contains find", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "Caption <b>Line 2</b> and <i>Line 2</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>Line 2</b> and Line 2"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption Line 2"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 2") as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");

        // WHEN
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 2");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>New Line 2</b> and <i>New Line 2</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>New Line 2</b> and New Line 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption New Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });

    it("replaces all matches replace shorter than find", () => {
        // GIVEN
        const testingCues = [
            { vttCue: new VTTCue(0, 2, "Caption <b>Line 2</b> and <i>Line 2</i>"),
                cueCategory: "DIALOGUE" },
            { vttCue: new VTTCue(2, 4, "Caption <b>Line 2</b> and Line 2"),
                cueCategory: "ONSCREEN_TEXT" },
            {
                vttCue: new VTTCue(4, 6, "Caption Line 3"),
                cueCategory: "ONSCREEN_TEXT",
                spellCheck: { matches: [{ message: "some-spell-check-problem" }]}
            },
            {
                vttCue: new VTTCue(6, 8, "Caption Line 2"),
                cueCategory: "ONSCREEN_TEXT"
            },
        ] as CueDto[];

        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("Line 2") as {} as AnyAction);
        testingStore.dispatch(setReplacement("test") as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");

        // WHEN
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("Line 2");
        expect(testingStore.getState().searchReplace.replacement).toEqual("test");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption <b>test</b> and <i>test</i>");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption <b>test</b> and test");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption test");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });

    it("does not replace all match when Replace All button is clicked and find is empty", () => {
        // GIVEN
        testingStore.dispatch(showSearchReplace(true) as {} as AnyAction);
        testingStore.dispatch(updateCues(testingCues) as {} as AnyAction);
        testingStore.dispatch(setFind("") as {} as AnyAction);
        testingStore.dispatch(setReplacement("New Line 5") as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <SearchReplaceEditor />
            </Provider>
        );
        const replaceAllButton = getByText("Replace All");

        // WHEN
        fireEvent.click(replaceAllButton);

        // THEN
        expect(testingStore.getState().searchReplace.find).toEqual("");
        expect(testingStore.getState().searchReplace.replacement).toEqual("New Line 5");
        expect(testingStore.getState().cues[0].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[1].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().cues[2].vttCue.text).toEqual("Caption Line 3");
        expect(testingStore.getState().cues[3].vttCue.text).toEqual("Caption Line 2");
        expect(testingStore.getState().editingCueIndex).toEqual(-1);
        expect(testingStore.getState().scrollPosition).toEqual(ScrollPosition.CURRENT);
    });
});
