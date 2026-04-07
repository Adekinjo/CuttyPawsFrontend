import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ServiceBookingService from "../../service/ServiceBookingService";

const MAX_ATTEMPTS = 10;
const POLL_DELAY_MS = 1500;

const ServiceBookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirming your booking payment...");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const getBookingId = () => {
      const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment") || "null");
      const pendingServiceBooking = JSON.parse(
        localStorage.getItem("pendingServiceBooking") || "null"
      );

      return (
        location.state?.bookingId ||
        pendingPayment?.bookingId ||
        pendingServiceBooking?.bookingId ||
        null
      );
    };

    const cleanupPendingStorageIfConfirmed = () => {
      localStorage.removeItem("pendingServiceBooking");

      const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment") || "null");
      if (pendingPayment?.paymentPurpose === "SERVICE_BOOKING") {
        localStorage.removeItem("pendingPayment");
      }
    };

    const checkBookingStatus = async (bookingId, currentAttempt = 1) => {
      try {
        if (!isMounted) return;

        setAttemptCount(currentAttempt);

        const response = await ServiceBookingService.getMyBookingStatus(bookingId);
        const bookingData = response?.serviceBooking;

        if (!bookingData) {
          throw new Error("Booking details were not returned.");
        }

        if (!isMounted) return;

        setBooking(bookingData);

        const paymentStatus = String(bookingData.paymentStatus || "").toUpperCase();
        const bookingStatus = String(bookingData.bookingStatus || "").toUpperCase();

        if (paymentStatus === "PAID" && bookingStatus === "CONFIRMED") {
          setMessage("Your booking has been confirmed successfully.");
          setError("");
          setLoading(false);
          cleanupPendingStorageIfConfirmed();
          return;
        }

        if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
          setError("Your payment was not completed successfully.");
          setMessage("");
          setLoading(false);
          return;
        }

        if (currentAttempt >= MAX_ATTEMPTS) {
          setMessage("Payment was received and your booking is still processing. Please check My Bookings shortly.");
          setError("");
          setLoading(false);
          return;
        }

        setMessage("Payment received. Finalizing your booking confirmation...");

        timeoutRef.current = setTimeout(() => {
          checkBookingStatus(bookingId, currentAttempt + 1);
        }, POLL_DELAY_MS);
      } catch (err) {
        if (!isMounted) return;

        setError(err.message || "Unable to verify your booking right now.");
        setMessage("");
        setLoading(false);
      }
    };

    const start = async () => {
      const bookingId = getBookingId();

      if (!bookingId) {
        setError("Booking ID not found.");
        setLoading(false);
        return;
      }

      await checkBookingStatus(bookingId, 1);
    };

    start();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.state]);

  const handleViewBookings = () => {
    navigate("/service-bookings/my-bookings");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const isConfirmed =
    String(booking?.paymentStatus || "").toUpperCase() === "PAID" &&
    String(booking?.bookingStatus || "").toUpperCase() === "CONFIRMED";

  const isProcessing =
    !error &&
    !isConfirmed &&
    !!booking &&
    (
      String(booking?.paymentStatus || "").toUpperCase() === "PENDING" ||
      String(booking?.bookingStatus || "").toUpperCase() === "PENDING_PAYMENT"
    );

  const formatAmount = (amount) => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return "N/A";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numeric);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              {loading ? (
                <>
                  <div
                    className="spinner-border text-primary mb-4"
                    style={{ width: "3rem", height: "3rem" }}
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>

                  <h3 className="card-title mb-3">Confirming Your Booking</h3>
                  <p className="card-text text-muted mb-2">{message}</p>
                  <small className="text-muted">Attempt {attemptCount} of {MAX_ATTEMPTS}</small>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <div
                      className={`${
                        error
                          ? "bg-danger"
                          : isConfirmed
                          ? "bg-success"
                          : "bg-warning"
                      } rounded-circle d-inline-flex align-items-center justify-content-center`}
                      style={{ width: "80px", height: "80px" }}
                    >
                      <span
                        className="text-white fw-bold"
                        style={{ fontSize: "2rem", lineHeight: 1 }}
                      >
                        {error ? "✕" : isConfirmed ? "✓" : "!"}
                      </span>
                    </div>
                  </div>

                  <h1
                    className={`mb-3 ${
                      error
                        ? "text-danger"
                        : isConfirmed
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {error
                      ? "Booking Confirmation Failed"
                      : isConfirmed
                      ? "Booking Confirmed!"
                      : "Booking Is Processing"}
                  </h1>

                  <p className="lead text-muted mb-4">
                    {error ||
                      message ||
                      (isProcessing
                        ? "Your payment was received and your booking is still being finalized."
                        : "Your booking status was retrieved successfully.")}
                  </p>

                  {booking && (
                    <div
                      className={`alert ${
                        error
                          ? "alert-danger"
                          : isConfirmed
                          ? "alert-success"
                          : "alert-warning"
                      } text-start`}
                      role="alert"
                    >
                      <h5 className="alert-heading mb-3">Booking Details</h5>

                      <p className="mb-1">
                        <strong>Business:</strong>{" "}
                        {booking.businessName || booking.providerName || "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Service:</strong> {booking.serviceType || "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Pet:</strong> {booking.petName || "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Amount:</strong> {formatAmount(booking.amount)}
                      </p>

                      <p className="mb-1">
                        <strong>Payment Reference:</strong>{" "}
                        {booking.paymentReference || "N/A"}
                      </p>

                      <p className="mb-1">
                        <strong>Payment Status:</strong>{" "}
                        {booking.paymentStatus || "N/A"}
                      </p>

                      <p className="mb-0">
                        <strong>Booking Status:</strong>{" "}
                        {booking.bookingStatus || "N/A"}
                      </p>
                    </div>
                  )}

                  <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                    <button
                      onClick={handleViewBookings}
                      className="btn btn-primary btn-lg px-4 me-md-2"
                    >
                      View My Bookings
                    </button>

                    <button
                      onClick={handleGoHome}
                      className="btn btn-outline-secondary btn-lg px-4"
                    >
                      Go Home
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingSuccess;