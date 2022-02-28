import { AppThunk } from "../../subtitleEditReducers";
import { ReactElement } from "react";
import { addCue } from "../cuesList/cuesListActions";
import { useDispatch } from "react-redux";
import Tooltip from "../../common/Tooltip";

interface Props {
    cueIndex: number;
    sourceCueIndexes: number[];
    text?: string;
}

const AddCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <Tooltip
            message="Insert new subtitle"
            placement="left"
            toggleClassName="tw-p-1.5"
        >
            <button
                style={{ maxHeight: "38px", height: "100%" }}
                className="btn btn-outline-secondary sbte-add-cue-button tw-w-full"
                onClick={(): AppThunk => dispatch(addCue(props.cueIndex + 1, props.sourceCueIndexes))}
            >
                {
                    props.text ? <span>{props.text}</span> : <b>+</b>
                }
            </button>
        </Tooltip>
    );
};

export default AddCueLineButton;
