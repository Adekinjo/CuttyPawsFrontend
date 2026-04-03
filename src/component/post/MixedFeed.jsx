import { useEffect, useState } from "react";
import FeedService from "../../service/FeedService";
import PostCard from "./PostCard";
import ServiceAdCard from "../service-provider/ServiceAdsCard";
import ProductRecommendationCard from "./ProductRecommendationCard";

const MixedFeed = ({ currentUser }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursorCreatedAt, setNextCursorCreatedAt] = useState(null);
  const [nextCursorId, setNextCursorId] = useState(null);

  const mergeUniqueItems = (oldItems, newItems) => {
    const seen = new Set();

    const combined = [...oldItems, ...newItems].filter((item) => {
      const key =
        item?.type === "POST"
          ? `POST-${item?.post?.id}`
          : item?.type === "SERVICE_AD"
          ? `SERVICE_AD-${item?.serviceAd?.id}`
          : item?.type === "PRODUCT_RECOMMENDATION"
          ? `PRODUCT-${item?.product?.id}`
          : null;

      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return combined;
  };

  const loadFeed = async ({ cursorCreatedAt = null, cursorId = null, append = false } = {}) => {
    try {
      const response = await FeedService.getMixedFeed({
        cursorCreatedAt,
        cursorId,
        limit: 12,
      });

      const items = Array.isArray(response?.items) ? response.items : [];

      setFeedItems((prev) => (append ? mergeUniqueItems(prev, items) : items));
      setHasMore(Boolean(response?.hasMore));
      setNextCursorCreatedAt(response?.nextCursorCreatedAt || null);
      setNextCursorId(response?.nextCursorId || null);
    } catch (error) {
      console.error("[MixedFeed] Failed to load mixed feed", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadFeed();
      setLoading(false);
    };

    init();
  }, []);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    await loadFeed({
      cursorCreatedAt: nextCursorCreatedAt,
      cursorId: nextCursorId,
      append: true,
    });
    setLoadingMore(false);
  };

  if (loading) return <p>Loading feed...</p>;

  return (
    <div>
      {feedItems.map((item, index) => {
        switch (item.type) {
          case "POST":
            return (
              <PostCard
                key={`post-${item.post?.id || index}`}
                post={item.post}
                currentUser={currentUser}
              />
            );

          case "SERVICE_AD":
            return (
              <ServiceAdCard
                key={`service-${item.serviceAd?.id || index}`}
                serviceAd={item.serviceAd}
              />
            );

          case "PRODUCT_RECOMMENDATION":
            return (
              <ProductRecommendationCard
                key={`product-${item.product?.id || index}`}
                product={item.product}
              />
            );

          default:
            return null;
        }
      })}

      {hasMore ? (
        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default MixedFeed;