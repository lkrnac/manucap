import React, { ReactElement } from "react";
import { AppThunk } from "../../../reducers/subtitleEditReducers";
import { CueCategory } from "../../model";
import { Dropdown } from "react-bootstrap";

export const dialogueTypeToPrettyName = {
    DIALOGUE: "Dialogue",
    ONSCREEN_TEXT: "On Screen Text",
    AUDIO_DESCRIPTION: "Audio Descriptions",
    LYRICS: "Lyrics"
};

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => AppThunk;
}

const LineCategoryButton = (props: Props): ReactElement => (
    <Dropdown>
        <Dropdown.Toggle id="cue-line-category" variant="outline-secondary">
            {dialogueTypeToPrettyName[props.category || "DIALOGUE"]}
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("DIALOGUE")}
            >
                {dialogueTypeToPrettyName.DIALOGUE}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("ONSCREEN_TEXT")}
            >
                {dialogueTypeToPrettyName.ONSCREEN_TEXT}
            </Dropdown.Item>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("AUDIO_DESCRIPTION")}
            >
                {dialogueTypeToPrettyName.AUDIO_DESCRIPTION}
            </Dropdown.Item>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("LYRICS")}
            >
                {dialogueTypeToPrettyName.LYRICS}
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

export default LineCategoryButton;
