import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import OrderService from "../../service/OrderService";
import PaymentService from "../../service/PaymentService";
import { useCart } from "../../component/context/CartContext";

const CheckoutPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const waitForPaidStatus = async (reference, maxAttempts = 10, delayMs = 1500) => {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await PaymentService.getPaymentStatus(reference);

      if (statusResponse?.paymentStatus === "PAID") {
        return statusResponse;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(
      "Payment confirmation is still pending. Please wait a few seconds and try again."
    );
  };

  const handleOrderPaymentSuccess = async (pendingPayment) => {
    const cartItems = Array.isArray(pendingPayment?.cart) ? pendingPayment.cart : [];
    const totalPrice = Number(pendingPayment?.totalPrice || 0);

    if (cartItems.length === 0) {
      throw new Error("Cart items not found for order payment.");
    }

    const orderResponse = await OrderService.createOrderAfterPayment(
      pendingPayment.paymentId,
      cartItems,
      totalPrice
    );

    if (orderResponse?.status !== 200) {
      throw new Error(orderResponse?.message || "Order creation failed.");
    }

    dispatch({ type: "CLEAR_CART" });
    localStorage.removeItem("pendingPayment");

    navigate("/payment-success", {
      state: {
        orderId: orderResponse.orderId,
        message: "Your order has been placed successfully!",
      },
    });
  };

  const handleServiceBookingPaymentSuccess = (pendingPayment) => {
    localStorage.removeItem("pendingPayment");

    navigate("/service-bookings/success", {
      state: {
        bookingId: pendingPayment?.bookingId,
        message: "Your service booking payment was completed successfully!",
      },
    });
  };

  const handleServiceAdPaymentSuccess = (pendingPayment) => {
    navigate("/service-ads/success", {
      state: {
        serviceAdSubscriptionId: pendingPayment?.serviceAdSubscriptionId,
        message: "Your service ad payment was completed successfully!",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment form is not ready yet. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const pendingPaymentRaw = localStorage.getItem("pendingPayment");
      const pendingPayment = pendingPaymentRaw ? JSON.parse(pendingPaymentRaw) : null;

      if (!pendingPayment) {
        throw new Error("Pending payment details not found.");
      }

      if (!pendingPayment.reference) {
        throw new Error("Payment reference is missing.");
      }

      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      console.log("confirmPayment result:", result);

      if (result.error) {
        throw new Error(result.error.message || "Payment failed.");
      }

      if (!result.paymentIntent) {
        throw new Error("Payment could not be completed.");
      }

      if (result.paymentIntent.status !== "succeeded") {
        throw new Error(`Payment status is ${result.paymentIntent.status}.`);
      }

      await waitForPaidStatus(pendingPayment.reference);

      const purpose = pendingPayment.paymentPurpose;

      switch (purpose) {
        case "ORDER":
          await handleOrderPaymentSuccess(pendingPayment);
          break;

        case "SERVICE_BOOKING":
          handleServiceBookingPaymentSuccess(pendingPayment);
          break;

        case "SERVICE_AD":
          handleServiceAdPaymentSuccess(pendingPayment);
          break;

        default:
          throw new Error("Unknown payment purpose.");
      }
    } catch (error) {
      console.error("Checkout payment error:", error);
      setMessage(error.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <h3 className="mb-4">Complete Payment</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <PaymentElement />
          </div>

          {message && <div className="alert alert-danger">{message}</div>}

          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={loading || !stripe || !elements}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPaymentForm;