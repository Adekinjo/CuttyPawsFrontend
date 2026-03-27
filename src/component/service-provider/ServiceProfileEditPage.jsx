import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ServiceMediaGallery from "./ServiceMediaGallery";
import ServiceProviderService from "../../service/ServiceProviderService";
import { SERVICE_TYPES } from "../../utils/serviceProvider";
import "../../style/ServiceProvider.css";

const SERVICE_PROFILE_FIELDS = [
  "serviceType",
  "businessName",
  "tagline",
  "description",
  "city",
  "state",
  "country",
  "zipcode",
  "serviceArea",
  "addressLine",
  "latitude",
  "longitude",
  "priceFrom",
  "priceTo",
  "pricingNote",
  "yearsOfExperience",
  "licenseNumber",
  "websiteUrl",
  "whatsappNumber",
  "acceptsHomeVisits",
  "offersEmergencyService",
];

const FIELD_LABELS = {
  businessName: "Business name",
  tagline: "Tagline",
  city: "City",
  state: "State",
  country: "Country",
  zipcode: "Zip code",
  serviceArea: "Service area",
  addressLine: "Address line",
  priceFrom: "Price from",
  priceTo: "Price to",
  pricingNote: "Pricing note",
  yearsOfExperience: "Years of experience",
  licenseNumber: "License number",
  websiteUrl: "Website URL",
  whatsappNumber: "WhatsApp number",
};

const NUMBER_FIELDS = ["latitude", "longitude", "priceFrom", "priceTo", "yearsOfExperience"];
const FULL_WIDTH_FIELDS = ["tagline", "pricingNote", "addressLine"];

function normalizeOptionalNumber(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildServiceProfilePayload(profile) {
  return SERVICE_PROFILE_FIELDS.reduce((payload, field) => {
    const value = profile?.[field];

    if (NUMBER_FIELDS.includes(field)) {
      payload[field] = normalizeOptionalNumber(value);
      return payload;
    }

    payload[field] = value ?? (field === "serviceType" ? "" : null);
    return payload;
  }, {});
}

function getReadableError(err) {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(", ");
  }

  return "Unable to update service profile. Please check the form values and try again.";
}

