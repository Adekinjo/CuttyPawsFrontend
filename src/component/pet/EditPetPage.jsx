import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { FaPaw, FaUpload, FaTimes, FaArrowLeft, FaSave } from "react-icons/fa";
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
    images: []
  });

  const petTypes = [
    "Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", 
    "Guinea Pig", "Turtle", "Snake", "Lizard", "Other"
  ];

  const genders = ["Male", "Female"];

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
        images: []
      });

      // Set existing images for preview
      if (pet.imageUrls && pet.imageUrls.length > 0) {
        setExistingImages(pet.imageUrls);
      }

    } catch (err) {
      console.error("Error fetching pet:", err);
      setError("Failed to load pet data");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
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

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    setError("");
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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

    try {
      await PetService.updatePet(petId, formData);
      setSuccess("Pet updated successfully!");
      
      setTimeout(() => {
        navigate("/profile");
      }, 2000);

    } catch (err) {
      console.error("Error updating pet:", err);
      setError(err.response?.data?.message || "Failed to update pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/customer-profile");
  };

  if (fetchLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading pet data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Header */}
          <div className="d-flex align-items-center mb-4">
            <Button 
              variant="outline-secondary" 
              onClick={goBack}
              className="me-3"
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="h3 fw-bold mb-1">Edit Pet</h1>
              <p className="text-muted mb-0">Update your pet's information</p>
            </div>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Pet Images */}
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">
                    <FaPaw className="me-2" />
                    Pet Photos
                  </Form.Label>
                  
                  <div className="border rounded p-4">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mb-3">
                        <h6 className="fw-bold mb-3">Current Photos</h6>
                        <Row className="g-3">
                          {existingImages.map((imageUrl, index) => (
                            <Col xs={6} md={4} key={`existing-${index}`}>
                              <div className="position-relative">
                                <Image
                                  src={imageUrl}
                                  alt={`Existing ${index + 1}`}
                                  fluid
                                  rounded
                                  style={{ 
                                    height: "150px", 
                                    width: "100%", 
                                    objectFit: "cover" 
                                  }}
                                />
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

                    {/* New Images Upload */}
                    <div>
                      <h6 className="fw-bold mb-3">Add New Photos</h6>
                      {imagePreviews.length > 0 ? (
                        <Row className="g-3">
                          {imagePreviews.map((preview, index) => (
                            <Col xs={6} md={4} key={index}>
                              <div className="position-relative">
                                <Image
                                  src={preview.preview}
                                  alt={`New ${index + 1}`}
                                  fluid
                                  rounded
                                  style={{ 
                                    height: "150px", 
                                    width: "100%", 
                                    objectFit: "cover" 
                                  }}
                                />
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
                          
                          {(existingImages.length + imagePreviews.length) < 5 && (
                            <Col xs={6} md={4}>
                              <Form.Group>
                                <Form.Label 
                                  className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer"
                                  style={{ 
                                    height: "150px", 
                                    border: "2px dashed #dee2e6",
                                    cursor: "pointer"
                                  }}
                                  htmlFor="pet-images"
                                >
                                  <FaUpload className="text-muted mb-2" size={24} />
                                  <small className="text-muted text-center">
                                    Add More Photos
                                  </small>
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
                            </Col>
                          )}
                        </Row>
                      ) : (
                        <Form.Group>
                          <Form.Label 
                            className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer py-4"
                            style={{ 
                              border: "2px dashed #dee2e6",
                              cursor: "pointer"
                            }}
                            htmlFor="pet-images"
                          >
                            <FaUpload className="text-muted mb-2" size={24} />
                            <small className="text-muted text-center">
                              Click to upload new photos<br />
                              <span className="text-xs">(Max 5 total photos)</span>
                            </small>
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
                </div>

                {/* Form fields (same as AddPetPage) */}
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Pet Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Pet Type *</Form.Label>
                      <Form.Select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        {petTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Breed</Form.Label>
                      <Form.Control
                        type="text"
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Age (years) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Gender</Form.Label>
                      <div>
                        {genders.map(gender => (
                          <Form.Check
                            key={gender}
                            inline
                            type="radio"
                            name="gender"
                            label={gender}
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={handleInputChange}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        maxLength={500}
                      />
                      <Form.Text className="text-muted">
                        {formData.description.length}/500 characters
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end mt-4 pt-3 border-top">
                  <Button 
                    variant="outline-secondary" 
                    onClick={goBack}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Update Pet
                      </>
                    )}
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