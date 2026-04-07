import { useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutPaymentForm from "./CheckoutPaymentForm";

const CheckoutPaymentPage = () => {
  const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment"));

  const stripePromise = useMemo(() => {
    if (!pendingPayment?.publishableKey) return null;
    return loadStripe(pendingPayment.publishableKey);
  }, [pendingPayment]);

  if (!pendingPayment) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Pending payment not found.</div>
      </div>
    );
  }

  if (!pendingPayment.paymentIntentClientSecret) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Payment client secret not found.</div>
      </div>
    );
  }

  if (!pendingPayment.publishableKey) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Stripe publishable key not found.</div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Stripe failed to initialize.</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: pendingPayment.paymentIntentClientSecret,
        }}
      >
        <CheckoutPaymentForm />
      </Elements>
    </div>
  );
};

export default CheckoutPaymentPage;