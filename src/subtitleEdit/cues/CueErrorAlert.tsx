import { ReactElement, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import { setValidationErrors } from "./edit/cueEditorSlices";

const CueErrorAlert = (): ReactElement => {
    const dispatch = useDispatch();
    const validationErrors = useSelector((state: SubtitleEditState) => state.validationErrors);
    const toast = useRef<Toast>(null);

    useEffect(
        () => {
            if (validationErrors && validationErrors.length > 0) {
                setTimeout(() => {
                    dispatch(setValidationErrors([]));
                }, 1000);
            }
        }, [dispatch, validationErrors]
    );

    useEffect(
        () => {
            if (validationErrors && validationErrors.length > 0) {
                if (toast.current) {
                    toast.current.show(validationErrors.map(error => ({
                        severity: "error",
                        summary: "Unable to complete action due to the following error(s):",
                        detail: error,
                        life: 8000
                    })));
                }
            }
        }, [validationErrors]
    );

    return (
        <Toast ref={toast} position="top-center" />
    );
};

export default CueErrorAlert;