export default function ServiceProfileEditPage() {
  const [profile, setProfile] = useState(null);
  const [serviceMedia, setServiceMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaActionId, setMediaActionId] = useState(null);
  const [error, setError] = useState("");
  const [mediaError, setMediaError] = useState("");

  useEffect(() => {
    loadProfile();
    loadMedia();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await ServiceProviderService.getMyServiceProfile();
      setProfile(response.serviceProfile || {});
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load service profile.");
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      setMediaLoading(true);
      const response = await ServiceProviderService.getMyServiceMedia();
      setServiceMedia(response.serviceMedia || []);
      setMediaError("");
    } catch (err) {
      setMediaError(err?.response?.data?.message || "Unable to load service media.");
    } finally {
      setMediaLoading(false);
    }
  };

  const setField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    try {
      setMediaUploading(true);
      setMediaError("");
      const response = await ServiceProviderService.uploadMyServiceMedia(files);

      if (response?.status >= 400) {
        throw new Error(response?.message || "Unable to upload service media.");
      }

      toast.success(response?.message || "Service media uploaded successfully.");
      await Promise.all([loadMedia(), loadProfile()]);
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || "Unable to upload service media.";
      setMediaError(message);
      toast.error(message);
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      setMediaActionId(mediaId);
      setMediaError("");
      const response = await ServiceProviderService.deleteMyServiceMedia(mediaId);

      if (response?.status >= 400) {
        throw new Error(response?.message || "Unable to delete service media.");
      }

      toast.success(response?.message || "Media deleted.");
      await Promise.all([loadMedia(), loadProfile()]);
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || "Unable to delete service media.";
      setMediaError(message);
      toast.error(message);
    } finally {
      setMediaActionId(null);
    }
  };

  const handleSetCover = async (mediaId) => {
    try {
      setMediaActionId(mediaId);
      setMediaError("");
      const response = await ServiceProviderService.setMyServiceMediaCover(mediaId);

      if (response?.status >= 400) {
        throw new Error(response?.message || "Unable to set cover media.");
      }

      toast.success(response?.message || "Cover media updated.");
      await Promise.all([loadMedia(), loadProfile()]);
    } catch (err) {
      const message = err?.message || err?.response?.data?.message || "Unable to set cover media.";
      setMediaError(message);
      toast.error(message);
    } finally {
      setMediaActionId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = buildServiceProfilePayload(profile);
      console.log("[ServiceProfileEditPage] update payload", payload);
      const response = await ServiceProviderService.updateMyServiceProfile(payload);
      setProfile(response.serviceProfile || profile);
      await ServiceProviderService.refreshDashboard();
      toast.success(response.message || "Service profile updated successfully.");
    } catch (err) {
      console.error("[ServiceProfileEditPage] update error", err?.response?.data || err);
      setError(getReadableError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 service-provider-page text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5 service-provider-page">
      <div className="mb-4">
        <div className="service-eyebrow">Service Provider Dashboard</div>
        <h1 className="h2 mb-2">Edit service profile</h1>
      </div>
      {error ? (
        <Alert variant="danger" className="service-form-alert" role="alert">
          <div className="service-form-alert__title">Unable to save service profile</div>
          <div className="service-form-alert__message">{error}</div>
        </Alert>
      ) : null}
      <Card className="service-card border-0 shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Service type</Form.Label>
                  <Form.Select value={profile.serviceType || ""} onChange={(event) => setField("serviceType", event.target.value)}>
                    <option value="">Select service type</option>
                    {SERVICE_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {[
                "businessName",
                "tagline",
                "city",
                "state",
                "country",
                "zipcode",
                "serviceArea",
                "addressLine",
                "priceFrom",
                "priceTo",
                "pricingNote",
                "yearsOfExperience",
                "licenseNumber",
                "websiteUrl",
                "whatsappNumber",
              ].map((field) => (
                <Col md={FULL_WIDTH_FIELDS.includes(field) ? 12 : 6} key={field}>
                  <Form.Group>
                    <Form.Label>{FIELD_LABELS[field] || field}</Form.Label>
                    <Form.Control
                      type={NUMBER_FIELDS.includes(field) ? "number" : "text"}
                      step={["latitude", "longitude", "priceFrom", "priceTo"].includes(field) ? "0.01" : undefined}
                      min={["priceFrom", "priceTo", "yearsOfExperience"].includes(field) ? "0" : undefined}
                      value={profile[field] ?? ""}
                      onChange={(event) => setField(field, event.target.value)}
                    />
                  </Form.Group>
                </Col>
              ))}
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={profile.description || ""}
                    onChange={(event) => setField("description", event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Accepts home visits"
                  checked={Boolean(profile.acceptsHomeVisits)}
                  onChange={(event) => setField("acceptsHomeVisits", event.target.checked)}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  label="Offers emergency service"
                  checked={Boolean(profile.offersEmergencyService)}
                  onChange={(event) => setField("offersEmergencyService", event.target.checked)}
                />
              </Col>
            </Row>
            <div className="d-flex gap-3 mt-4">
              <Button type="submit" className="service-primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="outline-secondary" onClick={loadProfile} disabled={saving}>
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="service-card border-0 shadow-sm mt-4">
        <Card.Body className="p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
            <div>
              <h2 className="h4 mb-1">Ad and profile media</h2>
              <p className="text-muted mb-0">
                Upload photos or videos for your public profile. The item marked as cover is the image shown on your ads card and profile header.
              </p>
            </div>

            <Form.Group controlId="serviceMediaUpload" className="mb-0">
              <Form.Label className="mb-0">
                <span className="btn service-primary-btn">
                  {mediaUploading ? "Uploading..." : "Upload ad media"}
                </span>
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,video/*"
                className="d-none"
                onChange={handleMediaUpload}
                disabled={mediaUploading}
              />
            </Form.Group>
          </div>

          {mediaError ? (
            <Alert variant="danger" className="service-form-alert" role="alert">
              <div className="service-form-alert__title">Media action failed</div>
              <div className="service-form-alert__message">{mediaError}</div>
            </Alert>
          ) : null}

          {mediaLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <ServiceMediaGallery
                media={serviceMedia}
                title={profile?.businessName || profile?.ownerName || "Service Provider"}
                emptyLabel="Upload your first image or video, then choose one image as the cover for your ads card and public profile."
              />

              {serviceMedia.length ? (
                <div className="service-media-manager-grid mt-3">
                  {serviceMedia.map((item) => (
                    <div key={item.id} className="service-media-manager-card">
                      <div>
                        <div className="service-media-manager-type">{item.type === "VIDEO" ? "Video" : "Image"}</div>
                        <div className="service-media-manager-url">{item.url}</div>
                      </div>

                      <div className="d-flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={item.isCover ? "dark" : "outline-dark"}
                          size="sm"
                          disabled={item.isCover || mediaActionId === item.id}
                          onClick={() => handleSetCover(item.id)}
                        >
                          {item.isCover ? "Used as ad cover" : "Use as ad cover"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline-danger"
                          size="sm"
                          disabled={mediaActionId === item.id}
                          onClick={() => handleDeleteMedia(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
