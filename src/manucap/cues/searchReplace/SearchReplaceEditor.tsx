import { Dispatch, ReactElement, useState } from "react";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    replaceCurrentMatch,
    searchCueText,
    searchNextCues,
    searchPreviousCues,
    setFind,
    setMatchCase,
    setReplacement,
    showSearchReplace
} from "./searchReplaceSlices";
import { AppThunk, ManuCapState } from "../../manuCapReducers";
import { saveTrack, updateVttCueTextOnly } from "../cuesList/cuesListActions";
import { CueDto, ManuCapAction } from "../../model";
import { replaceVttCueContent } from "../edit/editUtils";
import ToggleButton from "../../toolbox/ToggleButton";
import { SearchReplace } from "./model";
import { editingCueIndexSlice } from "../edit/cueEditorSlices";
import Icon from "@mdi/react";
import { mdiChevronDown, mdiChevronUp, mdiCloseCircleOutline } from "@mdi/js";

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

const searchReplaceAll = (
    dispatch: Dispatch<ManuCapAction>,
    cues: Array<CueDto>,
    searchReplace: SearchReplace,
    replacement: string
): void => {
    const find = searchReplace.find;
    if (find === "") {
        return;
    }
    dispatch(setReplacement(replacement));
    const newCues = cues.slice(0);
    for (const cue of newCues) {
        if (cue.editDisabled) {
            continue;
        }
        const cueIndex: number = newCues.indexOf(cue);
        const vttText = cue.vttCue.text.trim();
        const matches = searchCueText(vttText, find, searchReplace.matchCase);
        if (matches.length > 0) {
            const  newVTTCue = replaceAllInVttCue(cue.vttCue, find, replacement, searchReplace.matchCase, matches);
            dispatch(updateVttCueTextOnly(cueIndex, newVTTCue, cue.editUuid));
        }
    }
    dispatch(editingCueIndexSlice.actions.updateEditingCueIndex({ idx: -1 }));
    dispatch(setReplacement(""));
    dispatch(saveTrack());
};

const SearchReplaceEditor = (): ReactElement | null => {
    const dispatch = useDispatch();
    const searchReplace = useSelector((state: ManuCapState) => state.searchReplace);
    const searchReplaceVisible = useSelector((state: ManuCapState) => state.searchReplaceVisible);
    const cues = useSelector((state: ManuCapState) => state.cues);
    const editingCueIndex = useSelector((state: ManuCapState) => state.editingCueIndex);
    const [replacement, setReplacement] = useState("");

    return searchReplaceVisible ? (
        <div style={{ display: "flex", flexFlow: "row", marginBottom: "5px" }}>
            <div style={{ display: "flex", flexFlow: "row", width: "50%" }}>
                <input
                    type="text"
                    value={searchReplace?.find}
                    placeholder="Find"
                    className="mc-form-control !h-full"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): AppThunk => dispatch(setFind(e.target.value))}
                />
                <input
                    type="text"
                    value={replacement}
                    placeholder="Replace"
                    className="mc-form-control !h-full"
                    style={{ marginLeft: "5px" }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setReplacement(e.target.value)}
                />
            </div>
            <button
                className="mc-btn mc-btn-light mc-btn-sm mc-search-next"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="mc-search-next"
                onClick={(): void => {
                    dispatch(searchNextCues());
                }}
            >
                <Icon path={mdiChevronDown} size={1} />
            </button>
            <button
                className="mc-btn mc-btn-light mc-btn-sm mc-search-prev"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="mc-search-prev"
                onClick={(): void => {
                    dispatch(searchPreviousCues());
                }}
            >
                <Icon path={mdiChevronUp} size={1} />
            </button>
            <button
                className="mc-btn mc-btn-light mc-btn-sm !text-blue-light"
                type="button"
                disabled={editingCueIndex === -1}
                style={{ marginLeft: "5px" }}
                onClick={(): void => {
                    dispatch(replaceCurrentMatch(replacement));
                }}
            >
                Replace
            </button>
            <button
                className="mc-btn mc-btn-light mc-btn-sm !text-blue-light"
                type="button"
                style={{ marginLeft: "5px", marginRight: "5px" }}
                onClick={(): void => searchReplaceAll(dispatch, cues, searchReplace, replacement)}
            >
                Replace All
            </button>
            <ToggleButton
                className="mc-btn mc-btn-light !text-blue-light"
                toggled={searchReplace.matchCase}
                onClick={(): void => {
                    dispatch(setMatchCase(!searchReplace.matchCase));
                }}
                render={(): ReactElement => (<span>Aa</span>)}
                title={searchReplace.matchCase ? "Case sensitive" : "Case insensitive"}
            />
            <span style={{ flex: 1 }} />
            <button
                className="mc-btn mc-btn-danger mc-btn-sm"
                type="button"
                style={{ marginLeft: "5px" }}
                data-testid="mc-close-search-replace-mc-btn"
                onClick={(): void => {
                    dispatch(showSearchReplace(false));
                }}
            >
                <Icon path={mdiCloseCircleOutline} size={1} />
            </button>
        </div>
    ) : null;
};

export default SearchReplaceEditor;
