import "./initBrowserEnvironment";

import * as React from "react";
import * as ReactDOM from "react-dom";
// import styles from "./styles.css";
import { ReactElement } from "react";
import { createStore } from "redux";
import { connect } from "react-redux";
import subtitleEditReducers from "./reducers/subtitleEditReducer";
import { TestAction } from "./reducers/testReducer";
import SubtitleEdit from "./subtitleEdit/SubtitleEdit";

const store = createStore(subtitleEditReducers);
store.subscribe(() => console.log(store.getState()));

const TestApp = (): ReactElement => (
    <SubtitleEdit
        poster="http://dotsub-media-encoded.s3.amazonaws.com/media/4/7/thumb.jpg"
        mp4="http://dotsub-media-encoded.s3.amazonaws.com/1/14/14.mp4"
    />
);

const mapStateToProps = (state: TestAction): object => ({ testValue: state.testValue });

ReactDOM.render(<TestApp />, document.getElementById("root"));

export default connect(mapStateToProps, null)(TestApp);
