import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ProductService";
import AuthService from "../../service/AuthService"
import {
  FaShareAlt,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLinkedin,
  FaTiktok,
  FaHeart,
  FaBookmark,
  FaStar,
  FaUser,
} from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  ListGroup,
  Alert,
} from "react-bootstrap";
import "../../style/ProductdetailPage.css";
import { addToRecentlyViewed } from "../../service/LocalStorage";
import RecentView from "../pages/RecentView";
import WishlistService from "../../service/WishlistService";
import ReviewService from "../../service/ReviewService";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();

  const [product, setProduct] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [otherRelatedProducts, setOtherRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [pageError, setPageError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageError("");
        setReviewLoading(true);
        setReviewError(null);
        setActiveImageIndex(0);

        const [detailsRes, wishRes, reviewsData] = await Promise.all([
          ApiService.getProductDetails(productId),
          WishlistService.getWishlist(),
          ReviewService.getReviewsByProductId(productId),
        ]);

        const details = detailsRes?.productDetails || {};
        const mainProduct = details?.product || null;

        if (!mainProduct) {
          throw new Error("Product details not found");
        }

        setProduct(mainProduct);
        setRelatedProducts(Array.isArray(details?.relatedProducts) ? details.relatedProducts : []);
        setOtherRelatedProducts(
          Array.isArray(details?.otherRelatedProducts) ? details.otherRelatedProducts : []
        );

        addToRecentlyViewed(mainProduct);

        setWishlist(Array.isArray(wishRes) ? wishRes : []);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setLikes({
          [mainProduct.id]: mainProduct.likes || 0,
        });

        await ApiService.trackProductView(productId);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setPageError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load product details."
        );
      } finally {
        setReviewLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);

    if (!rating) {
      setReviewError("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      if (!AuthService.isAuthenticated()) {
        throw new Error("Please log in to submit a review");
      }

      const currentUser = await AuthService.getLoggedInInfo();

      if (!currentUser?.user) {
        throw new Error("Unable to verify your account");
      }

      const reviewData = {
        productId: parseInt(productId, 10),
        userId: currentUser.user.id,
        rating,
        comment,
      };

      await ReviewService.addReview(reviewData);

      const updatedReviews = await ReviewService.getReviewsByProductId(productId);
      setReviews(Array.isArray(updatedReviews) ? updatedReviews : []);
      setRating(0);
      setComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error("Review submission error:", err);
      setReviewError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit review"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialShare = (platform) => {
    if (!product) return;

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${product.name} - ${product.description}`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      tiktok: `https://www.tiktok.com/share/url?url=${url}&text=${text}`,
    };

    window.open(shareUrls[platform], "_blank");
    setIsShareOpen(false);
  };

  const socialIcons = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    whatsapp: FaWhatsapp,
    linkedin: FaLinkedin,
    tiktok: FaTiktok,
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color.name);

    const colorImageIndex = (product?.imageUrls || []).findIndex((img) =>
      String(img).toLowerCase().includes(String(color.name).toLowerCase())
    );

    setActiveImageIndex(colorImageIndex >= 0 ? colorImageIndex : 0);
  };

  const handleCartAction = () => {
    if (!product) return;

    const cartItem = {
      ...product,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    };

    dispatch({ type: "ADD_ITEM", payload: cartItem });
  };

  const incrementItem = () => {
    if (!product) return;
    dispatch({ type: "INCREMENT_ITEM", payload: product });
  };

  const decrementItem = () => {
    if (!product || !cartItem) return;

    if (cartItem.quantity > 1) {
      dispatch({ type: "DECREMENT_ITEM", payload: product });
    } else {
      dispatch({ type: "REMOVE_ITEM", payload: product });
    }
  };

  const toggleWishlist = async () => {
    if (!AuthService.isAuthenticated()) {
      alert("Please login to manage wishlist");
      return;
    }

    try {
      const numericProductId = Number(productId);
      const exists = wishlist.some((item) => Number(item.productId) === numericProductId);

      if (exists) {
        await WishlistService.removeFromWishlist(productId);
        setWishlist((prev) =>
          prev.filter((item) => Number(item.productId) !== numericProductId)
        );
      } else {
        await WishlistService.addToWishlist(productId);
        setWishlist((prev) => [...prev, { productId: numericProductId }]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const handleLike = async (id) => {
    try {
      await ApiService.likeProduct(id);
      setLikes((prev) => ({
        ...prev,
        [id]: (prev[id] || 0) + 1,
      }));
    } catch (error) {
      console.error("Failed to like product:", error);
    }
  };

  const generateCleanURL = (str) =>
    String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const renderProductCard = (item) => (
    <Col
      key={item.id}
      xs={6}
      sm={4}
      md={3}
      lg={2}
      className="flex-shrink-0"
    >
      <div
        className="card h-100 cursor-pointer"
        onClick={() =>
          navigate(
            `/product/${generateCleanURL(item.category)}/${generateCleanURL(
              item.subCategory
            )}/${generateCleanURL(item.name)}/dp/${item.id}`
          )
        }
      >
        <img
          src={item.imageUrls?.[0] || item.thumbnailImageUrl}
          className="card-img-top p-2"
          alt={item.name}
          style={{ height: "200px", objectFit: "contain" }}
        />
        <div className="card-body">
          <h6 className="card-title text-truncate">{item.name}</h6>
          <div className="d-flex flex-column">
            {item.oldPrice > 0 && (
              <small className="text-danger text-decoration-line-through">
                $
                {Number(item.oldPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </small>
            )}
            <span className="text-primary">
              $
              {Number(item.newPrice || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </Col>
  );

  if (pageError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{pageError}</Alert>
      </Container>
    );
  }

  if (!product) {
    return <div className="text-center py-5">Loading...</div>;
  }

  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];

  const wishlistSelected = wishlist.some(
    (item) => Number(item.productId) === Number(productId)
  );

  const cartItem = cart.find(
    (item) => Number(item.id) === Number(product.id)
  );
  return (
    <Container className="py-5">
      <Row className="g-4 mb-5">
        <Col md={6}>
          <div className="position-relative">
            <img
              src={imageUrls[activeImageIndex] || product.thumbnailImageUrl}
              className="main-product-img rounded-3"
              alt={product.name}
            />

            <div className="thumbnail-container">
              {imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  onClick={() => setActiveImageIndex(index)}
                  className={`thumbnail-img ${
                    index === activeImageIndex ? "active" : ""
                  }`}
                  alt={`Thumbnail ${index}`}
                />
              ))}
            </div>
          </div>
        </Col>

        <Col md={6}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="product-title">{product.name}</h1>

            <div className="position-relative">
              <Button
                variant="link"
                onClick={() => setIsShareOpen(!isShareOpen)}
              >
                <FaShareAlt className="fs-5" />
              </Button>

              {isShareOpen && (
                <div className="share-dropdown shadow-sm">
                  {["facebook", "twitter", "whatsapp", "linkedin", "tiktok"].map(
                    (platform) => {
                      const IconComponent = socialIcons[platform];
                      return (
                        <Button
                          key={platform}
                          variant="link"
                          onClick={() => handleSocialShare(platform)}
                        >
                          <IconComponent />
                        </Button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex flex-column gap-1">
            {product.oldPrice > 0 && (
              <span className="text-decoration-line-through text-danger">
                $
                {Number(product.oldPrice).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}

            <span className="h4 text-primary">
              $
              {Number(product.newPrice || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>

            {Number(product.stock ?? 0) > 1 && (
              <span className="text-muted">In stock</span>
            )}
          </div>

          {product.colors?.length > 0 && (
            <div className="mb-4">
              <h6>Colors:</h6>
              <div className="d-flex gap-2 flex-wrap">
                {product.colors.map((color, index) => (
                  <div
                    key={index}
                    className="d-flex flex-column align-items-center gap-1"
                  >
                    <button
                      onClick={() => handleColorSelect(color)}
                      className={`color-swatch ${
                        selectedColor === color.name ? "active" : ""
                      }`}
                      style={{ backgroundColor: color.code }}
                      aria-label={`Select color: ${color.name}`}
                    />
                    <span className="text-small">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="mb-4">
              <h6>Size:</h6>
              <select
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Select Size</option>
                {product.sizes.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="d-flex gap-3 mb-4">
            {cartItem ? (
              <div className="d-flex align-items-center justify-content-center flex-grow-1">
                <Button
                  variant="outline-secondary"
                  onClick={decrementItem}
                >
                  -
                </Button>

                <span className="mx-3 fw-bold">
                  {cartItem.quantity}
                </span>

                <Button
                  variant="outline-secondary"
                  onClick={incrementItem}
                >
                  +
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                className="flex-grow-1"
                onClick={handleCartAction}
              >
                Add to Cart
              </Button>
            )}

            <Button
              variant={wishlistSelected ? "warning" : "outline-secondary"}
              onClick={toggleWishlist}
            >
              <FaBookmark />
            </Button>
          </div>

          <div className="d-flex align-items-center mt-1">
            <Button
              variant="link"
              size="sm"
              onClick={() => handleLike(product.id)}
              className="p-0 me-1"
            >
              <FaHeart color={likes[product.id] ? "red" : "#ccc"} />
            </Button>
            <p className="mb-0 h6">{likes[product.id] || 0} Likes</p>
          </div>

          <div>
            <p>{product.description}</p>
          </div>
        </Col>
      </Row>

      <section className="mb-5">
        <h3 className="mb-4">Related Products</h3>
        <Row className="flex-nowrap overflow-x-auto g-3">
          {relatedProducts.map(renderProductCard)}
        </Row>
      </section>

      <section className="mb-5">
        <h3 className="mb-4">Other Related Products</h3>
        <Row className="flex-nowrap overflow-x-auto g-3">
          {otherRelatedProducts.map(renderProductCard)}
        </Row>
      </section>

      <section className="mt-5">
        <h4>Customer Reviews</h4>

        {reviewSuccess && (
          <Alert variant="success" className="mt-3">
            Thank you for your review!
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Body>
            <h5>Write a Review</h5>
            <Form onSubmit={handleReviewSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;

                    return (
                      <Button
                        key={index}
                        variant="link"
                        className="p-0 me-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setRating(ratingValue);
                        }}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <FaStar
                          size={24}
                          color={
                            ratingValue <= (hover || rating)
                              ? "#ffc107"
                              : "#e4e5e9"
                          }
                        />
                      </Button>
                    );
                  })}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Your Review</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                />
              </Form.Group>

              {reviewError && (
                <Alert variant="danger" className="mt-2">
                  {reviewError}
                </Alert>
              )}

              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {reviewLoading ? (
          <div>Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <ListGroup className="mb-4">
            {reviews.map((review) => (
              <ListGroup.Item key={review.id} className="mb-3">
                <Row>
                  <Col xs={12} md={2} className="d-flex align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <FaUser size={24} />
                      </div>
                      <div>
                        <strong>{review.userName || "Anonymous"}</strong>
                        <div className="d-flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} md={10}>
                    <div className="mb-2">
                      <small className="text-muted">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </small>
                    </div>
                    <p>{review.comment}</p>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info">No reviews yet. Be the first to review!</Alert>
        )}
      </section>

      <RecentView />
    </Container>
  );
};

export default ProductDetailsPage;
