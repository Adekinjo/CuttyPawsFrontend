import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import AiService from "../../service/AIService";

const AIHelpPage = () => {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [image, setImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  const cleanedAnswer = useMemo(() => {
    if (!response?.answer) return "";

    return response.answer
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/\*\*/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }, [response]);

  const slugify = (text) => {
    return (text || "uncategorized")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleOpenProduct = (product) => {
    if (!product?.id) return;

    const categorySlug = slugify(product.category || "uncategorized");
    const subCategorySlug = slugify(product.subCategory || "uncategorized");
    const productSlug = slugify(product.name || "product");

    navigate(
      `/product/${categorySlug}/${subCategorySlug}/${productSlug}/dp/${product.id}`
    );
  };

  const truncateText = (text, limit = 110) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter your question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResponse(null);

      let result;

      if (image) {
        result = await AiService.sendSupportMessageWithImage({
          prompt,
          image,
          city,
          state,
        });
      } else {
        result = await AiService.sendSupportMessage(prompt, city, state, 25);
      }

      setResponse(result);
    } catch (err) {
      setError(err.message || "Unable to get AI help right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4 py-lg-5">
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card
            className="border-0 shadow-sm mb-4"
            style={{ borderRadius: "24px" }}
          >
            <Card.Body className="p-4">
              <h2 className="mb-2">Ask Cutty</h2>
              <p className="text-muted mb-4">
                Ask about pet health, products, services, orders, or payment.
              </p>

              <Form onSubmit={handleSubmit}>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "24px",
                    padding: "16px",
                    background: "#fff",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask anything about your pet, products, services, orders, or payments..."
                    style={{
                      border: "none",
                      boxShadow: "none",
                      resize: "none",
                      fontSize: "1rem",
                      padding: 0,
                    }}
                  />

                  <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Form.Label
                        htmlFor="ai-image-upload"
                        className="mb-0 px-3 py-2"
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "999px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          background: "#fff",
                        }}
                      >
                        Upload image
                      </Form.Label>

                      <Form.Control
                        id="ai-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        style={{ display: "none" }}
                      />

                      {image && (
                        <span className="text-muted small">{image.name}</span>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      style={{
                        borderRadius: "999px",
                        padding: "10px 18px",
                        fontWeight: 600,
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Asking...
                        </>
                      ) : (
                        "Ask"
                      )}
                    </Button>
                  </div>
                </div>

                <details className="mt-3">
                  <summary
                    className="text-muted"
                    style={{ cursor: "pointer", userSelect: "none" }}
                  >
                    More options
                  </summary>

                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Optional"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Optional"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </details>

                {error && (
                  <Alert variant="danger" className="mt-3 mb-0">
                    {error}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>

          {response && (
            <Card className="shadow-sm border-0" style={{ borderRadius: "24px" }}>
              <Card.Body className="p-4">
                <h4 className="mb-3">AI Response</h4>

                {!!cleanedAnswer && (
                  <div
                    className="text-dark"
                    style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}
                  >
                    {cleanedAnswer}
                  </div>
                )}

                {response.disclaimer && (
                  <Alert variant="warning" className="mt-4 mb-0">
                    {response.disclaimer}
                  </Alert>
                )}

                {Array.isArray(response.followUpQuestions) &&
                  response.followUpQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5>Helpful follow-up questions</h5>
                      <ul className="mb-0 ps-4">
                        {response.followUpQuestions.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                {Array.isArray(response.recommendedProducts) &&
                  response.recommendedProducts.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-3">Recommended products</h5>
                      <Row className="g-3">
                        {response.recommendedProducts.map((product) => (
                          <Col md={6} key={product.id}>
                            <Card
                              className="border-0 shadow-sm h-100"
                              style={{
                                cursor: "pointer",
                                borderRadius: "18px",
                                overflow: "hidden",
                              }}
                              onClick={() => handleOpenProduct(product)}
                            >
                              {product.thumbnailImageUrl && (
                                <Card.Img
                                  variant="top"
                                  src={product.thumbnailImageUrl}
                                  alt={product.name}
                                  style={{
                                    height: "220px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}

                              <Card.Body>
                                <div className="fw-bold mb-1">{product.name}</div>

                                {product.category && (
                                  <div className="text-muted mb-2">
                                    {product.category}
                                  </div>
                                )}

                                {product?.description && (
                                  <div
                                    className="text-muted mb-2"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden"
                                    }}
                                  >
                                    {product.description}
                                  </div>
                                )}

                                {product.newPrice && (
                                  <div className="fw-semibold fs-5">
                                    ${product.newPrice}
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                {Array.isArray(response.recommendedServices) &&
                  response.recommendedServices.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-3">Recommended service providers</h5>
                      <Row className="g-3">
                        {response.recommendedServices.map((service) => (
                          <Col md={6} key={service.id}>
                            <Card
                              className="border-0 shadow-sm h-100"
                              style={{
                                cursor: "pointer",
                                borderRadius: "18px",
                                overflow: "hidden",
                              }}
                              onClick={() => navigate(`/services/${service.userId || service.id}`)}
                            >
                              {service.coverImageUrl && (
                                <Card.Img
                                  variant="top"
                                  src={service.coverImageUrl}
                                  alt={service.businessName || service.ownerName || "Service provider"}
                                  style={{
                                    height: "220px",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}

                              <Card.Body>
                                <div className="fw-bold mb-1">
                                  {service.businessName || service.ownerName}
                                </div>

                                {service.displayLabel && (
                                  <div className="text-muted mb-2">
                                    {service.displayLabel}
                                  </div>
                                )}

                                {service.description && (
                                  <div className="text-muted mb-2">
                                    {service.description.length > 110
                                      ? `${service.description.substring(0, 110)}...`
                                      : service.description}
                                  </div>
                                )}

                                <div className="small text-muted">
                                  {[service.city, service.state].filter(Boolean).join(", ")}
                                </div>

                                {service.priceFrom && (
                                  <div className="fw-semibold fs-6 mt-2">
                                    Starting from: ${service.priceFrom}
                                  </div>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AIHelpPage;