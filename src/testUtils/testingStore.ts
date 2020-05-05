import { EnhancedStore, configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import subtitleEditReducers from "../subtitleEdit/subtitleEditReducers";

// NOTE: You can use logger middleware to log Redux state changes/actions to the browser console.
// This is powerful mechanism to troubleshoot unnecessary state updates + re-renders -> enhance UI performance.
// import logger from "redux-logger";
// const middleware = [...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }), logger];

// NOTE: Perf. tuning should be done when React/Redux browser plugins are off and immutable check is off
// (uncomment following commented out command)
// const middleware = [...getDefaultMiddleware({ serializableCheck: false, immutableCheck: false })];

const middleware = [...getDefaultMiddleware({ serializableCheck: false })];

export const createTestingStore = (): EnhancedStore => configureStore({ reducer: subtitleEditReducers, middleware });
export default createTestingStore();
