import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaRegClock,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";
import ApiService from "../../service/ApiService";
import ServiceProviderService from "../../service/ServiceProviderService";
import ServiceBookingModal from "./ServiceBookingModal";
import ServiceMediaGallery from "./ServiceMediaGallery";
import "../../style/ServicePublicProfile.css";

const formatCurrency = (value) => {
  if (value == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatServiceType = (value) => {
  if (!value) return "Service Provider";
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ServicePublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await ServiceProviderService.getPublicServiceProfile(userId);

        if (!response || response.status >= 400 || !response.serviceProfile) {
          setError(response?.message || "Service profile not available.");
          return;
        }

        setProfile(response.serviceProfile);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Unable to load service profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await ServiceProviderService.getServiceReviews(userId);

        if (!response || response.status >= 400) {
          setReviewError(response?.message || "Unable to load reviews.");
          setReviews([]);
          return;
        }

        setReviews(response.serviceReviews || []);
        setReviewError("");
      } catch (err) {
        console.error(err);
        setReviewError(err?.response?.data?.message || "Unable to load reviews.");
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [userId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!ApiService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    try {
      setSubmittingReview(true);

      const response = await ServiceProviderService.createOrUpdateReview(userId, reviewForm);

      if (!response || response.status >= 400) {
        alert(response?.message || "Unable to submit review.");
        return;
      }

      const refreshedReviews = await ServiceProviderService.getServiceReviews(userId);
      const refreshedProfile = await ServiceProviderService.getPublicServiceProfile(userId);

      setReviews(refreshedReviews?.serviceReviews || []);
      setProfile(refreshedProfile?.serviceProfile || profile);

      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Unable to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const priceText = useMemo(() => {
    if (!profile) return "";

    if (profile.priceFrom != null && profile.priceTo != null) {
      return `${formatCurrency(profile.priceFrom)} - ${formatCurrency(profile.priceTo)}`;
    }

    if (profile.priceFrom != null) {
      return `Starting at ${formatCurrency(profile.priceFrom)}`;
    }

    if (profile.priceTo != null) {
      return `Up to ${formatCurrency(profile.priceTo)}`;
    }

    return "Contact for pricing";
  }, [profile]);

  const locationText = useMemo(
    () => [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", "),
    [profile]
  );

  const headline = profile?.tagline || `Trusted ${formatServiceType(profile?.serviceType)} for pet owners`;
  const profileTitle = profile?.businessName || profile?.ownerName || "Service Provider";
  const featuredUntil = formatDate(profile?.sponsoredUntil);
  const heroMedia = profile?.coverMedia;
  const logoUrl =
    profile?.ownerProfileImageUrl ||
    profile?.coverImageUrl ||
    profile?.coverMedia?.thumbnailUrl ||
    profile?.coverMedia?.url ||
    "https://via.placeholder.com/160x160?text=CuttyPaws";

  const highlights = [
    profile?.acceptsHomeVisits ? "Home visits available" : null,
    profile?.offersEmergencyService ? "Emergency support offered" : null,
    profile?.yearsOfExperience ? `${profile.yearsOfExperience}+ years experience` : null,
    profile?.licenseNumber ? "Licensed provider" : null,
    priceText,
  ].filter(Boolean);

  const bookingAmount = useMemo(() => {
    if (profile?.priceFrom != null) return Number(profile.priceFrom);
    if (profile?.priceTo != null) return Number(profile.priceTo);
    return 0;
  }, [profile]);

  const handleOpenBookingModal = () => {
    if (!ApiService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setShowBookingModal(true);
  };

  useEffect(() => {
    if (!profile) return;
    console.debug("[PublicServiceProfilePage] profile media", {
      userId,
      profile,
      serviceMediaCount: profile?.serviceMedia?.length || 0,
      coverMedia: profile?.coverMedia,
    });
  }, [profile, userId]);

  if (loading) {
    return (
      <Container className="service-public-shell py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container className="service-public-shell py-5">
        <Alert variant="danger">{error || "Service profile not found."}</Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <div className="service-public-shell">
      <Container className="service-public-container py-3 py-lg-4">
        <div className="service-public-back-row">
          <button type="button" className="service-public-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        <Row className="justify-content-center">
          <Col xxl={8} xl={9} lg={10}>
            <article className="service-ad-card">
              <header className="service-ad-header">
                <div className="service-ad-branding">
                  <div className="service-ad-avatar-wrap">
                    <img
                      src={logoUrl}
                      alt={profileTitle}
                      className="service-ad-avatar"
                    />
                    {profile.isVerified ? (
                      <span className="service-ad-verified">
                        <FaCheckCircle />
                      </span>
                    ) : null}
                  </div>

                  <div className="service-ad-meta">
                    <div className="service-ad-meta-top">
                      <span className="service-ad-sponsored">Sponsored</span>
                      <span className="service-ad-dot">•</span>
                      <span className="service-ad-platform">CuttyPaws promoted listing</span>
                    </div>
                    <h1 className="service-ad-title">{profileTitle}</h1>
                    <div className="service-ad-subtitle">
                      <span>{formatServiceType(profile.serviceType)}</span>
                      {locationText ? (
                        <>
                          <span className="service-ad-dot">•</span>
                          <span>{locationText}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="service-ad-header-actions">
                  {profile.isVerified ? (
                    <Badge bg="success-subtle" text="success" className="service-ad-chip">
                      Verified
                    </Badge>
                  ) : null}
                  {featuredUntil ? (
                    <Badge bg="warning-subtle" text="dark" className="service-ad-chip">
                      Featured until {featuredUntil}
                    </Badge>
                  ) : null}
                </div>
              </header>

              <section className="service-ad-hero">
                <div className="service-ad-hero-copy">
                  <p className="service-ad-kicker">Promoted service</p>
                  <h2 className="service-ad-headline">{headline}</h2>
                  <p className="service-ad-description">
                    {profile.description || "Professional pet care tailored to your routine, location, and service needs."}
                  </p>

                  <div className="service-ad-highlight-row">
                    {highlights.map((item) => (
                      <span key={item} className="service-ad-highlight-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="service-ad-visual">
                  <div className="service-ad-visual-card">
                    {heroMedia?.type === "VIDEO" ? (
                      <video
                        src={heroMedia.url}
                        className="service-ad-hero-image"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={heroMedia?.url || profile.ownerProfileImageUrl || "https://via.placeholder.com/800x800?text=CuttyPaws+Service"}
                        alt={profileTitle}
                        className="service-ad-hero-image"
                      />
                    )}
                    <div className="service-ad-visual-overlay">
                      <div className="service-ad-visual-price">{priceText}</div>
                      <div className="service-ad-visual-rating">
                        <FaStar />
                        <span>{profile.averageRating?.toFixed?.(1) || "0.0"}</span>
                        <small>({profile.reviewCount || 0} reviews)</small>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="service-ad-body">
                <div className="service-ad-grid">
                  <Card className="service-ad-section">
                    <Card.Body>
                      <h3>At a glance</h3>
                      <div className="service-ad-stat-grid">
                        <div className="service-ad-stat-card">
                          <div className="service-ad-stat-label">Service</div>
                          <div className="service-ad-stat-value">{formatServiceType(profile.serviceType)}</div>
                        </div>
                        <div className="service-ad-stat-card">
                          <div className="service-ad-stat-label">Price</div>
                          <div className="service-ad-stat-value">{priceText}</div>
                        </div>
                        <div className="service-ad-stat-card">
                          <div className="service-ad-stat-label">Experience</div>
                          <div className="service-ad-stat-value">{profile.yearsOfExperience || 0}+ years</div>
                        </div>
                        <div className="service-ad-stat-card">
                          <div className="service-ad-stat-label">Rating</div>
                          <div className="service-ad-stat-value">
                            {profile.averageRating?.toFixed?.(1) || "0.0"} / 5
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="service-ad-section">
                    <Card.Body>
                      <h3>Why people click this ad</h3>
                      <ul className="service-ad-list">
                        <li>
                          <FaMapMarkerAlt />
                          <span>{profile.serviceArea || locationText || "Service area available on request"}</span>
                        </li>
                        <li>
                          <FaShieldAlt />
                          <span>{profile.licenseNumber ? "Licensed and professionally listed" : "Professional provider profile on CuttyPaws"}</span>
                        </li>
                        <li>
                          <FaRegClock />
                          <span>
                            {profile.offersEmergencyService
                              ? "Fast-response emergency support available"
                              : "Reliable scheduling for regular care"}
                          </span>
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </div>

                <Row className="g-3 mt-1">
                  <Col xs={12}>
                    <Card className="service-ad-section">
                      <Card.Body>
                        <h3>Gallery</h3>
                        <ServiceMediaGallery
                          media={profile.serviceMedia}
                          title={profileTitle}
                          emptyLabel="This provider has not uploaded promo media yet."
                        />
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={7}>
                    <Card className="service-ad-section service-ad-story">
                      <Card.Body>
                        <h3>About this provider</h3>
                        <p>{profile.description || "No description provided yet."}</p>
                        {profile.pricingNote ? (
                          <div className="service-ad-note">
                            <strong>Pricing note:</strong> {profile.pricingNote}
                          </div>
                        ) : null}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={5}>
                    <Card className="service-ad-section service-ad-contact">
                      <Card.Body>
                        <h3>Book on CuttyPaws</h3>
                        <div className="service-ad-contact-copy">
                          To protect bookings and keep payments traceable, provider contact actions are handled inside the platform.
                        </div>

                        <Button
                          variant="dark"
                          className="mt-3"
                          onClick={handleOpenBookingModal}
                        >
                          Book Service
                        </Button>

                        <div className="service-ad-platform-note">
                          Requests, scheduling, and future booking actions should stay on CuttyPaws rather than through private off-platform arrangements.
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="g-3 mt-1">
                  <Col xs={12}>
                    <Card className="service-ad-section">
                      <Card.Body>
                        <h3>Customer reviews</h3>

                        <div className="mb-4">
                          <strong>
                            {profile.averageRating?.toFixed?.(1) || "0.0"} / 5
                          </strong>{" "}
                          <span>based on {profile.reviewCount || 0} reviews</span>
                        </div>

                        <form onSubmit={handleSubmitReview} className="mb-4">
                          <div className="mb-3">
                            <label className="form-label">Your rating</label>
                            <select
                              className="form-select"
                              value={reviewForm.rating}
                              onChange={(e) =>
                                setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                              }
                            >
                              <option value={5}>5 - Excellent</option>
                              <option value={4}>4 - Very good</option>
                              <option value={3}>3 - Good</option>
                              <option value={2}>2 - Fair</option>
                              <option value={1}>1 - Poor</option>
                            </select>
                          </div>

                          <div className="mb-3">
                            <label className="form-label">Your review</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              value={reviewForm.comment}
                              onChange={(e) =>
                                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                              }
                              placeholder="Share your experience with this provider"
                            />
                          </div>

                          <Button type="submit" disabled={submittingReview}>
                            {submittingReview ? "Submitting..." : "Submit Review"}
                          </Button>
                        </form>

                        {reviewsLoading ? (
                          <Spinner animation="border" size="sm" />
                        ) : reviewError ? (
                          <Alert variant="warning">{reviewError}</Alert>
                        ) : reviews.length === 0 ? (
                          <p>No reviews yet. Be the first to leave one.</p>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {reviews.map((review) => (
                              <Card key={review.id} className="border-0 shadow-sm">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                      <img
                                        src={review.reviewerProfileImageUrl || "https://via.placeholder.com/48"}
                                        alt={review.reviewerName}
                                        width="40"
                                        height="40"
                                        style={{ borderRadius: "50%", objectFit: "cover" }}
                                      />
                                      <div>
                                        <div className="fw-semibold">{review.reviewerName}</div>
                                        <small className="text-muted">
                                          {formatDate(review.createdAt)}
                                        </small>
                                      </div>
                                    </div>

                                    <div className="fw-semibold">
                                      {review.rating} <FaStar />
                                    </div>
                                  </div>

                                  {review.comment ? <p className="mb-0">{review.comment}</p> : null}
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </section>
            </article>
          </Col>
        </Row>
      </Container>

      <ServiceBookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        serviceProfile={profile}
        defaultAmount={bookingAmount}
      />
    </div>
  );
}
