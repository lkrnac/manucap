import React, {
    ReactElement
} from "react";
import TimeEditorMillis from "./TimeEditorMillis";
import TimeEditorMinutes from "./TimeEditorMinutes";
import TimeEditorSeconds from "./TimeEditorSeconds";

interface Props {
    id: string;
    time?: number;
    onChange: (time: number) => void;
}

const TimeEditor = (props: Props): ReactElement => {
    return (
        <div id={props.id} style={{ display: "flex" }} className="sbte-time-editor">
            <div style={{ flexFlow: "column" }}>
                <TimeEditorMinutes
                    id={props.id}
                    time={props.time || 0}
                    onChange={props.onChange}
                />
            </div>
            <label style={{ verticalAlign: "bottom", padding: "5px" }}>:</label>
            <div style={{ flexFlow: "column" }}>
                <TimeEditorSeconds
                    id={props.id}
                    time={props.time || 0}
                    onChange={props.onChange}
                />
            </div>
            <label style={{ verticalAlign: "bottom", padding: "5px" }}>.</label>
            <div style={{ flexFlow: "column" }}>
                <TimeEditorMillis
                    id={props.id}
                    time={props.time || 0}
                    onChange={props.onChange}
                />
            </div>
        </div>
    );
};

TimeEditor.defaultProps = {
    time: 0
} as Partial<Props>;

export default TimeEditor;
