import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

export default function RejectionModal({ show, onClose, onSubmit, submitting, profile }) {
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(reason.trim());
    setReason("");
  };

  return (
    <Modal centered show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Reject registration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">
            Add a rejection reason for {profile?.ownerName || profile?.businessName || "this service provider"}.
          </p>
          <Form.Group>
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              required
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" disabled={submitting || !reason.trim()}>
            {submitting ? "Submitting..." : "Reject"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
