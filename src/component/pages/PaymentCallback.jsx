import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OrderService from "../../service/OrderService";
import PaymentService from "../../service/PaymentService";
import { useCart } from "../../component/context/CartContext";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useCart();
  const [status, setStatus] = useState("Processing your payment...");

  useEffect(() => {
    const processPaymentCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const reference = queryParams.get("reference") || queryParams.get("trxref");

      if (!reference) {
        setStatus("❌ Payment reference not found");
        setTimeout(() => navigate("/payment-failed"), 3000);
        return;
      }

      try {
        setStatus("🔍 Verifying payment with Paystack...");

        // Step 1: Verify payment
        const verificationResponse = await PaymentService.verifyPayment(reference);
        
        if (verificationResponse.status !== 200) {
          throw new Error("Payment verification failed");
        }

        setStatus("✅ Payment verified! Creating your order...");

        // Step 2: Get stored cart data
        const pendingPayment = JSON.parse(localStorage.getItem('pendingPayment'));
        
        if (!pendingPayment) {
          throw new Error("Order details not found");
        }

        const paymentId = verificationResponse.paymentId || pendingPayment.paymentId;

        if (!paymentId) {
          throw new Error("Payment ID not found for order creation");
        }

        // Step 3: Create order after successful payment
        const orderResponse = await OrderService.createOrderAfterPayment(
          paymentId,
          pendingPayment.cart,
          pendingPayment.totalPrice
        );

        // Step 4: Clear cart and storage
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem('pendingPayment');

        setStatus("🎉 Order created successfully! Redirecting...");
        
        // Step 5: Redirect to success page
        setTimeout(() => {
          navigate("/payment-success", { 
            state: { 
              orderId: orderResponse.orderId,
              message: "Your order has been placed successfully!" 
            } 
          });
        }, 2000);

      } catch (error) {
        console.error("Payment callback error:", error);
        setStatus("❌ Payment processing failed. Redirecting...");
        localStorage.removeItem('pendingPayment');
        setTimeout(() => navigate("/payment-failed"), 3000);
      }
    };

    processPaymentCallback();
  }, [location, navigate, dispatch]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h3 className="card-title mb-3">Payment Processing</h3>
              <p className="card-text text-muted">{status}</p>
              <div className="progress mb-3">
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  style={{ width: status.includes("verified") ? '75%' : status.includes("created") ? '100%' : '50%' }}
                ></div>
              </div>
              <small className="text-muted">
                Please wait while we process your payment and create your order.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
