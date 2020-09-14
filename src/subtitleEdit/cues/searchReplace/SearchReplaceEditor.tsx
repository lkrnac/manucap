import React, { Dispatch, ReactElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch, searchCueText,
    searchNextCues, searchPreviousCues,
    setFind, setMatchCase, setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { AppThunk, SubtitleEditState } from "../../subtitleEditReducers";
import { updateEditingCueIndex, updateVttCue } from "../cueSlices";
import { CueDto } from "../../model";
import { replaceVttCueContent } from "../edit/editUtils";
import { callSaveTrack } from "../saveSlices";
import ToggleButton from "../../../common/ToggleButton";
import { SearchReplace } from "./model";
import { reset } from "../edit/editorStatesSlice";

const replaceAllInVttCue = (
    vttCue: VTTCue,
    find: string,
    replacement: string,
    matchCase: boolean,
    matches: Array<number>
): VTTCue => {
    let newVTTCue = vttCue;
    if (replacement === "") {
        while (matches.length > 0) {
            const start = matches[0];
            newVTTCue = replaceVttCueContent(newVTTCue, replacement, start, start + find.length);
            const vttText = newVTTCue.text.trim();
            matches = searchCueText(vttText, find, matchCase);
        }
    } else {
        const replaceOffset = replacement.length - find.length;
        matches.forEach((matchIndex, index) => {
            const start = matchIndex + (replaceOffset * index);
            newVTTCue = replaceVttCueContent(newVTTCue, replacement, start, start + find.length);
        });
    }
    return newVTTCue;
};

export const searchReplaceAll = async (
    dispatch: Dispatch<AppThunk>,
    cues: Array<CueDto>,
    searchReplace: SearchReplace
): Promise<void> => {
    const find = searchReplace.find;
    if (find === "") {
        return;
    }
    await dispatch(updateEditingCueIndex(-1));
    await dispatch(reset());
    const newCues = cues.slice(0);
    const replacement = searchReplace.replacement;
    for (const cue of newCues) {
        const cueIndex: number = newCues.indexOf(cue);
        let vttText = cue.vttCue.text.trim();
        let matches = searchCueText(vttText, find, searchReplace.matchCase);
        if (matches.length > 0) {
            const  newVTTCue = replaceAllInVttCue(cue.vttCue, find, replacement, searchReplace.matchCase, matches);
            await dispatch(updateVttCue(cueIndex, newVTTCue, cue.editUuid, true));
        }
    }
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: SubtitleEditState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: SubtitleEditState) => state.searchReplaceVisible);
    const cues = useSelector((state: SubtitleEditState) => state.cues);

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="form-control"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={searchReplace?.replacement}
                    placeholder="Replace"
                    className="form-control"
                    style={{ marginLeft: "5px" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk =>
                        dispatch(setReplacement(e.target.value))}
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
                style={{ marginLeft: "5px", marginRight: "5px" }}
                onClick={(): Promise<AppThunk> =>
                    searchReplaceAll(dispatch, cues, searchReplace)
                        .then(() => dispatch(callSaveTrack()))}
            >
                Replace All
            </button>
            <ToggleButton
                className="btn btn-secondary"
                toggled={searchReplace.matchCase}
                onClick={(): void => {
                    dispatch(setMatchCase(!searchReplace.matchCase));
                }}
                render={(): ReactElement => (<span>Aa</span>)}
                title={searchReplace.matchCase ? "Case sensitive" : "Case insensitive"}
            />
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
                <i className="far fa-times-circle" />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;
