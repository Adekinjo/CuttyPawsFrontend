import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert, Container, Row, Col, Card, Badge, Button,
  ListGroup, Image, Stack, Spinner
} from "react-bootstrap";
import {
  FaBox, FaTag, FaPalette, FaRulerVertical, FaMoneyBillAlt,
  FaCalendarAlt, FaUser, FaMapMarkerAlt,
  FaEnvelope, FaPhone, FaTruck, FaHistory, FaHeadset
} from "react-icons/fa";
import ApiService from "../../service/ApiService";

const statusConfig = {
  PENDING: { color: "#f6ad55", label: "Pending" },
  CONFIRMED: { color: "#4299e1", label: "Confirmed" },
  SHIPPED: { color: "#9f7aea", label: "Shipped" },
  DELIVERED: { color: "#48bb78", label: "Delivered" },
  CANCELLED: { color: "#f56565", label: "Cancelled" },
  RETURNED: { color: "#667eea", label: "Returned" },
  UNKNOWN: { color: "#718096", label: "Unknown" }
};

const OrderDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [orderItem, setOrderItem] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false); // To prevent infinite image loading loop

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService.getOrderItemById(itemId);

        if (!response || !response.orderItemList || response.orderItemList.length === 0) {
          throw new Error("No data received from the API");
        }

        setOrderItem(response.orderItemList[0]); // Access the first item in the array
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) fetchOrderDetails();
  }, [itemId]);

  const getStatusBadge = (status) => {
    const normalizedStatus = String(status || 'UNKNOWN').toUpperCase(); // Ensure status is a string
    const config = statusConfig[normalizedStatus] || statusConfig.UNKNOWN;

    return (
      <Badge
        pill
        style={{
          backgroundColor: config.color,
          color: getContrastColor(config.color)
        }}
      >
        {config.label}
      </Badge>
    );
  };

  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000' : '#fff';
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading order details...</p>
      </div>
    );
  }

  if (!orderItem) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          Failed to load order details. Please try again later.
        </Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button variant="link" onClick={() => navigate(-1)} className="mb-4">
        &larr; Back to Profile
      </Button>

      {message && (
        <Alert variant={message.includes("success") ? "success" : "danger"}>
          {message}
        </Alert>
      )}

      <Row className="g-4">
        {/* Product Details Column */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <FaBox className="me-2" />
              <h4 className="mb-0">Product Details</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Image
                    src={orderItem.productImageUrl || "/path/to/local/fallback-image.png"} // Use a local fallback image
                    alt={orderItem.productName}
                    fluid
                    thumbnail
                    className="mb-3"
                    onError={(e) => {
                      if (!imageError) {
                        e.target.src = "/path/to/local/fallback-image.png"; // Fallback to a local image
                        setImageError(true); // Prevent further onError calls
                      }
                    }}
                  />
                </Col>
                <Col md={8}>
                  <h3>{orderItem.productName}</h3>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <FaTag className="me-2" />
                      SKU: {orderItem.productSku || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaPalette className="me-2" />
                      Color: {orderItem.selectedColor || 'N/A'} <span
                        className="color-dot"
                        style={{ backgroundColor: orderItem.selectedColor || "#ccc" }}
                      />
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaRulerVertical className="me-2" />
                      Size: {orderItem.selectedSize || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <FaMoneyBillAlt className="me-2" />
                      Price: ₦{(orderItem.price * orderItem.quantity).toFixed(2)}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Status Timeline */}
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaHistory className="me-2" />
              <h4 className="mb-0">Status Timeline</h4>
            </Card.Header>
            <Card.Body>
              <Stack gap={3}>
                {Object.entries(statusConfig).map(([statusKey, config]) => {
                  const isActive = String(orderItem.status || 'UNKNOWN').toUpperCase() === statusKey;
                  return (
                    <div
                      key={statusKey}
                      className="d-flex align-items-center justify-content-between p-2"
                      style={{
                        backgroundColor: isActive ? "#f8f9fa" : "transparent",
                        borderRadius: "8px",
                        border: isActive ? "1px solid #ddd" : "none"
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="timeline-icon"
                          style={{
                            backgroundColor: config.color,
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: getContrastColor(config.color)
                          }}
                        >
                          {config.label[0]}
                        </div>
                        <div className="timeline-label">{config.label}</div>
                      </div>
                      {isActive && (
                        <div className="timeline-date">
                          {new Date(orderItem.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Stack>
            </Card.Body>
          </Card>
        </Col>

        {/* Customer Information and Support Button */}
        <Col lg={4}>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaUser className="me-2" />
              <h4 className="mb-0">Customer Details</h4>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <FaUser className="me-2" />
                  {orderItem.user?.name || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaEnvelope className="me-2" />
                  {orderItem.user?.email || 'N/A'}
                </ListGroup.Item>
                <ListGroup.Item>
                  <FaPhone className="me-2" />
                  {orderItem.user?.phoneNumber || 'N/A'}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          <Card className="mt-4">
            <Card.Header className="d-flex align-items-center">
              <FaTruck className="me-2" />
              <h4 className="mb-0">Shipping Details</h4>
            </Card.Header>
            <Card.Body>
              {orderItem.user?.address ? (
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <FaMapMarkerAlt className="me-2" />
                    {orderItem.user.address.street || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {orderItem.user.address.city || 'N/A'}, {orderItem.user.address.state || 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    {orderItem.user.address.zipcode || 'N/A'}, {orderItem.user.address.country || 'N/A'}
                  </ListGroup.Item>
                </ListGroup>
              ) : (
                <div className="text-muted">No shipping address provided</div>
              )}
            </Card.Body>
          </Card>

          {/* Customer Support Button */}
          <Card className="mt-4">
            <Card.Body className="text-center">
              <Button
                variant="primary"
                onClick={() => navigate("/customer-support")}
                className="w-100"
              >
                <FaHeadset className="me-2" />
                Contact Customer Support
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;