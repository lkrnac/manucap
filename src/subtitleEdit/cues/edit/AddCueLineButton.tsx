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
        >
            <button
                style={{ maxHeight: "38px", margin: "5px", height: "100%", maxWidth: 40, width: "100%" }}
                className="btn btn-outline-secondary sbte-add-cue-button"
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
