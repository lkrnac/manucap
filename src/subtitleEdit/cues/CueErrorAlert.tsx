import { CueError } from "../model";
import { ReactElement, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { SubtitleEditState } from "../subtitleEditReducers";
import { setValidationErrors } from "./edit/cueEditorSlices";

const closeCueErrorsAlert = (
    setShowCueErrorsAlert: Function,
    setCueErrors: Function
): void => {
    setShowCueErrorsAlert(false);
    setCueErrors([]);
};

const closeCueErrorsAlertDebounced = _.debounce(closeCueErrorsAlert, 8000);


const CueErrorAlert = (): ReactElement => {
    const dispatch = useDispatch();
    const validationErrors = useSelector((state: SubtitleEditState) => state.validationErrors);
    const [cueErrors, setCueErrors] = useState([] as CueError[]);
    const [showCueErrorsAlert, setShowCueErrorsAlert] = useState(false);

    useEffect(
        () => {
            if (validationErrors && validationErrors.length > 0) {
                setTimeout(() => {
                    dispatch(setValidationErrors([]));
                }, 1000);
            }
        }, [ dispatch, validationErrors ]
    );

    useEffect(
        () => {
            if (validationErrors && validationErrors.length > 0) {
                setCueErrors(validationErrors);
                setShowCueErrorsAlert(true);
                closeCueErrorsAlertDebounced(setShowCueErrorsAlert, setCueErrors);
            }
        }, [ validationErrors ]
    );

    return (
        <Alert
            key="cueErrorsAlert"
            variant="danger"
            className="sbte-cue-errors-alert"
            dismissible
            show={showCueErrorsAlert}
            onClose={(): void => setShowCueErrorsAlert(false)}
        >
            <span>Unable to complete action due to the following error(s):</span><br />
            {
                cueErrors.map((cueError: CueError, index: number): ReactElement =>
                    <div key={`cueErrorAlert-${index}`}>&#8226; {cueError}<br /></div>)
            }
        </Alert>
    );
};


export default CueErrorAlert;
