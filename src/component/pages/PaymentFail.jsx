import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate("/cart-view");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleContactSupport = () => {
    navigate("/contact");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-x-lg text-white" style={{ fontSize: '2.5rem' }}></i>
                </div>
              </div>
              
              <h1 className="text-danger mb-3">Payment Failed</h1>
              <p className="lead text-muted mb-3">
                We're sorry, but your payment could not be processed.
              </p>
              <p className="text-muted mb-4">
                Please check your payment details and try again.
              </p>

              <div className="alert alert-warning" role="alert">
                <h6 className="alert-heading">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  What could have happened?
                </h6>
                <ul className="mb-0 ps-3 text-start">
                  <li>Insufficient funds</li>
                  <li>Incorrect card details</li>
                  <li>Network connectivity issues</li>
                  <li>Bank declined the transaction</li>
                </ul>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button 
                  onClick={handleRetryPayment}
                  className="btn btn-primary btn-lg px-4 me-md-2"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Retry Payment
                </button>
                <button 
                  onClick={handleGoHome}
                  className="btn btn-outline-secondary btn-lg px-4 me-md-2"
                >
                  <i className="bi bi-house me-2"></i>
                  Go Home
                </button>
              </div>

              <div className="mt-4">
                <button 
                  onClick={handleContactSupport}
                  className="btn btn-link text-decoration-none"
                >
                  <i className="bi bi-headset me-1"></i>
                  Contact Support
                </button>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  If the problem persists, please contact our support team at{" "}
                  <a href="mailto:support@kinjomarket.com" className="text-decoration-none">
                    support@kinjomarket.com
                  </a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;