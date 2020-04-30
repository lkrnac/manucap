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

export const CueActionsPanel = (props: Props): ReactElement => {
    const backgroundClassName = props.cue && props.cue.corrupted
        ? "sbte-background-error-darker"
        : "sbte-gray-100-background";
    return (
        <div
            style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}
            className={backgroundClassName + " sbte-left-border"}
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
                props.editingCueIndex === props.index && props.sourceCue === undefined
                    // @ts-ignore If cue is undefined, sourceCue is passed in (ensured by SubtitleEdit tests)
                    ? <AddCueLineButton cueIndex={props.index} cue={props.cue} />
                    : <div />

            }
        </div>
    );
};
