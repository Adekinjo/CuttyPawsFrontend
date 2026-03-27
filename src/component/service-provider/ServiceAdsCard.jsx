import { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../service-provider/ServiceAds.css"
import "../post/ProductRecommendation.css"
import ServiceProviderService from "../../service/ServiceProviderService";

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

  const coverCandidate =
    profile?.coverMedia?.type === "IMAGE"
      ? profile.coverMedia?.url || profile.coverMedia?.thumbnailUrl
      : null;

  if (coverCandidate) return coverCandidate;

  const mediaImage = (profile?.serviceMedia || []).find(
    (item) => item?.type === "IMAGE" && (item?.url || item?.thumbnailUrl)
  );

  return mediaImage?.url || mediaImage?.thumbnailUrl || null;
};

const ServiceAdsCard = ({ serviceAd }) => {
  const [failedCoverUrl, setFailedCoverUrl] = useState(null);
  const [publicProfile, setPublicProfile] = useState(null);

  const normalizedServiceAd = useMemo(
    () => ServiceProviderService.normalizeServiceProfile(serviceAd),
    [serviceAd]
  );

  const displayProfile = publicProfile || normalizedServiceAd || serviceAd;

  const profileTitle =
    displayProfile?.businessName ||
    displayProfile?.ownerName ||
    "Service Provider";

  const coverImageUrl = getServiceAdImage(displayProfile);
  const hasCoverImage = Boolean(
    coverImageUrl && failedCoverUrl !== coverImageUrl
  );

  const location = [
    displayProfile?.city,
    displayProfile?.state,
    displayProfile?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const highlights = [
    displayProfile?.acceptsHomeVisits ? "Home visits available" : null,
    displayProfile?.offersEmergencyService ? "Emergency support" : null,
    displayProfile?.yearsOfExperience
      ? `${displayProfile.yearsOfExperience}+ years experience`
      : null,
  ].filter(Boolean);

  useEffect(() => {
    let mounted = true;

    const loadPublicProfile = async () => {
      if (!serviceAd?.userId) return;

      try {
        const cached = ServiceProviderService.getCachedPublicServiceProfile(
          serviceAd.userId
        );

        if (cached?.status === 200 && mounted) {
          setPublicProfile(cached.serviceProfile || null);
        }

        const response = await ServiceProviderService.getPublicServiceProfile(
          serviceAd.userId
        );

        if (mounted && response?.status === 200) {
          ServiceProviderService.setCachedPublicServiceProfile(
            serviceAd.userId,
            response
          );
          setPublicProfile(response.serviceProfile || null);
        }
      } catch (error) {
        console.error("[ServiceAdsCard] Failed to load public profile:", error);
      }
    };

    loadPublicProfile();

    return () => {
      mounted = false;
    };
  }, [serviceAd?.userId]);

  return (
    <Link
      to={`/services/${displayProfile?.userId || serviceAd?.userId}`}
      className="service-ad-card-v2__link service-ad-card-v2__card-link text-decoration-none text-reset d-block"
    >
      <Card
        className={`service-ad-card-v2 border-0${hasCoverImage ? " product-recommendation-card service-ad-card-v2--product-style shadow-sm overflow-hidden" : ""}`}
      >
        <div className={hasCoverImage ? "service-ad-card-v2__stack" : undefined}>
          <div
            className={hasCoverImage ? "product-recommendation-card__layout service-ad-card-v2__body-row" : "service-ad-card-v2__layout"}
          >
            <div
              className={hasCoverImage ? "product-recommendation-card__media service-ad-card-v2__media service-ad-card-v2__media--product" : "service-ad-card-v2__media"}
            >
              {hasCoverImage ? (
                <img
                  src={coverImageUrl}
                  alt={profileTitle}
                  className="product-recommendation-card__image service-ad-card-v2__image service-ad-card-v2__image--product"
                  onError={() => setFailedCoverUrl(coverImageUrl)}
                />
              ) : (
                <div className="service-ad-card-v2__image service-ad-card-v2__image--fallback">
                  <span>{profileTitle}</span>
                </div>
              )}
            </div>

            <div
              className={hasCoverImage ? "product-recommendation-card__content service-ad-card-v2__content" : "service-ad-card-v2__content"}
            >
              <small
                className={hasCoverImage ? "product-recommendation-card__eyebrow service-ad-card-v2__eyebrow" : "service-ad-card-v2__eyebrow"}
              >
                Public service ad
              </small>

              <h5
                className={hasCoverImage ? "product-recommendation-card__title service-ad-card-v2__title" : "service-ad-card-v2__title"}
              >
                {profileTitle}
              </h5>

              <p
                className={hasCoverImage ? "product-recommendation-card__category service-ad-card-v2__type" : "service-ad-card-v2__type"}
              >
                {formatServiceType(displayProfile?.serviceType)}
              </p>

              {location ? (
                <p className="service-ad-card-v2__location">{location}</p>
              ) : null}

              <p
                className={hasCoverImage ? "product-recommendation-card__description service-ad-card-v2__tagline" : "service-ad-card-v2__tagline"}
              >
                {displayProfile?.tagline ||
                  displayProfile?.description ||
                  "Trusted pet care tailored to your location and service needs."}
              </p>

              {highlights.length > 0 ? (
                <p className="service-ad-card-v2__highlights">
                  {highlights.join(" • ")}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className={hasCoverImage ? "product-recommendation-card__footer service-ad-card-v2__footer service-ad-card-v2__footer-row" : "service-ad-card-v2__footer"}
          >
            <strong
              className={hasCoverImage ? "product-recommendation-card__price service-ad-card-v2__price" : "service-ad-card-v2__price"}
            >
              {formatPrice(displayProfile?.priceFrom, displayProfile?.priceTo)}
            </strong>

            <span
              className={hasCoverImage ? "product-recommendation-card__button service-ad-card-v2__button" : "service-ad-card-v2__button"}
            >
              Learn More
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ServiceAdsCard;
