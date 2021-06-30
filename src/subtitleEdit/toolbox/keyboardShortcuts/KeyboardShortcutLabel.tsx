import React, { ReactElement } from "react";
import { os } from "platform";

export interface Props {
    character: string;
    name: string;
    hideShiftKey?: boolean | false;
    hideMetaKey?: boolean | false;
    hideAltKey?: boolean | false;
    hideAlternativeKey?: boolean | false;
}

const KeyboardShortcutLabel = (props: Props): ReactElement => {
    const commandKey = os && os.family === "OS X" ? "Command" : "Ctrl";
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <div className={`${props.hideMetaKey? "d-none":"d-flex"} align-items-center justify-content-center`}>
                <h4><span className="badge badge-secondary">{commandKey}</span></h4>
                <span>&#160;+&#160;</span>
            </div>

            <div className={`${props.hideShiftKey? "d-none":"d-flex"} align-items-center justify-content-center`}>
                <h4><span className="badge badge-secondary">Shift</span></h4>
                <span>&#160;+&#160;</span>
            </div>

            <div className="d-flex align-items-center justify-content-center">
                <h4><span className="badge badge-secondary">{props.character}</span></h4>
            </div>
            <div className={`${props.hideAlternativeKey? "d-none":"d-flex"} align-items-center justify-content-center`}>
                <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                <div className={`${props.hideAltKey? "d-none":"d-flex"} align-items-center justify-content-center`}>
                    <h4><span className="badge badge-secondary">Alt</span></h4>
                    <span>&#160;+&#160;</span>
                </div>

                <div className={`${props.hideShiftKey? "d-none":"d-flex"} align-items-center justify-content-center`}>
                    <h4><span className="badge badge-secondary">Shift</span></h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="d-flex align-items-center justify-content-center">
                    <h4><span className="badge badge-secondary">{props.character}</span></h4>
                </div>
            </div>
            <span>
                <span>&#160;&#160;&#160;:&#160;&#160;&#160;</span>
                {props.name}
            </span>

        </div>
    );
};

export default KeyboardShortcutLabel;
