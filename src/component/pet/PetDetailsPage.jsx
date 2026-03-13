import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Container,
  Row,
  Spinner
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaEdit,
  FaMapMarkerAlt,
  FaPaw,
  FaRulerCombined,
  FaShieldAlt,
  FaBolt
} from "react-icons/fa";
import { PawPrint } from "lucide-react";
import PetService from "../../service/PetService";
import "./petDetails.css";

const yesNo = (value) => (value ? "Yes" : "No");

const PetDetailsPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await PetService.getPet(petId);
        const petData = response?.pet || response?.data?.pet || response?.data || response;
        if (!petData || !petData.id) {
          throw new Error("Pet not found");
        }
        setPet(petData);
      } catch (err) {
        setError(err?.message || "Unable to load pet details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  const images = useMemo(() => {
    if (!pet) return [];
    const imageList = Array.isArray(pet.imageUrls) ? pet.imageUrls : [];
    return imageList.filter(Boolean);
  }, [pet]);

  if (loading) {
    return (
      <Container className="pet-details-page d-flex justify-content-center align-items-center">
        <div className="text-center">
          <Spinner animation="border" style={{ color: "#ff7b54" }} />
          <p className="text-muted mt-3 mb-0">Loading pet profile...</p>
        </div>
      </Container>
    );
  }

  if (error || !pet) {
    return (
      <Container className="pet-details-page py-4">
        <Alert variant="danger" className="rounded-4">
          <h5 className="fw-bold mb-2">Unable to open pet profile</h5>
          <p className="mb-3">{error || "Pet not found."}</p>
          <Button variant="outline-danger" onClick={() => navigate("/customer-profile")}>
            Back to Profile
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="pet-details-page pt-0 pb-5">
      <div className="pet-details-actions d-flex justify-content-between align-items-center mb-3">
        <Button
          type="button"
          className="pet-details-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" />
          Back
        </Button>

        <Button
          type="button"
          className="pet-details-edit-btn"
          onClick={() => navigate(`/edit-pet/${pet.id}`)}
        >
          <FaEdit className="me-2" />
          Edit Pet
        </Button>
      </div>

      <Card className="pet-hero-card border-0 shadow-sm rounded-4 overflow-hidden">
        <Row className="g-0">
          <Col lg={6} className="pet-hero-image-wrap">
            {images.length > 0 ? (
              <Carousel indicators={images.length > 1} interval={null}>
                {images.map((url, index) => (
                  <Carousel.Item key={`${url}-${index}`}>
                    <img src={url} alt={`${pet.name} ${index + 1}`} className="pet-hero-image" />
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="pet-hero-fallback">
                <PawPrint size={54} strokeWidth={2.2} />
              </div>
            )}
          </Col>

          <Col lg={6}>
            <Card.Body className="p-4 p-lg-5">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Badge className="pet-pill">
                  <FaPaw className="me-1" />
                  {pet.type || "Pet"}
                </Badge>
                {pet.breed ? <Badge bg="light" text="dark">{pet.breed}</Badge> : null}
              </div>

              <h1 className="pet-title mb-2">{pet.name || "Unnamed Pet"}</h1>
              <p className="text-muted mb-4">
                {pet.description || "A lovely member of the CuttyPaws family."}
              </p>

              <div className="pet-metrics-grid">
                <div className="pet-metric">
                  <span>Age</span>
                  <strong>{pet.age || "N/A"}</strong>
                </div>
                <div className="pet-metric">
                  <span>Gender</span>
                  <strong>{pet.gender || "N/A"}</strong>
                </div>
                <div className="pet-metric">
                  <span><FaRulerCombined className="me-1" /> Size</span>
                  <strong>{pet.size || "N/A"}</strong>
                </div>
                <div className="pet-metric">
                  <span><FaBolt className="me-1" /> Activity</span>
                  <strong>{pet.activityLevel || "N/A"}</strong>
                </div>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      <Row className="g-3 mt-1">
        <Col lg={8}>
          <Card className="pet-details-info-card border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">About {pet.name}</h5>
              <p className="text-muted mb-3">
                {pet.description || "No additional description provided yet."}
              </p>

              <div className="d-flex flex-wrap gap-2">
                {pet.temperament ? <Badge bg="light" text="dark">Temperament: {pet.temperament}</Badge> : null}
                {pet.color ? <Badge bg="light" text="dark">Color: {pet.color}</Badge> : null}
                {pet.specialNeeds ? <Badge bg="warning" text="dark">Special needs: {pet.specialNeeds}</Badge> : null}
                {Array.isArray(pet.tags) &&
                  pet.tags.map((tag) => (
                    <Badge key={tag} bg="secondary" className="text-lowercase">
                      #{tag}
                    </Badge>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="pet-details-info-card border-0 shadow-sm rounded-4 mb-3">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">
                <FaShieldAlt className="me-2" />
                Health
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Vaccinated</span>
                <strong>{yesNo(pet.vaccinated)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Neutered</span>
                <strong>{yesNo(pet.neutered)}</strong>
              </div>
            </Card.Body>
          </Card>

          <Card className="pet-details-info-card border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">
                <FaMapMarkerAlt className="me-2" />
                Location
              </h6>
              <p className="text-muted mb-0">
                {[pet.city, pet.state, pet.country].filter(Boolean).join(", ") || "No location provided."}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PetDetailsPage;
