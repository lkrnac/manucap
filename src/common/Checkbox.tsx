import React, {
    ReactElement
} from "react";

export interface Props {
    id: string;
    labelMessage: string;
    checked: boolean;
    readonly: boolean;
}

// TODO: add onchange when needed
const Checkbox = (props: Props): ReactElement => {
    return (
        <div className="form-check">
            <input type="checkbox"
                   id={`checkbox-${props.id}`}
                   className={`checkbox-${props.id} form-check-input`}
                   checked={props.checked}
                   readOnly={props.readonly}/>
            <label htmlFor={`checkbox-${props.id}`}
                   className="form-check-label">
                {props.labelMessage}
            </label>
        </div>
    );
};

export default Checkbox;
