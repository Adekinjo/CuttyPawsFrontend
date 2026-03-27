import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { FaImages, FaPlus, FaRobot } from "react-icons/fa";

import FeedService from "../../service/FeedService";
import PostService from "../../service/PostService";
import PostCard from "../post/PostCard";
import ServiceAdCard from "../service-provider/ServiceAdsCard";
import ProductRecommendationCard from "../post/ProductRecommendationCard";

import styles from "../../style/Home.module.css";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [feedItems, setFeedItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      setCurrentUser(null);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
      setCurrentUser(null);
    }
  }, []);

  const fallbackToPostsOnly = useCallback(async (reason) => {
    console.warn("[Home] Falling back to posts-only feed", { reason });

    const postsResponse = await PostService.getAllPosts({ limit: 20 });
    const fallbackItems = (postsResponse?.postList || []).map((post, index) => ({
      type: "POST",
      post,
      _debugSource: "post-fallback",
      _debugIndex: index,
    }));

    console.debug("[Home] posts-only fallback result", {
      reason,
      count: fallbackItems.length,
      postsResponse,
    });

    setFeedItems(fallbackItems);
  }, []);

  const fetchFeed = useCallback(async (showInitialLoader = false) => {
    try {
      if (showInitialLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await FeedService.getMixedFeed(20);
      const normalizedItems = Array.isArray(response?.items) ? response.items : [];

      console.debug("[Home] mixed feed processed", {
        showInitialLoader,
        itemCount: normalizedItems.length,
        response,
      });

      if (!normalizedItems.length) {
        await fallbackToPostsOnly("mixed-feed-empty-or-unrecognized");
        return;
      }

      setFeedItems(normalizedItems);
    } catch (err) {
      console.error("[Home] Failed to load mixed feed", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        err,
      });

      try {
        await fallbackToPostsOnly(`mixed-feed-error:${err?.message || "unknown"}`);
      } catch (fallbackError) {
        console.error("[Home] Posts-only fallback failed", {
          message: fallbackError?.message,
          status: fallbackError?.status || fallbackError?.response?.status,
          data: fallbackError?.data || fallbackError?.response?.data,
          fallbackError,
        });
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your feed right now."
        );
        setFeedItems([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fallbackToPostsOnly]);

  useEffect(() => {
    fetchFeed(true);
  }, [fetchFeed]);

  const handleCreatePost = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/create-post");
  };

  const handleOpenAiHelp = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    navigate("/support/kinjo-support");
  };

  const handleDeletePost = (postId) => {
    setFeedItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.type === "POST" && item.post?.id === postId)
      )
    );
  };

  const handleEditPost = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  const renderFeedItem = (item, index) => {
    if (!item?.type) {
      console.warn("[Home] Feed item missing type:", item);
      return null;
    }

    switch (item.type) {
      case "POST":
        if (!item.post) {
          console.warn("[Home] POST item missing post payload", { index, item });
          return null;
        }

        return (
          <div
            key={`post-${item.post.id ?? index}`}
            className={styles.homePostItem}
          >
            <PostCard
              post={item.post}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              isOwner={Boolean(currentUser && item.post?.ownerId === currentUser?.id)}
              currentUser={currentUser}
            />
          </div>
        );

      case "SERVICE_AD":
        if (!item.serviceAd) {
          console.warn("[Home] SERVICE_AD item missing payload", { index, item });
          return null;
        }

        return (
          <div
            key={`service-${item.serviceAd.id ?? item.serviceAd.userId ?? index}`}
            className={styles.homePostItem}
          >
            <ServiceAdCard serviceAd={item.serviceAd} />
          </div>
        );

      case "PRODUCT_RECOMMENDATION":
        if (!item.product) {
          console.warn("[Home] PRODUCT_RECOMMENDATION item missing payload", { index, item });
          return null;
        }

        return (
          <div
            key={`product-${item.product.id ?? index}`}
            className={styles.homePostItem}
          >
            <ProductRecommendationCard product={item.product} />
          </div>
        );

      default:
        console.warn("[Home] Unknown feed item type:", item.type, item);
        return null;
    }
  };

  return (
    <div className={styles.homeContainer}>
      <Container className={`${styles.homeContent} mt-10 pt-0 pt-lg-4 pb-5`}>
        <Row className="justify-content-center">
          <Col lg={7} md={9} sm={12}>
            {loading && (
              <div className="text-center py-5">
                <Spinner
                  variant="primary"
                  animation="border"
                  className={styles.homeSpinner}
                />
                <p className="mt-2 text-muted mb-0">Getting your feed ready...</p>
              </div>
            )}

            {!loading && error && (
              <Alert variant="danger" className={`text-center ${styles.homeAlert}`}>
                <div className="mb-2">{error}</div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => fetchFeed(false)}
                  disabled={refreshing}
                >
                  {refreshing ? "Retrying..." : "Try Again"}
                </Button>
              </Alert>
            )}

            {!loading && !error && feedItems.length === 0 && (
              <Card className={`text-center py-5 shadow-sm ${styles.homeEmptyCard}`}>
                <Card.Body>
                  <FaImages className={`text-muted mb-3 ${styles.homeEmptyIcon}`} />
                  <h5>No feed items yet</h5>
                  <p className="text-muted">
                    Start the community by creating the first post.
                  </p>

                  <Button
                    variant="primary"
                    onClick={handleCreatePost}
                    className={styles.homeCreatePostBtn}
                  >
                    {currentUser ? "Create First Post" : "Login to Create Post"}
                  </Button>
                </Card.Body>
              </Card>
            )}

            {!loading && !error && feedItems.length > 0 && (
              <>
                {refreshing && (
                  <div className="text-center mb-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted">Refreshing feed...</span>
                  </div>
                )}

                {feedItems.map((item, index) => renderFeedItem(item, index))}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {currentUser && (
        <div className={styles.homeFloatingActions}>
          <Button
            onClick={handleOpenAiHelp}
            className={styles.homeFloatingAiBtn}
            aria-label="Open AI help"
          >
            <FaRobot />
          </Button>

          {/* <Button
            onClick={handleCreatePost}
            className={styles.homeFloatingBtn}
            aria-label="Create post"
          >
            <FaPlus />
          </Button> */}
        </div>
      )}
    </div>
  );
};

export default Home;