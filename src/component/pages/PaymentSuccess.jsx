import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, message } = location.state || {};

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-check-lg text-white" style={{ fontSize: '2.5rem' }}></i>
                </div>
              </div>
              
              <h1 className="text-success mb-3">Payment Successful!</h1>
              <p className="lead text-muted mb-4">
                {message || "Thank you for your purchase. Your order has been placed successfully!"}
              </p>
              
              {orderId && (
                <div className="alert alert-success" role="alert">
                  <h5 className="alert-heading">
                    <i className="bi bi-receipt me-2"></i>
                    Order Confirmation
                  </h5>
                  <hr />
                  <p className="mb-1"><strong>Order ID:</strong> #{orderId}</p>
                  <p className="mb-0">You will receive an email confirmation shortly.</p>
                </div>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button 
                  onClick={handleContinueShopping}
                  className="btn btn-primary btn-lg px-4 me-md-2"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Continue Shopping
                </button>
                {orderId && (
                  <button 
                    onClick={handleViewOrders}
                    className="btn btn-outline-success btn-lg px-4"
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    View Orders
                  </button>
                )}
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Need help? <a href="/customer-support" className="text-decoration-none">Contact our support team</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;