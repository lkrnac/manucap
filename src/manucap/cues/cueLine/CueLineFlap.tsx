import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { CUE_LINE_STATE_CLASSES, CueDtoWithIndex, CueError, CueLineState, CuesWithRowIndex } from "../../model";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { addCuesToMergeList, removeCuesToMergeList } from "../cuesList/cuesListActions";
import { Tooltip } from "primereact/tooltip";
import { mdiAlertOutline, mdiCheck, mdiCommentText, mdiLock } from "@mdi/js";
import Icon from "@mdi/react";

interface Props {
    rowIndex: number;
    cueLineState: CueLineState;
    cues: CueDtoWithIndex[] | undefined;
    cuesErrors?: CueError[];
    showErrors?: boolean;
    editDisabled?: boolean;
    cueCommentsCount?: number;
}

const getCommentIcon = (index: number): ReactElement => {
    const commentIconId = `cuelineComment-${index}`;
    return (
        <>
            <div
                id={commentIconId}
                key={index}
                data-pr-tooltip="Caption(s) has comments"
                data-pr-position="right"
                data-pr-at="right+10 top+10"
            >
                <Icon path={mdiCommentText} size={0.75} />
            </div>
            <Tooltip
                id={commentIconId + "-Tooltip"}
                target={`#${commentIconId}`}
            />
        </>
    );
};

const getIconStyle = (bottom: string): CSSProperties => {
    return {
        position: "absolute",
        marginLeft: "auto",
        marginRight: "auto",
        left: "0",
        right: "0",
        bottom: bottom,
        fontSize: "14px"
    };
};

const CueLineFlap = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const mergeVisible = useSelector((state: ManuCapState) => state.mergeVisible);
    const rowsToMerge = useSelector((state: ManuCapState) => state.rowsToMerge);
    const [checked, setChecked] = useState(false);
    const showCommentsIcon = props.cueCommentsCount && props.cueCommentsCount > 0;

    useEffect(() => {
        setChecked(rowsToMerge.find(row => row.index === props.rowIndex) !== undefined);
    }, [props.rowIndex, rowsToMerge]);

    const isContiguousToSelected = (): boolean => {
        if (rowsToMerge && rowsToMerge.length > 0) {
            const validIndices = [props.rowIndex - 1, props.rowIndex, props.rowIndex + 1];
            return rowsToMerge
                .map((selectedRow: CuesWithRowIndex): boolean => validIndices.indexOf(selectedRow.index) > -1)
                .reduce((selectedRow1: boolean, selectedRow2: boolean): boolean => selectedRow1 || selectedRow2);
        }
        return true;
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {
                    mergeVisible
                        ? <input
                                type="checkbox"
                                className="mc-cue-line-flap-checkbox"
                                disabled={props.editDisabled || !isContiguousToSelected()}
                                checked={checked}
                                onChange={(): void => {
                                const cuesWithIndex = {
                                    index: props.rowIndex,
                                    cues: props.cues
                                };
                                dispatch(checked
                                    ? removeCuesToMergeList(cuesWithIndex)
                                    : addCuesToMergeList(cuesWithIndex));
                                setChecked(!checked);
                            }}
                          />
                        : null
                }
            </div>
            <div
                className={CUE_LINE_STATE_CLASSES.get(props.cueLineState)?.flapClass}
                style={{
                    textAlign: "center",
                    width: "30px",
                    color: "white",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: props.editDisabled && showCommentsIcon ? "100px" : "80px"
                }}
            >
                <div style={{ paddingTop: "10px", fontSize: "11px", fontWeight: "bold" }}>
                    {props.rowIndex + 1}
                </div>
                <div className="pl-2" style={getIconStyle(showCommentsIcon ? "55px" : "30px")}>
                    {
                        props.editDisabled
                            ? <Icon path={mdiLock} size={0.75} />
                            : null
                    }
                </div>
                <div className="pl-2" style={getIconStyle("30px")}>
                    {
                        showCommentsIcon
                            ? getCommentIcon(props.rowIndex)
                            : null
                    }
                </div>
                <div className="pl-2" style={getIconStyle("10px")}>
                    {
                        props.cueLineState === CueLineState.ERROR
                            ? <Icon path={mdiAlertOutline} size={0.75} />
                            : null
                    }
                    {
                        props.cueLineState === CueLineState.GOOD
                            ? <Icon path={mdiCheck} size={0.75} />
                            : null
                    }
                </div>
            </div>
        </div>
    );
};

export default CueLineFlap;
