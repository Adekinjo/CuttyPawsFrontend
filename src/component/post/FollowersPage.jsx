import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Container, Row, Col, Card, Button, Image, Alert, Spinner, Badge
} from "react-bootstrap";
import { FaArrowLeft, FaUserPlus, FaUserCheck, FaUsers } from "react-icons/fa";
import FollowService from "../../service/FollowService";

const FollowersPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchFollowers();
  }, [userId]);

  const fetchCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing current user:", error);
      }
    }
  };

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await FollowService.getFollowers(userId);
      
      if (response.status === 200) {
        // Safely extract user objects from the response
        const followersList = (response.followersList || []).map(follow => {
          // Handle different possible data structures
          const user = follow.follower || follow.user || follow;
          
          if (!user || !user.id) {
            console.warn('Invalid follower data:', follow);
            return null;
          }
          
          return {
            ...user,
            isFollowing: false, // Initialize as false, we'll update below
            followLoading: false
          };
        }).filter(Boolean); // Remove any null entries

        // Now check follow status for each user
        const followersWithStatus = await Promise.all(
          followersList.map(async (user) => {
            try {
              const followStatus = await FollowService.checkFollowStatus(user.id);
              return {
                ...user,
                isFollowing: followStatus.followStats?.isFollowing || false,
                followLoading: false
              };
            } catch (error) {
              console.error("Error checking follow status for user:", user.id, error);
              return {
                ...user,
                isFollowing: false,
                followLoading: false
              };
            }
          })
        );
        
        setFollowers(followersWithStatus);
      } else {
        setError(response.message || "Failed to load followers");
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
      setError("Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId, isCurrentlyFollowing) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Update loading state for the specific user
    setFollowers(prev => 
      prev.map(user => 
        user.id === targetUserId 
          ? { ...user, followLoading: true }
          : user
      )
    );

    try {
      let response;
      if (isCurrentlyFollowing) {
        response = await FollowService.unfollowUser(targetUserId);
      } else {
        response = await FollowService.followUser(targetUserId);
      }

      if (response.status === 200) {
        // Update follow status
        setFollowers(prev => 
          prev.map(user => 
            user.id === targetUserId 
              ? { ...user, isFollowing: !isCurrentlyFollowing, followLoading: false }
              : user
          )
        );
      } else {
        setError(response.message || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setError("Failed to update follow status");
      
      // Reset loading state on error
      setFollowers(prev => 
        prev.map(user => 
          user.id === targetUserId 
            ? { ...user, followLoading: false }
            : user
        )
      );
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleUserClick = (userId) => {
    navigate(`/customer-profile/${userId}`);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading followers...</p>
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
            <Button variant="outline-secondary" onClick={handleBack} className="me-3">
              <FaArrowLeft />
            </Button>
            <div>
              <h2 className="fw-bold mb-1">Followers</h2>
              <p className="text-muted mb-0">{followers.length} follower{followers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Followers List */}
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              {followers.length === 0 ? (
                <div className="text-center py-5">
                  <FaUsers className="text-muted mb-3" size={48} />
                  <h5 className="text-muted">No followers yet</h5>
                  <p className="text-muted">When someone follows you, they'll appear here.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {followers.map((user) => (
                    <div 
                      key={user.id} 
                      className="list-group-item list-group-item-action border-0 px-4 py-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <Image
                            src={user.profileImageUrl || "/default-avatar.png"}
                            alt={user.name || 'User'}
                            roundedCircle
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                            className="me-3"
                            onError={(e) => {
                              e.target.src = "/default-avatar.png";
                            }}
                          />
                          <div>
                            <h6 className="mb-0 fw-bold">{user.name || 'Unknown User'}</h6>
                            <small className="text-muted">
                              @{(user.username || (user.name || 'user').toLowerCase().replace(/\s+/g, ''))}
                            </small>
                          </div>
                        </div>
                        
                        {currentUser && currentUser.id !== user.id && (
                          <Button 
                            variant={user.isFollowing ? "outline-primary" : "primary"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(user.id, user.isFollowing);
                            }}
                            disabled={user.followLoading}
                          >
                            {user.followLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : user.isFollowing ? (
                              <>
                                <FaUserCheck className="me-1" />
                                Following
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="me-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FollowersPage;