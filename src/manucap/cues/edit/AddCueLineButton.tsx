import { AppThunk } from "../../manuCapReducers";
import { ReactElement } from "react";
import { addCue } from "../cuesList/cuesListActions";
import { useDispatch } from "react-redux";
import { Tooltip } from "primereact/tooltip";

interface Props {
    cueIndex: number;
    sourceCueIndexes: number[];
    text?: string;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const buttonId = `addCuelineButton-${props.cueIndex}`;
    return (
        <div className="p-1.5">
            <button
                id={buttonId}
                style={{ maxHeight: "38px", height: "100%" }}
                className="mc-btn mc-btn-primary mc-add-cue-button w-full mc-btn-sm"
                onClick={(): AppThunk => dispatch(addCue(props.cueIndex + 1, props.sourceCueIndexes))}
                data-pr-tooltip="Insert new caption"
                data-pr-position={props.text ? "bottom" : "left"}
                data-pr-at={props.text ? undefined : "left center"}
            >
                {props.text ? <span>{props.text}</span> : <b>+</b>}
            </button>
            <Tooltip
                id={buttonId + "-Tooltip"}
                target={`#${buttonId}`}
            />
        </div>
    );
};

export default AddCueLineButton;
