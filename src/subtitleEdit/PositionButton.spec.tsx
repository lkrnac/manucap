import "../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue type
import { Position } from "./cueUtils";
import PositionButton from "./PositionButton";
import React from "react";
import { mount } from "enzyme";

describe("PositionButton", () => {
    it("renders button", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "some text");
        const expectedNode = mount(
            <div className="dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="false"
                    id="dropdown-basic"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    ↓↓ <span className="caret" />
                </button>
            </div>
        );

        // WHEN
        const actualNode = mount(<PositionButton cue={cue} changePosition={(): void => {}} />);

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with dropdown", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "some text");
        // noinspection HtmlUnknownAttribute
        const expectedNode = mount(
            <div className="show dropdown">
                <button
                    aria-haspopup="true"
                    aria-expanded="true"
                    id="dropdown-basic"
                    type="button"
                    className="dropdown-toggle btn btn-outline-secondary"
                >
                    ↓↓ <span className="caret" />
                </button>
                <div
                    style={{
                        minWidth: "210px",
                        width: "210px",
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        opacity: "0",
                        pointerEvents: "none"
                    }}
                    x-placement="bottom-start"
                    aria-labelledby="dropdown-basic"
                    className="dropdown-menu show"
                >
                    <div style={{ display: "flex", flexFlow: "row wrap" }}>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↖↖
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 9px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↖↑
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↑↑
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 11px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↑↗
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↗↗
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↖←
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↖
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 16px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↑
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↗
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            →↗
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 5px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ←←
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 12px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ←
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 16px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            •
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 12px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            →
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 5px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            →→
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↙←
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↙
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 16px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↓
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↘
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            →↘
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↙↙
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 9px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↙↓
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 13px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↓↓
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 11px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↓↘
                        </a>
                        <a
                            style={{ lineHeight: "38px", width: "38px", margin: "auto", padding: "0px 0px 0px 6px" }}
                            href="#"
                            className="sbte-position-button btn btn-outline-secondary dropdown-item"
                            role="button"
                        >
                            ↘↘
                        </a>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(<PositionButton cue={cue} changePosition={(): void => {}} />);
        actualNode.find("button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("changes position", () => {
        // GIVEN
        const cue = new VTTCue(0, 1, "some text");
        const changePosition = jest.fn();

        // WHEN
        const actualNode = mount(<PositionButton cue={cue} changePosition={changePosition} />);
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(3).simulate("click");

        // THEN
        expect(changePosition).toBeCalledWith(Position.Row1Column4);
    });
});
