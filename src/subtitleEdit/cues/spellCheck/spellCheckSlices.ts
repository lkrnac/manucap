import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";
import { SubtitleEditAction } from "../../model";

export const spellCheckerDomainSlice = createSlice({
    name: "spellCheckDomain",
    initialState: null as string | null,
    reducers: {
        setSpellCheckDomain: (_state, action: PayloadAction<string>): string => action.payload
    }
});

export const setSpellCheckDomain = (spellCheckDomain: string): AppThunk =>
    (dispatch: Dispatch<PayloadAction<SubtitleEditAction>>): void => {
        dispatch(spellCheckerDomainSlice.actions.setSpellCheckDomain(spellCheckDomain));
    };
