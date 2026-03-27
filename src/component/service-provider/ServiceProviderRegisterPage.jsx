import { useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceProviderService from "../../service/ServiceProviderService";
import { SERVICE_TYPES } from "../../utils/serviceProvider";
import "../../style/ServiceProvider.css";

const initialForm = {
  user: {
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    companyName: "",
    businessRegistrationNumber: "",
  },
  serviceProfile: {
    serviceType: "",
    businessName: "",
    tagline: "",
    description: "",
    city: "",
    state: "",
    country: "USA",
    zipcode: "",
    serviceArea: "",
    addressLine: "",
    priceFrom: "",
    priceTo: "",
    pricingNote: "",
    yearsOfExperience: "",
    licenseNumber: "",
    websiteUrl: "",
    whatsappNumber: "",
    acceptsHomeVisits: false,
    offersEmergencyService: false,
  },
};

export default function ServiceProviderRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(() => ({
    ...initialForm,
    user: { ...initialForm.user },
    serviceProfile: {
      ...initialForm.serviceProfile,
      serviceType: location.state?.serviceType || initialForm.serviceProfile.serviceType,
    },
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = (section, field, value) => {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        user: { ...formData.user },
        serviceProfile: {
          ...formData.serviceProfile,
          priceFrom: formData.serviceProfile.priceFrom ? Number(formData.serviceProfile.priceFrom) : null,
          priceTo: formData.serviceProfile.priceTo ? Number(formData.serviceProfile.priceTo) : null,
          yearsOfExperience: formData.serviceProfile.yearsOfExperience
            ? Number(formData.serviceProfile.yearsOfExperience)
            : null,
        },
      };

      const response = await ServiceProviderService.registerServiceProvider(payload);
      toast.success(response.message || "Application submitted successfully.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit your application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5 service-provider-page">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow service-card">
            <Card.Body className="p-4 p-lg-5">
              <div className="mb-4">
                <div className="service-eyebrow">CuttyPaws Services</div>
                <h1 className="h2 mb-2">Register as a service provider</h1>
                <p className="text-muted mb-0">
                  Submit your provider profile. Your application stays pending until admin approval.
                </p>
              </div>

              {error ? <Alert variant="danger">{error}</Alert> : null}

              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Full name</Form.Label>
                      <Form.Control
                        required
                        value={formData.user.name}
                        onChange={(event) => setField("user", "name", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        required
                        value={formData.user.email}
                        onChange={(event) => setField("user", "email", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone number</Form.Label>
                      <Form.Control
                        required
                        value={formData.user.phoneNumber}
                        onChange={(event) => setField("user", "phoneNumber", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        required
                        value={formData.user.password}
                        onChange={(event) => setField("user", "password", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Company name</Form.Label>
                      <Form.Control
                        value={formData.user.companyName}
                        onChange={(event) => setField("user", "companyName", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Business registration number</Form.Label>
                      <Form.Control
                        value={formData.user.businessRegistrationNumber}
                        onChange={(event) => setField("user", "businessRegistrationNumber", event.target.value)}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Service type</Form.Label>
                      <Form.Select
                        required
                        value={formData.serviceProfile.serviceType}
                        onChange={(event) => setField("serviceProfile", "serviceType", event.target.value)}
                      >
                        <option value="">Select service type</option>
                        {SERVICE_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Business name</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.businessName}
                        onChange={(event) => setField("serviceProfile", "businessName", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Tagline</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.tagline}
                        onChange={(event) => setField("serviceProfile", "tagline", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={formData.serviceProfile.description}
                        onChange={(event) => setField("serviceProfile", "description", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.city}
                        onChange={(event) => setField("serviceProfile", "city", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.state}
                        onChange={(event) => setField("serviceProfile", "state", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Zip code</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.zipcode}
                        onChange={(event) => setField("serviceProfile", "zipcode", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Service area</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.serviceArea}
                        onChange={(event) => setField("serviceProfile", "serviceArea", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address line</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.addressLine}
                        onChange={(event) => setField("serviceProfile", "addressLine", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Price from</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.serviceProfile.priceFrom}
                        onChange={(event) => setField("serviceProfile", "priceFrom", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Price to</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.serviceProfile.priceTo}
                        onChange={(event) => setField("serviceProfile", "priceTo", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Pricing note</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.pricingNote}
                        onChange={(event) => setField("serviceProfile", "pricingNote", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Years of experience</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={formData.serviceProfile.yearsOfExperience}
                        onChange={(event) => setField("serviceProfile", "yearsOfExperience", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>License number</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.licenseNumber}
                        onChange={(event) => setField("serviceProfile", "licenseNumber", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Website URL</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.websiteUrl}
                        onChange={(event) => setField("serviceProfile", "websiteUrl", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>WhatsApp number</Form.Label>
                      <Form.Control
                        value={formData.serviceProfile.whatsappNumber}
                        onChange={(event) => setField("serviceProfile", "whatsappNumber", event.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Check
                      type="switch"
                      label="Home visits"
                      checked={formData.serviceProfile.acceptsHomeVisits}
                      onChange={(event) => setField("serviceProfile", "acceptsHomeVisits", event.target.checked)}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Check
                      type="switch"
                      label="Emergency service"
                      checked={formData.serviceProfile.offersEmergencyService}
                      onChange={(event) => setField("serviceProfile", "offersEmergencyService", event.target.checked)}
                    />
                  </Col>
                </Row>

                <div className="d-flex gap-3 mt-4">
                  <Button type="submit" className="service-primary-btn" disabled={submitting}>
                    {submitting ? <><Spinner size="sm" className="me-2" />Submitting...</> : "Submit application"}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => navigate("/login")} disabled={submitting}>
                    Sign in instead
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
