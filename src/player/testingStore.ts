import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import subtitleEditReducers from "../reducers/subtitleEditReducer";

const middleware = [...getDefaultMiddleware(), thunk];
const testingStore = configureStore({ reducer: subtitleEditReducers, middleware });

export default testingStore;
