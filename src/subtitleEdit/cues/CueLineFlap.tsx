import React, { ReactElement, useState } from "react";
import { CUE_LINE_STATE_CLASSES, CueError, CueLineState } from "../model";
import CueErrorsIcon from "./CueErrorsIcon";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import { addRowToMergeList, removeRowToMergeList } from "./cuesListActions";

interface Props {
    rowIndex: number;
    cueLineState: CueLineState;
    cuesErrors?: CueError[];
    showErrors?: boolean;
    editDisabled?: boolean;
}

const CueLineFlap = (props: Props): ReactElement => {
    const dispatch = useDispatch();
    const splitMergeVisible = useSelector((state: SubtitleEditState) => state.splitMergeVisible);
    const rowsToMerge = useSelector((state: SubtitleEditState) => state.rowsToMerge);
    const [checked, setChecked] = useState(false);

    const isContiguousToSelected = (): boolean => {
        if (rowsToMerge && rowsToMerge.length > 0) {
            const validIndices = [props.rowIndex - 1, props.rowIndex, props.rowIndex + 1];
            return rowsToMerge
                .map((selectedRow: number): boolean => validIndices.indexOf(selectedRow) > -1)
                .reduce((selectedRow1: boolean, selectedRow2: boolean): boolean => selectedRow1 || selectedRow2);
        }
        return true;
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {
                    splitMergeVisible
                        ? <input
                            type="checkbox"
                            className="sbte-cue-line-flap-checkbox"
                            disabled={props.editDisabled || !isContiguousToSelected()}
                            checked={checked}
                            onChange={(): void => {
                                dispatch(checked
                                    ? removeRowToMergeList(props.rowIndex)
                                    : addRowToMergeList(props.rowIndex));
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
                    flexDirection: "column"
                }}
            >
                <div style={{ paddingTop: "10px", fontSize: "11px", fontWeight: "bold" }}>
                    {props.rowIndex + 1}
                </div>
                <div
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: "0",
                        right: "0",
                        bottom: "30px",
                        fontSize: "14px"
                    }}
                >
                    {
                        props.editDisabled
                            ? <i className="fa fa-lock" />
                            : null
                    }
                </div>
                <div
                    style={{
                        position: "absolute",
                        marginLeft: "auto",
                        marginRight: "auto",
                        left: "0",
                        right: "0",
                        bottom: "10px",
                        fontSize: "14px"
                    }}
                >
                    {
                        props.cueLineState === CueLineState.ERROR
                            ? (
                                <CueErrorsIcon
                                    cueIndex={props.rowIndex}
                                    cuesErrors={props.cuesErrors || []}
                                    showErrors={props.showErrors || false}
                                />
                            )
                            : null
                    }
                    {
                        props.cueLineState === CueLineState.GOOD
                            ? <i className="fa fa-check" />
                            : null
                    }
                </div>
            </div>
        </div>
    );
};

export default CueLineFlap;

