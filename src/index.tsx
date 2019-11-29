import "./initBrowserEnvironment";

import * as React from "react";
import * as ReactDOM from "react-dom";
import styles from "./styles.css";
import { ReactElement } from "react";

const TestApp = (): ReactElement => (
    <div className={styles.test}>
        Example Component: lala
    </div>
);

ReactDOM.render(<TestApp />, document.getElementById("root"));

export default TestApp;
