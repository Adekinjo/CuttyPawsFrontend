import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Container, Row, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import useServiceDashboard from "../../hooks/useServiceDashboard";
import ServiceProviderService from "../../service/ServiceProviderService";
import { AD_PLAN_TYPES, formatCurrency, formatDateTime } from "../../utils/serviceProvider";
import ActiveSubscriptionCard from "../service-provider/ActiveSubscriptionCard";
import AdPlanCard from "../service-provider/AdPlanCard";
import ServiceStatusBanner from "../service-provider/ServiceStatusBanner";
import "../../style/ServiceProvider.css";

export default function ServiceAdsPage() {
  const { dashboard, loading: dashboardLoading, refreshDashboard } = useServiceDashboard(true);

  const [selectedPlan, setSelectedPlan] = useState(AD_PLAN_TYPES[0].value);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedPlanData = useMemo(
    () => AD_PLAN_TYPES.find((plan) => plan.value === selectedPlan),
    [selectedPlan]
  );

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      const [historyResponse, activeResponse] = await Promise.all([
        ServiceProviderService.getAdSubscriptions(),
        ServiceProviderService.getActiveAdSubscription(),
      ]);

      setSubscriptions(historyResponse?.serviceAdSubscriptions || []);
      setActiveSubscription(activeResponse?.serviceAdSubscription || null);
      setError("");
    } catch (err) {
      console.error("Failed to load advert subscriptions:", err);
      setError(err?.response?.data?.message || "Unable to load advert subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!dashboard?.canAccessDashboard) {
      toast.error("Only approved service providers can subscribe for adverts.");
      return;
    }

    try {
      setCreating(true);

      const payload = {
        planType: selectedPlan,
      };

      console.log("Creating advert subscription with payload:", payload);

      const response = await ServiceProviderService.createAdSubscription(payload);

      if (!response || response.status >= 400) {
        toast.error(response?.message || "Unable to create advert subscription.");
        return;
      }

      const subscription = response?.serviceAdSubscription || null;
      const paymentUrl = subscription?.paymentUrl;

      toast.success(response.message || "Advert subscription created successfully.");

      await loadSubscriptions();
      await refreshDashboard();

      if (!paymentUrl) {
        toast.error("Stripe checkout URL was not returned.");
        return;
      }

      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Create subscription error:", err);
      toast.error(err?.response?.data?.message || "Unable to create advert subscription.");
    } finally {
      setCreating(false);
    }
  };

  if (dashboardLoading || loading) {
    return (
      <Container className="py-5 service-provider-page text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5 service-provider-page">
      <div className="mb-4">
        <div className="service-eyebrow">Service Advertising</div>
        <h1 className="h2 mb-2">Advert subscriptions</h1>
      </div>

      <ServiceStatusBanner dashboard={dashboard} />

      {!dashboard?.canAccessDashboard ? (
        <Alert variant="warning">
          Advert subscriptions are only available to approved service providers.
        </Alert>
      ) : null}

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <Row className="g-4">
        <Col lg={8}>
          <Row className="g-3">
            {AD_PLAN_TYPES.map((plan) => (
              <Col md={6} key={plan.value}>
                <AdPlanCard
                  plan={plan}
                  selected={selectedPlan === plan.value}
                  onSelect={setSelectedPlan}
                  disabled={!dashboard?.canAccessDashboard || creating}
                />
              </Col>
            ))}
          </Row>

          <Card className="service-card border-0 shadow-sm mt-4">
            <Card.Body className="p-4">
              <h2 className="h5 mb-3">Create subscription</h2>

              <Row className="g-3">
                <Col md={6}>
                  <div>
                    <div className="fw-semibold mb-1">Plan</div>
                    <div className="text-muted">
                      {selectedPlanData?.label || selectedPlan}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div>
                    <div className="fw-semibold mb-1">Amount</div>
                    <div className="text-muted">
                      {formatCurrency(selectedPlanData?.price || 0)}
                    </div>
                  </div>
                </Col>
              </Row>

              <Alert variant="info" className="mt-4 mb-0">
                After creating the subscription, you will be redirected to Stripe to complete payment.
              </Alert>

              <Button
                className="service-primary-btn mt-4"
                onClick={handleCreateSubscription}
                disabled={creating || !dashboard?.canAccessDashboard}
              >
                {creating ? "Redirecting to Stripe..." : "Continue to Stripe"}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <ActiveSubscriptionCard subscription={activeSubscription} />
        </Col>
      </Row>

      <Card className="service-card border-0 shadow-sm mt-4">
        <Card.Body className="p-4">
          <h2 className="h5 mb-3">Subscription history</h2>

          {!subscriptions.length ? (
            <div className="text-muted">No advert subscriptions yet.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>{subscription.planType}</td>
                      <td>{formatCurrency(subscription.amount)}</td>
                      <td>{subscription.paymentStatus}</td>
                      <td>{subscription.paymentReference}</td>
                      <td>{formatDateTime(subscription.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}