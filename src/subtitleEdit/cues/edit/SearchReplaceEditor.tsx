import React, {Dispatch, ReactElement} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch, searchCueText,
    searchNextCues, searchPreviousCues,
    setFind, setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { updateVttCue } from "../cueSlices";
import { CueDto } from "../../model";
import { replaceVttCueContent } from "./editUtils";
import { reset } from "./editorStatesSlice";

export const searchReplaceAll = (
    dispatch: Dispatch<AppThunk>,
    cues: Array<CueDto>,
    find: string,
    replacement: string
): void => {
    if (find === "") {
        return;
    }
    const newCues = cues.slice(0);
    dispatch(reset());
    newCues.forEach((cue, cueIndex: number) => {
        let matches = searchCueText(cue.vttCue.text, find);
        if (matches.length > 0) {
            let newVTTCue = cue.vttCue;
            while (matches.length > 0) {
                const matchIndex = matches[0];
                newVTTCue = replaceVttCueContent(newVTTCue, replacement, matchIndex, matchIndex + find.length);
                matches = searchCueText(newVTTCue.text, find);
            }
            dispatch(updateVttCue(cueIndex, newVTTCue, cue.editUuid, true));
        }
    });
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);
    const cues = useSelector((state: SubtitleEditState) => state.cues);

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
                data-testid="sbte-search-next"
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
                data-testid="sbte-search-prev"
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
                    searchReplaceAll(dispatch, cues, searchReplace.find, searchReplace.replacement);
                }}
            >
                Replace All
            </button>
            <span style={{ flex: 1 }} />
            <button
                className="btn btn-secondary btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="sbte-close-search-replace-btn"
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
