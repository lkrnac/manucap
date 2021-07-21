import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import { CueDto, ScrollPosition } from "../../model";
import { AppThunk } from "../../subtitleEditReducers";

export const DEFAULT_PAGE_SIZE = 50;

export const currentPlayerTimeSlice = createSlice({
    name: "currentPlayerTime",
    initialState: 0,
    reducers: {
        setCurrentPlayerTime: (_state, action: PayloadAction<number>): number => action.payload
    }
});

export const setCurrentPlayerTime = (currentPlayerTime: number): AppThunk =>
    (dispatch: Dispatch<PayloadAction<number>>): void => {
        dispatch(currentPlayerTimeSlice.actions.setCurrentPlayerTime(currentPlayerTime));
    };

export const scrollPositionSlice = createSlice({
    name: "scrollPositionSlice",
    initialState: 0,
    reducers: {
        changeFocusedCueIndex: (_state, action: PayloadAction<number>): number => action.payload
    }
});

const getScrollCueIndex = (
    matchedCuesSize: number,
    editingFocusInMap: number,
    currentPlayerCueIndex: number,
    lastTranslatedIndex: number,
    previousFocusedCueIndex: number,
    scrollPosition?: ScrollPosition
): number | undefined => {
    if (scrollPosition === ScrollPosition.FIRST) {
        return 0;
    }
    if (scrollPosition === ScrollPosition.LAST) {
        return matchedCuesSize - 1;
    }
    if (scrollPosition === ScrollPosition.CURRENT) {
        return editingFocusInMap;
    }
    if (scrollPosition === ScrollPosition.PLAYBACK) {
        return currentPlayerCueIndex;
    }
    if (scrollPosition === ScrollPosition.LAST_TRANSLATED) {
        return lastTranslatedIndex - 1;
    }
    const currentPageIndex = Math.floor(previousFocusedCueIndex / DEFAULT_PAGE_SIZE);
    if (scrollPosition === ScrollPosition.NEXT_PAGE) {
        return currentPageIndex * DEFAULT_PAGE_SIZE + DEFAULT_PAGE_SIZE;
    }
    if (scrollPosition === ScrollPosition.PREVIOUS_PAGE) {
        return currentPageIndex * DEFAULT_PAGE_SIZE - 1;
    }
    return undefined; // out of range value, because need to trigger change of ReactSmartScroll.startAt
};

export const matchCueTimeIndex = (cues: CueDto[], trackTime: number): number => {
    const cueIndex = cues.findIndex(cue => cue.vttCue.startTime >= trackTime);
    return cueIndex <= 0 ? 0 : cueIndex - 1;
};

export const changeScrollPosition = (scrollPosition: ScrollPosition): AppThunk =>
    (dispatch: Dispatch<PayloadAction<ScrollPosition>>, getState): void => {
        const state = getState();
        const previousFocusedCueIndex = getState().focusedCueIndex;
        const currentPlayerTime = getState().currentPlayerTime;
        const currentPlayerCueIndex = matchCueTimeIndex(state.cues, currentPlayerTime);
        const focusedCueIndex = getScrollCueIndex(
            state.matchedCues.matchedCues.length,
            state.matchedCues.editingFocusIndex,
            currentPlayerCueIndex,
            state.cues.length,
            previousFocusedCueIndex,
            scrollPosition
        );
        if (focusedCueIndex !== undefined) {
            dispatch(scrollPositionSlice.actions.changeFocusedCueIndex(focusedCueIndex));
        }
    };
