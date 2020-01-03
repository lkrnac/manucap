import "../testUtils/initBrowserEnvironment";

import * as enzyme from "enzyme";
import * as React from "react";
import {Provider} from "react-redux";
import testingStore from "../testUtils/testingStore";
import SubtitleSpecificationsForm from "./SubtitleSpecificationsForm";
import Checkbox from "../common/Checkbox";

describe("SubtitleSpecificationsForm", () => {
    it("renders", () => {
        // GIVEN
        const subTitleSpecifications = {
            "subtitleSpecificationId": "3f458b11-2996-41f5-8f22-0114c7bc84db",
            "projectId": "68ed2f59-c5c3-4956-823b-d1f9f26585fb",
            "enabled": true,
            "audioDescription": true,
            "onScreenText": false,
            "spokenAudio": false,
            "speakerIdentification": "NUMBERED",
            "dialogueStyle": "DOUBLE_CHEVRON",
            "maxLinesPerCaption": 1,
            "maxCharactersPerLine": 40,
            "minCaptionDurationInMillis": 1,
            "maxCaptionDurationInMillis": 3,
            "comments": "This is a sample comment"
        };

        const expectedNode = enzyme.mount(
            <div>
                <form>
                    <div className="form-group">
                        <Checkbox
                            id="enabled"
                            checked={true}
                            labelMessage="Enabled"
                            disabled={true}
                        />
                    </div>
                    <hr/>
                    <div className="form-group">
                        <Checkbox
                            id="audioDescription"
                            checked={true}
                            labelMessage="Audio Description"
                            disabled={true}
                        />
                    </div>
                    <div className="form-group">
                        <Checkbox
                            id="onScreenText"
                            checked={false}
                            labelMessage="On-Screen Text"
                            disabled={true}
                        />
                    </div>
                    <div className="form-group">
                        <Checkbox
                            id="spokenAudio"
                            checked={false}
                            labelMessage="Spoken Audio"
                            disabled={true}
                        />
                    </div>
                    <div className="form-group">
                        <label>Speaker Identification</label>
                        <select className="form-control" disabled
                                value="NUMBERED">
                            <option value="NONE">None</option>
                            <option value="FIRST_NAME">First Name</option>
                            <option value="FULLNAME">Full Name</option>
                            <option value="NUMBERED">Numbered</option>
                            <option value="GENDER">Gender</option>
                            <option value="GENRE">Genre</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Dialogue Style</label>
                        <select className="form-control" disabled
                                value="DOUBLE_CHEVRON">
                            <option value="LINE_BREAKS">Line Breaks</option>
                            <option value="DOUBLE_CHEVRON">Double Chevron</option>
                            <option value="NO_DASHES">No Dashes</option>
                        </select>
                    </div>
                    <hr/>
                    <div className="form-row">
                        <div className="form-group col">
                            <label className="form-label">
                                Max Lines Per Caption
                            </label>
                            <select className="form-control" disabled value={1}>
                                <option key={1} value={1}>{1}</option>
                            </select>
                        </div>
                        <div className="form-group col">
                            <label className="form-label">
                                Max Characters Per Caption
                            </label>
                            <select className="form-control" disabled value={40}>
                                <option key={40} value={40}>{40}</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col">
                            <label className="form-label">
                                Min Caption Duration In Seconds
                            </label>
                            <select className="form-control" disabled value={1}>
                                <option key={1} value={1}>{1}</option>
                            </select>
                        </div>
                        <div className="form-group col">
                            <label className="form-label">
                                Max Caption Duration In Seconds
                            </label>
                            <select className="form-control" disabled value={3}>
                                <option key={3} value={3}>{3}</option>
                            </select>
                        </div>
                    </div>
                    <hr/>
                    <div className="form-group">
                        <label>Speaker Identification</label>
                        <textarea className="form-control" disabled rows={2} value="This is a sample comment"/>
                    </div>
                </form>
            </div>
        );

        // WHEN
        const actualNode = enzyme.mount(
            <Provider store={testingStore}>
                <SubtitleSpecificationsForm subTitleSpecifications={subTitleSpecifications}/>
            </Provider>
        );

        // THEN
        expect(actualNode.html())
            .toEqual(expectedNode.html());
    });

});
