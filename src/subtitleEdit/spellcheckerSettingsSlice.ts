import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SpellcheckerSettings } from "./model";
import { AppThunk, SubtitleEditState } from "./subtitleEditReducers";
import { Dispatch } from "react";
import { applySpellcheckerOnCue } from "./cues/cuesList/cuesListActions";

export const spellcheckerSettingsSlice = createSlice({
    name: "spellcheckerSettings",
    initialState: { enabled: false, domain: null  } as  SpellcheckerSettings,
    reducers: {
        setSpellCheckDomain: (state, action: PayloadAction<string | null | undefined>): SpellcheckerSettings => {
            state.domain = action.payload;
            state.enabled = action.payload != null;
            return state;
        }
    }, extraReducers: {
        // @ts-ignore: This is standard redux-toolkit construct
        [applySpellcheckerOnCue.rejected]:
            (state: SubtitleEditState): void => {
                state.enabled = false;
            }
    }
});

export const setSpellCheckDomain = (spellCheckDomain: string | null | undefined): AppThunk =>
    (dispatch: Dispatch<PayloadAction<string | null | undefined>>): void => {
        dispatch(spellcheckerSettingsSlice.actions.setSpellCheckDomain(spellCheckDomain));
    };

