import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Alert, Spinner, Tab } from "react-bootstrap";
import ApiService from "../../service/AuthService";
import PetService from "../../service/PetService";
import PostService from "../../service/PostService";
import FollowService from "../../service/FollowService";

// Import the new components
import UserProfileHeader from "../profile/UserProfileHeader";
import ProfileTabsNavigation from "../profile/ProfileTabsNavigation";
import ProfileTabContent from "../profile/ProfileTabContent";

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [pets, setPets] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [followStats, setFollowStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  });
  
  const navigate = useNavigate();

  // Calculate totals
  const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.totalComments || 0), 0);

  useEffect(() => {
    fetchUserData();
    fetchUserPosts();
  }, []);

  // Fetch user data and follow stats
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userResponse, petsResponse] = await Promise.all([
        ApiService.getLoggedInInfo(),
        PetService.getMyPets()
      ]);
      
      setUserInfo(userResponse.user);
      setPets(petsResponse.petList || []);
      setWishlist(userResponse.wishlist || []);
      setOrders(userResponse.orderItemList || []);

      // Fetch follow stats after user info is loaded
      if (userResponse.user) {
        await fetchFollowStats(userResponse.user.id);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch follow stats separately
  const fetchFollowStats = async (userId) => {
    try {
      console.log("Fetching follow stats for user:", userId);
      const response = await FollowService.getFollowStats(userId);
      console.log("Follow stats response:", response);
      
      if (response.status === 200 && response.followStats) {
        setFollowStats({
          followersCount: response.followStats.followersCount || 0,
          followingCount: response.followStats.followingCount || 0,
          postsCount: posts.length // Update posts count from local state
        });
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await PostService.getMyPosts();
      const postsWithStats = (response.postList || []).map(post => ({
        ...post,
        likedByCurrentUser: post.likedByCurrentUser || false,
        likeCount: post.likeCount || 0,
        totalComments: post.totalComments || 0
      }));
      setPosts(postsWithStats);
      
      // Update posts count in follow stats
      setFollowStats(prev => ({
        ...prev,
        postsCount: postsWithStats.length
      }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Handler functions
  const handleDeletePet = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await PetService.deletePet(petId);
        setPets(pets.filter(pet => pet.id !== petId));
        setSuccess("Pet deleted successfully!");
      } catch (error) {
        console.error("Error deleting pet:", error);
        setError("Failed to delete pet");
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await PostService.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
        setSuccess("Post deleted successfully!");
        
        // Update posts count
        setFollowStats(prev => ({
          ...prev,
          postsCount: prev.postsCount - 1
        }));
      } catch (error) {
        console.error("Error deleting post:", error);
        setError("Failed to delete post");
      }
    }
  };

  const handleLikeUpdate = (postId, isLiked, newLikeCount) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likedByCurrentUser: isLiked, 
              likeCount: newLikeCount 
            }
          : post
      )
    );
  };

  const handleAddressClick = () => {
    navigate(userInfo.address ? "/edit-address" : "/add-address");
  };

  const handleEditPet = (petId) => {
    navigate(`/edit-pet/${petId}`);
  };

  const handleAddPet = () => {
    navigate("/add-pet");
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleProfileUpdate = () => {
    fetchUserData(); // Refresh user data when profile picture is updated
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

  if (!userInfo) {
    return (
      <Container className="text-center py-5">
        <h3>Unable to load profile information</h3>
        <Button variant="primary" onClick={fetchUserData}>Retry</Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="justify-content-center">
        <Col xl={10} xxl={8}>
          {/* Alerts */}
          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")} className="mb-4">
              {success}
            </Alert>
          )}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")} className="mb-4">
              {error}
            </Alert>
          )}

          {/* Header Section */}
          <UserProfileHeader 
            userInfo={userInfo}
            followStats={followStats}
            totalLikes={totalLikes}
            totalComments={totalComments}
            pets={pets}
            wishlist={wishlist}
            orders={orders}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Navigation Tabs */}
          <ProfileTabsNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <Tab.Content>
            <ProfileTabContent
              activeTab={activeTab}
              userInfo={userInfo}
              pets={pets}
              wishlist={wishlist}
              orders={orders}
              posts={posts}
              postsLoading={postsLoading}
              onEditPet={handleEditPet}
              onDeletePet={handleDeletePet}
              onAddPet={handleAddPet}
              onCreatePost={handleCreatePost}
              onDeletePost={handleDeletePost}
              onLikeUpdate={handleLikeUpdate}
              onAddressClick={handleAddressClick}
            />
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;