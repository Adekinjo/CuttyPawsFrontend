import { Alert, Badge } from "react-bootstrap";
import { getServiceStatusVariant } from "../../utils/serviceProvider";

export default function ServiceStatusBanner({ dashboard }) {
  if (!dashboard) return null;

  return (
    <Alert variant={getServiceStatusVariant(dashboard.status)} className="service-card service-status-alert border-0 shadow-sm mb-4">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Badge bg={getServiceStatusVariant(dashboard.status)}>{dashboard.status}</Badge>
            <strong>{dashboard.statusMessage || "Service status"}</strong>
          </div>
          <div className="small text-muted">Your access and promotion tools are controlled by your backend approval status.</div>
          {dashboard.rejectionReason ? (
            <div className="small mt-2">
              <strong>Reason:</strong> {dashboard.rejectionReason}
            </div>
          ) : null}
        </div>
      </div>
    </Alert>
  );
}
