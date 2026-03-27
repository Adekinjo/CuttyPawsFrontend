import { useEffect } from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../post/ProductRecommendation.css"

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

const getProductUrl = (product) =>
  `/product/${slugify(product?.category)}/${slugify(
    product?.subCategory
  )}/${slugify(product?.name)}/dp/${product?.id}`;

const getProductImage = (product) => {
  const primaryImage = product?.imageUrls?.[0];

  if (typeof primaryImage === "string" && primaryImage.trim()) {
    return primaryImage;
  }

  if (primaryImage && typeof primaryImage === "object") {
    return (
      primaryImage.imageUrl ||
      primaryImage.url ||
      primaryImage.path ||
      primaryImage.secure_url ||
      null
    );
  }

  return (
    product?.thumbnailImageUrl ||
    product?.imageUrl ||
    product?.productImageUrl ||
    product?.thumbnailUrl ||
    null
  );
};

const formatPrice = (value) => {
  if (value == null) return "Contact for price";
  const amount = Number(value);
  if (Number.isNaN(amount)) return `$${value}`;
  return `$${amount.toLocaleString("en-US")}`;
};

const ProductRecommendationCard = ({ product }) => {
  if (!product?.id) return null;

  const productUrl = getProductUrl(product);
  const imageUrl = getProductImage(product);

  useEffect(() => {
    console.debug("[ProductRecommendationCard] image resolution", {
      productId: product?.id,
      productName: product?.name,
      productKeys: Object.keys(product || {}),
      productSnapshot: product,
      imageUrls: product?.imageUrls,
      imageUrlsFirstItem: product?.imageUrls?.[0],
      images: product?.images,
      imagesFirstItem: product?.images?.[0],
      productImages: product?.productImages,
      productImagesFirstItem: product?.productImages?.[0],
      image: product?.image,
      media: product?.media,
      coverImageUrl: product?.coverImageUrl,
      thumbnailImageUrl: product?.thumbnailImageUrl,
      imageUrl: product?.imageUrl,
      productImageUrl: product?.productImageUrl,
      thumbnailUrl: product?.thumbnailUrl,
      resolvedImageUrl: imageUrl,
    });
  }, [
    product?.id,
    product?.name,
    product?.imageUrls,
    product?.thumbnailImageUrl,
    product?.imageUrl,
    product?.productImageUrl,
    product?.thumbnailUrl,
    imageUrl,
  ]);

  return (
    <Link to={productUrl} className="text-decoration-none text-reset d-block">
      <Card className="product-recommendation-card border-0 shadow-sm overflow-hidden">
        <div className="product-recommendation-card__layout">
          <div className="product-recommendation-card__media">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product?.name || "Recommended product"}
                className="product-recommendation-card__image"
                onError={(event) => {
                  console.error("[ProductRecommendationCard] image failed to load", {
                    productId: product?.id,
                    productName: product?.name,
                    attemptedSrc: event.currentTarget.currentSrc || imageUrl,
                    resolvedImageUrl: imageUrl,
                    imageUrls: product?.imageUrls,
                  });
                  event.currentTarget.onerror = null;
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : null}
          </div>

          <div className="product-recommendation-card__content">
            <small className="product-recommendation-card__eyebrow">
              Recommended for you
            </small>

            <h5 className="product-recommendation-card__title">
              {product?.name || "Pet Product"}
            </h5>

            <p className="product-recommendation-card__category">
              {product?.category || "Pet Accessories"}
            </p>

            <p className="product-recommendation-card__description">
              {product?.description ||
                "Quality pet product selected to match this service."}
            </p>

            <div className="product-recommendation-card__footer">
              <strong className="product-recommendation-card__price">
                {formatPrice(product?.newPrice ?? product?.price)}
              </strong>

              <span className="product-recommendation-card__button">
                View Product
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ProductRecommendationCard;
