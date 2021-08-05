import "../../../testUtils/initBrowserEnvironment";
import React  from "react";
import { Provider } from "react-redux";
import testingStore from "../../../testUtils/testingStore";
import { CueComment, CueDto, User } from "../../model";
import { fireEvent, render } from "@testing-library/react";
import CueComments from "./CueComments";
import { AnyAction } from "redux";
import { updateCues } from "../cuesList/cuesListActions";
import { userSlice } from "../../userSlices";

const testComments = [
    { userId: "rev.test", userName: "Reviewer", date: "2010-01-01", comment: "this is the first comment" },
    { userId: "test", userName: "Linguist", date: "2010-01-02", comment: "this is the second comment" }
] as CueComment[];

const testCue = {
    vttCue: new VTTCue(1, 3, "some text"),
    cueCategory: "DIALOGUE",
    comments: testComments
} as CueDto;

const testingUser = {
    displayName: "Test User",
    email: "test@dotsub.com",
    firstname: "Test",
    lastname: "User",
    systemAdmin: "",
    userId: "test"
} as User;

describe("CueComments", () => {
    it("renders", () => {
        // GIVEN
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const expectedNode = render(
            <div
                className="sbte-medium-font sbte-white-background"
                style={{
                    position: "relative",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "5px",
                    padding: "10px 10px 5px 10px",
                    marginBottom: "2px",
                    marginLeft: "2px",
                    marginRight: "2px",
                }}
            >
                <div style={{ marginBottom: "8px" }}>
                    <span
                        className="sbte-cue-comment-user"
                        style={{
                            borderRadius: "5px",
                            padding: "1px 3px",
                            whiteSpace: "nowrap",
                            width: "80px",
                            marginRight: "5px",
                            float: "left",
                            textAlign: "center",
                            textOverflow: "ellipsis",
                            overflow: "hidden"
                        }}
                    >
                        Reviewer
                    </span>
                    <span> this is the first comment </span>
                    <span
                        className="sbte-light-gray-text"
                        style={{
                            float: "right",
                            position: "absolute",
                            right: "40px"
                        }}
                    >
                        <i>2010-01-01</i>
                    </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <span
                        className="sbte-cue-comment-user"
                        style={{
                            borderRadius: "5px",
                            padding: "1px 3px",
                            whiteSpace: "nowrap",
                            width: "80px",
                            marginRight: "5px",
                            float: "left",
                            textAlign: "center",
                            textOverflow: "ellipsis",
                            overflow: "hidden"
                        }}
                    >
                        Linguist
                    </span>
                    <span> this is the second comment </span>
                    <button
                        data-testid="sbte-delete-cue-comment-button"
                        style={{ float: "right" }}
                        className="btn btn-outline-secondary sbte-btn-xs"
                    >
                        <i className="fa fa-trash" />
                    </button>
                    <span
                        className="sbte-light-gray-text"
                        style={{
                            float: "right",
                            position: "absolute",
                            right: "40px"
                        }}
                    >
                        <i>2010-01-02</i>
                    </span>
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
                        className="mousetrap"
                        style={{
                            borderStyle: "none",
                            width: "100%"
                        }}
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
            <div
                className="sbte-medium-font sbte-white-background"
                style={{
                    position: "relative",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "5px",
                    padding: "10px 10px 5px 10px",
                    marginBottom: "2px",
                    marginLeft: "2px",
                    marginRight: "2px",
                }}
            >
                <div style={{ marginBottom: "8px" }}>No comments</div>
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
                        className="mousetrap"
                        style={{
                            borderStyle: "none",
                            width: "100%"
                        }}
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
    it("renders delete comment button when user is author", () => {
        // GIVEN
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );

        // WHEN
        const deleteButton = actualNode.queryByTestId("sbte-delete-cue-comment-button");

        // THEN
        expect(deleteButton).toBeInTheDocument();
    });
    it("doesn't render delete comment button when user isn't author of any comment", () => {
        // GIVEN
        const testCue = {
            vttCue: new VTTCue(1, 3, "some text"),
            cueCategory: "DIALOGUE",
            comments: [testComments[0]]
        } as CueDto;
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const actualNode = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );

        // WHEN
        const deleteButton = actualNode.queryByTestId("sbte-delete-cue-comment-button");

        // THEN
        expect(deleteButton).not.toBeInTheDocument();
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
    it("adds a new comment with text when send button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues([testCue]) as {} as AnyAction);
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const { getByText, getByPlaceholderText } = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );
        const textInput = getByPlaceholderText("Type your comment here");
        const sendButton = getByText("Send");

        // WHEN
        fireEvent.change(textInput, { target: { value: "test comment" }});
        fireEvent.click(sendButton);

        // THEN
        expect(testingStore.getState().cues[0].comments.length).toEqual(3);
        expect(testingStore.getState().cues[0].comments).toEqual([
            expect.anything(),
            expect.anything(),
            expect.objectContaining({
                comment: "test comment",
                userId: "test",
                userName: "Linguist",
        })]);
    });
    it("doesn't add a new comment without text when send button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues([testCue]) as {} as AnyAction);
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const { getByText } = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );
        const sendButton = getByText("Send");

        // WHEN
        fireEvent.click(sendButton);

        // THEN
        expect(testingStore.getState().cues[0].comments.length).toEqual(2);
        expect(testingStore.getState().cues[0].comments).toEqual(testCue.comments);
    });
    it("deletes a comment when delete button is clicked", () => {
        // GIVEN
        testingStore.dispatch(updateCues([testCue]) as {} as AnyAction);
        testingStore.dispatch(userSlice.actions.updateSubtitleUser({ subtitleUser: testingUser }) as {} as AnyAction);
        const { getByTestId } = render(
            <Provider store={testingStore}>
                <CueComments index={0} cue={testCue} commentAuthor="Linguist" />
            </Provider>
        );
        const deleteButton = getByTestId("sbte-delete-cue-comment-button");

        // WHEN
        fireEvent.click(deleteButton);

        // THEN
        expect(testingStore.getState().cues[0].comments.length).toEqual(1);
        expect(testingStore.getState().cues[0].comments).toEqual([
            expect.objectContaining({
                userId: "rev.test",
                userName: "Reviewer"
            })]);
    });
});
