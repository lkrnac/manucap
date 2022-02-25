import { ReactElement } from "react";
import { deleteCue } from "../cuesList/cuesListActions";
import { useDispatch } from "react-redux";
import { AppThunk } from "../../subtitleEditReducers";
import Tooltip from "../../common/Tooltip";

interface Props {
    cueIndex: number;
}

const DeleteCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    return (
        <>
            <Tooltip
                message="Delete this subtitle"
                placement="left"
            >
                <button
                    style={{ maxHeight: "38px", margin: "5px" }}
                    className="btn btn-outline-secondary sbte-delete-cue-button"
                    onClick={(): AppThunk => dispatch(deleteCue(props.cueIndex))}
                >
                    <i className="fa fa-trash" />
                </button>
            </Tooltip>
        </>
    );
};

export default DeleteCueLineButton;
