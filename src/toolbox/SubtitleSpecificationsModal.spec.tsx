import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import SubtitleSpecificationsModal from "./SubtitleSpecificationsModal";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import {SubtitleSpecification} from "./model";

describe("SubtitleSpecificationsModal", () => {
    it("renders", () => {
        // GIVEN
        const subtitleSpecification: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: false,
            onScreenText: true,
            spokenAudio: false,
            speakerIdentification: "NUMBERED",
            dialogueStyle: "DOUBLE_CHEVRON",
            maxLinesPerCaption: 4,
            maxCharactersPerLine: 30,
            minCaptionDurationInMillis: 2,
            maxCaptionDurationInMillis: 6,
            comments: "Note"
        };
        const expectedNode = enzyme.mount(
            <div>
                <Modal show={false} onHide={() => {}} centered dialogClassName="sbte-medium-modal">
                    <Modal.Header closeButton>
                        <Modal.Title>Subtitle Specifications</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <SubtitleSpecificationsForm subTitleSpecifications={subtitleSpecification}/>
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
                <SubtitleSpecificationsModal show={false} onClose={() => {}}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });
});
