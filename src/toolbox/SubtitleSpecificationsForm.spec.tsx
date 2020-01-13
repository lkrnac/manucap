import "../testUtils/initBrowserEnvironment";

import { Provider } from "react-redux";
import React from "react";
import { SubtitleSpecification } from "./model";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import { mount } from "enzyme";
import testingStore from "../testUtils/testingStore";

describe("SubtitleSpecificationsForm", () => {
    it("renders disabled", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "",
            projectId: "",
            enabled: false,
            audioDescription: false,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "",
            dialogueStyle: "",
            maxLinesPerCaption: 0,
            maxCharactersPerLine: 0,
            minCaptionDurationInMillis: 0,
            maxCaptionDurationInMillis: 0,
            comments: ""
        };

        const expectedNode = mount(
            <div>
                <div>
                    <label><strong>Enabled:&nbsp;</strong></label>
                    <label>No</label>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

    it("renders enabled", () => {
        // GIVEN
        const subTitleSpecifications: SubtitleSpecification = {
            subtitleSpecificationId: "3f458b11-2996-41f5-8f22-0114c7bc84db",
            projectId: "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            enabled: true,
            audioDescription: true,
            onScreenText: false,
            spokenAudio: false,
            speakerIdentification: "GENDER",
            dialogueStyle: "LINE_BREAKS",
            maxLinesPerCaption: 1,
            maxCharactersPerLine: 40,
            minCaptionDurationInMillis: 1,
            maxCaptionDurationInMillis: 3,
            comments: "This is a sample comment"
        };

        const expectedNode = mount(
            <div>
                <div>
                    <label><strong>Enabled:&nbsp;</strong></label>
                    <label>Yes</label>
                </div>
                <div>
                    <hr/>
                    <div style={{ display: "flex", marginRight: "20px" }}>
                        <div style={{ flexFlow: "column" }}>
                            <div>
                                <label><strong> Audio Description:&nbsp;</strong></label>
                                <label>Yes</label>
                            </div>
                            <div>
                                <label><strong>On-Screen Text:&nbsp;</strong></label>
                                <label>No</label>
                            </div>
                            <div>
                                <label><strong>Spoken Audio:&nbsp;</strong></label>
                                <label>No</label>
                            </div>
                            <div>
                                <label><strong>Speaker Identification:&nbsp;</strong></label>
                                <label>Gender</label>
                            </div>
                            <div>
                                <label><strong>Dialogue Style:&nbsp;</strong></label>
                                <label>Line Breaks</label>
                            </div>
                        </div>
                        <hr/>
                        <div style={{ flexFlow: "column" }}>
                            <div>
                                <label><strong>Max Lines Per Caption:&nbsp;</strong></label>
                                <label>1</label>
                            </div>
                            <div>
                                <label><strong>Max Characters Per Caption:&nbsp;</strong></label>
                                <label>40</label>
                            </div>
                            <div>
                                <label><strong>Min Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>1</label>
                            </div>
                            <div>
                                <label><strong>Max Caption Duration In Seconds:&nbsp;</strong></label>
                                <label>3</label>
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div>
                        <label><strong>Comments:&nbsp;</strong></label>
                        <label>This is a sample comment</label>
                    </div>
                </div>
            </div>
        );

        // WHEN
        const actualNode = mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

});
