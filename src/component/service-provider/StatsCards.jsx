import { Card, Col, Row } from "react-bootstrap";
import { FaChartLine, FaDollarSign, FaEye, FaStar } from "react-icons/fa";
import { formatCurrency } from "../../utils/serviceProvider";

const statConfig = [
  {
    key: "rating",
    label: "Rating",
    icon: FaStar,
    getValue: (dashboard) => `${Number(dashboard?.serviceProfile?.averageRating || 0).toFixed(1)} / 5`,
    getTrend: (dashboard) =>
      Number(dashboard?.serviceProfile?.reviewCount || 0) > 0
        ? `${dashboard.serviceProfile.reviewCount} reviews received`
        : "No reviews yet",
  },
  {
    key: "bookings",
    label: "Total Bookings",
    icon: FaChartLine,
    getValue: () => "0",
    getTrend: () => "Booking analytics coming soon",
  },
  {
    key: "earnings",
    label: "Monthly Earnings",
    icon: FaDollarSign,
    getValue: () => formatCurrency(0),
    getTrend: () => "Connect payments to track revenue",
  },
  {
    key: "views",
    label: "Profile Views",
    icon: FaEye,
    getValue: () => "0",
    getTrend: () => "Visibility insights coming soon",
  },
];

export default function StatsCards({ dashboard }) {
  return (
    <Row className="g-3 mb-4">
      {statConfig.map((item) => {
        const Icon = item.icon;
        return (
          <Col key={item.key} xs={12} sm={6} xl={3}>
            <Card className="service-card service-stat-card border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <div className="service-stat-label">{item.label}</div>
                    <div className="service-stat-value">{item.getValue(dashboard)}</div>
                  </div>
                  <div className="service-stat-icon">
                    <Icon />
                  </div>
                </div>
                <div className="service-stat-trend mt-3">{item.getTrend(dashboard)}</div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
