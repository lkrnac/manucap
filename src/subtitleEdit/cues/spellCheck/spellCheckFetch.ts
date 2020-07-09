import { AppThunk } from "../../subtitleEditReducers";
import { Dispatch } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import { SpellCheck } from "./model";
import { cuesSlice, SpellCheckAction } from "../cueSlices";

const addSpellCheck = (idx: number, spellCheck: SpellCheck): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SpellCheckAction>>): void => {
        dispatch(cuesSlice.actions.addSpellCheck({ idx, spellCheck }));
    };

export const fetchSpellCheck = (
    dispatch: Dispatch<AppThunk>,
    cueIndex: number,
    text: string,
    language?: string,
    spellCheckDomain?: string
): void => {
    if (spellCheckDomain) {
        fetch(
            `https://${spellCheckDomain}/v2/check`,
            { method: "POST", body: `language=${language}&text=${text}` })
            .then(response => response.json())
            .then(data => dispatch(addSpellCheck(cueIndex, data as SpellCheck)));
    }
};
