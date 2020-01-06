import React, {
    // ChangeEvent,
    KeyboardEvent,
    ReactElement
} from "react";
import {Container, Col, Row} from "react-bootstrap";

const BEGIN_NUMERIC = 0;
const END_NUMERIC = 9;

const isNumeric = (key: string) => Number(key) >= BEGIN_NUMERIC && Number(key) <= END_NUMERIC;

// const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (!isNumeric(e.target.value)) {
//         e.preventDefault();
//     }
// };

const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isNumeric(e.key)) {
        e.preventDefault();
    }
};

const TimeEditor = (): ReactElement => {
    return (
        <Container>
            <Row className="time-editor">
                <Col>
                    <input id="hours" type="number" className="time-editor-input"
                           onKeyDown={handleKeyDown}/>
                    <span>:</span>
                </Col>
                <Col>
                    <input id="minutes" type="number" className="time-editor-input"
                           onKeyDown={handleKeyDown}/>
                    <span>:</span>
                </Col>
                <Col>
                    <input id="seconds" type="number" className="time-editor-input"
                           onKeyDown={handleKeyDown}/>
                    <span>:</span>
                </Col>
                <Col>
                    <input id="milliseconds" type="number" className="time-editor-input ms-input"
                           onKeyDown={handleKeyDown}/>
                </Col>
            </Row>
        </Container>
    );
};

export default TimeEditor;
