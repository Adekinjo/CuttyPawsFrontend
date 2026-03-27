import { Card } from "react-bootstrap";
import { FaArrowTrendUp, FaBullseye } from "react-icons/fa6";

function getInsight(profile) {
  const rating = Number(profile?.averageRating || 0);
  const reviews = Number(profile?.reviewCount || 0);

  if (!reviews) {
    return {
      title: "Your profile needs social proof",
      body: "Ask your first customers to leave reviews so new pet owners can trust your business faster.",
      metric: "0 reviews",
    };
  }

  if (rating < 4) {
    return {
      title: "Your profile is performing below average",
      body: "Refresh your description, update pricing details, and encourage more recent reviews to improve conversion.",
      metric: `${rating.toFixed(1)} average rating`,
    };
  }

  return {
    title: "Your profile is in good shape",
    body: "Keep your public profile fresh and consider running adverts to increase local reach.",
    metric: `${reviews} reviews collected`,
  };
}

export default function PerformanceInsightsCard({ profile }) {
  const insight = getInsight(profile);

  return (
    <Card className="service-card border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <div className="service-side-card-title">Performance Insights</div>
            <p className="service-side-card-copy mb-0">A lightweight snapshot of how your service profile is doing.</p>
          </div>
          <div className="service-insight-icon">
            <FaBullseye />
          </div>
        </div>

        <div className="service-mini-chart mb-3" aria-hidden="true">
          <span className="service-mini-chart-bar is-short" />
          <span className="service-mini-chart-bar is-medium" />
          <span className="service-mini-chart-bar is-tall" />
          <span className="service-mini-chart-bar is-medium" />
          <span className="service-mini-chart-bar is-short" />
        </div>

        <div className="service-insight-title">{insight.title}</div>
        <div className="service-insight-body">{insight.body}</div>
        <div className="service-insight-metric">
          <FaArrowTrendUp />
          <span>{insight.metric}</span>
        </div>
      </Card.Body>
    </Card>
  );
}
