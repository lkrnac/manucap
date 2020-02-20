import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "../../subtitleEditReducers";
import {Dispatch} from "react";
// import { CueIndexAction, cuesSlice } from "../../trackSlices";


export const shiftTimeSlice = createSlice({
    name: "shiftTime",
    initialState: {cues: []},
    reducers: {
        applyShitTime:
            (_state, action: PayloadAction<number>): void => {
                const shift = action.payload;
                console.log(_state);
                console.log(action);
                console.log(shift);
                // update(_state.cues,
                //     {vttCue: {$apply: (x: number) => x + shift}});
                // _state.cues.map(vttCue => {
                //     return {...vttCue, startTime: vttCue.startTime + shift}
                // });
            }

    },
    extraReducers: {
        // [cuesSlice.actions.updateCues]: (): Map<number, EditorState> => new Map<number, EditorState>(),
    }

});

export const applyShitTime = (shiftTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(shiftTimeSlice.actions.applyShitTime(shiftTime));
    };
