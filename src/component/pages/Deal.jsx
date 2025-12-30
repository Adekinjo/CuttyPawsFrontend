import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import { FaHeart, FaShoppingCart, FaPlus, FaMinus, FaTrash, FaFire, FaClock } from "react-icons/fa";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from "react-bootstrap";
import RecentView from "../pages/RecentView";
import "../../style/Deal.css";

const Deal = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const { cart, dispatch } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dealsResponse, wishlistResponse] = await Promise.all([
          ApiService.getActiveDeals(),
          ApiService.getWishlist()
        ]);
        
        setDeals(dealsResponse?.dealList || []);
        setWishlist(wishlistResponse || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load deals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleWishlist = async (productId) => {
    if (!ApiService.isAuthenticated()) {
      alert("Please login to manage your wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.some(item => item.productId === productId);
      if (isInWishlist) {
        await ApiService.removeFromWishlist(productId);
        setWishlist(wishlist.filter(item => item.productId !== productId));
      } else {
        await ApiService.addToWishlist(productId);
        const updatedWishlist = await ApiService.getWishlist();
        setWishlist(updatedWishlist);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

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

  // Get product quantity in cart
  const getProductQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const calculateTimeLeft = (endDate) => {
    if (!endDate) return {};
    const difference = new Date(endDate) - new Date();
    if (difference <= 0) return { expired: true };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endDate));

    useEffect(() => {
      if (!endDate) return;
      const timer = setInterval(() => setTimeLeft(calculateTimeLeft(endDate)), 1000);
      return () => clearInterval(timer);
    }, [endDate]);

    if (!endDate) return null;
    if (timeLeft.expired) return (
      <Badge bg="danger" className="w-100">
        <FaClock className="me-1" /> Expired
      </Badge>
    );

    return (
      <div className="countdown-timer text-center">
        <small className="text-muted d-block mb-1">Ends in:</small>
        <div className="d-flex justify-content-center gap-1">
          <Badge bg="dark" className="px-2 py-1">
            {String(timeLeft.days).padStart(2, "0")}d
          </Badge>
          <Badge bg="dark" className="px-2 py-1">
            {String(timeLeft.hours).padStart(2, "0")}h
          </Badge>
          <Badge bg="dark" className="px-2 py-1">
            {String(timeLeft.minutes).padStart(2, "0")}m
          </Badge>
          <Badge bg="dark" className="px-2 py-1">
            {String(timeLeft.seconds).padStart(2, "0")}s
          </Badge>
        </div>
      </div>
    );
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" variant="primary" />
      <div className="mt-2">Loading hot deals...</div>
    </Container>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger" className="text-center">
        {error}
      </Alert>
    </Container>
  );

  return (
    <Container className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 className="display-5 fw-bold text-danger mb-2">
              <FaFire className="me-2" />
              Today's Best Deals
            </h1>
            <p className="text-muted lead">
              Limited time offers! Don't miss out on these exclusive discounts.
            </p>
          </div>
        </Col>
      </Row>

      {/* Deals Grid */}
      <Row className="g-4 mb-5">
        {deals.map((deal) => {
          const product = deal?.product;
          if (!product || !deal?.discountPercentage) return null;

          const isInWishlist = wishlist.some(item => item.productId === product.id);
          const currentQuantity = getProductQuantity(product.id);
          const productUrl = ApiService.generateProductUrl(product);
          const isOutOfStock = product.stock <= 0;

          return (
            <Col key={deal.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 deal-card shadow-sm border-0 position-relative">
                
                {/* Deal Badge */}
                <div className="position-absolute top-0 start-0 m-2">
                  <Badge bg="danger" className="fs-6 px-2 py-2">
                    <FaFire className="me-1" />
                    {deal.discountPercentage}% OFF
                  </Badge>
                </div>

                {/* Wishlist Icon */}
                <div className="position-absolute top-0 end-0 m-2">
                  <Button
                    variant="light"
                    size="sm"
                    className="rounded-circle shadow-sm"
                    onClick={() => toggleWishlist(product.id)}
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                  >
                    <FaHeart 
                      color={isInWishlist ? "#ff6b6b" : "#6c757d"} 
                      fill={isInWishlist ? "#ff6b6b" : "none"}
                    />
                  </Button>
                </div>

                {/* Countdown Timer */}
                <div className="position-absolute bottom-0 start-0 end-0 m-2">
                  <CountdownTimer endDate={deal.endDate} />
                </div>

                {/* Product Image */}
                <Link to={productUrl} className="text-decoration-none">
                  <div className="ratio ratio-1x1">
                    <Card.Img
                      variant="top"
                      src={product.thumbnailImageUrl || "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="p-3 object-fit-contain"
                      style={{ 
                        opacity: isOutOfStock ? 0.5 : 1,
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                      onMouseEnter={(e) => {
                        if (!isOutOfStock) e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isOutOfStock) e.target.style.transform = 'scale(1)';
                      }}
                    />
                  </div>
                </Link>

                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <Badge bg="secondary" className="fs-6 px-3 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}

                <Card.Body className="d-flex flex-column p-3">
                  
                  {/* Product Name */}
                  <Link to={productUrl} className="text-decoration-none text-dark">
                    <Card.Title 
                      className="fs-6 fw-semibold mb-2 text-truncate"
                      title={product.name}
                    >
                      {product.name}
                    </Card.Title>
                  </Link>

                  {/* Price Section */}
                  <div className="mb-3">
                    {product.oldPrice > 0 && (
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="text-decoration-line-through text-muted small">
                          ₦{product.oldPrice.toLocaleString()}
                        </span>
                        <Badge bg="success" className="small">
                          Save {deal.discountPercentage}%
                        </Badge>
                      </div>
                    )}
                    <span className="h5 text-primary fw-bold">
                      ₦{product.newPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Amazon-style Cart Buttons */}
                  <div className="mt-auto">
                    {currentQuantity === 0 ? (
                      // Add to Cart Button
                      <Button
                        variant="warning"
                        className="w-100 py-2 fw-bold"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        style={{ 
                          backgroundColor: '#FFD814', 
                          borderColor: '#FCD200',
                          color: '#0F1111',
                          fontSize: '14px',
                          borderRadius: '8px'
                        }}
                      >
                        <FaShoppingCart className="me-2" />
                        Add to Cart
                      </Button>
                    ) : (
                      // Quantity Controls
                      <div className="d-flex align-items-center justify-content-between bg-light rounded p-2 border">
                        {/* Left Button - Minus/Delete */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
                          onClick={() => handleDecrement(product)}
                          title={currentQuantity === 1 ? "Remove from cart" : "Decrease quantity"}
                        >
                          {currentQuantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                        </Button>

                        {/* Quantity Display */}
                        <div className="mx-2 text-center">
                          <span className="fw-bold">{currentQuantity}</span>
                          <span className="text-muted small d-block">in cart</span>
                        </div>

                        {/* Right Button - Plus */}
                        <Button
                          variant="outline-secondary"
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: '32px', height: '32px' }}
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

      {/* Empty State */}
      {deals.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <div className="text-muted">
              <FaFire size={48} className="mb-3 text-muted" />
              <h4>No Active Deals</h4>
              <p>Check back later for amazing offers!</p>
            </div>
          </Col>
        </Row>
      )}

      <hr className="my-5" />
      
      {/* Recent Views */}
      <RecentView />
    </Container>
  );
};

export default Deal;