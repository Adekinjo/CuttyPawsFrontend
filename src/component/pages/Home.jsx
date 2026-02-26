// Home.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { FaImages, FaPlus } from "react-icons/fa";
import PostService from "../../service/PostService";
import PostCard from "../post/PostCard";
import styles from "../../style/Home.module.css"; // CSS Modules import

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Redirect to HTTPS + www in production
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      const { protocol, hostname } = window.location;
      if (protocol !== "https:" || !hostname.startsWith("www.")) {
      const newUrl = `https://www.cuttypaws.com${location.pathname}${location.search}${location.hash}`;        window.location.replace(newUrl);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.search]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsResponse = await PostService.getAllPosts();
        setPosts(postsResponse.postList || []);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreatePost = () => {
    if (!currentUser) return navigate("/login");
    navigate("/create-post");
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await PostService.deletePost(postId);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (error) {
        setError("Failed to delete post");
      }
    }
  };

  const handleEditPost = (postId) => navigate(`/edit-post/${postId}`);

  return (
    <div className={styles.homeContainer}>
      <Helmet>
        <title>CuttyPaws - Social Pet Community</title>

        <meta
          name="description"
          content="CuttyPaws (also written as Cutty Paws) is a social pet community where pet lovers connect, share pet moments, and shop pet products online."
        />

        <meta name="keywords" content="CuttyPaws, Cutty Paws, cuttypaws, pet social network, pet community, pet shop" />
      </Helmet>

      <Container className={`${styles.homeContent} pt-4 pb-5`}>
        <Row className="justify-content-center">
          <Col lg={7} md={9} sm={12}>

            {/* Loading */}
            {loading && (
              <div className="text-center py-5">
                <Spinner variant="primary" animation="border" className={styles.homeSpinner} />
                <p className="mt-2 text-muted">Getting your feed ready...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="danger" className={`text-center ${styles.homeAlert}`}>
                {error}
              </Alert>
            )}

            {/* Posts Feed */}
            {!loading && !error && (
              <>
                {posts.length === 0 ? (
                  <Card className={`text-center py-5 shadow-sm ${styles.homeEmptyCard}`}>
                    <Card.Body>
                      <FaImages className={`text-muted mb-3 ${styles.homeEmptyIcon}`} />
                      <h5>No posts yet</h5>
                      <p className="text-muted">Start the community by creating the first post!</p>

                      <Button 
                        variant="primary" 
                        onClick={handleCreatePost}
                        className={styles.homeCreatePostBtn}
                      >
                        {currentUser ? "Create First Post" : "Login to Create Post"}
                      </Button>
                    </Card.Body>
                  </Card>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className={`mb-4 ${styles.homePostItem}`}>
                      <PostCard
                        post={post}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        isOwner={currentUser && post.ownerId === currentUser.id}
                        currentUser={currentUser}
                      />
                    </div>
                  ))
                )}
              </>
            )}
          </Col>
        </Row>

        {/* Floating Create Post Button */}
        {currentUser && (
          <Button
            onClick={handleCreatePost}
            className={styles.homeFloatingBtn}
          >
            <FaPlus />
          </Button>
        )}
      </Container>
    </div>
  );
};

export default Home;


