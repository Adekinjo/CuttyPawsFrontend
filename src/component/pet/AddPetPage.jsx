import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { FaPaw, FaUpload, FaTimes, FaArrowLeft } from "react-icons/fa";
import PetService from "../../service/PetService";

const AddPetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const petTypes = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Guinea Pig", "Turtle", "Snake", "Lizard", "Other"];
  const genders = ["Male", "Female"];
  const sizes = ["Small", "Medium", "Large"];
  const activityLevels = ["Low", "Medium", "High"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setFormData((prev) => ({
      ...prev,
      tags
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    if (imagePreviews.length + validFiles.length > 5) {
      setError("You can upload maximum 5 images");
      return;
    }

    const newPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    setError("");
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      coverImageIndex: prev.coverImageIndex > index ? prev.coverImageIndex - 1 : 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Pet name is required");
      setLoading(false);
      return;
    }

    if (!formData.type) {
      setError("Please select a pet type");
      setLoading(false);
      return;
    }

    if (!formData.images.length) {
      setError("Please upload at least one pet image");
      setLoading(false);
      return;
    }

    try {
      await PetService.createPet(formData);
      setSuccess("Pet added successfully!");

      setTimeout(() => {
        navigate("/customer-profile");
      }, 1500);
    } catch (err) {
      setError(err?.message || err.response?.data?.message || "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <div className="d-flex align-items-center mb-4">
            <Button variant="outline-secondary" onClick={() => navigate("/customer-profile")} className="me-3">
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="h3 fw-bold mb-1">Add New Pet</h1>
              <p className="text-muted mb-0">Build a richer pet profile for smarter recommendations</p>
            </div>
          </div>

          {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess("")}>{success}</Alert>}

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">Pet Photos</Form.Label>
                  <div className="border rounded p-4 text-center">
                    {imagePreviews.length > 0 ? (
                      <Row className="g-3">
                        {imagePreviews.map((preview, index) => (
                          <Col xs={6} md={4} key={index}>
                            <div className="position-relative">
                              <Image
                                src={preview.preview}
                                alt={`Preview ${index + 1}`}
                                fluid
                                rounded
                                style={{ height: "150px", width: "100%", objectFit: "cover" }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1 rounded-circle"
                                style={{ width: "30px", height: "30px" }}
                                onClick={() => removeImage(index)}
                              >
                                <FaTimes size={12} />
                              </Button>

                              <Form.Check
                                type="radio"
                                name="coverImage"
                                label="Cover"
                                checked={formData.coverImageIndex === index}
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    coverImageIndex: index
                                  }))
                                }
                                className="mt-2 text-start"
                              />
                            </div>
                          </Col>
                        ))}
                      </Row>
                    ) : null}

                    {imagePreviews.length < 5 && (
                      <Form.Group className="mt-3">
                        <Form.Label
                          htmlFor="pet-images"
                          className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer py-4"
                          style={{ border: "2px dashed #dee2e6", cursor: "pointer" }}
                        >
                          <FaUpload className="text-muted mb-2" size={24} />
                          <small className="text-muted">Upload up to 5 photos</small>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="pet-images"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                      </Form.Group>
                    )}
                  </div>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Pet Name *</Form.Label>
                      <Form.Control name="name" value={formData.name} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Pet Type *</Form.Label>
                      <Form.Select name="type" value={formData.type} onChange={handleInputChange} required>
                        <option value="">Select Type</option>
                        {petTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Breed</Form.Label>
                      <Form.Control name="breed" value={formData.breed} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Age</Form.Label>
                      <Form.Control type="number" name="age" value={formData.age} onChange={handleInputChange} min="0" />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Gender</Form.Label>
                      <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Select Gender</option>
                        {genders.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Size</Form.Label>
                      <Form.Select name="size" value={formData.size} onChange={handleInputChange}>
                        <option value="">Select Size</option>
                        {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Color</Form.Label>
                      <Form.Control name="color" value={formData.color} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Activity Level</Form.Label>
                      <Form.Select name="activityLevel" value={formData.activityLevel} onChange={handleInputChange}>
                        <option value="">Select Activity Level</option>
                        {activityLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Temperament</Form.Label>
                      <Form.Control name="temperament" value={formData.temperament} onChange={handleInputChange} placeholder="Friendly, playful, calm..." />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control name="city" value={formData.city} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>State</Form.Label>
                      <Form.Control name="state" value={formData.state} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control name="country" value={formData.country} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Tags</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="playful, friendly, puppy, indoor"
                        onChange={handleTagsChange}
                      />
                      <Form.Text className="text-muted">Separate tags with commas</Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Vaccinated"
                      name="vaccinated"
                      checked={formData.vaccinated}
                      onChange={handleInputChange}
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Check
                      type="checkbox"
                      label="Neutered"
                      name="neutered"
                      checked={formData.neutered}
                      onChange={handleInputChange}
                    />
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Special Needs</Form.Label>
                      <Form.Control
                        name="specialNeeds"
                        value={formData.specialNeeds}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        maxLength={500}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
                  <Button variant="outline-secondary" onClick={() => navigate("/customer-profile")} disabled={loading}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <><Spinner size="sm" className="me-2" />Adding...</> : <>Add Pet</>}
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

export default AddPetPage;
