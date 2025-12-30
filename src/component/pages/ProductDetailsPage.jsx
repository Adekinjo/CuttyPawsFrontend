import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
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
  FaUser
} from "react-icons/fa";
import { 
  Container, 
  Row, 
  Col, 
  Button,
  Card,
  Form,
  ListGroup,
  Alert
} from "react-bootstrap";
import "../../style/ProductdetailPage.css";
import { addToRecentlyViewed } from "../../service/LocalStorage";
import RecentView from "../pages/RecentView";
import BackToTop from "./BackToTop";

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedProductss, setRelatedProductss] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [likes, setLikes] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await ApiService.getProductById(productId);
        setProduct(productRes.product);
        addToRecentlyViewed(productRes.product);

        const wishRes = await ApiService.getWishlist();
        setWishlist(wishRes);

        await ApiService.trackProductView(productId);

        const likesRes = await ApiService.getAllLikes();
        setLikes(
          likesRes.productList.reduce(
            (acc, p) => ({ ...acc, [p.id]: p.likes }),
            {}
          )
        );

        const reviewsData = await ApiService.getReviewsByProductId(productId);
        setReviews(reviewsData);
        setReviewLoading(false);

        if (productRes.product?.subCategoryId) {
          const relatedRes = await ApiService.getAllProductsBySubCategory(
            productRes.product.subCategoryId
          );
          setRelatedProducts(
            relatedRes.productList.filter((p) => p.id !== productId)
          );
        }
        if (productRes.product?.categoryId) {
          const categoryPro = await ApiService.getAllProductByCategoryId(
            productRes.product.categoryId
          );
          setRelatedProductss(
            categoryPro.productList.filter((p) => p.id !== productId)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [productId]);

  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null); // Clear previous errors
    
    if (!rating) {
      setReviewError("Please select a rating");
      return;
    }
  
    setSubmitting(true);
    try {
      // Verify authentication
      if (!ApiService.isAuthenticated()) {
        throw new Error("Please log in to submit a review");
      }
  
      // Get current user properly
      const currentUser = await ApiService.getLoggedInInfo();
      console.log("Current user:", currentUser);
      if (!currentUser?.user) {
        throw new Error("Unable to verify your account");
      }
  
      const reviewData = {
        productId: parseInt(productId),
        userId: currentUser.user.id,
        rating,
        comment,
      };
      
      // Debug: Log the review data being sent
      console.log("Submitting review:", reviewData);
      
      const response = await ApiService.addReview(reviewData);
      console.log("Review submission response:", response);
      
      const updatedReviews = await ApiService.getReviewsByProductId(productId);
      setReviews(updatedReviews);
      setRating(0);
      setComment("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response data:", err.response?.data);
      setReviewError(err.response?.data?.message || err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialShare = (platform) => {
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

  const handleColorSelect = (color, index) => {
    setSelectedColor(color.name);
    const colorImageIndex = product.imageUrls.findIndex((img) =>
      img.toLowerCase().includes(color.name.toLowerCase())
    );
    setActiveImageIndex(colorImageIndex >= 0 ? colorImageIndex : 0);
  };

  const handleCartAction = () => {
    const cartItem = {
      ...product,
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
    };
    dispatch({ type: "ADD_ITEM", payload: cartItem });
  };

  const toggleWishlist = async () => {
    if (!ApiService.isAuthenticated()) {
      alert("Please login to manage wishlist");
      return;
    }
    try {
      if (wishlist.some((item) => item.productId === productId)) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter((item) => item.productId !== productId));
      } else {
        await ApiService.addToWishlist(productId);
        setWishlist([...wishlist, { productId }]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };
  const handleLike = async (productId) => {
    try {
      await ApiService.likeProduct(productId);
      setLikes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    } catch (error) {
      setAlertMessage("Failed to like the product");
      setIsError(true);
      setShowAlert(true);
    }
  };

  const generateCleanURL = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (!product) return <div className="text-center py-5">Loading...</div>;

  return (
    <Container className="py-5">
      {/* Product Main Section */}
      <Row className="g-4 mb-5">
        {/* Product Images */}
        <Col md={6}>
          <div className="position-relative">
            <img
              src={product.imageUrls[activeImageIndex]}
              className="main-product-img rounded-3"
              alt={product.name}
            />
            <div className="thumbnail-container">
              {product.imageUrls.map((img, index) => (
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

        {/* Product Details */}
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
                  {[
                    "facebook",
                    "twitter",
                    "whatsapp",
                    "linkedin",
                    "tiktok",
                  ].map((platform) => {
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
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="d-flex flex-column gap-1">
            {product.oldPrice > 0 && (
              <span className="text-decoration-line-through text-danger">
                ₦
                {product.oldPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
            <span className="h4 text-primary">
              ₦
              {product.newPrice.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Color Selection */}
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
                      onClick={() => handleColorSelect(color, index)}
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

          {/* Size Selection */}
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

          {/* Action Buttons */}
          <div className="d-flex gap-3 mb-4">
            <Button
              variant="primary"
              className="flex-grow-1"
              onClick={handleCartAction}
              disabled={cart.some((item) => item.id === productId)}
            >
              {cart.some((item) => item.id === productId)
                ? "Added to Cart"
                : "Add to Cart"}
            </Button>
            <Button
              variant={
                wishlist.some((item) => item.productId === productId)
                  ? "warning"
                  : "outline-secondary"
              }
              onClick={toggleWishlist}
            >
              <FaBookmark />
            </Button>
          </div>

          {/* Likes */}
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

      {/* Related Products */}
      <section className="mb-5">
        <h3 className="mb-4">Related Products</h3>
        <Row className="flex-nowrap overflow-x-auto g-3">
          {relatedProducts.map((product) => (
            <Col
              key={product.id}
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
                    `/product/${generateCleanURL(
                      product.category
                    )}/${generateCleanURL(
                      product.subCategory
                    )}/${generateCleanURL(product.name)}/dp/${product.id}`
                  )
                }
              >
                <img
                  src={product.imageUrls[0]}
                  className="card-img-top p-2"
                  alt={product.name}
                  style={{ height: "200px", objectFit: "contain" }}
                />
                <div className="card-body">
                  <h6 className="card-title text-truncate">{product.name}</h6>
                  <div className="d-flex flex-column">
                    {product.oldPrice > 0 && (
                      <small className="text-danger text-decoration-line-through">
                        ₦
                        {product.oldPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </small>
                    )}
                    <span className="text-primary">
                      ₦
                      {product.newPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>
      {/* Related Products */}
      <section className="mb-5">
        <h3 className="mb-4">Other Related Products</h3>
        <Row className="flex-nowrap overflow-x-auto g-3">
          {relatedProductss.map((relatedProduct) => (
            <Col
              key={relatedProduct.id}
              xs={6} // 2 products per row on mobile
              sm={4} // 3 products per row on tablets
              md={3} // 4 products per row on small desktops
              lg={2} // 5 products per row on large screens
              className="flex-shrink-0"
            >
              <div
                className="card h-100 cursor-pointer"
                onClick={() =>
                  navigate(
                    `/product/${generateCleanURL(
                      relatedProduct.category
                    )}/${generateCleanURL(
                      relatedProduct.subCategory
                    )}/${generateCleanURL(relatedProduct.name)}/dp/${
                      relatedProduct.id
                    }`
                  )
                }
              >
                <img
                  src={relatedProduct.imageUrls[0]}
                  className="card-img-top p-2"
                  alt={relatedProduct.name}
                  style={{ height: "200px", objectFit: "contain" }}
                />
                <div className="card-body">
                  <h6 className="card-title text-truncate">
                    {relatedProduct.name}
                  </h6>
                  <div className="d-flex flex-column">
                    {relatedProduct.oldPrice > 0 && (
                      <small className="text-danger text-decoration-line-through">
                        ₦
                        {relatedProduct.oldPrice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </small>
                    )}
                    <span className="text-primary">
                      ₦
                      {relatedProduct.newPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Reviews Section */}
      <section className="mt-5">
        <h4>Customer Reviews</h4>
        
        {reviewSuccess && (
          <Alert variant="success" className="mt-3">
            Thank you for your review!
          </Alert>
        )}

        {/* Review Form */}
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
                        onClick={() => setRating(ratingValue)}
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
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Reviews List */}
        {reviewLoading ? (
          <div>Loading reviews...</div>
        ) : reviewError ? (
          <Alert variant="danger">{reviewError}</Alert>
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
      <BackToTop />
    </Container>
  );
};

export default ProductDetailsPage;
