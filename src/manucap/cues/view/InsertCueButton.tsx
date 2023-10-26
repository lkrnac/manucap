import { ReactElement } from "react";

const InsertCueButton = (): ReactElement => (
    <div
        style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "78px"
        }}
    >
        <button
            style={{ maxHeight: "38px", margin: "5px", width: "300px" }}
            className="mc-btn mc-btn-primary mc-add-cue-button"
        >
            Insert cue
        </button>
    </div>
);

export default InsertCueButton;
