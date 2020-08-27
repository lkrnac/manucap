import React, { ReactElement } from "react";
import { os } from "platform";

export interface Props {
    character: string;
    name: string;

}

const KeyboardShortcutLabel = (props: Props): ReactElement => {
    const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <h4><span className="badge badge-secondary">{commandKey}</span></h4>
            <span>&#160;+&#160;</span>
            <h4><span className="badge badge-secondary">Shift</span></h4>
            <span>&#160;+&#160;</span>
            <h4><span className="badge badge-secondary">{props.character}</span></h4>
            <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
            <h4><span className="badge badge-secondary">Alt</span></h4>
            <span>&#160;+&#160;</span>
            <h4><span className="badge badge-secondary">Shift</span></h4>
            <span>&#160;+&#160;</span>
            <h4><span className="badge badge-secondary">{props.character}</span></h4>
            <span>&#160;&#160;&#160;:&#160;&#160;&#160;</span>
            <span>{props.name}</span>
        </div>
    );
};

export default KeyboardShortcutLabel;
