import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import { FaImages, FaRobot } from "react-icons/fa";

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
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [hasMore, setHasMore] = useState(false);
  const [nextCursorCreatedAt, setNextCursorCreatedAt] = useState(null);
  const [nextCursorId, setNextCursorId] = useState(null);

  const activeRequestRef = useRef(0);
  const loadMoreRef = useRef(null);

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

  const mergeUniqueItems = useCallback((oldItems, newItems) => {
    const seenPosts = new Set();

    return [...oldItems, ...newItems].filter((item) => {
      // Only dedupe posts
      if (item?.type !== "POST") {
        return true;
      }

      const postId = item?.post?.id;
      if (!postId) return false;

      if (seenPosts.has(postId)) {
        return false;
      }

      seenPosts.add(postId);
      return true;
    });
  }, []);

  const loadPostsOnlyItems = useCallback(async (reason) => {
    console.warn("[Home] Falling back to posts-only feed", { reason });

    const postsResponse = await PostService.getAllPosts({ limit: 20 });
    const fallbackItems = (postsResponse?.postList || []).map((post, index) => ({
      type: "POST",
      post,
      _debugSource: "post-fallback",
      _debugIndex: index,
    }));

    return fallbackItems;
  }, []);

  const loadFeed = useCallback(
    async ({
      showInitialLoader = false,
      append = false,
      cursorCreatedAt = null,
      cursorId = null,
    } = {}) => {
      const requestId = Date.now();
      activeRequestRef.current = requestId;

      try {
        if (showInitialLoader) {
          setLoading(true);
        } else if (append) {
          setLoadingMore(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await FeedService.getMixedFeed({
          cursorCreatedAt,
          cursorId,
          limit: 12,
          timeoutMs: 5000,
        });

        const normalizedItems = Array.isArray(response?.items) ? response.items : [];

        if (!normalizedItems.length && !append) {
          throw new Error("mixed-feed-empty");
        }

        if (activeRequestRef.current !== requestId) return;

        setFeedItems((prev) =>
          append ? mergeUniqueItems(prev, normalizedItems) : normalizedItems
        );

        setHasMore(Boolean(response?.hasMore));
        setNextCursorCreatedAt(response?.nextCursorCreatedAt || null);
        setNextCursorId(response?.nextCursorId || null);
      } catch (err) {
        console.error("[Home] Failed to load mixed feed", err);

        if (append) {
          return;
        }

        try {
          const fallbackItems = await loadPostsOnlyItems(
            `mixed-feed-error:${err?.message || "unknown"}`
          );

          if (activeRequestRef.current !== requestId) return;

          setError("");
          setFeedItems(fallbackItems);
          setHasMore(false);
          setNextCursorCreatedAt(null);
          setNextCursorId(null);
        } catch (fallbackError) {
          if (activeRequestRef.current !== requestId) return;

          setError("Unable to load your feed right now.");
          setFeedItems([]);
          setHasMore(false);
          setNextCursorCreatedAt(null);
          setNextCursorId(null);
        }
      } finally {
        if (activeRequestRef.current === requestId) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [loadPostsOnlyItems, mergeUniqueItems]
  );

  useEffect(() => {
    loadFeed({ showInitialLoader: true });
  }, [loadFeed]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursorCreatedAt || !nextCursorId) return;

    await loadFeed({
      append: true,
      cursorCreatedAt: nextCursorCreatedAt,
      cursorId: nextCursorId,
    });
  }, [hasMore, loadingMore, nextCursorCreatedAt, nextCursorId, loadFeed]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !loadingMore && !loading) {
          await handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, loadingMore, loading]);

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

  const getFeedRenderKey = (item, index) => {
    if (item?.type === "POST") {
      return `post-${item?.post?.id ?? index}`;
    }

    if (item?.type === "SERVICE_AD") {
      return `service-${item?.serviceAd?.id ?? item?.serviceAd?.userId ?? "x"}-${index}`;
    }

    if (item?.type === "PRODUCT_RECOMMENDATION") {
      return `product-${item?.product?.id ?? "x"}-${index}`;
    }

    return `feed-item-${index}`;
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
            key={getFeedRenderKey(item, index)}
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
            key={getFeedRenderKey(item, index)}
            className={styles.homePostItem}
          >
            <ServiceAdCard serviceAd={item.serviceAd} />
          </div>
        );

      case "PRODUCT_RECOMMENDATION":
        if (!item.product) {
          console.warn("[Home] PRODUCT_RECOMMENDATION item missing payload", {
            index,
            item,
          });
          return null;
        }

        return (
          <div
            key={getFeedRenderKey(item, index)}
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
              <div className={`text-center py-4 ${styles.homeLoadingMessage}`}>
                <p className="mt-2 text-muted mb-0">Getting your feed ready...</p>
              </div>
            )}

            {!loading && error && (
              <Alert variant="danger" className={`text-center ${styles.homeAlert}`}>
                <div className="mb-2">{error}</div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => loadFeed({ showInitialLoader: false })}
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

                <div ref={loadMoreRef} style={{ height: "20px" }} />

                {loadingMore && (
                  <div className="text-center my-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2 text-muted">Loading more feed items...</span>
                  </div>
                )}

                {!loadingMore && hasMore && (
                  <div className="text-center mt-3">
                    <Button
                      variant="outline-primary"
                      onClick={handleLoadMore}
                    >
                      Load More
                    </Button>
                  </div>
                )}

                {!hasMore && (
                  <div className="text-center text-muted mt-3">
                    No more feed items
                  </div>
                )}
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
        </div>
      )}
    </div>
  );
};

export default Home;