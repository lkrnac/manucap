import "./initBrowserEnvironment";

import * as React from "react";
import * as ReactDOM from "react-dom";
import styles from "./styles.css";
import { ReactElement } from "react";
import { createStore } from "redux";
import { connect } from "react-redux";
import subtitleEditReducers from "./reducers/sustitleEditReducer";
import { TestAction } from "./reducers/testReducer";

const store = createStore(subtitleEditReducers);
store.subscribe(() => console.log(store.getState()));

const TestApp = (): ReactElement => (
    <div className={styles.test}>
        After clicking on button, Redux event should appear in console.
        <button onClick={(): void => {store.dispatch({ type: "TEST_ACTION", testValue: "clicked"})}} >
            Test Redux
        </button>
    </div>
);

const mapStateToProps = (state: TestAction): object => ({ testValue: state.testValue });

ReactDOM.render(<TestApp />, document.getElementById("root"));

export default connect(mapStateToProps, null)(TestApp);
