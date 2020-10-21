import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SpellcheckerSettings } from "./model";
import { AppThunk } from "./subtitleEditReducers";
import { Dispatch } from "react";

export const spellcheckerSettingsSlice = createSlice({
    name: "spellcheckerSettings",
    initialState: { enabled: false, domain: null  } as  SpellcheckerSettings,
    reducers: {
        disableSpellchecker: (state): void => {
            if (state) {
                state.enabled = false;
            }
        },
        setSpellCheckDomain: (state, action: PayloadAction<string | null | undefined>): SpellcheckerSettings => {
            state.domain = action.payload;
            state.enabled = action.payload != null;
            return state;
        }
    }
});

export const setSpellCheckDomain = (spellCheckDomain: string | null | undefined): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string | null | undefined>>): void => {
        dispatch(spellcheckerSettingsSlice.actions.setSpellCheckDomain(spellCheckDomain));
    };

