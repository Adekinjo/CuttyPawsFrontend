import { Badge, Button, Card } from "react-bootstrap";
import { FaArrowUp, FaCheckCircle, FaGem } from "react-icons/fa";
import { formatCurrency, formatDateTime } from "../../utils/serviceProvider";

export default function SubscriptionCard({ subscription, onUpgrade }) {
  const isActive = Boolean(subscription?.isActive);
  const planName = subscription?.planType || "Free";

  return (
    <Card className="service-card border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <div className="service-side-card-title">Subscription</div>
            <p className="service-side-card-copy mb-0">Keep your business visible and attract more customers.</p>
          </div>
          <div className="service-subscription-icon">
            <FaGem />
          </div>
        </div>

        <div className="service-plan-card mb-3">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div>
              <div className="service-plan-name">{planName}</div>
              <div className="service-plan-meta">
                {subscription ? `${formatCurrency(subscription.amount)} • ends ${formatDateTime(subscription.endsAt)}` : "No active paid plan"}
              </div>
            </div>
            <Badge bg={isActive ? "success" : "secondary"}>{isActive ? "Active" : "Free"}</Badge>
          </div>
        </div>

        <div className="service-benefits-list mb-3">
          <div className="service-benefit-item">
            <FaCheckCircle />
            <span>Promoted profile visibility</span>
          </div>
          <div className="service-benefit-item">
            <FaCheckCircle />
            <span>Priority placement in service discovery</span>
          </div>
          <div className="service-benefit-item">
            <FaCheckCircle />
            <span>Performance-ready growth tools</span>
          </div>
        </div>

        <Button className="service-primary-btn w-100 d-inline-flex align-items-center justify-content-center gap-2" onClick={onUpgrade}>
          <FaArrowUp />
          <span>Upgrade Plan</span>
        </Button>
      </Card.Body>
    </Card>
  );
}
