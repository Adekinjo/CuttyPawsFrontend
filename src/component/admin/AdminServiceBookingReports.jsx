import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaStore,
  FaDollarSign,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaShieldAlt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
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

export default function AdminServiceBookingReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setLoading(true);
      setError("");
      const response = await ServiceBookingReportService.getAdminReports();
      const list =
        response?.serviceBookingReports ||
        response?.data?.serviceBookingReports ||
        [];
      setReports(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load booking reports:", err);
      setError(err?.message || "Unable to load booking reports.");
    } finally {
      setLoading(false);
    }
  }

  function openReport(report) {
    setSelectedReport(report);
    setAdminNote(report?.adminNote || "");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedReport(null);
    setAdminNote("");
  }

  async function updateStatus(status, suspendProvider = false) {
    if (!selectedReport?.id) return;

    try {
      setUpdating(true);

      const response = await ServiceBookingReportService.updateAdminReport(
        selectedReport.id,
        {
          status,
          adminNote,
          suspendProvider,
        }
      );

      const updated = response?.serviceBookingReport;
      if (updated) {
        setReports((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setSelectedReport(updated);
      }

      if (status === "RESOLVED" || status === "REJECTED") {
        closeModal();
      }
    } catch (err) {
      console.error("Failed to update report:", err);
      alert(err?.message || "Failed to update report.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="container py-4 mb-5" style={{ maxWidth: 1100 }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary rounded-circle"
          style={{ width: 42, height: 42 }}
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </button>

        <div>
          <h1 className="h4 fw-bold mb-1">Service Booking Reports</h1>
          <p className="text-muted mb-0">
            View and manage customer complaints for booked services.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="alert alert-danger">{error}</div>
      ) : null}

      {!loading && !error && reports.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaExclamationTriangle size={42} className="text-muted mb-3" />
            <h3 className="h5 fw-bold">No booking reports yet</h3>
            <p className="text-muted mb-0">
              When users report a booked service, it will appear here.
            </p>
          </div>
        </div>
      ) : null}

      {!loading && !error && reports.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="card border-0 shadow-sm"
              style={{ borderRadius: 18 }}
            >
              <div className="card-body p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">
                      {report.businessName || report.providerName || "Service Provider"}
                    </h2>
                    <div className="text-muted d-flex flex-wrap gap-3">
                      <span className="d-inline-flex align-items-center gap-2">
                        <FaUser />
                        {report.customerName || "Customer"}
                      </span>
                      <span className="d-inline-flex align-items-center gap-2">
                        <FaStore />
                        {report.serviceType || "Service"}
                      </span>
                      <span className="d-inline-flex align-items-center gap-2">
                        <FaDollarSign />
                        ${report.amount ?? "0.00"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusBadgeClass(report.status)}`}>
                      {report.status || "OPEN"}
                    </span>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 rounded-4 bg-light h-100">
                      <p className="fw-semibold mb-2">Booking Information</p>
                      <p className="mb-2 d-flex align-items-center gap-2">
                        <FaCalendarAlt className="text-warning" />
                        <span>{formatDateTime(report.startsAt)}</span>
                      </p>
                      <p className="mb-2">
                        <strong>Ends:</strong> {formatDateTime(report.endsAt)}
                      </p>
                      <p className="mb-2">
                        <strong>Reference:</strong> {report.paymentReference || "N/A"}
                      </p>
                      <p className="mb-0">
                        <strong>Address:</strong> {report.serviceAddress || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 rounded-4 bg-light h-100">
                      <p className="fw-semibold mb-2">Complaint</p>
                      <p className="mb-2">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      <p className="mb-2">
                        <strong>Reported:</strong> {formatDateTime(report.createdAt)}
                      </p>
                      <p className="mb-0">
                        <strong>Details:</strong> {report.details}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mt-3 pt-3 border-top gap-2">
                  <div className="text-muted small">
                    <div><strong>Provider:</strong> {report.providerName || "N/A"}</div>
                    <div><strong>Customer:</strong> {report.customerName || "N/A"}</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate(`/services/${report.providerUserId}`)}
                    >
                      View Provider
                    </button>

                    <button
                      className="btn btn-outline-danger"
                      onClick={() => openReport(report)}
                    >
                      Review Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton={!updating}>
          <Modal.Title>Review Booking Report</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedReport ? (
            <>
              <div className="mb-3">
                <p className="mb-1"><strong>Business:</strong> {selectedReport.businessName || "N/A"}</p>
                <p className="mb-1"><strong>Provider:</strong> {selectedReport.providerName || "N/A"}</p>
                <p className="mb-1"><strong>Customer:</strong> {selectedReport.customerName || "N/A"}</p>
                <p className="mb-1"><strong>Reason:</strong> {selectedReport.reason}</p>
                <p className="mb-1"><strong>Amount:</strong> ${selectedReport.amount ?? "0.00"}</p>
                <p className="mb-1"><strong>Date:</strong> {formatDateTime(selectedReport.startsAt)}</p>
                <p className="mb-0"><strong>Details:</strong> {selectedReport.details}</p>
              </div>

              <Form.Group>
                <Form.Label>Admin Note</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Write what action you took or what the admin review found."
                />
              </Form.Group>
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="d-flex flex-wrap gap-2">
          <Button
            variant="outline-warning"
            disabled={updating}
            onClick={() => updateStatus("UNDER_REVIEW", false)}
          >
            Mark Under Review
          </Button>

          <Button
            variant="success"
            disabled={updating}
            onClick={() => updateStatus("RESOLVED", false)}
          >
            Resolve
          </Button>

          <Button
            variant="secondary"
            disabled={updating}
            onClick={() => updateStatus("REJECTED", false)}
          >
            Reject
          </Button>

          <Button
            variant="danger"
            disabled={updating}
            onClick={() => updateStatus("UNDER_REVIEW", true)}
          >
            <FaShieldAlt className="me-2" />
            Suspend Provider
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}