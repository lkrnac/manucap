import { ReactElement } from "react";
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
            <div className={`${props.hideMetaKey? "tw-hidden" : "tw-flex"} tw-items-center tw-justify-center`}>
                <h4 className="tw-m-0">
                    <span className="tw-keyboard-label">
                        {commandKey}
                    </span>
                </h4>
                <span>&#160;+&#160;</span>
            </div>

            <div className={`${props.hideShiftKey? "tw-hidden" : "tw-flex"} tw-items-center tw-justify-center`}>
                <h4 className="tw-m-0">
                    <span className="tw-keyboard-label">
                        Shift
                    </span>
                </h4>
                <span>&#160;+&#160;</span>
            </div>
            <div className="tw-flex tw-items-center tw-justify-center">
                <h4 className="tw-m-0">
                    <span className="tw-keyboard-label">
                        {props.character}
                    </span>
                </h4>
            </div>
            <div
                className={(props.hideAlternativeKey? "tw-hidden" : "tw-flex") +
                    " tw-items-center tw-justify-center"}
            >
                <span>&#160;&#160;&#160;or&#160;&#160;&#160;</span>
                <div className={`${props.hideAltKey? "tw-hidden" : "tw-flex"} tw-items-center tw-justify-center`}>
                    <h4 className="tw-m-0">
                        <span className="tw-keyboard-label">
                            Alt
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className={`${props.hideShiftKey? "tw-hidden" : "tw-flex"} tw-items-center tw-justify-center`}>
                    <h4 className="tw-m-0">
                        <span className="tw-keyboard-label">
                            Shift
                        </span>
                    </h4>
                    <span>&#160;+&#160;</span>
                </div>
                <div className="tw-flex tw-items-center tw-justify-center">
                    <h4 className="tw-m-0">
                        <span className="tw-keyboard-label">
                            {props.character}
                        </span>
                    </h4>
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
