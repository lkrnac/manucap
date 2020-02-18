import React, { ReactElement } from "react";
import { AppThunk } from "../../subtitleEditReducers";
import { CueCategory } from "../../model";
import { Dropdown } from "react-bootstrap";
import { dialogueTypeToPrettyName } from "../cueUtils";

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => AppThunk;
}

const CueCategoryButton = (props: Props): ReactElement => (
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

export default CueCategoryButton;
