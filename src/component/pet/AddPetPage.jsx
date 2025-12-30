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
    images: []
  });

  const petTypes = [
    "Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", 
    "Guinea Pig", "Turtle", "Snake", "Lizard", "Other"
  ];

  const genders = ["Male", "Female"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError("Please upload only image files");
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Check total images limit
    if (imagePreviews.length + validFiles.length > 5) {
      setError("You can upload maximum 5 images");
      return;
    }

    // Create preview URLs
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

  const removeImage = (index) => {
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

    // Validation
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

    if (!formData.age || formData.age < 0 || formData.age > 50) {
      setError("Please enter a valid age (0-50)");
      setLoading(false);
      return;
    }

    try {
      await PetService.createPet(formData);
      setSuccess("Pet added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        type: "",
        breed: "",
        age: "",
        gender: "",
        description: "",
        images: []
      });
      setImagePreviews([]);

      // Redirect after success
      setTimeout(() => {
        navigate("/customer-profile");
      }, 2000);

    } catch (err) {
      console.error("Error adding pet:", err);
      setError(err.response?.data?.message || "Failed to add pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate("/customer-profile");
  };

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
              <h1 className="h3 fw-bold mb-1">Add New Pet</h1>
              <p className="text-muted mb-0">Share your furry friend with the community</p>
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
                {/* Pet Images Upload */}
                <div className="mb-4">
                  <Form.Label className="fw-bold mb-3">
                    <FaPaw className="me-2" />
                    Pet Photos
                  </Form.Label>
                  
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
                                onClick={() => removeImage(index)}
                              >
                                <FaTimes size={12} />
                              </Button>
                            </div>
                          </Col>
                        ))}
                        
                        {imagePreviews.length < 5 && (
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
                                  Add More Photos<br />
                                  <span className="text-xs">(Max 5)</span>
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
                          className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer py-5"
                          style={{ 
                            border: "2px dashed #dee2e6",
                            cursor: "pointer"
                          }}
                          htmlFor="pet-images"
                        >
                          <FaUpload className="text-muted mb-3" size={32} />
                          <h5 className="text-muted">Upload Pet Photos</h5>
                          <p className="text-muted mb-0">Click to browse or drag and drop</p>
                          <small className="text-muted">PNG, JPG up to 5MB (Max 5 photos)</small>
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
                  {/* Pet Name */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaPaw className="me-2" />
                        Pet Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your pet's name"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Pet Type */}
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

                  {/* Breed */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Breed</Form.Label>
                      <Form.Control
                        type="text"
                        name="breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                        placeholder="e.g., Golden Retriever, Persian, etc."
                      />
                    </Form.Group>
                  </Col>

                  {/* Age */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Age (years) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                        max="50"
                        step="0.1"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Gender */}
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
                            id={`gender-${gender.toLowerCase()}`}
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  {/* Description */}
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Tell us about your pet's personality, habits, or any special needs..."
                        maxLength={500}
                      />
                      <Form.Text className="text-muted">
                        {formData.description.length}/500 characters
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Submit Buttons */}
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
                        Adding Pet...
                      </>
                    ) : (
                      <>
                        <FaPaw className="me-2" />
                        Add Pet
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Tips Card */}
          <Card className="shadow-sm border-0 mt-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">
                <FaPaw className="me-2" />
                Tips for Great Pet Photos
              </h6>
              <ul className="list-unstyled text-muted mb-0">
                <li className="mb-2">• Use clear, well-lit photos</li>
                <li className="mb-2">• Show your pet's face clearly</li>
                <li className="mb-2">• Include full-body shots</li>
                <li className="mb-2">• Capture their personality</li>
                <li className="mb-0">• Avoid blurry or dark images</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddPetPage;