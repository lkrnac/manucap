import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../../subtitleEditReducers";

export const spellCheckerDomainSlice = createSlice({
    name: "spellCheckDomain",
    initialState: null as string | null,
    reducers: {
        setSpellCheckDomain: (_state, action: PayloadAction<string | null>): string | null => action.payload
    }
});

export const setSpellCheckDomain = (spellCheckDomain: string | null): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string | null>>): void => {
        dispatch(spellCheckerDomainSlice.actions.setSpellCheckDomain(spellCheckDomain));
    };
