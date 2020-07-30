import { createSlice } from "@reduxjs/toolkit";
import { cuesSlice } from "./cueSlices";

export const cuesLoadingCounterSlice = createSlice({
    name: "cuesLoadingCounter",
    initialState: 0 as number,
    reducers: {
    },
    extraReducers: {
        [cuesSlice.actions.updateCues.type]: (counter: number): number => {
            counter += 1;
            return counter;
        }
    }
});
