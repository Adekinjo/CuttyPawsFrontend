import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGift, faCheckCircle, faTruck, faExclamationTriangle, 
  faStar, faRocket, faShoppingBag, faBullseye,
  faShieldAlt, faClock, faTags, faBoxOpen, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const FreeDelivery = () => {
  const { cart } = useCart();
  const minimumAmount = 500000;

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.newPrice) || 0;
      const quantity = parseInt(item.quantity, 10) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const cartTotal = calculateCartTotal();
  const progress = Math.min((cartTotal / minimumAmount) * 100, 100);
  const amountNeeded = minimumAmount - cartTotal;

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-0 overflow-hidden">
        {/* Header Section */}
        <div className="card-header bg-gradient-success text-white py-4 position-relative">
          <div className="position-absolute end-0 top-0 me-3 mt-2">
            <div className="bg-white bg-opacity-25 p-3 rounded-circle">
              <FontAwesomeIcon icon={faRocket} size="2x" />
            </div>
          </div>
          <h3 className="mb-0 display-5 fw-bold">
            <FontAwesomeIcon icon={faTruck} className="me-3" />
            Free Delivery Offer
            <span className="badge bg-warning text-dark ms-3">Limited Time!</span>
          </h3>
          <p className="mb-0 mt-2 opacity-75">
            <FontAwesomeIcon icon={faClock} className="me-2" />
            Offer ends soon!
          </p>
        </div>

        {/* Main Content */}
        <div className="card-body position-relative">
          <div className="row mb-4 align-items-center">
            {/* Left Column */}
            <div className="col-md-5 text-center py-4">
              <div className="position-relative mb-4">
                <div className="bg-success bg-opacity-10 p-5 rounded-circle">
                  <FontAwesomeIcon 
                    icon={faTruck} 
                    className="text-success" 
                    size="3x"
                  />
                </div>
                <div className="position-absolute top-0 start-50 translate-middle">
                  <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                    <FontAwesomeIcon icon={faStar} className="me-2" />
                    FREE
                  </span>
                </div>
              </div>
              
              <div className="d-flex justify-content-center gap-3">
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="text-muted small">
                    <FontAwesomeIcon icon={faShoppingBag} className="me-2" />
                    Current Total
                  </div>
                  <div className="h4 mb-0 fw-bold text-success">
                    ₦{cartTotal.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-3 bg-light rounded-3">
                  <div className="text-muted small">
                    <FontAwesomeIcon icon={faBullseye} className="me-2" />
                    Target
                  </div>
                  <div className="h4 mb-0 fw-bold">₦500,000</div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-md-7">
              <div className={`alert ${cartTotal >= minimumAmount ? 'alert-success' : 'alert-warning'} d-flex align-items-center`}>
                <FontAwesomeIcon 
                  icon={cartTotal >= minimumAmount ? faCheckCircle : faExclamationTriangle} 
                  className="me-3" 
                  size="2x"
                />
                <div>
                  {cartTotal >= minimumAmount ? (
                    <span>Congratulations! You qualify for free delivery!</span>
                  ) : (
                    <span>Add ₦{amountNeeded.toLocaleString()} more to qualify</span>
                  )}
                </div>
              </div>

              {/* Progress Section */}
              <div className="progress-container mb-4">
                <div className="d-flex justify-content-between mb-2 small">
                  <span>
                    <FontAwesomeIcon icon={faChartLine} className="me-2" />
                    Progress
                  </span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="progress" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar bg-success progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Benefits Section */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div className="card h-100 border-success">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-success fa-2x mb-3" />
                      <h6>Secure Delivery</h6>
                      <p className="text-muted small mb-0">Guaranteed safe arrival</p>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="card h-100 border-warning">
                    <div className="card-body text-center">
                      <FontAwesomeIcon icon={faClock} className="text-warning fa-2x mb-3" />
                      <h6>Fast Shipping</h6>
                      <p className="text-muted small mb-0">2-3 business days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="row g-4 mt-2">
                <div className="col-12">
                  <Link 
                    to="/products" 
                    className="btn btn-outline-success w-100"
                  >
                    <FontAwesomeIcon icon={faTags} className="me-2" />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="text-center mt-5">
            <Link 
              to="/cart-view"
              className={`btn btn-lg px-5 py-3 fw-bold ${
                cartTotal >= minimumAmount 
                  ? 'btn-success' 
                  : 'btn-secondary disabled'
              }`}
            >
              <FontAwesomeIcon 
                icon={cartTotal >= minimumAmount ? faCheckCircle : faBoxOpen} 
                className="me-3" 
              />
              {cartTotal >= minimumAmount ? 'Proceed to Checkout' : 'Add More Items'}
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .card-header.bg-gradient-success {
          background: linear-gradient(135deg, #28a745, #218838);
        }
        .progress-bar.bg-success {
          background-color: #28a745 !important;
        }
        .card.border-success {
          border-color: #28a745 !important;
        }
        .card.border-warning {
          border-color: #ffc107 !important;
        }
        .btn-outline-success:hover {
          background-color: #28a745;
          color: white;
        }
        .btn-success:hover {
          background-color: #218838;
        }
        .progress-bar-striped {
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 1rem 1rem;
        }
        .progress-bar-animated {
          animation: progress-bar-stripes 1s linear infinite;
        }
        @keyframes progress-bar-stripes {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
};

export default FreeDelivery;