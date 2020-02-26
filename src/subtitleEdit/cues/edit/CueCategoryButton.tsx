import React, { ReactElement } from "react";
import { AppThunk } from "../../subtitleEditReducers";
import { CueCategory } from "../../model";
import { Dropdown } from "react-bootstrap";
import { cueCategoryToPrettyName } from "../cueUtils";

interface Props {
    category?: CueCategory;
    onChange: (value: CueCategory) => AppThunk;
}

const CueCategoryButton = (props: Props): ReactElement => (
    <Dropdown>
        <Dropdown.Toggle id="cue-line-category" variant="outline-secondary">
            {cueCategoryToPrettyName[props.category || "DIALOGUE"]}
        </Dropdown.Toggle>

        <Dropdown.Menu>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("DIALOGUE")}
            >
                {cueCategoryToPrettyName.DIALOGUE}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("ONSCREEN_TEXT")}
            >
                {cueCategoryToPrettyName.ONSCREEN_TEXT}
            </Dropdown.Item>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("AUDIO_DESCRIPTION")}
            >
                {cueCategoryToPrettyName.AUDIO_DESCRIPTION}
            </Dropdown.Item>
            <Dropdown.Item
                className="sbte-cue-line-category btn btn-outline-secondary"
                onClick={(): AppThunk => props.onChange("LYRICS")}
            >
                {cueCategoryToPrettyName.LYRICS}
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>
);

export default CueCategoryButton;
