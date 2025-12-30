import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { FaCamera, FaTimes, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import PostService from "../../service/PostService";

const CreatePostPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreviews, setImagePreviews] = useState([]);

    const [formData, setFormData] = useState({
        caption: "",
        images: []
    });

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
                setError("Please upload only image files (JPEG, PNG, GIF)");
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
        if (imagePreviews.length + validFiles.length > 10) {
            setError("You can upload maximum 10 images per post");
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
        if (!formData.caption.trim()) {
            setError("Caption is required");
            setLoading(false);
            return;
        }

        if (formData.images.length === 0) {
            setError("At least one image is required");
            setLoading(false);
            return;
        }

        if (formData.caption.length > 500) {
            setError("Caption must be less than 500 characters");
            setLoading(false);
            return;
        }

        try {
            const response = await PostService.createPost(formData);
            
            if (response.status === 200) {
                setSuccess("Post created successfully!");
                
                // Reset form
                setFormData({
                    caption: "",
                    images: []
                });
                setImagePreviews([]);

                // Redirect after success
                setTimeout(() => {
                    navigate("/customer-profile");
                }, 2000);
            } else {
                setError(response.message || "Failed to create post");
            }

        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.message || "Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        navigate(-1);
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
                            disabled={loading}
                        >
                            <FaArrowLeft />
                        </Button>
                        <div>
                            <h1 className="h3 fw-bold mb-1">Create New Post</h1>
                            <p className="text-muted mb-0">Share your moments with the community</p>
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
                                {/* Caption Input */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Caption</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="caption"
                                        value={formData.caption}
                                        onChange={handleInputChange}
                                        placeholder="What's on your mind?"
                                        maxLength={500}
                                        disabled={loading}
                                    />
                                    <Form.Text className="text-muted">
                                        {formData.caption.length}/500 characters
                                    </Form.Text>
                                </Form.Group>

                                {/* Image Upload Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-block mb-3">
                                        <FaCamera className="me-2" />
                                        Photos ({imagePreviews.length}/10)
                                    </Form.Label>
                                    
                                    <div className="border rounded p-4">
                                        {imagePreviews.length > 0 ? (
                                            <Row className="g-3">
                                                {imagePreviews.map((preview, index) => (
                                                    <Col xs={6} md={4} lg={3} key={index}>
                                                        <div className="position-relative">
                                                            <Image
                                                                src={preview.preview}
                                                                alt={`Preview ${index + 1}`}
                                                                fluid
                                                                rounded
                                                                style={{ 
                                                                    height: "120px", 
                                                                    width: "100%", 
                                                                    objectFit: "cover" 
                                                                }}
                                                            />
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                className="position-absolute top-0 end-0 m-1 rounded-circle"
                                                                style={{ width: "28px", height: "28px" }}
                                                                onClick={() => removeImage(index)}
                                                                disabled={loading}
                                                            >
                                                                <FaTimes size={10} />
                                                            </Button>
                                                        </div>
                                                    </Col>
                                                ))}
                                                
                                                {imagePreviews.length < 10 && (
                                                    <Col xs={6} md={4} lg={3}>
                                                        <Form.Group>
                                                            <Form.Label 
                                                                className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer"
                                                                style={{ 
                                                                    height: "120px", 
                                                                    border: "2px dashed #dee2e6",
                                                                    cursor: loading ? "not-allowed" : "pointer",
                                                                    opacity: loading ? 0.6 : 1
                                                                }}
                                                                htmlFor="post-images"
                                                            >
                                                                <FaCamera className="text-muted mb-2" size={20} />
                                                                <small className="text-muted text-center">
                                                                    Add Photos
                                                                </small>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="file"
                                                                id="post-images"
                                                                multiple
                                                                accept="image/*"
                                                                onChange={handleImageUpload}
                                                                style={{ display: "none" }}
                                                                disabled={loading}
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
                                                        cursor: loading ? "not-allowed" : "pointer",
                                                        opacity: loading ? 0.6 : 1
                                                    }}
                                                    htmlFor="post-images"
                                                >
                                                    <FaCamera className="text-muted mb-3" size={32} />
                                                    <h5 className="text-muted">Upload Photos</h5>
                                                    <p className="text-muted mb-0 text-center">
                                                        Click to browse or drag and drop<br />
                                                        <small>Maximum 10 photos, 5MB each</small>
                                                    </p>
                                                </Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    id="post-images"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    style={{ display: "none" }}
                                                    disabled={loading}
                                                />
                                            </Form.Group>
                                        )}
                                    </div>
                                </Form.Group>

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
                                        disabled={loading || formData.images.length === 0 || !formData.caption.trim()}
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane className="me-2" />
                                                Create Post
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
                                <FaCamera className="me-2" />
                                Tips for Great Posts
                            </h6>
                            <ul className="list-unstyled text-muted mb-0">
                                <li className="mb-2">• Use high-quality, clear photos</li>
                                <li className="mb-2">• Write engaging captions that tell a story</li>
                                <li className="mb-2">• Show your pet's personality and activities</li>
                                <li className="mb-2">• Use natural lighting for better photos</li>
                                <li className="mb-0">• Be authentic and share real moments</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CreatePostPage;