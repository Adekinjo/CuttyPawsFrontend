import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../post/ProductRecommendation.css";

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

const getProductImage = (product) =>
  product?.imageUrls?.[0] ||
  product?.thumbnailImageUrl ||
  null;

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
                "Quality pet product selected for you."}
            </p>

            <div className="product-recommendation-card__footer">
              <strong className="product-recommendation-card__price">
                {formatPrice(product?.newPrice)}
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