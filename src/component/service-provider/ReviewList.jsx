import { Alert, Card, ListGroup, Spinner } from "react-bootstrap";
import { formatDateTime } from "../../utils/serviceProvider";

export default function ReviewList({ reviews, loading, error }) {
  if (loading) {
    return (
      <Card className="service-card border-0 shadow-sm">
        <Card.Body className="p-4 text-center">
          <Spinner animation="border" />
          <div className="mt-2 text-muted">Loading reviews...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!reviews?.length) {
    return (
      <Card className="service-card border-0 shadow-sm">
        <Card.Body className="p-4 text-muted text-center">No reviews yet.</Card.Body>
      </Card>
    );
  }

  return (
    <Card className="service-card border-0 shadow-sm">
      <ListGroup variant="flush">
        {reviews.map((review) => (
          <ListGroup.Item key={review.id} className="p-4">
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div>
                <div className="fw-semibold">{review.reviewerName}</div>
                <div className="small text-muted">{formatDateTime(review.updatedAt || review.createdAt)}</div>
              </div>
              <div className="fw-semibold">{review.rating} / 5</div>
            </div>
            {review.comment ? <p className="mb-0 mt-3 text-muted">{review.comment}</p> : null}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
}
