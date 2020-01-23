import "../testUtils/initBrowserEnvironment";
import LineCategoryButton from "./LineCategoryButton";
import React from "react";
import { mount } from "enzyme";

describe("LineCategoryButton", () => {
    it("renders button", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="false"
                    id="cue-line-category"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    Dialogue
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <LineCategoryButton onChange={jest.fn()} />
        );

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with dropdown", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="show dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="true"
                    id="cue-line-category"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    Dialogue
                </button>
                <div
                    x-placement="bottom-start"
                    aria-labelledby="cue-line-category"
                    style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        opacity: "0",
                        pointerEvents: "none"
                    }}
                    className="dropdown-menu show"
                >
                    <a
                        href="#"
                        className="sbte-cue-line-category btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Dialogue
                    </a>
                    <div className="dropdown-divider" role="separator" />
                    <a
                        href="#"
                        className="sbte-cue-line-category btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        On Screen Text
                    </a>
                    <a
                        href="#"
                        className="sbte-cue-line-category btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Audio Descriptions
                    </a>
                    <a
                        href="#"
                        className="sbte-cue-line-category btn btn-outline-secondary dropdown-item"
                        role="button"
                    >
                        Lyrics
                    </a>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <LineCategoryButton onChange={jest.fn()} />
        );
        actualNode.find("button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("calls onChange function", () => {
        // GIVEN
        const onChange = jest.fn();

        // WHEN
        const actualNode = mount(
            <LineCategoryButton onChange={onChange} />
        );
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(0).simulate("click");
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(1).simulate("click");
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(2).simulate("click");
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(3).simulate("click");

        // THEN
        expect(onChange).toBeCalledTimes(4);
        expect(onChange).toHaveBeenNthCalledWith(1, "DIALOGUE");
        expect(onChange).toHaveBeenNthCalledWith(2, "ONSCREEN_TEXT");
        expect(onChange).toHaveBeenNthCalledWith(3, "AUDIO_DESCRIPTION");
        expect(onChange).toHaveBeenLastCalledWith("LYRICS");
    });
});
