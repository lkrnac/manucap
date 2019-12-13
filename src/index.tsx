import "./initBrowserEnvironment";

import * as React from "react";
import * as ReactDOM from "react-dom";
// import styles from "./styles.css";
import { ReactElement } from "react";
import {configureStore, getDefaultMiddleware} from "@reduxjs/toolkit";
import {Provider} from "react-redux";
import subtitleEditReducers from "./reducers/subtitleEditReducer";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";
import thunk from "redux-thunk";

const middleware = [...getDefaultMiddleware(), thunk];
const store = configureStore({ reducer: subtitleEditReducers, middleware });

const TestApp = (): ReactElement => (
    <SubtitleEdit
        poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
        mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
    />
);

ReactDOM.render(
    <Provider store={store}>
        <TestApp />
    </Provider>,
    document.getElementById("root")
);

