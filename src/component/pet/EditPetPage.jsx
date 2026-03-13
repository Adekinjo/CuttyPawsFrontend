import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { FaUpload, FaTimes, FaArrowLeft, FaSave } from "react-icons/fa";
import PetService from "../../service/PetService";

const EditPetPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "",
    description: "",
    size: "",
    color: "",
    activityLevel: "",
    temperament: "",
    vaccinated: false,
    neutered: false,
    specialNeeds: "",
    city: "",
    state: "",
    country: "",
    tags: [],
    coverImageIndex: 0,
    images: []
  });

  useEffect(() => {
    fetchPetData();
  }, [petId]);

  const fetchPetData = async () => {
    try {
      setFetchLoading(true);
      const response = await PetService.getPet(petId);
      const pet = response.pet;

      setFormData({
        name: pet.name || "",
        type: pet.type || "",
        breed: pet.breed || "",
        age: pet.age || "",
        gender: pet.gender || "",
        description: pet.description || "",
        size: pet.size || "",
        color: pet.color || "",
        activityLevel: pet.activityLevel || "",
        temperament: pet.temperament || "",
        vaccinated: pet.vaccinated || false,
        neutered: pet.neutered || false,
        specialNeeds: pet.specialNeeds || "",
        city: pet.city || "",
        state: pet.state || "",
        country: pet.country || "",
        tags: pet.tags || [],
        coverImageIndex: 0,
        images: []
      });

      setExistingImages(pet.imageUrls || []);
    } catch (err) {
      setError("Failed to load pet data");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);

    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await PetService.updatePet(petId, formData);
      setSuccess("Pet updated successfully!");

      setTimeout(() => {
        navigate("/customer-profile");
      }, 1500);
    } catch (err) {
      setError(err?.message || err.response?.data?.message || "Failed to update pet");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading pet data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <div className="d-flex align-items-center mb-4">
            <Button variant="outline-secondary" onClick={() => navigate("/customer-profile")} className="me-3">
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="h3 fw-bold mb-1">Edit Pet</h1>
              <p className="text-muted mb-0">Update your pet profile</p>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Current Photos</h6>
                    <Row className="g-3">
                      {existingImages.map((imageUrl, index) => (
                        <Col xs={6} md={4} key={index}>
                          <div className="position-relative">
                            <Image src={imageUrl} fluid rounded style={{ height: "150px", width: "100%", objectFit: "cover" }} />
                            <Button
                              variant="danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1 rounded-circle"
                              style={{ width: "30px", height: "30px" }}
                              onClick={() => removeExistingImage(index)}
                            >
                              <FaTimes size={12} />
                            </Button>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                <div className="mb-4">
                  <Form.Label>Add New Photos</Form.Label>
                  <Form.Control type="file" multiple accept="image/*" onChange={handleImageUpload} />
                </div>

                {imagePreviews.length > 0 && (
                  <Row className="g-3 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <Col xs={6} md={4} key={index}>
                        <div className="position-relative">
                          <Image src={preview.preview} fluid rounded style={{ height: "150px", width: "100%", objectFit: "cover" }} />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1 rounded-circle"
                            style={{ width: "30px", height: "30px" }}
                            onClick={() => removeNewImage(index)}
                          >
                            <FaTimes size={12} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}

                <Row className="g-3">
                  <Col md={6}><Form.Group><Form.Label>Name</Form.Label><Form.Control name="name" value={formData.name} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Type</Form.Label><Form.Control name="type" value={formData.type} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Breed</Form.Label><Form.Control name="breed" value={formData.breed} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Age</Form.Label><Form.Control type="number" name="age" value={formData.age} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Gender</Form.Label><Form.Control name="gender" value={formData.gender} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Size</Form.Label><Form.Control name="size" value={formData.size} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Color</Form.Label><Form.Control name="color" value={formData.color} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Activity Level</Form.Label><Form.Control name="activityLevel" value={formData.activityLevel} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>Temperament</Form.Label><Form.Control name="temperament" value={formData.temperament} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group><Form.Label>City</Form.Label><Form.Control name="city" value={formData.city} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={3}><Form.Group><Form.Label>State</Form.Label><Form.Control name="state" value={formData.state} onChange={handleInputChange} /></Form.Group></Col>
                  <Col md={3}><Form.Group><Form.Label>Country</Form.Label><Form.Control name="country" value={formData.country} onChange={handleInputChange} /></Form.Group></Col>
                  <Col xs={12}><Form.Group><Form.Label>Tags</Form.Label><Form.Control defaultValue={formData.tags.join(", ")} onChange={handleTagsChange} /></Form.Group></Col>
                  <Col md={6}><Form.Check type="checkbox" label="Vaccinated" name="vaccinated" checked={formData.vaccinated} onChange={handleInputChange} /></Col>
                  <Col md={6}><Form.Check type="checkbox" label="Neutered" name="neutered" checked={formData.neutered} onChange={handleInputChange} /></Col>
                  <Col xs={12}><Form.Group><Form.Label>Special Needs</Form.Label><Form.Control name="specialNeeds" value={formData.specialNeeds} onChange={handleInputChange} /></Form.Group></Col>
                  <Col xs={12}><Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleInputChange} /></Form.Group></Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
                  <Button variant="outline-secondary" onClick={() => navigate("/customer-profile")} disabled={loading}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <><Spinner size="sm" className="me-2" />Updating...</> : <><FaSave className="me-2" />Update Pet</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditPetPage;
