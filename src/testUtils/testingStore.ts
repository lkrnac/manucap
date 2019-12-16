import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import subtitleEditReducers from "../reducers/subtitleEditReducer";

const middleware = [...getDefaultMiddleware({ serializableCheck: false })];
const testingStore = configureStore({ reducer: subtitleEditReducers, middleware });

export default testingStore;
