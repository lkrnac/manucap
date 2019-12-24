import React, {
  ReactElement, useState
} from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "../styles.css";

const SubtitleSpecifications = (): ReactElement => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
      <div>
          <Button variant="primary" onClick={handleShow} className="dotsub-subtitle-specifications-button">
            Subtitle Specifications
          </Button>

          <Modal show={show} onHide={handleClose} centered dialogClassName="keyboard-modal">
              <Modal.Header closeButton>
                  <Modal.Title>Subtitle Specifications</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <p>Specifications</p>
              </Modal.Body>
              <Modal.Footer>
                  <Button variant="primary" onClick={handleClose}>
                      Close
                  </Button>
              </Modal.Footer>
          </Modal>
      </div>
  );
};

export default SubtitleSpecifications;
