import { Alert, Button, Card, Col, Container, Placeholder, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useServiceDashboard from "../../hooks/useServiceDashboard";
import AuthService from "../../service/AuthService";
import ServiceProviderService from "../../service/ServiceProviderService";
import DashboardHeader from "./DashboardHeader";
import PerformanceInsightsCard from "./PerformanceInsightsCard";
import QuickActions from "./QuickActions";
import ServiceProfileCard from "./ServiceProfileCard";
import ServiceStatusBanner from "./ServiceStatusBanner";
import StatsCards from "./StatsCards";
import SubscriptionCard from "./SubscriptionCard";
import "../../style/ServiceProvider.css";

function DashboardLoadingState() {
  return (
    <Container className="py-5 service-provider-page">
      <Card className="service-card border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Placeholder as="div" animation="glow">
            <Placeholder xs={3} className="mb-3 rounded" />
            <Placeholder xs={5} className="mb-2 rounded" />
            <Placeholder xs={4} className="rounded" />
          </Placeholder>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        {[...Array(4)].map((_, index) => (
          <Col key={index} xs={12} sm={6} xl={3}>
            <Card className="service-card border-0 shadow-sm">
              <Card.Body className="p-4">
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={4} className="mb-3 rounded" />
                  <Placeholder xs={8} className="mb-2 rounded" />
                  <Placeholder xs={6} className="rounded" />
                </Placeholder>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="service-card border-0 shadow-sm">
            <Card.Body className="p-4">
              <Placeholder as="div" animation="glow">
                <Placeholder xs={6} className="mb-3 rounded" />
                <Placeholder xs={12} className="mb-2 rounded" />
                <Placeholder xs={11} className="mb-2 rounded" />
                <Placeholder xs={10} className="rounded" />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="service-card border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <Placeholder as="div" animation="glow">
                  <Placeholder xs={5} className="mb-3 rounded" />
                  <Placeholder xs={12} className="mb-2 rounded" />
                  <Placeholder xs={10} className="rounded" />
                </Placeholder>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
}

export default function ServiceDashboardPage() {
  const navigate = useNavigate();
  const isServiceProvider = AuthService.isServiceProvider();
  const { dashboard, loading, error, refreshDashboard } = useServiceDashboard(isServiceProvider);
  const publicProfileUserId = dashboard?.serviceProfile?.userId || ServiceProviderService.getStoredUser()?.id;

  if (!isServiceProvider) {
    return (
      <Container className="py-5 service-provider-page">
        <Alert variant="warning" className="service-card border-0 shadow-sm">
          This account is not registered as a service provider.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <Container className="py-5 service-provider-page">
      <DashboardHeader
        dashboard={dashboard}
        onEdit={() => navigate("/service/profile")}
        onRefresh={refreshDashboard}
        refreshing={loading}
      />

      {error ? <Alert variant="danger">{error}</Alert> : null}
      <ServiceStatusBanner dashboard={dashboard} />
      <StatsCards dashboard={dashboard} />

      <Row className="g-4">
        <Col lg={8}>
          <ServiceProfileCard profile={dashboard?.serviceProfile} />
        </Col>
        <Col lg={4}>
          <QuickActions
            dashboard={dashboard}
            onEdit={() => navigate("/service/profile")}
            onViewPublicProfile={() => navigate(`/services/${publicProfileUserId}`)}
            onManageAdverts={() => navigate("/service/ads")}
          />
          <SubscriptionCard
            subscription={dashboard?.activeAdSubscription}
            onUpgrade={() => navigate("/service/ads")}
          />
          <PerformanceInsightsCard profile={dashboard?.serviceProfile} />
        </Col>
      </Row>
    </Container>
  );
}
