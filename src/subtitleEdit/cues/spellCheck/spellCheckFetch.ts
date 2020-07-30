import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import { SpellCheck } from "./model";
import { cuesSlice } from "../cueSlices";
import _ from "lodash";
import { SubtitleEditAction } from "../../model";

const addSpellCheck = (idx: number, spellCheck: SpellCheck): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>, getState): void => {
        dispatch(cuesSlice.actions.addSpellCheck({ idx, spellCheck }));
        const subtitleSpecifications = getState().subtitleSpecifications;
        const overlapCaptionsAllowed = getState().editingTrack?.overlapEnabled;

        dispatch(cuesSlice.actions.checkErrors({
            subtitleSpecification: subtitleSpecifications,
            overlapEnabled: overlapCaptionsAllowed,
            index: idx
        }));
};


const fetchSpellCheck = (
    dispatch: Dispatch<AppThunk>,
    cueIndex: number,
    text: string,
    language?: string,
    spellCheckDomain?: string
): void => {
    if (spellCheckDomain && language) {
        fetch(
            `https://${spellCheckDomain}/v2/check`,
            { method: "POST", body: `language=${language}&text=${text}` })
            .then(response => response.json())
            .then(data => dispatch(addSpellCheck(cueIndex, data as SpellCheck)));
    }
};

export const fetchSpellCheckDebounced = _.debounce(fetchSpellCheck, 200);
