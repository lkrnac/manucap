import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import SubtitleSpecificationsButton from "./SubtitleSpecificationsButton";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import {readSubtitleSpecification} from "./subtitleSpecificationSlice";
import {SubtitleSpecification} from "./model";

describe("SubtitleSpecificationsButton", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <Provider store={testingStore}>
                <div>
                    <Button variant="light" className="dotsub-subtitle-specifications-button"
                            style={{marginLeft: "10px"}}>
                        Subtitle Specifications
                    </Button>

                    <SubtitleSpecificationsModal show={true} onClose={(): void => {}}/>
                </div>
            </Provider>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton/>
            </Provider>
        );
        testingStore.dispatch(readSubtitleSpecification({enabled: false} as SubtitleSpecification));

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("opens subtitle specifications modal when button is clicked", () => {
        // GIVEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton/>
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");

        // THEN
        expect(actualNode.find(Modal).props().show)
            .toEqual(true);
    });

    it("closes subtitle specifications modal when close button is clicked", () => {
        // GIVEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsButton/>
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");
        actualNode.find("button.dotsub-subtitle-specifications-modal-close-button").simulate("click");

        // THEN
        expect(actualNode.find(Modal).props().show)
            .toEqual(false);
    });
});
