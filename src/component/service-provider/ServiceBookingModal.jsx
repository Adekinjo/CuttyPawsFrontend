import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Form, Modal, Row, Spinner } from "react-bootstrap";
import ServiceBookingService from "../../service/ServiceBookingService";
import PaymentService from "../../service/PaymentService";
import { useNavigate } from "react-router-dom";

const DEFAULT_TIMEZONE = "America/Chicago";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Contact for pricing";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const combineDateTime = (date, time) => {
  if (!date || !time) return null;

  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
};

export default function ServiceBookingModal({
  show,
  onHide,
  serviceProfile,
  defaultAmount = 0,
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    petName: "",
    petType: "",
    serviceAddress: "",
    notes: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;

    setFormData({
      petName: "",
      petType: "",
      serviceAddress: "",
      notes: "",
      bookingDate: "",
      startTime: "",
      endTime: "",
    });
    setError("");
  }, [show, serviceProfile?.id]);

  const amount = useMemo(() => {
    const numericAmount = Number(defaultAmount);
    return Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  }, [defaultAmount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const startsAt = combineDateTime(formData.bookingDate, formData.startTime);
    const endsAt = combineDateTime(formData.bookingDate, formData.endTime);

    if (!serviceProfile?.id) {
      setError("Service profile is not available for booking.");
      return;
    }

    if (!startsAt || !endsAt) {
      setError("Choose a valid booking date and time range.");
      return;
    }

    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("End time must be after start time.");
      return;
    }

    if (amount <= 0) {
      setError("This service does not have a valid booking amount yet.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        serviceProfileId: serviceProfile.id,
        startsAt,
        endsAt,
        amount,
        paymentPurpose: "SERVICE_BOOKING",
        petName: formData.petName.trim(),
        petType: formData.petType.trim(),
        serviceAddress: formData.serviceAddress.trim(),
        notes: formData.notes.trim(),
        timezone: DEFAULT_TIMEZONE,
      };

      const response = await ServiceBookingService.createBooking(payload);

      const bookingData =
        response?.serviceBooking || response?.data?.serviceBooking || null;

      if (!bookingData?.paymentReference) {
        throw new Error("Booking payment reference was not returned.");
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.id || !user?.email) {
        throw new Error("User not found. Please log in again.");
      }

      const paymentResponse = await PaymentService.initializeBookingPayment(
        amount,
        "USD",
        user.email,
        user.id,
        bookingData.id
      );

      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          paymentId: paymentResponse.paymentId,
          reference: paymentResponse.reference,
          paymentIntentClientSecret: paymentResponse.paymentIntentClientSecret,
          publishableKey: paymentResponse.publishableKey,
          paymentPurpose: "SERVICE_BOOKING",
          bookingId: bookingData.id,
        })
      );

      onHide();
      navigate("/checkout/payment");
    } catch (submitError) {
      console.error("[ServiceBookingModal] Booking creation failed:", submitError);
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Unable to create booking."
      );
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={submitting ? undefined : onHide} centered size="lg">
      <Modal.Header closeButton={!submitting}>
        <Modal.Title>Book Service</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          <div className="mb-4">
            <div className="text-uppercase text-muted small fw-semibold mb-1">
              Booking with
            </div>
            <h5 className="mb-1">
              {serviceProfile?.businessName || serviceProfile?.ownerName || "Service Provider"}
            </h5>
            <div className="text-muted">
              Estimated amount: <strong>{formatCurrency(amount)}</strong>
            </div>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="serviceBookingPetName">
                <Form.Label>Pet Name</Form.Label>
                <Form.Control
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  placeholder="Enter your pet's name"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="serviceBookingPetType">
                <Form.Label>Pet Type</Form.Label>
                <Form.Control
                  type="text"
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  placeholder="Dog, Cat, Bird..."
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="serviceBookingAddress">
                <Form.Label>Service Address</Form.Label>
                <Form.Control
                  type="text"
                  name="serviceAddress"
                  value={formData.serviceAddress}
                  onChange={handleChange}
                  placeholder="Where should the service happen?"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="serviceBookingDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  min={getTodayDate()}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="serviceBookingStartTime">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="serviceBookingEndTime">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="serviceBookingNotes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Share anything the provider should know before the booking."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="px-4 pb-4 pt-0">
          <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Redirecting...
              </>
            ) : (
              "Book and Pay"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
