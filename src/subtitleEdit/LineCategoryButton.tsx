import React, {
    ReactElement
} from "react";
import { Dropdown } from "react-bootstrap";

export const dialogueTypeToPrettyName = {
    DIALOGUE: "Dialogue",
    ONSCREEN_TEXT: "On Screen Text",
    AUDIO_DESCRIPTION: "Audio Descriptions",
    LYRICS: "Lyrics"
};

interface Props {
    category?: string;
    onChange: (value: string) => void;
}

const LineCategoryButton = (props: Props): ReactElement => {
    return (
        <Dropdown>
            <Dropdown.Toggle id="cue-line-category" variant="outline-secondary" className="sbte-cue-line-category">
                {dialogueTypeToPrettyName[props.category || "DIALOGUE"]}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                <Dropdown.Item
                    className="sbte-cue-line-category btn btn-outline-secondary"
                    onClick={(): void => props.onChange("DIALOGUE")}
                >
                    {dialogueTypeToPrettyName.DIALOGUE}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    className="sbte-cue-line-category btn btn-outline-secondary"
                    onClick={(): void => props.onChange("ONSCREEN_TEXT")}
                >
                    {dialogueTypeToPrettyName.ONSCREEN_TEXT}
                </Dropdown.Item>
                <Dropdown.Item
                    className="sbte-cue-line-category btn btn-outline-secondary"
                    onClick={(): void => props.onChange("AUDIO_DESCRIPTION")}
                >
                    {dialogueTypeToPrettyName.AUDIO_DESCRIPTION}
                </Dropdown.Item>
                <Dropdown.Item
                    className="sbte-cue-line-category btn btn-outline-secondary"
                    onClick={(): void => props.onChange("LYRICS")}
                >
                    {dialogueTypeToPrettyName.LYRICS}
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LineCategoryButton;
