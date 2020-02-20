import { AppThunk, SubtitleEditState } from "../subtitleEditReducers";
import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CueDto } from "../model";
import CueEditLine from "./edit/CueEditLine";
import CueViewLine from "./view/CueViewLine";
import { updateEditingCueIndex } from "./cueSlices";

interface Props {
    index: number;
    cue: CueDto;
    playerTime: number;
}

const CueLine = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const editingCueIndex = useSelector((state: SubtitleEditState) => state.editingCueIndex);
    return (
        <div
            style={{ display: "flex", paddingBottom: "5px" }}
            onClick={(): AppThunk => dispatch(updateEditingCueIndex(props.index))}
        >
            <div
                className="sbte-cue-line-flap"
                style={{
                    flex: "1 1 20px",
                    paddingLeft: "8px",
                    paddingTop: "10px",
                }}
            >
                {props.index + 1}
            </div>
            {
                editingCueIndex === props.index
                    ? <CueEditLine index={props.index} cue={props.cue} playerTime={props.playerTime} />
                    : <CueViewLine index={props.index} cue={props.cue} playerTime={props.playerTime} />
            }
        </div>
    );
};

export default CueLine;
