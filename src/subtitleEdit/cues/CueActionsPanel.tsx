import React, { ReactElement } from "react";
import AddCueLineButton from "./edit/AddCueLineButton";
import { CueDto } from "../model";
import DeleteCueLineButton from "./edit/DeleteCueLineButton";
import PlayCueButton from "./PlayCueButton";

interface Props {
    index: number;
    editingCueIndex: number;
    cue?: CueDto;
    sourceCue?: CueDto;
    lastCue?: boolean;
}

export const CueActionsPanel = (props: Props): ReactElement => (
    <div
        style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
        className="sbte-gray-100-background sbte-left-border"
        onClick={(event: React.MouseEvent<HTMLElement>): void => event.stopPropagation()}
    >
        {
            props.editingCueIndex === props.index && props.sourceCue === undefined
                ? <DeleteCueLineButton cueIndex={props.index} />
                : <div />
        }
        {
            props.cue
                ? <PlayCueButton cue={props.cue} />
                : <div />
        }
        {
            props.editingCueIndex === props.index && (props.sourceCue === undefined || props.lastCue)
                // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                ? <AddCueLineButton cueIndex={props.index} cue={props.cue} />
                : <div />

        }
    </div>
);
