import { Dispatch } from "react";
import { PayloadAction } from "@reduxjs/toolkit";
import sanitizeHtml from "sanitize-html";
import { SpellCheck } from "./model";
import { cuesSlice } from "../cueSlices";
import { SubtitleEditAction } from "../../model";

const addSpellCheck = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    index: number,
    spellCheck: SpellCheck,
): void => {
    dispatch(cuesSlice.actions.addSpellCheck({ idx: index, spellCheck }));

    const subtitleSpecification = getState().subtitleSpecifications;
    const overlapEnabled = getState().editingTrack?.overlapEnabled;
    dispatch(cuesSlice.actions.checkErrors({ subtitleSpecification, overlapEnabled, index }));
};

export const fetchSpellCheck = (
    dispatch: Dispatch<PayloadAction<SubtitleEditAction>>,
    getState: Function,
    cueIndex: number,
    text: string,
    language?: string,
    spellCheckDomain?: string,
): void => {
    if (spellCheckDomain && language) {
        const plainText = sanitizeHtml(text);
        const requestBody = { method: "POST", body: `language=${language}&text=${plainText}` };
        fetch(`https://${spellCheckDomain}/v2/check`, requestBody)
            .then(response => response.json())
            .then(data => addSpellCheck(dispatch, getState, cueIndex, data as SpellCheck));
    }
};
