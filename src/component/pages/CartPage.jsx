import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import { useCart } from "../../component/context/CartContext";
import RecentlyViewed from "./RecentView";

const CartPage = () => {
  const { cart, dispatch } = useCart();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Calculate total price
  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => {
      const itemPrice = parseFloat(item.newPrice) || 0;
      const itemQuantity = parseInt(item.quantity, 10) || 1;
      return total + itemPrice * itemQuantity;
    }, 0);
  };

  // Validate cart items
  const validateCartItems = () => {
    const invalidItems = cart.filter(
      (item) => !item.id || !item.quantity || !item.newPrice
    );

    if (invalidItems.length > 0) {
      setMessage({
        type: 'danger',
        text: `Some items in your cart are invalid. Please check: ${invalidItems.map(item => item.name).join(", ")}`
      });
      return false;
    }
    return true;
  };

  // Check stock
  const checkStock = async () => {
    try {
      for (const item of cart) {
        const product = await ApiService.getProductById(item.id);
        if (product.stock < item.quantity) {
          setMessage({
            type: 'warning',
            text: `Insufficient stock for ${product.name}. Available: ${product.stock}`
          });
          return false;
        }
      }
      return true;
    } catch (error) {
      setMessage({
        type: 'danger',
        text: "Failed to check product stock. Please try again."
      });
      return false;
    }
  };

  const handleCheckout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Authentication check
      if (!ApiService.isAuthenticated()) {
        setMessage({
          type: 'warning',
          text: "You need to login before you can place an order."
        });
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      // Validation checks
      if (!validateCartItems()) return;
      if (!await checkStock()) return;

      const response = await ApiService.getLoggedInInfo();
      if (!response?.user) {
        throw new Error("User not found. Please log in.");
      }

      // Check address
      const userAddress = response.user.address;
      if (!userAddress?.street || !userAddress?.city || !userAddress?.state || 
          !userAddress?.zipcode || !userAddress?.country) {
        setMessage({
          type: 'warning',
          text: "Please add your shipping address before placing an order."
        });
        setTimeout(() => navigate("/add-address"), 2000);
        return;
      }

      const totalPrice = calculateTotalPrice();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.id) {
        throw new Error("User not found. Please log in.");
      }

      // Initialize payment
      const paymentResponse = await ApiService.initializePayment(
        totalPrice,
        "NGN",
        user.email,
        "Paystack",
        user.id
      );

      // Store payment data
      localStorage.setItem('pendingPayment', JSON.stringify({
        paymentId: paymentResponse.paymentId,
        reference: paymentResponse.reference,
        cart: cart,
        totalPrice: totalPrice
      }));

      setMessage({
        type: 'success',
        text: "✅ Payment initialized successfully! Redirecting to Paystack..."
      });

      // Redirect to Paystack
      setTimeout(() => {
        window.location.href = paymentResponse.authorizationUrl;
      }, 2000);

    } catch (error) {
      console.error("Checkout Error:", error);
      setMessage({
        type: 'danger',
        text: error.message || "Failed to process payment. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = (item) => {
    if (item.quantity === 1) {
      dispatch({ type: "REMOVE_ITEM", payload: item });
    } else {
      dispatch({ type: "DECREMENT_ITEM", payload: item });
    }
  };

  const handleRemoveItem = (item) => {
    dispatch({ type: "REMOVE_ITEM", payload: item });
  };

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card shadow-sm">
              <div className="card-body py-5">
                <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
                <h3 className="text-muted mb-3">Your cart is empty</h3>
                <p className="text-muted mb-4">Start shopping to add items to your cart</p>
                <Link to="/" className="btn btn-primary btn-lg">
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0">
              <i className="bi bi-cart3 me-2"></i>
              Shopping Cart
            </h1>
            <span className="badge bg-primary fs-6">{cart.length} items</span>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage({ type: '', text: '' })}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="card-title mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Cart Items
              </h5>
            </div>
            <div className="card-body p-0">
              {cart.map((item) => (
                <div key={item.id} className="border-bottom p-3">
                  <div className="row align-items-center">
                    <div className="col-3 col-md-2">
                      <img
                        src={item.imageUrls?.[0] || "https://via.placeholder.com/200"}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                      />
                    </div>
                    <div className="col-9 col-md-10">
                      <div className="row align-items-center">
                        <div className="col-md-4">
                          <Link to={`/product/${item.category?.toLowerCase()}/${item.subCategory?.toLowerCase()}/${item.name.toLowerCase()}/dp/${item.id}`}
                            className="text-decoration-none"
                          >
                            <h6 className="mb-1 text-dark text-truncate">{item.name}</h6>
                          <p className="text-muted small mb-1 text-truncate">{item.description}</p>
                          </Link>
                          {(item.size || item.color) && (
                            <div className="small text-muted">
                              {item.size && <span className="me-2">Size: {item.size}</span>}
                              {item.color && <span>Color: {item.color}</span>}
                            </div>
                          )}
                        </div>
                        <div className="col-md-3">
                          <div className="d-flex align-items-center">
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleDecrement(item)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <span className="mx-3 fw-bold">{item.quantity}</span>
                            <button 
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => dispatch({ type: "INCREMENT_ITEM", payload: item })}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-3 text-center">
                          <span className="fw-bold text-primary">
                            ₦{(item.newPrice * item.quantity).toFixed(2)}
                          </span>
                          <div className="small text-muted">
                            ₦{item.newPrice?.toFixed(2)} each
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleRemoveItem(item)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-receipt me-2"></i>
                Order Summary
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span>₦{calculateTotalPrice().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <strong>Total:</strong>
                <strong className="text-primary fs-5">₦{calculateTotalPrice().toFixed(2)}</strong>
              </div>

              <button 
                className="btn btn-success w-100 py-3 mb-3"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill me-2"></i>
                    Proceed to Payment
                  </>
                )}
              </button>

              <div className="alert alert-info small">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Secure Payment</strong>
                <div className="mt-1">Your payment information is encrypted and secure.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      <div className="row mt-5">
        <div className="col-12">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
};

export default CartPage;