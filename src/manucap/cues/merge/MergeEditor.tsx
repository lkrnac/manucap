import { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ManuCapState } from "../../manuCapReducers";
import { showMerge } from "./mergeSlices";
import { mergeCues } from "../cuesList/cuesListActions";
import Icon from "@mdi/react";
import { mdiCloseCircleOutline } from "@mdi/js";

const MergeEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const mergeVisible = useSelector((state: ManuCapState) => state.mergeVisible);

    return mergeVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <label style={{ marginTop: "10px" }}>
                Select the lines to be merged then click Merge
            </label>
            <button
                className="mc-btn mc-btn-light mc-btn-sm !text-blue-light"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="mc-search-prev"
                onClick={(): void => {
                    dispatch(mergeCues());
                }}
            >
                Merge
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="mc-btn mc-btn-danger mc-btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="mc-close-merge-mc-btn"
                onClick={(): void => {
                    dispatch(showMerge(false));
                }}
            >
                <Icon path={mdiCloseCircleOutline} size={1} />
            </button>
        </div>
    ) : null;
};

export default MergeEditor;
