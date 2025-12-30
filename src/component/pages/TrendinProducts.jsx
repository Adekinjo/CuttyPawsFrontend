import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Spinner,
  Alert as BootstrapAlert 
} from 'react-bootstrap';
import { FaHeart, FaFire, FaShoppingCart, FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { Snackbar, Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "../../style/TrendingProducts.css";

const TrendingProducts = () => {
  const { cart, dispatch } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.getTrendingProducts();
        
        if (response.trendingProducts && Array.isArray(response.trendingProducts)) {
          setTrendingProducts(response.trendingProducts.slice(0, 50));
        } else {
          setTrendingProducts([]);
        }

        const wishlistData = await ApiService.getWishlist();
        setWishlist(wishlistData || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load trending products");
        setAlertMessage("Failed to load trending products");
        setIsError(true);
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Amazon-style Cart Functions
  const handleAddToCart = (product) => {
    const cartItem = {
      ...product,
      quantity: 1,
      size: "",
      color: "",
    };
    dispatch({ type: "ADD_ITEM", payload: cartItem });
    showAlertMessage("Added to cart!", false);
  };

  const handleIncrement = (product) => {
    dispatch({ type: "INCREMENT_ITEM", payload: product });
  };

  const handleDecrement = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem?.quantity === 1) {
      handleRemoveFromCart(product);
    } else {
      dispatch({ type: "DECREMENT_ITEM", payload: product });
    }
  };

  const handleRemoveFromCart = (product) => {
    dispatch({ type: "REMOVE_ITEM", payload: product });
    showAlertMessage("Removed from cart", false);
  };

  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      showAlertMessage("Please login to manage your wishlist", true);
      return;
    }

    try {
      const isInWishlist = wishlist.some((item) => item.productId === productId);
      if (isInWishlist) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter((item) => item.productId !== productId));
        showAlertMessage("Removed from wishlist", false);
      } else {
        await ApiService.addToWishlist(productId);
        const updatedWishlist = await ApiService.getWishlist();
        setWishlist(updatedWishlist);
        showAlertMessage("Added to wishlist!", false);
      }
    } catch (error) {
      showAlertMessage("Wishlist update failed", true);
    }
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  // Alert helper function
  const showAlertMessage = (message, isError = false) => {
    setAlertMessage(message);
    setIsError(isError);
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // Get product quantity in cart
  const getProductQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Generate product URL like LatestProducts component
  const generateProductUrl = (product) => {
    return `/product/${product.category?.toLowerCase()}/${product.subCategory?.toLowerCase()}/${product.name.toLowerCase()}/dp/${product.id}`;
  };

  if (loading) return (
    <Container className="py-5 trending-loading-container">
      <div className="text-center">
        <Spinner animation="border" variant="danger" className="mb-3" />
        <h5 className="text-muted">Loading Hot Products...</h5>
      </div>
    </Container>
  );

  if (error) return (
    <Container className="py-5">
      <BootstrapAlert variant="danger" className="text-center">
        {error}
      </BootstrapAlert>
    </Container>
  );

  if (!trendingProducts.length) return (
    <Container className="py-5">
      <div className="text-center text-muted">
        <FaFire size={48} className="mb-3 opacity-25" />
        <h4>No Trending Products</h4>
        <p>Check back later for popular items!</p>
      </div>
    </Container>
  );

  return (
    <Container className="py-4 trending-products-container">
      {/* Alert for Messages */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={isError ? "error" : "success"}
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseAlert}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="text-center trending-header">
            <h2 className="trending-title mb-2">
              <FaFire className="trending-fire-icon me-2" />
              Trending Now
            </h2>
            <p className="trending-subtitle text-muted">
              Discover what's hot! {trendingProducts.length} popular items everyone's loving
            </p>
          </div>
        </Col>
      </Row>
      
      {/* Products Grid - RESPONSIVE LAYOUT */}
      {/* 
        XL (≥1200px): 4 per row (col-xl-3) 
        LG (≥992px): 4 per row (col-lg-3)
        MD (≥768px): 3 per row (col-md-4) 
        SM (≥576px): 2 per row (col-sm-6)
        XS (<576px): 2 per row (col-6)
      */}
      <Row className="g-3 trending-products-grid">
        {trendingProducts.map((product) => {
          const currentQuantity = getProductQuantity(product.id);
          const isInWishlist = wishlist.some(item => item.productId === product.id);
          const discount = calculateDiscount(product.oldPrice, product.newPrice);
          const imageUrl = product.imageUrls?.[0] || "https://via.placeholder.com/300";
          const productUrl = generateProductUrl(product);
          const isOutOfStock = product.stock <= 0;

          return (
            <Col 
              key={product.id} 
              xs={6}      // 2 per row on mobile (<576px)
              sm={6}      // 2 per row on small (≥576px)
              md={4}      // 3 per row on tablet (≥768px)
              lg={3}      // 4 per row on desktop (≥992px)
              xl={3}      // 4 per row on large desktop (≥1200px)
              className="trending-product-col"
            >
              <Card className="h-100 shadow-sm position-relative border-0 trending-product-card">
                
                {/* Trending Badge */}
                <Badge bg="danger" className="position-absolute top-0 start-0 m-2 trending-badge">
                  <FaFire className="me-1" />
                  HOT
                </Badge>

                {/* Discount Badge */}
                {discount > 0 && (
                  <Badge bg="success" className="position-absolute top-0 start-0 m-2 mt-5 discount-badge">
                    -{discount}%
                  </Badge>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <Badge bg="secondary" className="position-absolute top-0 end-0 m-2 stock-badge">
                    Out of Stock
                  </Badge>
                )}

                {/* Wishlist Icon */}
                <Button
                  variant="light"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2 wishlist-button"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <FaHeart 
                    className={isInWishlist ? "text-danger" : "text-muted"}
                    fill={isInWishlist ? "currentColor" : "none"}
                  />
                </Button>

                {/* Product Image */}
                <Link to={productUrl} className="text-decoration-none">
                  <div className="ratio ratio-1x1 trending-image-container">
                    <Card.Img
                      variant="top"
                      src={imageUrl}
                      alt={product.name}
                      className={`trending-product-image ${isOutOfStock ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <Card.Body className="d-flex flex-column p-3 trending-card-body">
                  
                  {/* Product Name */}
                  <Link to={productUrl} className="text-decoration-none text-dark">
                    <Card.Title 
                      className="trending-product-name mb-2 text-truncate"
                      title={product.name}
                    >
                      {product.name}
                    </Card.Title>
                  </Link>

                  {/* Pricing */}
                  <div className="mb-3 trending-pricing">
                    {product.oldPrice > 0 && product.oldPrice > product.newPrice && (
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-decoration-line-through text-muted small original-price">
                          ₦{product.oldPrice.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <span className="h6 trending-current-price fw-bold">
                      ₦{product.newPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Amazon-style Cart Buttons */}
                  <div className="mt-auto trending-cart-section">
                    {currentQuantity === 0 ? (
                      // Add to Cart Button
                      <Button
                        variant="warning"
                        className="w-100 py-2 fw-bold trending-add-to-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </Button>
                    ) : (
                      // Quantity Controls
                      <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 border trending-quantity-controls">
                        {/* Left Button - Minus/Delete */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center trending-quantity-btn"
                          onClick={() => handleDecrement(product)}
                          title={currentQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                        >
                          {currentQuantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                        </Button>

                        {/* Quantity Display */}
                        <div className="mx-2 text-center trending-quantity-display">
                          <span className="fw-bold">{currentQuantity}</span>
                          <span className="text-muted small d-block">in cart</span>
                        </div>

                        {/* Right Button - Plus */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center trending-quantity-btn"
                          onClick={() => handleIncrement(product)}
                          disabled={product.stock <= currentQuantity}
                          title="Increase quantity"
                        >
                          <FaPlus size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default TrendingProducts;