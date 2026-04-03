import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../service-provider/ServiceAds.css";
import "../post/ProductRecommendation.css";

const formatServiceType = (value) => {
  if (!value) return "Service Provider";

  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

const formatPrice = (priceFrom, priceTo) => {
  if (priceFrom != null && priceTo != null) {
    return `From $${priceFrom} to $${priceTo}`;
  }
  if (priceFrom != null) {
    return `Starting at $${priceFrom}`;
  }
  if (priceTo != null) {
    return `Up to $${priceTo}`;
  }
  return "Contact for pricing";
};

const getServiceAdImage = (profile) => {
  if (!profile) return null;

  if (profile?.coverImageUrl) return profile.coverImageUrl;

  const mediaImage = (profile?.media || []).find(
    (item) =>
      item?.mediaType === "IMAGE" &&
      item?.mediaUrl
  );

  return mediaImage?.mediaUrl || null;
};

const ServiceAdsCard = ({ serviceAd }) => {
  if (!serviceAd?.userId) return null;

  const profileTitle =
    serviceAd?.businessName ||
    serviceAd?.ownerName ||
    "Service Provider";

  const coverImageUrl = getServiceAdImage(serviceAd);

  const location = [
    serviceAd?.city,
    serviceAd?.state,
    serviceAd?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const highlights = [
    serviceAd?.acceptsHomeVisits ? "Home visits available" : null,
    serviceAd?.offersEmergencyService ? "Emergency support" : null,
    serviceAd?.yearsOfExperience
      ? `${serviceAd.yearsOfExperience}+ years experience`
      : null,
  ].filter(Boolean);

  return (
    <Link
      to={`/services/${serviceAd.userId}`}
      className="service-ad-card-v2__link service-ad-card-v2__card-link text-decoration-none text-reset d-block"
    >
      <Card className="service-ad-card-v2 border-0 product-recommendation-card shadow-sm overflow-hidden">
        <div className="product-recommendation-card__layout service-ad-card-v2__body-row">
          <div className="product-recommendation-card__media service-ad-card-v2__media service-ad-card-v2__media--product">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt={profileTitle}
                className="product-recommendation-card__image service-ad-card-v2__image service-ad-card-v2__image--product"
              />
            ) : (
              <div className="service-ad-card-v2__image service-ad-card-v2__image--fallback">
                <span>{profileTitle}</span>
              </div>
            )}
          </div>

          <div className="product-recommendation-card__content service-ad-card-v2__content">
            <small className="product-recommendation-card__eyebrow service-ad-card-v2__eyebrow">
              Sponsored service
            </small>

            <h5 className="product-recommendation-card__title service-ad-card-v2__title">
              {profileTitle}
            </h5>

            <p className="product-recommendation-card__category service-ad-card-v2__type">
              {formatServiceType(serviceAd?.serviceType)}
            </p>

            {location ? (
              <p className="service-ad-card-v2__location">{location}</p>
            ) : null}

            <p className="product-recommendation-card__description service-ad-card-v2__tagline">
              {serviceAd?.tagline ||
                serviceAd?.description ||
                "Trusted pet care tailored to your location and service needs."}
            </p>

            {highlights.length > 0 ? (
              <p className="service-ad-card-v2__highlights">
                {highlights.join(" • ")}
              </p>
            ) : null}

            <div className="product-recommendation-card__footer service-ad-card-v2__footer service-ad-card-v2__footer-row">
              <strong className="product-recommendation-card__price service-ad-card-v2__price">
                {formatPrice(serviceAd?.priceFrom, serviceAd?.priceTo)}
              </strong>

              <span className="product-recommendation-card__button service-ad-card-v2__button">
                Learn More
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceAdsCard;