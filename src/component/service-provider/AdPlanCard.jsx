import { Button, Card } from "react-bootstrap";
import { formatCurrency } from "../../utils/serviceProvider";

export default function AdPlanCard({ plan, selected, onSelect, disabled }) {
  return (
    <Card className={`service-card border-0 shadow-sm h-100 ${selected ? "service-plan-selected" : ""}`}>
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <div className="small text-uppercase text-muted fw-semibold">{plan.value}</div>
            <h3 className="h5 mb-1">{plan.label}</h3>
            <div className="text-muted small">{plan.durationDays} days</div>
          </div>
          <div className="fw-bold">{formatCurrency(plan.price)}</div>
        </div>
        <p className="text-muted flex-grow-1">{plan.description}</p>
        <Button variant={selected ? "dark" : "outline-dark"} onClick={() => onSelect(plan.value)} disabled={disabled}>
          {selected ? "Selected" : "Choose plan"}
        </Button>
      </Card.Body>
    </Card>
  );
}
