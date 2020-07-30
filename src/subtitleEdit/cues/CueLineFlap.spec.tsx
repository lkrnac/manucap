import "../../testUtils/initBrowserEnvironment";
import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import testingStore from "../../testUtils/testingStore";
import CueLineFlap from "./CueLineFlap";

describe("CueLineFlap", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = mount(
            <div
                className="sbte-cue-line-flap"
                style={{
                    paddingTop: "10px",
                    width: "30px",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textAlign: "center"
                }}
            >
                1
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <CueLineFlap rowIndex={0} />
            </Provider>
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });
});
