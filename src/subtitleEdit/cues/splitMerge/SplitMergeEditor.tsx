import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../../subtitleEditReducers";
import { showSplitMerge } from "./splitMergeSlices";
import { mergeCues } from "../cuesListActions";

const SplitMergeEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const splitMergeVisible = useSelector((state: SubtitleEditState) => state.splitMergeVisible);
    // const rowsToMerge = useSelector((state: SubtitleEditState) => state.rowsToMerge);

    return splitMergeVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-search-prev"
                onClick={(): void => {
                    dispatch(mergeCues());
                }}
            >
                Merge
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-search-replace-btn"
                onClick={(): void => {
                    dispatch(showSplitMerge(false));
                }}
            >
                <i className="far fa-times-circle" />
            </button>
        </div>
    ) : null;
};

export default SplitMergeEditor;
