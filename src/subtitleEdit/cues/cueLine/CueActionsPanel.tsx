import React, { ReactElement } from "react";
import AddCueLineButton from "../edit/AddCueLineButton";
import { CueDto } from "../../model";
import DeleteCueLineButton from "../edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";

interface Props {
    index: number;
    cue: CueDto;
    sourceCueIndexes: number[];
    isEdit: boolean;
}

export const CueActionsPanel = (props: Props): ReactElement => {
    return (
        <div
            style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
            className="sbte-actions-panel sbte-gray-100-background sbte-left-border"
            onClick={(event: React.MouseEvent<HTMLElement>): void => event.stopPropagation()}
        >
            {
                props.isEdit
                    ? <DeleteCueLineButton cueIndex={props.index} />
                    : <div />
            }
            <PlayCueButton cue={props.cue} />
            {
                props.isEdit
                    ? <AddCueLineButton cueIndex={props.index} sourceCueIndexes={props.sourceCueIndexes} />
                    : <div />
            }
        </div>
    );
};
