import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ServiceBookingService from "../../service/ServiceBookingService";

const ServiceBookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirming your booking payment...");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const confirmBooking = async () => {
      try {
        const pendingBooking = JSON.parse(localStorage.getItem("pendingServiceBooking"));

        if (!pendingBooking?.paymentReference) {
          throw new Error("Booking payment reference not found.");
        }

        const response = await ServiceBookingService.confirmBookingPayment(
          pendingBooking.paymentReference
        );

        if (response.status !== 200) {
          throw new Error(response.message || "Booking confirmation failed.");
        }

        setBooking(response.serviceBooking);
        setMessage("Your booking has been confirmed successfully.");
        localStorage.removeItem("pendingServiceBooking");
      } catch (error) {
        console.error("Booking success error:", error);
        setMessage(error.message || "Unable to confirm booking.");
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [searchParams]);

  const handleViewBookings = () => {
    navigate("/service-bookings/my-bookings");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center py-5">
                <div
                  className="spinner-border text-primary mb-4"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="card-title mb-3">Booking Payment Processing</h3>
                <p className="card-text text-muted">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = !!booking;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <div
                  className={`${
                    isSuccess ? "bg-success" : "bg-danger"
                  } rounded-circle d-inline-flex align-items-center justify-content-center`}
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className={`bi ${isSuccess ? "bi-check-lg" : "bi-x-lg"} text-white`}
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
              </div>

              <h1 className={`${isSuccess ? "text-success" : "text-danger"} mb-3`}>
                {isSuccess ? "Booking Confirmed!" : "Booking Confirmation Failed"}
              </h1>

              <p className="lead text-muted mb-4">{message}</p>

              {booking && (
                <div className="alert alert-success text-start" role="alert">
                  <h5 className="alert-heading mb-3">
                    <i className="bi bi-calendar-check me-2"></i>
                    Booking Details
                  </h5>
                  <p className="mb-1"><strong>Business:</strong> {booking.businessName || booking.providerName}</p>
                  <p className="mb-1"><strong>Service:</strong> {booking.serviceType}</p>
                  <p className="mb-1"><strong>Pet:</strong> {booking.petName || "N/A"}</p>
                  <p className="mb-1"><strong>Amount:</strong> ${booking.amount}</p>
                  <p className="mb-1"><strong>Payment Reference:</strong> {booking.paymentReference}</p>
                  <p className="mb-0"><strong>Status:</strong> {booking.bookingStatus}</p>
                </div>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                {booking ? (
                  <button
                    onClick={handleViewBookings}
                    className="btn btn-primary btn-lg px-4 me-md-2"
                  >
                    View My Bookings
                  </button>
                ) : null}

                <button
                  onClick={handleGoHome}
                  className="btn btn-outline-secondary btn-lg px-4"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingSuccess;