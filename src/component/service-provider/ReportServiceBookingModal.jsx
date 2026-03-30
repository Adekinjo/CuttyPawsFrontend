import { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import ServiceBookingReportService from "../../service/ServiceBookingReportService";

export default function ReportServiceBookingModal({
  show,
  onHide,
  booking,
  onSuccess,
}) {
  const [reason, setReason] = useState("UNSATISFACTORY_SERVICE");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    setReason("UNSATISFACTORY_SERVICE");
    setDetails("");
    setSubmitting(false);
    setErrorMessage("");
    setSuccessMessage("");

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [show, booking?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!booking?.id || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await ServiceBookingReportService.createReport({
        bookingId: booking.id,
        reason,
        details: details.trim(),
      });

      if (response?.status === 201) {
        setSuccessMessage(
          "Your report has been submitted successfully. Admin has been notified."
        );

        closeTimeoutRef.current = setTimeout(() => {
          closeTimeoutRef.current = null;

          onHide?.();
          onSuccess?.(response.serviceBookingReport);
        }, 2000);

        return;
      }

      setErrorMessage(response?.message || "Failed to submit report");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit report"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    onHide?.();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton={!submitting && !successMessage}>
        <Modal.Title>Report Service Issue</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {successMessage ? (
            <div className="text-center py-3">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success-subtle"
                style={{ width: 64, height: 64 }}
              >
                <span
                  className="text-success fw-bold"
                  style={{ fontSize: "1.5rem" }}
                >
                  ✓
                </span>
              </div>

              <Alert variant="success" className="mb-0">
                {successMessage}
              </Alert>
            </div>
          ) : (
            <>
              {errorMessage ? (
                <Alert variant="danger">{errorMessage}</Alert>
              ) : null}

              <p className="mb-3">
                <strong>Provider:</strong>{" "}
                {booking?.businessName ||
                  booking?.providerName ||
                  "Service Provider"}
              </p>

              <p className="text-muted small">
                Use this form to report a problem with the booked service. Our
                admin team will review it.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Reason</Form.Label>
                <Form.Select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                >
                  <option value="PROVIDER_DID_NOT_SHOW_UP">
                    Provider did not show up
                  </option>
                  <option value="UNSATISFACTORY_SERVICE">
                    Unsatisfactory service
                  </option>
                  <option value="RUDE_BEHAVIOR">Rude behavior</option>
                  <option value="SAFETY_CONCERN">Safety concern</option>
                  <option value="OVERCHARGED">Overcharged</option>
                  <option value="SCAM_SUSPECTED">Scam suspected</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Explain what happened</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="Please explain the issue clearly so the admin team can review it."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {successMessage ? (
            <Button variant="success" onClick={handleClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="danger"
                disabled={submitting || !details.trim()}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}