import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";

export default function ReviewForm({ onSubmit, submitting, disabled }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (disabled) {
      setError("Please sign in to leave a review.");
      return;
    }

    setError("");
    await onSubmit({ rating: Number(rating), comment: comment.trim() });
    setComment("");
  };

  return (
    <Card className="service-card border-0 shadow-sm">
      <Card.Body className="p-4">
        <h3 className="h5 mb-3">Write a review</h3>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Select value={rating} onChange={(event) => setRating(event.target.value)} disabled={submitting}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "star" : "stars"}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              maxLength={2000}
              onChange={(event) => setComment(event.target.value)}
              disabled={submitting}
            />
          </Form.Group>
          <Button type="submit" className="service-primary-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit review"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
