import { Badge, Card, Col, Row } from "react-bootstrap";
import {
  FaBriefcase,
  FaCalendarCheck,
  FaClock,
  FaGlobe,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaShieldAlt,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";
import {
  formatCurrency,
  formatDateTime,
  getServiceDisplayLabel,
  getServiceLocation,
  getServiceTypeLabel,
} from "../../utils/serviceProvider";

function DetailItem({ icon, label, value, children }) {
  if (value == null || value === "") return null;

  const Icon = icon;

  return (
    <Col sm={6} xl={4}>
      <div className="service-detail-card h-100">
        <div className="service-detail-label">
          {Icon ? <Icon /> : null}
          <span>{label}</span>
        </div>
        <div className="service-detail-value">{children || String(value)}</div>
      </div>
    </Col>
  );
}

export default function ServiceProfileCard({ profile }) {
  if (!profile) {
    return (
      <Card className="service-card border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="service-empty-state">
            <h3 className="h5 mb-2">No service profile yet</h3>
            <p className="text-muted mb-0">Your service details will appear here after your profile is created.</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const pricing =
    profile.priceFrom != null || profile.priceTo != null
      ? `${profile.priceFrom != null ? formatCurrency(profile.priceFrom) : "Custom"}${
          profile.priceTo != null ? ` - ${formatCurrency(profile.priceTo)}` : ""
        }`
      : null;
  const serviceTypeLabel = getServiceTypeLabel(profile.serviceType);
  const primaryTitle = profile.businessName || profile.ownerName || "Service Profile";
  const showPrimaryTitle = primaryTitle?.trim()?.toLowerCase() !== serviceTypeLabel?.trim()?.toLowerCase();

  return (
    <Card className="service-card border-0 shadow-sm">
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-4 mb-4">
          <div className="d-flex align-items-start gap-3">
            <div className="service-avatar">
              {profile.ownerProfileImageUrl ? (
                <img src={profile.ownerProfileImageUrl} alt={profile.ownerName || "Service owner"} className="service-avatar-image" />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                {showPrimaryTitle ? <h2 className="service-profile-title mb-0">{primaryTitle}</h2> : null}
                {profile.isVerified ? <Badge bg="success">Verified</Badge> : null}
              </div>
              <div className="service-profile-meta">
                {getServiceDisplayLabel(profile) || `${serviceTypeLabel}${getServiceLocation(profile) ? ` • ${getServiceLocation(profile)}` : ""}`}
              </div>
              {profile.tagline ? <div className="service-profile-tagline">{profile.tagline}</div> : null}
            </div>
          </div>
          <div className="service-rating-block">
            <div className="service-rating-value">
              <FaStar />
              <span>{Number(profile.averageRating || 0).toFixed(1)} / 5</span>
            </div>
            <div className="text-muted small">{profile.reviewCount || 0} reviews</div>
          </div>
        </div>

        {profile.description ? <p className="service-profile-description">{profile.description}</p> : null}

        <Row className="g-3">
          <DetailItem icon={FaBriefcase} label="Service Type" value={getServiceTypeLabel(profile.serviceType)} />
          <DetailItem icon={FaMapMarkerAlt} label="Location" value={getServiceLocation(profile)} />
          <DetailItem icon={FaMapMarkerAlt} label="Service Area" value={profile.serviceArea} />
          <DetailItem icon={FaMoneyBillWave} label="Pricing Range" value={pricing} />
          <DetailItem
            icon={FaClock}
            label="Experience"
            value={profile.yearsOfExperience != null ? `${profile.yearsOfExperience} years` : null}
          />
          <DetailItem icon={FaShieldAlt} label="Home Visits" value="Home visits available">
            <Badge bg={profile.acceptsHomeVisits ? "success" : "secondary"}>{profile.acceptsHomeVisits ? "Yes" : "No"}</Badge>
          </DetailItem>
          <DetailItem icon={FaShieldAlt} label="Emergency Service" value="Emergency service available">
            <Badge bg={profile.offersEmergencyService ? "warning" : "secondary"} text={profile.offersEmergencyService ? "dark" : undefined}>
              {profile.offersEmergencyService ? "Available" : "Unavailable"}
            </Badge>
          </DetailItem>
          <DetailItem icon={FaCalendarCheck} label="Approved Date" value={formatDateTime(profile.approvedAt)} />
          <DetailItem icon={FaGlobe} label="Website" value={profile.websiteUrl}>
            <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="service-detail-link">
              {profile.websiteUrl}
            </a>
          </DetailItem>
          <DetailItem icon={FaPhoneAlt} label="WhatsApp" value={profile.whatsappNumber}>
            <a href={`https://wa.me/${String(profile.whatsappNumber).replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer" className="service-detail-link">
              {profile.whatsappNumber}
            </a>
          </DetailItem>
        </Row>
      </Card.Body>
    </Card>
  );
}
