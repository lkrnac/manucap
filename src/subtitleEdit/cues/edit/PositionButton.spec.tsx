import "../../../testUtils/initBrowserEnvironment";
import "video.js"; // VTTCue type
import { Dropdown } from "react-bootstrap";
import { Position } from "../cueUtils";
import PositionButton from "./PositionButton";
import { mount } from "enzyme";

describe("PositionButton", () => {
    it("renders button", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const expectedNode = mount(
            <div style={{ marginBottom: "5px", marginRight: "10px" }} className="dropdown">
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
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("renders with dropdown", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        // noinspection HtmlUnknownAttribute
        const expectedNode = mount(
            <div style={{ marginBottom: "5px", marginRight: "10px" }} className="show dropdown">
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
                    x-placement="bottom-start"
                    aria-labelledby="dropdown-basic"
                    style={{
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        opacity: "0",
                        pointerEvents: "none",
                        margin: "0px"
                    }}
                    className="dropdown-menu show"
                >
                    <div style={{ minWidth: "210px", width: "210px", display: "flex", flexFlow: "row wrap" }}>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↖↖
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 9px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↖↑
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↑↑
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 11px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↑↗
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↗↗
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↖←
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↖
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 16px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↑
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↗
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            →↗
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 5px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ←←
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 12px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ←
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 16px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            •
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 12px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            →
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 5px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            →→
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↙←
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↙
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 16px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↓
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↘
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            →↘
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↙↙
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 9px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↙↓
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 13px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↓↓
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 11px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↓↘
                        </a>
                        <a
                            style={{
                                lineHeight: "38px",
                                width: "38px",
                                margin: "auto",
                                padding: "0px 0px 0px 6px",
                                borderRadius: "3px"
                            }}
                            href="#"
                            className="sbte-dropdown-item dropdown-item"
                            role="button"
                        >
                            ↘↘
                        </a>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);
        actualNode.find("button").simulate("click");

        // THEN
        expect(actualNode.html()).toEqual(expectedNode.html());
    });

    it("changes position", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        const changePosition = jest.fn();

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={changePosition} />);
        actualNode.find("button").simulate("click");
        actualNode.find("a").at(3).simulate("click");

        // THEN
        expect(changePosition).toBeCalledWith(Position.Row1Column4);
    });

    it("initializes icon on button according to vttCue styles", () => {
        // GIVEN
        const vttCue = new VTTCue(0, 1, "some text");
        vttCue.line = 4;
        vttCue.align = "start";
        vttCue.positionAlign = "center";
        vttCue.position = 65;

        // WHEN
        const actualNode = mount(<PositionButton vttCue={vttCue} changePosition={(): void => undefined} />);


        // THEN
        expect(actualNode.find(Dropdown.Toggle).text()).toEqual("↖ ");
    });

});
