import { Badge, Card } from "react-bootstrap";
import { formatCurrency, formatDateTime } from "../../utils/serviceProvider";

export default function ActiveSubscriptionCard({ subscription }) {
  if (!subscription) {
    return (
      <Card className="service-card border-0 shadow-sm">
        <Card.Body className="p-4 text-muted">No active subscription.</Card.Body>
      </Card>
    );
  }

  return (
    <Card className="service-card border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 className="h5 mb-1">Active promotion</h3>
            <div className="text-muted small">{subscription.planType}</div>
          </div>
          <Badge bg={subscription.isActive ? "success" : "secondary"}>
            {subscription.paymentStatus}
          </Badge>
        </div>
        <div className="service-meta-grid">
          <div className="service-meta-item">
            <div className="service-meta-label">Amount</div>
            <div className="service-meta-value">{formatCurrency(subscription.amount)}</div>
          </div>
          <div className="service-meta-item">
            <div className="service-meta-label">Reference</div>
            <div className="service-meta-value">{subscription.paymentReference}</div>
          </div>
          <div className="service-meta-item">
            <div className="service-meta-label">Starts</div>
            <div className="service-meta-value">{formatDateTime(subscription.startsAt)}</div>
          </div>
          <div className="service-meta-item">
            <div className="service-meta-label">Ends</div>
            <div className="service-meta-value">{formatDateTime(subscription.endsAt)}</div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
