import "../../../testUtils/initBrowserEnvironment";
import React  from "react";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";
import { CueComment, CueDto } from "../../model";
import { fireEvent, render } from "@testing-library/react";
import CueComments from "./CueComments";

const testComments = [
    { userName: "Reviewer", date: "2010-01-01", comment: "this is the first comment" },
    { userName: "Linguist", date: "2010-01-02", comment: "this is the second comment" }
] as CueComment[];

const testCue = {
    vttCue: new VTTCue(1, 3, "some text"),
    cueCategory: "DIALOGUE",
    comments: testComments
} as CueDto;

describe("CueComments", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = render(
            <div className="sbte-cue-comments sbte-medium-font">
                <div className="sbte-cue-comment">
                    <span className="sbte-cue-comment-user">Reviewer</span>
                    <span> this is the first comment </span>
                    <button
                        style={{ float: "right", marginLeft: "10px" }}
                        className="btn btn-outline-secondary sbte-btn-xs"
                    >
                        <i className="fa fa-trash" />
                    </button>
                    <span className="sbte-light-gray-text" style={{ float: "right" }}><i>2010-01-01</i></span>
                </div>
                <div className="sbte-cue-comment">
                    <span className="sbte-cue-comment-user">Linguist</span>
                    <span> this is the second comment </span>
                    <button
                        style={{ float: "right", marginLeft: "10px" }}
                        className="btn btn-outline-secondary sbte-btn-xs"
                    >
                        <i className="fa fa-trash" />
                    </button>
                    <span className="sbte-light-gray-text" style={{ float: "right" }}><i>2010-01-02</i></span>
                </div>
                <hr style={{
                    borderTop: "2px solid lightgray",
                    width: "100%",
                    height: "0px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "0",
                    marginBottom: "5px"
                }}
                />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <input
                        type="text"
                        placeholder="Type your comment here"
                        className="sbte-cue-comment-input"
                        value=""
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        style={{ float: "right" }}
                        disabled
                    >
                        Send
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
    it("renders with no comments", () => {
        // GIVEN
        const comments = [] as CueComment[];
        const testCue = {
            vttCue: new VTTCue(1, 3, "some text"),
            cueCategory: "DIALOGUE",
            comments
        } as CueDto;
        const expectedNode = render(
            <div className="sbte-cue-comments sbte-medium-font">
                <div className="sbte-cue-comment">No comments</div>
                <hr style={{
                    borderTop: "2px solid lightgray",
                    width: "100%",
                    height: "0px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    marginTop: "0",
                    marginBottom: "5px"
                }}
                />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <input
                        type="text"
                        placeholder="Type your comment here"
                        className="sbte-cue-comment-input"
                        value=""
                    />
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        style={{ float: "right" }}
                        disabled
                    >
                        Send
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );

        // THEN
        expect(actualNode.container.outerHTML).toEqual(expectedNode.container.outerHTML);
    });
    it("enables send button when comment is typed", () => {
        // GIVEN
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );
        const textInput = getByPlaceholderText("Type your comment here");
        const sendButton = getByText("Send");

        // WHEN
        fireEvent.change(textInput, { target: { value: "test comment" }});

        // THEN
        expect(sendButton).toBeEnabled();
    });
});
