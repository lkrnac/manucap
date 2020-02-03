import React, { ReactElement } from "react";
import { deleteCue } from "../../../player/trackSlices";
import { useDispatch } from "react-redux";

interface Props {
    cueIndex: number;
}

const DeleteCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    return (
        <>
            <button
                className="btn btn-outline-secondary sbte-delete-cue-button"
                onClick={(): void => {
                    dispatch(deleteCue(props.cueIndex));
                }}
            >
                <i className="fas fa-trash-alt" />
            </button>
        </>
    );
};

export default DeleteCueLineButton;
