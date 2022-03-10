import "../../../testUtils/initBrowserEnvironment";
import CueCategoryButton from "./CueCategoryButton";
import each from "jest-each";
import { mount } from "enzyme";
import { removeHeadlessAttributes } from "../../../testUtils/testUtils";

describe("CueCategoryButton", () => {
    it("renders button for undefined category", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="md:tw-relative tw-dropdown-wrapper">
                <div
                    id=""
                    className="tw-cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <button className="tw-select-none dropdown-toggle btn btn-outline-secondary">
                        Dialogue<span className="caret" />
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <CueCategoryButton onChange={jest.fn()} />
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("renders button for already defined category", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="md:tw-relative tw-dropdown-wrapper">
                <div
                    id=""
                    className="tw-cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded="false"
                >
                    <button className="tw-select-none dropdown-toggle btn btn-outline-secondary">
                        Audio Descriptions<span className="caret" />
                    </button>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <CueCategoryButton onChange={jest.fn()} category={"AUDIO_DESCRIPTION"} />
        );

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    it("renders with dropdown", () => {
        // GIVEN
        const expectedNode = mount(
            <div className="md:tw-relative tw-dropdown-wrapper">
                <div
                    id=""
                    className="tw-cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded="true"
                    aria-controls=""
                >
                    <button
                        className="tw-select-none focus active dropdown-toggle btn btn-outline-secondary"
                    >
                        Dialogue<span className="caret" />
                    </button>
                </div>
                <div
                    className="tw-transition-all tw-duration-300 tw-ease-in-out
                        tw-origin-top-left tw-opacity-0 tw-scale-75"
                >
                    <div className="tw-absolute tw-left-0 tw-min-w-[210px] tw-w-[210px]">
                        <ul
                            className="tw-dropdown-menu"
                            aria-labelledby=""
                            id=""
                            role="menu"
                        >
                            <li id="" role="menuitem">
                                <div className="tw-dropdown-item">
                                    Dialogue
                                </div>
                            </li>
                            <hr role="none" />
                            <li id="" role="menuitem">
                                <div className="tw-dropdown-item">
                                    On Screen Text
                                </div>
                            </li>
                            <li id="" role="menuitem">
                                <div className="tw-dropdown-item">
                                    Audio Descriptions
                                </div>
                            </li>
                            <li id="" role="menuitem">
                                <div className="tw-dropdown-item">
                                    Lyrics
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(<CueCategoryButton onChange={jest.fn()} />);
        actualNode.find("button").simulate("click");

        // THEN
        const actual = removeHeadlessAttributes(actualNode.html());
        const expected = removeHeadlessAttributes(expectedNode.html());
        expect(actual).toEqual(expected);
    });

    describe("CueCategory options", () => {
        // GIVEN
        const onChange = jest.fn();

        each([
            [0, "DIALOGUE"],
            [1, "ONSCREEN_TEXT"],
            [2, "AUDIO_DESCRIPTION"],
            [3, "LYRICS"],
        ])
            .it("call onChange with correct value", (
                index: number,
                expectedValue: string
            ) => {
                // WHEN
                const actualNode = mount(<CueCategoryButton onChange={onChange} />);
                actualNode.find("button").simulate("click");
                actualNode.find("li").at(index).simulate("click");

                // THEN
                expect(onChange).toHaveBeenCalledWith(expectedValue);
            });
    });
});
