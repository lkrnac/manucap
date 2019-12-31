import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import SubtitleSpecifications from "./SubtitleSpecifications";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";

describe("SubtitleSpecifications", () => {
    it("renders", () => {
        // GIVEN
        const expectedNode = enzyme.mount(
            <div>
                <Button variant="primary" className="dotsub-subtitle-specifications-button"
                        style={{marginLeft: "10px"}}>
                    Subtitle Specifications
                </Button>

                <Modal centered dialogClassName="medium-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Subtitle Specifications</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SubtitleSpecificationsForm subTitleSpecifications/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecifications/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("opens subtitle specifications modal when button is clicked", () => {
        // GIVEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecifications/>
            </Provider>
        );

        // WHEN
        actualNode.find("button.dotsub-subtitle-specifications-button").simulate("click");

        // THEN
        expect(actualNode.find(Modal).props().show)
            .toEqual(true);
    });
});
