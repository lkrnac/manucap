import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import subtitleEditReducers from "../reducers/subtitleEditReducers";

// NOTE: You can use logger middleware to log Redux state changes/actions to the browser console.
// This is powerful mechanism to troubleshoot unnecessary state updates + re-renders -> enhance UI performance.
// import logger from "redux-logger";
// const middleware = [...getDefaultMiddleware({ serializableCheck: false }), logger];

export const createTestingStore = () => {
    const middleware = [...getDefaultMiddleware({serializableCheck: false})];
    return configureStore({reducer: subtitleEditReducers, middleware});
};

export const testingStore = createTestingStore();

