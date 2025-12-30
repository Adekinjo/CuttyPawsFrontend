import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from "react-bootstrap";
import { FaCamera, FaTimes, FaArrowLeft, FaPaperPlane, FaEdit, FaUndo } from "react-icons/fa";
import PostService from "../../service/PostService";

const EditPostPage = () => {
    const navigate = useNavigate();
    const { postId } = useParams();
    
    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);

    const [formData, setFormData] = useState({
        caption: "",
        images: []
    });

    // Fetch post data on component mount
    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoadingPost(true);
                setError("");
                console.log("🔄 Fetching post with ID:", postId);
                
                const response = await PostService.getPostById(postId);
                console.log("📦 FULL API RESPONSE:", response);
                
                // Check if response exists and has data
                if (response && response.status === 200) {
                    console.log("✅ Response status is 200");
                    
                    // Try different possible response structures
                    let postData = null;
                    
                    // Option 1: response.post (most likely based on your backend)
                    if (response.post) {
                        postData = response.post;
                        console.log("📝 Found post data in response.post:", postData);
                    }
                    // Option 2: response.data
                    else if (response.data) {
                        postData = response.data;
                        console.log("📝 Found post data in response.data:", postData);
                    }
                    // Option 3: response itself is the post data
                    else {
                        postData = response;
                        console.log("📝 Response itself is post data:", postData);
                    }
                    
                    if (postData) {
                        console.log("🎯 POST DATA TO DISPLAY:", {
                            caption: postData.caption,
                            images: postData.images,
                            imageCount: postData.images ? postData.images.length : 0
                        });
                        
                        // Set caption
                        setFormData({
                            caption: postData.caption || "",
                            images: []
                        });

                        // Set existing images
                        if (postData.images && postData.images.length > 0) {
                            console.log("🖼️ Setting existing images:", postData.images);
                            setExistingImages(postData.images);
                        } else {
                            console.log("⚠️ No images found in post data");
                            setExistingImages([]);
                        }
                    } else {
                        console.log("❌ No post data found in any expected location");
                        setError("Post data not found in response");
                    }
                } else {
                    console.log("❌ Response status not 200:", response?.status);
                    setError(response?.message || "Failed to load post data");
                }
            } catch (err) {
                console.error("❌ Error fetching post:", err);
                console.error("Error details:", {
                    message: err.message,
                    status: err.status,
                    data: err.data
                });
                setError(err.message || "Failed to load post. Please try again.");
            } finally {
                setLoadingPost(false);
            }
        };

        if (postId) {
            fetchPost();
        } else {
            setError("No post ID provided");
            setLoadingPost(false);
        }
    }, [postId]);

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

        // Check total images limit (existing + new)
        const totalImages = existingImages.length - imagesToDelete.length + imagePreviews.length + validFiles.length;
        if (totalImages > 10) {
            setError("You can have maximum 10 images per post");
            return;
        }

        // Create preview URLs for new images
        const newPreviews = validFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isNew: true,
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));

        setImagePreviews(prev => [...prev, ...newPreviews]);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...validFiles]
        }));
        setError("");
        
        // Reset file input
        e.target.value = "";
    };

    const removeExistingImage = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId]);
    };

    const removeNewImage = (previewId) => {
        setImagePreviews(prev => {
            const newPreviews = prev.filter(p => p.id !== previewId);
            // Revoke object URL to prevent memory leaks
            const previewToRemove = prev.find(p => p.id === previewId);
            if (previewToRemove) {
                URL.revokeObjectURL(previewToRemove.preview);
            }
            return newPreviews;
        });

        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => {
                const preview = imagePreviews[index];
                return preview?.id !== previewId;
            })
        }));
    };

    const restoreExistingImage = (imageId) => {
        setImagesToDelete(prev => prev.filter(id => id !== imageId));
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

        const totalImages = existingImages.length - imagesToDelete.length + formData.images.length;
        if (totalImages === 0) {
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
            const updateData = {
                caption: formData.caption,
                images: formData.images
            };

            // Add images to delete if any
            if (imagesToDelete.length > 0) {
                updateData.imagesToDelete = imagesToDelete;
            }

            console.log("📤 Sending update data:", updateData);
            const response = await PostService.updatePost(postId, updateData);
            
            if (response.status === 200) {
                setSuccess("Post updated successfully!");
                
                // Redirect after success
                setTimeout(() => {
                    navigate("/customer-profile");
                }, 2000);
            } else {
                setError(response.message || "Failed to update post");
            }

        } catch (err) {
            console.error("Error updating post:", err);
            setError(err.message || "Failed to update post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        navigate(-1);
    };

    // Calculate current image count
    const currentImageCount = (existingImages.length - imagesToDelete.length) + imagePreviews.length;

    // Clean up object URLs on component unmount
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                URL.revokeObjectURL(preview.preview);
            });
        };
    }, [imagePreviews]);

    if (loadingPost) {
        return (
            <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
                <Row className="justify-content-center">
                    <Col lg={8} xl={6}>
                        <div className="d-flex justify-content-center align-items-center py-5">
                            <Spinner animation="border" role="status" className="me-3" />
                            <span>Loading post data...</span>
                        </div>
                    </Col>
                </Row>
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
                            disabled={loading}
                        >
                            <FaArrowLeft />
                        </Button>
                        <div>
                            <h1 className="h3 fw-bold mb-1">Edit Post</h1>
                            <p className="text-muted mb-0">
                                Update your post content and images 
                                {postId && <span className="ms-2">(ID: {postId})</span>}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError("")}>
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                            {success}
                        </Alert>
                    )}

                    {/* Debug Info - Always show for now to help troubleshoot */}
                    <Alert variant="info" className="mb-4">
                        <strong>Debug Info:</strong><br />
                        Post ID: {postId}<br />
                        Caption: "{formData.caption}"<br />
                        Caption Length: {formData.caption.length}<br />
                        Existing Images: {existingImages.length}<br />
                        Images to Delete: {imagesToDelete.length}<br />
                        New Images: {imagePreviews.length}<br />
                        Total Images: {currentImageCount}
                    </Alert>

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
                                        style={{ fontSize: '16px' }}
                                    />
                                    <Form.Text className="text-muted">
                                        {formData.caption.length}/500 characters
                                    </Form.Text>
                                </Form.Group>

                                {/* Image Management Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold d-block mb-3">
                                        <FaCamera className="me-2" />
                                        Photos ({currentImageCount}/10)
                                    </Form.Label>
                                    
                                    <div className="border rounded p-4">
                                        {/* Existing Images */}
                                        {existingImages.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="text-muted mb-3">
                                                    Current Images 
                                                    <small className="ms-2 text-primary">
                                                        ({existingImages.length - imagesToDelete.length} remaining)
                                                    </small>
                                                </h6>
                                                <Row className="g-3">
                                                    {existingImages.map((image, index) => {
                                                        const imageId = image._id || image.id || `image-${index}`;
                                                        const isMarkedForDelete = imagesToDelete.includes(imageId);
                                                        // Try multiple possible image URL properties
                                                        const imageUrl = image.imageUrl || image.url || image.path || image.secure_url;
                                                        
                                                        console.log(`🖼️ Image ${index}:`, { imageId, imageUrl, isMarkedForDelete });
                                                        
                                                        return (
                                                            <Col xs={6} md={4} lg={3} key={imageId}>
                                                                <div className="position-relative">
                                                                    <Image
                                                                        src={imageUrl}
                                                                        alt={`Existing image ${index + 1}`}
                                                                        fluid
                                                                        rounded
                                                                        style={{ 
                                                                            height: "120px", 
                                                                            width: "100%", 
                                                                            objectFit: "cover",
                                                                            opacity: isMarkedForDelete ? 0.5 : 1,
                                                                            border: isMarkedForDelete ? "2px solid #dc3545" : "2px solid transparent",
                                                                            transition: 'all 0.3s ease'
                                                                        }}
                                                                        onError={(e) => {
                                                                            console.error("❌ Failed to load image:", imageUrl);
                                                                            e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                                                                        }}
                                                                    />
                                                                    <Button
                                                                        variant={isMarkedForDelete ? "success" : "danger"}
                                                                        size="sm"
                                                                        className="position-absolute top-0 end-0 m-1 rounded-circle"
                                                                        style={{ width: "28px", height: "28px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                        onClick={() => 
                                                                            isMarkedForDelete 
                                                                                ? restoreExistingImage(imageId)
                                                                                : removeExistingImage(imageId)
                                                                        }
                                                                        disabled={loading}
                                                                        title={isMarkedForDelete ? "Restore image" : "Remove image"}
                                                                    >
                                                                        {isMarkedForDelete ? (
                                                                            <FaUndo size={10} />
                                                                        ) : (
                                                                            <FaTimes size={10} />
                                                                        )}
                                                                    </Button>
                                                                    {isMarkedForDelete && (
                                                                        <div className="position-absolute top-50 start-50 translate-middle">
                                                                            <small className="text-danger fw-bold" style={{ textShadow: '1px 1px 2px white' }}>
                                                                                Removed
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        )}

                                        {/* New Images */}
                                        {imagePreviews.length > 0 && (
                                            <div className="mb-4">
                                                <h6 className="text-muted mb-3">
                                                    New Images 
                                                    <small className="ms-2 text-success">({imagePreviews.length} added)</small>
                                                </h6>
                                                <Row className="g-3">
                                                    {imagePreviews.map((preview, index) => (
                                                        <Col xs={6} md={4} lg={3} key={preview.id}>
                                                            <div className="position-relative">
                                                                <Image
                                                                    src={preview.preview}
                                                                    alt={`New image ${index + 1}`}
                                                                    fluid
                                                                    rounded
                                                                    style={{ 
                                                                        height: "120px", 
                                                                        width: "100%", 
                                                                        objectFit: "cover",
                                                                        border: "2px solid #28a745"
                                                                    }}
                                                                />
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    className="position-absolute top-0 end-0 m-1 rounded-circle"
                                                                    style={{ width: "28px", height: "28px", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    onClick={() => removeNewImage(preview.id)}
                                                                    disabled={loading}
                                                                    title="Remove new image"
                                                                >
                                                                    <FaTimes size={10} />
                                                                </Button>
                                                                <div className="position-absolute top-0 start-0 m-1">
                                                                    <small className="badge bg-success">New</small>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        )}

                                        {/* Upload Area */}
                                        {currentImageCount < 10 && (
                                            <Form.Group>
                                                <Form.Label 
                                                    className="border-2 border-dashed rounded d-flex flex-column align-items-center justify-content-center cursor-pointer"
                                                    style={{ 
                                                        height: "120px", 
                                                        border: "2px dashed #dee2e6",
                                                        cursor: loading ? "not-allowed" : "pointer",
                                                        opacity: loading ? 0.6 : 1,
                                                        transition: 'all 0.3s ease',
                                                        backgroundColor: '#fafafa'
                                                    }}
                                                    htmlFor="post-images"
                                                >
                                                    <FaCamera className="text-muted mb-2" size={20} />
                                                    <small className="text-muted text-center">
                                                        Add More Photos<br />
                                                        <span className="text-primary">({10 - currentImageCount} slots remaining)</span>
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
                                        )}

                                        {/* Empty State */}
                                        {currentImageCount === 0 && (
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
                                        disabled={loading || currentImageCount === 0 || !formData.caption.trim()}
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
                                                <FaEdit className="me-2" />
                                                Update Post
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

export default EditPostPage;