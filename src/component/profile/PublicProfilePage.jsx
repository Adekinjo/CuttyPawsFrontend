import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import UserProfileService from "../../service/UserProfileService";
import FollowService from "../../service/FollowService";
import PostService from "../../service/PostService";
import { 
  Container, Row, Col, Card, Button, Image, Alert, Spinner, Badge, Tab, Nav, Modal
} from "react-bootstrap";
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaImages, 
  FaHeart, FaComment, FaUsers, FaBan, FaArrowLeft,
  FaUserPlus, FaUserCheck, FaUserMinus, FaList
} from "react-icons/fa";
import PostCard from "../post/PostCard";

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [followStats, setFollowStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers"); // "followers" or "following"
  const [followList, setFollowList] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchCurrentUser();
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

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch basic profile first
      const profileResponse = await UserProfileService.getUserProfile(userId);
      
      if (profileResponse.status === 200) {
        setUserProfile(profileResponse.user);
        
        // Then fetch stats and follow data - handle errors gracefully
        const [statsResponse, followStatsResponse] = await Promise.allSettled([
          UserProfileService.getUserStats(userId),
          FollowService.getFollowStats(userId)
        ]);

        // Handle user stats
        if (statsResponse.status === 'fulfilled' && statsResponse.value.status === 200) {
          setUserStats(statsResponse.value.userStats);
        } else {
          console.warn("Failed to load user stats, using defaults");
          setUserStats({
            postCount: 0,
            totalLikes: 0,
            totalComments: 0
          });
        }

        // Handle follow stats
        if (followStatsResponse.status === 'fulfilled' && followStatsResponse.value.status === 200) {
          setFollowStats(followStatsResponse.value.followStats);
        } else {
          console.warn("Failed to load follow stats, using defaults");
          setFollowStats({
            followersCount: 0,
            followingCount: 0,
            isFollowing: false,
            isFollowedBy: false
          });
        }

        // Fetch user posts
        await fetchUserPosts();
      } else {
        setError(profileResponse.message || "Failed to load user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await UserProfileService.getUserPosts(userId);
      
      if (response.status === 200) {
        setUserPosts(response.postList || []);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setFollowLoading(true);
    try {
      const response = await FollowService.followUser(userId);
      if (response.status === 200) {
        // Refresh follow stats
        const followStatsResponse = await FollowService.getFollowStats(userId);
        if (followStatsResponse.status === 200) {
          setFollowStats(followStatsResponse.followStats);
        }
      } else {
        alert(response.message || "Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
      alert("Failed to follow user");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setFollowLoading(true);
    try {
      const response = await FollowService.unfollowUser(userId);
      if (response.status === 200) {
        // Refresh follow stats
        const followStatsResponse = await FollowService.getFollowStats(userId);
        if (followStatsResponse.status === 200) {
          setFollowStats(followStatsResponse.followStats);
        }
      } else {
        alert(response.message || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      alert("Failed to unfollow user");
    } finally {
      setFollowLoading(false);
    }
  };

  // Updated Follow Stats Component for PublicProfilePage
  const FollowStatsPublic = ({ followersCount, followingCount, userId }) => {
    const navigate = useNavigate();

    const handleFollowersClick = () => {
      navigate(`/customer-profile/${userId}/followers`);
    };

    const handleFollowingClick = () => {
      navigate(`/customer-profile/${userId}/following`);
    };

    return (
      <div className="d-flex justify-content-center gap-4 mb-3">
        <div 
          className="text-center cursor-pointer"
          onClick={handleFollowersClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="fw-bold text-dark fs-5">{followersCount}</div>
          <small className="text-muted">Followers</small>
        </div>
        <div 
          className="text-center cursor-pointer"
          onClick={handleFollowingClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="fw-bold text-dark fs-5">{followingCount}</div>
          <small className="text-muted">Following</small>
        </div>
      </div>
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isCurrentUserProfile = () => {
    return currentUser && userProfile && currentUser.id === userProfile.id;
  };

  const isAdmin = () => {
    return currentUser && currentUser.role === "ROLE_ADMIN";
  };

  const handleBlockUser = async () => {
    if (!window.confirm("Are you sure you want to block this user?")) return;

    const reason = prompt("Please enter the reason for blocking this user:");
    if (!reason) return;

    try {
      const response = await UserProfileService.blockUser(userId, reason);
      if (response.status === 200) {
        setUserProfile(response.user);
        alert("User blocked successfully");
      } else {
        alert(response.message || "Failed to block user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;

    try {
      const response = await UserProfileService.unblockUser(userId);
      if (response.status === 200) {
        setUserProfile(response.user);
        alert("User unblocked successfully");
      } else {
        alert(response.message || "Failed to unblock user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Failed to unblock user");
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading profile...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">
          <h4>Unable to load profile</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={handleBack}>
            Go Back
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container className="text-center py-5">
        <h3>User not found</h3>
        <Button variant="primary" onClick={handleBack}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          {/* Back Button */}
          <Button variant="outline-secondary" onClick={handleBack} className="mb-3">
            <FaArrowLeft className="me-2" />
            Back
          </Button>

          {/* Header Section */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col xs="auto">
                  <div className="position-relative">
                    <div 
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                      style={{ 
                        width: "80px", 
                        height: "80px", 
                        fontSize: "2rem",
                        overflow: "hidden"
                      }}
                    >
                      {userProfile.profileImageUrl ? (
                        <Image 
                          src={userProfile.profileImageUrl} 
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
                      {!userProfile.profileImageUrl && <FaUser />}
                    </div>
                    {userProfile.isBlocked && (
                      <Badge bg="danger" className="position-absolute top-0 start-0">
                        Blocked
                      </Badge>
                    )}
                  </div>
                </Col>
                <Col>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h2 className="mb-1 fw-bold">{userProfile.name}</h2>
                      <p className="text-muted mb-1">@{userProfile.name.toLowerCase().replace(/\s+/g, '')}</p>
                      <div className="d-flex flex-wrap gap-3 text-muted small">
                        <span className="d-flex align-items-center">
                          <FaEnvelope className="me-1" />
                          {userProfile.email}
                        </span>
                        {userProfile.phoneNumber && (
                          <span className="d-flex align-items-center">
                            <FaPhone className="me-1" />
                            {userProfile.phoneNumber}
                          </span>
                        )}
                        {userProfile.address && (
                          <span className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-1" />
                            {userProfile.address.city}, {userProfile.address.state}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Follow/Unfollow Button & Admin Actions */}
                    <div className="d-flex gap-2">
                      {!isCurrentUserProfile() && currentUser && (
                        followStats?.isFollowing ? (
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={handleUnfollow}
                            disabled={followLoading}
                          >
                            {followLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <FaUserCheck className="me-1" />
                                Following
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={handleFollow}
                            disabled={followLoading}
                          >
                            {followLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <>
                                <FaUserPlus className="me-1" />
                                Follow
                              </>
                            )}
                          </Button>
                        )
                      )}
                      
                      {isAdmin() && !isCurrentUserProfile() && (
                        <div>
                          {userProfile.isBlocked ? (
                            <Button variant="success" size="sm" onClick={handleUnblockUser}>
                              Unblock User
                            </Button>
                          ) : (
                            <Button variant="danger" size="sm" onClick={handleBlockUser}>
                              <FaBan className="me-1" />
                              Block User
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Stats Section - KEEPING YOUR EXACT DESIGN */}
              <hr className="my-3" />
              <Row className="text-center">
                <Col>
                  <h5 className="fw-bold mb-1">{userStats?.postCount || 0}</h5>
                  <small className="text-muted">Posts</small>
                </Col>
                <Col>
                  <h5 className="fw-bold mb-1">{userStats?.totalLikes || 0}</h5>
                  <small className="text-muted">Likes</small>
                </Col>
                <Col>
                  <h5 className="fw-bold mb-1">{userStats?.totalComments || 0}</h5>
                  <small className="text-muted">Comments</small>
                </Col>
                <Col>
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/customer-profile/${userProfile.id}/followers`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h5 className="fw-bold mb-1">{followStats?.followersCount || 0}</h5>
                    <small className="text-muted">Followers</small>
                  </div>
                </Col>
                <Col>
                  <div 
                    className="cursor-pointer"
                    onClick={() => navigate(`/customer-profile/${userProfile.id}/following`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h5 className="fw-bold mb-1">{followStats?.followingCount || 0}</h5>
                    <small className="text-muted">Following</small>
                  </div>
                </Col>
              </Row>

              {/* Blocked Message */}
              {userProfile.isBlocked && (
                <Alert variant="warning" className="mt-3">
                  <FaBan className="me-2" />
                  This user has been blocked. {userProfile.blockedReason && `Reason: ${userProfile.blockedReason}`}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Navigation Tabs */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body className="p-0">
              <Nav 
                variant="pills" 
                className="justify-content-around"
                activeKey={activeTab}
                onSelect={setActiveTab}
              >
                <Nav.Item>
                  <Nav.Link eventKey="posts" className="text-center py-3 border-0 rounded-0">
                    <FaImages className="mb-1" />
                    <br />
                    <small>Posts</small>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="about" className="text-center py-3 border-0 rounded-0">
                    <FaUser className="mb-1" />
                    <br />
                    <small>About</small>
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>

          {/* Tab Content */}
          <Tab.Content>
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">
                    Posts ({userPosts.length})
                    {userProfile.isBlocked && " - Blocked"}
                  </h5>
                  
                  {userProfile.isBlocked ? (
                    <div className="text-center py-5 text-muted">
                      <FaBan size={48} className="mb-3" />
                      <h5>This user's posts are not available</h5>
                      <p>The user has been blocked from the platform.</p>
                    </div>
                  ) : postsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading posts...</p>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-5">
                      <FaImages className="text-muted mb-3" style={{ fontSize: "3rem" }} />
                      <h5 className="text-muted">No posts yet</h5>
                      <p className="text-muted">This user hasn't shared any posts yet.</p>
                    </div>
                  ) : (
                    <div className="posts-feed">
                      {userPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          currentUser={currentUser}
                          isOwner={false} // Not the owner in public view
                        />
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* About Tab */}
            {activeTab === "about" && (
              <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">About</h5>
                  
                  {userProfile.isBlocked ? (
                    <div className="text-center py-5 text-muted">
                      <FaBan size={48} className="mb-3" />
                      <h5>Profile information is not available</h5>
                      <p>The user has been blocked from the platform.</p>
                    </div>
                  ) : (
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="border rounded p-3">
                          <strong>Full Name</strong>
                          <p className="mb-0 text-muted">{userProfile.name}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="border rounded p-3">
                          <strong>Email</strong>
                          <p className="mb-0 text-muted">{userProfile.email}</p>
                        </div>
                      </Col>
                      {userProfile.phoneNumber && (
                        <Col md={6}>
                          <div className="border rounded p-3">
                            <strong>Phone Number</strong>
                            <p className="mb-0 text-muted">{userProfile.phoneNumber}</p>
                          </div>
                        </Col>
                      )}
                      <Col md={6}>
                        <div className="border rounded p-3">
                          <strong>Member Since</strong>
                          <p className="mb-0 text-muted">
                            {userProfile.regDate ? new Date(userProfile.regDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </Col>
                      {userProfile.address && (
                        <Col xs={12}>
                          <div className="border rounded p-3">
                            <strong>Address</strong>
                            <p className="mb-0 text-muted">
                              {userProfile.address.street}, {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zipcode}
                            </p>
                          </div>
                        </Col>
                      )}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            )}
          </Tab.Content>
        </Col>
      </Row>

      {/* Follow Modal */}
      <Modal show={showFollowModal} onHide={() => setShowFollowModal(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {followModalType === "followers" ? "Followers" : "Following"} 
            ({followList.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {followListLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading...</p>
            </div>
          ) : followList.length === 0 ? (
            <div className="text-center py-3 text-muted">
              <FaUsers size={32} className="mb-2" />
              <p>No {followModalType} found</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {followList.map((follow) => {
                const user = followModalType === "followers" ? follow.follower : follow.following;
                return (
                  <div key={follow.id} className="list-group-item border-0 px-0">
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <Image
                          src={user.profileImageUrl || "/default-avatar.png"}
                          alt={user.name}
                          roundedCircle
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                      </Col>
                      <Col>
                        <Link 
                          to={`/customer-profile/${user.id}`}
                          className="text-decoration-none text-dark fw-bold"
                        >
                          {user.name}
                        </Link>
                        <br />
                        <small className="text-muted">{user.email}</small>
                      </Col>
                      {currentUser && currentUser.id !== user.id && (
                        <Col xs="auto">
                          {/* Add follow/unfollow buttons for users in the list */}
                          {/* You would need to check follow status for each user */}
                        </Col>
                      )}
                    </Row>
                  </div>
                );
              })}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PublicProfilePage;