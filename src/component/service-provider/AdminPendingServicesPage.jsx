import { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import ServiceProviderService from "../../service/ServiceProviderService";
import PendingApprovalCard from "./PendingApprovalCard";
import RejectionModal from "./RejectionModal";
import "../../style/ServiceProvider.css";

export default function AdminPendingServicesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const response = await ServiceProviderService.getPendingServiceRegistrations();
      setProfiles(response.serviceProfiles || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load pending service registrations.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profile) => {
    try {
      setApprovingId(profile.userId);
      const response = await ServiceProviderService.approveServiceRegistration(profile.userId);
      toast.success(response.message || "Service registration approved.");
      await loadProfiles();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to approve service registration.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (reason) => {
    if (!selectedProfile) return;
    try {
      setRejectingId(selectedProfile.userId);
      const response = await ServiceProviderService.rejectServiceRegistration(selectedProfile.userId, reason);
      toast.success(response.message || "Service registration rejected.");
      setSelectedProfile(null);
      await loadProfiles();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to reject service registration.");
    } finally {
      setRejectingId(null);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 service-provider-page text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5 service-provider-page">
      <div className="mb-4">
        <div className="service-eyebrow">Admin Moderation</div>
        <h1 className="h2 mb-2">Pending service registrations</h1>
      </div>
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {!profiles.length ? (
        <Alert variant="light" className="border text-muted">
          No pending service registrations.
        </Alert>
      ) : (
        <Row className="g-4">
          {profiles.map((profile) => (
            <Col lg={6} key={profile.id || profile.userId}>
              <PendingApprovalCard
                profile={profile}
                approving={approvingId === profile.userId}
                rejecting={rejectingId === profile.userId}
                onApprove={() => handleApprove(profile)}
                onReject={() => setSelectedProfile(profile)}
              />
            </Col>
          ))}
        </Row>
      )}
      <RejectionModal
        show={Boolean(selectedProfile)}
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onSubmit={handleReject}
        submitting={Boolean(rejectingId)}
      />
    </Container>
  );
}
