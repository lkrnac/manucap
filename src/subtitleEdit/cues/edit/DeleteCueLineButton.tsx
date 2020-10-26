import React, { ReactElement } from "react";
import { deleteCue } from "../cuesListActions";
import { useDispatch } from "react-redux";
import { TooltipWrapper } from "../../TooltipWrapper";
import { callSaveTrack } from "../saveSlices";

interface Props {
    cueIndex: number;
}

const DeleteCueLineButton = (props: Props): ReactElement => {
    const dispatch = useDispatch();

    return (
        <>
            <TooltipWrapper
                tooltipId="deleteBtnTooltip"
                text="Delete this subtitle"
                placement="left"
            >
                <button
                    style={{ maxHeight: "38px", margin: "5px" }}
                    className="btn btn-outline-secondary sbte-delete-cue-button"
                    onClick={(): void => {
                        dispatch(deleteCue(props.cueIndex));
                        dispatch(callSaveTrack());
                    }}
                >
                    <i className="fa fa-trash" />
                </button>
            </TooltipWrapper>
        </>
    );
};

export default DeleteCueLineButton;
