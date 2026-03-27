import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentService from "../../service/PaymentService";
import OrderService from "../../service/OrderService";
import { useCart } from "../../component/context/CartContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your order...");
  const [orderId, setOrderId] = useState(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (hasProcessed) return;

    const processStripeSuccess = async () => {
      try {
        const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment"));

        if (!pendingPayment) {
          throw new Error("Pending payment details not found.");
        }

        const { reference, paymentId, cart, totalPrice } = pendingPayment;

        if (!reference || !paymentId || !cart?.length) {
          throw new Error("Incomplete pending payment details.");
        }

        setMessage("Verifying your payment...");

        const verificationResponse = await PaymentService.verifyPayment(reference);

        if (verificationResponse.status !== 200) {
          throw new Error(verificationResponse.message || "Payment verification failed.");
        }

        setMessage("Payment verified. Creating your order...");

        const orderResponse = await OrderService.createOrderAfterPayment(
          paymentId,
          cart,
          totalPrice
        );

        if (orderResponse.status !== 200) {
          throw new Error(orderResponse.message || "Order creation failed.");
        }

        setOrderId(orderResponse.orderId);
        setMessage("Your order has been created successfully.");
        setHasProcessed(true);

        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("pendingPayment");
      } catch (error) {
        console.error("Stripe payment success processing error:", error);
        setMessage(error.message || "Unable to complete your order.");
      } finally {
        setLoading(false);
      }
    };

    processStripeSuccess();
  }, [dispatch, hasProcessed]);

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center py-5">
                <div
                  className="spinner-border text-primary mb-4"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="card-title mb-3">Payment Processing</h3>
                <p className="card-text text-muted">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = !!orderId;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="mb-4">
                <div
                  className={`${
                    isSuccess ? "bg-success" : "bg-danger"
                  } rounded-circle d-inline-flex align-items-center justify-content-center`}
                  style={{ width: "80px", height: "80px" }}
                >
                  <i
                    className={`bi ${isSuccess ? "bi-check-lg" : "bi-x-lg"} text-white`}
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
              </div>

              <h1 className={`${isSuccess ? "text-success" : "text-danger"} mb-3`}>
                {isSuccess ? "Payment Successful!" : "Order Processing Failed"}
              </h1>

              <p className="lead text-muted mb-4">{message}</p>

              {orderId && (
                <div className="alert alert-success" role="alert">
                  <h5 className="alert-heading">
                    <i className="bi bi-receipt me-2"></i>
                    Order Confirmation
                  </h5>
                  <hr />
                  <p className="mb-1">
                    <strong>Order ID:</strong> #{orderId}
                  </p>
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

                {orderId ? (
                  <button
                    onClick={handleViewOrders}
                    className="btn btn-outline-success btn-lg px-4"
                  >
                    <i className="bi bi-list-ul me-2"></i>
                    View Orders
                  </button>
                ) : (
                  <button
                    onClick={handleGoHome}
                    className="btn btn-outline-secondary btn-lg px-4"
                  >
                    Go Home
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;