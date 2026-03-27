import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ServiceProviderService from "../../service/ServiceProviderService";

export default function ServiceAdPaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your advert payment...");

  useEffect(() => {
    const run = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        console.log("Stripe session ID:", sessionId);

        const subscriptionsResponse = await ServiceProviderService.getAdSubscriptions();
        const subscriptions = subscriptionsResponse?.serviceAdSubscriptions || [];

        const pendingOrPaid = subscriptions.find(
          (item) =>
            item.paymentStatus === "PENDING" ||
            item.paymentStatus === "PAID"
        );

        if (pendingOrPaid?.paymentReference) {
          const confirmResponse = await ServiceProviderService.confirmAdPayment({
            paymentReference: pendingOrPaid.paymentReference,
          });

          if (confirmResponse?.status >= 400) {
            setMessage(confirmResponse?.message || "Payment verification failed.");
            toast.error(confirmResponse?.message || "Payment verification failed.");
          } else {
            setMessage(confirmResponse?.message || "Advert payment confirmed successfully.");
            toast.success(confirmResponse?.message || "Advert payment confirmed successfully.");
          }
        } else {
          setMessage("Payment completed, but no matching subscription was found.");
        }
      } catch (error) {
        console.error(error);
        setMessage(error?.response?.data?.message || "Unable to verify advert payment.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [searchParams]);

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
              <Alert variant="success">{message}</Alert>
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