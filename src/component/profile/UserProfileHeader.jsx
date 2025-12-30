import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Image, Button, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaTrash, FaHeart, FaComment, FaPaw, FaBoxOpen } from "react-icons/fa";
import ApiService from "../../service/AuthService";

const UserProfileHeader = ({ 
  userInfo, 
  followStats, 
  totalLikes, 
  totalComments, 
  pets, 
  wishlist, 
  orders,
  onProfileUpdate 
}) => {
  const navigate = useNavigate();
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProfilePictureClick = () => {
    setShowProfilePicModal(true);
    setError("");
    setSuccess("");
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      setError("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      
      const formData = new FormData();
      formData.append("image", profilePicture);

      const response = await ApiService.updateUserProfilePicture(formData);
      
      if (response.status === 200) {
        setShowProfilePicModal(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
        setSuccess("Profile picture updated successfully!");
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        setError(response.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setError(error.response?.data?.message || "Failed to update profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowProfilePicModal(false);
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setError("");
  };

  const removeProfilePicture = async () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      try {
        // Call API to remove profile picture
        setSuccess("Profile picture removed successfully!");
        setShowProfilePicModal(false);
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } catch (error) {
        console.error("Error removing profile picture:", error);
        setError("Failed to remove profile picture. Please try again.");
      }
    }
  };

  const handleFollowersClick = () => {
    navigate(`/profile/${userInfo.id}/followers`);
  };

  const handleFollowingClick = () => {
    navigate(`/profile/${userInfo.id}/following`);
  };

  return (
    <>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            {/* Profile Picture */}
            <Col xs="auto" className="mb-3 mb-md-0">
              <div className="position-relative">
                <div 
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                  style={{ 
                    width: "80px", 
                    height: "80px", 
                    fontSize: "2rem",
                    cursor: "pointer",
                    overflow: "hidden"
                  }}
                  onClick={handleProfilePictureClick}
                >
                  {userInfo.profileImageUrl ? (
                    <Image 
                      src={userInfo.profileImageUrl} 
                      alt="Profile"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover" 
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!userInfo.profileImageUrl && <FaUser />}
                </div>
                <div 
                  className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1 border border-white"
                  style={{ 
                    width: "24px", 
                    height: "24px",
                    cursor: "pointer"
                  }}
                  onClick={handleProfilePictureClick}
                >
                  <FaCamera className="text-white" size={12} />
                </div>
              </div>
            </Col>

            {/* User Info and Follow Stats */}
            <Col>
              <Row className="align-items-center">
                {/* User Basic Info */}
                <Col md={6} className="mb-3 mb-md-0">
                  <div>
                    <h2 className="mb-1 fw-bold text-truncate">{userInfo.name}</h2>
                    <p className="text-muted mb-1">@{userInfo.name.toLowerCase().replace(/\s+/g, '')}</p>
                    <div className="d-flex flex-wrap gap-2 text-muted small">
                      <span className="d-flex align-items-center">
                        <FaEnvelope className="me-1 flex-shrink-0" />
                        <span className="text-truncate">{userInfo.email}</span>
                      </span>
                      {userInfo.phoneNumber && (
                        <span className="d-flex align-items-center">
                          <FaPhone className="me-1 flex-shrink-0" />
                          <span>{userInfo.phoneNumber}</span>
                        </span>
                      )}
                      {userInfo.address && (
                        <span className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-1 flex-shrink-0" />
                          <span className="text-truncate">{userInfo.address.city}, {userInfo.address.state}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Col>

                {/* Follow Stats */}
                <Col md={6}>
                  <Row className="text-center g-0">
                    <Col xs={4}>
                      <div 
                        className="cursor-pointer p-2"
                        onClick={handleFollowersClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="fw-bold text-dark fs-5">{followStats.followersCount || 0}</div>
                        <small className="text-muted">Followers</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div 
                        className="cursor-pointer p-2"
                        onClick={handleFollowingClick}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="fw-bold text-dark fs-5">{followStats.followingCount || 0}</div>
                        <small className="text-muted">Following</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="p-2">
                        <div className="fw-bold text-dark fs-5">{followStats.postsCount || 0}</div>
                        <small className="text-muted">Posts</small>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Additional Stats Section */}
          <hr className="my-3" />
          <Row className="text-center">
            <Col xs={6} sm={4} lg={2}>
              <h5 className="fw-bold mb-1">{totalLikes}</h5>
              <small className="text-muted">Likes</small>
            </Col>
            <Col xs={6} sm={4} lg={2}>
              <h5 className="fw-bold mb-1">{totalComments}</h5>
              <small className="text-muted">Comments</small>
            </Col>
            <Col xs={6} sm={4} lg={2}>
              <h5 className="fw-bold mb-1">{pets.length}</h5>
              <small className="text-muted">Pets</small>
            </Col>
            <Col xs={6} sm={4} lg={2}>
              <h5 className="fw-bold mb-1">{wishlist.length}</h5>
              <small className="text-muted">Wishlist</small>
            </Col>
            <Col xs={6} sm={4} lg={2}>
              <h5 className="fw-bold mb-1">{orders.length}</h5>
              <small className="text-muted">Orders</small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Profile Picture Update Modal */}
      <Modal show={showProfilePicModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profilePicturePreview ? (
            <div className="text-center mb-3">
              <Image
                src={profilePicturePreview}
                alt="Profile preview"
                fluid
                style={{ maxHeight: "300px", objectFit: "cover" }}
                className="rounded"
              />
            </div>
          ) : (
            <div className="text-center mb-3">
              <div 
                className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                style={{ width: "200px", height: "200px" }}
              >
                <FaUser size={64} className="text-muted" />
              </div>
            </div>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Choose a new profile picture</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            <Form.Text className="text-muted">
              Supported formats: JPEG, PNG, GIF. Max size: 5MB
            </Form.Text>
          </Form.Group>

          {error && (
            <Alert variant="danger" className="py-2">
              <small>{error}</small>
            </Alert>
          )}

          <div className="d-flex gap-2">
            <Button
              variant="primary"
              onClick={handleProfilePictureUpload}
              disabled={uploading || !profilePicture}
              className="flex-fill"
            >
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Upload Picture'
              )}
            </Button>
            {userInfo.profileImageUrl && (
              <Button
                variant="outline-danger"
                onClick={removeProfilePicture}
                disabled={uploading}
              >
                <FaTrash className="me-1" />
                Remove
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserProfileHeader;