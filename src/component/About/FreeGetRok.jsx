import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faShoppingBag, faTrophy, faCheckCircle, faTags } from '@fortawesome/free-solid-svg-icons';
import HomeAppliance from '../pages/HomeAppliance';
import RecentView from '../pages/RecentView';

const FreeGetRok = () => {
  const [cartAmount, setCartAmount] = useState(0);
  const minimumPurchase = 500000; 
  const progress = Math.min((cartAmount / minimumPurchase) * 100, 100);

  return (
    <div className="container my-5">
      {/* Promo Card */}
      <div className="card shadow-lg border-0">
        {/* Card Header */}
        <div className="card-header bg-primary py-4 text-center">
          <h2 className="mb-0 text-warning">
            <FontAwesomeIcon icon={faGift} className="me-3 text-warning" />
            GET YOUR ROK FREE!
            <FontAwesomeIcon icon={faTrophy} className="ms-3 text-warning" />
          </h2>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <div className="row align-items-center mb-4">
            {/* ROK Product Display */}
            <div className="col-md-6 text-center">
              <div className="border border-3 border-primary rounded-3 p-4 position-relative">
                <div className="position-absolute top-0 start-50 translate-middle bg-warning text-dark px-4 py-2 rounded-pill">
                  FREE
                </div>
                <h3 className="text-warning mt-4">ROK Premium Kit</h3>
                <p className="text-muted">Worth ₦150,000</p>
              </div>
            </div>

            {/* Progress Bar and Input */}
            <div className="col-md-6">
              {/* Progress Bar */}
              <div className="progress mb-4" style={{ height: '30px' }}>
                <div
                  className="progress-bar bg-success progress-bar-striped"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                >
                  {progress.toFixed(1)}% Completed
                </div>
              </div>

              {/* Input Group */}
              <div className="input-group mb-4">
                <span className="input-group-text bg-warning">
                  <FontAwesomeIcon icon={faShoppingBag} />
                </span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter your cart amount"
                  value={cartAmount}
                  onChange={(e) => setCartAmount(Number(e.target.value))}
                />
                <span className="input-group-text">₦</span>
              </div>

              {/* Alert Messages */}
              {cartAmount >= minimumPurchase ? (
                <div className="alert alert-success">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Congratulations! You've unlocked your free ROK
                </div>
              ) : (
                <div className="alert alert-info">
                  <FontAwesomeIcon icon={faTags} className="me-2" />
                  Spend ₦{(minimumPurchase - cartAmount).toLocaleString()} more to claim your ROK
                </div>
              )}
            </div>
          </div>

          {/* Feature Icons */}
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <FontAwesomeIcon icon={faCheckCircle} className="text-success fa-3x" />
              <h5 className="mt-2">Premium Quality</h5>
            </div>
            <div className="col-md-3 mb-4">
              <FontAwesomeIcon icon={faGift} className="text-danger fa-3x" />
              <h5 className="mt-2">Free Delivery</h5>
            </div>
            <div className="col-md-3 mb-4">
              <FontAwesomeIcon icon={faTrophy} className="text-warning fa-3x" />
              <h5 className="mt-2">Exclusive Offer</h5>
            </div>
            <div className="col-md-3 mb-4">
              <FontAwesomeIcon icon={faTags} className="text-info fa-3x" />
              <h5 className="mt-2">Limited Time</h5>
            </div>
          </div>

          {/* Claim Button */}
          <div className="row mt-4">
            <div className="col-12 text-center">
              <button
                className="btn btn-warning btn-lg px-5 py-3"
                disabled={cartAmount < minimumPurchase}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                {cartAmount >= minimumPurchase ? 'Claim Your Free ROK' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Components */}
      <div className="mt-5">
        <HomeAppliance />
      </div>
      <div className="mt-5">
        <RecentView />
      </div>
    </div>
  );
};

export default FreeGetRok;