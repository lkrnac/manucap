import React, { ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch,
    searchNextCues, searchPreviousCues,
    setFind, setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { SubtitleEditState } from "../../subtitleEditReducers";

// export const searchReplaceAll = (): void => {
//         const find = getState().searchReplace.find;
//         const replacement = getState().searchReplace.replacement;
//         if (find === "" || !replacement) {
//             return;
//         }
//         const newCues = getState().cues.slice(0);
//         newCues.forEach((cue, cueIndex: number) => {
//             const matches = matchCueText(cue, find);
//             if (matches.length > 0) {
//                 matches.forEach(matchIndex => {
//                     dispatch(searchReplaceSlice.actions.setLastCueTextMatchIndex(matchIndex));
//                     searchReplaceCue(cueIndex)(dispatch, getState, undefined);
//                 });
//             }
//         });
//         dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: -1 }));
//     };

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{display: "flex", flexFlow: "row", width: "50%"}}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="form-control"
                    onChange={e => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={searchReplace?.replacement}
                    placeholder="Replace"
                    className="form-control"
                    style={{marginLeft: "5px"}}
                    onChange={e => dispatch(setReplacement(e.target.value))}
                />
            </div>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(searchNextCues());
                }}
            >
                <i className="fa fa-arrow-down" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(searchPreviousCues());
                }}
            >
                <i className="fa fa-arrow-up" />
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(replaceCurrentMatch());
                }}
            >
                Replace
            </button>
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    if (!searchReplace.replacement) {
                        return;
                    }
                    //dispatch(searchReplaceAll());
                }}
            >
                Replace All
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="btn btn-secondary btn-sm sbte-close-search-replace-btn"
                type="button"
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                }}
            >
                <i className="fa fa-window-close" />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;
