import { useCart } from "../context/CartContext";
import { FaHeart, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaRocket } from "react-icons/fa";
import ApiService from "../../service/ApiService";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecentView from "../pages/RecentView";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import "../../style/NewArrival.css";

const NewArrivals = () => {
  const { cart, dispatch } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.getAllProduct();
        const productsData = response.productList || [];
        // Sort by date added (assuming products have createdAt field) and take latest
        const sortedProducts = productsData
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 50);
        setProducts(sortedProducts);
        
        const wishlistData = await ApiService.getWishlist();
        setWishlist(wishlistData || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load new arrivals");
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
  };

  const handleIncrement = (product) => {
    dispatch({ type: "INCREMENT_ITEM", payload: product });
  };

  const handleDecrement = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem?.quantity === 1) {
      dispatch({ type: "REMOVE_ITEM", payload: product });
    } else {
      dispatch({ type: "DECREMENT_ITEM", payload: product });
    }
  };

  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      alert("Please login to manage your wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.some((item) => item.productId === productId);
      if (isInWishlist) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter((item) => item.productId !== productId));
      } else {
        await ApiService.addToWishlist(productId);
        const updatedWishlist = await ApiService.getWishlist();
        setWishlist(updatedWishlist);
      }
    } catch (error) {
      console.error("Wishlist update failed:", error);
    }
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    return oldPrice > newPrice
      ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      : 0;
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

  if (loading) {
    return (
      <Container className="py-5 new-arrivals-loading">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <h5 className="text-muted">Loading New Arrivals...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 new-arrivals-container">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="text-center new-arrivals-header">
            <h1 className="new-arrivals-title mb-3">
              <FaRocket className="new-arrivals-icon me-3" />
              New Arrivals
            </h1>
            <p className="new-arrivals-subtitle text-muted lead">
              Discover the latest products just added to our collection
            </p>
          </div>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row className="g-3 new-arrivals-grid">
        {products.map((product) => {
          const currentQuantity = getProductQuantity(product.id);
          const isInWishlist = wishlist.some((item) => item.productId === product.id);
          const discount = calculateDiscount(product.oldPrice, product.newPrice);
          const imageUrl = product.imageUrls?.[0] || "https://via.placeholder.com/300";
          const productUrl = generateProductUrl(product);
          const isOutOfStock = product.stock <= 0;

          return (
            <Col 
              key={product.id} 
              xs={6}      // 2 per row on mobile
              sm={4}      // 3 per row on tablet
              md={3}      // 4 per row on desktop
              lg={3}      // 4 per row on large desktop
              className="new-arrivals-product-col"
            >
              <div className="card h-100 shadow-sm position-relative border-0 new-arrivals-card">
                
                {/* New Arrival Badge */}
                <Badge bg="info" className="position-absolute top-0 start-0 m-2 new-arrivals-new-badge">
                  <FaRocket className="me-1" />
                  NEW
                </Badge>

                {/* Discount Badge */}
                {discount > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-0 m-2 mt-5 new-arrivals-discount-badge">
                    -{discount}%
                  </Badge>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <Badge bg="secondary" className="position-absolute top-0 end-0 m-2 new-arrivals-stock-badge">
                    Out of Stock
                  </Badge>
                )}

                {/* Wishlist Icon */}
                <Button
                  variant="light"
                  size="sm"
                  className="position-absolute top-0 end-0 m-2 new-arrivals-wishlist-btn"
                  onClick={() => toggleWishlist(product.id)}
                  style={{ 
                    width: '36px', 
                    height: '36px',
                    backgroundColor: 'rgba(255,255,255,0.95)'
                  }}
                >
                  <FaHeart 
                    style={{ 
                      color: isInWishlist ? "#ff6b6b" : "#6c757d",
                      fontSize: '16px'
                    }}
                    fill={isInWishlist ? "#ff6b6b" : "none"}
                  />
                </Button>

                {/* Product Image with Updated URL */}
                <Link to={productUrl} className="text-decoration-none new-arrivals-image-link">
                  <div className="ratio ratio-1x1 new-arrivals-image-container">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className={`card-img-top p-3 object-fit-contain new-arrivals-image ${isOutOfStock ? 'opacity-50' : ''}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="card-body d-flex flex-column p-3 new-arrivals-card-body">
                  
                  {/* Product Name with Updated URL */}
                  <Link to={productUrl} className="text-decoration-none text-dark new-arrivals-name-link">
                    <h6 className="card-title mb-2 new-arrivals-product-name">
                      {product.name}
                    </h6>
                  </Link>

                  {/* Product Description */}
                  {product.description && (
                    <p className="new-arrivals-product-description small text-muted mb-2">
                      {product.description.length > 80 
                        ? `${product.description.substring(0, 80)}...` 
                        : product.description
                      }
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="mb-3 new-arrivals-pricing">
                    {product.oldPrice > 0 && product.oldPrice > product.newPrice && (
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-decoration-line-through text-muted small new-arrivals-old-price">
                          ₦{product.oldPrice.toLocaleString()}
                        </span>
                        {discount > 0 && (
                          <Badge bg="success" className="small new-arrivals-save-badge">
                            Save {discount}%
                          </Badge>
                        )}
                      </div>
                    )}
                    <span className="h5 text-primary fw-bold new-arrivals-current-price">
                      ₦{product.newPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Amazon-style Cart Buttons */}
                  <div className="mt-auto new-arrivals-cart-section">
                    {currentQuantity === 0 ? (
                      // Add to Cart Button
                      <Button
                        variant="warning"
                        className="w-100 py-2 fw-bold new-arrivals-add-cart-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        style={{ 
                          backgroundColor: '#FFD814', 
                          borderColor: '#FCD200',
                          color: '#0F1111',
                          borderRadius: '8px'
                        }}
                      >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </Button>
                    ) : (
                      // Quantity Controls
                      <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 border new-arrivals-quantity-controls">
                        {/* Left Button - Minus/Delete */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center new-arrivals-quantity-btn"
                          style={{ width: '38px', height: '38px' }}
                          onClick={() => handleDecrement(product)}
                          title={currentQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                        >
                          {currentQuantity === 1 ? 
                            <FaTrash style={{ fontSize: '16px' }} /> : 
                            <FaMinus style={{ fontSize: '16px' }} />
                          }
                        </Button>

                        {/* Quantity Display */}
                        <div className="mx-2 text-center new-arrivals-quantity-display">
                          <span className="fw-bold">{currentQuantity}</span>
                          <span className="text-muted small d-block">in cart</span>
                        </div>

                        {/* Right Button - Plus */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center new-arrivals-quantity-btn"
                          style={{ width: '38px', height: '38px' }}
                          onClick={() => handleIncrement(product)}
                          disabled={product.stock <= currentQuantity}
                          title="Increase quantity"
                        >
                          <FaPlus style={{ fontSize: '16px' }} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <Row className="new-arrivals-empty">
          <Col className="text-center py-5">
            <div className="text-muted">
              <FaRocket size={48} className="mb-3 opacity-25" />
              <h4>No New Arrivals</h4>
              <p>Check back later for new products!</p>
            </div>
          </Col>
        </Row>
      )}

      {/* Recent View Section */}
      <div className="mt-5">
        <RecentView />
      </div>
    </Container>
  );
};

export default NewArrivals;