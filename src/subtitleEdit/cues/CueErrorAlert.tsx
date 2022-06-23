import { ReactElement, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import { setValidationErrors } from "./edit/cueEditorSlices";

const DEFAULT_TIME_OUT = 100;

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

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (validationErrors && validationErrors.length > 0) {
                const clearAndShowToast = async () => {
                    if (toast.current) {
                        await toast.current.clear();
                        toast.current.show(validationErrors.map(error => ({
                            severity: "error",
                            summary: "Unable to complete action due to the following error(s):",
                            detail: error,
                            life: 8000
                        })));
                    }
                };
                clearAndShowToast();
            }
        }, DEFAULT_TIME_OUT);
        return () => clearTimeout(timeout);
        }, [validationErrors]
    );

    return (
        <Toast ref={toast} position="top-center" />
    );
};

export default CueErrorAlert;
