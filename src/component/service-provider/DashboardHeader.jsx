import { Badge, Button } from "react-bootstrap";
import { FaEdit, FaSyncAlt } from "react-icons/fa";
import { getServiceStatusVariant } from "../../utils/serviceProvider";

export default function DashboardHeader({ dashboard, onEdit, onRefresh, refreshing }) {
  const status = dashboard?.status || "PENDING";
  const statusVariant = getServiceStatusVariant(status);

  return (
    <div className="service-dashboard-header service-card shadow-sm p-4 p-lg-4 mb-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
        <div>
          <div className="service-eyebrow">Service Operations</div>
          <h1 className="service-dashboard-title mb-2">Service Dashboard</h1>
          <p className="service-dashboard-subtitle mb-0">Manage and grow your service business</p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <Badge bg={statusVariant} className="service-status-badge">
            {status}
          </Badge>
          <Button className="service-primary-btn d-inline-flex align-items-center gap-2" onClick={onEdit}>
            <FaEdit />
            <span>Edit Profile</span>
          </Button>
          <Button
            variant="outline-secondary"
            className="service-icon-button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <FaSyncAlt className={refreshing ? "service-spin" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
}
