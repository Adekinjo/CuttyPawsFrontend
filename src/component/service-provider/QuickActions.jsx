import { Card, Button } from "react-bootstrap";
import { FaBullhorn, FaEdit, FaExternalLinkAlt } from "react-icons/fa";

export default function QuickActions({ dashboard, onEdit, onManageAdverts, onViewPublicProfile }) {
  return (
    <Card className="service-card border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <div className="service-side-card-title">Quick Actions</div>
        <p className="service-side-card-copy">Take the next step for your business profile and visibility.</p>

        <div className="d-grid gap-2">
          <Button className="service-primary-btn w-100 d-inline-flex align-items-center justify-content-center gap-2" onClick={onEdit}>
            <FaEdit />
            <span>Edit Service</span>
          </Button>
          <Button
            variant="outline-primary"
            className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
            onClick={onViewPublicProfile}
            disabled={!dashboard?.serviceProfile?.userId}
          >
            <FaExternalLinkAlt />
            <span>View Public Profile</span>
          </Button>
          <Button
            variant="outline-dark"
            className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
            onClick={onManageAdverts}
            disabled={!dashboard?.canAccessDashboard}
          >
            <FaBullhorn />
            <span>Manage Adverts</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
