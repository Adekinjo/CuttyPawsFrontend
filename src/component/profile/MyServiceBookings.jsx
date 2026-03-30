// src/pages/service-bookings/MyServiceBookings.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPaw,
  FaDollarSign,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
} from "react-icons/fa";
import ServiceBookingService from "../../service/ServiceBookingService";
import ReportServiceBookingModal from "../../component/service-provider/ReportServiceBookingModal";
import ServiceBookingReportService from "../../service/ServiceBookingReportService";

function formatDateTime(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "CONFIRMED":
      return "bg-success-subtle text-success border border-success-subtle";
    case "PENDING_PAYMENT":
      return "bg-warning-subtle text-warning border border-warning-subtle";
    case "CANCELLED":
    case "DECLINED":
    case "FAILED":
    case "EXPIRED":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    case "COMPLETED":
      return "bg-info-subtle text-info border border-info-subtle";
    default:
      return "bg-light text-dark border";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return <FaCheckCircle />;
    case "CANCELLED":
    case "DECLINED":
    case "FAILED":
    case "EXPIRED":
      return <FaTimesCircle />;
    default:
      return <FaHourglassHalf />;
  }
}

function getReportBadgeClass(status) {
  switch (status) {
    case "OPEN":
      return "bg-danger-subtle text-danger border border-danger-subtle";
    case "UNDER_REVIEW":
      return "bg-warning-subtle text-warning border border-warning-subtle";
    case "RESOLVED":
      return "bg-success-subtle text-success border border-success-subtle";
    case "REJECTED":
      return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    default:
      return "bg-light text-dark border";
  }
}

function getReportLabel(status) {
  switch (status) {
    case "OPEN":
      return "Report Submitted";
    case "UNDER_REVIEW":
      return "Under Review";
    case "RESOLVED":
      return "Resolved";
    case "REJECTED":
      return "Rejected";
    default:
      return "Report Submitted";
  }
}

