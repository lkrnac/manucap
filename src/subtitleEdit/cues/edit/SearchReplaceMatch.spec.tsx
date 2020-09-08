import "../../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { SearchReplaceMatch } from "./SearchReplaceMatch";
import testingStore from "../../../testUtils/testingStore";
import { Provider } from "react-redux";
import { replaceCurrentMatch, setReplacement } from "./searchReplaceSlices";
import { AnyAction } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";

describe("SearchReplaceMatch", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <span style={{ border: "solid 1px rgb(75,0,130)", backgroundColor: "rgb(230,230,250)" }}>
                <div className="text" />
            </span>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SearchReplaceMatch
                    start={10}
                    end={15}
                    replaceMatch={jest.fn()}
                >
                    <div className="text" />
                </SearchReplaceMatch>
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls replaceMatch when replaceMatchCounter changes", () => {
        // GIVEN
        const replaceMatchStub = jest.fn();
        testingStore.dispatch(setReplacement("test") as {} as AnyAction);
        mount(
            <Provider store={testingStore}>
                <SearchReplaceMatch
                    start={10}
                    end={14}
                    replaceMatch={replaceMatchStub}
                >
                    <div className="text" />
                </SearchReplaceMatch>
            </Provider>
        );

        // WHEN
        act(() => {
            testingStore.dispatch(replaceCurrentMatch() as {} as AnyAction);
        });

        // THEN
        expect(replaceMatchStub).toHaveBeenCalledWith("test", 10, 14);
    });
});
