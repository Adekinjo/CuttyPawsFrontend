import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceProviderService from "../../service/ServiceProviderService";

const MAX_ATTEMPTS = 10;
const POLL_DELAY_MS = 1500;

export default function ServiceAdPaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your advert payment...");
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getPendingPayment = () => {
      return JSON.parse(localStorage.getItem("pendingPayment") || "null");
    };

    const cleanupPendingPayment = () => {
      const pendingPayment = JSON.parse(localStorage.getItem("pendingPayment") || "null");
      if (pendingPayment?.paymentPurpose === "SERVICE_AD") {
        localStorage.removeItem("pendingPayment");
      }
    };

    const checkStatus = async (attempt = 1) => {
      try {
        const pendingPayment = getPendingPayment();
        const targetSubscriptionId =
          location.state?.serviceAdSubscriptionId ||
          pendingPayment?.serviceAdSubscriptionId;

        if (!targetSubscriptionId) {
          throw new Error("Subscription ID not found.");
        }

        const subscriptionsResponse = await ServiceProviderService.getAdSubscriptions();
        const subscriptions = subscriptionsResponse?.serviceAdSubscriptions || [];

        const matchedSubscription = subscriptions.find(
          (item) => String(item.id) === String(targetSubscriptionId)
        );

        if (!matchedSubscription) {
          if (attempt >= MAX_ATTEMPTS) {
            throw new Error("Advert subscription was not found.");
          }

          timeoutRef.current = setTimeout(() => checkStatus(attempt + 1), POLL_DELAY_MS);
          return;
        }

        if (!isMounted) return;

        setSubscription(matchedSubscription);

        const paymentStatus = String(matchedSubscription.paymentStatus || "").toUpperCase();
        const isActive = matchedSubscription.isActive === true;

        if (paymentStatus === "PAID" && isActive) {
          setMessage("Your advert payment was confirmed successfully.");
          setError("");
          setLoading(false);
          cleanupPendingPayment();
          toast.success("Advert payment confirmed successfully.");
          return;
        }

        if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
          setError("Your advert payment was not completed successfully.");
          setLoading(false);
          toast.error("Advert payment failed.");
          return;
        }

        if (attempt >= MAX_ATTEMPTS) {
          setMessage("Payment was received and your advert is still being activated. Please check your subscriptions shortly.");
          setError("");
          setLoading(false);
          return;
        }

        setMessage("Payment received. Activating your advert...");
        timeoutRef.current = setTimeout(() => checkStatus(attempt + 1), POLL_DELAY_MS);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError(err?.message || "Unable to verify advert payment.");
        setLoading(false);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.state]);

  const isSuccess =
    String(subscription?.paymentStatus || "").toUpperCase() === "PAID" &&
    subscription?.isActive === true;

  return (
    <Container className="py-5">
      <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: "700px" }}>
        <Card.Body className="p-4 text-center">
          {loading ? (
            <>
              <Spinner animation="border" className="mb-3" />
              <h2 className="h4">Processing payment</h2>
              <p className="text-muted mb-0">{message}</p>
            </>
          ) : (
            <>
              <Alert variant={error ? "danger" : isSuccess ? "success" : "warning"}>
                {error || message}
              </Alert>

              {subscription ? (
                <div className="mb-4 text-start">
                  <p className="mb-1"><strong>Plan:</strong> {subscription.planType}</p>
                  <p className="mb-1"><strong>Payment Status:</strong> {subscription.paymentStatus}</p>
                  <p className="mb-1"><strong>Reference:</strong> {subscription.paymentReference}</p>
                  <p className="mb-0"><strong>Active:</strong> {subscription.isActive ? "Yes" : "No"}</p>
                </div>
              ) : null}

              <div className="d-flex justify-content-center gap-3">
                <Button onClick={() => navigate("/service/ads")}>
                  Back to advert subscriptions
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate("/service/dashboard")}>
                  Go to dashboard
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}