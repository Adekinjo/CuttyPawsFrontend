import { Button, Card } from "react-bootstrap";
import ServiceProfileCard from "./ServiceProfileCard";

export default function PendingApprovalCard({ profile, onApprove, onReject, approving, rejecting }) {
  return (
    <Card className="service-card border-0 shadow-sm h-100">
      <Card.Body className="p-4">
        <div className="mb-3">
          <div className="fw-semibold">{profile.ownerName}</div>
          <div className="small text-muted">{profile.businessName || "No business name"}</div>
        </div>
        <ServiceProfileCard profile={profile} />
        <div className="d-flex gap-2 mt-3">
          <Button variant="success" onClick={onApprove} disabled={approving}>
            {approving ? "Approving..." : "Approve"}
          </Button>
          <Button variant="outline-danger" onClick={onReject} disabled={rejecting}>
            {rejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
