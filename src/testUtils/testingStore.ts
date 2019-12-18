import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import subtitleEditReducers from "../reducers/subtitleEditReducers";

const middleware = [...getDefaultMiddleware({ serializableCheck: false })];
const testingStore = configureStore({ reducer: subtitleEditReducers, middleware });

export default testingStore;
