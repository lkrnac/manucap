import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { updateEditingCueIndex } from "../edit/cueEditorSlices";
import { addCue } from "../cuesList/cuesListActions";

export interface CueViewProps {
    targetCueIndex?: number;
    targetCuesLength: number;
    sourceCuesIndexes: number[];
    nextTargetCueIndex: number;
    className?: string;
    children?: ReactElement;
}

const ClickCueWrapper = (props: CueViewProps): ReactElement => {
    const dispatch = useDispatch();
    const editingTask = useSelector((state: SubtitleEditState) => state.cuesTask);

    const undefinedSafeClassName = props.className ? `${props.className} ` : "";
    return (
        <div
            style={{ display: "flex" }}
            className={`${undefinedSafeClassName}border-b border-blue-light/20 sbte-click-cue-wrapper`}
            onClick={(): void => {
                if (props.targetCueIndex !== undefined) {
                    if (props.targetCueIndex >= props.targetCuesLength) {
                        dispatch(addCue(props.targetCuesLength, props.sourceCuesIndexes));
                    } else if (editingTask && !editingTask.editDisabled) {
                        dispatch(updateEditingCueIndex(props.targetCueIndex));
                    }
                } else {
                    const finalTargetIndex = props.nextTargetCueIndex >= 0
                        ? props.nextTargetCueIndex
                        : props.targetCuesLength;
                    dispatch(addCue(finalTargetIndex, props.sourceCuesIndexes));
                }
            }}
        >
            { props.children ? props.children : null }
        </div>
    );
};

export default ClickCueWrapper;