export default function MyServiceBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadBookingsAndReports();
  }, []);

  async function loadBookingsAndReports() {
    try {
      setLoading(true);
      setError("");

      const [bookingResponse, reportResponse] = await Promise.all([
        ServiceBookingService.getMyBookings(),
        ServiceBookingReportService.getMyReports(),
      ]);

      const bookingList =
        bookingResponse?.serviceBookings ||
        bookingResponse?.data?.serviceBookings ||
        [];

      const reportList =
        reportResponse?.serviceBookingReports ||
        reportResponse?.data?.serviceBookingReports ||
        [];

      setBookings(Array.isArray(bookingList) ? bookingList : []);
      setReports(Array.isArray(reportList) ? reportList : []);
    } catch (err) {
      console.error("Failed to load service bookings or reports:", err);
      setError(err?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  }

  function openReportModal(booking) {
    setSelectedBooking(booking);
    setShowReportModal(true);
  }

  function closeReportModal() {
    setShowReportModal(false);
    setSelectedBooking(null);
  }

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const aTime = a?.startsAt ? new Date(a.startsAt).getTime() : 0;
      const bTime = b?.startsAt ? new Date(b.startsAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [bookings]);

  const reportMap = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      if (report?.bookingId) {
        map.set(report.bookingId, report);
      }
    });

    return map;
  }, [reports]);

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary rounded-circle"
          style={{ width: 42, height: 42 }}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <div>
          <h1 className="h4 fw-bold mb-1">My Service Bookings</h1>
          <p className="text-muted mb-0">
            View all pet services you have booked.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      {!loading && !error && sortedBookings.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaCalendarAlt size={42} className="text-muted mb-3" />
            <h3 className="h5 fw-bold">No bookings yet</h3>
            <p className="text-muted mb-4">
              You have not booked any service yet.
            </p>
            <button
              className="btn btn-warning text-white"
              onClick={() => navigate("/")}
            >
              Explore Services
            </button>
          </div>
        </div>
      ) : null}

      {!loading && !error && sortedBookings.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {sortedBookings.map((booking) => {
            const report = reportMap.get(booking.id);

            return (
              <div
                key={booking.id}
                className="card border-0 shadow-sm"
                style={{ borderRadius: 18 }}
              >
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3 mb-3">
                    <div>
                      <h2 className="h5 fw-bold mb-1">
                        {booking.businessName || booking.providerName || "Service Provider"}
                      </h2>
                      <div className="text-muted d-flex flex-wrap gap-3">
                        <span className="d-inline-flex align-items-center gap-2">
                          <FaStore />
                          {booking.serviceType || "Service"}
                        </span>
                        <span className="d-inline-flex align-items-center gap-2">
                          <FaDollarSign />
                          ${booking.amount ?? "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="d-flex flex-column align-items-md-end gap-2">
                      <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(booking.bookingStatus)}`}>
                        <span className="me-2">{getStatusIcon(booking.bookingStatus)}</span>
                        {booking.bookingStatus || "UNKNOWN"}
                      </span>

                      {booking.paymentStatus ? (
                        <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(booking.paymentStatus)}`}>
                          Payment: {booking.paymentStatus}
                        </span>
                      ) : null}

                      {report?.status ? (
                        <span className={`badge rounded-pill px-3 py-2 ${getReportBadgeClass(report.status)}`}>
                          <span className="me-2">
                            <FaExclamationTriangle />
                          </span>
                          {getReportLabel(report.status)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light h-100">
                        <p className="fw-semibold mb-2">Booking Details</p>

                        <p className="mb-2 d-flex align-items-center gap-2">
                          <FaCalendarAlt className="text-warning" />
                          <span>{formatDateTime(booking.startsAt)}</span>
                        </p>

                        <p className="mb-2 d-flex align-items-center gap-2">
                          <FaClock className="text-warning" />
                          <span>{formatDateTime(booking.endsAt)}</span>
                        </p>

                        <p className="mb-0 d-flex align-items-center gap-2">
                          <FaMapMarkerAlt className="text-warning" />
                          <span>{booking.serviceAddress || "Address not provided"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded-4 bg-light h-100">
                        <p className="fw-semibold mb-2">Pet Information</p>

                        <p className="mb-2 d-flex align-items-center gap-2">
                          <FaPaw className="text-warning" />
                          <span>
                            <strong>Pet:</strong> {booking.petName || "N/A"}
                          </span>
                        </p>

                        <p className="mb-2">
                          <strong>Type:</strong> {booking.petType || "N/A"}
                        </p>

                        <p className="mb-0">
                          <strong>Notes:</strong> {booking.notes || "No extra notes"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {report ? (
                    <div className="mt-3 p-3 rounded-4 border bg-light-subtle">
                      <p className="fw-semibold mb-2">Service Report Status</p>
                      <p className="mb-1">
                        <strong>Reason:</strong> {report.reason || "N/A"}
                      </p>
                      <p className="mb-1">
                        <strong>Status:</strong> {getReportLabel(report.status)}
                      </p>
                      {report.adminNote ? (
                        <p className="mb-0">
                          <strong>Admin Note:</strong> {report.adminNote}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 pt-3 border-top gap-2">
                    <div className="text-muted small">
                      <div><strong>Reference:</strong> {booking.paymentReference || "N/A"}</div>
                      <div><strong>Booked on:</strong> {formatDateTime(booking.createdAt)}</div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => navigate(`/services/${booking.providerUserId}`)}
                      >
                        View Provider
                      </button>

                      {(booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED") && !report && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => openReportModal(booking)}
                        >
                          Report Service
                        </button>
                      )}

                      {report && (
                        <button
                          className="btn btn-outline-secondary"
                          disabled
                        >
                          {getReportLabel(report.status)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <ReportServiceBookingModal
        show={showReportModal}
        onHide={closeReportModal}
        booking={selectedBooking}
        onSuccess={(createdReport) => {
          if (createdReport?.bookingId) {
            setReports((prev) => {
              const existing = prev.filter((item) => item.bookingId !== createdReport.bookingId);
              return [createdReport, ...existing];
            });
          }
        }}
      />
    </div>
  );
}