import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import subtitleEditReducers from "../reducers/subtitleEditReducers";

// NOTE: You can use logger middleware to log Redux state changes/actions to the browser console.
// This is powerful mechanism to troubleshoot unnecessary state updates + re-renders -> enhance UI performance.
// import logger from "redux-logger";
// const middleware = [...getDefaultMiddleware({ serializableCheck: false }), logger];

const middleware = [...getDefaultMiddleware({ serializableCheck: false })];
const testingStore = configureStore({ reducer: subtitleEditReducers, middleware });

export default testingStore;
