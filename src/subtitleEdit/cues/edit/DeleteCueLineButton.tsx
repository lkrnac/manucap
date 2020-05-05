import React, { ReactElement } from "react";
import { AppThunk } from "../../subtitleEditReducers";
import { deleteCue } from "../cueSlices";
import { useDispatch } from "react-redux";
import { TooltipWrapper } from "../../TooltipWrapper";

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
                    onClick={(): AppThunk => dispatch(deleteCue(props.cueIndex))}
                >
                    <i className="fa fa-trash" />
                </button>
            </TooltipWrapper>
        </>
    );
};

export default DeleteCueLineButton;
