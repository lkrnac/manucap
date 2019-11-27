import React from "react";
import ReactDOM from "react-dom";
import styles from "./styles.css";

const TestApp = () => (
    <div className={styles.test}>
        Example Component: lala
    </div>
);

ReactDOM.render(<TestApp />, document.getElementById("root"));

export default TestApp;
