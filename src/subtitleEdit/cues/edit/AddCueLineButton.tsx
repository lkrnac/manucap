import { AppThunk } from "../../subtitleEditReducers";
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
        <div className="tw-p-1.5">
            <button
                id={buttonId}
                style={{ maxHeight: "38px", height: "100%" }}
                className="btn btn-outline-secondary sbte-add-cue-button tw-w-full"
                onClick={(): AppThunk => dispatch(addCue(props.cueIndex + 1, props.sourceCueIndexes))}
                data-pr-tooltip="Insert new subtitle"
                data-pr-position="left"
                data-pr-at="left+10 center"
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
