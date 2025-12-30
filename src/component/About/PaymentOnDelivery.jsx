import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, faCheckCircle, faMoneyBillWave, faInfoCircle,
  faShieldAlt, faLock, faExclamationTriangle, faHandHoldingUsd,
  faClock, faTimesCircle, faBoxOpen, faCreditCard, faMapMarkerAlt,
  faCalendarAlt, faBalanceScale, faQrcode
} from '@fortawesome/free-solid-svg-icons';

const PaymentOnDelivery = () => {
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleProceed = () => {
    alert('Delivery fee payment successful! Your order is now being processed.');
  };

  return (
    <div className="container my-5">
      <div className="card shadow-lg border-primary">
        {/* Header Section */}
        <div className="card-header bg-primary text-white position-relative overflow-hidden">
          <div className="position-absolute end-0 top-0 opacity-25">
            <FontAwesomeIcon icon={faQrcode} className="fa-4x" />
          </div>
          <h2 className="mb-0 d-flex align-items-center">
            <FontAwesomeIcon 
              icon={faTruck} 
              className="me-3 animate-bounce" 
              style={{ fontSize: '2.5rem' }}
            />
            Secure Cash on Delivery
            <span className="badge bg-warning text-dark ms-3">Most Popular</span>
          </h2>
        </div>

        {/* Body Section */}
        <div className="card-body">
          {/* Progress Indicator */}
          <div className="delivery-process mb-5">
            <div className="process-step completed">
              <FontAwesomeIcon icon={faBoxOpen} />
              <span>Cart Review</span>
            </div>
            <div className="process-step active">
              <FontAwesomeIcon icon={faMoneyBillWave} />
              <span>Fee Payment</span>
            </div>
            <div className="process-step">
              <FontAwesomeIcon icon={faTruck} />
              <span>Delivery</span>
            </div>
          </div>

          {/* Payment Requirements */}
          <div className="alert alert-warning d-flex align-items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="fa-2x me-3" />
            <div>
              <h5 className="mb-1">Mandatory Delivery Fee</h5>
              <p className="mb-0">
                <FontAwesomeIcon icon={faLock} className="me-2" />
                ₦2,500 transport fee must be paid now to secure your order
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="h-100 p-4 bg-light rounded-3 border-start border-4 border-success">
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon 
                    icon={faShieldAlt} 
                    className="fa-2x text-success me-3" 
                  />
                  <h4 className="mb-0">Secure Transaction</h4>
                </div>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                    SSL Encrypted Payment
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faBalanceScale} className="text-success me-2" />
                    Money Back Guarantee
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="h-100 p-4 bg-light rounded-3 border-start border-4 border-primary">
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon 
                    icon={faMapMarkerAlt} 
                    className="fa-2x text-primary me-3" 
                  />
                  <h4 className="mb-0">Delivery Details</h4>
                </div>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-primary me-2" />
                    2-5 Business Days
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCreditCard} className="text-primary me-2" />
                    Cash/Card Accepted
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="terms-card p-4 mb-4 bg-light rounded-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="termsCheck"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="termsCheck">
                <h5 className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faHandHoldingUsd} className="me-2 text-danger" />
                  Payment Terms & Conditions
                </h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="me-2 text-danger" />
                    Transport fee payment is mandatory for order confirmation
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faClock} className="me-2 text-warning" />
                    Full payment must be completed upon delivery
                  </li>
                  <li className="mb-2">
                    <FontAwesomeIcon icon={faTimesCircle} className="me-2 text-danger" />
                    Orders canceled if fee not paid within 24 hours
                  </li>
                  <li>
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
                    Instant payment confirmation via SMS/Email
                  </li>
                </ul>
              </label>
            </div>
          </div>

          {/* Payment Action */}
          <div className="text-center">
            <button
              className={`btn btn-lg ${agreeTerms ? 'btn-success' : 'btn-secondary'} payment-btn`}
              disabled={!agreeTerms}
              onClick={'/cart-view'}
            >
              <FontAwesomeIcon 
                icon={agreeTerms ? faCreditCard : faTimesCircle} 
                className="me-2" 
              />
              {agreeTerms ? 'Pay Delivery Fee Now (₦2,500)' : 'Accept Terms to Continue'}
            </button>
            <p className="text-muted mt-3 small">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              * Delivery fee is non-refundable after order processing begins
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .delivery-process {
          display: flex;
          justify-content: space-between;
          position: relative;
          padding: 1rem 0;
        }
        
        .delivery-process::before {
          content: '';
          position: absolute;
          top: 50%;
          width: 90%;
          left: 5%;
          height: 3px;
          background: #e9ecef;
          z-index: 0;
        }
        
        .process-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
          background: white;
          padding: 0 1rem;
          transition: all 0.3s ease;
        }
        
        .process-step.completed {
          color: #198754;
          transform: scale(1.1);
        }
        
        .process-step.active {
          color: #0d6efd;
          font-weight: bold;
          transform: scale(1.2);
        }
        
        .payment-btn {
          transition: all 0.3s ease;
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }
        
        .payment-btn:hover:enabled {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .terms-card {
          border-left: 4px solid #0d6efd;
          transition: box-shadow 0.3s ease;
        }
        
        .terms-card:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default PaymentOnDelivery;